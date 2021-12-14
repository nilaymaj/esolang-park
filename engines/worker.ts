import BrainfuckLanguageEngine from "./brainfuck/engine";
import ExecutionController from "./execution-controller";
import SampleLanguageEngine from "./sample-lang/engine";
import { StepExecutionResult } from "./types";
import { WorkerRequestData, WorkerResponseData } from "./worker-constants";

let _controller: ExecutionController<any> | null = null;

/** Create a worker response for state update */
const stateMessage = <RS>(
  state: "empty" | "ready"
): WorkerResponseData<RS> => ({
  type: "state",
  data: state,
});

/** Create a worker response for execution result */
const resultMessage = <RS>(
  result: StepExecutionResult<RS>
): WorkerResponseData<RS> => ({
  type: "result",
  data: result,
});

/**
 * Initialize the execution controller.
 */
const initController = () => {
  // const engine = new SampleLanguageEngine();
  const engine = new BrainfuckLanguageEngine();
  _controller = new ExecutionController(engine);
  postMessage(stateMessage("empty"));
};

/**
 * Reset the state of the controller and engine, to
 * prepare for execution of a new program.
 */
const resetController = () => {
  _controller!.resetState();
  postMessage(stateMessage("empty"));
};

/**
 * Load program code into the engine.
 * @param code Code content of the program
 */
const prepare = ({ code, input }: { code: string; input: string }) => {
  _controller!.prepare(code, input);
  postMessage(stateMessage("ready"));
};

/**
 * Execute the entire program loaded on engine,
 * and return result of execution.
 */
const execute = (interval?: number) => {
  console.info(`Executing at interval ${interval}`);
  _controller!.executeAll({
    interval,
    onResult: (res) => postMessage(resultMessage(res)),
  });
};

addEventListener("message", (ev: MessageEvent<WorkerRequestData>) => {
  if (ev.data.type === "Init") return initController();
  if (ev.data.type === "Reset") return resetController();
  if (ev.data.type === "Prepare") return prepare(ev.data.params);
  if (ev.data.type === "Execute") return execute(ev.data.params.interval);
  throw new Error("Invalid worker message type");
});
