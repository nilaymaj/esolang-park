import { CstNode, CstNodeLocation } from "chevrotain";
import * as C from "./cst";
import * as V from "./visitor-types";
import { ShakespeareParser } from "./parser";
import { ParseError } from "../../worker-errors";
import { DocumentRange } from "../../types";

const parserInstance = new ShakespeareParser();
const BaseShakespeareVisitor = parserInstance.getBaseCstVisitorConstructor();

export class ShakespeareVisitor
  extends BaseShakespeareVisitor
  implements V.ShakespeareVisitorTypes
{
  /**
   * Characters of the program currently being visited. This field is populated
   * in the `program` method, and then read by rule visitors for validating
   * character names used in the program.
   */
  private _characters: V.Character[] = [];

  constructor() {
    super();
    // Visitor validation throws error for utility methods. There
    // doesn't seem to be another way to allow private methods.
    // this.validateVisitor();
  }

  /**
   * Type-safe wrapper around Chevrotain's `visit` function.
   * @param node CST node to visit
   * @returns Visit result of node
   */
  private visitNode<T extends CstNode>(
    node: T
    // @ts-ignore TS complains, but does the job anyway
  ): ReturnType<V.ShakespeareVisitorTypes[T["name"]]> {
    return this.visit(node);
  }

  /**
   * Convert character name in source code to uniform character name
   * @param image Character name used in source code
   */
  private toCharacterId(image: string): string {
    return image // "the \n Ghost" ...
      .split(/[\s\n]+/) // ... -> ["the", "Ghost"]
      .map((s) => s[0].toUpperCase() + s.slice(1)) // ... -> ["The", "Ghost"]
      .join(" "); // ... -> "The Ghost"
  }

  /**
   * Convert a Chevrotain location object to a DocumentRange. Note
   * that this assumes that the Chevrotain location object is
   * fully populated with no undefined fields.
   */
  private toRange(cstLocation: CstNodeLocation): DocumentRange {
    const startLine = (cstLocation.startLine || 1) - 1;
    const endLine = cstLocation.endLine && cstLocation.endLine - 1;
    const startCol = cstLocation.startColumn && cstLocation.startColumn - 1;
    const endCol = cstLocation.endColumn; // Chevrotain `endColumn` is inclusive
    return { startLine, endLine, startCol, endCol };
  }

  /**
   * Creates DocumentRange representing the range from the starting token to the
   * ending token, both inclusive.
   * @param start Range of the starting token
   * @param end Range of the ending token
   */
  private joinAndGetRange(
    start: DocumentRange,
    end: DocumentRange
  ): DocumentRange {
    return {
      startLine: start.startLine,
      startCol: start.startCol,
      endLine: end.endLine,
      endCol: end.endCol,
    };
  }

  /**
   * Check if usage of a character name is valid, ie. if the name is
   * declared at the top of the program.
   * @param character Character to check
   * @param range Location of the character usage in source code
   */
  private validateCharacter(
    character: V.Character,
    range: DocumentRange
  ): void {
    const charId = this.toCharacterId(character.name);
    if (!this._characters.find((c) => c.name === charId)) {
      throw new ParseError(
        `Character '${character.name}' is not declared`,
        range
      );
    }
  }

  program(children: C.ProgramCstChildren): V.Program {
    if (children.characterIntro == null) children.characterIntro = [];
    if (children.actSection == null) children.actSection = [];
    const chars = children.characterIntro.map((c) => this.visitNode(c));
    this._characters = chars; // this must run before rest of program is visited
    const acts = children.actSection.map((a) => this.visitNode(a));
    return { characters: chars, acts };
  }

  programTitle(): null {
    throw new Error("Method not implemented.");
  }

  characterIntro(children: C.CharacterIntroCstChildren): V.CharacterIntro {
    const charId = this.toCharacterId(children.Character[0].image);
    return { type: "character", name: charId };
  }

  actHeading(children: C.ActHeadingCstChildren): V.ActHeading {
    return children.RomanNumeral[0].image.toUpperCase();
  }

  sceneHeading(children: C.SceneHeadingCstChildren): V.SceneHeading {
    return children.RomanNumeral[0].image.toUpperCase();
  }

  entrance(children: C.EntranceCstChildren): V.EntryExitClause {
    const chars: V.Character[] = children.Character.map((c) => ({
      type: "character",
      name: this.toCharacterId(c.image),
    }));
    const range = this.joinAndGetRange(
      this.toRange(children.SquareBracketOpen[0]),
      this.toRange(children.SquareBracketClose[0])
    );
    chars.forEach((c) => this.validateCharacter(c, range));
    return { type: "entry", characters: chars, range };
  }

  exit(children: C.ExitCstChildren): V.EntryExitClause {
    const charId = this.toCharacterId(children.Character[0].image);
    const range = this.joinAndGetRange(
      this.toRange(children.SquareBracketOpen[0]),
      this.toRange(children.SquareBracketClose[0])
    );
    this.validateCharacter({ type: "character", name: charId }, range);
    return {
      type: "exit",
      characters: [{ type: "character", name: charId }],
      range,
    };
  }

  multiExit(children: C.MultiExitCstChildren): V.EntryExitClause {
    const range = this.joinAndGetRange(
      this.toRange(children.SquareBracketOpen[0]),
      this.toRange(children.SquareBracketClose[0])
    );

    // `[Exeunt]`: all characters exit
    if (children.Character == null)
      return { type: "exit", characters: null, range };

    const chars: V.Character[] = children.Character.map((c) => ({
      type: "character",
      name: this.toCharacterId(c.image),
    }));
    chars.forEach((c) => this.validateCharacter(c, range));
    return { type: "exit", characters: chars, range };
  }

  entryExitClause(children: C.EntryExitClauseCstChildren): V.EntryExitClause {
    if (children.entrance) return this.visitNode(children.entrance[0]);
    else if (children.exit) return this.visitNode(children.exit[0]);
    else if (children.multiExit) return this.visitNode(children.multiExit[0]);
    else throw new Error("No matched subrule.");
  }

  actSection(children: C.ActSectionCstChildren): V.ActSection {
    if (children.sceneSection == null) children.sceneSection = [];
    const id = this.visitNode(children.actHeading[0]);
    const scenes = children.sceneSection.map((item) => this.visitNode(item));
    return { id, scenes };
  }

  sceneSection(children: C.SceneSectionCstChildren): V.SceneSection {
    if (children.sceneSectionChunk == null) children.sceneSectionChunk = [];
    const id = this.visitNode(children.sceneHeading[0]);
    const items = children.sceneSectionChunk.flatMap<V.SceneSectionItem>(
      (item) => {
        const itemAst = this.visitNode(item);
        if (itemAst.type !== "dialogue-set") return itemAst;
        // Flatten the dialogue set into list of dialogue items
        return itemAst.lines.map((line) => ({
          type: "dialogue-item",
          speaker: itemAst.speaker,
          line,
        }));
      }
    );
    return { id, items };
  }

  sceneSectionChunk(
    children: C.SceneSectionChunkCstChildren
  ): V.SceneSectionChunk {
    if (children.dialogueSet) return this.visitNode(children.dialogueSet[0]);
    else if (children.entryExitClause)
      return this.visitNode(children.entryExitClause[0]);
    else throw new Error("No matched subrule.");
  }

  speakerClause(children: C.SpeakerClauseCstChildren): V.SpeakerClause {
    const charId = this.toCharacterId(children.Character[0].image);
    this.validateCharacter(
      { type: "character", name: charId },
      this.toRange(children.Character[0])
    );
    return { type: "character", name: charId };
  }

  dialogueSet(children: C.DialogueSetCstChildren): V.DialogueSet {
    if (children.dialogueLine == null) children.dialogueLine = [];
    const speaker = this.visitNode(children.speakerClause[0]);
    const lines = children.dialogueLine.map((line) => this.visitNode(line));
    return { type: "dialogue-set", lines, speaker };
  }

  dialogueLine(children: C.DialogueLineCstChildren): V.DialogueLine {
    if (children.conditional) return this.visitNode(children.conditional[0]);
    else if (children.nonConditionalDialogueLine)
      return this.visitNode(children.nonConditionalDialogueLine[0]);
    else throw new Error("No matched subrule.");
  }

  nonConditionalDialogueLine(
    children: C.NonConditionalDialogueLineCstChildren
  ): V.NonConditionalDialogueLine {
    if (children.assignment) return this.visitNode(children.assignment[0]);
    else if (children.stdin) return this.visitNode(children.stdin[0]);
    else if (children.stdout) return this.visitNode(children.stdout[0]);
    else if (children.goto) return this.visitNode(children.goto[0]);
    else if (children.stackPush) return this.visitNode(children.stackPush[0]);
    else if (children.stackPop) return this.visitNode(children.stackPop[0]);
    else if (children.question) return this.visitNode(children.question[0]);
    else throw new Error("No matched subrule.");
  }

  ///////////////////////////////
  //////////  ENGLISH  //////////
  ///////////////////////////////

  noun(children: C.NounCstChildren) {
    if (children.NegativeNoun) return -1 as const;
    else if (children.NeutralNoun) return 0 as const;
    else if (children.PositiveNoun) return 1 as const;
    throw new Error("Invalid token found");
  }

  adjective(children: C.AdjectiveCstChildren) {
    if (children.NegativeAdjective) return -1 as const;
    else if (children.NeutralAdjective) return 0 as const;
    else if (children.PositiveAdjective) return 1 as const;
    throw new Error("Invalid token found");
  }

  possessive(children: C.PossessiveCstChildren) {
    if (children.FirstPersonPossessive) return "first" as const;
    else if (children.SecondPersonPossessive) return "second" as const;
    else if (children.ThirdPersonPossessive) return "third" as const;
    throw new Error("Invalid token found");
  }

  reflexive(children: C.ReflexiveCstChildren) {
    if (children.FirstPersonReflexive) return "first" as const;
    else if (children.SecondPersonReflexive) return "second" as const;
    throw new Error("Invalid token found");
  }

  comparative(children: C.ComparativeCstChildren) {
    if (children.NegativeComparative) return -1 as const;
    else if (children.PositiveComparative) return 1 as const;
    throw new Error("Invalid token found");
  }

  ///////////////////////////////
  /////////  STATEMENTS  ////////
  ///////////////////////////////

  assignment(children: C.AssignmentCstChildren): V.AssignmentLine {
    if (children.exclaimAssignment != null)
      return this.visitNode(children.exclaimAssignment[0]);
    else if (children.arithAssignment != null)
      return this.visitNode(children.arithAssignment[0]);
    else throw new Error("No matched subrule");
  }

  exclaimAssignment(
    children: C.ExclaimAssignmentCstChildren
  ): V.AssignmentLine {
    const startRange = this.toRange(children.SecondPerson[0]);
    const endRange = this.toRange(children.SentenceMark[0]);
    return {
      type: "assign",
      value: this.visitNode(children.unarticulatedVerbalConstant[0]),
      range: this.joinAndGetRange(startRange, endRange),
    };
  }

  arithAssignment(children: C.ArithAssignmentCstChildren): V.AssignmentLine {
    const startRange = this.toRange(children.SecondPerson[0]);
    const endRange = this.toRange(children.SentenceMark[0]);
    return {
      type: "assign",
      value: this.visitNode(children.expression[0]),
      range: this.joinAndGetRange(startRange, endRange),
    };
  }

  stdin(children: C.StdinCstChildren): V.StdinLine {
    const startToken =
      children.Open != null ? children.Open[0] : children.Listen![0];
    const endRange = this.toRange(children.SentenceMark[0]);
    return {
      type: "stdin",
      inType: children.Heart == null ? "char" : "num",
      range: this.joinAndGetRange(this.toRange(startToken), endRange),
    };
  }

  stdout(children: C.StdoutCstChildren): V.StdoutLine {
    const startToken =
      children.Open != null ? children.Open[0] : children.Speak![0];
    const endRange = this.toRange(children.SentenceMark[0]);
    return {
      type: "stdout",
      outType: children.Heart == null ? "char" : "num",
      range: this.joinAndGetRange(this.toRange(startToken), endRange),
    };
  }

  goto(children: C.GotoCstChildren): V.GotoLine {
    const startToken = children.Let != null ? children.Let[0] : children.We![0];
    const endRange = this.toRange(children.SentenceMark[0]);
    return {
      type: "goto",
      targetType: children.Act == null ? "scene" : "act",
      target: children.RomanNumeral[0].image.toUpperCase(),
      range: this.joinAndGetRange(this.toRange(startToken), endRange),
    };
  }

  stackPush(children: C.StackPushCstChildren): V.StackPushLine {
    return {
      type: "stack-push",
      expr: this.visitNode(children.expression[0]),
      range: this.joinAndGetRange(
        this.toRange(children.Remember[0]),
        this.toRange(children.SentenceMark[0])
      ),
    };
  }

  stackPop(children: C.StackPopCstChildren): V.StackPopLine {
    return {
      type: "stack-pop",
      range: this.joinAndGetRange(
        this.toRange(children.Recall[0]),
        this.toRange(children.SentenceMark[0])
      ),
    };
  }

  question(children: C.QuestionCstChildren): V.QuestionLine {
    const comparator = this.visitNode(children.comparator[0]);
    const lhs = this.visitNode(children.lhs[0]);
    const rhs = this.visitNode(children.rhs[0]);
    const range = this.joinAndGetRange(
      this.toRange(children.Be[0]),
      this.toRange(children.QuestionMark[0])
    );
    return { type: "question", comparator, lhs, rhs, range };
  }

  conditional(children: C.ConditionalCstChildren): V.ConditionalLine {
    const consequent = this.visitNode(children.nonConditionalDialogueLine[0]);
    const invert = children.Not != null;
    const startRange = this.toRange(children.If[0]);
    const range = this.joinAndGetRange(startRange, consequent.range);
    return { type: "conditional", consequent, invert, range };
  }

  comparator(children: C.ComparatorCstChildren): V.ComparisonOperator {
    const invert = children.Not != null;
    let comparator: V.ComparisonOperator = { type: "==" };
    if (children._asComparator) {
      comparator = this.visitNode(children._asComparator[0]);
    } else if (children._simpleComparator) {
      comparator = this.visitNode(children._simpleComparator[0]);
    } else if (children._moreLessComparator) {
      comparator = this.visitNode(children._moreLessComparator[0]);
    } else throw new Error("No matched subrule.");
    comparator.invert = invert;
    return comparator;
  }

  _asComparator(): V.ComparisonOperator {
    return { type: "==" };
  }

  _simpleComparator(
    children: C._simpleComparatorCstChildren
  ): V.ComparisonOperator {
    const comperative = this.visitNode(children.comparative[0]);
    return { type: comperative === -1 ? "<" : ">" };
  }

  _moreLessComparator(
    children: C._moreLessComparatorCstChildren
  ): V.ComparisonOperator {
    // "<": more <negative-adj> OR less <positive-adj>
    // ">": more <positive-adj> OR less <negative-adj>
    const adjValue = this.visitNode(children.adjective[0]);
    if (adjValue === 0)
      throw new ParseError(
        "Cannot use neutral adjective as a comparator",
        this.toRange(children.adjective[0].location!)
      );

    if (children.More) return { type: adjValue === -1 ? "<" : ">" };
    else if (children.Less) return { type: adjValue === -1 ? ">" : "<" };
    else throw new Error("Unexpected missing token");
  }

  ///////////////////////////////
  /////////  CONSTANTS  /////////
  ///////////////////////////////

  constant(children: C.ConstantCstChildren): V.Constant {
    if (children._simpleConstant != null)
      return this.visitNode(children._simpleConstant[0]);
    else if (children._verbalConstant != null)
      return this.visitNode(children._verbalConstant[0]);
    throw new Error("Unexpected missing subrule");
  }

  _simpleConstant(): V.Constant {
    return { type: "constant", value: 0 };
  }

  _verbalConstant(children: C._verbalConstantCstChildren): V.Constant {
    return this.visitNode(children.unarticulatedVerbalConstant[0]);
  }

  unarticulatedVerbalConstant(
    children: C.UnarticulatedVerbalConstantCstChildren
  ) {
    if (children.adjective == null) children.adjective = [];
    if (children.noun == null) throw new Error("Missing noun token");

    let nounValue = this.visitNode(children.noun[0]);
    if (nounValue === -1) {
      // Negative noun: all adjectives must be neutral or negative
      for (let i = 0; i < children.adjective.length; i++) {
        let adjectiveValue = this.visitNode(children.adjective[i]);
        if (adjectiveValue !== 0 && adjectiveValue !== -1)
          throw new ParseError(
            "Negative noun only allows negative adjectives",
            this.toRange(children.adjective[i].location!)
          );
      }
      const value = -1 * 2 ** children.adjective.length;
      return { type: "constant" as const, value };
    } else {
      // Positive noun: all adjectives must be neutral or positive
      for (let i = 0; i < children.adjective.length; i++) {
        let adjectiveValue = this.visitNode(children.adjective[i]);
        if (adjectiveValue !== 0 && adjectiveValue !== 1)
          throw new ParseError(
            "Positive noun only allows positive or neutral adjectives",
            this.toRange(children.adjective[i].location!)
          );
      }
      const value = 1 * 2 ** children.adjective.length;
      return { type: "constant" as const, value };
    }
  }

  ///////////////////////////////
  //////  EXPRESSION TREE  //////
  ///////////////////////////////

  expression(children: C.ExpressionCstChildren): V.Expression {
    if (children.atomicExpression != null)
      return this.visitNode(children.atomicExpression[0]);
    else if (children.sumExpression != null)
      return this.visitNode(children.sumExpression[0]);
    else if (children.differenceExpression != null)
      return this.visitNode(children.differenceExpression[0]);
    else if (children.productExpression != null)
      return this.visitNode(children.productExpression[0]);
    else if (children.quotientExpression != null)
      return this.visitNode(children.quotientExpression[0]);
    else if (children.remainderExpression != null)
      return this.visitNode(children.remainderExpression[0]);
    else if (children.factorialExpression != null)
      return this.visitNode(children.factorialExpression[0]);
    else if (children.squareExpression != null)
      return this.visitNode(children.squareExpression[0]);
    else if (children.cubeExpression != null)
      return this.visitNode(children.cubeExpression[0]);
    else if (children.squareRootExpression != null)
      return this.visitNode(children.squareRootExpression[0]);
    else if (children.twiceExpression != null)
      return this.visitNode(children.twiceExpression[0]);
    else throw new Error("No matched subrule");
  }

  atomicExpression(
    children: C.AtomicExpressionCstChildren
  ): V.AtomicExpression {
    if (children.Character != null) {
      const charId = this.toCharacterId(children.Character[0].image);
      this.validateCharacter(
        { type: "character", name: charId },
        this.toRange(children.Character[0])
      );
      return { type: "character" as const, name: charId };
    } else if (children.FirstPerson != null) {
      return { type: "characterRef", ref: "first" };
    } else if (children.SecondPerson != null) {
      return { type: "characterRef", ref: "second" };
    } else if (children.reflexive != null) {
      const ref = this.visitNode(children.reflexive[0]);
      return { type: "characterRef", ref };
    } else if (children.constant != null) {
      return this.visitNode(children.constant[0]);
    } else throw new Error("No matched subrule");
  }

  private visitBinaryExpression(
    code: V.BinaryExpression["opType"],
    lhs: C.ExpressionCstNode[],
    rhs: C.ExpressionCstNode[]
  ): V.BinaryExpression {
    if (lhs.length !== 1 || rhs.length !== 1)
      throw new Error("Unexpected operands in binary expression");
    return {
      type: "binary",
      opType: code,
      lhs: this.visitNode(lhs[0]),
      rhs: this.visitNode(rhs[0]),
    };
  }

  private visitUnaryExpression(
    code: V.UnaryExpression["opType"],
    expr: C.ExpressionCstNode[]
  ): V.UnaryExpression {
    if (expr.length !== 1)
      throw new Error("Unexpected operands in unary expression");
    return { type: "unary", opType: code, operand: this.visitNode(expr[0]) };
  }

  sumExpression(children: C.SumExpressionCstChildren): V.BinaryExpression {
    return this.visitBinaryExpression("+", children.lhs, children.rhs);
  }

  differenceExpression(
    children: C.DifferenceExpressionCstChildren
  ): V.BinaryExpression {
    return this.visitBinaryExpression("-", children.lhs, children.rhs);
  }

  productExpression(
    children: C.ProductExpressionCstChildren
  ): V.BinaryExpression {
    return this.visitBinaryExpression("*", children.lhs, children.rhs);
  }

  quotientExpression(
    children: C.QuotientExpressionCstChildren
  ): V.BinaryExpression {
    return this.visitBinaryExpression("/", children.lhs, children.rhs);
  }

  remainderExpression(
    children: C.RemainderExpressionCstChildren
  ): V.BinaryExpression {
    return this.visitBinaryExpression("%", children.lhs, children.rhs);
  }

  factorialExpression(
    children: C.FactorialExpressionCstChildren
  ): V.UnaryExpression {
    return this.visitUnaryExpression("!", children.expression);
  }

  squareExpression(children: C.SquareExpressionCstChildren): V.UnaryExpression {
    return this.visitUnaryExpression("sq", children.expression);
  }

  cubeExpression(children: C.CubeExpressionCstChildren): V.UnaryExpression {
    return this.visitUnaryExpression("cube", children.expression);
  }

  squareRootExpression(
    children: C.SquareRootExpressionCstChildren
  ): V.UnaryExpression {
    return this.visitUnaryExpression("sqrt", children.expression);
  }

  twiceExpression(children: C.TwiceExpressionCstChildren): V.UnaryExpression {
    return this.visitUnaryExpression("twice", children.expression);
  }
}
