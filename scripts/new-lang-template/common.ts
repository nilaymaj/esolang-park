// @ts-nocheck
import { MonacoTokensProvider } from "../types";

/** Type of props passed to renderer */
export type RS = {
  value: number;
};

/** Sample program */
export const sampleProgram = [
  "Program line 1",
  "Program line 2",
  "Program line 3",
].join("\n");

/** Syntax highlighting */
export const editorTokensProvider: MonacoTokensProvider = {
  tokenizer: {
    root: [
      [/i/, "variable"],
      [/d/, "keyword"],
      [/s/, "constant"],
      [/o/, "operator"],
    ],
  },
  defaultToken: "comment",
};
