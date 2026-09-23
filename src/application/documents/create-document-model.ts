import {
  ProjectOrganizationKinds,
  type ProjectSpecification,
} from "../../domain/project-specification.js";
import type { DocumentModel } from "../../ports/document-model.js";

export function createDocumentModel(
  specification: ProjectSpecification,
): DocumentModel {
  const isMonorepo =
    specification.organization.kind === ProjectOrganizationKinds.MONOREPO;
  const hasAgentSupport = specification.agentSupport;
  const units = isMonorepo
    ? specification.organization.units.map((unit) => ({
        name: unit.name,
        path: unit.path,
        nature: unit.nature,
        capabilities: unit.capabilities,
      }))
    : [];

  return {
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
