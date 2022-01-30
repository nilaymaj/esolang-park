import { readTestProgram, executeProgram } from "../../test-utils";
import { Bfg93Direction } from "../constants";
import Engine from "../runtime";

/**
 * All test programs are picked up from https://esolangs.org/wiki/Befunge,
 * except the modifications mentioned alongside each test.
 */

/** Relative path to directory of sample programs */
const DIRNAME = __dirname + "/samples";

describe("Test programs", () => {
  // Standard hello-world program
  test("hello world", async () => {
    const code = readTestProgram(DIRNAME, "helloworld");
    const result = await executeProgram(new Engine(), code);
    expect(result.output.charCodeAt(result.output.length - 1)).toBe(0);
    expect(result.output.slice(0, -1)).toBe("Hello, World!");
    expect(result.rendererState.direction).toBe(Bfg93Direction.DOWN);
    expect(result.rendererState.stack.length).toBe(0);
  });

  // cat program
  test("cat program", async () => {
    const input = "abcd efgh\nijkl mnop\n";
    const code = readTestProgram(DIRNAME, "cat");
    const result = await executeProgram(new Engine(), code, input);
    expect(result.output).toBe(input);
    expect(result.rendererState.direction).toBe(Bfg93Direction.LEFT);
    expect(result.rendererState.stack).toEqual([-1]);
  });

  // Random DNA printer
  test("random DNA", async () => {
    const code = readTestProgram(DIRNAME, "dna");
    const result = await executeProgram(new Engine(), code);
    // program prints "\r\n" at the end of output
    expect(result.output.length).toBe(56 + 2);
    expect(result.output.trim().search(/[^ATGC]/)).toBe(-1);
    expect(result.rendererState.direction).toBe(Bfg93Direction.RIGHT);
    expect(result.rendererState.stack).toEqual([0]);
  });

  // Factorial program
  test("factorial", async () => {
    const code = readTestProgram(DIRNAME, "factorial");
    const result = await executeProgram(new Engine(), code, "5");
    expect(result.output).toBe("120 ");
    expect(result.rendererState.direction).toBe(Bfg93Direction.RIGHT);
    expect(result.rendererState.stack.length).toBe(0);
  });

  // Sieve of Eratosthenes - prints prime nums upto 36
  // (original prints up to 80, shortened here for testing purposes)
  test("sieve of eratosthenes", async () => {
    const code = readTestProgram(DIRNAME, "prime-sieve");
    const result = await executeProgram(new Engine(), code);
    const outputNums = result.output
      .trim()
      .split(" ")
      .map((a) => parseInt(a, 10));
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
    expect(outputNums).toEqual(primes);
    expect(result.rendererState.direction).toBe(Bfg93Direction.DOWN);
    expect(result.rendererState.stack).toEqual([37]);
  });

  // Quine 1 - simple single-line quine
  test("simple singleline quine", async () => {
    const code = readTestProgram(DIRNAME, "quine1");
    const result = await executeProgram(new Engine(), code);
    expect(result.output).toBe(code);
    expect(result.rendererState.direction).toBe(Bfg93Direction.RIGHT);
    expect(result.rendererState.stack).toEqual([44]);
  });

  // Quine 2 - multiline quine
  test("multiline quine", async () => {
    const code = readTestProgram(DIRNAME, "quine2");
    const result = await executeProgram(new Engine(), code);
    // Output has an extra space at the end - verified on tio.run
    expect(result.output).toBe(code + " ");
    expect(result.rendererState.direction).toBe(Bfg93Direction.LEFT);
    expect(result.rendererState.stack).toEqual([0]);
  });

  // Quine 3 - quine without using "g"
  test("quine without using 'g'", async () => {
    const code = readTestProgram(DIRNAME, "quine3");
    const result = await executeProgram(new Engine(), code);
    expect(result.output).toBe(code);
    expect(result.rendererState.direction).toBe(Bfg93Direction.LEFT);
    expect(result.rendererState.stack).toEqual([0]);
  });
});
