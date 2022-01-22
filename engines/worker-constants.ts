import { DocumentRange, StepExecutionResult } from "./types";
import * as E from "./worker-errors";

/** Types of requests the worker handles */
export type WorkerRequestData =
  | {
      type: "Init";
      params?: null;
    }
  | {
      type: "Reset";
      params?: null;
    }
  | {
      type: "Prepare";
      params: { code: string; input: string };
    }
  | {
      type: "UpdateBreakpoints";
      params: { points: number[] };
    }
  | {
      type: "Execute";
      params: { interval: number };
    }
  | {
      type: "ExecuteStep";
      params?: null;
    }
  | {
      type: "Pause";
      params?: null;
    };

/** Kinds of acknowledgement responses the worker can send  */
export type WorkerAckType =
  | "init" // on initialization
  | "reset" // on state reset
  | "bp-update" // on updating breakpoints
  | "prepare" // on preparing for execution
  | "pause"; // on pausing execution

/** Errors associated with each response ack type */
export type WorkerAckError = {
  init: undefined;
  reset: undefined;
  "bp-update": undefined;
  prepare: E.WorkerParseError;
  pause: undefined;
};

/** Types of responses the worker can send */
export type WorkerResponseData<RS, A extends WorkerAckType> =
  /** Ack for one-off requests, optionally containing error occured (if any) */
  | {
      type: "ack";
      data: A;
      error?: WorkerAckError[A];
    }
  /** Response containing step execution result, and runtime error (if any) */
  | {
      type: "result";
      data: StepExecutionResult<RS>;
      error?: E.WorkerRuntimeError;
    }
  /** Response indicating a bug in worker/engine logic */
  | { type: "error"; error: Error };
