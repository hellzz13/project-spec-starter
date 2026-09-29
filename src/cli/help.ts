const HELP_TEXT = `project-spec-starter

Bootstrap specification-driven projects.

Usage:
  project-spec-starter <command> [options]

Commands:
  init       Review and generate the initial documentation
  inspect    Inspect the current project specification
  validate   Validate a project answers file

Options:
  -h, --help     Show this help
  -v, --version  Show the installed version
  --dry-run      Inspect the init plan without writing files`;

export function formatHelp(): string {
  return HELP_TEXT;
}
