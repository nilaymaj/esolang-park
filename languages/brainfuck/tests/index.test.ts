import { readTestProgram, executeProgram } from "../../test-utils";
import { BFRS, serializeTapeMap } from "../common";
import Engine from "../runtime";

/**
 * All test programs are picked up from https://esolangs.org/wiki/Brainfuck.
 * - Cell cleanup code at end of cell size program is not included.
 */

/**
 * Check if actual cell array matches expected cell array.
 * Expected cell array must exclude trailing zeros.
 * @param cellsMap Map of cell index to value, as provided in execution result.
 * @param expected Array of expected cell values, without trailing zeros.
 */
const expectCellsToBe = (cellsMap: BFRS["tape"], expected: number[]) => {
  const cells = serializeTapeMap(cellsMap);
  expect(cells.length).toBeGreaterThanOrEqual(expected.length);
  cells.forEach((value, idx) => {
    if (idx < expected.length) expect(value).toBe(expected[idx]);
    else expect(value).toBe(0);
  });
};

describe("Test programs", () => {
  // Standard hello-world program
  test("hello world", async () => {
    const code = readTestProgram(__dirname, "helloworld");
    const result = await executeProgram(new Engine(), code);
    expect(result.output).toBe("Hello World!\n");
    expect(result.rendererState.pointer).toBe(6);
    const expectedCells = [0, 0, 72, 100, 87, 33, 10];
    expectCellsToBe(result.rendererState.tape, expectedCells);
  });

  // Hello-world program using subzero cell values
  test("hello world with subzero cell values", async () => {
    const code = readTestProgram(__dirname, "helloworld-subzero");
    const result = await executeProgram(new Engine(), code);
    expect(result.output).toBe("Hello World!\n");
    expect(result.rendererState.pointer).toBe(6);
    const expectedCells = [72, 0, 87, 0, 100, 33, 10];
    expectCellsToBe(result.rendererState.tape, expectedCells);
  });

  // cat program
  test("cat program", async () => {
    const code = readTestProgram(__dirname, "cat");
    const result = await executeProgram(new Engine(), code, "foo \n bar");
    expect(result.output).toBe("foo \n bar");
    expect(result.rendererState.pointer).toBe(0);
    expectCellsToBe(result.rendererState.tape, []);
  });

  // Program to calculate cell size
  test("cell size calculator", async () => {
    const code = readTestProgram(__dirname, "cellsize");
    const result = await executeProgram(new Engine(), code);
    expect(result.output).toBe("8 bit cells");
    expect(result.rendererState.pointer).toBe(4);
    expectCellsToBe(result.rendererState.tape, [0, 32, 115, 108, 10]);
  });
});
