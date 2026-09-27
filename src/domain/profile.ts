export const PROFILE_SCHEMA_VERSION = 1 as const;

export const ProfileConditionOperators = {
  EQUALS: "equals",
  INCLUDES: "includes",
  ALL: "all",
  ANY: "any",
} as const;

export type ProfileConditionOperator =
  (typeof ProfileConditionOperators)[keyof typeof ProfileConditionOperators];

export type ProfileCondition =
  | {
      readonly operator: typeof ProfileConditionOperators.EQUALS;
      readonly path: string;
      readonly value: unknown;
    }
  | {
      readonly operator: typeof ProfileConditionOperators.INCLUDES;
      readonly path: string;
      readonly value: unknown;
    }
  | {
      readonly operator: typeof ProfileConditionOperators.ALL;
      readonly conditions: readonly ProfileCondition[];
    }
  | {
      readonly operator: typeof ProfileConditionOperators.ANY;
      readonly conditions: readonly ProfileCondition[];
    };

export interface ProfileDocument {
  readonly id: string;
  readonly output: string;
  readonly template: string;
  readonly condition?: ProfileCondition;
}

export interface ProfileEngineeringStandard {
  readonly description: string;
  readonly template?: string;
}

export interface Profile {
  readonly schemaVersion: typeof PROFILE_SCHEMA_VERSION;
  readonly id: string;
  readonly version: number;
  readonly defaults: Readonly<Record<string, unknown>>;
  readonly customizable: readonly string[];
  readonly engineeringStandards: Readonly<
    Record<string, ProfileEngineeringStandard>
  >;
  readonly questionModules: readonly string[];
  readonly documents: readonly ProfileDocument[];
}
