export const GenerationTargetStatuses = {
  AVAILABLE: "available",
  CONFLICT: "conflict",
} as const;

export type GenerationTargetStatus =
  (typeof GenerationTargetStatuses)[keyof typeof GenerationTargetStatuses];

export interface GenerationPlanItem {
  readonly id: string;
  readonly output: string;
  readonly content: string;
  readonly status: GenerationTargetStatus;
}

export interface GenerationPlanSummary {
  readonly total: number;
  readonly available: number;
  readonly conflict: number;
}

export interface GenerationPlan {
  readonly items: readonly GenerationPlanItem[];
  readonly summary: GenerationPlanSummary;
}

export const GenerationPlanErrorCodes = {
  MISSING_TARGET_OBSERVATION: "MISSING_TARGET_OBSERVATION",
} as const;

export type GenerationPlanErrorCode =
  (typeof GenerationPlanErrorCodes)[keyof typeof GenerationPlanErrorCodes];

export class GenerationPlanError extends Error {
  readonly code: GenerationPlanErrorCode;
  readonly output: string;

  constructor(options: {
    readonly code: GenerationPlanErrorCode;
    readonly output: string;
  }) {
    super(`Generation target has no filesystem observation: ${options.output}`);
    this.name = "GenerationPlanError";
    this.code = options.code;
    this.output = options.output;
  }
}
