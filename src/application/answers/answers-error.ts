export type AnswersErrorCode = "INVALID_ANSWERS" | "UNSUPPORTED_SCHEMA";

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
