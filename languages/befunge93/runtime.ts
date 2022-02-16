import InputStream from "./input-stream";
import {
  DocumentEdit,
  DocumentRange,
  LanguageEngine,
  StepExecutionResult,
} from "../types";
import { ParseError, RuntimeError } from "../worker-errors";
import { Bfg93RS, Bfg93Op, Bfg93Direction } from "./constants";
import { toSafePrintableChar } from "../engine-utils";

const ROWSIZE = 80; // Maximum size of a single grid row
const COLSIZE = 25; // Maximum size of a single grid column

/** Program counter is coordinates in 2D grid. */
type PC = {
  x: number; // 0-indexed, goes rightwards
  y: number; // 0-indexed, goes downwards
};

/**
 * Defines bounds of the used portion of the grid. So, if the code
 * only occupies top-left 30x20 square, all items in array `x` are < 30,
 * and all items in array `y` are < 20.
 *
 * - `bounds.x[10]`: highest index used on 11th row of grid
 * - `bounds.y[5]`: highest index used on 6th column of grid
 */
type CodeBounds = {
  x: number[];
  y: number[];
};

// Default values for internal states
// Factories are used to create new objects on reset
const DEFAULT_AST = (): string[] => [];
const DEFAULT_PC = () => ({ x: -1, y: -1 });
const DEFAULT_STACK = (): number[] => [];
const DEFAULT_DIRN = Bfg93Direction.RIGHT;
const DEFAULT_STR_MODE = false;
const DEFAULT_BOUNDS = (): CodeBounds => ({
  x: [],
  y: [],
});

// List of characters representing valid Befunge-93 ops
const OP_CHARS = Object.values(Bfg93Op);

export default class Befunge93LanguageEngine
  implements LanguageEngine<Bfg93RS>
{
  private _ast: string[] = DEFAULT_AST();
  private _stack: number[] = DEFAULT_STACK();
  private _pc: PC = DEFAULT_PC();
  private _dirn: Bfg93Direction = DEFAULT_DIRN;
  private _strmode: boolean = DEFAULT_STR_MODE;
  private _bounds: CodeBounds = DEFAULT_BOUNDS();
  private _input: InputStream = new InputStream("");
  private _edits: DocumentEdit[] = [];

  resetState() {
    this._ast = DEFAULT_AST();
    this._stack = DEFAULT_STACK();
    this._pc = DEFAULT_PC();
    this._dirn = DEFAULT_DIRN;
    this._strmode = DEFAULT_STR_MODE;
    this._bounds = DEFAULT_BOUNDS();
    this._input = new InputStream("");
    this._edits = [];
  }

  validateCode(code: string) {
    this.parseCode(code);
  }

  prepare(code: string, input: string) {
    const { grid, bounds } = this.parseCode(code);
    this._ast = grid;
    this._bounds = bounds;
    this._edits = this.getGridPaddingEdits(code);
    this._input = new InputStream(input);
  }

  executeStep(): StepExecutionResult<Bfg93RS> {
    // Execute and update program counter
    let output: string | undefined = undefined;
    let edits: DocumentEdit[] | undefined = undefined;
    let end: boolean = false;
    if (this._pc.x === -1 && this._pc.y === -1) {
      this._pc = { x: 0, y: 0 };
      edits = this._edits;
    } else {
      const result = this.processOp();
      output = result.output;
      edits = result.edit && [result.edit];
      end = !!result.end;
    }

    // Prepare location of next step
    let nextStepLocation: DocumentRange | null = null;
    if (!end) nextStepLocation = this.toRange(this._pc.y, this._pc.x);

    // Prepare and return execution result
    const rendererState: Bfg93RS = {
      stack: this._stack,
      direction: this._dirn,
      strMode: this._strmode,
    };
    return { rendererState, nextStepLocation, output, codeEdits: edits };
  }

  private parseCode(code: string) {
    // A Befunge program can contain any character in the program, so the only
    // validation to do is ensure program is within 80x25 bounds.

    // Validate that program is within the 80x25 bounds
    const lines = code.split("\n");
    if (lines.length > COLSIZE)
      throw new ParseError(`Code is longer than ${COLSIZE} lines`, {
        startLine: COLSIZE,
      });
    lines.forEach((line, idx) => {
      if (line.length > ROWSIZE)
        throw new ParseError(`Line is longer than ${ROWSIZE} characters`, {
          startLine: idx,
          startCol: ROWSIZE,
        });
    });

    // Global bounds for each axis
    const maxX = Math.max(...lines.map((line) => line.length - 1));
    const maxY = lines.length - 1;

    // Define bounds for each line and column
    const bounds = DEFAULT_BOUNDS();
    for (let i = 0; i < COLSIZE; ++i) bounds.x[i] = lines[i]?.length - 1 || -1;
    for (let j = 0; j < ROWSIZE; ++j) bounds.y[j] = j <= maxX ? maxY : -1;

    // Pad the program to size 80x25 for execution
    const grid = lines.map((line) => line.padEnd(80, " "));
    grid.push(...new Array(25 - lines.length).fill(" ".repeat(80)));
    return { grid, bounds };
  }

  /**
   * Process the instruction at the current program grid pointer.
   * Also updates stack and pointer states.
   * @returns String to append to output, if any
   */
  private processOp(): { output?: string; end?: boolean; edit?: DocumentEdit } {
    const char = this.getGridCell(this._pc.x, this._pc.y);
    if (this._strmode && char !== '"') {
      // Push character to string and return;
      this._stack.push(char.charCodeAt(0));
      this.updatePointer();
      return {};
    }

    let output: string | undefined = undefined;
    let edit: DocumentEdit | undefined = undefined;
    let end: boolean = false;

    const op = this.charToOp(char);
    if (!op) throw new RuntimeError("Invalid instruction");
    switch (op) {
      case Bfg93Op.NOOP: {
        break;
      }
      case Bfg93Op.ADD: {
        const a = this.popStack();
        const b = this.popStack();
        this.pushStack(a + b);
        break;
      }
      case Bfg93Op.SUBTRACT: {
        const a = this.popStack();
        const b = this.popStack();
        this.pushStack(b - a);
        break;
      }
      case Bfg93Op.MULTIPLY: {
        const a = this.popStack();
        const b = this.popStack();
        this.pushStack(a * b);
        break;
      }
      case Bfg93Op.DIVIDE: {
        const a = this.popStack();
        const b = this.popStack();
        if (a === 0) throw new RuntimeError("cannot divide by zero");
        this.pushStack(Math.floor(b / a));
        break;
      }
      case Bfg93Op.MODULO: {
        const a = this.popStack();
        const b = this.popStack();
        this.pushStack(b % a);
        break;
      }
      case Bfg93Op.NOT: {
        const val = this.popStack();
        this.pushStack(val === 0 ? 1 : 0);
        break;
      }
      case Bfg93Op.GREATER: {
        const a = this.popStack();
        const b = this.popStack();
        this.pushStack(b > a ? 1 : 0);
        break;
      }
      case Bfg93Op.RIGHT: {
        this._dirn = Bfg93Direction.RIGHT;
        break;
      }
      case Bfg93Op.LEFT: {
        this._dirn = Bfg93Direction.LEFT;
        break;
      }
      case Bfg93Op.UP: {
        this._dirn = Bfg93Direction.UP;
        break;
      }
      case Bfg93Op.DOWN: {
        this._dirn = Bfg93Direction.DOWN;
        break;
      }
      case Bfg93Op.RANDOM: {
        const rand = Math.floor(Math.random() * 4);
        if (rand === 0) this._dirn = Bfg93Direction.RIGHT;
        else if (rand === 1) this._dirn = Bfg93Direction.LEFT;
        else if (rand === 2) this._dirn = Bfg93Direction.UP;
        else this._dirn = Bfg93Direction.DOWN;
        break;
      }
      case Bfg93Op.H_IF: {
        const val = this.popStack();
        if (val === 0) this._dirn = Bfg93Direction.RIGHT;
        else this._dirn = Bfg93Direction.LEFT;
        break;
      }
      case Bfg93Op.V_IF: {
        const val = this.popStack();
        if (val === 0) this._dirn = Bfg93Direction.DOWN;
        else this._dirn = Bfg93Direction.UP;
        break;
      }
      case Bfg93Op.TOGGLE_STR: {
        this._strmode = !this._strmode;
        break;
      }
      case Bfg93Op.DUPLICATE: {
        const val = this.popStack();
        this.pushStack(val);
        this.pushStack(val);
        break;
      }
      case Bfg93Op.SWAP: {
        const top = this.popStack();
        const other = this.popStack();
        this.pushStack(top);
        this.pushStack(other);
        break;
      }
      case Bfg93Op.POP_DELETE: {
        this.popStack();
        break;
      }
      case Bfg93Op.POP_OUTINT: {
        const int = this.popStack();
        output = int.toString() + " ";
        break;
      }
      case Bfg93Op.POP_OUTCHAR: {
        const charCode = this.popStack();
        output = String.fromCharCode(charCode);
        break;
      }
      case Bfg93Op.BRIDGE: {
        this.updatePointer();
        break;
      }
      case Bfg93Op.GET_DATA: {
        const y = this.popStack();
        const x = this.popStack();
        const char = this.getGridCell(x, y);
        this.pushStack(char.charCodeAt(0));
        break;
      }
      case Bfg93Op.PUT_DATA: {
        const y = this.popStack();
        const x = this.popStack();
        const charCode = this.popStack();
        edit = this.setGridCell(x, y, charCode);
        break;
      }
      case Bfg93Op.STDIN_INT: {
        this.pushStack(this._input.getNumber());
        break;
      }
      case Bfg93Op.STDIN_CHAR: {
        const charCode = this._input.getChar();
        this.pushStack(charCode);
        break;
      }
      case Bfg93Op.END: {
        end = true;
        break;
      }
      default: {
        this.pushStack(parseInt(op, 10));
        break;
      }
    }

    // Update grid pointer and return
    this.updatePointer();
    return { output, end, edit };
  }

  /** Push a number onto the stack */
  private pushStack(num: number): void {
    this._stack.push(num);
  }

  /** Pop a number from stack. If empty stack, returns 0 */
  private popStack(): number {
    if (this._stack.length === 0) return 0;
    else return this._stack.pop()!;
  }

  /**
   * Get character at position (x, y) of program grid.
   * Throws RuntimeError if (x, y) is out of bounds.
   */
  private getGridCell(x: number, y: number): string {
    if (!this.isInGrid(x, y))
      throw new RuntimeError("Coordinates out of bounds");
    else return this._ast[y][x];
  }

  /**
   * Set cell at (x, y) of program grid to character with given ASCII value.
   * Throws if (x, y) is out of bounds
   */
  private setGridCell(x: number, y: number, asciiVal: number): DocumentEdit {
    if (!this.isInGrid(x, y))
      throw new RuntimeError("Coordinates out of bound");

    // Change character at position (x, y)
    this._ast[y] =
      this._ast[y].slice(0, x) +
      String.fromCharCode(asciiVal) +
      this._ast[y].slice(x + 1);

    // Update grid bounds
    this._bounds.x[y] = Math.max(this._bounds.x[y], x);
    this._bounds.y[x] = Math.max(this._bounds.y[x], y);

    // Return code edit object
    return {
      text: toSafePrintableChar(asciiVal),
      range: { startLine: y, startCol: x, endCol: x + 1 },
    };
  }

  /**
   * Update program grid pointer according to currently set direction.
   * Throws RuntimeError if pointer lands outside 80x25 grid.
   */
  private updatePointer(): void {
    // Update pointer
    if (this._dirn === Bfg93Direction.RIGHT) this._pc.x += 1;
    else if (this._dirn === Bfg93Direction.LEFT) this._pc.x -= 1;
    else if (this._dirn === Bfg93Direction.UP) this._pc.y -= 1;
    else if (this._dirn === Bfg93Direction.DOWN) this._pc.y += 1;
    else throw new Error("Unknown direction");

    // Check pointer position and wrap if necessary
    this.wrapPointer();
  }

  /**
   * Wraps the pointer around the program bounds. Note that program bounds are
   * not 80x25 - they are the bounds of the used parts of grid.
   *
   * Assumes that only one of x and y-coordinates is out of bounds.
   */
  private wrapPointer(): void {
    if (this._strmode) {
      // String mode: just wrap the pointer around the 80x25 grid
      this._pc.x = (this._pc.x + ROWSIZE) % ROWSIZE;
      this._pc.y = (this._pc.y + COLSIZE) % COLSIZE;
    } else if (
      this._dirn === Bfg93Direction.LEFT ||
      this._dirn === Bfg93Direction.RIGHT
    ) {
      // Wrap pointer around code bounds in horizontal direction (along x-axis)
      if (this._pc.x < 0) this._pc.x = this._bounds.x[this._pc.y];
      else if (this._pc.x > this._bounds.x[this._pc.y]) this._pc.x = 0;
    } else {
      // Wrap pointer around code bounds in vertical direction (along y-axis)
      if (this._pc.y < 0) this._pc.y = this._bounds.y[this._pc.x];
      else if (this._pc.y > this._bounds.y[this._pc.x]) this._pc.y = 0;
    }
  }

  /**
   * Generate `DocumentEdit`s to apply on code to pad it up to 80x25 size.
   * @param code Code content, lines separated by '\n'
   * @returns Array of `DocumentEdit`s to apply on code
   */
  private getGridPaddingEdits(code: string): DocumentEdit[] {
    const lines = code.split("\n");
    const edits: DocumentEdit[] = [];
    for (let i = 0; i < COLSIZE; ++i) {
      if (i < lines.length) {
        if (lines[i].length === ROWSIZE) continue;
        // Add padding to line upto full-length
        edits.push({
          range: {
            startLine: i,
            startCol: lines[i].length,
            endCol: lines[i].length,
          },
          text: " ".repeat(ROWSIZE - lines[i].length),
        });
      } else {
        // Add full-length empty line
        edits.push({
          range: { startLine: i, startCol: 0, endCol: 0 },
          text: "\n" + " ".repeat(80),
        });
      }
    }
    return edits;
  }

  /**
   * Cast the given character to corresponding Befunge-93 op.
   * If character is invalid op, returns null.
   * @param char Character to cast to Befunge-93 op
   * @returns Corresponding Befunge-93 op, or null.
   */
  private charToOp(char: string): Bfg93Op | null {
    if (char.length !== 1) throw new Error(`'${char}' not a character`);
    if (!OP_CHARS.includes(char as Bfg93Op)) return null;
    else return char as Bfg93Op;
  }

  /** Convert 2D coordinates to DocumentRange */
  private toRange(line: number, char: number): DocumentRange {
    return { startLine: line, startCol: char, endCol: char + 1 };
  }

  /** Check if given coordinates lies inside 80x25 grid */
  private isInGrid(x: number, y: number): boolean {
    return x >= 0 && x < ROWSIZE && y >= 0 && y < COLSIZE;
  }
}
