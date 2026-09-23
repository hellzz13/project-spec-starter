export interface TemplateRenderRequest {
  readonly template: string;
  readonly values: Readonly<Record<string, string>>;
}

export interface TemplateRenderer {
  render(request: TemplateRenderRequest): string;
}
