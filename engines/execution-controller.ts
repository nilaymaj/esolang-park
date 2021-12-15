import { LanguageEngine, StepExecutionResult } from "./types";

type ExecuteAllArgs<RS> = {
  /** Interval between two execution steps, in milliseconds */
  interval?: number;
  /**
   * Pass to run in streaming-response mode.
   * Callback is called with exeuction result on every execution step.
   */
  onResult?: (result: StepExecutionResult<RS>) => void;
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
   * Execute the loaded program until stopped.
   * @param param0.interval Interval between two execution steps
   * @param param0.onResult Callback called with result on each execution step
   * @returns Returns last (already used) execution result
   */
  async executeAll({ interval, onResult }: ExecuteAllArgs<RS>) {
    while (true) {
      this._result = this._engine.executeStep();
      console.log("Result: ", this._result);
      if (!this._result.nextStepLocation) {
        // End of program
        onResult && onResult(this._result);
        this._resolvePause && this._resolvePause(); // In case pause happens on same cycle
        break;
      } else if (this._resolvePause) {
        // Execution has been paused/stopped
        this._result.signal = "paused";
        onResult && onResult(this._result);
        this._resolvePause();
        break;
      } else {
        onResult && onResult(this._result);
        // Sleep for specified interval
        await this.sleep(interval || 0);
      }
    }

    return this._result;
  }

  /** Asynchronously sleep for a period of time */
  private async sleep(millis: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, millis));
  }
}

export default ExecutionController;
