import { DecisionStates } from "../../domain/decision.ts";
import {
  QuestionTypes,
  type Question,
  type QuestionModule,
} from "../../domain/question-module.ts";
import { evaluateProfileCondition } from "../profiles/evaluate-profile-condition.ts";
import { InterviewError, InterviewErrorCodes } from "./interview-error.ts";
import type { QuestionPrompter } from "../../ports/question-prompter.ts";
import { InterviewAnswerKinds } from "../../ports/question-prompter.ts";

const UnsafeTargetSegments = new Set(["__proto__", "prototype", "constructor"]);

export async function runInterview(options: {
  readonly questionModules: readonly QuestionModule[];
  readonly defaults: Readonly<Record<string, unknown>>;
  readonly schemaVersion: number;
  readonly prompter: QuestionPrompter;
}): Promise<Record<string, unknown>> {
  const answers = cloneRecord(options.defaults);
  answers.schemaVersion = options.schemaVersion;

  for (const questionModule of options.questionModules) {
    for (const question of questionModule.questions) {
      validateQuestionTargets(question);
    }
  }

  for (const questionModule of options.questionModules) {
    for (const question of questionModule.questions) {
      await collectQuestionAnswer({
        question,
        scope: answers,
        prompter: options.prompter,
      });
    }
  }

  return answers;
}

async function collectQuestionAnswer(options: {
  readonly question: Question;
  readonly scope: Record<string, unknown>;
  readonly prompter: QuestionPrompter;
}): Promise<void> {
  const { question, scope, prompter } = options;
  const questionConditionIsNotApplicable =
    question.condition !== undefined &&
    !evaluateProfileCondition({ condition: question.condition, source: scope });

  if (questionConditionIsNotApplicable) {
    return;
  }

  const response = await prompter.askQuestion({ question, answers: scope });
  const isRepeatableGroup = question.type === QuestionTypes.REPEATABLE_GROUP;

  if (isRepeatableGroup) {
    const isGroupResponse = response.kind === InterviewAnswerKinds.GROUP;
    const groupResponseIsInvalid = !isGroupResponse;

    if (groupResponseIsInvalid) {
      throw new InterviewError({
        code: InterviewErrorCodes.INVALID_GROUP_RESPONSE,
        target: question.target,
        message: `Question "${question.id}" must return a group response.`,
      });
    }

    const itemAnswers: Record<string, unknown>[] = [];

    for (const itemSeed of response.items) {
      const itemScope = cloneRecord(itemSeed);

      for (const childQuestion of question.questions) {
        await collectQuestionAnswer({
          question: childQuestion,
          scope: itemScope,
          prompter,
        });
      }

      itemAnswers.push(itemScope);
    }

    setTargetValue({
      scope,
      target: question.target,
      value: itemAnswers,
    });

    return;
  }

  const isAnswerResponse = response.kind === InterviewAnswerKinds.ANSWER;
  const isDecisionResponse = response.kind === InterviewAnswerKinds.DECISION;
  const questionSupportsDecisionStates =
    question.allowedDecisionStates !== undefined;
  const questionAllowsDecisionResponse =
    questionSupportsDecisionStates && isDecisionResponse;
  const decisionResponseIsNotAllowed =
    !questionSupportsDecisionStates && !isAnswerResponse;

  if (decisionResponseIsNotAllowed) {
    throw new InterviewError({
      code: InterviewErrorCodes.INVALID_DECISION_RESPONSE,
      target: question.target,
      message: `Question "${question.id}" does not allow a decision response.`,
    });
  }

  if (questionAllowsDecisionResponse) {
    const responseStateIsAllowed = question.allowedDecisionStates.includes(
      response.state,
    );
    const responseStateIsNotAllowed = !responseStateIsAllowed;

    if (responseStateIsNotAllowed) {
      throw new InterviewError({
        code: InterviewErrorCodes.INVALID_DECISION_RESPONSE,
        target: question.target,
        message: `Question "${question.id}" does not allow state "${response.state}".`,
      });
    }

    setTargetValue({
      scope,
      target: question.target,
      value: { state: response.state },
    });

    return;
  }

  const answerResponseIsMissing = !isAnswerResponse;

  if (answerResponseIsMissing) {
    throw new InterviewError({
      code: InterviewErrorCodes.INVALID_DECISION_RESPONSE,
      target: question.target,
      message: `Question "${question.id}" must return a value.`,
    });
  }

  const answerValue = questionSupportsDecisionStates
    ? { state: DecisionStates.DEFINED, value: response.value }
    : response.value;

  setTargetValue({ scope, target: question.target, value: answerValue });
}

function setTargetValue(options: {
  readonly scope: Record<string, unknown>;
  readonly target: string;
  readonly value: unknown;
}): void {
  const pathSegments = validateTargetPath(options.target);

  const parentSegments = pathSegments.slice(0, -1);
  let targetParent = options.scope;

  for (const pathSegment of parentSegments) {
    const hasExistingSegment = Object.hasOwn(targetParent, pathSegment);
    const targetSegmentIsMissing = !hasExistingSegment;

    if (targetSegmentIsMissing) {
      targetParent[pathSegment] = {};
    }

    const nextValue = targetParent[pathSegment];
    const existingValueIsRecord = isRecord(nextValue);
    const targetSegmentConflictsWithValue = !existingValueIsRecord;

    if (targetSegmentConflictsWithValue) {
      throw new InterviewError({
        code: InterviewErrorCodes.TARGET_CONFLICT,
        target: options.target,
        message: `Target "${options.target}" conflicts with a non-object value at "${pathSegment}".`,
      });
    }

    targetParent = nextValue;
  }

  const leafSegment = pathSegments.at(-1);
  const leafSegmentExists = leafSegment !== undefined;
  const targetHasNoLeafSegment = !leafSegmentExists;

  if (targetHasNoLeafSegment) {
    throw new InterviewError({
      code: InterviewErrorCodes.UNSAFE_TARGET,
      target: options.target,
      message: `Target "${options.target}" is empty.`,
    });
  }

  targetParent[leafSegment] = options.value;
}

function validateQuestionTargets(question: Question): void {
  validateTargetPath(question.target);

  const questionIsRepeatableGroup =
    question.type === QuestionTypes.REPEATABLE_GROUP;

  if (questionIsRepeatableGroup) {
    for (const childQuestion of question.questions) {
      validateQuestionTargets(childQuestion);
    }
  }
}

function validateTargetPath(target: string): string[] {
  const pathSegments = target.split(".");
  const targetHasUnsafeSegments = pathSegments.some(isUnsafePathSegment);

  if (targetHasUnsafeSegments) {
    throw new InterviewError({
      code: InterviewErrorCodes.UNSAFE_TARGET,
      target,
      message: `Target "${target}" contains an unsafe or empty path segment.`,
    });
  }

  return pathSegments;
}

function isUnsafePathSegment(segment: string): boolean {
  const segmentIsEmpty = segment.length === 0;

  return segmentIsEmpty || UnsafeTargetSegments.has(segment);
}

function cloneRecord(
  source: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const clonedEntries = Object.entries(source).map(
    ([key, value]) => [key, cloneValue(value)] as const,
  );

  return Object.fromEntries(clonedEntries);
}

function cloneValue(value: unknown): unknown {
  const valueIsArray = Array.isArray(value);

  if (valueIsArray) {
    return value.map(cloneValue);
  }

  const valueIsRecord = isRecord(value);

  if (valueIsRecord) {
    return cloneRecord(value);
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  const isObject = typeof value === "object" && value !== null;
  const isNotArray = !Array.isArray(value);

  return isObject && isNotArray;
}
