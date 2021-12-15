import React from "react";
import { StepExecutionResult } from "../engines/types";
import {
  WorkerRequestData,
  WorkerResponseData,
} from "../engines/worker-constants";

/** Possible states for the worker to be in */
type WorkerState =
  | "loading" // Worker is not initialized yet
  | "empty" // Worker loaded, no code loaded yet
  | "ready" // Ready to start execution
  | "processing" // Executing code
  | "paused" // Execution currently paused
  | "done"; // Program ended, reset now

/**
 * React Hook that manages initialization, communication and
 * cleanup for the worker thread used for code execution.
 *
 * Also abstracts away the details of message-passing and exposes
 * an imperative API to the parent component.
 */
export const useExecController = <RS>() => {
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
    onData?: (data: WorkerResponseData<RS>) => boolean
  ): Promise<WorkerResponseData<RS>> => {
    return new Promise((resolve) => {
      const handler = (ev: MessageEvent<WorkerResponseData<RS>>) => {
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
    res: WorkerResponseData<RS>
  ): never => {
    throw new Error(`Unexpected response on ${fnName}: ${JSON.stringify(res)}`);
  };

  // Initialization and cleanup of web worker
  React.useEffect(() => {
    (async () => {
      if (workerRef.current) throw new Error("Tried to reinitialize worker");
      workerRef.current = new Worker(
        new URL("../engines/worker.ts", import.meta.url)
      );
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
  const prepare = React.useCallback(async (code: string, input: string) => {
    const res = await requestWorker({
      type: "Prepare",
      params: { code, input },
    });
    if (res.type === "ack" && res.data === "prepare") setWorkerState("ready");
    else throwUnexpectedRes("loadCode", res);
  }, []);

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
   * Execute the code loaded into the engine
   * @param onResult Callback used when an execution result is received
   */
  const execute = React.useCallback(
    async (
      onResult: (result: StepExecutionResult<RS>) => void,
      interval?: number
    ) => {
      setWorkerState("processing");
      // Set up a streaming-response cycle with the worker
      await requestWorker({ type: "Execute", params: { interval } }, (res) => {
        if (res.type !== "result") return true;
        onResult(res.data);
        if (!res.data.nextStepLocation) {
          setWorkerState("done");
          return false;
        } else if (res.data.signal === "paused") {
          setWorkerState("paused");
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
    execute,
    updateBreakpoints,
  };
};
