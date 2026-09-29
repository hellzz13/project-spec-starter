import { describe, expect, it, vi } from "vitest";

import { GenerationTargetStatuses } from "../../domain/generation-plan.ts";
import type { GenerationTargetInspector } from "../../ports/generation-target-inspector.ts";
import { planProjectGeneration } from "./plan-project-generation.ts";

describe("planProjectGeneration", () => {
  it("inspects every output and creates a deterministic plan", async () => {
    const inspect = vi.fn().mockResolvedValue([
      { exists: true, output: "PROJECT.md" },
      { exists: false, output: "docs/ENGINEERING.md" },
    ]);
    const inspector: GenerationTargetInspector = {
      inspect,
    };
    const documents = [
      { id: "engineering", output: "docs/ENGINEERING.md", content: "Rules" },
      { id: "project", output: "PROJECT.md", content: "Project" },
    ];

    const plan = await planProjectGeneration({ documents, inspector });

    expect(inspect).toHaveBeenCalledWith(["docs/ENGINEERING.md", "PROJECT.md"]);
    expect(plan.items).toEqual([
      expect.objectContaining({
        output: "PROJECT.md",
        status: GenerationTargetStatuses.CONFLICT,
      }),
      expect.objectContaining({
        output: "docs/ENGINEERING.md",
        status: GenerationTargetStatuses.AVAILABLE,
      }),
    ]);
  });
});
