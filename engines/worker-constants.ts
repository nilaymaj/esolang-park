import { StepExecutionResult } from "./types";

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
      type: "Execute";
      params: { interval?: number };
    };

export type WorkerResponseData<RS> =
  | { type: "state"; data: "empty" | "ready" }
  | { type: "result"; data: StepExecutionResult<RS> };
