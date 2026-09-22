import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { parseAnswers } from "../answers/parse-answers.js";
import { createDocumentModel } from "./create-document-model.js";
import { renderProjectDocument } from "./render-project-document.js";

describe("renderProjectDocument", () => {
  it("renders the minimal answers fixture without unresolved markers", () => {
    const fixtureUrl = new URL(
      "../../../tests/fixtures/minimal-answers.json",
      import.meta.url,
    );
    const answers: unknown = JSON.parse(readFileSync(fixtureUrl, "utf8"));
    const specification = parseAnswers(answers);
    const document = renderProjectDocument(createDocumentModel(specification));

    expect(document).not.toMatch(/\[[A-Z][A-Z0-9_]*\]/u);
    expect(document).toMatchSnapshot();
  });
});
