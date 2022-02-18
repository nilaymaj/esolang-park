// @ts-nocheck
import { LanguageEngine, StepExecutionResult } from "../types";
import { RS } from "./common";

export default class XYZLanguageEngine implements LanguageEngine<RS> {
  resetState() {
    // TODO: Unimplemented
  }

  validateCode(code: string) {
    // TODO: Unimplemented
  }

  prepare(code: string, input: string) {
    // TODO: Unimplemented
  }

  executeStep(): StepExecutionResult<RS> {
    // TODO: Unimplemented
    return { rendererState: { value: 0 }, nextStepLocation: { startLine: 0 } };
  }
}
