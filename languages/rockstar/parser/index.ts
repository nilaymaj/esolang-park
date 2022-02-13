import { ParseError } from "../../worker-errors";
import * as parser from "./parser.out.js";
import * as D from "./grammar-types";
import { ASTStep } from "../common/types";
import { buildAST } from "./ast-builder";

/** Run the program source code through the Peg parser */
export const pegParseProgram = (program: string): D.Program => {
  try {
    return parser.parse(program);
  } catch (err) {
    if (err instanceof parser.SyntaxError) {
      const error = err as any;
      const message = error.message;
      const line = error.location.start.line - 1;
      const charRange = {
        start: error.location.start.offset,
        end: error.location.end.offset,
      };
      throw new ParseError(message, { line, charRange });
    } else throw err;
  }
};

export const parseProgram = (program: string): ASTStep[] => {
  const lines = pegParseProgram(program);
  const ast = buildAST(lines);
  return ast;
};
