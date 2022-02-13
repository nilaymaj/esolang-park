import { DocumentRange } from "../../types";
import { Line } from "../parser/grammar-types";

/** Type of props passed to renderer */
export type RS = {
  value: number;
};

/** A single step of the Rockstar AST */
export type ASTStep = {
  op: Line;
  range: DocumentRange;
};
