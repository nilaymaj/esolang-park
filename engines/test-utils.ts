import { readFileSync } from "fs";
import { resolve } from "path";
import ExecutionController from "./execution-controller";
import { LanguageEngine } from "./types";

/**
 * Read the entire contents of a test program.
 * @param dirname Absolute path to directory containing program
 * @param name Name of TXT file, without extension
 * @returns Contents of file, as a \n-delimited string
 */
export const readTestProgram = (dirname: string, name: string): string => {
  const path = resolve(dirname, name + ".txt");
  return readFileSync(path, { encoding: "utf8" }).toString();
};

/**
 * Run code on language engine and return final result.
 * If error thrown, promise rejects with the error.
 * @param engine Engine to use for execution
 * @param code Source code to execute
 * @param input STDIN input for execution
 * @returns Final execution result object
 */
export const executeProgram = async <T>(
  engine: LanguageEngine<T>,
  code: string,
  input: string = ""
): Promise<{ output: string; rendererState: T }> => {
  const controller = new ExecutionController(engine);
  controller.prepare(code, input);
  return new Promise((resolve, reject) => {
    try {
      let output = "";
      controller.executeAll({
        interval: 0,
        onResult: (res) => {
          if (res.output) output += res.output;
          if (res.nextStepLocation == null) {
            resolve({ output, rendererState: res.rendererState });
          }
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};
