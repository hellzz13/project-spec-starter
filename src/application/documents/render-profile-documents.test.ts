import { describe, expect, it } from "vitest";

import {
  ProfileConditionOperators,
  type Profile,
} from "../../domain/profile.ts";
import {
  ProjectNatures,
  ProjectOrganizationKinds,
} from "../../domain/project-specification.ts";
import type { DocumentModel } from "../../ports/document-model.ts";
import type { TemplateRenderer } from "../../ports/template-renderer.ts";
import type { LoadedProfile } from "../profiles/load-profile.ts";
import {
  DocumentRenderErrorCodes,
  renderProfileDocuments,
} from "./render-profile-documents.ts";

const model: DocumentModel = {
  project: {
    name: "Billing API",
    summary: { state: "pending" },
    organizationKind: ProjectOrganizationKinds.SINGLE_APP,
    nature: { kind: ProjectNatures.BACKEND },
    capabilities: ["http-api", "scheduled-jobs"],
    agentSupport: false,
    units: [],
  },
};

const renderer: TemplateRenderer = {
  render({ template, values }) {
    return template.replace("{{PROJECT_NAME}}", values.PROJECT_NAME ?? "");
  },
};

describe("renderProfileDocuments", () => {
  it("renders applicable documents in manifest order", () => {
    const loadedProfile = createLoadedProfile({
      documents: [
        {
          id: "project",
          output: "PROJECT.md",
          template: "project.md",
        },
        {
          id: "contributing",
          output: "CONTRIBUTING.md",
          template: "contributing.md",
        },
      ],
      templates: {
        "contributing.md": "Contributing to {{PROJECT_NAME}}",
        "project.md": "# {{PROJECT_NAME}}",
      },
    });

    expect(renderProfileDocuments({ loadedProfile, model, renderer })).toEqual([
      {
        id: "project",
        output: "PROJECT.md",
        content: "# Billing API",
      },
      {
        id: "contributing",
        output: "CONTRIBUTING.md",
        content: "Contributing to Billing API",
      },
    ]);
  });

  it("omits a document when its condition is false", () => {
    const loadedProfile = createLoadedProfile({
      documents: [
        {
          id: "agents",
          output: "AGENTS.md",
          template: "agents.md",
          condition: {
            operator: ProfileConditionOperators.EQUALS,
            path: "project.agentSupport",
            value: true,
          },
        },
      ],
      templates: { "agents.md": "Agents" },
    });

    expect(renderProfileDocuments({ loadedProfile, model, renderer })).toEqual(
      [],
    );
  });

  it("reports a referenced template that is missing from the loaded profile", () => {
    const loadedProfile = createLoadedProfile({
      documents: [
        {
          id: "project",
          output: "PROJECT.md",
          template: "missing.md",
        },
      ],
      templates: {},
    });

    expect(() =>
      renderProfileDocuments({ loadedProfile, model, renderer }),
    ).toThrowError(
      expect.objectContaining({
        code: DocumentRenderErrorCodes.MISSING_TEMPLATE,
        documentId: "project",
        template: "missing.md",
      }),
    );
  });
});

function createLoadedProfile(options: {
  readonly documents: Profile["documents"];
  readonly templates: Readonly<Record<string, string>>;
}): LoadedProfile {
  return {
    profile: {
      schemaVersion: 1,
      id: "test",
      version: 1,
      defaults: {},
      customizable: [],
      engineeringStandards: {},
      questionModules: [],
      documents: options.documents,
    },
    questionModules: [],
    templates: options.templates,
  };
}
