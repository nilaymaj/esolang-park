import { MonacoTokensProvider } from "../../types";

export const sampleProgram = [
  `Midnight takes your heart and your soul`,
  `While your heart is as high as your soul`,
  `Put your heart without your soul into your heart`,
  ``,
  `Give back your heart`,
  ``,
  `(♬ FizzBuzz riff plays ♬)`, // :)
  `Desire is a lovestruck ladykiller`,
  `My world is nothing `,
  `Fire is ice`,
  `Hate is water`,
  `Until my world is Desire,`,
  `Build my world up`,
  `If Midnight taking my world, Fire is nothing and Midnight taking my world, Hate is nothing`,
  `Shout "FizzBuzz!"`,
  `Take it to the top`,
  ``,
  `If Midnight taking my world, Fire is nothing`,
  `Shout "Fizz!"`,
  `Take it to the top`,
  ``,
  `If Midnight taking my world, Hate is nothing`,
  `Say "Buzz!"`,
  `Take it to the top`,
  ``,
  `Whisper my world`,
].join("\n");

// prettier-ignore
const MAYBE_EQ_COMPARE_WORDS = ["high", "great", "big", "strong", "low", "little", "small", "weak"]
const MAYBE_EQ_COMPARE_REGEX = MAYBE_EQ_COMPARE_WORDS.join("|");

// prettier-ignore
const NON_EQ_COMPARE_WORDS = ["higher", "greater", "bigger", "stronger", "lower", "less", "smaller", "weaker"];
const NON_EQ_COMPARE_REGEX = NON_EQ_COMPARE_WORDS.join("|");

/** Syntax highlighting */
export const editorTokensProvider: MonacoTokensProvider = {
  ignoreCase: true,

  // prettier-ignore
  varPronouns: ["it", "he", "she", "him", "her", "they", "them", 
             "ze", "hir", "zie", "zir", "xe", "xem", "ve", "ver"],

  // prettier-ignore
  operators: ["plus", "with", "minus", "without", "times", "of", "over", "between",
   "build", "knock", "up", "down", "is", "are", "was", "were", "ain't", "aren't", 
   "wasn't", "weren't", "and", "or", "nor", "not", "like"],

  // prettier-ignore
  inbuiltFns: ["say", "shout", "whisper", "scream", "cast", "burn", "rock", "push", 
  "roll", "pop", "cut", "split", "shatter", "join", "unite"],

  // prettier-ignore
  keywords: ["if", "else", "while", "until", "break", "continue", "put", "let", "be", 
  "into", "give", "return", "back"],

  // prettier-ignore
  constants: ["mysterious", "null", "nothing", "nowhere", "nobody", "gone", "true",
  "right", "yes", "ok", "false", "wrong", "no", "lies", "empty", "silent", "silence"],

  tokenizer: {
    root: [
      [/\(/, { token: "comment", next: "@comment" }],
      [/"/, { token: "string", next: "@string" }],
      [/,|\./, ""],
      // Function usage
      [
        // Allowing multi-word fn names here leads to too greedy rule,
        // so for syntax highlighting, we use only one-word functions
        /([a-zA-Z]+)( )(takes|wants|taking)( )/,
        ["variable.function", "", "keyword", ""],
      ],
      // Comparator clauses
      [
        /(is as )([a-zA-Z]+)( as)/,
        { cases: { [`$2~${MAYBE_EQ_COMPARE_REGEX}`]: "operators" } },
      ],
      [
        /(is )([a-zA-Z]+)( than)/,
        { cases: { [`$2~${NON_EQ_COMPARE_REGEX}`]: "operators" } },
      ],
      // Poetic string literals
      [/(says )(.+$)/, ["keyword", "string"]],
      // Multi-word keywords (can't be captured by keyword catchall)
      [/turn (up|down|round|around)\b/, "operators"],
      [/(break it down|take it to the top)/, "keyword"],
      [/listen to/, "constant.function"],
      // Catchall for keywords
      [
        /[^\s]+\b/,
        {
          cases: {
            "@constants": "constant",
            "@keywords": "keyword",
            "@varPronouns": "variable",
            "@operators": "operators",
            "@inbuiltFns": "constant.function",
          },
        },
      ],
    ],
    comment: [
      [/\)/, { token: "comment", next: "@pop" }],
      [/[^\)]*/, "comment"],
    ],
    string: [
      [/"/, { token: "string", next: "@pop" }],
      [/[^"]*/, "string"],
    ],
  },
  defaultToken: "variable",
};
