import { LanguageEngine, StepExecutionResult } from "../../types";
import { RS } from "../common/types";
import { parseProgram } from "../parser";

export default class XYZLanguageEngine implements LanguageEngine<RS> {
  resetState() {
    // TODO: Unimplemented
  }

  validateCode(code: string) {
    parseProgram(code);
  }

  prepare(code: string, input: string) {
    parseProgram(code);
    // TODO: Unimplemented
  }

  executeStep(): StepExecutionResult<RS> {
    // TODO: Unimplemented
    return { rendererState: { value: 0 }, nextStepLocation: { line: 0 } };
  }
}
