import {
  GenerationPlanError,
  GenerationPlanErrorCodes,
  GenerationTargetStatuses,
  type GenerationPlan,
  type GenerationTargetStatus,
} from "../../domain/generation-plan.ts";

export interface RenderedGenerationDocument {
  readonly id: string;
  readonly output: string;
  readonly content: string;
}

export interface CreateGenerationPlanOptions {
  readonly documents: readonly RenderedGenerationDocument[];
  readonly observations: Readonly<Record<string, GenerationTargetStatus>>;
}

export function createGenerationPlan(
  options: CreateGenerationPlanOptions,
): GenerationPlan {
  const items = options.documents.map((document) => {
    const status = options.observations[document.output];
    const targetObservationIsMissing = status === undefined;

    if (targetObservationIsMissing) {
      throw new GenerationPlanError({
        code: GenerationPlanErrorCodes.MISSING_TARGET_OBSERVATION,
        output: document.output,
      });
    }

    return Object.freeze({ ...document, status });
  });
  const sortedItems = items.sort(compareGenerationItems);
  const conflictCount = sortedItems.filter(isConflictingItem).length;
  const availableCount = sortedItems.length - conflictCount;
  const summary = Object.freeze({
    total: sortedItems.length,
    available: availableCount,
    conflict: conflictCount,
  });

  return Object.freeze({ items: Object.freeze(sortedItems), summary });
}

function compareGenerationItems(
  firstItem: { readonly output: string },
  secondItem: { readonly output: string },
): number {
  const firstOutputIsBeforeSecond = firstItem.output < secondItem.output;
  const firstOutputIsAfterSecond = firstItem.output > secondItem.output;

  if (firstOutputIsBeforeSecond) {
    return -1;
  }

  if (firstOutputIsAfterSecond) {
    return 1;
  }

  return 0;
}

function isConflictingItem(item: {
  readonly status: GenerationTargetStatus;
}): boolean {
  return item.status === GenerationTargetStatuses.CONFLICT;
}
