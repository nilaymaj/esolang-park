import { MonacoTokensProvider } from "../types";

export type BFRS = {
  tape: { [k: number]: number };
  pointer: number;
};

export enum BF_OP {
  LEFT = "<",
  RIGHT = ">",
  INCR = "+",
  DECR = "-",
  OUT = ".",
  IN = ",",
  LOOPIN = "[",
  LOOPOUT = "]",
}

/** A single instruction of the program */
export type BFInstruction = {
  /** Type of instruction */
  type: BF_OP;
  /** Used for location of opposite end of loops */
  param?: number;
};

/** A single element of the program's AST */
export type BFAstStep = {
  instr: BFInstruction;
  location: { line: number; char: number };
};

/** Sample program printing "Hello World!" */
export const sampleProgram = [
  "+++++ +++               Set Cell #0 to 8",
  "[",
  "    >++++               Add 4 to Cell #1; this will always set Cell #1 to 4",
  "    [                   as the cell will be cleared by the loop",
  "        >++             Add 4*2 to Cell #2",
  "        >+++            Add 4*3 to Cell #3",
  "        >+++            Add 4*3 to Cell #4",
  "        >+              Add 4 to Cell #5",
  "        <<<<-           Decrement the loop counter in Cell #1",
  "    ]                   Loop till Cell #1 is zero",
  "    >+                  Add 1 to Cell #2",
  "    >+                  Add 1 to Cell #3",
  "    >-                  Subtract 1 from Cell #4",
  "    >>+                 Add 1 to Cell #6",
  "    [<]                 Move back to the first zero cell you find; this will",
  "                        be Cell #1 which was cleared by the previous loop",
  "    <-                  Decrement the loop Counter in Cell #0",
  "]                       Loop till Cell #0 is zero",
  "",
  "The result of this is:",
  "Cell No :   0   1   2   3   4   5   6",
  "Contents:   0   0  72 104  88  32   8",
  "Pointer :   ^",
  "",
  ">>.                     Cell #2 has value 72 which is 'H'",
  ">---.                   Subtract 3 from Cell #3 to get 101 which is 'e'",
  "+++++ ++..+++.          Likewise for 'llo' from Cell #3",
  ">>.                     Cell #5 is 32 for the space",
  "<-.                     Subtract 1 from Cell #4 for 87 to give a 'W'",
  "<.                      Cell #3 was set to 'o' from the end of 'Hello'",
  "+++.----- -.----- ---.  Cell #3 for 'rl' and 'd'",
  ">>+.                    Add 1 to Cell #5 gives us an exclamation point",
  ">++.                    And finally a newline from Cell #6",
].join("\n");

/** Tokens provider */
export const editorTokensProvider: MonacoTokensProvider = {
  tokenizer: {
    root: [
      [/[-\+]/, ""],
      [/[<>]/, "tag"],
      [/[\[\]]/, "keyword"],
      [/[\,\.]/, "identifier"],
    ],
  },
  defaultToken: "comment",
};

/** Serialize tape from object format into linear array */
export const serializeTapeMap = (tape: BFRS["tape"]): number[] => {
  const cellIdxs = Object.keys(tape).map((s) => parseInt(s, 10));
  const maxCellIdx = Math.max(15, ...cellIdxs);
  const linearTape: number[] = Array(maxCellIdx + 1).fill(0);
  cellIdxs.forEach((i) => (linearTape[i] = tape[i] || 0));
  return linearTape;
};
