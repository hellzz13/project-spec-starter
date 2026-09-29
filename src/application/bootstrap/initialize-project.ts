import {
  PROJECT_SPECIFICATION_SCHEMA_VERSION,
  type ProjectSpecification,
} from "../../domain/project-specification.ts";
import type { ProfileResourceReader } from "../../ports/profile-resource-reader.ts";
import type { QuestionPrompter } from "../../ports/question-prompter.ts";
import type { TemplateRenderer } from "../../ports/template-renderer.ts";
import { parseAnswers } from "../answers/parse-answers.ts";
import type { RenderedDocument } from "../documents/render-profile-documents.ts";
import { createDocumentModel } from "../documents/create-document-model.ts";
import { renderProfileDocuments } from "../documents/render-profile-documents.ts";
import { runInterview } from "../interview/run-interview.ts";
import { loadProfile } from "../profiles/load-profile.ts";

export interface InitializeProjectOptions {
  readonly manifestPath: string;
  readonly reader: ProfileResourceReader;
  readonly prompter: QuestionPrompter;
  readonly renderer: TemplateRenderer;
}

export interface InitializedProject {
  readonly answers: Readonly<Record<string, unknown>>;
  readonly specification: ProjectSpecification;
  readonly documents: readonly RenderedDocument[];
}

export async function initializeProject(
  options: InitializeProjectOptions,
): Promise<InitializedProject> {
  const { manifestPath, reader, prompter, renderer } = options;
  const loadedProfile = await loadProfile({ manifestPath, reader });
  const answers = await runInterview({
    questionModules: loadedProfile.questionModules,
    defaults: loadedProfile.profile.defaults,
    schemaVersion: PROJECT_SPECIFICATION_SCHEMA_VERSION,
    prompter,
  });
  const specification = parseAnswers(answers);
  const model = createDocumentModel(specification);
  const documents = renderProfileDocuments({
    conditionSource: answers,
    loadedProfile,
    model,
    renderer,
  });

  return { answers, specification, documents };
}
