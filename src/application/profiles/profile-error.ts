export const ProfileErrorCodes = {
  INVALID_PROFILE: "INVALID_PROFILE",
  UNSUPPORTED_PROFILE_SCHEMA: "UNSUPPORTED_PROFILE_SCHEMA",
} as const;

export type ProfileErrorCode =
  (typeof ProfileErrorCodes)[keyof typeof ProfileErrorCodes];

export class ProfileError extends Error {
  readonly code: ProfileErrorCode;
  readonly path: string;

  constructor(options: {
    readonly code: ProfileErrorCode;
    readonly message: string;
    readonly path: string;
  }) {
    super(options.message);
    this.name = "ProfileError";
    this.code = options.code;
    this.path = options.path;
  }
}
