#!/usr/bin/env node

import { runCli } from "./cli/run-cli.ts";
import { createProfileResourceSelection } from "./adapters/profiles/create-profile-resource-selection.ts";
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
import { readPackageVersion } from "./adapters/package/read-package-version.ts";

const packageRootUrl = new URL("../", import.meta.url);
const questionPrompter = new InquirerQuestionPrompter();
const targetInspector = new FileSystemGenerationTargetInspector(process.cwd());
const generationWriter = new FileSystemGenerationWriter(process.cwd());

const exitCode = await runCli(process.argv.slice(2), {
  confirmGeneration: (plan) =>
    confirmGeneration({ count: plan.items.length, destination: process.cwd() }),
  writeGeneration: (plan) => generationWriter.write(plan),
  initialize: async ({ answersPath, profilePath, overridesPath }) => {
    const { manifestPath, reader } = await createProfileResourceSelection({
      packageRootUrl,
      profilePath,
      overridesPath,
    });
    const hasAnswersPath = answersPath !== undefined;
    const initializedProject = hasAnswersPath
      ? await initializeProjectFromAnswers({
          answers: await readAnswersFile(answersPath),
          manifestPath,
          reader,
          renderer: tokenTemplateRenderer,
        })
      : await initializeProject({
          manifestPath,
          prompter: questionPrompter,
          reader,
          renderer: tokenTemplateRenderer,
        });
    const plan = await planProjectGeneration({
      documents: initializedProject.documents,
      inspector: targetInspector,
    });

    return { ...initializedProject, plan };
  },
  output: console,
  version: await readPackageVersion(packageRootUrl),
});

process.exitCode = exitCode;
