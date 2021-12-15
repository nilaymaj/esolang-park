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

  async executeAll({ interval, onResult }: ExecuteAllArgs<RS>) {
    while (true) {
      this._result = this._engine.executeStep();
      onResult && onResult(this._result);
      if (!this._result.nextStepLocation) break;
      await this.sleep(interval || 0);
    }
    return this._result;
  }

  private async sleep(millis: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, millis));
  }
}

export default ExecutionController;
