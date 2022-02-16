import {
  DocumentRange,
  LanguageEngine,
  StepExecutionResult,
} from "../../types";
import { parseProgram } from "../parser";
import * as T from "../types";
import InputStream from "./input-stream";
import ChefKitchen from "./kitchen";

/** Type for an item in the call stack */
type CallStackItem = {
  auxName?: string;
  kitchen: ChefKitchen;
  recipe: T.ChefRecipe;
  pc: number;
};

// Default values for internal states
// Factories are used to create new objects on reset
const DEFAULT_CALL_STACK = (): CallStackItem[] => [];
const DEFAULT_INPUT = (): InputStream => new InputStream("");
const DEFAULT_AST = (): T.ChefProgram => ({
  main: { ingredients: {}, name: "", method: [] },
  auxes: {},
});

export default class ChefLanguageEngine implements LanguageEngine<T.ChefRS> {
  private _ast: T.ChefProgram = DEFAULT_AST();
  private _stack: CallStackItem[] = DEFAULT_CALL_STACK();
  private _input: InputStream = DEFAULT_INPUT();

  resetState() {
    this._ast = DEFAULT_AST();
    this._stack = DEFAULT_CALL_STACK();
    this._input = DEFAULT_INPUT();
  }

  validateCode(code: string) {
    parseProgram(code);
  }

  prepare(code: string, input: string) {
    this._ast = parseProgram(code);
    this._input = new InputStream(input);
    const mainKitchen = new ChefKitchen(
      this._input,
      this._ast.main.ingredients
    );
    this._stack.push({ kitchen: mainKitchen, recipe: this._ast.main, pc: -1 });
  }

  executeStep(): StepExecutionResult<T.ChefRS> {
    let output: string | undefined = undefined;

    /**
     * Execution happens only for method steps and the "Serves" line.
     * `currFrame.pc === method.length` implies that execution is currently at the "Serves" line.
     */

    // Process next operation
    const currFrame = this.getCurrentFrame();
    if (currFrame.pc === -1) {
      // First execution step - dummy
      currFrame.pc += 1;
    } else if (currFrame.pc === currFrame.recipe.method.length) {
      // Execution of the "Serves" statement
      const serves = currFrame.recipe.serves!;
      output = this.getKitchenOutput(currFrame.kitchen, serves.num);
      currFrame.pc += 1;
    } else {
      // Execution of a method instruction
      const { op } = currFrame.recipe.method[currFrame.pc];
      output = this.processOp(op);
    }

    // Save for renderer state, in case program ends in this step
    const mainFrame = this._stack[0];

    {
      // Check for end of recipe and pop call stack
      const currFrame = this.getCurrentFrame();
      const methodLength = currFrame.recipe.method.length;
      if (currFrame.pc > methodLength) {
        // "Serves" statement was just executed - now fold call stack
        this.foldCallStack();
      } else if (currFrame.pc === methodLength) {
        // Check if "Serves" statement exists. If not, fold call stack.
        if (!currFrame.recipe.serves) this.foldCallStack();
      }
    }

    // Prepare location of next step
    let nextStepLocation: DocumentRange | null = null;
    if (this._stack.length !== 0) {
      const currFrame = this.getCurrentFrame();
      if (currFrame.pc === currFrame.recipe.method.length) {
        // Next step is "Serves" statement
        nextStepLocation = { startLine: currFrame.recipe.serves!.line };
      } else {
        // Next step is a regular method instruction
        const nextOp = currFrame.recipe.method[currFrame.pc];
        nextStepLocation = nextOp.location;
      }
    }

    // Prepare call stack names list
    const stackNames = this._stack.length
      ? this._stack.map((frame) => frame.auxName || "Main recipe")
      : ["End of program"];

    // Serialize current kitchen's state
    const currentKitchen = this._stack.length
      ? this._stack[this._stack.length - 1].kitchen
      : mainFrame.kitchen;

    // Prepare and send execution result
    return {
      rendererState: {
        stack: stackNames,
        currentKitchen: currentKitchen.serialize(),
      },
      nextStepLocation,
      output,
    };
  }

  /**
   * Process an operation. Also updates program counter state.
   * Note that call stack popping must be done by caller when pc goes past end of recipe.
   * @param op Operation to process
   * @returns String representing operation output (stdout)
   */
  private processOp(op: T.ChefOperation): string | undefined {
    const currRecipe = this.getCurrentFrame();
    let opOutput = "";

    switch (op.code) {
      case "LOOP-OPEN": {
        // Check ingredient value and jump/continue
        const ing = currRecipe.kitchen.getIngredient(op.ing, true);
        if (ing.value === 0) currRecipe.pc = op.closer + 1;
        else currRecipe.pc += 1;
        break;
      }

      case "LOOP-BREAK": {
        // Jump to one past the loop closer
        currRecipe.pc = op.closer + 1;
        break;
      }

      case "LOOP-CLOSE": {
        // Decrement value of ingredient
        if (op.ing) {
          const ing = currRecipe.kitchen.getIngredient(op.ing, true);
          ing.value = ing.value! - 1;
        }

        // Check value of loop-opener ingredient
        const opener = currRecipe.recipe.method[op.opener].op;
        if (opener.code !== "LOOP-OPEN") throw new Error("Bad jump address");
        const ing = currRecipe.kitchen.getIngredient(opener.ing, true);
        if (ing.value === 0) currRecipe.pc += 1;
        else currRecipe.pc = op.opener;
        break;
      }

      case "FNCALL": {
        currRecipe.pc += 1;
        this.forkToAuxRecipe(currRecipe.kitchen, op.recipe);
        break;
      }

      case "END": {
        // If `num` provided, get baking dishes output
        if (op.num)
          opOutput += this.getKitchenOutput(currRecipe.kitchen, op.num);

        // Move pc to past end of recipe. Call stack popping is handled by `executeStep`
        currRecipe.pc = currRecipe.recipe.method.length;
        break;
      }

      default: {
        // Simple kitchen operations
        currRecipe.kitchen.processOperation(op);
        currRecipe.pc += 1;
        break;
      }
    }

    if (opOutput) return opOutput;
  }

  /**
   * Empty the first N dishes of given kitchen into text output.
   * @param numDishes Number of dishes to empty as output
   * @returns Concatenated output from N baking dishes
   */
  private getKitchenOutput(kitchen: ChefKitchen, numDishes: number): string {
    let output = "";
    for (let i = 1; i <= numDishes; ++i)
      output += kitchen.serializeAndClearDish(i);
    return output;
  }

  /**
   * Forks the bowls and dishes of the topmost recipe in the call stack
   * into an auxiliary recipe, and push it to the call stack.
   */
  private forkToAuxRecipe(kitchen: ChefKitchen, recipeName: string): void {
    const { bowls, dishes } = kitchen.serialize();
    const auxRecipe = this._ast.auxes[recipeName];
    const ingredientsClone = this.deepCopy(auxRecipe.ingredients);
    const auxKitchen = new ChefKitchen(
      this._input,
      ingredientsClone,
      bowls,
      dishes
    );
    this._stack.push({
      auxName: recipeName,
      recipe: auxRecipe,
      kitchen: auxKitchen,
      pc: 0,
    });
  }

  /**
   * Repeatedly, pops topmost frame from call stack and pours its first mixing bowl
   * into the caller frame's first mixing bowl in the same order. This is done until
   * a not-fully-executed frame appears at the top of the call stack.
   *
   * Consider the call stack as a long divided strip of paper with each cell denoting a frame.
   * Then, visualize this as repeatedly paper-folding the completely-executed cell at end of
   * the paper strip onto the adjacent cell, until a non-completed cell is reached.
   *
   * The first iteration is done regardless of whether the topmost frame is completed or not.
   *
   * If the call stack is empty after a popping, no pouring is done.
   */
  private foldCallStack(): void {
    while (true) {
      // Pop topmost frame and fold first bowl into parent frame's kitchen
      const poppedFrame = this._stack.pop()!;
      if (this._stack.length === 0) break;
      const parentFrame = this.getCurrentFrame();
      const firstBowl = poppedFrame.kitchen.getBowl(1);
      parentFrame.kitchen.getBowl(1).push(...firstBowl);

      // Check if new topmost frame is completed or not
      if (!this.isFrameCompleted(parentFrame)) break;
    }
  }

  /** Check if a call stack frame is completely executed */
  private isFrameCompleted(frame: CallStackItem): boolean {
    if (frame.pc < frame.recipe.method.length) return false;
    if (frame.pc > frame.recipe.method.length) return true;
    return !frame.recipe.serves;
  }

  /** Get topmost frame in call stack. Throws if stack is empty. */
  private getCurrentFrame(): CallStackItem {
    if (this._stack.length === 0) throw new Error("Call stack is empty");
    return this._stack[this._stack.length - 1];
  }

  /**
   * A naive function to create a deep copy of an object.
   * Uses JSON serialization, so non-simple values like Date won't work.
   */
  private deepCopy<T extends {}>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
