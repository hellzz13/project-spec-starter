import type { ProfileDocument } from "../../domain/profile.ts";
import type { DocumentModel } from "../../ports/document-model.ts";
import type { TemplateRenderer } from "../../ports/template-renderer.ts";
import { evaluateProfileCondition } from "../profiles/evaluate-profile-condition.ts";
import type { LoadedProfile } from "../profiles/load-profile.ts";
import { renderProjectTemplate } from "./render-project-template.ts";

export const DocumentRenderErrorCodes = {
  MISSING_TEMPLATE: "MISSING_TEMPLATE",
} as const;

export interface RenderedDocument {
  readonly id: string;
  readonly output: string;
  readonly content: string;
}

export class DocumentRenderError extends Error {
  readonly code: (typeof DocumentRenderErrorCodes)[keyof typeof DocumentRenderErrorCodes];
  readonly documentId: string;
  readonly template: string;

  constructor(options: {
    readonly documentId: string;
    readonly template: string;
  }) {
    super(
      `Template "${options.template}" referenced by document "${options.documentId}" is missing from the loaded profile.`,
    );
    this.name = "DocumentRenderError";
    this.code = DocumentRenderErrorCodes.MISSING_TEMPLATE;
    this.documentId = options.documentId;
    this.template = options.template;
  }
}

export function renderProfileDocuments(options: {
  readonly conditionSource?: unknown;
  readonly loadedProfile: LoadedProfile;
  readonly model: DocumentModel;
  readonly renderer: TemplateRenderer;
}): readonly RenderedDocument[] {
  const { loadedProfile, model, renderer } = options;
  const conditionSource = options.conditionSource ?? model;

  assertReferencedTemplatesAreLoaded(loadedProfile);

  const renderApplicableDocument = (
    document: ProfileDocument,
  ): readonly RenderedDocument[] => {
    const documentIsApplicable = isDocumentApplicable(
      document,
      conditionSource,
    );

    if (!documentIsApplicable) {
      return [];
    }

    const template = loadedProfile.templates[document.template];
    const templateIsLoaded = template !== undefined;

    if (!templateIsLoaded) {
      throw new DocumentRenderError({
        documentId: document.id,
        template: document.template,
      });
    }

    const content = renderProjectTemplate({ model, renderer, template });

    return [{ id: document.id, output: document.output, content }];
  };

  return loadedProfile.profile.documents.flatMap(renderApplicableDocument);
}

function assertReferencedTemplatesAreLoaded(
  loadedProfile: LoadedProfile,
): void {
  const referencesMissingTemplate = (document: ProfileDocument): boolean => {
    const template = loadedProfile.templates[document.template];
    const templateIsMissing = template === undefined;

    return templateIsMissing;
  };
  const documentWithMissingTemplate = loadedProfile.profile.documents.find(
    referencesMissingTemplate,
  );
  const hasMissingTemplate = documentWithMissingTemplate !== undefined;

  if (hasMissingTemplate) {
    throw new DocumentRenderError({
      documentId: documentWithMissingTemplate.id,
      template: documentWithMissingTemplate.template,
    });
  }
}

function isDocumentApplicable(
  document: ProfileDocument,
  conditionSource: unknown,
): boolean {
  const conditionIsAbsent = document.condition === undefined;

  if (conditionIsAbsent) {
    return true;
  }

  return evaluateProfileCondition({
    condition: document.condition,
    source: conditionSource,
  });
}
