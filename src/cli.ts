#!/usr/bin/env node

import { runCli } from "./cli/run-cli.js";

const exitCode = runCli(process.argv.slice(2), {
  output: console,
  version: "0.0.0",
});

process.exitCode = exitCode;
