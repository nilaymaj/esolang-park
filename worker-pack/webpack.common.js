const path = require("path");
const fs = require("fs");

const langNames = fs.readdirSync("languages").filter((name) => {
  const stats = fs.statSync(`./languages/${name}`);
  return stats.isDirectory();
});

const entryPoints = {};
for (const lang of langNames) {
  entryPoints[lang] = `./languages/${lang}/engine.ts`;
}

module.exports = {
  entry: entryPoints,
  output: {
    path: path.resolve(__dirname, "../public/workers"),
    filename: "[name].js",
  },
  resolve: { extensions: [".ts", ".js"] },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          configFile: path.resolve(__dirname, "tsconfig.json"),
        },
      },
    ],
  },
};
