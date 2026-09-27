import { DecisionStates } from "./decision.js";
import type { ProfileCondition } from "./profile.js";

export const QUESTION_MODULE_SCHEMA_VERSION = 1 as const;

export const QuestionTypes = {
  TEXT: "text",
  SELECT: "select",
  MULTI_SELECT: "multi-select",
  BOOLEAN: "boolean",
  REPEATABLE_GROUP: "repeatable-group",
} as const;

export type QuestionType = (typeof QuestionTypes)[keyof typeof QuestionTypes];

export const AllowedQuestionDecisionStates = {
  PENDING: DecisionStates.PENDING,
  NOT_APPLICABLE: DecisionStates.NOT_APPLICABLE,
} as const;

export type AllowedQuestionDecisionState =
  (typeof AllowedQuestionDecisionStates)[keyof typeof AllowedQuestionDecisionStates];

export interface QuestionOption {
  readonly value: string;
  readonly label: string;
}

export interface QuestionBase {
  readonly id: string;
  readonly target: string;
  readonly prompt: string;
  readonly required: boolean;
  readonly condition?: ProfileCondition;
  readonly allowedDecisionStates?: readonly AllowedQuestionDecisionState[];
}

export type Question =
  | (QuestionBase & { readonly type: typeof QuestionTypes.TEXT })
  | (QuestionBase & {
      readonly type: typeof QuestionTypes.SELECT;
      readonly options: readonly QuestionOption[];
    })
  | (QuestionBase & {
      readonly type: typeof QuestionTypes.MULTI_SELECT;
      readonly options: readonly QuestionOption[];
      readonly allowCustomValues: boolean;
    })
  | (QuestionBase & { readonly type: typeof QuestionTypes.BOOLEAN })
  | (QuestionBase & {
      readonly type: typeof QuestionTypes.REPEATABLE_GROUP;
      readonly questions: readonly Question[];
    });

export interface QuestionModule {
  readonly schemaVersion: typeof QUESTION_MODULE_SCHEMA_VERSION;
  readonly id: string;
  readonly version: number;
  readonly questions: readonly Question[];
}
