const HELP_TEXT = `project-spec-starter

Bootstrap specification-driven projects.

Usage:
  project-spec-starter <command> [options]

Commands:
  init       Create the initial project documentation
  inspect    Inspect the current project specification
  validate   Validate a project answers file

Options:
  -h, --help     Show this help
  -v, --version  Show the installed version`;

export function formatHelp(): string {
  return HELP_TEXT;
}
