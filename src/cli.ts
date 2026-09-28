#!/usr/bin/env node

import { runCli } from "./cli/run-cli.ts";
import { FileSystemProfileResourceReader } from "./adapters/profiles/file-system-profile-resource-reader.ts";
import { InquirerQuestionPrompter } from "./adapters/prompts/inquirer-question-prompter.ts";
import { tokenTemplateRenderer } from "./adapters/templates/render-token-template.ts";
import { initializeProject } from "./application/bootstrap/initialize-project.ts";

const packageRootUrl = new URL("../", import.meta.url);
const profileReader = new FileSystemProfileResourceReader(packageRootUrl);
const questionPrompter = new InquirerQuestionPrompter();

const exitCode = await runCli(process.argv.slice(2), {
  initialize: () =>
    initializeProject({
      manifestPath: "profiles/default/profile.json",
      prompter: questionPrompter,
      reader: profileReader,
      renderer: tokenTemplateRenderer,
    }),
  output: console,
  version: "0.0.0",
});

process.exitCode = exitCode;
