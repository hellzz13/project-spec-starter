import { beforeAll, describe, expect, it } from "vitest";

import { FileSystemProfileResourceReader } from "../../src/adapters/profiles/file-system-profile-resource-reader.ts";
import { tokenTemplateRenderer } from "../../src/adapters/templates/render-token-template.ts";
import { parseAnswers } from "../../src/application/answers/parse-answers.ts";
import { createDocumentModel } from "../../src/application/documents/create-document-model.ts";
import {
  renderProfileDocuments,
  type RenderedDocument,
} from "../../src/application/documents/render-profile-documents.ts";
import {
  loadProfile,
  type LoadedProfile,
} from "../../src/application/profiles/load-profile.ts";
import { documentScenarios } from "../fixtures/document-scenarios.ts";

const PROJECT_ROOT = new URL("../../", import.meta.url);
const DEFAULT_PROFILE_PATH = "profiles/default/profile.json";
const AGENT_DOCUMENT_OUTPUT = "AGENTS.md";
const MONOREPO_SECTION = "## Unidades do monorepo";
const UNRESOLVED_TEMPLATE_MARKER_PATTERN = /\{\{[^{}]+\}\}/u;

let loadedProfile: LoadedProfile;

beforeAll(async () => {
  const reader = new FileSystemProfileResourceReader(PROJECT_ROOT);
  loadedProfile = await loadProfile({
    manifestPath: DEFAULT_PROFILE_PATH,
    reader,
  });
});

function renderScenario(answers: Record<string, unknown>) {
  const model = createDocumentModel(parseAnswers(answers));

  return renderProfileDocuments({
    loadedProfile,
    model,
    renderer: tokenTemplateRenderer,
  });
}

function requireProjectDocument(
  documents: readonly RenderedDocument[],
): RenderedDocument {
  const projectDocument = documents.find(({ output }) => {
    const isProjectDocument = output === "PROJECT.md";

    return isProjectDocument;
  });
  const projectDocumentIsMissing = projectDocument === undefined;

  if (projectDocumentIsMissing) {
    throw new Error("The default profile did not render PROJECT.md.");
  }

  return projectDocument;
}

describe("default profile document scenarios", () => {
  it.each(documentScenarios)(
    "preserves manifest invariants for $id",
    (scenario) => {
      const firstRendering = renderScenario(scenario.answers);
      const secondRendering = renderScenario(scenario.answers);
      const renderedOutputs = firstRendering.map(({ output }) => output);
      const containsUnresolvedMarker = firstRendering.some(({ content }) =>
        UNRESOLVED_TEMPLATE_MARKER_PATTERN.test(content),
      );
      const expectedOutputs = loadedProfile.profile.documents
        .filter(({ output }) => {
          const isAgentDocument = output === AGENT_DOCUMENT_OUTPUT;
          const shouldOmitAgentDocument =
            isAgentDocument && !scenario.expectsAgentDocument;

          return !shouldOmitAgentDocument;
        })
        .map(({ output }) => output);

      expect(secondRendering).toEqual(firstRendering);
      expect(renderedOutputs).toEqual(expectedOutputs);
      expect(containsUnresolvedMarker).toBe(false);
    },
  );

  it.each(documentScenarios)(
    "renders only compatible project structure for $id",
    (scenario) => {
      const renderedDocuments = renderScenario(scenario.answers);
      const projectDocument = requireProjectDocument(renderedDocuments);
      const agentDocumentIsPresent = renderedDocuments.some(({ output }) => {
        const isAgentDocument = output === AGENT_DOCUMENT_OUTPUT;

        return isAgentDocument;
      });
      const monorepoSectionIsPresent =
        projectDocument.content.includes(MONOREPO_SECTION);

      expect(projectDocument.content).toContain(
        `| Natureza | ${scenario.expectedNature} |`,
      );
      expect(monorepoSectionIsPresent).toBe(scenario.expectsMonorepoSection);
      expect(agentDocumentIsPresent).toBe(scenario.expectsAgentDocument);
    },
  );

  it("keeps pending decisions explicit", () => {
    const pendingScenario = documentScenarios.find(({ id }) => {
      const isPendingScenario = id === "pending-decisions";

      return isPendingScenario;
    });
    const pendingScenarioIsMissing = pendingScenario === undefined;

    if (pendingScenarioIsMissing) {
      throw new Error("The pending decisions scenario is missing.");
    }

    const projectDocument = requireProjectDocument(
      renderScenario(pendingScenario.answers),
    );

    expect(projectDocument.content).toContain(
      "## Contexto inicial\n\nDecisão pendente",
    );
    expect(projectDocument.content).toContain(
      "### Proposta de valor\n\nDecisão pendente",
    );
  });

  it.each(
    documentScenarios.filter(
      ({ includeProjectSnapshot }) => includeProjectSnapshot,
    ),
  )(
    "matches the complete representative PROJECT.md snapshot for $id",
    (scenario) => {
      const projectDocument = requireProjectDocument(
        renderScenario(scenario.answers),
      );

      expect(projectDocument.content).toMatchSnapshot();
    },
  );
});
