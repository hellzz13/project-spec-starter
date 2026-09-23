export const AnswersErrorCodes = {
  INVALID_ANSWERS: "INVALID_ANSWERS",
  UNSUPPORTED_SCHEMA: "UNSUPPORTED_SCHEMA",
} as const;

export type AnswersErrorCode =
  (typeof AnswersErrorCodes)[keyof typeof AnswersErrorCodes];

export class AnswersError extends Error {
  readonly code: AnswersErrorCode;
  readonly path: string;

  constructor(options: {
    readonly code: AnswersErrorCode;
    readonly message: string;
    readonly path: string;
  }) {
    super(options.message);
    this.name = "AnswersError";
    this.code = options.code;
    this.path = options.path;
  }
}
