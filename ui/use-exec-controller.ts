import React from "react";
import { StepExecutionResult } from "../engines/types";
import {
  WorkerRequestData,
  WorkerResponseData,
} from "../engines/worker-constants";
import { WorkerParseError, WorkerRuntimeError } from "../engines/worker-errors";

/** Possible states for the worker to be in */
type WorkerState =
  | "loading" // Worker is not initialized yet
  | "empty" // Worker loaded, no code loaded yet
  | "ready" // Ready to start execution
  | "processing" // Executing code
  | "paused" // Execution currently paused
  | "error" // Execution ended due to error
  | "done"; // Program ended, reset now

/**
 * React Hook that manages initialization, communication and
 * cleanup for the worker thread used for code execution.
 *
 * Also abstracts away the details of message-passing and exposes
 * an imperative API to the parent component.
 */
export const useExecController = <RS>(langName: string) => {
  const workerRef = React.useRef<Worker | null>(null);
  const [workerState, setWorkerState] = React.useState<WorkerState>("loading");

  /**
   * Type-safe wrapper to abstract request-response cycle into
   * a simple imperative asynchronous call. Returns Promise that resolves
   * with response data.
   *
   * Note that if the worker misbehaves due to any reason, the returned response data
   * (or `onData` argument) may not correspond to the request. Check this in the caller.
   *
   * @param request Data to send in request
   * @param onData Optional argument - if passed, function enters response-streaming mode.
   * Callback is called with response data. Return `true` to keep the connection alive, `false` to end.
   * On end, promise resolves with last (already used) response data.
   */
  const requestWorker = (
    request: WorkerRequestData,
    onData?: (data: WorkerResponseData<RS, any>) => boolean
  ): Promise<WorkerResponseData<RS, any>> => {
    return new Promise((resolve) => {
      const handler = (ev: MessageEvent<WorkerResponseData<RS, any>>) => {
        if (!onData) {
          // Normal mode
          workerRef.current!.removeEventListener("message", handler);
          resolve(ev.data);
        } else {
          // Persistent connection mode
          const keepAlive = onData(ev.data);
          if (keepAlive) return;
          // keepAlive is false: terminate connection
          workerRef.current!.removeEventListener("message", handler);
          resolve(ev.data);
        }
      };
      workerRef.current!.addEventListener("message", handler);
      workerRef.current!.postMessage(request);
    });
  };

  /** Utility to throw error on unexpected response */
  const throwUnexpectedRes = (
    fnName: string,
    res: WorkerResponseData<RS, any>
  ): never => {
    throw new Error(`Unexpected response on ${fnName}: ${JSON.stringify(res)}`);
  };

  // Initialization and cleanup of web worker
  React.useEffect(() => {
    (async () => {
      if (workerRef.current) throw new Error("Tried to reinitialize worker");
      workerRef.current = new Worker(`../workers/${langName}.js`);
      const res = await requestWorker({ type: "Init" });
      if (res.type === "ack" && res.data === "init") setWorkerState("empty");
      else throwUnexpectedRes("init", res);
    })();

    return () => {
      // Terminate worker and clean up
      workerRef.current!.terminate();
      workerRef.current = null;
    };
  }, []);

  /**
   * Load code and user input into the execution controller.
   * @param code Code content
   * @param input User input
   */
  const prepare = React.useCallback(
    async (code: string, input: string): Promise<WorkerParseError | void> => {
      const res = await requestWorker({
        type: "Prepare",
        params: { code, input },
      });
      if (res.type === "ack" && res.data === "prepare") {
        if (res.error) return res.error;
        else setWorkerState("ready");
      } else throwUnexpectedRes("loadCode", res);
    },
    []
  );

  /**
   * Update debugging breakpoints in the execution controller.
   * @param points Array of line numbers having breakpoints
   */
  const updateBreakpoints = React.useCallback(async (points: number[]) => {
    await requestWorker(
      {
        type: "UpdateBreakpoints",
        params: { points },
      },
      (res) => {
        if (res.type === "ack" && res.data === "bp-update") return false;
        else return true;
      }
    );
  }, []);

  /**
   * Reset the state of the controller and engine.
   */
  const resetState = React.useCallback(async () => {
    const res = await requestWorker({ type: "Reset" });
    if (res.type === "ack" && res.data === "reset") setWorkerState("empty");
    else throwUnexpectedRes("resetState", res);
  }, []);

  /**
   * Validate the syntax of the user's program code
   * @param code Code content of the user's program
   */
  const validateCode = React.useCallback(
    async (code: string): Promise<WorkerParseError | undefined> => {
      const res = await requestWorker(
        { type: "ValidateCode", params: { code } },
        (res) => res.type !== "validate"
      );
      return res.error;
    },
    []
  );

  /**
   * Pause program execution
   */
  const pauseExecution = React.useCallback(async () => {
    await requestWorker({ type: "Pause" }, (res) => {
      // We don't update state here - that's done by the execution stream instead
      if (!(res.type === "ack" && res.data === "pause")) return true;
      return false;
    });
  }, []);

  /**
   * Run a single step of execution
   * @return Execution result
   */
  const executeStep = React.useCallback(async (): Promise<{
    result: StepExecutionResult<RS>;
    error?: WorkerRuntimeError;
  }> => {
    const res = await requestWorker(
      { type: "ExecuteStep" },
      (res) => res.type !== "result"
    );
    if (res.type !== "result") throw new Error("Something unexpected happened");
    if (!res.data.nextStepLocation) setWorkerState("done");

    return { result: res.data, error: res.error };
  }, []);

  /**
   * Execute the code loaded into the engine
   * @param onResult Callback used when an execution result is received
   */
  const execute = React.useCallback(
    async (
      onResult: (
        result: StepExecutionResult<RS>,
        error?: WorkerRuntimeError
      ) => void,
      interval: number
    ) => {
      setWorkerState("processing");
      // Set up a streaming-response cycle with the worker
      await requestWorker({ type: "Execute", params: { interval } }, (res) => {
        if (res.type !== "result") return true;
        onResult(res.data, res.error);
        if (!res.data.nextStepLocation) {
          // Program execution complete
          setWorkerState("done");
          return false;
        } else if (res.data.signal === "paused") {
          // Execution paused by user or breakpoint
          setWorkerState("paused");
          return false;
        } else if (res.error) {
          // Runtime error occured
          setWorkerState("error");
          return false;
        } else return true;
      });
    },
    []
  );

  return {
    state: workerState,
    resetState,
    prepare,
    pauseExecution,
    validateCode,
    execute,
    executeStep,
    updateBreakpoints,
  };
};
