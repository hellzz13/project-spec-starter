import type { GenerationPlan } from "../domain/generation-plan.ts";

export interface GenerationWriter {
  write(plan: GenerationPlan): Promise<void>;
}

export const GenerationWriteErrorCodes = {
  FILE_CONFLICT: "FILE_CONFLICT",
  WRITE_FAILED: "WRITE_FAILED",
  ROLLBACK_INCOMPLETE: "ROLLBACK_INCOMPLETE",
} as const;

export type GenerationWriteErrorCode =
  (typeof GenerationWriteErrorCodes)[keyof typeof GenerationWriteErrorCodes];

export class GenerationWriteError extends Error {
  readonly code: GenerationWriteErrorCode;
  readonly paths: readonly string[];

  constructor(options: {
    readonly code: GenerationWriteErrorCode;
    readonly paths: readonly string[];
  }) {
    super(`Generation could not be completed: ${options.code}`);
    this.name = "GenerationWriteError";
    this.code = options.code;
    this.paths = Object.freeze([...options.paths]);
  }
}
