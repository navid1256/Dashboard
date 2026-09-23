const fs = require("node:fs");
const path = require("node:path");

const outputPath = path.join(__dirname, "..", "assets", "css", "output.css");
let css = fs.readFileSync(outputPath, "utf8");

css = css.replace(/    (?:-webkit-)?text-size-adjust: 100%;\r?\n/g, "");

css = css.replace(
  /(img, svg, video, canvas, audio, iframe, embed, object \{\n\s+display: block;)\n\s+vertical-align: middle;/,
  "$1"
);

fs.writeFileSync(outputPath, css, "utf8");