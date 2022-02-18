import { DocumentRange, LanguageEngine, StepExecutionResult } from "../types";
import { RuntimeError } from "../worker-errors";
import { CharacterBag, RS } from "./common";
import InputStream from "./input-stream";
import { Parser } from "./parser";
import * as V from "./parser/visitor-types";

/** Runtime program counter */
type PC = {
  act: number; // Current act, indexed in parsing order
  scene: number; // Current scene, indexed in parsing order in the current act
  itemIdx: number; // Current item, indexed in parsing order in the current scene
};

/** List of character currently on stage */
type Stage = string[];

const DEFAULT_QN_RESULT: boolean | null = null;
const DEFAULT_SPEAKER: string | null = null;
const DEFAULT_STAGE = (): Stage => [];
const DEFAULT_AST = (): V.Program => ({ characters: [], acts: [] });
const DEFAULT_CHARBAG = (): CharacterBag => ({});
const DEFAULT_PC = (): PC => ({ act: 0, scene: 0, itemIdx: -1 });

export default class ShakespeareLanguageEngine implements LanguageEngine<RS> {
  private _parser: Parser = new Parser();
  private _charBag: CharacterBag = DEFAULT_CHARBAG();
  private _ast: V.Program = DEFAULT_AST();
  private _pc: PC = DEFAULT_PC();
  private _stage: Stage = DEFAULT_STAGE();
  private _currSpeaker: string | null = DEFAULT_SPEAKER;
  private _qnResult: boolean | null = DEFAULT_QN_RESULT;
  private _input: InputStream = new InputStream("");

  resetState() {
    this._charBag = DEFAULT_CHARBAG();
    this._ast = DEFAULT_AST();
    this._pc = DEFAULT_PC();
    this._stage = DEFAULT_STAGE();
    this._currSpeaker = DEFAULT_SPEAKER;
    this._qnResult = DEFAULT_QN_RESULT;
    this._input = new InputStream("");
  }

  validateCode(code: string) {
    this._parser.parse(code);
  }

  prepare(code: string, input: string) {
    this._ast = this._parser.parse(code);
    this._input = new InputStream(input);
    // Populate the character bag
    for (const character of this._ast.characters)
      this._charBag[character.name] = { value: 0, stack: [] };
    // Set the PC to first act, first scene, first item
    this._pc = { act: 0, scene: 0, itemIdx: 0 };
  }

  executeStep(): StepExecutionResult<RS> {
    let output: string | undefined = undefined;
    let finished: boolean = false;

    // Execute the next step
    if (this._pc.itemIdx !== -1) {
      const item = this.getCurrentItem();
      output = this.processSceneItem(item);
      finished = this.validateAndWrapPC();
    } else {
      this.setCharacterBag();
      this._pc.itemIdx += 1;
    }

    // Set the next value of current speaker and prepare
    // location of next step
    let nextStepLocation = null;
    if (!finished) {
      const item = this.getCurrentItem();
      nextStepLocation = this.getItemRange(item);
      if (item.type !== "dialogue-item") this._currSpeaker = null;
      else this._currSpeaker = item.speaker.name;
    } else this._currSpeaker = null;

    // Prepare renderer state, and return
    const rendererState: RS = {
      characterBag: this._charBag,
      charactersOnStage: this._stage,
      currentSpeaker: this._currSpeaker,
      questionState: this._qnResult,
    };
    return { rendererState, nextStepLocation, output };
  }

  /** Get the DocumentRange of a scene item */
  private getItemRange(item: V.SceneSectionItem): DocumentRange {
    if (item.type === "dialogue-item") return item.line.range;
    else return item.range;
  }

  /** Create and set the character bag from the character intros in AST */
  private setCharacterBag() {
    for (const character of this._ast.characters)
      this._charBag[character.name] = { value: 0, stack: [] };
  }

  /**
   * Get item pointed to by current PC. Ensure that current PC
   * points to a valid scene item.
   */
  private getCurrentItem(): V.SceneSectionItem {
    const currAct = this._ast.acts[this._pc.act];
    const currScene = currAct.scenes[this._pc.scene];
    return currScene.items[this._pc.itemIdx];
  }

  /** Process a single item of a scene */
  private processSceneItem(item: V.SceneSectionItem): string | undefined {
    if (item.type === "entry" || item.type === "exit")
      this.processEntryExit(item);
    else if (item.type === "dialogue-item") {
      return this.processDialogueLine(item.line);
    } else throw new Error("Unknown scene item type");
  }

  /** Process a single dialogue line */
  private processDialogueLine(line: V.DialogueLine): string | undefined {
    if (line.type === "conditional") return this.processConditional(line);
    this._qnResult = null; // Clear question result
    if (line.type === "assign") this.processAssignment(line);
    else if (line.type === "stdin") this.processStdinLine(line);
    else if (line.type === "stdout") return this.processStdoutLine(line);
    else if (line.type === "goto") this.processGotoLine(line);
    else if (line.type === "stack-push") this.processStackPush(line);
    else if (line.type === "stack-pop") this.processStackPop(line);
    else if (line.type === "question") this.processQuestion(line);
    else throw new Error("Unknown dialogue type");
  }

  /** Process assignment dialogue line */
  private processAssignment(line: V.AssignmentLine): void {
    this.incrementPC();
    const other = this.dereference("second");
    const value = this.evaluateExpression(line.value);
    this._charBag[other].value = value;
  }

  /** Process STDIN dialogue line */
  private processStdinLine(line: V.StdinLine): void {
    this.incrementPC();
    let value = 0;
    if (line.inType === "num") value = this._input.getNumber();
    else value = this._input.getChar();
    const other = this.dereference("second");
    this._charBag[other].value = value;
  }

  /** Process STDOUT dialogue line */
  private processStdoutLine(line: V.StdoutLine): string {
    this.incrementPC();
    const other = this.dereference("second");
    const value = this._charBag[other].value;
    if (line.outType === "num") return value.toString();
    else return String.fromCharCode(value);
  }

  /** Process goto dialogue line and update program counter */
  private processGotoLine(line: V.GotoLine): void {
    if (line.targetType === "act") {
      // ======= JUMP TO ACT ========
      const actIdx = this._ast.acts.findIndex((act) => act.id === line.target);
      if (actIdx === -1) throw new RuntimeError(`Unknown act '${line.target}'`);
      this._pc = { act: actIdx, scene: 0, itemIdx: 0 };
    } else {
      // ======= JUMP TO SCENE ========
      const actIdx = this._pc.act;
      const sceneIdx = this._ast.acts[actIdx].scenes.findIndex(
        (scene) => scene.id === line.target
      );
      if (sceneIdx === -1)
        throw new RuntimeError(`Unknown scene '${line.target}'`);
      this._pc = { act: actIdx, scene: sceneIdx, itemIdx: 0 };
    }
  }

  /** Process stack push dialogue line */
  private processStackPush(line: V.StackPushLine): void {
    this.incrementPC();
    const other = this.dereference("second");
    const value = this.evaluateExpression(line.expr);
    this._charBag[other].stack.push(value);
  }

  /** Process stack pop dialogue line */
  private processStackPop(_line: V.StackPopLine): void {
    this.incrementPC();
    const other = this.dereference("second");
    const value = this._charBag[other].stack.pop();
    if (value == null)
      throw new RuntimeError(`Character '${other}' has empty stack`);
    this._charBag[other].value = value;
  }

  /** Process question dialogue line */
  private processQuestion(line: V.QuestionLine): void {
    this.incrementPC();
    const lhsValue = this.evaluateExpression(line.lhs);
    const rhsValue = this.evaluateExpression(line.rhs);
    let answer = true;
    const op = line.comparator.type;
    if (op === "==") answer = lhsValue === rhsValue;
    else if (op === "<") answer = lhsValue < rhsValue;
    else if (op === ">") answer = lhsValue > rhsValue;
    if (line.comparator.invert) answer = !answer;
    this._qnResult = answer;
  }

  /** Process conditional dialogue line */
  private processConditional(line: V.ConditionalLine): string | undefined {
    if (this._qnResult == null)
      throw new RuntimeError("Question not asked before conditional");
    const answer = line.invert ? !this._qnResult : this._qnResult;
    this._qnResult = null; // Clear question result
    if (answer) return this.processDialogueLine(line.consequent);
    else this.incrementPC();
  }

  /** Add or remove characters from the stage as per the clause */
  private processEntryExit(clause: V.EntryExitClause): void {
    this.incrementPC();
    const { characters, type } = clause;
    if (type === "entry") {
      // ========= ENTRY CLAUSE =========
      for (const char of characters!) {
        if (this._stage.includes(char.name)) {
          // Entry of character already on stage
          throw new RuntimeError(`Character '${char.name}' already on stage`);
        } else if (this._stage.length === 2) {
          // Stage is full capacity
          throw new RuntimeError("Too many characters on stage");
        } else this._stage.push(char.name);
      }
    } else {
      // ========= EXIT CLAUSE =========
      if (characters != null) {
        for (const char of characters) {
          if (!this._stage.includes(char.name)) {
            // Exit of character not on stage
            throw new RuntimeError(`Character '${char.name}' is not on stage`);
          } else this._stage.splice(this._stage.indexOf(char.name), 1);
        }
      } else {
        // Exit of all characters
        this._stage = [];
      }
    }
  }

  /**
   * Increment program counter. Does not wrap to next act or scene -
   * that is handled in the `executeStep` method.
   */
  private incrementPC(): void {
    this._pc.itemIdx += 1;
  }

  /**
   * Check that the PC is in scene bounds. If not,
   * wrap it over to the next scene or act.
   * @returns True if program has ended, false otherwise
   */
  private validateAndWrapPC(): boolean {
    const { act, scene, itemIdx } = this._pc;
    const currentScene = this._ast.acts[act].scenes[scene];
    if (itemIdx >= currentScene.items.length) {
      if (scene === this._ast.acts[act].scenes.length - 1) {
        // Check if we're at the end of the program
        if (act === this._ast.acts.length - 1) return true;
        // Wrap to the next act
        this._pc.act += 1;
        this._pc.scene = 0;
        this._pc.itemIdx = 0;
      } else {
        // Wrap to the next scene
        this._pc.scene += 1;
        this._pc.itemIdx = 0;
      }
    }
    return false;
  }

  /** Dereference what character "you" or "me" refers to */
  private dereference(type: "first" | "second"): string {
    if (type === "first") {
      // Current speaker is the required character
      if (!this._currSpeaker) throw new RuntimeError("No active speaker");
      else return this._currSpeaker;
    } else {
      // The other character is the required character
      if (this._stage.length === 1)
        throw new RuntimeError("Only one character on stage");
      return this._stage.find((char) => char !== this._currSpeaker)!;
    }
  }

  /**
   * Evaluate the given expression and return the numeric result.
   * @param expr Expression to evaluate
   * @returns Numeric value of the expression
   */
  private evaluateExpression(expr: V.Expression): number {
    if (expr.type === "constant") return expr.value;
    else if (expr.type === "character") {
      // === NAMED REFERENCE TO CHARACTER ===
      const { name } = expr;
      if (!this._charBag.hasOwnProperty(name))
        throw new RuntimeError(`Character '${name}' not found`);
      return this._charBag[name].value;
    } else if (expr.type === "characterRef") {
      // === PRONOUN REFERENCE TO CHARACTER ===
      const name = this.dereference(expr.ref);
      return this._charBag[name].value;
    } else if (expr.type === "binary") {
      // ======= BINARY EXPRESSION =======
      const { opType, lhs, rhs } = expr;
      const lhsValue = this.evaluateExpression(lhs);
      const rhsValue = this.evaluateExpression(rhs);
      if (opType === "+") return lhsValue + rhsValue;
      if (opType === "-") return lhsValue - rhsValue;
      if (opType === "*") return lhsValue * rhsValue;
      // For division and modulus, we need to check for division by zero
      if (rhsValue === 0) throw new RuntimeError("Division by zero");
      if (opType === "/") return Math.floor(lhsValue / rhsValue);
      if (opType === "%") return lhsValue % rhsValue;
      throw new Error(`Unknown operator '${opType}'`);
    } else if (expr.type === "unary") {
      // ======== UNARY EXPRESSION ========
      const { opType, operand } = expr;
      const operandValue = this.evaluateExpression(operand);
      if (opType === "!") return this.factorial(operandValue);
      if (opType === "sq") return operandValue ** 2;
      if (opType === "cube") return operandValue ** 3;
      if (opType === "sqrt") return Math.floor(Math.sqrt(operandValue));
      if (opType === "twice") return 2 * operandValue;
      throw new Error(`Unknown operator '${opType}'`);
    } else throw new Error(`Unknown expression type`);
  }

  /** Compute the factorial of a number */
  private factorial(n: number): number {
    if (n < 0)
      throw new RuntimeError("Cannot compute factorial of negative number");
    let answer = 1;
    for (let i = 1; i <= n; ++i) answer *= i;
    return answer;
  }
}
