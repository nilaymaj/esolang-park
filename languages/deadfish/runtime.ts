import { DocumentRange, LanguageEngine, StepExecutionResult } from "../types";
import { DFAstStep, DFRS, DF_OP } from "./constants";

// Default values for internal states
// Factories are used to create new objects on reset
const DEFAULT_AST = (): DFAstStep[] => [];
const DEFAULT_PC = -1;
const DEFAULT_VALUE = 0;

// Instruction characters
const OP_CHARS = Object.values(DF_OP);

export default class DeadfishLanguageEngine implements LanguageEngine<DFRS> {
  private _ast: DFAstStep[] = DEFAULT_AST();
  private _value: number = DEFAULT_VALUE;
  private _pc: number = DEFAULT_PC;

  resetState() {
    this._ast = DEFAULT_AST();
    this._value = DEFAULT_VALUE;
    this._pc = DEFAULT_PC;
  }

  validateCode(code: string) {
    this.parseCode(code);
  }

  prepare(code: string, _input: string) {
    this._ast = this.parseCode(code);
  }

  executeStep(): StepExecutionResult<DFRS> {
    // Execute and update program counter
    let output: string | undefined = undefined;
    if (this._pc !== -1) {
      const astStep = this._ast[this._pc];
      output = this.processOp(astStep.instr);
    }
    this._pc += 1;

    // Prepare location of next step
    let nextStepLocation: DocumentRange | null = null;
    if (this._pc < this._ast.length) {
      const { line, char } = this._ast[this._pc].location;
      nextStepLocation = { startLine: line, startCol: char, endCol: char + 1 };
    }

    // Prepare and return execution result
    const rendererState = { value: this._value };
    return { rendererState, nextStepLocation, output };
  }

  private parseCode(code: string) {
    const ast: DFAstStep[] = [];

    // For each line...
    code.split("\n").forEach((line, lIdx) => {
      // For each character of this line...
      line.split("").forEach((char, cIdx) => {
        if (OP_CHARS.includes(char as DF_OP)) {
          ast.push({
            instr: char as DF_OP,
            location: { line: lIdx, char: cIdx },
          });
        }
      });
    });

    return ast;
  }

  /**
   * Process the given instruction and return string to push to output if any.
   *
   * @param instr Instruction to apply
   * @returns String to append to output, if any
   */
  private processOp(instr: DF_OP): string | undefined {
    if (instr === DF_OP.INCR) ++this._value;
    else if (instr === DF_OP.DECR) --this._value;
    else if (instr === DF_OP.SQ) this._value = this._value * this._value;
    else if (instr === DF_OP.OUT) return this._value.toString();
    else throw new Error("Invalid instruction");

    if (this._value === -1 || this._value === 256) this._value = 0;
  }
}
