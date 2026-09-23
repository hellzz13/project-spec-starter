import { formatHelp } from "./help.js";

export interface CliOutput {
  error(message: string): void;
  log(message: string): void;
}

export interface RunCliOptions {
  output: CliOutput;
  version: string;
}

export function runCli(
  arguments_: readonly string[],
  { output, version }: RunCliOptions,
): number {
  const [command] = arguments_;
  const isHelpRequested =
    command === undefined || command === "--help" || command === "-h";

  if (isHelpRequested) {
    output.log(formatHelp());
    return 0;
  }

  const isVersionRequested = command === "--version" || command === "-v";

  if (isVersionRequested) {
    output.log(version);
    return 0;
  }

  output.error(`Unknown command: ${command}`);
  output.error(
    "Run project-spec-starter --help to see the available commands.",
  );
  return 1;
}
