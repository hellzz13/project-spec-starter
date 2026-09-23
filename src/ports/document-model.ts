import type { Decision } from "../domain/decision.js";
import type {
  ProjectNature,
  ProjectOrganizationKind,
} from "../domain/project-specification.js";

export interface DocumentUnitModel {
  readonly name: string;
  readonly path: Decision<string>;
  readonly nature: ProjectNature;
  readonly capabilities: readonly string[];
}

export interface DocumentModel {
  readonly project: {
    readonly name: string;
    readonly summary: Decision<string>;
    readonly organizationKind: ProjectOrganizationKind;
    readonly nature: ProjectNature;
    readonly capabilities: readonly string[];
    readonly agentSupport: boolean;
    readonly units: readonly DocumentUnitModel[];
  };
}
