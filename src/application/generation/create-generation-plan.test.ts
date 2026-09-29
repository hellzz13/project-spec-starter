import { describe, expect, it } from "vitest";

import {
  GenerationTargetStatuses,
  GenerationPlanErrorCodes,
} from "../../domain/generation-plan.ts";
import { createGenerationPlan } from "./create-generation-plan.ts";

const documents = [
  { id: "engineering", output: "docs/ENGINEERING.md", content: "# Rules" },
  { id: "project", output: "PROJECT.md", content: "# Project" },
] as const;

describe("createGenerationPlan", () => {
  it("creates a path-ordered plan with immutable items and status counts", () => {
    const plan = createGenerationPlan({
      documents,
      observations: {
        "PROJECT.md": GenerationTargetStatuses.AVAILABLE,
        "docs/ENGINEERING.md": GenerationTargetStatuses.CONFLICT,
      },
    });

    expect(plan).toEqual({
      items: [
        {
          id: "project",
          output: "PROJECT.md",
          content: "# Project",
          status: GenerationTargetStatuses.AVAILABLE,
        },
        {
          id: "engineering",
          output: "docs/ENGINEERING.md",
          content: "# Rules",
          status: GenerationTargetStatuses.CONFLICT,
        },
      ],
      summary: { total: 2, available: 1, conflict: 1 },
    });
    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.items)).toBe(true);
    expect(Object.isFrozen(plan.items[0])).toBe(true);
    expect(Object.isFrozen(plan.summary)).toBe(true);
  });

  it("does not mutate the rendered documents or observations", () => {
    const mutableDocuments = [
      { id: "project", output: "PROJECT.md", content: "# Project" },
    ];
    const observations = {
      "PROJECT.md": GenerationTargetStatuses.AVAILABLE,
    };

    createGenerationPlan({ documents: mutableDocuments, observations });

    expect(mutableDocuments).toEqual([
      { id: "project", output: "PROJECT.md", content: "# Project" },
    ]);
    expect(observations).toEqual({
      "PROJECT.md": GenerationTargetStatuses.AVAILABLE,
    });
  });

  it("rejects a document without a target observation", () => {
    expect(() =>
      createGenerationPlan({ documents, observations: {} }),
    ).toThrowError(
      expect.objectContaining({
        code: GenerationPlanErrorCodes.MISSING_TARGET_OBSERVATION,
        output: "docs/ENGINEERING.md",
      }),
    );
  });
});
