import type { Decision } from "../../domain/decision.js";
import type {
  ProjectNature,
  ProjectSpecification,
} from "../../domain/project-specification.js";

export interface DocumentUnitModel {
  readonly name: string;
  readonly path: string;
  readonly nature: string;
  readonly capabilities: readonly string[];
}

export interface DocumentModel {
  readonly project: {
    readonly name: string;
    readonly summary: string;
    readonly organization: string;
    readonly nature: string;
    readonly capabilities: readonly string[];
    readonly agentSupport: string;
    readonly units: readonly DocumentUnitModel[];
  };
}

const NatureLabels = {
  frontend: "Frontend",
  backend: "Backend",
  "full-stack": "Full-stack",
  library: "Biblioteca",
  cli: "CLI",
  worker: "Worker",
  infrastructure: "Infraestrutura",
  mobile: "Mobile",
} as const;

export function createDocumentModel(
  specification: ProjectSpecification,
): DocumentModel {
  const isMonorepo = specification.organization.kind === "monorepo";
  const units = isMonorepo
    ? specification.organization.units.map((unit) => ({
        name: unit.name,
        path: formatDecision(unit.path),
        nature: formatNature(unit.nature),
        capabilities: unit.capabilities,
      }))
    : [];

  return {
    project: {
      name: specification.name,
      summary: formatDecision(specification.summary),
      organization: isMonorepo ? "Monorepo" : "Aplicação única",
      nature: formatNature(specification.nature),
      capabilities: specification.capabilities,
      agentSupport: specification.agentSupport ? "Habilitado" : "Desabilitado",
      units,
    },
  };
}

function formatDecision(decision: Decision<string>): string {
  switch (decision.state) {
    case "defined":
      return decision.value;
    case "pending":
      return "Decisão pendente";
    case "not-applicable":
      return "Não se aplica";
  }
}

function formatNature(nature: ProjectNature): string {
  return nature.kind === "custom"
    ? nature.description
    : NatureLabels[nature.kind];
}
