// @ts-check
const path = require("path");
const fs = require("fs");
const args = process.argv;

const langId = args[2];
const langName = args[3];
if (!langId || !langName) {
  console.log(
    `Usage: npm run add-new-language <language-id> <language-name>
          yarn run add-new-language <language-id> <language-name>`
  );
  process.exit(1);
}

// Check if language provider directory already exists
const dir = path.resolve(__dirname, "../languages/", langId);
if (fs.existsSync(dir)) {
  console.log(`Language ID '${langId}' already exists.`);
  process.exit(0);
}
fs.mkdirSync(dir);

/**
 * Copy a file from source path to destination.
 * Also removes first line from file, which contains the "@ts-nocheck" comment
 * @param {string} src Absolute path to source file
 * @param {string} dest Absolute path to destination
 */
const copyFile = (src, dest) => {
  const rawContents = fs.readFileSync(src).toString();
  const lines = rawContents.split("\n");
  const firstLine = lines.shift();
  if (firstLine !== "// @ts-nocheck") {
    console.error(`Template file '${src}' doesn't have @ts-nocheck comment`);
    process.exit(1);
  }
  fs.writeFileSync(dest, lines.join("\n"));
};

{
  // Copy language provider template files (except the README)
  ["index.ts", "common.ts", "runtime.ts", "engine.ts", "renderer.tsx"].forEach(
    (filename) => {
      const srcPath = path.resolve(__dirname, `new-lang-template/${filename}`);
      const destPath = path.resolve(dir, filename);
      copyFile(srcPath, destPath);
    }
  );
}

{
  // Copy the language provider README file
  const src = path.resolve(__dirname, "./new-lang-template/README.md");
  const dest = path.resolve(dir, "README.md");
  const contents = fs.readFileSync(src).toString();
  const finalContents = contents.replace("$LANG_NAME", langName);
  fs.writeFileSync(dest, finalContents);
}

{
  // Generate Next.js page
  const src = path.resolve(__dirname, "./new-lang-template/ide-page.tsx");
  const dest = path.resolve(__dirname, `../pages/ide/${langId}.tsx`);
  const contents = fs.readFileSync(src).toString();
  const finalContents = contents
    .replace("$LANG_ID", langId)
    .replace("$LANG_NAME", langName);
  fs.writeFileSync(dest, finalContents);
}

{
  // Add entry to `pages/languages.json`
  const jsonPath = path.resolve(__dirname, "../pages/languages.json");
  const contents = JSON.parse(fs.readFileSync(jsonPath).toString());
  if (!Array.isArray(contents)) {
    console.error("languages.json is malformed, please check its contents");
    process.exit(1);
  }
  const existingIdx = contents.findIndex((c) => c.id === langId);
  if (existingIdx !== -1) {
    console.error("languages.json already contains entry.");
    process.exit(1);
  }
  const newContents = [...contents, { display: langName, id: langId }];
  fs.writeFileSync(jsonPath, JSON.stringify(newContents, undefined, 2));
}

// Print success message
console.log(`Done! Created files for language '${langId}'`);
