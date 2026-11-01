import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { parseQuestionModule } from "../application/profiles/parse-question-module.ts";
import { QuestionTypes } from "../domain/question-module.ts";

interface MockElement {
  addEventListener: Mock<
    (event: string, listener: () => void | Promise<void>) => void
  >;
  getAttribute: ReturnType<typeof vi.fn>;
  textContent: string;
  hidden: boolean;
  focus: ReturnType<typeof vi.fn>;
  showModal?: ReturnType<typeof vi.fn>;
  close?: ReturnType<typeof vi.fn>;
}

function createElement(attributes: Record<string, string> = {}): MockElement {
  return {
    addEventListener:
      vi.fn<(event: string, listener: () => void | Promise<void>) => void>(),
    getAttribute: vi.fn((name: string) => attributes[name] ?? null),
    textContent: "",
    hidden: false,
    focus: vi.fn(),
  };
}

function initializeWebsiteScript() {
  const opener = createElement({ "data-doc-open": "questions" });
  const closer = createElement();
  const copy = createElement({
    "data-copy": "npx project-spec-starter@1.0.0 init",
  });
  const quickstartPanel = createElement({ "data-doc-panel": "quickstart" });
  const questionsPanel = createElement({ "data-doc-panel": "questions" });
  const dialog = {
    ...createElement(),
    open: false,
    showModal: vi.fn(),
    close: vi.fn(),
  };
  const elements: Record<string, MockElement[]> = {
    "[data-doc-open]": [opener],
    "[data-doc-close]": [closer],
    "[data-doc-panel]": [quickstartPanel, questionsPanel],
    "[data-copy]": [copy],
  };
  const document = {
    querySelector: vi.fn(() => dialog),
    querySelectorAll: vi.fn((selector: string) => elements[selector] ?? []),
  };
  const writeText = vi.fn().mockResolvedValue(undefined);
  const source = readFileSync(
    new URL("../../website/script.js", import.meta.url),
    "utf8",
  );

  runInNewContext(source, {
    document,
    navigator: { clipboard: { writeText } },
    window: { setTimeout: vi.fn() },
  });

  return {
    opener,
    closer,
    copy,
    dialog,
    quickstartPanel,
    questionsPanel,
    writeText,
  };
}

describe("documentation drawer", () => {
  it("covers every question from the default profile", () => {
    const website = readFileSync(
      new URL("../../website/index.html", import.meta.url),
      "utf8",
    );
    const visibleText = website.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const moduleNames = ["project", "runtime", "engineering"];
    const missingPrompts: string[] = [];

    for (const moduleName of moduleNames) {
      const questionModulePath = new URL(
        `../../profiles/default/questions/${moduleName}.json`,
        import.meta.url,
      );
      const parsedModule: unknown = JSON.parse(
        readFileSync(questionModulePath, "utf8"),
      );
      const questionModule = parseQuestionModule(parsedModule);
      const allQuestions = questionModule.questions.flatMap((question) => {
        const isRepeatableGroup =
          question.type === QuestionTypes.REPEATABLE_GROUP;

        return isRepeatableGroup
          ? [question, ...question.questions]
          : [question];
      });

      for (const question of allQuestions) {
        const promptIsDocumented = visibleText.includes(question.prompt);

        if (!promptIsDocumented) missingPrompts.push(question.prompt);
      }
    }

    expect(missingPrompts).toEqual([]);
  });

  it("opens the requested section and closes from the close button", async () => {
    const ui = initializeWebsiteScript();
    const openListener = ui.opener.addEventListener.mock.calls[0]?.[1];
    const closeListener = ui.closer.addEventListener.mock.calls[0]?.[1];

    expect(openListener).toBeTypeOf("function");
    await openListener?.();
    expect(ui.dialog.showModal).toHaveBeenCalledOnce();
    expect(ui.quickstartPanel.hidden).toBe(true);
    expect(ui.questionsPanel.hidden).toBe(false);

    await closeListener?.();
    expect(ui.dialog.close).toHaveBeenCalledOnce();
  });

  it("copies the command shown in the documentation", async () => {
    const ui = initializeWebsiteScript();
    const copyListener = ui.copy.addEventListener.mock.calls[0]?.[1];

    expect(copyListener).toBeTypeOf("function");
    await copyListener?.();

    expect(ui.writeText).toHaveBeenCalledWith(
      "npx project-spec-starter@1.0.0 init",
    );
    expect(ui.copy.textContent).toBe("Copiado!");
  });
});
