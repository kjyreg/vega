#!/usr/bin/env node
// Render a Vega specification to PNG, using node canvas

var helpText =
  "Render a Vega specification to PNG.\n\n" +
  "Usage:\n" +
  "  vg2png vega_json_file [output_png_file]\n" +
  "  If output_png_file is not provided, writes to stdout.\n\n" +
  "To load data, you may need to set a base directory:\n" +
  "  For web retrieval, use `-b http://host/data/`. \n" +
  "  For files, use `-b file:///dir/data/` (absolute) or `-b data/` (relative).";

// import required libraries
var path = require("path");
var fs = require("fs");
var vg = require("../index");

// arguments
var args = require("optimist")
  .usage(helpText)
  .demand(1)
  .string('b').alias('b', 'base')
  .describe('b', 'Base directory for data loading.')
  .argv;

// set baseURL if provided on command line
var base = "file://" + process.cwd() + path.sep;
if (args.b) {
  // if no protocol, assume files, relative to current dir
  base = /^[A-Za-z]+\:\/\//.test(args.b) ? args.b + path.sep
    : "file://" + process.cwd() + path.sep + args.b + path.sep;
}
vg.config.baseURL = base;

// input / output files
var specFile = args._[0],
    outputFile = args._[1] || null;

// load spec, render to png
fs.readFile(specFile, "utf8", function(err, text) {
  if (err) throw err;
  var spec = JSON.parse(text);
  convert(spec);
});

// ---

function writePNG(canvas, file) {
  var out = file ? fs.createWriteStream(file) : process.stdout;
  var stream = canvas.createPNGStream();
  stream.on("data", function(chunk) { out.write(chunk); });
}

function convert(spec) {
  vg.headless.convert(spec, "canvas", function(err, data) {
    if (err) throw err;
    writePNG(data.canvas, outputFile);
  });
}