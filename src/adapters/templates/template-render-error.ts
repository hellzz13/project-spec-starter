export const TemplateRenderErrorCodes = {
  UNRESOLVED_TEMPLATE: "UNRESOLVED_TEMPLATE",
} as const;

export class TemplateRenderError extends Error {
  readonly code = TemplateRenderErrorCodes.UNRESOLVED_TEMPLATE;
  readonly markers: readonly string[];

  constructor(markers: readonly string[]) {
    super(`Unresolved template markers: ${markers.join(", ")}`);
    this.name = "TemplateRenderError";
    this.markers = markers;
  }
}
