import { writeFileSync } from "fs";
import { resolve } from "path";
import { generateCstDts } from "chevrotain";
import { ShakespeareParser } from "./parser";

/**
 * This script generates CST types for the Shakespeare parser.
 * To run: `yarn ts-node $(pwd)/generate-cst-types.ts` in this directory.
 *
 * The `$(pwd)` makes the path absolute. Due to some reason, relative paths with ts-node
 * aren't working on my side.
 */

const productions = new ShakespeareParser().getGAstProductions();
const dtsString = generateCstDts(productions);

const dtsPath = resolve(__dirname, "./cst.d.ts");
writeFileSync(dtsPath, dtsString);
