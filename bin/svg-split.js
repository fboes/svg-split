#!/usr/bin/env node

import * as fs from "fs";
import { SvgSplit } from "../src/SvgSplit.js";
import { getHtmlPreview } from "../src/Html.js";

const consoleExit = (message, code = 0) => {
  if (code === 0) {
    console.log(message);
  } else {
    console.error("⛔️ " + message);
  }
  process.exit(code);
};

const fileInput = process.argv[2];
if (fileInput === undefined || fileInput === "--help") {
  consoleExit(`Usage:
  ${process.argv[1]} SVG_FILE [OUTPUT_PATH] [FILTER]

Parameters:
  SVG_FILE     relative path to SVG file to be splitted.
  OUTPUT_PATH  optional path where the splitted parts will be placed in.
               Defaults to '.'
  FILTER       if set only parts with this string present will be exported
               You may filter for colors to only have some parts of your
               SVG exportetd. Defaults to '', which will output all parts.
               You may also use 'red', 'blue' and 'green' for color
               substitution.

Split a single SVG file into multiple SVG files, each file containing
one single SVG element.

If the number of elements is odd and a rectangle is present, it is used
as a "cookie cutter" to make the intersecting forms cut-outs.
`);
}

if (!fs.existsSync(fileInput)) {
  consoleExit("File not found", 2);
}

const fileOutputPath = (process.argv[3] ?? ".").replace(/\/$/, "") + "/";
if (!fs.existsSync(fileOutputPath)) {
  consoleExit("Output path not found", 3);
}

let filter = process.argv[4] ?? "";

// -----------------------------------------------------------------------------
// Read

const svg = new SvgSplit(
  fs.readFileSync(fileInput, { encoding: "utf8", flag: "r" })
);
console.log(`📎 Found ${svg.elements.length} elements`);

if (svg.elements.length % 2) {
  svg.applyCookieCutter() && console.log("🍪 Using rectangle as cookie cutter");
}

if (filter) {
  filter = svg.convertColorCode(filter);
  svg.filter(filter);
  console.log(`🔎 Using filter, return only "${filter}"`);
}

// -----------------------------------------------------------------------------
// Write
const fileParts = fileInput.match(/^(.+)(\.[^.]+)$/);
let counter = 1;
let filesOutput = [];
for (const svgData of svg.fileData) {
  const fileOutputBase =
    fileParts[1] + "-" + String(counter++).padStart(2, "0") + fileParts[2];
  const fileOutput = fileOutputPath + fileOutputBase;
  fs.writeFileSync(fileOutput, svgData);
  console.log(`✅ ${fileOutput} written`);
  filesOutput.push(fileOutputBase);
}

fs.writeFileSync(
  fileOutputPath + "index.html",
  getHtmlPreview(filesOutput, fileInput)
);
console.log(`✅ ${fileOutputPath + "index.html"} written`);

consoleExit("✅ Done");
