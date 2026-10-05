import type { Decision } from "../domain/decision.ts";
import type {
  ProjectNature,
  ProjectOrganizationKind,
  ProjectRuntime,
  EngineeringStandard,
} from "../domain/project-specification.ts";

export interface DocumentUnitModel {
  readonly name: string;
  readonly path: Decision<string>;
  readonly nature: ProjectNature;
  readonly capabilities: readonly string[];
}

export interface DocumentModel {
  readonly runtime?: ProjectRuntime;
  readonly engineeringStandard?: EngineeringStandard;
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
