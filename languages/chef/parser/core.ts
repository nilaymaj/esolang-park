import {
  ArithmeticCodes,
  DryMeasures,
  JumpAddressPlaceholder,
  LiquidMeasures,
  MeasureTypes,
  UnknownMeasures,
} from "./constants";
import { SyntaxError } from "../constants";
import * as R from "./regex";
import * as C from "../types";

/**
 * Converts a verb to the past tense version of it
 *
 * @param verb Present form of verb
 * @returns Past form of verb
 */
export const toPastTense = (verb: string) => {
  return verb.endsWith('e') ? verb + "d" : verb + "ed"
};

/** Parse a string as an ingredient measure */
const parseMeasure = (measure: string): C.StackItemType | undefined => {
  if (DryMeasures.includes(measure)) return "dry";
  if (LiquidMeasures.includes(measure)) return "liquid";
  if (UnknownMeasures.includes(measure)) return "unknown";
};

/** Validate and parse string as integer. Empty string is treated as 1 */
const parseIndex = (str: string): number => {
  if (!str || str.trim().length === 0) return 1;
  const parsed = parseInt(str.trim(), 10);
  if (Number.isNaN(parsed)) throw new SyntaxError("Not a number");
  return parsed;
};

/** Parse a string as an ordinal identifier (1st, 2nd, etc) */
const parseOrdinal = (measure: string): number => {
  if (!measure || measure.trim().length === 0) return 1;
  const parsed = parseInt(measure.trim(), 10);
  if (Number.isNaN(parsed))
    throw new SyntaxError("Invalid dish/bowl identifier");
  return parsed;
};

/** Parse a line as an arithmetic operation in Chef */
const parseArithmeticOp = (line: string): C.ChefArithmeticOp => {
  const matches = assertMatch(line, R.ArithmeticOpRegex);

  const code = ArithmeticCodes[matches[1]];
  const bowlId = parseIndex(matches[4]);

  // If mixing bowl segment is entirely missing...
  if (!matches[3]) return { code, ing: matches[2], bowlId };

  // Case-wise checks for each operation
  if (
    (matches[1] === "Add" && matches[3] === "to") ||
    (matches[1] === "Remove" && matches[3] === "from") ||
    (matches[1] === "Combine" && matches[3] === "into") ||
    (matches[1] === "Divide" && matches[3] === "into")
  )
    return { code, ing: matches[2], bowlId };

  throw new SyntaxError("Instruction has incorrect syntax");
};

/** Assert that a line matches the given regex and return matches */
const assertMatch = (line: string, regex: RegExp): RegExpMatchArray => {
  const matches = line.match(regex);
  if (!matches) throw new SyntaxError("Unknown instruction");
  return matches;
};

/**
 * Parse a line as the definition of an ingredient in Chef
 * @param line Line to be parsed as ingredient definition
 * @returns Ingredient definition in parsed form
 */
export const parseIngredientItem = (
  line: string
): { name: C.IngredientName; item: C.IngredientItem } => {
  const words = line.trim().split(/\s+/).reverse();

  // Try to parse the first word as a number
  const parsedValue = parseInt(words[words.length - 1], 10);
  const quantity = Number.isNaN(parsedValue) ? undefined : parsedValue;
  if (quantity != null) words.pop();

  // Try to parse next word as measure type (heaped/level)
  const measureType = words[words.length - 1];
  const hasMeasureType = MeasureTypes.includes(measureType);
  if (hasMeasureType) words.pop();

  // Parse next word as measurement unit
  const measure = parseMeasure(words[words.length - 1]);
  if (hasMeasureType && !measure) throw new SyntaxError("Invalid measure");
  if (measure) words.pop();

  // Parse rest of word as name of ingredient
  const ingredientName = words.reverse().join(" ");

  // Return parsed ingredient item
  return {
    name: ingredientName,
    item: { type: measure || "unknown", value: quantity },
  };
};

/**
 * Parse a line as a single instruction of a Chef recipe.
 *
 * Note that loop-closer and loop-opener addresses are inserted as -1 as this function
 * does not have scope of the entire method and loop stack. These addresses must be modified
 * by the caller by tracking loop statements.
 *
 * @param line Line containing instruction, ending just before period.
 */
export const parseMethodStep = (line: string): C.ChefOperation => {
  if (line.startsWith("Take ")) {
    // Take `ingredient` from refrigerator
    const matches = assertMatch(line, R.TakeFromFridgeRegex);
    return { code: "STDIN", ing: matches[1] };
    //========================================================================
  } else if (line.startsWith("Put ")) {
    // Put `ingredient` into [nth] mixing bowl
    const matches = assertMatch(line, R.PutInBowlRegex);
    return { code: "PUSH", ing: matches[1], bowlId: parseOrdinal(matches[2]) };
    //========================================================================
  } else if (line.startsWith("Fold ")) {
    // Fold `ingredient` into [nth] mixing bowl
    const matches = assertMatch(line, R.FoldIntoBowlRegex);
    return { code: "POP", ing: matches[1], bowlId: parseOrdinal(matches[2]) };
    //========================================================================
  } else if (line.startsWith("Add dry ingredients")) {
    // Add dry ingredients [into [nth] mixing bowl]
    const matches = assertMatch(line, R.AddDryIngsOpRegex);
    return { code: "ADD-DRY", bowlId: parseIndex(matches[1]) };
    //========================================================================
  } else if (
    ["Add", "Remove", "Combine", "Divide"].includes(line.split(" ", 1)[0])
  ) {
    // Add | Remove | Combine | Divide ...
    return parseArithmeticOp(line);
    //========================================================================
  } else if (
    line.startsWith("Liquefy contents of the ") ||
    line.startsWith("Liquefy the contents of the ")
  ) {
    // Liquefy contents of the [nth] mixing bowl
    const matches = assertMatch(line, R.LiquefyBowlRegex);
    return { code: "LIQ-BOWL", bowlId: parseIndex(matches[1]) };
    //========================================================================
  } else if (line.startsWith("Liquefy ")) {
    // Liquefy `ingredient`
    const matches = assertMatch(line, R.LiquefyIngRegex);
    return { code: "LIQ-ING", ing: matches[1] };
    //========================================================================
  } else if (
    line.startsWith("Stir ") &&
    (line.endsWith("minute") || line.endsWith("minutes"))
  ) {
    // Stir [the [nth] mixing bowl] for `number` minutes
    const matches = assertMatch(line, R.StirBowlRegex);
    return {
      code: "ROLL-BOWL",
      bowlId: parseIndex(matches[1]),
      num: parseIndex(matches[2]),
    };
    //========================================================================
  } else if (line.startsWith("Stir ")) {
    // Stir ingredient into the [nth] mixing bowl
    const matches = assertMatch(line, R.StirIngredientRegex);
    return {
      code: "ROLL-ING",
      ing: matches[1],
      bowlId: parseIndex(matches[2]),
    };
    //========================================================================
  } else if (line.startsWith("Mix ")) {
    // Mix [the [nth] mixing bowl] well
    const matches = assertMatch(line, R.MixBowlRegex);
    return { code: "RANDOM", bowlId: parseIndex(matches[1]) };
    //========================================================================
  } else if (line.startsWith("Clean ")) {
    // Clean [nth] mixing bowl
    const matches = assertMatch(line, R.CleanBowlRegex);
    return { code: "CLEAR", bowlId: parseIndex(matches[1]) };
    //========================================================================
  } else if (line.startsWith("Pour ")) {
    // Pour contents of [nth] mixing bowl into [pth] baking dish
    const matches = assertMatch(line, R.PourBowlRegex);
    return {
      code: "COPY",
      bowlId: parseIndex(matches[1]),
      dishId: parseIndex(matches[2]),
    };
    //========================================================================
  } else if (line === "Set aside") {
    // Set aside
    return { code: "LOOP-BREAK", closer: JumpAddressPlaceholder };
    //========================================================================
  } else if (line.startsWith("Serve with ")) {
    // Serve with `auxiliary recipe`
    const matches = assertMatch(line, R.ServeWithRegex);
    return { code: "FNCALL", recipe: matches[1] };
    //========================================================================
  } else if (line.startsWith("Refrigerate")) {
    // Refrigerate [for `number` hours]
    const matches = assertMatch(line, R.RefrigerateRegex);
    const num = matches[1] ? parseIndex(matches[1]) : undefined;
    return { code: "END", num };
    //========================================================================
  } else if (line.includes(" until ")) {
    // `Verb` [the `ingredient`] until `verbed`
    const matches = assertMatch(line, R.LoopEnderRegex);
    const ingredient = matches[1] || undefined;
    const verb = toPastTense(matches[2]);
    return {
      code: "LOOP-CLOSE",
      ing: ingredient,
      verb,
      opener: JumpAddressPlaceholder,
    };
    //========================================================================
  } else {
    // `Verb` [the] `ingredient`
    const matches = assertMatch(line, R.LoopOpenerRegex);
    return {
      code: "LOOP-OPEN",
      verb: matches[1].toLowerCase(),
      ing: matches[2],
      closer: JumpAddressPlaceholder,
    };
  }
};
