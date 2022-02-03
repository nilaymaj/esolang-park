import { MonacoTokensProvider } from "../types";

export type Bfg93RS = {
  stack: number[];
  direction: Bfg93Direction;
  strMode: boolean;
};

/** Direction of program counter */
export enum Bfg93Direction {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

/** Allowed operations in Befunge */
export enum Bfg93Op {
  NOOP = " ",
  ADD = "+",
  SUBTRACT = "-",
  MULTIPLY = "*",
  DIVIDE = "/",
  MODULO = "%",
  NOT = "!",
  GREATER = "`",
  RIGHT = ">",
  LEFT = "<",
  UP = "^",
  DOWN = "v",
  RANDOM = "?",
  H_IF = "_",
  V_IF = "|",
  TOGGLE_STR = '"',
  DUPLICATE = ":",
  SWAP = "\\",
  POP_DELETE = "$",
  POP_OUTINT = ".",
  POP_OUTCHAR = ",",
  BRIDGE = "#",
  GET_DATA = "g",
  PUT_DATA = "p",
  STDIN_INT = "&",
  STDIN_CHAR = "~",
  END = "@",
  PUSH_0 = "0",
  PUSH_1 = "1",
  PUSH_2 = "2",
  PUSH_3 = "3",
  PUSH_4 = "4",
  PUSH_5 = "5",
  PUSH_6 = "6",
  PUSH_7 = "7",
  PUSH_8 = "8",
  PUSH_9 = "9",
}

/** Sample program printing "Hello world" */
export const sampleProgram = [
  `"!dlroW ,olleH">:v`,
  `               |,<`,
  `               @`,
].join("\n");

/** Tokens provider */
export const editorTokensProvider: MonacoTokensProvider = {
  tokenizer: {
    root: [
      [/[\>\^<v\?]/, "variable"],
      [/[\+\-\*\/%!`]/, "operators"],
      [/[|_]/, "meta"],
      [/[":\\#]/, "tag"],
      [/[\$\.,]/, "keyword"],
      [/[gp@]/, "attribute"],
      [/[&~0-9]/, "string"],
    ],
  },
  defaultToken: "plain",
};
