import { describe, expect, it } from "vitest";

import {
  parseQuestionModule,
  QuestionModuleErrorCodes,
} from "./parse-question-module.js";

const validModule = {
  schemaVersion: 1,
  id: "core",
  version: 1,
  questions: [
    {
      type: "text",
      id: "name",
      target: "project.name",
      prompt: "Name?",
      required: true,
    },
    {
      type: "select",
      id: "kind",
      target: "project.kind",
      prompt: "Kind?",
      required: true,
      options: [{ value: "app", label: "Application" }],
      allowedDecisionStates: ["pending", "not-applicable"],
    },
    {
      type: "multi-select",
      id: "capabilities",
      target: "project.capabilities",
      prompt: "Capabilities?",
      required: true,
      options: [{ value: "web", label: "Web" }],
      allowCustomValues: true,
      condition: { operator: "equals", path: "project.kind", value: "app" },
    },
    {
      type: "boolean",
      id: "agents",
      target: "project.agentSupport",
      prompt: "Use agents?",
      required: true,
    },
    {
      type: "repeatable-group",
      id: "units",
      target: "organization.units",
      prompt: "Units?",
      required: true,
      questions: [
        {
          type: "text",
          id: "unit-name",
          target: "name",
          prompt: "Unit?",
          required: true,
        },
      ],
    },
  ],
};

describe("parseQuestionModule", () => {
  it("parses all supported question kinds in declaration order", () => {
    expect(parseQuestionModule(validModule)).toEqual(validModule);
  });

  it.each([
    [
      "required state",
      {
        ...validModule,
        questions: [{ ...validModule.questions[0], required: undefined }],
      },
      "questions[0].required",
    ],
    [
      "options",
      {
        ...validModule,
        questions: [{ ...validModule.questions[1], options: [] }],
      },
      "questions[0].options",
    ],
    [
      "child questions",
      {
        ...validModule,
        questions: [{ ...validModule.questions[4], questions: [] }],
      },
      "questions[0].questions",
    ],
    [
      "decision state",
      {
        ...validModule,
        questions: [
          { ...validModule.questions[0], allowedDecisionStates: ["defined"] },
        ],
      },
      "questions[0].allowedDecisionStates[0]",
    ],
    [
      "unknown kind",
      {
        ...validModule,
        questions: [{ ...validModule.questions[0], type: "date" }],
      },
      "questions[0].type",
    ],
  ])("rejects invalid %s with a path", (_label, moduleInput, path) => {
    expect(() => parseQuestionModule(moduleInput)).toThrow(
      expect.objectContaining({
        code: QuestionModuleErrorCodes.INVALID_QUESTION_MODULE,
        path,
      }),
    );
  });

  it("reports a future schema version", () => {
    expect(() =>
      parseQuestionModule({ ...validModule, schemaVersion: 2 }),
    ).toThrow(
      expect.objectContaining({
        code: QuestionModuleErrorCodes.UNSUPPORTED_QUESTION_MODULE_SCHEMA,
        path: "schemaVersion",
      }),
    );
  });
});
