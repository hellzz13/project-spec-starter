import type {
  TemplateRenderer,
  TemplateRenderRequest,
} from "../../ports/template-renderer.js";
import { TemplateRenderError } from "./template-render-error.js";

const TEMPLATE_MARKER_PATTERN = /\{\{([A-Z][A-Z0-9_]*)\}\}/gu;

export const tokenTemplateRenderer: TemplateRenderer = {
  render({ template, values }: TemplateRenderRequest): string {
    const renderedTemplate = template.replace(
      TEMPLATE_MARKER_PATTERN,
      (marker, key: string) => {
        const value = values[key];
        const hasValue = value !== undefined;

        return hasValue ? value : marker;
      },
    );
    const unresolvedMarkers = findTemplateMarkers(renderedTemplate);
    const hasUnresolvedMarkers = unresolvedMarkers.length > 0;

    if (hasUnresolvedMarkers) {
      throw new TemplateRenderError(unresolvedMarkers);
    }

    return renderedTemplate;
  },
};

function findTemplateMarkers(template: string): readonly string[] {
  const markers = Array.from(
    template.matchAll(TEMPLATE_MARKER_PATTERN),
    (match) => match[0],
  );

  return [...new Set(markers)];
}
