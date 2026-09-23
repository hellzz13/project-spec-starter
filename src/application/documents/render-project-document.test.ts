import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { parseAnswers } from "../answers/parse-answers.js";
import { createDocumentModel } from "./create-document-model.js";
import { tokenTemplateRenderer } from "../../adapters/templates/render-token-template.js";
import { renderProjectTemplate } from "../../adapters/templates/render-project-template.js";

describe("renderProjectDocument", () => {
  it("renders the minimal answers fixture without unresolved markers", () => {
    const fixtureUrl = new URL(
      "../../../tests/fixtures/minimal-answers.json",
      import.meta.url,
    );
    const templateUrl = new URL(
      "../../../templates/project/PROJECT_TEMPLATE.md",
      import.meta.url,
    );
    const answers: unknown = JSON.parse(readFileSync(fixtureUrl, "utf8"));
    const template = readFileSync(templateUrl, "utf8");
    const specification = parseAnswers(answers);
    const model = createDocumentModel(specification);
    const document = renderProjectTemplate({
      model,
      renderer: tokenTemplateRenderer,
      template,
    });

    expect(document).not.toMatch(/\{\{[A-Z][A-Z0-9_]*\}\}/u);
    expect(document).toMatchSnapshot();
  });

  it("renders a replacement template without changing the application model", () => {
    const answers: unknown = JSON.parse(
      readFileSync(
        new URL(
          "../../../tests/fixtures/minimal-answers.json",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const model = createDocumentModel(parseAnswers(answers));
    const customTemplate = "Projeto: {{PROJECT_NAME}} — {{PROJECT_NATURE}}";

    expect(
      renderProjectTemplate({
        model,
        renderer: tokenTemplateRenderer,
        template: customTemplate,
      }),
    ).toBe("Projeto: Billing API — Backend");
  });

  it.each([
    {
      expectedContent:
        "| Import pipeline | Decisão pendente | Batch data processing pipeline | scheduled-jobs |",
      fixtureName: "heterogeneous-monorepo.json",
    },
    {
      expectedContent:
        "| Natureza | Interactive scientific experiment workbench |",
      fixtureName: "custom-type-decisions.json",
    },
  ])(
    "renders the canonical template for $fixtureName",
    ({ expectedContent, fixtureName }) => {
      const answers: unknown = JSON.parse(
        readFileSync(
          new URL(`../../../tests/fixtures/${fixtureName}`, import.meta.url),
          "utf8",
        ),
      );
      const template = readFileSync(
        new URL(
          "../../../templates/project/PROJECT_TEMPLATE.md",
          import.meta.url,
        ),
        "utf8",
      );
      const model = createDocumentModel(parseAnswers(answers));
      const document = renderProjectTemplate({
        model,
        renderer: tokenTemplateRenderer,
        template,
      });

      expect(document).toContain(expectedContent);
      expect(document).not.toMatch(/\{\{[A-Z][A-Z0-9_]*\}\}/u);
    },
  );
});
