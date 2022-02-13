// @ts-check
const fs = require("fs");
const path = require("path");
const peggy = require("peggy");

const grammarPath = path.resolve(__dirname, "grammar.peg");
const grammar = fs.readFileSync(grammarPath).toString();

const parser = peggy.generate(grammar, {
  output: "source",
  format: "commonjs",
  allowedStartRules: ["program"],
});

const outputPath = path.resolve(__dirname, "parser.out.js");
fs.writeFileSync(outputPath, parser);
