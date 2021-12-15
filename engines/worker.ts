import BrainfuckLanguageEngine from "./brainfuck/engine";
import ExecutionController from "./execution-controller";
import { StepExecutionResult } from "./types";
import {
  WorkerAckType,
  WorkerRequestData,
  WorkerResponseData,
} from "./worker-constants";

let _controller: ExecutionController<any> | null = null;

/** Create a worker response for update acknowledgement */
const ackMessage = <RS>(state: WorkerAckType): WorkerResponseData<RS> => ({
  type: "ack",
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
  const engine = new BrainfuckLanguageEngine();
  _controller = new ExecutionController(engine);
  postMessage(ackMessage("init"));
};

/**
 * Reset the state of the controller and engine, to
 * prepare for execution of a new program.
 */
const resetController = () => {
  _controller!.resetState();
  postMessage(ackMessage("reset"));
};

/**
 * Load program code into the engine.
 * @param code Code content of the program
 */
const prepare = ({ code, input }: { code: string; input: string }) => {
  _controller!.prepare(code, input);
  postMessage(ackMessage("prepare"));
};

/**
 * Update debugging breakpoints
 * @param points List of line numbers having breakpoints
 */
const updateBreakpoints = (points: number[]) => {
  _controller!.updateBreakpoints(points);
  postMessage(ackMessage("bp-update"));
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
  if (ev.data.type === "UpdateBreakpoints")
    return updateBreakpoints(ev.data.params.points);
  throw new Error("Invalid worker message type");
});
