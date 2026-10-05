#!/usr/bin/env node

import { runCli } from "./cli/run-cli.ts";
import { FileSystemProfileResourceReader } from "./adapters/profiles/file-system-profile-resource-reader.ts";
import { FileSystemGenerationTargetInspector } from "./adapters/generation/file-system-generation-target-inspector.ts";
import { InquirerQuestionPrompter } from "./adapters/prompts/inquirer-question-prompter.ts";
import { tokenTemplateRenderer } from "./adapters/templates/render-token-template.ts";
import {
  initializeProject,
  initializeProjectFromAnswers,
} from "./application/bootstrap/initialize-project.ts";
import { readAnswersFile } from "./adapters/answers/read-answers-file.ts";
import { planProjectGeneration } from "./application/generation/plan-project-generation.ts";
import { FileSystemGenerationWriter } from "./adapters/generation/file-system-generation-writer.ts";
import { confirmGeneration } from "./adapters/prompts/confirm-generation.ts";

const packageRootUrl = new URL("../", import.meta.url);
const profileReader = new FileSystemProfileResourceReader(packageRootUrl);
const questionPrompter = new InquirerQuestionPrompter();
const targetInspector = new FileSystemGenerationTargetInspector(process.cwd());
const generationWriter = new FileSystemGenerationWriter(process.cwd());

const exitCode = await runCli(process.argv.slice(2), {
  confirmGeneration: (plan) =>
    confirmGeneration({ count: plan.items.length, destination: process.cwd() }),
  writeGeneration: (plan) => generationWriter.write(plan),
  initialize: async (answersPath) => {
    const hasAnswersPath = answersPath !== undefined;
    const initializedProject = hasAnswersPath
      ? await initializeProjectFromAnswers({
          answers: await readAnswersFile(answersPath),
          manifestPath: "profiles/default/profile.json",
          reader: profileReader,
          renderer: tokenTemplateRenderer,
        })
      : await initializeProject({
          manifestPath: "profiles/default/profile.json",
          prompter: questionPrompter,
          reader: profileReader,
          renderer: tokenTemplateRenderer,
        });
    const plan = await planProjectGeneration({
      documents: initializedProject.documents,
      inspector: targetInspector,
    });

    return { ...initializedProject, plan };
  },
  output: console,
  version: "0.0.0",
});

process.exitCode = exitCode;
