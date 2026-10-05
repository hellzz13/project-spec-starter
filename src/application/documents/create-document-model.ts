import {
  ProjectOrganizationKinds,
  type ProjectSpecification,
} from "../../domain/project-specification.ts";
import type { DocumentModel } from "../../ports/document-model.ts";

export function createDocumentModel(
  specification: ProjectSpecification,
): DocumentModel {
  const isMonorepo =
    specification.organization.kind === ProjectOrganizationKinds.MONOREPO;
  const hasAgentSupport = specification.agentSupport;
  const hasRuntime = specification.runtime !== undefined;
  const hasEngineeringStandard =
    specification.engineeringStandard !== undefined;
  const runtime = hasRuntime ? { runtime: specification.runtime } : {};
  const engineeringStandard = hasEngineeringStandard
    ? { engineeringStandard: specification.engineeringStandard }
    : {};
  const units = isMonorepo
    ? specification.organization.units.map((unit) => ({
        name: unit.name,
        path: unit.path,
        nature: unit.nature,
        capabilities: unit.capabilities,
      }))
    : [];

  return {
    ...runtime,
    ...engineeringStandard,
    project: {
      name: specification.name,
      summary: specification.summary,
      organizationKind: specification.organization.kind,
      nature: specification.nature,
      capabilities: specification.capabilities,
      agentSupport: hasAgentSupport,
      units,
    },
  };
}
