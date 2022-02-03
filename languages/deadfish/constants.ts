import { MonacoTokensProvider } from "../types";

export type DFRS = {
  value: number;
};

export enum DF_OP {
  INCR = "i",
  DECR = "d",
  SQ = "s",
  OUT = "o",
}

/** A single element of the program's AST */
export type DFAstStep = {
  instr: DF_OP;
  location: { line: number; char: number };
};

/** Sample program printing "Hello world" */
export const sampleProgram = [
  "iisiiiisiiiiiiiio",
  "iiiiiiiiiiiiiiiiiiiiiiiiiiiiio",
  "iiiiiiioo",
  "iiio",
  "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddo",
  "dddddddddddddddddddddsddo",
  "ddddddddo",
  "iiio",
  "ddddddo",
  "ddddddddo",
].join("\n");

/** Tokens provider */
export const editorTokensProvider: MonacoTokensProvider = {
  tokenizer: {
    root: [
      [/i/, "identifier"],
      [/d/, "variable"],
      [/s/, "meta"],
      [/o/, "tag"],
    ],
  },
  defaultToken: "comment",
};
