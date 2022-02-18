import { CstNode, CstParser, ParserMethod } from "chevrotain";
import * as Tokens from "./tokens";

export interface RuleBook<T> {
  program: T;
  programTitle: T;
  characterIntro: T;
  actHeading: T;
  sceneHeading: T;
  entrance: T;
  exit: T;
  multiExit: T;
  entryExitClause: T;
  actSection: T;
  sceneSection: T;
  sceneSectionChunk: T;
  speakerClause: T;
  dialogueSet: T;
  dialogueLine: T;
  // ENGLISH
  noun: T;
  adjective: T;
  possessive: T;
  reflexive: T;
  comparative: T;
  // STATEMENTS
  assignment: T;
  exclaimAssignment: T;
  arithAssignment: T;
  stdin: T;
  stdout: T;
  goto: T;
  question: T;
  conditional: T;
  comparator: T;
  _asComparator: T;
  _simpleComparator: T;
  _moreLessComparator: T;
  // CONSTANTS
  constant: T;
  simpleConstant: T;
  verbalConstant: T;
  unarticulatedVerbalConstant: T;
  // EXPRESSION TREE
  expression: T;
  atomicExpression: T;
  sumExpression: T;
  differenceExpression: T;
  productExpression: T;
  quotientExpression: T;
  remainderExpression: T;
  factorialExpression: T;
  squareExpression: T;
  cubeExpression: T;
  squareRootExpression: T;
  twiceExpression: T;
}

export class ShakespeareParser
  extends CstParser
  implements RuleBook<ParserMethod<[], CstNode>>
{
  constructor() {
    super(Tokens.AllTokens, {
      nodeLocationTracking: "full",
      recoveryEnabled: true,
    });
    this.performSelfAnalysis();
  }

  program = this.RULE("program", () => {
    this.SUBRULE(this.programTitle);
    this.MANY(() => this.CONSUME(Tokens.WhitespaceOrNewline));
    this.MANY1(() => this.SUBRULE(this.characterIntro));
    this.MANY2(() => this.SUBRULE(this.actSection));
  });

  /** <description> */
  programTitle = this.RULE("programTitle", () => {
    this.MANY(() => this.CONSUME(Tokens.Word));
    this.CONSUME(Tokens.Period);
  });

  /** `<character-name>, <description>` */
  characterIntro = this.RULE("characterIntro", () => {
    this.CONSUME(Tokens.Character);
    this.CONSUME(Tokens.Comma);
    this.MANY(() => this.CONSUME(Tokens.Word));
    this.CONSUME(Tokens.SentenceMark);
  });

  /** `Act <RomanNumeral>: <description>` */
  actHeading = this.RULE("actHeading", () => {
    this.CONSUME(Tokens.Act);
    this.CONSUME(Tokens.RomanNumeral);
    this.CONSUME(Tokens.Colon);
    this.MANY(() => this.CONSUME(Tokens.Word));
    this.CONSUME(Tokens.SentenceMark);
  });

  /** `Scene <RomanNumeral>: <description>` */
  sceneHeading = this.RULE("sceneHeading", () => {
    this.CONSUME(Tokens.Scene);
    this.CONSUME(Tokens.RomanNumeral);
    this.CONSUME(Tokens.Colon);
    this.MANY(() => this.CONSUME(Tokens.Word));
    this.CONSUME(Tokens.SentenceMark);
  });

  /** `[Enter <character-name> (and <character-name>)]` */
  entrance = this.RULE("entrance", () => {
    this.CONSUME(Tokens.SquareBracketOpen);
    this.CONSUME(Tokens.Enter);
    this.CONSUME1(Tokens.Character);
    this.OPTION(() => {
      this.CONSUME(Tokens.And);
      this.CONSUME2(Tokens.Character);
    });
    this.CONSUME(Tokens.SquareBracketClose);
  });

  /** `[Exit <character-name>]` */
  exit = this.RULE("exit", () => {
    this.CONSUME(Tokens.SquareBracketOpen);
    this.CONSUME(Tokens.Exit);
    this.CONSUME(Tokens.Character);
    this.CONSUME(Tokens.SquareBracketClose);
  });

  /** `[Exeunt (<character-name> and <character-name>)]` */
  multiExit = this.RULE("multiExit", () => {
    this.CONSUME(Tokens.SquareBracketOpen);
    this.CONSUME(Tokens.Exeunt);
    this.OPTION(() => {
      this.CONSUME1(Tokens.Character);
      this.CONSUME(Tokens.And);
      this.CONSUME2(Tokens.Character);
    });
    this.CONSUME(Tokens.SquareBracketClose);
  });

  /** Clause for entry or exit of characters */
  entryExitClause = this.RULE("entryExitClause", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.entrance) },
      { ALT: () => this.SUBRULE(this.exit) },
      { ALT: () => this.SUBRULE(this.multiExit) },
    ]);
  });

  /** Text corresponding to a single act */
  actSection = this.RULE("actSection", () => {
    this.SUBRULE(this.actHeading);
    this.AT_LEAST_ONE(() => this.SUBRULE(this.sceneSection));
  });

  /** Text corresponding to a single scene */
  sceneSection = this.RULE("sceneSection", () => {
    this.SUBRULE(this.sceneHeading);
    this.AT_LEAST_ONE(() => this.SUBRULE(this.sceneSectionChunk));
  });

  /** A single item of a scene: dialogue set or entry-exit clause */
  sceneSectionChunk = this.RULE("sceneSectionChunk", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.entryExitClause) },
      { ALT: () => this.SUBRULE(this.dialogueSet) },
    ]);
  });

  /** `<character-name>:` */
  speakerClause = this.RULE("speakerClause", () => {
    this.CONSUME(Tokens.Character);
    this.CONSUME(Tokens.Colon);
  });

  /** Set of dialogues spoken by a character */
  dialogueSet = this.RULE("dialogueSet", () => {
    this.SUBRULE(this.speakerClause);
    this.AT_LEAST_ONE(() => this.SUBRULE(this.dialogueLine));
  });

  /** A single line of dialogue spoken by a character */
  dialogueLine = this.RULE("dialogueLine", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.conditional) },
      { ALT: () => this.SUBRULE(this.nonConditionalDialogueLine) },
    ]);
  });

  /** Dialogue line possibilities, excluding conditionals */
  nonConditionalDialogueLine = this.RULE("nonConditionalDialogueLine", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.assignment) },
      { ALT: () => this.SUBRULE(this.stdin) },
      { ALT: () => this.SUBRULE(this.stdout) },
      { ALT: () => this.SUBRULE(this.goto) },
      { ALT: () => this.SUBRULE(this.stackPush) },
      { ALT: () => this.SUBRULE(this.stackPop) },
      { ALT: () => this.SUBRULE(this.question) },
    ]);
  });

  ///////////////////////////////
  //////////  ENGLISH  //////////
  ///////////////////////////////

  /** Shakespearean noun */
  noun = this.RULE("noun", () => {
    this.OR([
      { ALT: () => this.CONSUME(Tokens.NegativeNoun) },
      { ALT: () => this.CONSUME(Tokens.NeutralNoun) },
      { ALT: () => this.CONSUME(Tokens.PositiveNoun) },
    ]);
  });

  /** Shakesperean adjective */
  adjective = this.RULE("adjective", () => {
    this.OR([
      { ALT: () => this.CONSUME(Tokens.NegativeAdjective) },
      { ALT: () => this.CONSUME(Tokens.NeutralAdjective) },
      { ALT: () => this.CONSUME(Tokens.PositiveAdjective) },
    ]);
  });

  /** Any recognized possessive (my, your, his, her, etc.) */
  possessive = this.RULE("possessive", () => {
    this.OR([
      { ALT: () => this.CONSUME(Tokens.FirstPersonPossessive) },
      { ALT: () => this.CONSUME(Tokens.SecondPersonPossessive) },
      { ALT: () => this.CONSUME(Tokens.ThirdPersonPossessive) },
    ]);
  });

  /** Any recognized reflexive (myself, thyself, etc.) */
  reflexive = this.RULE("reflexive", () => {
    this.OR([
      { ALT: () => this.CONSUME(Tokens.FirstPersonReflexive) },
      { ALT: () => this.CONSUME(Tokens.SecondPersonReflexive) },
    ]);
  });

  /** Any recognized comparative (better, punier, etc) */
  comparative = this.RULE("comparative", () => {
    this.OR([
      { ALT: () => this.CONSUME(Tokens.PositiveComparative) },
      { ALT: () => this.CONSUME(Tokens.NegativeComparative) },
    ]);
  });

  ///////////////////////////////
  /////////  STATEMENTS  ////////
  ///////////////////////////////

  /** Assignment of an expression to a character */
  assignment = this.RULE("assignment", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.exclaimAssignment) },
      { ALT: () => this.SUBRULE(this.arithAssignment) },
    ]);
  });

  /** `<second-person> <unarticulated-constant>` */
  exclaimAssignment = this.RULE("exclaimAssignment", () => {
    this.CONSUME(Tokens.SecondPerson);
    this.SUBRULE(this.unarticulatedVerbalConstant);
    this.CONSUME(Tokens.SentenceMark);
  });

  /** `<second-person> <be> as <adjective> as <expression>` */
  arithAssignment = this.RULE("arithAssignment", () => {
    this.CONSUME(Tokens.SecondPerson);
    this.CONSUME(Tokens.Be);
    this.OPTION(() => {
      this.CONSUME1(Tokens.As);
      this.SUBRULE(this.adjective);
      this.CONSUME2(Tokens.As);
    });
    this.SUBRULE(this.expression);
    this.CONSUME(Tokens.SentenceMark);
  });

  /** `Listen to your heart | Open your mind` */
  stdin = this.RULE("stdin", () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(Tokens.Listen);
          this.CONSUME(Tokens.To);
          this.CONSUME1(Tokens.SecondPersonPossessive);
          this.CONSUME(Tokens.Heart);
        },
      },
      {
        ALT: () => {
          this.CONSUME(Tokens.Open);
          this.CONSUME2(Tokens.SecondPersonPossessive);
          this.CONSUME(Tokens.Mind);
        },
      },
    ]);
    this.CONSUME(Tokens.SentenceMark);
  });

  /** `Open <your> heart | Speak <your> mind` */
  stdout = this.RULE("stdout", () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(Tokens.Open);
          this.CONSUME1(Tokens.SecondPersonPossessive);
          this.CONSUME(Tokens.Heart);
        },
      },
      {
        ALT: () => {
          this.CONSUME(Tokens.Speak);
          this.CONSUME2(Tokens.SecondPersonPossessive);
          this.CONSUME(Tokens.Mind);
        },
      },
    ]);
    this.CONSUME(Tokens.SentenceMark);
  });

  /** (let us|we shall|we must) (return|proceed) to (act|scene) <roman-numeral> */
  goto = this.RULE("goto", () => {
    this.OR1([
      {
        ALT: () => {
          this.CONSUME(Tokens.Let);
          this.CONSUME(Tokens.Us);
        },
      },
      {
        ALT: () => {
          this.CONSUME1(Tokens.We);
          this.CONSUME(Tokens.Shall);
        },
      },
      {
        ALT: () => {
          this.CONSUME2(Tokens.We);
          this.CONSUME(Tokens.Must);
        },
      },
    ]);
    this.OR2([
      { ALT: () => this.CONSUME(Tokens.Return) },
      { ALT: () => this.CONSUME(Tokens.Proceed) },
    ]);
    this.CONSUME(Tokens.To);
    this.OR3([
      { ALT: () => this.CONSUME(Tokens.Act) },
      { ALT: () => this.CONSUME(Tokens.Scene) },
    ]);
    this.CONSUME(Tokens.RomanNumeral);
    this.CONSUME(Tokens.SentenceMark);
  });

  /** `Remember <expression>` */
  stackPush = this.RULE("stackPush", () => {
    this.CONSUME(Tokens.Remember);
    this.SUBRULE(this.expression);
    this.CONSUME(Tokens.SentenceMark);
  });

  /** `Recall <word>*` */
  stackPop = this.RULE("stackPop", () => {
    this.CONSUME(Tokens.Recall);
    this.MANY(() => this.CONSUME(Tokens.Word));
    this.CONSUME(Tokens.SentenceMark);
  });

  /** `<be> <expression> <comparator> <expression>?` */
  question = this.RULE("question", () => {
    this.CONSUME(Tokens.Be);
    this.SUBRULE1(this.expression, { LABEL: "lhs" });
    this.SUBRULE(this.comparator);
    this.SUBRULE2(this.expression, { LABEL: "rhs" });
    this.CONSUME(Tokens.QuestionMark);
  });

  /** `If so, <non-conditional-dialogue-line>` */
  conditional = this.RULE("conditional", () => {
    this.CONSUME(Tokens.If);
    this.OR([
      { ALT: () => this.CONSUME(Tokens.So) },
      { ALT: () => this.CONSUME(Tokens.Not) },
    ]);
    this.CONSUME(Tokens.Comma);
    this.SUBRULE(this.nonConditionalDialogueLine);
  });

  /** Comparator clause used in questions */
  comparator = this.RULE("comparator", () => {
    this.OPTION(() => this.CONSUME(Tokens.Not));
    this.OR([
      { ALT: () => this.SUBRULE(this._asComparator) },
      { ALT: () => this.SUBRULE(this._simpleComparator) },
      { ALT: () => this.SUBRULE(this._moreLessComparator) },
    ]);
  });

  /** `as <adjective> as` */
  _asComparator = this.RULE("_asComparator", () => {
    this.CONSUME1(Tokens.As);
    this.SUBRULE(this.adjective);
    this.CONSUME2(Tokens.As);
  });

  /** `<comparative> than` */
  _simpleComparator = this.RULE("_simpleComparator", () => {
    this.SUBRULE(this.comparative);
    this.CONSUME(Tokens.Than);
  });

  /** `(more|less) <adjective> than` */
  _moreLessComparator = this.RULE("_moreLessComparator", () => {
    this.OR([
      { ALT: () => this.CONSUME(Tokens.More) },
      { ALT: () => this.CONSUME(Tokens.Less) },
    ]);
    this.SUBRULE(this.adjective);
    this.CONSUME(Tokens.Than);
  });

  ///////////////////////////////
  /////////  CONSTANTS  /////////
  ///////////////////////////////

  /** Constant expressions */
  constant = this.RULE("constant", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.simpleConstant) },
      { ALT: () => this.SUBRULE(this.verbalConstant) },
    ]);
  });

  /** Simple keyword-based constant */
  simpleConstant = this.RULE("_simpleConstant", () => {
    this.CONSUME(Tokens.Nothing);
  });

  /** Verbally expressed constant */
  verbalConstant = this.RULE("_verbalConstant", () => {
    this.OR([
      { ALT: () => this.CONSUME(Tokens.Article) },
      { ALT: () => this.SUBRULE(this.possessive) },
    ]);
    this.SUBRULE(this.unarticulatedVerbalConstant);
  });

  /** `<adjective>* <noun>`, representing a constant */
  unarticulatedVerbalConstant = this.RULE("unarticulatedVerbalConstant", () => {
    // Shakespeare only allows non-negative adjectives on positive nouns and
    // negative adjectives on negative nouns.
    //
    // Unfortunately, positive and negative branches cannot be separated in this
    // parser since they share an arbitrarily long prefix of neutral adjectives.
    // Thus, this branch validation must be done in the CST visitor.
    this.MANY(() => this.SUBRULE(this.adjective));
    this.SUBRULE(this.noun);
  });

  ///////////////////////////////
  //////  EXPRESSION TREE  //////
  ///////////////////////////////

  /** Root node of an expression tree */
  expression = this.RULE("expression", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.sumExpression) },
      { ALT: () => this.SUBRULE(this.differenceExpression) },
      { ALT: () => this.SUBRULE(this.productExpression) },
      { ALT: () => this.SUBRULE(this.quotientExpression) },
      { ALT: () => this.SUBRULE(this.remainderExpression) },
      { ALT: () => this.SUBRULE(this.factorialExpression) },
      { ALT: () => this.SUBRULE(this.squareExpression) },
      { ALT: () => this.SUBRULE(this.squareRootExpression) },
      { ALT: () => this.SUBRULE(this.cubeExpression) },
      { ALT: () => this.SUBRULE(this.twiceExpression) },
      { ALT: () => this.SUBRULE(this.atomicExpression) },
    ]);
  });

  /** `<character> | <reflexive> | <constant>` */
  atomicExpression = this.RULE("atomicExpression", () => {
    this.OR([
      { ALT: () => this.CONSUME(Tokens.Character) },
      { ALT: () => this.CONSUME(Tokens.FirstPerson) },
      { ALT: () => this.CONSUME(Tokens.SecondPerson) },
      { ALT: () => this.SUBRULE(this.reflexive) },
      { ALT: () => this.SUBRULE(this.constant) },
    ]);
  });

  /** `the sum of <expression> and <expression>` */
  sumExpression = this.RULE("sumExpression", () => {
    this.CONSUME(Tokens.The);
    this.CONSUME(Tokens.Sum);
    this.CONSUME(Tokens.Of);
    this.SUBRULE1(this.expression, { LABEL: "lhs" });
    this.CONSUME(Tokens.And);
    this.SUBRULE2(this.expression, { LABEL: "rhs" });
  });

  /** `the difference between <expression> and <expression>` */
  differenceExpression = this.RULE("differenceExpression", () => {
    this.CONSUME(Tokens.The);
    this.CONSUME(Tokens.Difference);
    this.CONSUME(Tokens.Between);
    this.SUBRULE1(this.expression, { LABEL: "lhs" });
    this.CONSUME(Tokens.And);
    this.SUBRULE2(this.expression, { LABEL: "rhs" });
  });

  /** `the product of <expression> and <expression>` */
  productExpression = this.RULE("productExpression", () => {
    this.CONSUME(Tokens.The);
    this.CONSUME(Tokens.Product);
    this.CONSUME(Tokens.Of);
    this.SUBRULE1(this.expression, { LABEL: "lhs" });
    this.CONSUME(Tokens.And);
    this.SUBRULE2(this.expression, { LABEL: "rhs" });
  });

  /** `the quotient between <expression> and <expression>` */
  quotientExpression = this.RULE("quotientExpression", () => {
    this.CONSUME(Tokens.The);
    this.CONSUME(Tokens.Quotient);
    this.CONSUME(Tokens.Between);
    this.SUBRULE1(this.expression, { LABEL: "lhs" });
    this.CONSUME(Tokens.And);
    this.SUBRULE2(this.expression, { LABEL: "rhs" });
  });

  /** `the remainder of the quotient between <expression> and <expression>` */
  remainderExpression = this.RULE("remainderExpression", () => {
    this.CONSUME1(Tokens.The);
    this.CONSUME(Tokens.Remainder);
    this.CONSUME(Tokens.Of);
    this.CONSUME2(Tokens.The);
    this.CONSUME(Tokens.Quotient);
    this.CONSUME(Tokens.Between);
    this.SUBRULE1(this.expression, { LABEL: "lhs" });
    this.CONSUME(Tokens.And);
    this.SUBRULE2(this.expression, { LABEL: "rhs" });
  });

  /** `the factorial of <expression>` */
  factorialExpression = this.RULE("factorialExpression", () => {
    this.CONSUME(Tokens.The);
    this.CONSUME(Tokens.Factorial);
    this.CONSUME(Tokens.Of);
    this.SUBRULE(this.expression);
  });

  /** `the square of <expression>` */
  squareExpression = this.RULE("squareExpression", () => {
    this.CONSUME(Tokens.The);
    this.CONSUME(Tokens.Square);
    this.CONSUME(Tokens.Of);
    this.SUBRULE(this.expression);
  });

  /** `the cube of <expression>` */
  cubeExpression = this.RULE("cubeExpression", () => {
    this.CONSUME(Tokens.The);
    this.CONSUME(Tokens.Cube);
    this.CONSUME(Tokens.Of);
    this.SUBRULE(this.expression);
  });

  /** `the square root of <expression>` */
  squareRootExpression = this.RULE("squareRootExpression", () => {
    this.CONSUME(Tokens.The);
    this.CONSUME(Tokens.Square);
    this.CONSUME(Tokens.Root);
    this.CONSUME(Tokens.Of);
    this.SUBRULE(this.expression);
  });

  /** `twice <expression>` */
  twiceExpression = this.RULE("twiceExpression", () => {
    this.CONSUME(Tokens.Twice);
    this.SUBRULE(this.expression);
  });
}
