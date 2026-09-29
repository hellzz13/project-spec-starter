import { checkbox, confirm, input, number, select } from "@inquirer/prompts";
import {
  QuestionTypes,
  type AllowedQuestionDecisionState,
  type Question,
  type QuestionOption,
  type QuestionType,
} from "../../domain/question-module.ts";
import {
  InterviewAnswerKinds,
  type InterviewAnswer,
  type QuestionPrompter,
} from "../../ports/question-prompter.ts";

export const PromptAdapterErrorCodes = {
  INTERVIEW_CANCELLED: "INTERVIEW_CANCELLED",
  INVALID_QUESTION_RESPONSE: "INVALID_QUESTION_RESPONSE",
  INVALID_QUESTION_TYPE: "INVALID_QUESTION_TYPE",
} as const;

export type PromptAdapterErrorCode =
  (typeof PromptAdapterErrorCodes)[keyof typeof PromptAdapterErrorCodes];

export class PromptAdapterError extends Error {
  readonly code: PromptAdapterErrorCode;
  readonly questionId: string;

  constructor(options: {
    readonly code: PromptAdapterErrorCode;
    readonly questionId: string;
    readonly message: string;
  }) {
    super(options.message);
    this.name = "PromptAdapterError";
    this.code = options.code;
    this.questionId = options.questionId;
  }
}

export interface InquirerInputConfig {
  readonly message: string;
  readonly required?: boolean;
  readonly validate?: (value: string) => boolean | string;
}

export interface InquirerSelectChoice {
  readonly name: string;
  readonly value: string;
}

export interface InquirerSelectConfig {
  readonly message: string;
  readonly choices: readonly InquirerSelectChoice[];
}

export interface InquirerCheckboxConfig {
  readonly message: string;
  readonly choices: readonly InquirerSelectChoice[];
  readonly required?: boolean;
}

export interface InquirerConfirmConfig {
  readonly message: string;
}

export interface InquirerNumberConfig {
  readonly message: string;
  readonly min: number;
  readonly required: boolean;
  readonly validate: (value: number | undefined) => boolean | string;
}

export interface InquirerPromptFunctions {
  readonly input: (config: InquirerInputConfig) => Promise<string>;
  readonly select: (config: InquirerSelectConfig) => Promise<string>;
  readonly checkbox: (
    config: InquirerCheckboxConfig,
  ) => Promise<readonly string[]>;
  readonly confirm: (config: InquirerConfirmConfig) => Promise<boolean>;
  readonly number: (
    config: InquirerNumberConfig,
  ) => Promise<number | undefined>;
}

const DefaultInquirerPrompts: InquirerPromptFunctions = {
  input,
  select,
  checkbox,
  confirm,
  number,
};

const PromptChoiceValues = {
  ANSWER_NOW: "__project_spec_answer_now__",
  OTHER: "__project_spec_other__",
} as const;

const DecisionLabels: Record<AllowedQuestionDecisionState, string> = {
  pending: "Deixar para decidir depois",
  "not-applicable": "Não se aplica",
};

type HandlerOptions = {
  readonly question: Question;
  readonly prompts: InquirerPromptFunctions;
};

type QuestionHandler = (options: HandlerOptions) => Promise<InterviewAnswer>;

const QuestionHandlers = {
  [QuestionTypes.TEXT]: askTextQuestion,
  [QuestionTypes.SELECT]: askSelectQuestion,
  [QuestionTypes.MULTI_SELECT]: askMultiSelectQuestion,
  [QuestionTypes.BOOLEAN]: askBooleanQuestion,
  [QuestionTypes.REPEATABLE_GROUP]: askRepeatableGroupQuestion,
} satisfies Record<QuestionType, QuestionHandler>;

export class InquirerQuestionPrompter implements QuestionPrompter {
  private readonly prompts: InquirerPromptFunctions;

  constructor(prompts: InquirerPromptFunctions = DefaultInquirerPrompts) {
    this.prompts = prompts;
  }

  async askQuestion(options: {
    readonly question: Question;
    readonly answers: Readonly<Record<string, unknown>>;
  }): Promise<InterviewAnswer> {
    const questionHandler = QuestionHandlers[options.question.type];

    try {
      return await questionHandler({
        question: options.question,
        prompts: this.prompts,
      });
    } catch (error) {
      const isPromptCancellation =
        error instanceof Error && error.name === "ExitPromptError";

      if (!isPromptCancellation) {
        throw error;
      }

      throw new PromptAdapterError({
        code: PromptAdapterErrorCodes.INTERVIEW_CANCELLED,
        questionId: options.question.id,
        message: `Entrevista cancelada na pergunta "${options.question.id}".`,
      });
    }
  }
}

function askTextQuestion(options: HandlerOptions): Promise<InterviewAnswer> {
  const questionIsNotText = options.question.type !== QuestionTypes.TEXT;

  if (questionIsNotText) {
    throw createInvalidQuestionTypeError(options.question);
  }

  const question = options.question;
  const questionDoesNotAllowDecisions =
    question.allowedDecisionStates === undefined;

  if (questionDoesNotAllowDecisions) {
    return askTextAnswer({ question, prompts: options.prompts });
  }

  return askTextOrDecision({ question, prompts: options.prompts });
}

async function askTextOrDecision(options: {
  readonly question: Extract<
    Question,
    { readonly type: typeof QuestionTypes.TEXT }
  >;
  readonly prompts: InquirerPromptFunctions;
}): Promise<InterviewAnswer> {
  const { question, prompts } = options;
  const allowedDecisionStates = question.allowedDecisionStates ?? [];
  const decisionChoices = allowedDecisionStates.map((state) => ({
    name: DecisionLabels[state],
    value: state,
  }));
  const selectedResponse = await prompts.select({
    message: `${question.prompt} — como deseja responder?`,
    choices: [
      { name: "Responder agora", value: PromptChoiceValues.ANSWER_NOW },
      ...decisionChoices,
    ],
  });
  const userChoseToAnswerNow =
    selectedResponse === PromptChoiceValues.ANSWER_NOW;

  if (userChoseToAnswerNow) {
    return askTextAnswer({ question, prompts });
  }

  const selectedDecisionState = allowedDecisionStates.find(
    (state) => state === selectedResponse,
  );
  const selectedDecisionStateIsNotAllowed = selectedDecisionState === undefined;

  if (selectedDecisionStateIsNotAllowed) {
    throw new PromptAdapterError({
      code: PromptAdapterErrorCodes.INVALID_QUESTION_RESPONSE,
      questionId: question.id,
      message: `A pergunta "${question.id}" recebeu uma decisão não permitida.`,
    });
  }

  return {
    kind: InterviewAnswerKinds.DECISION,
    state: selectedDecisionState,
  };
}

async function askTextAnswer(options: {
  readonly question: Extract<
    Question,
    { readonly type: typeof QuestionTypes.TEXT }
  >;
  readonly prompts: InquirerPromptFunctions;
}): Promise<InterviewAnswer> {
  const { question, prompts } = options;
  const answer = await prompts.input({
    message: question.prompt,
    required: question.required,
    validate: (value) => {
      const answerIsNonEmpty = value.trim().length > 0;
      const answerIsValid = !question.required || answerIsNonEmpty;

      return answerIsValid || "Informe uma resposta antes de continuar.";
    },
  });

  return { kind: InterviewAnswerKinds.ANSWER, value: answer };
}

async function askSelectQuestion(
  options: HandlerOptions,
): Promise<InterviewAnswer> {
  const questionIsNotSelect = options.question.type !== QuestionTypes.SELECT;

  if (questionIsNotSelect) {
    throw createInvalidQuestionTypeError(options.question);
  }

  const question = options.question;
  const selectedValue = await options.prompts.select({
    message: question.prompt,
    choices: question.options.map(toPromptChoice),
  });

  return { kind: InterviewAnswerKinds.ANSWER, value: selectedValue };
}

async function askMultiSelectQuestion(
  options: HandlerOptions,
): Promise<InterviewAnswer> {
  const questionIsNotMultiSelect =
    options.question.type !== QuestionTypes.MULTI_SELECT;

  if (questionIsNotMultiSelect) {
    throw createInvalidQuestionTypeError(options.question);
  }

  const question = options.question;
  const customValuesAreAllowed = question.allowCustomValues;
  const customValue = customValuesAreAllowed
    ? createCustomValueSentinel(question.options)
    : undefined;
  const choices = question.options.map(toPromptChoice);
  const customValueExists = customValue !== undefined;
  const choicesWithCustomValue = customValueExists
    ? [...choices, { name: "Outro", value: customValue }]
    : choices;
  const selectedValues = await options.prompts.checkbox({
    message: question.prompt,
    choices: choicesWithCustomValue,
    required: question.required,
  });
  const customValueWasSelected =
    customValueExists && selectedValues.includes(customValue);
  const declaredValues = customValueWasSelected
    ? selectedValues.filter((value) => value !== customValue)
    : [...selectedValues];

  const customValueWasNotSelected = !customValueWasSelected;

  if (customValueWasNotSelected) {
    return {
      kind: InterviewAnswerKinds.ANSWER,
      value: uniqueValues(declaredValues),
    };
  }

  const customValuesAreRequired =
    question.required && declaredValues.length === 0;
  const customInput = await options.prompts.input({
    message: "Informe os outros valores separados por vírgula.",
    required: customValuesAreRequired,
    validate: (value) => {
      const customValues = parseCustomValues(value);
      const hasRequiredCustomValue =
        !customValuesAreRequired || customValues.length > 0;

      return (
        hasRequiredCustomValue || "Informe ao menos um valor personalizado."
      );
    },
  });
  const customValues = parseCustomValues(customInput);

  return {
    kind: InterviewAnswerKinds.ANSWER,
    value: uniqueValues([...declaredValues, ...customValues]),
  };
}

async function askBooleanQuestion(
  options: HandlerOptions,
): Promise<InterviewAnswer> {
  const questionIsNotBoolean = options.question.type !== QuestionTypes.BOOLEAN;

  if (questionIsNotBoolean) {
    throw createInvalidQuestionTypeError(options.question);
  }

  const question = options.question;
  const answer = await options.prompts.confirm({ message: question.prompt });

  return { kind: InterviewAnswerKinds.ANSWER, value: answer };
}

async function askRepeatableGroupQuestion(
  options: HandlerOptions,
): Promise<InterviewAnswer> {
  const questionIsNotRepeatableGroup =
    options.question.type !== QuestionTypes.REPEATABLE_GROUP;

  if (questionIsNotRepeatableGroup) {
    throw createInvalidQuestionTypeError(options.question);
  }

  const question = options.question;
  const requiredGroupNeedsAtLeastOneItem = question.required;
  const minimumCount = requiredGroupNeedsAtLeastOneItem ? 1 : 0;
  const count = await options.prompts.number({
    message: `${question.prompt} — quantos itens deseja cadastrar?`,
    min: minimumCount,
    required: question.required,
    validate: (value) => {
      const countIsDefined = value !== undefined;
      const countIsInteger = !countIsDefined || Number.isInteger(value);
      const countMeetsMinimum = !countIsDefined || value >= minimumCount;
      const countIsValid = countIsInteger && countMeetsMinimum;

      return (
        countIsValid ||
        `Informe um número inteiro igual ou maior que ${minimumCount}.`
      );
    },
  });
  const resolvedCount = count ?? 0;
  const groupItems = Array.from({ length: resolvedCount }, () => ({}));

  return { kind: InterviewAnswerKinds.GROUP, items: groupItems };
}

function toPromptChoice(option: QuestionOption): InquirerSelectChoice {
  return { name: option.label, value: option.value };
}

function createCustomValueSentinel(options: readonly QuestionOption[]): string {
  const declaredValues = new Set(options.map(({ value }) => value));
  let candidate: string = PromptChoiceValues.OTHER;
  let candidateCollides = declaredValues.has(candidate);

  while (candidateCollides) {
    candidate = `${candidate}_`;
    candidateCollides = declaredValues.has(candidate);
  }

  return candidate;
}

function parseCustomValues(value: string): string[] {
  return value
    .split(",")
    .map((customValue) => customValue.trim())
    .filter((customValue) => customValue.length > 0);
}

function uniqueValues(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function createInvalidQuestionTypeError(
  question: Question,
): PromptAdapterError {
  return new PromptAdapterError({
    code: PromptAdapterErrorCodes.INVALID_QUESTION_TYPE,
    questionId: question.id,
    message: `A pergunta "${question.id}" tem um tipo incompatível com seu adaptador.`,
  });
}
