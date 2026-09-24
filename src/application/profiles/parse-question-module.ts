import {
  AllowedQuestionDecisionStates,
  QUESTION_MODULE_SCHEMA_VERSION,
  QuestionTypes,
  type AllowedQuestionDecisionState,
  type Question,
  type QuestionModule,
  type QuestionOption,
} from "../../domain/question-module.js";
import { parseProfileCondition } from "./parse-profile-condition.js";

export const QuestionModuleErrorCodes = {
  INVALID_QUESTION_MODULE: "INVALID_QUESTION_MODULE",
  UNSUPPORTED_QUESTION_MODULE_SCHEMA: "UNSUPPORTED_QUESTION_MODULE_SCHEMA",
} as const;

export type QuestionModuleErrorCode =
  (typeof QuestionModuleErrorCodes)[keyof typeof QuestionModuleErrorCodes];

export class QuestionModuleError extends Error {
  readonly code: QuestionModuleErrorCode;
  readonly path: string;

  constructor(options: {
    readonly code: QuestionModuleErrorCode;
    readonly message: string;
    readonly path: string;
  }) {
    super(options.message);
    this.name = "QuestionModuleError";
    this.code = options.code;
    this.path = options.path;
  }
}

export function parseQuestionModule(input: unknown): QuestionModule {
  const moduleRecord = requireRecord(input, "questionModule");
  const schemaVersion = moduleRecord.schemaVersion;
  const isIntegerSchemaVersion =
    typeof schemaVersion === "number" && Number.isInteger(schemaVersion);
  const hasUnsupportedSchemaVersion =
    isIntegerSchemaVersion && schemaVersion !== QUESTION_MODULE_SCHEMA_VERSION;

  if (hasUnsupportedSchemaVersion) {
    throw new QuestionModuleError({
      code: QuestionModuleErrorCodes.UNSUPPORTED_QUESTION_MODULE_SCHEMA,
      path: "schemaVersion",
      message: `Unsupported question module schema version: ${String(schemaVersion)}`,
    });
  }

  const isInvalidSchemaVersion =
    schemaVersion !== QUESTION_MODULE_SCHEMA_VERSION;

  if (isInvalidSchemaVersion) {
    invalid("schemaVersion", "Expected the current schema version.");
  }

  const questions = requireArray(moduleRecord.questions, "questions");
  const hasNoQuestions = questions.length === 0;

  if (hasNoQuestions) {
    invalid("questions", "Expected at least one question.");
  }

  const parsedQuestions = questions.map((question, index) =>
    parseQuestion(question, `questions[${index}]`),
  );

  assertUniqueQuestionIds(parsedQuestions, "questions");

  return {
    schemaVersion: QUESTION_MODULE_SCHEMA_VERSION,
    id: requireNonEmptyString(moduleRecord.id, "id"),
    version: requirePositiveInteger(moduleRecord.version, "version"),
    questions: parsedQuestions,
  };
}

function parseQuestion(input: unknown, path: string): Question {
  const questionRecord = requireRecord(input, path);
  const base = parseQuestionBase(questionRecord, path);
  const questionType = questionRecord.type;
  const isTextQuestion = questionType === QuestionTypes.TEXT;

  if (isTextQuestion) {
    return { ...base, type: QuestionTypes.TEXT };
  }

  const isSelectQuestion = questionType === QuestionTypes.SELECT;

  if (isSelectQuestion) {
    return {
      ...base,
      type: QuestionTypes.SELECT,
      options: parseOptions(questionRecord.options, `${path}.options`),
    };
  }

  const isMultiSelectQuestion = questionType === QuestionTypes.MULTI_SELECT;

  if (isMultiSelectQuestion) {
    return {
      ...base,
      type: QuestionTypes.MULTI_SELECT,
      options: parseOptions(questionRecord.options, `${path}.options`),
      allowCustomValues: requireBoolean(
        questionRecord.allowCustomValues,
        `${path}.allowCustomValues`,
      ),
    };
  }

  const isBooleanQuestion = questionType === QuestionTypes.BOOLEAN;

  if (isBooleanQuestion) {
    return { ...base, type: QuestionTypes.BOOLEAN };
  }

  const isRepeatableGroupQuestion =
    questionType === QuestionTypes.REPEATABLE_GROUP;

  if (isRepeatableGroupQuestion) {
    const childQuestions = requireArray(
      questionRecord.questions,
      `${path}.questions`,
    );
    const childQuestionsAreEmpty = childQuestions.length === 0;

    if (childQuestionsAreEmpty) {
      invalid(
        `${path}.questions`,
        "A repeatable group must contain questions.",
      );
    }

    return {
      ...base,
      type: QuestionTypes.REPEATABLE_GROUP,
      questions: childQuestions.map((childQuestion, index) =>
        parseQuestion(childQuestion, `${path}.questions[${index}]`),
      ),
    };
  }

  invalid(`${path}.type`, "Expected a supported question type.");
}

function parseQuestionBase(
  question: Record<string, unknown>,
  path: string,
): Omit<Question, "type" | "options" | "questions"> {
  const base = {
    id: requireNonEmptyString(question.id, `${path}.id`),
    target: requireNonEmptyString(question.target, `${path}.target`),
    prompt: requireNonEmptyString(question.prompt, `${path}.prompt`),
    required: requireBoolean(question.required, `${path}.required`),
  };
  const conditionIsPresent = Object.hasOwn(question, "condition");
  const decisionStatesArePresent = Object.hasOwn(
    question,
    "allowedDecisionStates",
  );
  const withCondition = conditionIsPresent
    ? {
        ...base,
        condition: parseProfileCondition({
          input: question.condition,
          invalid,
          path: `${path}.condition`,
        }),
      }
    : base;

  if (decisionStatesArePresent) {
    return {
      ...withCondition,
      allowedDecisionStates: parseAllowedDecisionStates(
        question.allowedDecisionStates,
        `${path}.allowedDecisionStates`,
      ),
    };
  }

  return withCondition;
}

function parseAllowedDecisionStates(
  input: unknown,
  path: string,
): AllowedQuestionDecisionState[] {
  const states = requireArray(input, path);
  const hasNoStates = states.length === 0;

  if (hasNoStates) {
    invalid(path, "Expected at least one decision state.");
  }

  const parsedStates = states.map((state, index) => {
    const statePath = `${path}[${index}]`;
    const isPendingState = state === AllowedQuestionDecisionStates.PENDING;

    if (isPendingState) {
      return AllowedQuestionDecisionStates.PENDING;
    }

    const isNotApplicableState =
      state === AllowedQuestionDecisionStates.NOT_APPLICABLE;

    if (isNotApplicableState) {
      return AllowedQuestionDecisionStates.NOT_APPLICABLE;
    }

    invalid(statePath, 'Expected "pending" or "not-applicable".');
  });

  assertUnique(parsedStates, path);

  return parsedStates;
}

function parseOptions(input: unknown, path: string): QuestionOption[] {
  const options = requireArray(input, path);
  const optionsAreEmpty = options.length === 0;

  if (optionsAreEmpty) {
    invalid(path, "Expected at least one option.");
  }

  const parsedOptions = options.map((option, index) => {
    const optionPath = `${path}[${index}]`;
    const optionRecord = requireRecord(option, optionPath);

    return {
      value: requireNonEmptyString(optionRecord.value, `${optionPath}.value`),
      label: requireNonEmptyString(optionRecord.label, `${optionPath}.label`),
    };
  });

  assertUnique(
    parsedOptions.map((option) => option.value),
    `${path}.value`,
  );

  return parsedOptions;
}

function requireRecord(input: unknown, path: string): Record<string, unknown> {
  const isInvalidRecord = !isRecord(input);

  if (isInvalidRecord) {
    invalid(path, "Expected an object.");
  }

  return input;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function requireArray(input: unknown, path: string): unknown[] {
  const isInvalidArray = !Array.isArray(input);

  if (isInvalidArray) {
    invalid(path, "Expected a list.");
  }

  return input;
}

function requireNonEmptyString(input: unknown, path: string): string {
  const isInvalidString =
    typeof input !== "string" || input.trim().length === 0;

  if (isInvalidString) {
    invalid(path, "Expected a non-empty string.");
  }

  return input.trim();
}

function requirePositiveInteger(input: unknown, path: string): number {
  const isInvalidPositiveInteger =
    typeof input !== "number" || !Number.isInteger(input) || input <= 0;

  if (isInvalidPositiveInteger) {
    invalid(path, "Expected a positive integer.");
  }

  return input;
}

function requireBoolean(input: unknown, path: string): boolean {
  const isInvalidBoolean = typeof input !== "boolean";

  if (isInvalidBoolean) {
    invalid(path, "Expected a boolean.");
  }

  return input;
}

function assertUnique(values: readonly string[], path: string): void {
  const uniqueValues = new Set(values);
  const hasDuplicateValues = uniqueValues.size !== values.length;

  if (hasDuplicateValues) {
    invalid(path, "Expected unique values.");
  }
}

function assertUniqueQuestionIds(
  questions: readonly Question[],
  path: string,
): void {
  assertUnique(
    questions.map((question) => question.id),
    `${path}.id`,
  );

  for (const [index, question] of questions.entries()) {
    const isRepeatableGroup = question.type === QuestionTypes.REPEATABLE_GROUP;

    if (isRepeatableGroup) {
      assertUniqueQuestionIds(
        question.questions,
        `${path}[${index}].questions`,
      );
    }
  }
}

function invalid(path: string, message: string): never {
  throw new QuestionModuleError({
    code: QuestionModuleErrorCodes.INVALID_QUESTION_MODULE,
    path,
    message: `${path}: ${message}`,
  });
}
