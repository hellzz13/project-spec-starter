import type {
  AllowedQuestionDecisionState,
  Question,
} from "../domain/question-module.ts";

export const InterviewAnswerKinds = {
  ANSWER: "answer",
  DECISION: "decision",
  GROUP: "group",
} as const;

export type InterviewAnswer =
  | {
      readonly kind: typeof InterviewAnswerKinds.ANSWER;
      readonly value: unknown;
    }
  | {
      readonly kind: typeof InterviewAnswerKinds.DECISION;
      readonly state: AllowedQuestionDecisionState;
    }
  | {
      readonly kind: typeof InterviewAnswerKinds.GROUP;
      readonly items: readonly Readonly<Record<string, unknown>>[];
    };

export interface QuestionPrompter {
  askQuestion(options: {
    readonly question: Question;
    readonly answers: Readonly<Record<string, unknown>>;
  }): Promise<InterviewAnswer>;
}
