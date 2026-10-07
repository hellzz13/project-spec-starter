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
  --dry-run      Inspect the init plan without writing files
  --answers FILE Read versioned answers from a JSON file
  --profile FILE Use a local profile manifest
  --overrides DIR Use local profile resources before selected and default ones
  --yes          Generate without prompts when --answers is provided`;

export function formatHelp(): string {
  return HELP_TEXT;
}
