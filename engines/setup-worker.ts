import ExecutionController from "./execution-controller";
import { LanguageEngine, StepExecutionResult } from "./types";
import * as E from "./worker-errors";
import * as C from "./worker-constants";

/** Create a worker response for acknowledgement */
const ackMessage = <RS, A extends C.WorkerAckType>(
  ackType: A,
  error?: C.WorkerAckError[A]
): C.WorkerResponseData<RS, A> => ({
  type: "ack",
  data: ackType,
  error,
});

/** Create a worker response for execution result */
const resultMessage = <RS, A extends C.WorkerAckType>(
  result: StepExecutionResult<RS>,
  error?: E.WorkerRuntimeError
): C.WorkerResponseData<RS, A> => ({
  type: "result",
  data: result,
  error,
});

/** Create a worker response for unexpected errors */
const errorMessage = <RS, A extends C.WorkerAckType>(
  error: Error
): C.WorkerResponseData<RS, A> => ({ type: "error", error });

/** Initialize the execution controller */
const initController = () => {
  postMessage(ackMessage("init"));
};

/**
 * Reset the state of the controller and engine, to
 * prepare for execution of a new program.
 */
const resetController = <RS>(controller: ExecutionController<RS>) => {
  controller.resetState();
  postMessage(ackMessage("reset"));
};

/**
 * Load program code into the engine.
 * @param code Code content of the program
 */
const prepare = <RS>(
  controller: ExecutionController<RS>,
  { code, input }: { code: string; input: string }
) => {
  try {
    controller.prepare(code, input);
    postMessage(ackMessage("prepare"));
  } catch (error) {
    if (E.isParseError(error))
      postMessage(ackMessage("prepare", E.serializeParseError(error)));
    else throw error;
  }
};

/**
 * Update debugging breakpoints
 * @param points List of line numbers having breakpoints
 */
const updateBreakpoints = <RS>(
  controller: ExecutionController<RS>,
  points: number[]
) => {
  controller.updateBreakpoints(points);
  postMessage(ackMessage("bp-update"));
};

/**
 * Execute the entire program loaded on engine,
 * and return result of execution.
 */
const execute = async <RS>(
  controller: ExecutionController<RS>,
  interval: number
) => {
  const { result, error } = await controller.executeAll({
    interval,
    onResult: (res) => postMessage(resultMessage(res)),
  });
  if (error) postMessage(resultMessage(result, error));
};

/** Trigger pause in program execution */
const pauseExecution = async <RS>(controller: ExecutionController<RS>) => {
  await controller.pauseExecution();
  postMessage(ackMessage("pause"));
};

/** Run a single execution step */
const executeStep = <RS>(controller: ExecutionController<RS>) => {
  const { result, error } = controller.executeStep();
  postMessage(resultMessage(result, error));
};

/**
 * Create an execution controller worker script with the given engine.
 * @param engine Language engine to create worker for
 */
export const setupWorker = <RS>(engine: LanguageEngine<RS>) => {
  const controller = new ExecutionController(engine);

  addEventListener("message", async (ev: MessageEvent<C.WorkerRequestData>) => {
    try {
      if (ev.data.type === "Init") return initController();
      if (ev.data.type === "Reset") return resetController(controller);
      if (ev.data.type === "Prepare")
        return prepare(controller, ev.data.params);
      if (ev.data.type === "Execute")
        return execute(controller, ev.data.params.interval);
      if (ev.data.type === "Pause") return await pauseExecution(controller);
      if (ev.data.type === "ExecuteStep") return executeStep(controller);
      if (ev.data.type === "UpdateBreakpoints")
        return updateBreakpoints(controller, ev.data.params.points);
    } catch (error) {
      // Error here indicates an implementation bug
      console.error(error);
      postMessage(errorMessage(error as Error));
    }
    throw new Error("Invalid worker message type");
  });
};
