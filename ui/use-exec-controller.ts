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
  | "ready" // Code loaded, ready to execute
  | "processing" // Executing code
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
   * Semi-typesafe wrapper to abstract request-response cycle into
   * a simple imperative asynchronous call. Returns Promise that resolves
   * with response data.
   *
   * Note that if the worker misbehaves due to any reason, the returned response data
   * (or `onData` argument) may not correspond to the request. Check this in the caller.
   *
   * @param request Data to send in request
   * @param onData Optional argument - if passed, function enters response-streaming mode.
   * Callback called with response data. Return `true` to keep the connection alive, `false` to end.
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

  // Initialization and cleanup of web worker
  React.useEffect(() => {
    (async () => {
      if (workerRef.current) throw new Error("Tried to reinitialize worker");
      workerRef.current = new Worker(
        new URL("../engines/worker.ts", import.meta.url)
      );
      const resp = await requestWorker({ type: "Init" });
      if (resp.type === "state" && resp.data === "empty")
        setWorkerState("empty");
      else throw new Error(`Unexpected response on init: ${resp}`);
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
    if (res.type === "state" && res.data === "ready") setWorkerState("ready");
    else throw new Error(`Unexpected response on loadCode: ${res.toString()}`);
  }, []);

  /**
   * Reset the state of the controller and engine.
   */
  const resetState = React.useCallback(async () => {
    const res = await requestWorker({ type: "Reset" });
    if (res.type === "state" && res.data === "empty") setWorkerState("empty");
    else
      throw new Error(`Unexpected response on resetState: ${res.toString()}`);
  }, []);

  /**
   * Execute the code loaded into the engine
   * @param onResult Callback used when an execution result is received
   */
  const executeAll = React.useCallback(
    async (
      onResult: (result: StepExecutionResult<RS>) => void,
      interval?: number
    ) => {
      setWorkerState("processing");
      // Set up a streaming-response cycle with the worker
      await requestWorker({ type: "Execute", params: { interval } }, (res) => {
        if (res.type !== "result") return false; // TODO: Throw error here
        onResult(res.data);
        if (res.data.nextStepLocation) return true;
        // Clean up and terminate response stream
        setWorkerState("done");
        return false;
      });
    },
    []
  );

  return React.useMemo(
    () => ({ state: workerState, resetState, prepare, executeAll }),
    [workerState, resetState, prepare, executeAll]
  );
};
