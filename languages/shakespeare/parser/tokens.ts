import { createToken, Lexer } from "chevrotain";
import * as R from "./constants";

export const Word = createToken({
  name: "Word",
  pattern: /[^\s\n\.\?\!]+/,
});

export const WhitespaceOrNewline = createToken({
  name: "WhitespaceOrNewline",
  pattern: /[\s\n]+/,
  group: Lexer.SKIPPED,
});

export const Whitespace = createToken({
  name: "Whitespace",
  pattern: /\s+/,
  categories: [WhitespaceOrNewline],
  group: Lexer.SKIPPED,
});

export const RomanNumeral = createToken({
  name: "RomanNumeral",
  pattern: /[IVXLCDM]+\b/i,
  categories: [Word],
});

export const Enter = createToken({
  name: "Enter",
  pattern: /enter\b/i,
  categories: [Word],
});

export const Exit = createToken({
  name: "Exit",
  pattern: /exit\b/i,
  categories: [Word],
});

export const Exeunt = createToken({
  name: "Exeunt",
  pattern: /exeunt\b/i,
  categories: [Word],
});

export const And = createToken({
  name: "And",
  pattern: /and\b/i,
  categories: [Word],
});

export const Article = createToken({
  name: "Article",
  pattern: /(a|an|the)\b/i,
  categories: [Word],
});

export const Be = createToken({
  name: "Be",
  pattern: /(am|are|art|be|is)\b/i,
  categories: [Word],
});

export const Not = createToken({
  name: "Not",
  pattern: /not\b/i,
  categories: [Word],
});

export const More = createToken({
  name: "More",
  pattern: /more\b/i,
  categories: [Word],
});

export const Less = createToken({
  name: "Less",
  pattern: /less\b/i,
  categories: [Word],
});

export const Than = createToken({
  name: "Than",
  pattern: /than\b/i,
  categories: [Word],
});

export const Let = createToken({
  name: "Let",
  pattern: /let\b/i,
  categories: [Word],
});

export const Us = createToken({
  name: "Us",
  pattern: /us\b/i,
  categories: [Word],
});

export const We = createToken({
  name: "We",
  pattern: /we\b/i,
  categories: [Word],
});

export const Shall = createToken({
  name: "Shall",
  pattern: /shall\b/i,
  categories: [Word],
});

export const Must = createToken({
  name: "Must",
  pattern: /must\b/i,
  categories: [Word],
});

export const Return = createToken({
  name: "Return",
  pattern: /return\b/i,
  categories: [Word],
});

export const Proceed = createToken({
  name: "Proceed",
  pattern: /proceed\b/i,
  categories: [Word],
});

export const Character = createToken({
  name: "Character",
  pattern: R.CharacterRegex,
  categories: [Word],
});

export const FirstPersonPossessive = createToken({
  name: "FirstPersonPossessive",
  pattern: /(mine|my)\b/i,
  categories: [Word],
});

export const FirstPersonReflexive = createToken({
  name: "FirstPersonReflexive",
  pattern: /myself\b/i,
  categories: [Word],
});

export const FirstPerson = createToken({
  name: "FirstPerson",
  pattern: /(i|me)\b/i,
  categories: [Word],
});

export const NegativeAdjective = createToken({
  name: "NegativeAdjective",
  pattern: R.NegativeAdjectiveRegex,
  categories: [Word],
});

export const NegativeComparative = createToken({
  name: "NegativeComparative",
  pattern: /(punier|smaller|worse)\b/i,
  categories: [Word],
});

export const NegativeNoun = createToken({
  name: "NegativeNoun",
  pattern: R.NegativeNounRegex,
  categories: [Word],
});

export const NeutralAdjective = createToken({
  name: "NeutralAdjective",
  pattern: R.NeutralAdjectiveRegex,
  categories: [Word],
});

export const NeutralNoun = createToken({
  name: "NeutralNoun",
  pattern: R.NeutralNounRegex,
  categories: [Word],
});

export const Nothing = createToken({
  name: "Nothing",
  pattern: /(nothing|zero)\b/i,
  categories: [Word],
});

export const PositiveAdjective = createToken({
  name: "PositiveAdjective",
  pattern: R.PositiveAdjectiveRegex,
  categories: [Word],
});

export const PositiveComparative = createToken({
  name: "PositiveComparative",
  pattern: /(better|bigger|fresher|friendlier|nicer|jollier)\b/i,
  categories: [Word],
});

export const PositiveNoun = createToken({
  name: "PositiveNoun",
  pattern: R.PositiveNounRegex,
  categories: [Word],
});

export const SecondPersonPossessive = createToken({
  name: "SecondPersonPossessive",
  pattern: /(thine|thy|your)\b/i,
  categories: [Word],
});

export const SecondPersonReflexive = createToken({
  name: "SecondPersonReflexive",
  pattern: /(thyself|yourself)\b/i,
  categories: [Word],
});

export const SecondPerson = createToken({
  name: "SecondPerson",
  pattern: /(thee|thou|you)\b/i,
  categories: [Word],
});

export const ThirdPersonPossessive = createToken({
  name: "ThirdPersonPossessive",
  pattern: /(his|her|its|their)\b/i,
  categories: [Word],
});

export const Act = createToken({
  name: "Act",
  pattern: /act\b/i,
  categories: [Word],
});

export const Scene = createToken({
  name: "Scene",
  pattern: /scene\b/i,
  categories: [Word],
});

export const As = createToken({
  name: "As",
  pattern: /as\b/i,
  categories: [Word],
});

export const Open = createToken({
  name: "Open",
  pattern: /open\b/i,
  categories: [Word],
});

export const Heart = createToken({
  name: "Heart",
  pattern: /heart\b/i,
  categories: [Word],
});

export const Speak = createToken({
  name: "Speak",
  pattern: /speak\b/i,
  categories: [Word],
});

export const Mind = createToken({
  name: "Mind",
  pattern: /mind\b/i,
  categories: [Word],
});

export const The = createToken({
  name: "The",
  pattern: /the\b/i,
  categories: [Word, Article],
});

export const Between = createToken({
  name: "Between",
  pattern: /between\b/i,
  categories: [Word],
});

export const Of = createToken({
  name: "Of",
  pattern: /of\b/i,
  categories: [Word],
});

export const If = createToken({
  name: "If",
  pattern: /if\b/i,
  categories: [Word],
});

export const So = createToken({
  name: "So",
  pattern: /so\b/i,
  categories: [Word],
});

export const To = createToken({
  name: "To",
  pattern: /to\b/i,
  categories: [Word],
});

export const Listen = createToken({
  name: "Listen",
  pattern: /listen\b/i,
  categories: [Word],
});

export const Recall = createToken({
  name: "Recall",
  pattern: /recall\b/i,
  categories: [Word],
});

export const Remember = createToken({
  name: "Remember",
  pattern: /remember\b/i,
  categories: [Word],
});

////////////////////////////////
/////////// OPERATORS //////////
////////////////////////////////

export const Sum = createToken({
  name: "Sum",
  pattern: /sum\b/,
  categories: [Word],
});

export const Difference = createToken({
  name: "Difference",
  pattern: /difference\b/,
  categories: [Word],
});

export const Product = createToken({
  name: "Product",
  pattern: /product\b/i,
  categories: [Word],
});

export const Quotient = createToken({
  name: "Quotient",
  pattern: /quotient\b/i,
  categories: [Word],
});

export const Remainder = createToken({
  name: "Remainder",
  pattern: /remainder\b/i,
  categories: [Word],
});

export const Factorial = createToken({
  name: "Factorial",
  pattern: /factorial\b/i,
  categories: [Word],
});

export const Square = createToken({
  name: "Square",
  pattern: /square\b/i,
  categories: [Word],
});

export const Root = createToken({
  name: "Root",
  pattern: /root\b/i,
  categories: [Word],
});

export const Cube = createToken({
  name: "Cube",
  pattern: /cube\b/i,
  categories: [Word],
});

export const Twice = createToken({
  name: "Twice",
  pattern: /twice\b/i,
  categories: [Word],
});

export const SentenceMark = createToken({
  name: "SentenceMark",
  pattern: /\.|\?|\!/,
});

export const SquareBracketOpen = createToken({
  name: "SquareBracketOpen",
  pattern: /\[/,
});

export const SquareBracketClose = createToken({
  name: "SquareBracketClose",
  pattern: /\]/,
});

export const Colon = createToken({
  name: "Colon",
  pattern: /:/,
});

export const Comma = createToken({
  name: "Comma",
  pattern: /,/,
  categories: [Word],
});

export const Period = createToken({
  name: "Period",
  pattern: /\./,
  categories: [SentenceMark],
});

export const QuestionMark = createToken({
  name: "QuestionMark",
  pattern: /\?/,
  categories: [SentenceMark],
});

export const I = createToken({
  name: "I",
  pattern: /i\b/i,
  categories: [RomanNumeral, FirstPerson, Word],
});

export const AllTokens = [
  Whitespace,
  WhitespaceOrNewline,
  Character,
  The,
  Be,
  More,
  Less,
  Than,
  Let,
  Us,
  We,
  Shall,
  Must,
  Return,
  Proceed,
  Not,
  As,
  I,
  If,
  So,
  To,
  Enter,
  Exit,
  Exeunt,
  Open,
  Heart,
  Speak,
  Mind,
  Listen,
  Recall,
  Remember,
  And,
  Nothing,
  Between,
  Of,
  Sum,
  Difference,
  Product,
  Quotient,
  Remainder,
  Factorial,
  Square,
  Root,
  Cube,
  Twice,
  Period,
  QuestionMark,
  Article,
  Act,
  Scene,
  Comma,
  Colon,
  SquareBracketOpen,
  SquareBracketClose,
  SentenceMark,
  FirstPersonPossessive,
  FirstPersonReflexive,
  FirstPerson,
  NegativeAdjective,
  NegativeComparative,
  NegativeNoun,
  NeutralAdjective,
  NeutralNoun,
  PositiveAdjective,
  PositiveComparative,
  PositiveNoun,
  SecondPersonPossessive,
  SecondPersonReflexive,
  SecondPerson,
  ThirdPersonPossessive,
  RomanNumeral,
  Word,
];
