import { LanguageEngine, StepExecutionResult } from "../types";
import { RS } from "./constants";

// Default values for internal engine parameters
const DEFAULT_AST: ASTStep[] = [];
const DEFAULT_VALUE = 0;
const DEFAULT_PC = -1;
const DEFAULT_INPUT: number[] = [];
const DEFAULT_INPUT_PC = 0;

/** Valid op keywords */
enum OP_KEYWORD {
  ADD = "ADD",
  SUBTRACT = "SUBTRACT",
  MULTIPLY = "MULTIPLY",
  DIVIDE = "DIVIDE",
}

/** Keyword used as value for using user input */
const inputKeyword = "input";

type ASTStep = {
  /** Line number the step is located on */
  index: number;

  /** Keyword and value of the step */
  step: { keyword: OP_KEYWORD; value: number | typeof inputKeyword };
};

class SampleLanguageEngine implements LanguageEngine<RS> {
  private _ast: ASTStep[] = DEFAULT_AST;
  private _value: number = DEFAULT_VALUE;
  private _pc: number = DEFAULT_PC;
  private _input: number[] = DEFAULT_INPUT;
  private _inputPc: number = DEFAULT_INPUT_PC;

  prepare(code: string, input: string): void {
    // Parse and load code
    const lines = code.split("\n").map((l) => l.trim());
    this._ast = lines.map((line, index) => {
      const astStep = this.parseLine(line);
      return { index: index + 1, step: astStep };
    });
    // Parse and load input
    const inputWords = input.split(/\s+/); // Split on whitespace
    this._input = inputWords.map((w) => parseInt(w, 10));
  }

  executeStep(): StepExecutionResult<RS> {
    if (this._pc === -1) {
      // Initial dummy step
      this._pc += 1;
      return {
        rendererState: { value: this._value },
        nextStepLocation: { line: 1 },
      };
    }

    // Execute step
    if (this._pc !== -1) {
      const step = this._ast[this._pc];
      this.processOp(step.step);
    }
    const rendererState = { value: this._value };

    // Increment pc and return
    this._pc += 1;
    if (this._pc >= this._ast.length) {
      // Program execution is complete
      return {
        rendererState,
        nextStepLocation: null,
        output: this._value.toString(),
      };
    } else {
      // Add location of next line to be executed
      const lineNum = this._ast[this._pc].index;
      return { rendererState, nextStepLocation: { line: lineNum } };
    }
  }

  resetState(): void {
    this._ast = DEFAULT_AST;
    this._pc = DEFAULT_PC;
    this._value = DEFAULT_VALUE;
    this._input = DEFAULT_INPUT;
    this._inputPc = DEFAULT_INPUT_PC;
  }

  private processOp(step: ASTStep["step"]) {
    // Handle user input
    let value = 0;
    if (step.value === "input") value = this._input[this._inputPc++];
    else value = step.value;

    // Modify runtime value according to instruction
    if (step.keyword === OP_KEYWORD.ADD) this._value += value;
    else if (step.keyword === OP_KEYWORD.SUBTRACT) this._value -= value;
    else if (step.keyword === OP_KEYWORD.MULTIPLY) this._value *= value;
    else if (step.keyword === OP_KEYWORD.DIVIDE) this._value /= value;
  }

  private parseLine = (line: string): ASTStep["step"] => {
    // Check that line has two words
    const words = line.split(" ");
    if (words.length !== 2) throw new Error("Invalid line");

    // Check that keyword is valid
    const [keyword, value] = words;
    if (!(keyword in OP_KEYWORD)) throw new Error("Invalid keyword");

    // Check that value is valid
    const valueAsNum = parseInt(value, 10);
    const isInvalidValue = value !== inputKeyword && Number.isNaN(valueAsNum);
    if (isInvalidValue) throw new Error("Invalid value");

    // Return as an AST step
    const validValue = value === inputKeyword ? inputKeyword : valueAsNum;
    return { keyword: keyword as OP_KEYWORD, value: validValue };
  };
}

export default SampleLanguageEngine;
