import { describe, expect, it } from "vitest";

import { tokenTemplateRenderer } from "./render-token-template.js";
import { TemplateRenderError } from "./template-render-error.js";

describe("tokenTemplateRenderer", () => {
  it("rejects markers without a supplied value", () => {
    expect(() =>
      tokenTemplateRenderer.render({
        template: "# {{PROJECT_NAME}}\n{{UNKNOWN_VALUE}}",
        values: { PROJECT_NAME: "Example" },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<TemplateRenderError>>({
        code: "UNRESOLVED_TEMPLATE",
        markers: ["{{UNKNOWN_VALUE}}"],
      }),
    );
  });
});
