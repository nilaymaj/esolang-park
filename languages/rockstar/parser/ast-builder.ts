import { ParseError } from "../../worker-errors";
import { ASTStep } from "../common/types";
import * as D from "./grammar-types";

/** Single item of the scope block stack */
type BlockStackItem =
  | { type: "if"; line: number }
  | { type: "loop"; line: number }
  | { type: "function"; line: number };

/** Stack to track the current scopes */
type BlockStack = BlockStackItem[];

/**
 * Check that the given line is valid to be the next line of
 * an inline if-statement. The next line of an inline if-statement
 * can only be an empty line or an else-clause.
 *
 * @param lineNum Line number of the line in code
 * @param line The line in parsed form
 */
const validateInlineIfNextLine = (lineNum: number, line: D.Line) => {
  if (line.type !== "blank" && line.type !== "else") {
    throw new ParseError(
      "Expected else clause or blank line after inline if-statement",
      { line: lineNum }
    );
  }
};

/**
 * Build the executable AST from the parsed program, by filling in
 * the jump addresses of control flow statements and validating blocks.
 *
 * @param program Program in parsed form
 * @returns AST of the program
 */
export const buildAST = (program: D.Program): ASTStep[] => {
  const lines = program.list;
  const stack: BlockStack = [];
  const ast: ASTStep[] = [];

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];

    // Function declaration or loop start: push block onto stack
    if (line.type === "function_decl" || line.type === "loop") {
      stack.push({ type: "function", line: i });
    }

    if (line.type === "if") {
      stack.push({ type: "if", line: i });
      // Check if the next line is valid to follow an inline if-statement
      if (line.statement && i + 1 < lines.length)
        validateInlineIfNextLine(i + 1, lines[i + 1]);
    }

    if (line.type === "else") {
      // Pop if-item from block stack
      const ifItem = stack.pop();
      if (!ifItem || ifItem.type !== "if")
        throw new ParseError("Unexpected else clause", { line: i });
      // Fill in the jump address for the corresponding if-statement
      const ifLine = ast[ifItem.line];
      if (!ifLine || ifLine.op.type !== "if") throw new Error("Bad stack item");
      ifLine.op.jump = i;
    }

    if (line.type === "blank") {
      // Pop block from stack
      const blockItem = stack.pop();
      if (blockItem) {
        // Fill in the jump address for the corresponding block
        const blockLine = ast[blockItem.line];
        if (!blockLine || blockLine.op.type !== blockItem.type)
          throw new Error("Bad stack item");
        // TODO: Check block type and act accordingly
      }
    }
  }

  return ast;
};
