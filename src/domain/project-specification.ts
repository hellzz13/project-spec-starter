import type { Decision } from "./decision.ts";

export const PROJECT_SPECIFICATION_SCHEMA_VERSION = 1;

export const ProjectNatures = {
  FRONTEND: "frontend",
  BACKEND: "backend",
  FULL_STACK: "full-stack",
  LIBRARY: "library",
  CLI: "cli",
  WORKER: "worker",
  INFRASTRUCTURE: "infrastructure",
  MOBILE: "mobile",
  CUSTOM: "custom",
} as const;

export const ProjectOrganizationKinds = {
  SINGLE_APP: "single-app",
  MONOREPO: "monorepo",
} as const;

export const EngineeringStandards = {
  RECOMMENDED: "recommended",
  CUSTOM: "custom",
  DISABLED: "disabled",
} as const;

export type EngineeringStandard = string;

export type NodeRuntime =
  | { readonly enabled: false }
  | { readonly enabled: true; readonly version: string };

export interface ProjectRuntime {
  readonly node: NodeRuntime;
}

type ProjectNatureValue = (typeof ProjectNatures)[keyof typeof ProjectNatures];

export type ProjectNatureKind = Exclude<
  ProjectNatureValue,
  typeof ProjectNatures.CUSTOM
>;

export type ProjectOrganizationKind =
  (typeof ProjectOrganizationKinds)[keyof typeof ProjectOrganizationKinds];

export type ProjectNature =
  | { readonly kind: ProjectNatureKind }
  | {
      readonly description: string;
      readonly kind: typeof ProjectNatures.CUSTOM;
    };

export interface ProjectUnit {
  readonly name: string;
  readonly path: Decision<string>;
  readonly nature: ProjectNature;
  readonly capabilities: readonly string[];
}

export type ProjectOrganization =
  | { readonly kind: typeof ProjectOrganizationKinds.SINGLE_APP }
  | {
      readonly kind: typeof ProjectOrganizationKinds.MONOREPO;
      readonly units: readonly ProjectUnit[];
    };

export interface ProjectSpecification {
  readonly schemaVersion: typeof PROJECT_SPECIFICATION_SCHEMA_VERSION;
  readonly name: string;
  readonly summary: Decision<string>;
  readonly organization: ProjectOrganization;
  readonly nature: ProjectNature;
  readonly capabilities: readonly string[];
  readonly agentSupport: boolean;
  readonly runtime?: ProjectRuntime;
  readonly engineeringStandard?: EngineeringStandard;
}
