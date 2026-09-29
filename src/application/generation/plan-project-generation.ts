import {
  GenerationTargetStatuses,
  type GenerationPlan,
  type GenerationTargetStatus,
} from "../../domain/generation-plan.ts";
import type { GenerationTargetInspector } from "../../ports/generation-target-inspector.ts";
import {
  createGenerationPlan,
  type RenderedGenerationDocument,
} from "./create-generation-plan.ts";

export async function planProjectGeneration(options: {
  readonly documents: readonly RenderedGenerationDocument[];
  readonly inspector: GenerationTargetInspector;
}): Promise<GenerationPlan> {
  const outputs = options.documents.map(({ output }) => output);
  const targetStates = await options.inspector.inspect(outputs);
  const observationEntries = targetStates.map(({ exists, output }) => {
    const status: GenerationTargetStatus = exists
      ? GenerationTargetStatuses.CONFLICT
      : GenerationTargetStatuses.AVAILABLE;

    return [output, status] as const;
  });
  const observations = Object.fromEntries(observationEntries);

  return createGenerationPlan({
    documents: options.documents,
    observations,
  });
}
