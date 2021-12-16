import { StepExecutionResult } from "./types";

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

/** Types of responses the worker can send */
export type WorkerResponseData<RS> =
  | { type: "ack"; data: WorkerAckType }
  | { type: "result"; data: StepExecutionResult<RS> };
