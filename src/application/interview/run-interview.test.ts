import { describe, expect, it } from "vitest";

import {
  AllowedQuestionDecisionStates,
  QUESTION_MODULE_SCHEMA_VERSION,
  QuestionTypes,
  type Question,
  type QuestionModule,
} from "../../domain/question-module.ts";
import { ProfileConditionOperators } from "../../domain/profile.ts";
import { InterviewErrorCodes } from "./interview-error.ts";
import { runInterview } from "./run-interview.ts";
import type {
  InterviewAnswer,
  QuestionPrompter,
} from "../../ports/question-prompter.ts";
import { InterviewAnswerKinds } from "../../ports/question-prompter.ts";

function moduleWith(questions: readonly Question[]): QuestionModule {
  return {
    schemaVersion: QUESTION_MODULE_SCHEMA_VERSION,
    id: "test-module",
    version: 1,
    questions,
  };
}

function question(value: Question): Question {
  return value;
}

function createPrompter(
  answers: readonly InterviewAnswer[],
  asked: string[] = [],
): QuestionPrompter {
  let answerIndex = 0;

  return {
    askQuestion({ question: askedQuestion }) {
      asked.push(askedQuestion.id);
      const answer = answers[answerIndex];
      answerIndex += 1;
      const configuredAnswerIsMissing = answer === undefined;

      if (configuredAnswerIsMissing) {
        return Promise.reject(
          new Error(`No answer configured for ${askedQuestion.id}`),
        );
      }

      return Promise.resolve(answer);
    },
  };
}

describe("runInterview", () => {
  it("asks questions sequentially, evaluates conditions against accumulated answers, and copies defaults", async () => {
    const defaults = {
      project: { name: "Default name", nature: { kind: "backend" } },
    };
    const originalDefaults = structuredClone(defaults);
    const asked: string[] = [];
    const questionModules = [
      moduleWith([
        question({
          type: QuestionTypes.TEXT,
          id: "name",
          target: "project.name",
          prompt: "Name?",
          required: true,
        }),
        question({
          type: QuestionTypes.SELECT,
          id: "nature",
          target: "project.nature.kind",
          prompt: "Nature?",
          required: true,
          options: [{ value: "custom", label: "Other" }],
        }),
        question({
          type: QuestionTypes.TEXT,
          id: "custom-description",
          target: "project.nature.description",
          prompt: "Describe?",
          required: true,
          condition: {
            operator: ProfileConditionOperators.EQUALS,
            path: "project.nature.kind",
            value: "custom",
          },
        }),
        question({
          type: QuestionTypes.TEXT,
          id: "backend-details",
          target: "project.backendDetails",
          prompt: "Backend details?",
          required: true,
          condition: {
            operator: ProfileConditionOperators.EQUALS,
            path: "project.nature.kind",
            value: "backend",
          },
        }),
      ]),
      moduleWith([
        question({
          type: QuestionTypes.BOOLEAN,
          id: "agents",
          target: "project.agentSupport",
          prompt: "Agents?",
          required: true,
        }),
      ]),
    ];

    const answers = await runInterview({
      questionModules,
      defaults,
      schemaVersion: 1,
      prompter: createPrompter(
        [
          { kind: InterviewAnswerKinds.ANSWER, value: "New project" },
          { kind: InterviewAnswerKinds.ANSWER, value: "custom" },
          { kind: InterviewAnswerKinds.ANSWER, value: "Research tool" },
          { kind: InterviewAnswerKinds.ANSWER, value: false },
        ],
        asked,
      ),
    });

    expect(asked).toEqual(["name", "nature", "custom-description", "agents"]);
    expect(answers).toEqual({
      schemaVersion: 1,
      project: {
        name: "New project",
        nature: { kind: "custom", description: "Research tool" },
        agentSupport: false,
      },
    });
    expect(defaults).toEqual(originalDefaults);
    expect(answers).not.toBe(defaults);
  });

  it("materializes declared decision responses and leaves other targets unwrapped", async () => {
    const questionModules = [
      moduleWith([
        question({
          type: QuestionTypes.TEXT,
          id: "summary",
          target: "project.summary",
          prompt: "Summary?",
          required: true,
          allowedDecisionStates: [AllowedQuestionDecisionStates.PENDING],
        }),
        question({
          type: QuestionTypes.TEXT,
          id: "name",
          target: "project.name",
          prompt: "Name?",
          required: true,
        }),
      ]),
    ];

    const answers = await runInterview({
      questionModules,
      defaults: {},
      schemaVersion: 1,
      prompter: createPrompter([
        { kind: InterviewAnswerKinds.DECISION, state: "pending" },
        { kind: InterviewAnswerKinds.ANSWER, value: "Plain value" },
      ]),
    });

    expect(answers).toEqual({
      schemaVersion: 1,
      project: {
        summary: { state: "pending" },
        name: "Plain value",
      },
    });
  });

  it("materializes a declared not-applicable decision state", async () => {
    const answers = await runInterview({
      questionModules: [
        moduleWith([
          question({
            type: QuestionTypes.TEXT,
            id: "summary",
            target: "project.summary",
            prompt: "Summary?",
            required: true,
            allowedDecisionStates: [
              AllowedQuestionDecisionStates.NOT_APPLICABLE,
            ],
          }),
        ]),
      ],
      defaults: {},
      schemaVersion: 1,
      prompter: createPrompter([
        {
          kind: InterviewAnswerKinds.DECISION,
          state: AllowedQuestionDecisionStates.NOT_APPLICABLE,
        },
      ]),
    });

    expect(answers).toEqual({
      schemaVersion: 1,
      project: { summary: { state: "not-applicable" } },
    });
  });

  it("processes repeatable units, evaluates child conditions in each item scope, and supports no items", async () => {
    const groupQuestion = question({
      type: QuestionTypes.REPEATABLE_GROUP,
      id: "units",
      target: "project.organization.units",
      prompt: "Units?",
      required: true,
      questions: [
        question({
          type: QuestionTypes.TEXT,
          id: "unit-name",
          target: "name",
          prompt: "Unit name?",
          required: true,
        }),
        question({
          type: QuestionTypes.SELECT,
          id: "unit-nature",
          target: "nature.kind",
          prompt: "Unit nature?",
          required: true,
          options: [{ value: "custom", label: "Other" }],
        }),
        question({
          type: QuestionTypes.TEXT,
          id: "unit-custom-description",
          target: "nature.description",
          prompt: "Describe unit?",
          required: true,
          condition: {
            operator: ProfileConditionOperators.EQUALS,
            path: "nature.kind",
            value: "custom",
          },
        }),
      ],
    });
    const asked: string[] = [];
    const answers = await runInterview({
      questionModules: [moduleWith([groupQuestion])],
      defaults: {},
      schemaVersion: 1,
      prompter: createPrompter(
        [
          { kind: InterviewAnswerKinds.GROUP, items: [{}, {}] },
          { kind: InterviewAnswerKinds.ANSWER, value: "API" },
          { kind: InterviewAnswerKinds.ANSWER, value: "custom" },
          { kind: InterviewAnswerKinds.ANSWER, value: "Batch pipeline" },
          { kind: InterviewAnswerKinds.ANSWER, value: "Web" },
          { kind: InterviewAnswerKinds.ANSWER, value: "frontend" },
        ],
        asked,
      ),
    });

    expect(asked).toEqual([
      "units",
      "unit-name",
      "unit-nature",
      "unit-custom-description",
      "unit-name",
      "unit-nature",
    ]);
    expect(answers).toEqual({
      schemaVersion: 1,
      project: {
        organization: {
          units: [
            {
              name: "API",
              nature: { kind: "custom", description: "Batch pipeline" },
            },
            {
              name: "Web",
              nature: { kind: "frontend" },
            },
          ],
        },
      },
    });

    const noUnits = await runInterview({
      questionModules: [moduleWith([groupQuestion])],
      defaults: {},
      schemaVersion: 1,
      prompter: createPrompter([
        { kind: InterviewAnswerKinds.GROUP, items: [] },
      ]),
    });

    expect(noUnits).toEqual({
      schemaVersion: 1,
      project: { organization: { units: [] } },
    });
  });

  it.each(["__proto__.polluted", "project..name", "constructor.prototype.x"])(
    "rejects unsafe or empty target segments: %s",
    async (target) => {
      await expect(
        runInterview({
          questionModules: [
            moduleWith([
              question({
                type: QuestionTypes.TEXT,
                id: "unsafe",
                target,
                prompt: "Unsafe?",
                required: true,
              }),
            ]),
          ],
          defaults: {},
          schemaVersion: 1,
          prompter: createPrompter([
            { kind: InterviewAnswerKinds.ANSWER, value: "value" },
          ]),
        }),
      ).rejects.toMatchObject({ code: InterviewErrorCodes.UNSAFE_TARGET });
    },
  );

  it("validates every module target before asking the first question", async () => {
    const asked: string[] = [];

    await expect(
      runInterview({
        questionModules: [
          moduleWith([
            question({
              type: QuestionTypes.TEXT,
              id: "safe-first",
              target: "project.name",
              prompt: "Name?",
              required: true,
            }),
          ]),
          moduleWith([
            question({
              type: QuestionTypes.TEXT,
              id: "unsafe-later",
              target: "project.constructor.prototype.x",
              prompt: "Unsafe?",
              required: true,
            }),
          ]),
        ],
        defaults: {},
        schemaVersion: 1,
        prompter: createPrompter(
          [{ kind: InterviewAnswerKinds.ANSWER, value: "value" }],
          asked,
        ),
      }),
    ).rejects.toMatchObject({ code: InterviewErrorCodes.UNSAFE_TARGET });

    expect(asked).toEqual([]);
  });

  it("rejects target traversal through a non-object default", async () => {
    await expect(
      runInterview({
        questionModules: [
          moduleWith([
            question({
              type: QuestionTypes.TEXT,
              id: "conflict",
              target: "project.name.value",
              prompt: "Value?",
              required: true,
            }),
          ]),
        ],
        defaults: { project: { name: "Existing scalar" } },
        schemaVersion: 1,
        prompter: createPrompter([
          { kind: InterviewAnswerKinds.ANSWER, value: "new" },
        ]),
      }),
    ).rejects.toMatchObject({ code: InterviewErrorCodes.TARGET_CONFLICT });
  });
});
