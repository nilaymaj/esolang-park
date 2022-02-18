import { executeProgram, readTestProgram } from "../../test-utils";
import Engine from "../runtime";

describe("Test programs", () => {
  test("Hello World", async () => {
    const code = readTestProgram(__dirname, "helloworld");
    const result = await executeProgram(new Engine(), code);
    expect(result.output).toBe("Hello World!\n");
  });

  test("Prime Numbers", async () => {
    const code = readTestProgram(__dirname, "primes");
    const result = await executeProgram(new Engine(), code, "15");
    expect(result.output).toBe(">2 3 5 7 11 13 ");
  });

  test("Reverse cat", async () => {
    const code = readTestProgram(__dirname, "reverse");
    const input = "abcd efgh\nijkl mnop\n";
    const expectedOutput = input.split("").reverse().join("");
    const result = await executeProgram(new Engine(), code, input);
    expect(result.output).toBe(expectedOutput);
  });
});
