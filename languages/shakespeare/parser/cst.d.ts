import type { CstNode, ICstVisitor, IToken } from "chevrotain";

export interface ProgramCstNode extends CstNode {
  name: "program";
  children: ProgramCstChildren;
}

export type ProgramCstChildren = {
  programTitle: ProgramTitleCstNode[];
  WhitespaceOrNewline?: IToken[];
  characterIntro?: CharacterIntroCstNode[];
  actSection?: ActSectionCstNode[];
};

export interface ProgramTitleCstNode extends CstNode {
  name: "programTitle";
  children: ProgramTitleCstChildren;
}

export type ProgramTitleCstChildren = {
  Word?: IToken[];
  Period: IToken[];
};

export interface CharacterIntroCstNode extends CstNode {
  name: "characterIntro";
  children: CharacterIntroCstChildren;
}

export type CharacterIntroCstChildren = {
  Character: IToken[];
  Comma: IToken[];
  Word?: IToken[];
  SentenceMark: IToken[];
};

export interface ActHeadingCstNode extends CstNode {
  name: "actHeading";
  children: ActHeadingCstChildren;
}

export type ActHeadingCstChildren = {
  Act: IToken[];
  RomanNumeral: IToken[];
  Colon: IToken[];
  Word?: IToken[];
  SentenceMark: IToken[];
};

export interface SceneHeadingCstNode extends CstNode {
  name: "sceneHeading";
  children: SceneHeadingCstChildren;
}

export type SceneHeadingCstChildren = {
  Scene: IToken[];
  RomanNumeral: IToken[];
  Colon: IToken[];
  Word?: IToken[];
  SentenceMark: IToken[];
};

export interface EntranceCstNode extends CstNode {
  name: "entrance";
  children: EntranceCstChildren;
}

export type EntranceCstChildren = {
  SquareBracketOpen: IToken[];
  Enter: IToken[];
  Character: IToken[];
  And?: IToken[];
  SquareBracketClose: IToken[];
};

export interface ExitCstNode extends CstNode {
  name: "exit";
  children: ExitCstChildren;
}

export type ExitCstChildren = {
  SquareBracketOpen: IToken[];
  Exit: IToken[];
  Character: IToken[];
  SquareBracketClose: IToken[];
};

export interface MultiExitCstNode extends CstNode {
  name: "multiExit";
  children: MultiExitCstChildren;
}

export type MultiExitCstChildren = {
  SquareBracketOpen: IToken[];
  Exeunt: IToken[];
  Character?: IToken[];
  And?: IToken[];
  SquareBracketClose: IToken[];
};

export interface EntryExitClauseCstNode extends CstNode {
  name: "entryExitClause";
  children: EntryExitClauseCstChildren;
}

export type EntryExitClauseCstChildren = {
  entrance?: EntranceCstNode[];
  exit?: ExitCstNode[];
  multiExit?: MultiExitCstNode[];
};

export interface ActSectionCstNode extends CstNode {
  name: "actSection";
  children: ActSectionCstChildren;
}

export type ActSectionCstChildren = {
  actHeading: ActHeadingCstNode[];
  sceneSection: SceneSectionCstNode[];
};

export interface SceneSectionCstNode extends CstNode {
  name: "sceneSection";
  children: SceneSectionCstChildren;
}

export type SceneSectionCstChildren = {
  sceneHeading: SceneHeadingCstNode[];
  sceneSectionChunk: SceneSectionChunkCstNode[];
};

export interface SceneSectionChunkCstNode extends CstNode {
  name: "sceneSectionChunk";
  children: SceneSectionChunkCstChildren;
}

export type SceneSectionChunkCstChildren = {
  entryExitClause?: EntryExitClauseCstNode[];
  dialogueSet?: DialogueSetCstNode[];
};

export interface SpeakerClauseCstNode extends CstNode {
  name: "speakerClause";
  children: SpeakerClauseCstChildren;
}

export type SpeakerClauseCstChildren = {
  Character: IToken[];
  Colon: IToken[];
};

export interface DialogueSetCstNode extends CstNode {
  name: "dialogueSet";
  children: DialogueSetCstChildren;
}

export type DialogueSetCstChildren = {
  speakerClause: SpeakerClauseCstNode[];
  dialogueLine: DialogueLineCstNode[];
};

export interface DialogueLineCstNode extends CstNode {
  name: "dialogueLine";
  children: DialogueLineCstChildren;
}

export type DialogueLineCstChildren = {
  conditional?: ConditionalCstNode[];
  nonConditionalDialogueLine?: NonConditionalDialogueLineCstNode[];
};

export interface NonConditionalDialogueLineCstNode extends CstNode {
  name: "nonConditionalDialogueLine";
  children: NonConditionalDialogueLineCstChildren;
}

export type NonConditionalDialogueLineCstChildren = {
  assignment?: AssignmentCstNode[];
  stdin?: StdinCstNode[];
  stdout?: StdoutCstNode[];
  goto?: GotoCstNode[];
  stackPush?: StackPushCstNode[];
  stackPop?: StackPopCstNode[];
  question?: QuestionCstNode[];
};

export interface NounCstNode extends CstNode {
  name: "noun";
  children: NounCstChildren;
}

export type NounCstChildren = {
  NegativeNoun?: IToken[];
  NeutralNoun?: IToken[];
  PositiveNoun?: IToken[];
};

export interface AdjectiveCstNode extends CstNode {
  name: "adjective";
  children: AdjectiveCstChildren;
}

export type AdjectiveCstChildren = {
  NegativeAdjective?: IToken[];
  NeutralAdjective?: IToken[];
  PositiveAdjective?: IToken[];
};

export interface PossessiveCstNode extends CstNode {
  name: "possessive";
  children: PossessiveCstChildren;
}

export type PossessiveCstChildren = {
  FirstPersonPossessive?: IToken[];
  SecondPersonPossessive?: IToken[];
  ThirdPersonPossessive?: IToken[];
};

export interface ReflexiveCstNode extends CstNode {
  name: "reflexive";
  children: ReflexiveCstChildren;
}

export type ReflexiveCstChildren = {
  FirstPersonReflexive?: IToken[];
  SecondPersonReflexive?: IToken[];
};

export interface ComparativeCstNode extends CstNode {
  name: "comparative";
  children: ComparativeCstChildren;
}

export type ComparativeCstChildren = {
  PositiveComparative?: IToken[];
  NegativeComparative?: IToken[];
};

export interface AssignmentCstNode extends CstNode {
  name: "assignment";
  children: AssignmentCstChildren;
}

export type AssignmentCstChildren = {
  exclaimAssignment?: ExclaimAssignmentCstNode[];
  arithAssignment?: ArithAssignmentCstNode[];
};

export interface ExclaimAssignmentCstNode extends CstNode {
  name: "exclaimAssignment";
  children: ExclaimAssignmentCstChildren;
}

export type ExclaimAssignmentCstChildren = {
  SecondPerson: IToken[];
  unarticulatedVerbalConstant: UnarticulatedVerbalConstantCstNode[];
  SentenceMark: IToken[];
};

export interface ArithAssignmentCstNode extends CstNode {
  name: "arithAssignment";
  children: ArithAssignmentCstChildren;
}

export type ArithAssignmentCstChildren = {
  SecondPerson: IToken[];
  Be: IToken[];
  As?: IToken[];
  adjective?: AdjectiveCstNode[];
  expression: ExpressionCstNode[];
  SentenceMark: IToken[];
};

export interface StdinCstNode extends CstNode {
  name: "stdin";
  children: StdinCstChildren;
}

export type StdinCstChildren = {
  Listen?: IToken[];
  To?: IToken[];
  SecondPersonPossessive?: IToken[];
  Heart?: IToken[];
  Open?: IToken[];
  Mind?: IToken[];
  SentenceMark: IToken[];
};

export interface StdoutCstNode extends CstNode {
  name: "stdout";
  children: StdoutCstChildren;
}

export type StdoutCstChildren = {
  Open?: IToken[];
  SecondPersonPossessive?: IToken[];
  Heart?: IToken[];
  Speak?: IToken[];
  Mind?: IToken[];
  SentenceMark: IToken[];
};

export interface GotoCstNode extends CstNode {
  name: "goto";
  children: GotoCstChildren;
}

export type GotoCstChildren = {
  Let?: IToken[];
  Us?: IToken[];
  We?: IToken[];
  Shall?: IToken[];
  Must?: IToken[];
  Return?: IToken[];
  Proceed?: IToken[];
  To: IToken[];
  Act?: IToken[];
  Scene?: IToken[];
  RomanNumeral: IToken[];
  SentenceMark: IToken[];
};

export interface StackPushCstNode extends CstNode {
  name: "stackPush";
  children: StackPushCstChildren;
}

export type StackPushCstChildren = {
  Remember: IToken[];
  expression: ExpressionCstNode[];
  SentenceMark: IToken[];
};

export interface StackPopCstNode extends CstNode {
  name: "stackPop";
  children: StackPopCstChildren;
}

export type StackPopCstChildren = {
  Recall: IToken[];
  Word?: IToken[];
  SentenceMark: IToken[];
};

export interface QuestionCstNode extends CstNode {
  name: "question";
  children: QuestionCstChildren;
}

export type QuestionCstChildren = {
  Be: IToken[];
  lhs: ExpressionCstNode[];
  comparator: ComparatorCstNode[];
  rhs: ExpressionCstNode[];
  QuestionMark: IToken[];
};

export interface ConditionalCstNode extends CstNode {
  name: "conditional";
  children: ConditionalCstChildren;
}

export type ConditionalCstChildren = {
  If: IToken[];
  So?: IToken[];
  Not?: IToken[];
  Comma: IToken[];
  nonConditionalDialogueLine: NonConditionalDialogueLineCstNode[];
};

export interface ComparatorCstNode extends CstNode {
  name: "comparator";
  children: ComparatorCstChildren;
}

export type ComparatorCstChildren = {
  Not?: IToken[];
  _asComparator?: _asComparatorCstNode[];
  _simpleComparator?: _simpleComparatorCstNode[];
  _moreLessComparator?: _moreLessComparatorCstNode[];
};

export interface _asComparatorCstNode extends CstNode {
  name: "_asComparator";
  children: _asComparatorCstChildren;
}

export type _asComparatorCstChildren = {
  As: IToken[];
  adjective: AdjectiveCstNode[];
};

export interface _simpleComparatorCstNode extends CstNode {
  name: "_simpleComparator";
  children: _simpleComparatorCstChildren;
}

export type _simpleComparatorCstChildren = {
  comparative: ComparativeCstNode[];
  Than: IToken[];
};

export interface _moreLessComparatorCstNode extends CstNode {
  name: "_moreLessComparator";
  children: _moreLessComparatorCstChildren;
}

export type _moreLessComparatorCstChildren = {
  More?: IToken[];
  Less?: IToken[];
  adjective: AdjectiveCstNode[];
  Than: IToken[];
};

export interface ConstantCstNode extends CstNode {
  name: "constant";
  children: ConstantCstChildren;
}

export type ConstantCstChildren = {
  _simpleConstant?: _simpleConstantCstNode[];
  _verbalConstant?: _verbalConstantCstNode[];
};

export interface _simpleConstantCstNode extends CstNode {
  name: "_simpleConstant";
  children: _simpleConstantCstChildren;
}

export type _simpleConstantCstChildren = {
  Nothing: IToken[];
};

export interface _verbalConstantCstNode extends CstNode {
  name: "_verbalConstant";
  children: _verbalConstantCstChildren;
}

export type _verbalConstantCstChildren = {
  Article?: IToken[];
  possessive?: PossessiveCstNode[];
  unarticulatedVerbalConstant: UnarticulatedVerbalConstantCstNode[];
};

export interface UnarticulatedVerbalConstantCstNode extends CstNode {
  name: "unarticulatedVerbalConstant";
  children: UnarticulatedVerbalConstantCstChildren;
}

export type UnarticulatedVerbalConstantCstChildren = {
  adjective?: AdjectiveCstNode[];
  noun: NounCstNode[];
};

export interface ExpressionCstNode extends CstNode {
  name: "expression";
  children: ExpressionCstChildren;
}

export type ExpressionCstChildren = {
  sumExpression?: SumExpressionCstNode[];
  differenceExpression?: DifferenceExpressionCstNode[];
  productExpression?: ProductExpressionCstNode[];
  quotientExpression?: QuotientExpressionCstNode[];
  remainderExpression?: RemainderExpressionCstNode[];
  factorialExpression?: FactorialExpressionCstNode[];
  squareExpression?: SquareExpressionCstNode[];
  squareRootExpression?: SquareRootExpressionCstNode[];
  cubeExpression?: CubeExpressionCstNode[];
  twiceExpression?: TwiceExpressionCstNode[];
  atomicExpression?: AtomicExpressionCstNode[];
};

export interface AtomicExpressionCstNode extends CstNode {
  name: "atomicExpression";
  children: AtomicExpressionCstChildren;
}

export type AtomicExpressionCstChildren = {
  Character?: IToken[];
  FirstPerson?: IToken[];
  SecondPerson?: IToken[];
  reflexive?: ReflexiveCstNode[];
  constant?: ConstantCstNode[];
};

export interface SumExpressionCstNode extends CstNode {
  name: "sumExpression";
  children: SumExpressionCstChildren;
}

export type SumExpressionCstChildren = {
  The: IToken[];
  Sum: IToken[];
  Of: IToken[];
  lhs: ExpressionCstNode[];
  And: IToken[];
  rhs: ExpressionCstNode[];
};

export interface DifferenceExpressionCstNode extends CstNode {
  name: "differenceExpression";
  children: DifferenceExpressionCstChildren;
}

export type DifferenceExpressionCstChildren = {
  The: IToken[];
  Difference: IToken[];
  Between: IToken[];
  lhs: ExpressionCstNode[];
  And: IToken[];
  rhs: ExpressionCstNode[];
};

export interface ProductExpressionCstNode extends CstNode {
  name: "productExpression";
  children: ProductExpressionCstChildren;
}

export type ProductExpressionCstChildren = {
  The: IToken[];
  Product: IToken[];
  Of: IToken[];
  lhs: ExpressionCstNode[];
  And: IToken[];
  rhs: ExpressionCstNode[];
};

export interface QuotientExpressionCstNode extends CstNode {
  name: "quotientExpression";
  children: QuotientExpressionCstChildren;
}

export type QuotientExpressionCstChildren = {
  The: IToken[];
  Quotient: IToken[];
  Between: IToken[];
  lhs: ExpressionCstNode[];
  And: IToken[];
  rhs: ExpressionCstNode[];
};

export interface RemainderExpressionCstNode extends CstNode {
  name: "remainderExpression";
  children: RemainderExpressionCstChildren;
}

export type RemainderExpressionCstChildren = {
  The: IToken[];
  Remainder: IToken[];
  Of: IToken[];
  Quotient: IToken[];
  Between: IToken[];
  lhs: ExpressionCstNode[];
  And: IToken[];
  rhs: ExpressionCstNode[];
};

export interface FactorialExpressionCstNode extends CstNode {
  name: "factorialExpression";
  children: FactorialExpressionCstChildren;
}

export type FactorialExpressionCstChildren = {
  The: IToken[];
  Factorial: IToken[];
  Of: IToken[];
  expression: ExpressionCstNode[];
};

export interface SquareExpressionCstNode extends CstNode {
  name: "squareExpression";
  children: SquareExpressionCstChildren;
}

export type SquareExpressionCstChildren = {
  The: IToken[];
  Square: IToken[];
  Of: IToken[];
  expression: ExpressionCstNode[];
};

export interface CubeExpressionCstNode extends CstNode {
  name: "cubeExpression";
  children: CubeExpressionCstChildren;
}

export type CubeExpressionCstChildren = {
  The: IToken[];
  Cube: IToken[];
  Of: IToken[];
  expression: ExpressionCstNode[];
};

export interface SquareRootExpressionCstNode extends CstNode {
  name: "squareRootExpression";
  children: SquareRootExpressionCstChildren;
}

export type SquareRootExpressionCstChildren = {
  The: IToken[];
  Square: IToken[];
  Root: IToken[];
  Of: IToken[];
  expression: ExpressionCstNode[];
};

export interface TwiceExpressionCstNode extends CstNode {
  name: "twiceExpression";
  children: TwiceExpressionCstChildren;
}

export type TwiceExpressionCstChildren = {
  Twice: IToken[];
  expression: ExpressionCstNode[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  program(children: ProgramCstChildren, param?: IN): OUT;
  programTitle(children: ProgramTitleCstChildren, param?: IN): OUT;
  characterIntro(children: CharacterIntroCstChildren, param?: IN): OUT;
  actHeading(children: ActHeadingCstChildren, param?: IN): OUT;
  sceneHeading(children: SceneHeadingCstChildren, param?: IN): OUT;
  entrance(children: EntranceCstChildren, param?: IN): OUT;
  exit(children: ExitCstChildren, param?: IN): OUT;
  multiExit(children: MultiExitCstChildren, param?: IN): OUT;
  entryExitClause(children: EntryExitClauseCstChildren, param?: IN): OUT;
  actSection(children: ActSectionCstChildren, param?: IN): OUT;
  sceneSection(children: SceneSectionCstChildren, param?: IN): OUT;
  sceneSectionChunk(children: SceneSectionChunkCstChildren, param?: IN): OUT;
  speakerClause(children: SpeakerClauseCstChildren, param?: IN): OUT;
  dialogueSet(children: DialogueSetCstChildren, param?: IN): OUT;
  dialogueLine(children: DialogueLineCstChildren, param?: IN): OUT;
  nonConditionalDialogueLine(children: NonConditionalDialogueLineCstChildren, param?: IN): OUT;
  noun(children: NounCstChildren, param?: IN): OUT;
  adjective(children: AdjectiveCstChildren, param?: IN): OUT;
  possessive(children: PossessiveCstChildren, param?: IN): OUT;
  reflexive(children: ReflexiveCstChildren, param?: IN): OUT;
  comparative(children: ComparativeCstChildren, param?: IN): OUT;
  assignment(children: AssignmentCstChildren, param?: IN): OUT;
  exclaimAssignment(children: ExclaimAssignmentCstChildren, param?: IN): OUT;
  arithAssignment(children: ArithAssignmentCstChildren, param?: IN): OUT;
  stdin(children: StdinCstChildren, param?: IN): OUT;
  stdout(children: StdoutCstChildren, param?: IN): OUT;
  goto(children: GotoCstChildren, param?: IN): OUT;
  stackPush(children: StackPushCstChildren, param?: IN): OUT;
  stackPop(children: StackPopCstChildren, param?: IN): OUT;
  question(children: QuestionCstChildren, param?: IN): OUT;
  conditional(children: ConditionalCstChildren, param?: IN): OUT;
  comparator(children: ComparatorCstChildren, param?: IN): OUT;
  _asComparator(children: _asComparatorCstChildren, param?: IN): OUT;
  _simpleComparator(children: _simpleComparatorCstChildren, param?: IN): OUT;
  _moreLessComparator(children: _moreLessComparatorCstChildren, param?: IN): OUT;
  constant(children: ConstantCstChildren, param?: IN): OUT;
  _simpleConstant(children: _simpleConstantCstChildren, param?: IN): OUT;
  _verbalConstant(children: _verbalConstantCstChildren, param?: IN): OUT;
  unarticulatedVerbalConstant(children: UnarticulatedVerbalConstantCstChildren, param?: IN): OUT;
  expression(children: ExpressionCstChildren, param?: IN): OUT;
  atomicExpression(children: AtomicExpressionCstChildren, param?: IN): OUT;
  sumExpression(children: SumExpressionCstChildren, param?: IN): OUT;
  differenceExpression(children: DifferenceExpressionCstChildren, param?: IN): OUT;
  productExpression(children: ProductExpressionCstChildren, param?: IN): OUT;
  quotientExpression(children: QuotientExpressionCstChildren, param?: IN): OUT;
  remainderExpression(children: RemainderExpressionCstChildren, param?: IN): OUT;
  factorialExpression(children: FactorialExpressionCstChildren, param?: IN): OUT;
  squareExpression(children: SquareExpressionCstChildren, param?: IN): OUT;
  cubeExpression(children: CubeExpressionCstChildren, param?: IN): OUT;
  squareRootExpression(children: SquareRootExpressionCstChildren, param?: IN): OUT;
  twiceExpression(children: TwiceExpressionCstChildren, param?: IN): OUT;
}
