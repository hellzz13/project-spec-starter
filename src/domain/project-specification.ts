import type { Decision } from "./decision.js";

export const PROJECT_SPECIFICATION_SCHEMA_VERSION = 1;

export const ProjectNatures = [
  "frontend",
  "backend",
  "full-stack",
  "library",
  "cli",
  "worker",
  "infrastructure",
  "mobile",
] as const;

export type ProjectNatureKind = (typeof ProjectNatures)[number];

export type ProjectNature =
  | { readonly kind: ProjectNatureKind }
  | { readonly description: string; readonly kind: "custom" };

export interface ProjectUnit {
  readonly name: string;
  readonly path: Decision<string>;
  readonly nature: ProjectNature;
  readonly capabilities: readonly string[];
}

export type ProjectOrganization =
  | { readonly kind: "single-app" }
  | { readonly kind: "monorepo"; readonly units: readonly ProjectUnit[] };

export interface ProjectSpecification {
  readonly schemaVersion: typeof PROJECT_SPECIFICATION_SCHEMA_VERSION;
  readonly name: string;
  readonly summary: Decision<string>;
  readonly organization: ProjectOrganization;
  readonly nature: ProjectNature;
  readonly capabilities: readonly string[];
  readonly agentSupport: boolean;
}
