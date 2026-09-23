import {
  DecisionStates,
  type Decision,
  type DecisionState,
} from "../../domain/decision.js";
import {
  ProjectNatures,
  ProjectOrganizationKinds,
  type ProjectNature,
  type ProjectNatureKind,
  type ProjectOrganizationKind,
} from "../../domain/project-specification.js";
import type { DocumentModel } from "../../ports/document-model.js";
import type { TemplateRenderer } from "../../ports/template-renderer.js";

type DecisionWithoutValueState = Exclude<
  DecisionState,
  typeof DecisionStates.DEFINED
>;

const DecisionLabels = {
  [DecisionStates.PENDING]: "Decisão pendente",
  [DecisionStates.NOT_APPLICABLE]: "Não se aplica",
} satisfies Record<DecisionWithoutValueState, string>;

const NatureLabels = {
  [ProjectNatures.FRONTEND]: "Frontend",
  [ProjectNatures.BACKEND]: "Backend",
  [ProjectNatures.FULL_STACK]: "Full-stack",
  [ProjectNatures.LIBRARY]: "Biblioteca",
  [ProjectNatures.CLI]: "CLI",
  [ProjectNatures.WORKER]: "Worker",
  [ProjectNatures.INFRASTRUCTURE]: "Infraestrutura",
  [ProjectNatures.MOBILE]: "Mobile",
} satisfies Record<ProjectNatureKind, string>;

const OrganizationLabels = {
  [ProjectOrganizationKinds.SINGLE_APP]: "Aplicação única",
  [ProjectOrganizationKinds.MONOREPO]: "Monorepo",
} satisfies Record<ProjectOrganizationKind, string>;

export function renderProjectTemplate(options: {
  readonly model: DocumentModel;
  readonly renderer: TemplateRenderer;
  readonly template: string;
}): string {
  const { model, renderer, template } = options;
  const hasAgentSupport = model.project.agentSupport;
  const organization = OrganizationLabels[model.project.organizationKind];
  const nature = formatNature(model.project.nature);
  const agentSupport = hasAgentSupport ? "Habilitado" : "Desabilitado";
  const values = {
    PROJECT_NAME: model.project.name,
    PROJECT_SUMMARY: formatDecision(model.project.summary),
    PROJECT_ORGANIZATION: organization,
    PROJECT_NATURE: nature,
    AGENT_SUPPORT: agentSupport,
    PROJECT_STRUCTURE_ROWS: renderProjectStructure({
      agentSupport,
      nature,
      organization,
    }),
    PROJECT_CAPABILITIES: renderList(
      model.project.capabilities,
      "Nenhuma capacidade declarada inicialmente.",
    ),
    PROJECT_UNITS: renderUnits(model.project.units),
  } satisfies Record<string, string>;

  return renderer.render({ template, values });
}

function formatDecision(decision: Decision<string>): string {
  const isDefinedDecision = decision.state === DecisionStates.DEFINED;

  if (isDefinedDecision) {
    return decision.value;
  }

  return DecisionLabels[decision.state];
}

function formatNature(nature: ProjectNature): string {
  const isCustomNature = nature.kind === ProjectNatures.CUSTOM;

  return isCustomNature ? nature.description : NatureLabels[nature.kind];
}

function renderList(items: readonly string[], emptyMessage: string): string {
  const hasNoItems = items.length === 0;

  return hasNoItems
    ? emptyMessage
    : items.map((item) => `- ${escapeListItem(item)}`).join("\n");
}

function renderProjectStructure(values: {
  readonly agentSupport: string;
  readonly nature: string;
  readonly organization: string;
}): string {
  const organizationRow = `| Organização | ${escapeTableCell(values.organization)} |`;
  const natureRow = `| Natureza | ${escapeTableCell(values.nature)} |`;
  const agentSupportRow = `| Suporte a agentes | ${escapeTableCell(values.agentSupport)} |`;

  return [organizationRow, natureRow, agentSupportRow].join("\n");
}

function renderUnits(units: DocumentModel["project"]["units"]): string {
  const hasNoUnits = units.length === 0;

  if (hasNoUnits) {
    return "";
  }

  const rows = units.map((unit) => {
    const hasNoCapabilities = unit.capabilities.length === 0;
    const capabilities = hasNoCapabilities
      ? "Nenhuma declarada"
      : unit.capabilities.join(", ");
    const unitRow = `| ${escapeTableCell(unit.name)} | ${escapeTableCell(formatDecision(unit.path))} | ${escapeTableCell(formatNature(unit.nature))} | ${escapeTableCell(capabilities)} |`;

    return unitRow;
  });
  const renderedRows = rows.join("\n");

  return `## Unidades do monorepo

| Unidade | Caminho | Natureza | Capacidades |
| --- | --- | --- | --- |
${renderedRows}

`;
}

function escapeListItem(value: string): string {
  return value.replace(/\r?\n/gu, " ");
}

function escapeTableCell(value: string): string {
  return value.replace(/\|/gu, "\\|").replace(/\r?\n/gu, "<br>");
}
