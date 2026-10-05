import { describe, expect, it } from "vitest";

import { AnswersErrorCodes } from "../answers/answers-error.ts";
import { PROJECT_SPECIFICATION_SCHEMA_VERSION } from "../../domain/project-specification.ts";
import type { InterviewAnswer } from "../../ports/question-prompter.ts";
import { InterviewAnswerKinds } from "../../ports/question-prompter.ts";
import type { ProfileResourceReader } from "../../ports/profile-resource-reader.ts";
import type { QuestionPrompter } from "../../ports/question-prompter.ts";
import type { TemplateRenderer } from "../../ports/template-renderer.ts";
import { initializeProject } from "./initialize-project.ts";

const manifestPath = "profiles/default/profile.json";

const resources = {
  "profiles/default/profile.json": JSON.stringify({
    schemaVersion: 1,
    id: "default",
    version: 1,
    defaults: { engineeringStandard: "recommended" },
    customizable: [],
    engineeringStandards: {},
    questionModules: ["profiles/default/questions/project.json"],
    documents: [
      {
        id: "project",
        output: "PROJECT.md",
        template: "templates/project.md",
      },
    ],
  }),
  "profiles/default/questions/project.json": JSON.stringify({
    schemaVersion: 1,
    id: "project",
    version: 1,
    questions: [
      {
        type: "text",
        id: "project-name",
        target: "project.name",
        prompt: "Name?",
        required: true,
      },
      {
        type: "text",
        id: "project-summary",
        target: "project.summary",
        prompt: "Summary?",
        required: true,
        allowedDecisionStates: ["pending"],
      },
      {
        type: "select",
        id: "project-organization",
        target: "project.organization.kind",
        prompt: "Organization?",
        required: true,
        options: [{ value: "single-app", label: "Single application" }],
      },
      {
        type: "select",
        id: "project-nature",
        target: "project.nature.kind",
        prompt: "Nature?",
        required: true,
        options: [{ value: "backend", label: "Backend" }],
      },
      {
        type: "multi-select",
        id: "project-capabilities",
        target: "project.capabilities",
        prompt: "Capabilities?",
        required: true,
        allowCustomValues: false,
        options: [{ value: "http-api", label: "HTTP API" }],
      },
      {
        type: "boolean",
        id: "agent-support",
        target: "project.agentSupport",
        prompt: "Agents?",
        required: true,
      },
    ],
  }),
  "templates/project.md": "# {{PROJECT_NAME}}\n{{PROJECT_SUMMARY}}",
} as const;

const reader: ProfileResourceReader = {
  readText(path) {
    const resource = resources[path as keyof typeof resources];
    const resourceIsMissing = resource === undefined;

    if (resourceIsMissing) {
      return Promise.reject(new Error(`Missing in-memory resource: ${path}`));
    }

    return Promise.resolve(resource);
  },
};

const renderer: TemplateRenderer = {
  render({ template, values }) {
    return template.replace(/\{\{([A-Z_]+)\}\}/gu, (_token, key: string) => {
      return values[key] ?? "";
    });
  },
};

function createPrompter(answers: readonly InterviewAnswer[]): QuestionPrompter {
  let answerIndex = 0;

  return {
    askQuestion() {
      const answer = answers[answerIndex];
      answerIndex += 1;
      const configuredAnswerIsMissing = answer === undefined;

      if (configuredAnswerIsMissing) {
        return Promise.reject(new Error("No configured interview answer."));
      }

      return Promise.resolve(answer);
    },
  };
}

function createValidAnswers(name = "Billing API"): readonly InterviewAnswer[] {
  return [
    { kind: InterviewAnswerKinds.ANSWER, value: name },
    { kind: InterviewAnswerKinds.ANSWER, value: "An HTTP billing API" },
    {
      kind: InterviewAnswerKinds.ANSWER,
      value: "single-app",
    },
    { kind: InterviewAnswerKinds.ANSWER, value: "backend" },
    { kind: InterviewAnswerKinds.ANSWER, value: ["http-api"] },
    { kind: InterviewAnswerKinds.ANSWER, value: false },
  ];
}

describe("initializeProject", () => {
  it("loads the profile, runs the interview, validates answers, and renders documents in memory", async () => {
    const result = await initializeProject({
      manifestPath,
      reader,
      prompter: createPrompter(createValidAnswers()),
      renderer,
    });

    expect(result.answers).toMatchObject({
      schemaVersion: PROJECT_SPECIFICATION_SCHEMA_VERSION,
      engineeringStandard: "recommended",
      project: { name: "Billing API" },
    });
    expect(result.specification).toEqual({
      engineeringStandard: "recommended",
      schemaVersion: PROJECT_SPECIFICATION_SCHEMA_VERSION,
      name: "Billing API",
      summary: {
        state: "defined",
        value: "An HTTP billing API",
      },
      organization: { kind: "single-app" },
      nature: { kind: "backend" },
      capabilities: ["http-api"],
      agentSupport: false,
    });
    expect(result.documents).toEqual([
      {
        id: "project",
        output: "PROJECT.md",
        content: "# Billing API\nAn HTTP billing API",
      },
    ]);
  });

  it("propagates invalid interview answers from the answer parser", async () => {
    await expect(
      initializeProject({
        manifestPath,
        reader,
        prompter: createPrompter(createValidAnswers(" ")),
        renderer,
      }),
    ).rejects.toMatchObject({
      code: AnswersErrorCodes.INVALID_ANSWERS,
      path: "project.name",
    });
  });
});
