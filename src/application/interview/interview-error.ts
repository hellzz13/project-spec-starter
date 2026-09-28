export const InterviewErrorCodes = {
  UNSAFE_TARGET: "UNSAFE_TARGET",
  TARGET_CONFLICT: "TARGET_CONFLICT",
  INVALID_GROUP_RESPONSE: "INVALID_GROUP_RESPONSE",
  INVALID_DECISION_RESPONSE: "INVALID_DECISION_RESPONSE",
} as const;

export type InterviewErrorCode =
  (typeof InterviewErrorCodes)[keyof typeof InterviewErrorCodes];

export class InterviewError extends Error {
  readonly code: InterviewErrorCode;
  readonly target: string;

  constructor(options: {
    readonly code: InterviewErrorCode;
    readonly message: string;
    readonly target: string;
  }) {
    super(options.message);
    this.name = "InterviewError";
    this.code = options.code;
    this.target = options.target;
  }
}
