import * as T from "../types";
import { DocumentRange } from "../../types";
import { parseIngredientItem, parseMethodStep } from "./core";
import { ParseError } from "../../worker-errors";
import { isSyntaxError, SyntaxError } from "../constants";

/**
 * We parse a Chef program by creating an array containing the lines of code (with line nos)
 * in reverse order. This array represents a stack with the first line at the top.
 *
 * Each parse step then pops and parses statements from the stack. For instance,
 * the parseTitle function pops one statement from the stack and parses it for the title.
 * The rest of the stack is then parsed by firther steps.
 */

/** Reversed array of lines of code, used as a stack */
type CodeStack = { line: string; row: number }[];

/** Text and location of a single method instruction */
type MethodSegment = { str: string; location: DocumentRange };

/** Parse a Chef program */
export const parseProgram = (code: string): T.ChefProgram => {
  // Convert code to a reverse stack
  const stack: CodeStack = code
    .split("\n")
    .map((l, idx) => ({ line: l, row: idx }))
    .reverse();

  // Location of code's last char, used for errors
  const lastCharPosition = stack[0]?.line.length - 1 || 0;
  const lastCharRange: DocumentRange = {
    line: stack.length - 1,
    charRange: { start: lastCharPosition, end: lastCharPosition + 1 },
  };

  // Exhaust any empty lines at the start of the program
  exhaustEmptyLines(stack);

  // Parse the main recipe
  const mainRecipe = parseRecipe(stack, lastCharRange);
  exhaustEmptyLines(stack);

  // Parse any auxiliary recipes
  const auxRecipes: { [k: string]: T.ChefRecipe } = {};
  while (stack.length && stack[stack.length - 1].line.trim() !== "") {
    const recipe = parseRecipe(stack, lastCharRange);
    auxRecipes[recipe.name] = recipe;
    exhaustEmptyLines(stack);
  }

  const program = { main: mainRecipe, auxes: auxRecipes };
  validateProgram(program);
  return program;
};

/** Pop all empty lines from top of the stack */
const exhaustEmptyLines = (stack: CodeStack): void => {
  while (stack.length && stack[stack.length - 1].line.trim() === "")
    stack.pop();
};

/**
 * Parse the stack for recipe title
 * @param stack Code stack to parse next line of
 * @param lastCharRange Error range used if stack is found to be empty
 */
const parseTitle = (stack: CodeStack, lastCharRange: DocumentRange): string => {
  const { line, row } = popCodeStack(stack, true);
  if (line === null)
    throw new ParseError("Expected recipe title", lastCharRange);
  if (!line) throw new ParseError("Expected recipe title", { line: row });
  if (!line.endsWith("."))
    throw new ParseError("Recipe title must end with period", { line: row });
  return line.slice(0, -1);
};

/**
 * Parse the stack for an empty line
 * @param stack Code stack to parse next line of
 * @param lastCharRange Error range used if stack is found to be empty
 */
const parseEmptyLine = (
  stack: CodeStack,
  lastCharRange: DocumentRange
): void => {
  const { line, row } = popCodeStack(stack, true);
  if (line === null) throw new ParseError("Expected blank line", lastCharRange);
  if (line) throw new ParseError("Expected blank line", { line: row });
};

/** Parse the stack for method instructions section */
const parseRecipeComments = (stack: CodeStack): void => {
  while (stack[stack.length - 1].line.trim() !== "") stack.pop();
};

/** Parse the stack for the header of ingredients section */
const parseIngredientsHeader = (stack: CodeStack): void => {
  const { line, row } = popCodeStack(stack, true);
  if (line !== "Ingredients.")
    throw new ParseError("Expected ingredients header", { line: row });
};

/** Parse the stack for ingredient definition lines */
const parseIngredientsSection = (stack: CodeStack): T.IngredientBox => {
  const box: T.IngredientBox = {};
  while (stack[stack.length - 1].line.trim() !== "") {
    const { line, row } = popCodeStack(stack);
    const { name, item } = parseIngredientItem(line!);
    box[name] = item;
  }
  return box;
};

/** Parse stack for cooking time statement. No data is returned. */
const parseCookingTime = (stack: CodeStack): void => {
  const regex = /^Cooking time: \d+ (?:hours?|minutes?).$/;
  const { line, row } = popCodeStack(stack, true);
  if (!line!.match(regex))
    throw new ParseError("Malformed cooking time statement", { line: row });
};

/** Parse stack for oven setting statement. No data is returned. */
const parseOvenSetting = (stack: CodeStack): void => {
  const regex =
    /^Pre-heat oven to \d+ degrees Celsius(?: \(gas mark [\d/]+\))?.$/;
  const { line, row } = popCodeStack(stack, true);
  if (!line!.match(regex))
    throw new ParseError("Malformed oven setting", { line: row });
};

/** Parse the stack for the header of method section */
const parseMethodHeader = (stack: CodeStack): void => {
  const { line, row } = popCodeStack(stack, true);
  if (line !== "Method.")
    throw new ParseError('Expected "Method."', { line: row });
};

/** Parse the stack for method instructions section */
const parseMethodSection = (stack: CodeStack): T.ChefOpWithLocation[] => {
  const loopStack: { opener: number; verb: string }[] = [];
  const pendingBreaks: number[] = [];
  const segments = serializeMethodOps(stack);
  const ops: T.ChefOpWithLocation[] = [];

  segments.forEach((segment, index) => {
    try {
      processMethodSegment(segment, index, ops, loopStack, pendingBreaks);
    } catch (error) {
      if (isSyntaxError(error))
        throw new ParseError(error.message, segment.location);
      else throw error;
    }
  });

  return ops;
};

/**
 * Process a single method segment
 * @param segment Method segment to process
 * @param index Index of segment in the method section
 * @param ops List of already processed method segments
 * @param loopStack Stack of currently active loops
 * @param pendingBreaks Loop-breaks in the currently active loop
 */
const processMethodSegment = (
  segment: MethodSegment,
  index: number,
  ops: T.ChefOpWithLocation[],
  loopStack: { opener: number; verb: string }[],
  pendingBreaks: number[]
) => {
  // Parse operation and push to result
  const op = parseMethodStep(segment.str);
  ops.push({ op, location: segment.location });

  switch (op.code) {
    case "LOOP-OPEN": {
      loopStack.push({ opener: index, verb: op.verb });
      // `closer` will be added while handling loop-closer
      break;
    }

    case "LOOP-BREAK": {
      pendingBreaks.push(index);
      // `closer` will be added while handling loop-closer
      break;
    }

    case "LOOP-CLOSE": {
      // Validate match with innermost loop
      const loop = loopStack.pop()!;
      if (loop.verb !== op.verb)
        throw new SyntaxError(
          `Loop verb mismatch: expected '${loop.verb}', found '${op.verb}'`
        );

      op.opener = loop.opener;

      // Add jump address to loop opener
      const openerOp = ops[loop.opener].op;
      if (openerOp.code !== "LOOP-OPEN") throw new Error("Bad jump address");
      openerOp.closer = index;

      // Add jump address to intermediate loop-breaks
      while (pendingBreaks.length) {
        const breaker = ops[pendingBreaks.pop()!].op;
        if (breaker.code !== "LOOP-BREAK")
          throw new Error("Memorized op not a breaker");
        breaker.closer = index;
      }

      break;
    }
  }
};

/** Parse a method section and serialize to list of instructions and corresponding document ranges */
const serializeMethodOps = (stack: CodeStack): MethodSegment[] => {
  const segments: MethodSegment[] = [];

  while (stack.length && stack[stack.length - 1].line.trim() !== "") {
    const item = stack.pop()!;

    // Find all the periods in the line
    const periodIdxs: number[] = [-1];
    for (let i = 0; i < item.line.length; ++i) {
      if (item.line[i] === ".") periodIdxs.push(i);
    }

    // Parse each period-separated segment
    for (let i = 0; i < periodIdxs.length - 1; ++i) {
      const start = periodIdxs[i] + 1;
      const end = periodIdxs[i + 1];
      const range = { line: item.row, charRange: { start, end } };
      segments.push({
        str: item.line.slice(start, end).trim(),
        location: range,
      });
    }
  }

  return segments;
};

/** Parse the stack for a "Serves N" statement */
const parseServesLine = (stack: CodeStack): T.ChefRecipeServes => {
  const { line, row } = popCodeStack(stack, true);
  const match = line!.match(/^Serves (\d+).$/);
  if (!match) throw new ParseError("Malformed serves statement", { line: row });
  return { line: row, num: parseInt(match[1], 10) };
};

/** Parse the stack for a single Chef recipe */
const parseRecipe = (
  stack: CodeStack,
  lastCharRange: DocumentRange
): T.ChefRecipe => {
  // Title of the recipe
  const title = parseTitle(stack, lastCharRange);
  parseEmptyLine(stack, lastCharRange);

  // Check if exists and parse recipe comments
  if (stack[stack.length - 1].line.trim() !== "Ingredients.") {
    parseRecipeComments(stack);
    parseEmptyLine(stack, lastCharRange);
  }

  // Parse ingredients
  parseIngredientsHeader(stack);
  const ingredientBox = parseIngredientsSection(stack);
  parseEmptyLine(stack, lastCharRange);

  // Check if exists and parse cooking time
  if (stack[stack.length - 1].line.trim().startsWith("Cooking time: ")) {
    parseCookingTime(stack);
    parseEmptyLine(stack, lastCharRange);
  }

  // Check if exists and parse oven temperature
  if (stack[stack.length - 1].line.trim().startsWith("Pre-heat oven ")) {
    parseOvenSetting(stack);
    parseEmptyLine(stack, lastCharRange);
  }

  // Parse method
  parseMethodHeader(stack);
  const method = parseMethodSection(stack);
  exhaustEmptyLines(stack);

  // Check if exists and parse recipe
  const serves = stack[stack.length - 1]?.line.trim().startsWith("Serves ")
    ? parseServesLine(stack)
    : undefined;

  return { name: title, ingredients: ingredientBox, method, serves };
};

/**
 * Validate the provided recipe.
 * - Check that ingredient names used in method are valid.
 * - Check that auxiliary recipe names used ar valid.
 * @param recipe Recipe to validate
 * @param auxes Map of auxiliary recipes, keyed by name
 */
const validateRecipe = (
  recipe: T.ChefRecipe,
  auxes: T.ChefProgram["auxes"]
): void => {
  for (const line of recipe.method) {
    const ingName = (line.op as any).ing;
    if (ingName && !recipe.ingredients[ingName])
      throw new ParseError(`Invalid ingredient: ${ingName}`, line.location);
    if (line.op.code === "FNCALL" && !auxes[line.op.recipe])
      throw new ParseError(
        `Invalid recipe name: ${line.op.recipe}`,
        line.location
      );
  }
};

/**
 * Validate all recipes in the given parsed Chef program
 * @param program Chef program to validate
 */
const validateProgram = (program: T.ChefProgram): void => {
  validateRecipe(program.main, program.auxes);
  for (const auxName in program.auxes)
    validateRecipe(program.auxes[auxName], program.auxes);
};

/**
 * Utility to pop a line off the code stack.
 * @param stack Code stack to pop line off
 * @param trim Pass true if result should contain trimmed line
 * @returns Object containing `line` and `row` of popped line
 */
const popCodeStack = (
  stack: CodeStack,
  trim?: boolean
): { line: string | null; row: number } => {
  const item = stack.pop();
  if (!item) return { line: null, row: -1 };
  const line = trim ? item.line.trim() : item.line;
  return { line, row: item.row };
};
