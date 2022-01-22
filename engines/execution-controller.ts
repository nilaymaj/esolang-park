import { LanguageEngine, StepExecutionResult } from "./types";
import {
  isParseError,
  isRuntimeError,
  serializeParseError,
  serializeRuntimeError,
  WorkerRuntimeError,
} from "./worker-errors";

type ExecuteAllArgs<RS> = {
  /** Interval between two execution steps, in milliseconds */
  interval: number;
  /**
   * Pass to run in streaming-response mode.
   * Callback is called with exeuction result on every execution step.
   */
  onResult: (result: StepExecutionResult<RS>) => void;
};

class ExecutionController<RS> {
  private _engine: LanguageEngine<RS>;
  private _breakpoints: number[] = [];
  private _result: StepExecutionResult<RS> | null;
  private _resolvePause: (() => void) | null = null;
  private _isPaused: boolean = false;

  /**
   * Create a new ExecutionController.
   * @param engine Language engine to use for execution
   */
  constructor(engine: LanguageEngine<RS>) {
    this._engine = engine;
    this._engine.resetState();
    this._result = null;
  }

  /**
   * Reset execution state in controller and engine.
   * Clears out state from the current execution cycle.
   */
  resetState() {
    this._engine.resetState();
    this._result = null;
  }

  /**
   * Load code and user input into the engine to prepare for execution.
   * @param code Code content, lines separated by `\n`
   * @param input User input, lines separated by '\n'
   */
  prepare(code: string, input: string) {
    this._engine.prepare(code, input);
  }

  /**
   * Update debugging breakpoints
   * @param points Array of line numbers having breakpoints
   */
  updateBreakpoints(points: number[]) {
    this._breakpoints = points;
  }

  /**
   * Validate the syntax of the given code
   * @param code Code content, lines separated by '\n'
   */
  validateCode(code: string) {
    try {
      this._engine.validateCode(code);
    } catch (error) {
      if (isParseError(error)) return serializeParseError(error);
      else throw error;
    }
  }

  /**
   * Pause the ongoing execution.
   * - If already paused, returns immediately
   * - Queues up with any existing pause calls
   * @returns Promise that resolves when execution is paused
   */
  async pauseExecution(): Promise<void> {
    // If already paused, return immediately
    if (this._isPaused) return;

    // If there's another "pause" call waiting, chain up with older resolver.
    // This kinda creates a linked list of resolvers, with latest resolver at head.
    if (this._resolvePause) {
      console.log("Chaining pause calls");
      return new Promise((resolve) => {
        // Keep a reference to the existing resolver
        const oldResolve = this._resolvePause;
        // Replace resolver with new chained resolver
        this._resolvePause = () => {
          oldResolve && oldResolve();
          resolve();
        };
      });
    }

    // Else, create a callback to be called by the execution loop
    // when it finishes current execution step.
    return new Promise(
      (resolve) =>
        (this._resolvePause = () => {
          this._resolvePause = null;
          this._isPaused = true;
          resolve();
        })
    );
  }

  /**
   * Run a single step of execution
   * @returns Result of execution
   */
  executeStep(): {
    result: StepExecutionResult<RS>;
    error?: WorkerRuntimeError;
  } {
    try {
      this._result = this._engine.executeStep();
      this._result.signal = "paused";
      return { result: this._result };
    } catch (error) {
      if (isRuntimeError(error))
        return { result: this._result!, error: serializeRuntimeError(error) };
      else throw error;
    }
  }

  /**
   * Execute the loaded program until stopped. Throws if an error other than RuntimeError is encountered.
   * @param param0.interval Interval between two execution steps
   * @param param0.onResult Callback called with result on each execution step
   * @returns Promise that resolves with result of last execution step and RuntimeError if any
   */
  executeAll({ interval, onResult }: ExecuteAllArgs<RS>): Promise<{
    result: StepExecutionResult<RS>;
    error?: WorkerRuntimeError;
  }> {
    // Clear paused state
    this._isPaused = false;

    return new Promise(async (resolve, reject) => {
      while (true) {
        try {
          const doBreak = this.runExecLoopIteration();
          onResult(this._result!);
          if (doBreak) break;
          await this.sleep(interval);
        } catch (error) {
          if (isRuntimeError(error)) {
            this._isPaused = true;
            resolve({
              result: this._result!,
              error: serializeRuntimeError(error),
            });
          } else reject(error);
          break;
        }
      }
      resolve({ result: this._result! });
    });
  }

  /**
   * Runs a single iteration of execution loop, and sets
   * `this._result` to the execution result.
   * @returns Boolean - if true, break execution loop.
   */
  private runExecLoopIteration(): boolean {
    // Run an execution step in the engine
    this._result = this._engine.executeStep();

    // Check end of program
    if (!this._result.nextStepLocation) {
      this._resolvePause && this._resolvePause(); // In case pause happens on same cycle
      return true;
    }

    // Check if execution has been paused
    if (this._resolvePause) {
      this._result.signal = "paused";
      this._resolvePause && this._resolvePause();
      return true;
    }

    // Check if next line has breakpoint
    if (this._breakpoints.includes(this._result.nextStepLocation!.line)) {
      this._result.signal = "paused";
      return true;
    }

    return false;
  }

  /** Sleep for `ms` milliseconds */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default ExecutionController;
