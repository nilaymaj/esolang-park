import { DocumentRange } from "../../../types";
import * as C from "./cst";

/** Type that contains information about what AST the visitor returns for each rule */
export type ShakespeareVisitorTypes = {
  program(children: C.ProgramCstChildren, param?: any): Program;
  programTitle(children: C.ProgramTitleCstChildren, param?: any): null;
  characterIntro(
    children: C.CharacterIntroCstChildren,
    param?: any
  ): CharacterIntro;
  actHeading(children: C.ActHeadingCstChildren, param?: any): ActHeading;
  sceneHeading(children: C.SceneHeadingCstChildren, param?: any): SceneHeading;
  entrance(children: C.EntranceCstChildren, param?: any): EntryExitClause;
  exit(children: C.ExitCstChildren, param?: any): EntryExitClause;
  multiExit(children: C.MultiExitCstChildren, param?: any): EntryExitClause;
  entryExitClause(
    children: C.EntryExitClauseCstChildren,
    param?: any
  ): EntryExitClause;
  actSection(children: C.ActSectionCstChildren, param?: any): ActSection;
  sceneSection(children: C.SceneSectionCstChildren, param?: any): SceneSection;
  sceneSectionChunk(
    children: C.SceneSectionChunkCstChildren,
    param?: any
  ): SceneSectionChunk;
  speakerClause(
    children: C.SpeakerClauseCstChildren,
    param?: any
  ): SpeakerClause;
  dialogueSet(children: C.DialogueSetCstChildren, param?: any): DialogueSet;
  dialogueLine(children: C.DialogueCstChildren, param?: any): DialogueLine;
  nonConditionalDialogueLine(
    children: C.NonConditionalDialogueLineCstChildren,
    param?: any
  ): NonConditionalDialogueLine;

  /////////// ENGLISH ///////////
  noun(children: C.NounCstChildren, param?: any): 1 | 0 | -1;
  adjective(children: C.AdjectiveCstChildren, param?: any): 1 | 0 | -1;
  possessive(
    children: C.PossessiveCstChildren,
    param?: any
  ): "first" | "second" | "third";
  reflexive(children: C.ReflexiveCstChildren, param?: any): "first" | "second";
  comparative(children: C.ComparativeCstChildren, param?: any): 1 | -1;

  /////////// STATEMENTS ///////////
  assignment(children: C.AssignmentCstChildren, param?: any): AssignmentLine;
  exclaimAssignment(
    children: C.ExclaimAssignmentCstChildren,
    param?: any
  ): AssignmentLine;
  arithAssignment(
    children: C.ArithAssignmentCstChildren,
    param?: any
  ): AssignmentLine;
  stdin(children: C.StdinCstChildren, param?: any): StdinLine;
  stdout(children: C.StdoutCstChildren, param?: any): StdoutLine;
  goto(children: C.GotoCstChildren, param?: any): GotoLine;
  stackPush(children: C.StackPushCstChildren, param?: any): StackPushLine;
  stackPop(children: C.StackPopCstChildren, param?: any): StackPopLine;
  question(children: C.QuestionCstChildren, param?: any): QuestionLine;
  conditional(children: C.ConditionalCstChildren, param?: any): ConditionalLine;
  comparator(
    children: C.ComparatorCstChildren,
    param?: any
  ): ComparisonOperator;
  _asComparator(
    children: C._asComparatorCstChildren,
    param?: any
  ): ComparisonOperator;
  _simpleComparator(
    children: C._simpleComparatorCstChildren,
    param?: any
  ): ComparisonOperator;
  _moreLessComparator(
    children: C._moreLessComparatorCstChildren,
    param?: any
  ): ComparisonOperator;

  ////////////// CONSTANTS //////////////
  constant(children: C.ConstantCstChildren, param?: any): Constant;
  _simpleConstant(
    children: C._simpleConstantCstChildren,
    param?: any
  ): Constant;
  _verbalConstant(
    children: C._verbalConstantCstChildren,
    param?: any
  ): Constant;
  unarticulatedVerbalConstant(
    children: C.UnarticulatedVerbalConstantCstChildren,
    param?: any
  ): Constant;

  /////////// EXPRESSION TREE ///////////
  expression(children: C.ExpressionCstChildren, param?: any): Expression;
  atomicExpression(
    children: C.AtomicExpressionCstChildren,
    param?: any
  ): AtomicExpression;
  sumExpression(
    children: C.SumExpressionCstChildren,
    param?: any
  ): BinaryExpression;
  differenceExpression(
    children: C.DifferenceExpressionCstChildren,
    param?: any
  ): BinaryExpression;
  productExpression(
    children: C.ProductExpressionCstChildren,
    param?: any
  ): BinaryExpression;
  quotientExpression(
    children: C.QuotientExpressionCstChildren,
    param?: any
  ): BinaryExpression;
  remainderExpression(
    children: C.RemainderExpressionCstChildren,
    param?: any
  ): BinaryExpression;
  factorialExpression(
    children: C.FactorialExpressionCstChildren,
    param?: any
  ): UnaryExpression;
  squareExpression(
    children: C.SquareExpressionCstChildren,
    param?: any
  ): UnaryExpression;
  cubeExpression(
    children: C.CubeExpressionCstChildren,
    param?: any
  ): UnaryExpression;
  squareRootExpression(
    children: C.SquareRootExpressionCstChildren,
    param?: any
  ): UnaryExpression;
  twiceExpression(
    children: C.TwiceExpressionCstChildren,
    param?: any
  ): UnaryExpression;
};

/** We don't parse roman numerals and instead just treat them as string IDs */
export type RomanNumeral = string;

/** AST for a complete Shakespeare program */
export type Program = {
  characters: CharacterIntro[];
  acts: ActSection[];
};

/** Character declaration at the start of a program */
export type CharacterIntro = Character;

/** Heading of an act - only the act number is kept */
export type ActHeading = RomanNumeral;
/** Heading of a scene - only the scene number is kept */
export type SceneHeading = RomanNumeral;

/** Clause for entry or exit of one or more characters */
export type EntryExitClause = {
  type: "entry" | "exit";
  /**
   * List of characters entering or leaving.
   * `null` is used for `[Exeunt]` clauses.
   */
  characters: Character[] | null;
  range: DocumentRange;
};

/** Details of a single act */
export type ActSection = {
  id: ActHeading;
  scenes: SceneSection[];
};

/** Details of a single scene */
export type SceneSection = {
  id: SceneHeading;
  items: SceneSectionItem[];
};

/** An execution atom of a single scene */
export type SceneSectionItem = EntryExitClause | DialogueItem;

/** A dialogue set or entry-exit clause belonging to a scene */
export type SceneSectionChunk = EntryExitClause | DialogueSet;

/** `<character-name>:` clause that starts a dialogue set */
export type SpeakerClause = Character;

/** Set of dialogues spoken by a character */
export type DialogueSet = {
  type: "dialogue-set";
  speaker: SpeakerClause;
  lines: DialogueLine[];
};

/** A single dialogue item containing speaker and line */
export type DialogueItem = {
  type: "dialogue-item";
  speaker: Character;
  line: DialogueLine;
};

/** Single dialogue line spoken by the current character */
export type DialogueLine = NonConditionalDialogueLine | ConditionalLine;

/** Dialogue line excluding conditional */
export type NonConditionalDialogueLine =
  | AssignmentLine
  | StdinLine
  | StdoutLine
  | GotoLine
  | StackPushLine
  | StackPopLine
  | QuestionLine;

/** Dialogue line representing an assignment operation */
export type AssignmentLine = {
  type: "assign";
  value: Expression;
  range: DocumentRange;
};

/** Dialogue line representing an STDOUT operation */
export type StdoutLine = {
  type: "stdout";
  outType: "num" | "char";
  range: DocumentRange;
};

/** Dialogue line representing an STDIN operation */
export type StdinLine = {
  type: "stdin";
  inType: "num" | "char";
  range: DocumentRange;
};

/** Dialogue line representing a goto operation */
export type GotoLine = {
  type: "goto";
  targetType: "act" | "scene";
  target: RomanNumeral;
  range: DocumentRange;
};

/** Dialogue line representing a stack push */
export type StackPushLine = {
  type: "stack-push";
  expr: Expression;
  range: DocumentRange;
};

/** Dialogue line representing a stack pop */
export type StackPopLine = {
  type: "stack-pop";
  range: DocumentRange;
};

/** Dialogue line representing a question */
export type QuestionLine = {
  type: "question";
  comparator: ComparisonOperator;
  lhs: Expression;
  rhs: Expression;
  range: DocumentRange;
};

/** Dialogue line representing a conditional (`If so/not, ...`) */
export type ConditionalLine = {
  type: "conditional";
  invert: boolean;
  consequent: NonConditionalDialogueLine;
  range: DocumentRange;
};

/** Comparison operator used in a question */
export type ComparisonOperator = {
  invert?: boolean;
  type: "==" | ">" | "<";
};

/** Verbal or simple constants evaluate to number */
export type Constant = {
  type: "constant";
  value: number;
};

/** Name of a character */
export type Character = {
  type: "character";
  name: string;
};

/** Reference to a character with pronoun/reflexive */
export type CharacterRef = {
  type: "characterRef";
  ref: "first" | "second";
};

/** Leaf of an expression tree */
export type AtomicExpression = Constant | Character | CharacterRef;

/** Expression with binary operator */
export type BinaryExpression = {
  type: "binary";
  opType: "+" | "-" | "*" | "/" | "%";
  lhs: Expression;
  rhs: Expression;
};

/** Expression with unary operator */
export type UnaryExpression = {
  type: "unary";
  opType: "!" | "sq" | "cube" | "sqrt" | "twice";
  operand: Expression;
};

/** Root of an expression tree or subtree */
export type Expression = AtomicExpression | BinaryExpression | UnaryExpression;
