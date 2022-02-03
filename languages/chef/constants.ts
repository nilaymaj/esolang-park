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
  'This recipe prints the immortal words "Hello world!", in a basically ',
  "brute force way. It also makes a lot of food for one person.",
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

/** Syntax highlighting provider */
export const editorTokensProvider: MonacoTokensProvider = {
  tokenizer: {
    root: [
      [/^\s*$/, { token: "" }],
      [/^.+$/, { token: "variable.function", next: "@recipe" }],
    ],
    recipe: [
      [/^\s*Ingredients\.\s*$/, { token: "annotation", next: "@ingredients" }],
      [/^\s*Method\.\s*$/, { token: "annotation", next: "@method" }],
      [
        /(^\s*)(Serves )(\d+)(\.\s*$)/,
        ["", "", "number", { token: "", next: "@popall" }] as any,
      ],
      [/^.+$/, { token: "comment" }],
    ],
    ingredients: [
      [/\d+/, "number"],
      [/ (g|kg|pinch(?:es)?|ml|l|dash(?:es)?) /, "type"],
      [/ ((heaped|level) )?(cups?|teaspoons?|tablespoons?) /, "type"],
      [/^\s*$/, { token: "", next: "@pop" }],
    ],
    method: [
      [/mixing bowl/, "tag"],
      [/baking dish/, "meta"],
      [
        /(^|\.\s*)(Take|Put|Fold|Add|Remove|Combine|Divide|Liquefy|Stir|Mix|Clean|Pour|Set aside|Serve with|Refrigerate)($| )/,
        ["", "keyword", ""],
      ],
      [/^\s*$/, { token: "", next: "@pop" }],
    ],
  },
  defaultToken: "",
};
