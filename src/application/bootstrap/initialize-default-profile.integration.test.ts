import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { FileSystemProfileResourceReader } from "../../adapters/profiles/file-system-profile-resource-reader.ts";
import { readAnswersFile } from "../../adapters/answers/read-answers-file.ts";
import { tokenTemplateRenderer } from "../../adapters/templates/render-token-template.ts";
import {
  InterviewAnswerKinds,
  type InterviewAnswer,
  type QuestionPrompter,
} from "../../ports/question-prompter.ts";
import {
  initializeProject,
  initializeProjectFromAnswers,
} from "./initialize-project.ts";

const AnswersByQuestionId: Readonly<Record<string, InterviewAnswer>> = {
  "project-name": answer("Billing API"),
  "project-summary": answer("API de cobrança"),
  "project-organization": answer("single-app"),
  "project-nature": answer("backend"),
  "project-capabilities": answer(["http-api"]),
  "agent-support": answer(false),
  "uses-node": answer(true),
  "node-version": answer("24"),
  "engineering-standard": answer("recommended"),
};

const prompter: QuestionPrompter = {
  askQuestion({ question }) {
    const configuredAnswer = AnswersByQuestionId[question.id];
    const configuredAnswerIsMissing = configuredAnswer === undefined;

    if (configuredAnswerIsMissing) {
      return Promise.reject(
        new Error(`Resposta de teste ausente para: ${question.id}`),
      );
    }

    return Promise.resolve(configuredAnswer);
  },
};

describe("initializeProject with the packaged default profile", () => {
  it("renders versioned JSON answers without invoking a prompter", async () => {
    const projectRootUrl = new URL("../../../", import.meta.url);
    const reader = new FileSystemProfileResourceReader(projectRootUrl);
    const answersPath = fileURLToPath(
      new URL("../../../tests/fixtures/minimal-answers.json", import.meta.url),
    );
    const answers = await readAnswersFile(answersPath);

    const result = await initializeProjectFromAnswers({
      answers,
      manifestPath: "profiles/default/profile.json",
      reader,
      renderer: tokenTemplateRenderer,
    });

    expect(result.specification.name).toBe("Billing API");
    expect(result.documents.some(({ output }) => output === "PROJECT.md")).toBe(
      true,
    );
  });

  it("renders the expected preview without writing files", async () => {
    const projectRootUrl = new URL("../../../", import.meta.url);
    const reader = new FileSystemProfileResourceReader(projectRootUrl);

    const result = await initializeProject({
      manifestPath: "profiles/default/profile.json",
      prompter,
      reader,
      renderer: tokenTemplateRenderer,
    });

    expect(result.answers).toMatchObject({
      engineeringStandard: "recommended",
      runtime: { node: { enabled: true, version: "24" } },
    });
    expect(result.specification.runtime).toEqual({
      node: { enabled: true, version: "24" },
    });
    expect(result.specification.engineeringStandard).toBe("recommended");
    expect(
      result.documents.find(({ output }) => output === ".nvmrc")?.content,
    ).toBe("24\n");
    expect(result.documents.map(({ output }) => output)).toEqual([
      "PROJECT.md",
      "docs/ENGINEERING.md",
      "docs/BUSINESS_RULES.md",
      "docs/GITFLOW.md",
      "docs/ENVIRONMENTS.md",
      "CONTRIBUTING.md",
      "docs/BOOTSTRAP_CHECKLIST.md",
      ".nvmrc",
    ]);
    expect(
      result.documents.every(({ content }) => {
        const hasUnresolvedToken = /\{\{[A-Z][A-Z0-9_]*\}\}/u.test(content);

        return !hasUnresolvedToken;
      }),
    ).toBe(true);
  });
});

function answer(value: unknown): InterviewAnswer {
  return { kind: InterviewAnswerKinds.ANSWER, value };
}
