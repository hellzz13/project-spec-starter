import { describe, expect, it, vi } from "vitest";
import {
  AllowedQuestionDecisionStates,
  QuestionTypes,
  type Question,
} from "../../domain/question-module.ts";
import { InterviewAnswerKinds } from "../../ports/question-prompter.ts";
import {
  InquirerQuestionPrompter,
  PromptAdapterErrorCodes,
  type InquirerPromptFunctions,
  type InquirerInputConfig,
  type InquirerSelectConfig,
  type InquirerCheckboxConfig,
  type InquirerConfirmConfig,
  type InquirerNumberConfig,
} from "./inquirer-question-prompter.ts";

function createPrompts(
  overrides: Partial<InquirerPromptFunctions> = {},
): InquirerPromptFunctions {
  return {
    input: vi.fn((config: InquirerInputConfig) => {
      void config;
      return Promise.resolve("texto");
    }),
    select: vi.fn((config: InquirerSelectConfig) => {
      void config;
      return Promise.resolve("selecionado");
    }),
    checkbox: vi.fn((config: InquirerCheckboxConfig) => {
      void config;
      return Promise.resolve([]);
    }),
    confirm: vi.fn((config: InquirerConfirmConfig) => {
      void config;
      return Promise.resolve(true);
    }),
    number: vi.fn((config: InquirerNumberConfig) => {
      void config;
      return Promise.resolve(0);
    }),
    ...overrides,
  };
}

function createQuestion(question: Question): Question {
  return question;
}

describe("InquirerQuestionPrompter", () => {
  it("asks a required text question and validates a non-empty answer", async () => {
    const input = vi.fn((config: InquirerInputConfig) => {
      void config;
      return Promise.resolve("Projeto");
    });
    const prompter = new InquirerQuestionPrompter(createPrompts({ input }));
    const question = createQuestion({
      id: "project-name",
      target: "project.name",
      prompt: "Qual é o nome do projeto?",
      required: true,
      type: QuestionTypes.TEXT,
    });

    const result = await prompter.askQuestion({ question, answers: {} });
    const inputConfig = input.mock.calls[0]?.[0];

    expect(result).toEqual({
      kind: InterviewAnswerKinds.ANSWER,
      value: "Projeto",
    });
    expect(inputConfig?.required).toBe(true);
    expect(inputConfig?.validate?.("   ")).toBe(
      "Informe uma resposta antes de continuar.",
    );
    expect(inputConfig?.validate?.("Projeto")).toBe(true);
  });

  it("uses an existing text answer as the editable default", async () => {
    const input = vi.fn((config: InquirerInputConfig) =>
      Promise.resolve(config.default ?? ""),
    );
    const prompter = new InquirerQuestionPrompter(createPrompts({ input }));
    const question = createQuestion({
      id: "node-version",
      target: "runtime.node.version",
      prompt: "Qual versão do Node.js o projeto deve usar?",
      required: true,
      type: QuestionTypes.TEXT,
    });

    const result = await prompter.askQuestion({
      question,
      answers: { runtime: { node: { version: "24" } } },
    });

    expect(input).toHaveBeenCalledWith(
      expect.objectContaining({ default: "24" }),
    );
    expect(result).toEqual({
      kind: InterviewAnswerKinds.ANSWER,
      value: "24",
    });
  });

  it("maps select options to Inquirer choices", async () => {
    const select = vi.fn((config: InquirerSelectConfig) => {
      void config;
      return Promise.resolve("frontend");
    });
    const prompter = new InquirerQuestionPrompter(createPrompts({ select }));
    const question = createQuestion({
      id: "project-kind",
      target: "project.kind",
      prompt: "Qual é o tipo?",
      required: true,
      type: QuestionTypes.SELECT,
      options: [{ value: "frontend", label: "Frontend" }],
    });

    const result = await prompter.askQuestion({ question, answers: {} });

    expect(select).toHaveBeenCalledWith({
      message: "Qual é o tipo?",
      choices: [{ name: "Frontend", value: "frontend" }],
    });
    expect(result).toEqual({
      kind: InterviewAnswerKinds.ANSWER,
      value: "frontend",
    });
  });

  it("requires a selection and collects custom multi-select values without duplicates", async () => {
    const checkbox = vi.fn((config: InquirerCheckboxConfig) =>
      Promise.resolve(["api", config.choices.at(-1)?.value ?? ""]),
    );
    const input = vi.fn((config: InquirerInputConfig) => {
      void config;
      return Promise.resolve("worker, api, , worker ");
    });
    const prompter = new InquirerQuestionPrompter(
      createPrompts({ checkbox, input }),
    );
    const question = createQuestion({
      id: "units",
      target: "project.units",
      prompt: "Quais unidades?",
      required: true,
      type: QuestionTypes.MULTI_SELECT,
      options: [
        { value: "api", label: "API" },
        { value: "__project_spec_other__", label: "Valor declarado" },
      ],
      allowCustomValues: true,
    });

    const result = await prompter.askQuestion({ question, answers: {} });
    const checkboxConfig = checkbox.mock.calls[0]?.[0];
    const customChoice = checkboxConfig?.choices.at(-1);

    expect(checkboxConfig?.required).toBe(true);
    expect(customChoice?.name).toBe("Outro");
    expect(customChoice?.value).not.toBe("__project_spec_other__");
    expect(input.mock.calls[0]?.[0]).toMatchObject({
      message: "Informe os outros valores separados por vírgula.",
      required: false,
    });
    expect(result).toEqual({
      kind: InterviewAnswerKinds.ANSWER,
      value: ["api", "worker"],
    });
  });

  it("requires a non-empty custom value when it is the only required selection", async () => {
    const checkbox = vi.fn((config: InquirerCheckboxConfig) =>
      Promise.resolve([config.choices.at(-1)?.value ?? ""]),
    );
    const input = vi.fn((config: InquirerInputConfig) => {
      void config;
      return Promise.resolve("");
    });
    const prompter = new InquirerQuestionPrompter(
      createPrompts({ checkbox, input }),
    );
    const question = createQuestion({
      id: "units",
      target: "project.units",
      prompt: "Quais unidades?",
      required: true,
      type: QuestionTypes.MULTI_SELECT,
      options: [{ value: "api", label: "API" }],
      allowCustomValues: true,
    });

    await prompter.askQuestion({ question, answers: {} });
    const customInputConfig = input.mock.calls[0]?.[0];

    expect(customInputConfig?.required).toBe(true);
    expect(customInputConfig?.validate?.(" ,  ")).toBe(
      "Informe ao menos um valor personalizado.",
    );
    expect(customInputConfig?.validate?.("worker, api")).toBe(true);
  });

  it("uses checkbox options without adding a custom choice when disabled", async () => {
    const checkbox = vi.fn((config: InquirerCheckboxConfig) => {
      void config;
      return Promise.resolve(["frontend"]);
    });
    const prompter = new InquirerQuestionPrompter(createPrompts({ checkbox }));
    const question = createQuestion({
      id: "capabilities",
      target: "project.capabilities",
      prompt: "Quais capacidades?",
      required: false,
      type: QuestionTypes.MULTI_SELECT,
      options: [{ value: "frontend", label: "Frontend" }],
      allowCustomValues: false,
    });

    const result = await prompter.askQuestion({ question, answers: {} });

    expect(checkbox).toHaveBeenCalledWith({
      message: "Quais capacidades?",
      choices: [{ name: "Frontend", value: "frontend" }],
      required: false,
    });
    expect(result).toEqual({
      kind: InterviewAnswerKinds.ANSWER,
      value: ["frontend"],
    });
  });

  it("maps boolean questions to confirm", async () => {
    const confirm = vi.fn((config: InquirerConfirmConfig) => {
      void config;
      return Promise.resolve(false);
    });
    const prompter = new InquirerQuestionPrompter(createPrompts({ confirm }));
    const question = createQuestion({
      id: "agent-support",
      target: "project.agentSupport",
      prompt: "Usará um agente?",
      required: true,
      type: QuestionTypes.BOOLEAN,
    });

    const result = await prompter.askQuestion({ question, answers: {} });

    expect(confirm).toHaveBeenCalledWith({ message: "Usará um agente?" });
    expect(result).toEqual({ kind: InterviewAnswerKinds.ANSWER, value: false });
  });

  it("asks a required repeatable group for at least one item", async () => {
    const number = vi.fn((config: InquirerNumberConfig) => {
      void config;
      return Promise.resolve(2);
    });
    const prompter = new InquirerQuestionPrompter(createPrompts({ number }));
    const question = createQuestion({
      id: "units",
      target: "project.units",
      prompt: "Unidades do monorepo",
      required: true,
      type: QuestionTypes.REPEATABLE_GROUP,
      questions: [
        {
          id: "unit-name",
          target: "name",
          prompt: "Nome",
          required: true,
          type: QuestionTypes.TEXT,
        },
      ],
    });

    const result = await prompter.askQuestion({ question, answers: {} });
    const numberConfig = number.mock.calls[0]?.[0];

    expect(numberConfig?.min).toBe(1);
    expect(numberConfig?.required).toBe(true);
    expect(numberConfig?.validate(0)).toBe(
      "Informe um número inteiro igual ou maior que 1.",
    );
    expect(numberConfig?.validate(1.5)).toBe(
      "Informe um número inteiro igual ou maior que 1.",
    );
    expect(numberConfig?.validate(1)).toBe(true);
    expect(result).toEqual({
      kind: InterviewAnswerKinds.GROUP,
      items: [{}, {}],
    });
  });

  it("allows zero items for an optional repeatable group", async () => {
    const number = vi.fn((config: InquirerNumberConfig) => {
      void config;
      return Promise.resolve(0);
    });
    const prompter = new InquirerQuestionPrompter(createPrompts({ number }));
    const question = createQuestion({
      id: "optional-units",
      target: "project.optionalUnits",
      prompt: "Unidades opcionais",
      required: false,
      type: QuestionTypes.REPEATABLE_GROUP,
      questions: [],
    });

    const result = await prompter.askQuestion({ question, answers: {} });
    const numberConfig = number.mock.calls[0]?.[0];

    expect(numberConfig?.min).toBe(0);
    expect(numberConfig?.required).toBe(false);
    expect(numberConfig?.validate(-1)).toBe(
      "Informe um número inteiro igual ou maior que 0.",
    );
    expect(result).toEqual({ kind: InterviewAnswerKinds.GROUP, items: [] });
  });

  it("returns a decision from only the allowed states", async () => {
    const select = vi.fn((config: InquirerSelectConfig) => {
      void config;
      return Promise.resolve(AllowedQuestionDecisionStates.PENDING);
    });
    const prompter = new InquirerQuestionPrompter(createPrompts({ select }));
    const question = createQuestion({
      id: "summary",
      target: "project.summary",
      prompt: "Resumo",
      required: true,
      type: QuestionTypes.TEXT,
      allowedDecisionStates: [AllowedQuestionDecisionStates.PENDING],
    });

    const result = await prompter.askQuestion({ question, answers: {} });

    expect(select).toHaveBeenCalledWith({
      message: "Resumo — como deseja responder?",
      choices: [
        { name: "Responder agora", value: "__project_spec_answer_now__" },
        { name: "Deixar para decidir depois", value: "pending" },
      ],
    });
    expect(result).toEqual({
      kind: InterviewAnswerKinds.DECISION,
      state: AllowedQuestionDecisionStates.PENDING,
    });
  });

  it("rejects a decision value that is outside the allowed states", async () => {
    const select = vi.fn((config: InquirerSelectConfig) => {
      void config;
      return Promise.resolve("defined");
    });
    const prompter = new InquirerQuestionPrompter(createPrompts({ select }));
    const question = createQuestion({
      id: "summary",
      target: "project.summary",
      prompt: "Resumo",
      required: true,
      type: QuestionTypes.TEXT,
      allowedDecisionStates: [AllowedQuestionDecisionStates.PENDING],
    });

    await expect(
      prompter.askQuestion({ question, answers: {} }),
    ).rejects.toMatchObject({
      code: PromptAdapterErrorCodes.INVALID_QUESTION_RESPONSE,
      questionId: "summary",
    });
  });

  it("collects text when the user chooses to answer instead of deciding", async () => {
    const select = vi.fn((config: InquirerSelectConfig) => {
      void config;
      return Promise.resolve("__project_spec_answer_now__");
    });
    const input = vi.fn((config: InquirerInputConfig) => {
      void config;
      return Promise.resolve("Resumo do produto");
    });
    const prompter = new InquirerQuestionPrompter(
      createPrompts({ select, input }),
    );
    const question = createQuestion({
      id: "summary",
      target: "project.summary",
      prompt: "Resumo",
      required: true,
      type: QuestionTypes.TEXT,
      allowedDecisionStates: [
        AllowedQuestionDecisionStates.PENDING,
        AllowedQuestionDecisionStates.NOT_APPLICABLE,
      ],
    });

    const result = await prompter.askQuestion({ question, answers: {} });

    expect(select.mock.calls[0]?.[0].choices).toEqual([
      { name: "Responder agora", value: "__project_spec_answer_now__" },
      { name: "Deixar para decidir depois", value: "pending" },
      { name: "Não se aplica", value: "not-applicable" },
    ]);
    expect(input).toHaveBeenCalledOnce();
    expect(result).toEqual({
      kind: InterviewAnswerKinds.ANSWER,
      value: "Resumo do produto",
    });
  });

  it("converts Inquirer cancellation to a typed error with question id", async () => {
    const cancellation = new Error("cancelled");
    cancellation.name = "ExitPromptError";
    const input = vi.fn((config: InquirerInputConfig) => {
      void config;
      return Promise.reject(cancellation);
    });
    const prompter = new InquirerQuestionPrompter(createPrompts({ input }));
    const question = createQuestion({
      id: "project-name",
      target: "project.name",
      prompt: "Nome",
      required: true,
      type: QuestionTypes.TEXT,
    });

    const interview = prompter.askQuestion({ question, answers: {} });

    await expect(interview).rejects.toMatchObject({
      name: "PromptAdapterError",
      code: PromptAdapterErrorCodes.INTERVIEW_CANCELLED,
      questionId: "project-name",
    });
  });

  it("propagates unexpected prompt errors unchanged", async () => {
    const unexpectedError = new Error("terminal failure");
    const confirm = vi.fn((config: InquirerConfirmConfig) => {
      void config;
      return Promise.reject(unexpectedError);
    });
    const prompter = new InquirerQuestionPrompter(createPrompts({ confirm }));
    const question = createQuestion({
      id: "enabled",
      target: "enabled",
      prompt: "Ativar?",
      required: true,
      type: QuestionTypes.BOOLEAN,
    });

    await expect(prompter.askQuestion({ question, answers: {} })).rejects.toBe(
      unexpectedError,
    );
  });
});
