import { readTestProgram, executeProgram } from "../../test-utils";
import Engine from "../runtime";

/**
 * All test programs are picked up from https://esolangs.org/wiki/Deadfish.
 */

describe("Test programs", () => {
  // Standard hello-world program
  test("hello world", async () => {
    const code = readTestProgram(__dirname, "helloworld");
    const result = await executeProgram(new Engine(), code);
    expect(result.output).toBe("7210110810811132119111114108100");
    expect(result.rendererState.value).toBe(100);
  });

  // Test program 1, output 0
  test("output zero (1)", async () => {
    const code = readTestProgram(__dirname, "zero1");
    const result = await executeProgram(new Engine(), code);
    expect(result.output).toBe("0");
    expect(result.rendererState.value).toBe(0);
  });

  // Test program 2, output 0
  test("output zero (2)", async () => {
    const code = readTestProgram(__dirname, "zero2");
    const result = await executeProgram(new Engine(), code);
    expect(result.output).toBe("0");
    expect(result.rendererState.value).toBe(0);
  });

  // Test program 3, output 288
  test("output 288", async () => {
    const code = readTestProgram(__dirname, "288");
    const result = await executeProgram(new Engine(), code);
    expect(result.output).toBe("288");
    expect(result.rendererState.value).toBe(288);
  });
});
