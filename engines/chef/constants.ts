import { MonacoTokensProvider } from "../types";

/** Error thrown on malformed syntax. Caught and converted into ParseError higher up */
export class SyntaxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SyntaxError";
  }
}

/** Check if an error is instance of SyntaxError */
export const isSyntaxError = (error: any): error is SyntaxError => {
  return error instanceof SyntaxError || error.name === "SyntaxError";
};

/** Sample Hello World program for Chef */
export const sampleProgram = [
  "Hello World Souffle.",
  "",
  'This recipe prints the immortal words "Hello world!", in a basically brute force way. It also makes a lot of food for one person.',
  "",
  "Ingredients.",
  "72 g haricot beans",
  "101 eggs",
  "108 g lard",
  "111 cups oil",
  "32 zucchinis",
  "119 ml water",
  "114 g red salmon",
  "100 g dijon mustard",
  "33 potatoes",
  "",
  "Method.",
  "Put potatoes into the mixing bowl.",
  "Put dijon mustard into the mixing bowl.",
  "Put lard into the mixing bowl.",
  "Put red salmon into the mixing bowl.",
  "Put oil into the mixing bowl.",
  "Put water into the mixing bowl.",
  "Put zucchinis into the mixing bowl.",
  "Put oil into the mixing bowl.",
  "Put lard into the mixing bowl.",
  "Put lard into the mixing bowl.",
  "Put eggs into the mixing bowl.",
  "Put haricot beans into the mixing bowl.",
  "Liquefy contents of the mixing bowl.",
  "Pour contents of the mixing bowl into the baking dish.",
  "",
  "Serves 1.",
].join("\n");

export const editorTokensProvider: MonacoTokensProvider = {
  tokenizer: {
    root: [
      [/Ingredients./, "red"],
      [/Method./, "red"],
      [/mixing bowl/, "green"],
      [/baking dish/, "blue"],
      [/\d(st|nd|rd|th)?/, "sepia"],
    ],
  },
  defaultToken: "plain",
};
