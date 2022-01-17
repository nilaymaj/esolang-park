import { executeProgram, readTestProgram } from "../../test-utils";
import ChefRuntime from "../runtime";

/** Absolute path to directory of sample programs */
const DIRNAME = __dirname + "/samples";

describe("Test programs", () => {
  test("Hello World Souffle", async () => {
    const code = readTestProgram(DIRNAME, "hello-world-souffle");
    const result = await executeProgram(new ChefRuntime(), code);
    expect(result.output).toBe("Hello world!");
  });

  test("Fibonacci Du Fromage", async () => {
    const code = readTestProgram(DIRNAME, "fibonacci-fromage");
    const result = await executeProgram(new ChefRuntime(), code, "10");
    expect(result.output).toBe(" 1 1 2 3 5 8 13 21 34 55");
  });

  test("Hello World Cake with Chocolate Sauce", async () => {
    const code = readTestProgram(DIRNAME, "hello-world-cake");
    const result = await executeProgram(new ChefRuntime(), code);
    expect(result.output).toBe("Hello world!");
  });
});
