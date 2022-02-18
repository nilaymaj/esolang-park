import { MonacoTokensProvider } from "../types";
import * as R from "./parser/constants";

/** Runtime value of a character */
export type CharacterValue = {
  value: number;
  stack: number[];
};

/** Bag of characters declared in the program */
export type CharacterBag = { [name: string]: CharacterValue };

/** Type of props passed to renderer */
export type RS = {
  currentSpeaker: string | null;
  charactersOnStage: string[];
  characterBag: CharacterBag;
  questionState: boolean | null;
};

/** Sample program */
export const sampleProgram = `The Infamous Hello World Program.

Romeo, a young man with a remarkable patience.
Juliet, a likewise young woman of remarkable grace.
Ophelia, a remarkable woman much in dispute with Hamlet.
Hamlet, the flatterer of Andersen Insulting A/S.


                    Act I: Hamlet's insults and flattery.

                    Scene I: The insulting of Romeo.

[Enter Hamlet and Romeo]

Hamlet:
 You lying stupid fatherless big smelly half-witted coward!
 You are as stupid as the difference between a handsome rich brave
 hero and thyself! Speak your mind!

 You are as brave as the sum of your fat little stuffed misused dusty
 old rotten codpiece and a beautiful fair warm peaceful sunny summer's day. 
 You are as healthy as the difference between the sum of the sweetest 
 reddest rose and my father and yourself! Speak your mind!

 You are as cowardly as the sum of yourself and the difference
 between a big mighty proud kingdom and a horse. Speak your mind.

 Speak your mind!

[Exit Romeo]

                    Scene II: The praising of Juliet.

[Enter Juliet]

Hamlet:
 Thou art as sweet as the sum of the sum of Romeo and his horse and his
 black cat! Speak thy mind!

[Exit Juliet]

                    Scene III: The praising of Ophelia.

[Enter Ophelia]

Hamlet:
 Thou art as lovely as the product of a large rural town and my amazing
 bottomless embroidered purse. Speak thy mind!

 Thou art as loving as the product of the bluest clearest sweetest sky
 and the sum of a squirrel and a white horse. Thou art as beautiful as
 the difference between Juliet and thyself. Speak thy mind!

[Exeunt Ophelia and Hamlet]


                    Act II: Behind Hamlet's back.

                    Scene I: Romeo and Juliet's conversation.

[Enter Romeo and Juliet]

Romeo:
 Speak your mind. You are as worried as the sum of yourself and the 
 difference between my small smooth hamster and my nose. Speak your mind!

Juliet:
 Speak YOUR mind! You are as bad as Hamlet! You are as small as the
 difference between the square of the difference between my little pony
 and your big hairy hound and the cube of your sorry little
 codpiece. Speak your mind!

[Exit Romeo]

                    Scene II: Juliet and Ophelia's conversation.

[Enter Ophelia]

Juliet:
 Thou art as good as the quotient between Romeo and the sum of a small
 furry animal and a leech. Speak your mind!

Ophelia:
 Thou art as disgusting as the quotient between Romeo and twice the
 difference between a mistletoe and an oozing infected blister! 
 Speak your mind!

[Exeunt]

`;

/** Syntax highlighting */
export const editorTokensProvider: MonacoTokensProvider = {
  ignoreCase: true,
  tokenizer: {
    /** Program title */
    root: [[/[^\.]+\./, { token: "meta", next: "introduction" }]],
    /** Character introductions */
    introduction: [
      { include: "whitespace" },
      [
        `${R.CharacterRegex.source}(,\\s*)([^\\.]+\\.\\s*\\n?)`,
        ["tag", "", "comment"],
      ],
      [
        /(act)(\s+)([IVXLCDM]+)(:\s+)([^\.]+\.)/,
        // prettier-ignore
        ["keyword", "", "constant", "", { token: "comment", next: "actSection" }] as any,
      ],
    ],
    /** A single act of the play */
    actSection: [
      { include: "whitespace" },
      [/(?=act\b)/, { token: "", next: "@pop" }],
      [
        /(scene)(\s+)([IVXLCDM]+)(:\s+)(.+?(?:\.|\!|\?))/,
        // prettier-ignore
        ["constant.function", "", "constant", "", {token: "comment", next: "sceneSection"}] as any,
      ],
    ],
    /** A single scene of an act in the play */
    sceneSection: [
      { include: "whitespace" },
      [/\[/, { token: "", next: "entryExitClause" }],
      [/(?=act\b)/, { token: "", next: "@pop" }],
      [/(?=scene\b)/, { token: "", next: "@pop" }],
      { include: "dialogue" },
    ],
    /** Dialogues spoken by characters */
    dialogue: [
      { include: "whitespace" },
      [`${R.CharacterRegex.source}:`, "tag"],
      [R.CharacterRegex, "tag"],
      [/nothing|zero/, "constant"],
      [/(remember|recall)\b/, "keyword"],
      [/(myself|i|me|thyself|yourself|thee|thou|you)\b/, "variable"],
      [/speak (thine|thy|your) mind\b/, "constant.function"],
      [/open (thine|thy|your) heart\b/, "constant.function"],
      [/listen to (thine|thy|your) heart\b/, "constant.function"],
      [/open (thine|thy|your) mind\b/, "constant.function"],
      [
        /(punier|smaller|worse|better|bigger|fresher|friendlier|nicer|jollier)\b/,
        "attribute",
      ],
      [/(more|less)\b/, "attribute"],
      [/if (so|not),/, "keyword"],
      [
        /((?:let us|we shall|we must) (?:return|proceed) to (?:act|scene) )([IVXLCDM]+)/,
        ["annotation", "constant"],
      ],
      [
        /(sum|difference|product|quotient|remainder|factorial|square|root|cube|twice)\b/,
        "operators",
      ],
      [R.PositiveNounRegex, "constant"],
      [R.NeutralNounRegex, "constant"],
      [R.NegativeNounRegex, "constant"],
      [R.PositiveAdjectiveRegex, "attribute"],
      [R.NeutralAdjectiveRegex, "attribute"],
      [R.NegativeAdjectiveRegex, "attribute"],
    ],
    /** Clause for entry/exit of character(s) */
    entryExitClause: [
      { include: "whitespace" },
      [/enter|exit|exeunt/, "keyword"],
      [/]/, { token: "", next: "@pop" }],
      [R.CharacterRegex, "tag"],
      [/and\b|,/, ""],
    ],
    /** Utility: skip across whitespace and line breaks */
    whitespace: [[/[\s\n]+/, ""]],
  },
  defaultToken: "",
};
