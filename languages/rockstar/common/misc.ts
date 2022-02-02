import { MonacoTokensProvider } from "../../types";

export const sampleProgram = [
  `Midnight takes your heart and your soul`,
  `While your heart is as high as your soul`,
  `Put your heart without your soul into your heart`,
  ``,
  `Give back your heart`,
  ``,
  ``,
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

/** Syntax highlighting */
export const editorTokensProvider: MonacoTokensProvider = {
  ignoreCase: true,
  tokenizer: {
    root: [
      [/\([^\)]*\)/, "comment"],
      [/\b(takes|wants|taking)\b/, "red"],
      [/\b(mysterious|null|nothing|nowhere|nobody|gone)\b/, "orange"],
      [/\b(true|right|yes|ok|false|wrong|no|lies)\b/, "orange"],
      [/\b(empty|silent|silence|".+")\b/, "green"],
      [/\b(if|else|while|until)/, "violet"],
      [/\b(break|break it down|continue|take it to the top)\b/, "violet"],
      [/\b(shout|say|whisper|scream)\b/, "blue"],
      [/\b(it|he|she|him|her|they|them|ze|hir|zie|zir|xe|xem|ve|ver)\b/, "red"],
    ],
  },
  defaultToken: "plain",
};
