import { DocumentRange, LanguageEngine, StepExecutionResult } from "../types";
import { ParseError, RuntimeError } from "../worker-errors";
import { BFAstStep, BFInstruction, BFRS, BF_OP } from "./common";

// Default values for internal states
// Factories are used to create new objects on reset
const DEFAULT_AST = (): BFAstStep[] => [];
const DEFAULT_PTR = 0;
const DEFAULT_PC = -1;
const DEFAULT_TAPE = (): { [k: number]: number } => ({});
const DEFAULT_INPUT: string = "";

/* Value boundaries for Brainfuck cells */
const VALUE_WINDOW = {min: -128, max: 127};

// Instruction characters
const OP_CHARS = Object.values(BF_OP);

export default class BrainfuckLanguageEngine implements LanguageEngine<BFRS> {
  private _ast: BFAstStep[] = DEFAULT_AST();
  private _ptr: number = DEFAULT_PTR;
  private _tape: { [k: number]: number } = DEFAULT_TAPE();
  private _input: string = DEFAULT_INPUT;
  private _pc: number = DEFAULT_PC;

  resetState() {
    this._ast = DEFAULT_AST();
    this._ptr = DEFAULT_PTR;
    this._tape = DEFAULT_TAPE();
    this._input = DEFAULT_INPUT;
    this._pc = DEFAULT_PC;
  }

  validateCode(code: string) {
    this.parseCode(code);
  }

  prepare(code: string, input: string) {
    this._input = input;
    this._ast = this.parseCode(code);
  }

  executeStep(): StepExecutionResult<BFRS> {
    // Execute and update program counter
    let output: string | undefined = undefined;
    if (this._pc !== -1) {
      const astStep = this._ast[this._pc];
      const opResult = this.processOp(astStep.instr);
      this._pc = opResult?.newPc == null ? this._pc + 1 : opResult.newPc;
      output = opResult?.output;
    } else this._pc += 1;

    // Prepare location of next step
    let nextStepLocation: DocumentRange | null = null;
    if (this._pc < this._ast.length) {
      const { line, char } = this._ast[this._pc].location;
      nextStepLocation = { startLine: line, startCol: char, endCol: char + 1 };
    }

    // Prepare and return execution result
    const rendererState = { tape: this._tape, pointer: this._ptr };
    return { rendererState, nextStepLocation, output };
  }

  private parseCode(code: string) {
    const ast: BFAstStep[] = [];

    // Stack to maintain loop counts. Element of stack denotes
    // program counter for loop-opening instruction.
    const loopStack: number[] = [];

    // For each line...
    code.split("\n").forEach((line, lIdx) => {
      // For each character of this line...
      line.split("").forEach((char, cIdx) => {
        // Ignore if the character is not an operation
        if (!OP_CHARS.includes(char as BF_OP)) return;

        // Update loop-tracking stack if it's a loop-char
        let jumpTarget: number | undefined = undefined;
        if (char === BF_OP.LOOPIN) {
          // Push loop start into stack
          // Opposite end location will be added at loop close
          loopStack.push(ast.length);
        } else if (char === BF_OP.LOOPOUT) {
          // Check and add jump target to loop-opener
          jumpTarget = loopStack.pop();
          if (jumpTarget == null)
            throw new ParseError("Unmatched ']'", {
              startLine: lIdx,
              startCol: cIdx,
              endCol: cIdx + 1,
            });
          // Add closing end location to loop-opener
          ast[jumpTarget].instr.param = ast.length;
        }

        // Add instruction to AST
        ast.push({
          instr: { type: char as BF_OP, param: jumpTarget },
          location: { line: lIdx, char: cIdx },
        });
      });
    });

    // Ensure that we ended with an empty loop stack
    if (loopStack.length !== 0) {
      const opener = loopStack[loopStack.length - 1];
      const location = ast[opener].location;
      throw new ParseError("Unmatched '['", {
        startLine: location.line,
        startCol: location.char,
        endCol: location.char + 1,
      });
    }

    return ast;
  }

  /**
   * Process the given instruction and return the updated program counter and
   * any output to send to stdout.
   *
   * If program counter is not returned, counter should be incremented by 1.
   *
   * @param instr Instruction to apply
   * @returns Optional fields for new program counter and step output
   */
  private processOp(
    instr: BFInstruction
  ): { newPc?: number; output?: string } | void {
    // Pointer-shift operations
    if (instr.type === BF_OP.LEFT) this.decrementPtr();
    else if (instr.type === BF_OP.RIGHT) this.incrementPtr();
    // Current cell modifiers
    else if (instr.type === BF_OP.INCR) this.incrementCell(this._ptr);
    else if (instr.type === BF_OP.DECR) this.decrementCell(this._ptr);
    // Input and output
    else if (instr.type === BF_OP.OUT) return { output: this.outputChar() };
    else if (instr.type === BF_OP.IN) this.inputChar();
    // Looping
    else if (instr.type === BF_OP.LOOPIN) {
      // Conditionally jump past loop-closer
      if (this.getCell(this._ptr) !== 0) return;
      return { newPc: instr.param! + 1 };
    } else if (instr.type === BF_OP.LOOPOUT) {
      // Conditionally jump to loop-opener
      if (this.getCell(this._ptr) === 0) return;
      return { newPc: instr.param };
    } else throw new Error("Unexpected instruction type");
  }

  /** Output character from current cell */
  private outputChar(): string {
    const code = this._tape[this._ptr];
    return String.fromCharCode(code);
  }

  /** Input character into current cell */
  private inputChar(): void {
    if (this._input.length === 0) {
      // EOF is treated as a zero
      this._tape[this._ptr] = 0;
    } else {
      // Pop first char of input and set to cell
      this._tape[this._ptr] = this._input.charCodeAt(0);
      this._input = this._input.slice(1);
    }
  }

  /** Get value of tape cell. Initializes cell if first use */
  private getCell(cellId: number): number {
    if (!this._tape[cellId]) this._tape[cellId] = 0;
    return this._tape[cellId];
  }

  /** Increment tape cell at specified location */
  private incrementCell(cellId: number): void {
    if (!this._tape[cellId]) this._tape[cellId] = 0;
    this._tape[cellId] += 1;
    if (this._tape[cellId] === VALUE_WINDOW.max + 1) this._tape[cellId] = VALUE_WINDOW.min;
  }

  /** Decrement tape cell at specified location */
  private decrementCell(cellId: number): void {
    if (!this._tape[cellId]) this._tape[cellId] = 0;
    this._tape[cellId] -= 1;
    if (this._tape[cellId] === VALUE_WINDOW.min - 1) this._tape[cellId] = VALUE_WINDOW.max;
  }

  /** Move the tape pointer one cell to the right */
  private incrementPtr(): void {
    this._ptr += 1;
    this.getCell(this._ptr); // Init cell if required
  }

  /** Move the tape pointer one cell to the left */
  private decrementPtr(): void {
    if (this._ptr <= 0) throw new RuntimeError("Tape pointer out of bounds");
    this._ptr -= 1;
    this.getCell(this._ptr); // Init cell if required
  }
}
