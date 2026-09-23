import type { DocumentModel } from "./create-document-model.js";

export function renderProjectDocument(model: DocumentModel): string {
  const capabilities = renderList(
    model.project.capabilities,
    "Nenhuma capacidade declarada inicialmente.",
  );
  const units = renderUnits(model.project.units);

  return `# ${model.project.name}

## Visão inicial

${model.project.summary}

## Estrutura do projeto

| Item | Decisão |
| --- | --- |
| Organização | ${model.project.organization} |
| Natureza | ${model.project.nature} |
| Suporte a agentes | ${model.project.agentSupport} |

## Capacidades declaradas

${capabilities}${units}
## Refinamento

Decisões marcadas como pendentes devem ser perguntadas somente quando afetarem
a tarefa atual. Depois da resposta, este documento deve ser atualizado e passa
a representar a fonte de verdade do projeto.
`;
}

function renderList(items: readonly string[], emptyMessage: string): string {
  return items.length === 0
    ? emptyMessage
    : items.map((item) => `- ${item}`).join("\n");
}

function renderUnits(units: DocumentModel["project"]["units"]): string {
  if (units.length === 0) {
    return "\n";
  }

  const rows = units
    .map((unit) => {
      const capabilities =
        unit.capabilities.length === 0
          ? "Nenhuma declarada"
          : unit.capabilities.join(", ");

      return `| ${unit.name} | ${unit.path} | ${unit.nature} | ${capabilities} |`;
    })
    .join("\n");

  return `

## Unidades do monorepo

| Unidade | Caminho | Natureza | Capacidades |
| --- | --- | --- | --- |
${rows}
`;
}
