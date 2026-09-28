import { formatHelp } from "./help.ts";

export interface CliOutput {
  error(message: string): void;
  log(message: string): void;
}

export interface RunCliOptions {
  initialize?: () => Promise<{
    readonly documents: readonly { readonly output: string }[];
  }>;
  output: CliOutput;
  version: string;
}

export async function runCli(
  arguments_: readonly string[],
  { initialize, output, version }: RunCliOptions,
): Promise<number> {
  const [command] = arguments_;
  const isHelpRequested =
    command === undefined || command === "--help" || command === "-h";

  if (isHelpRequested) {
    output.log(formatHelp());
    return 0;
  }

  const isInitRequested = command === "init";

  if (isInitRequested) {
    const initializeIsMissing = initialize === undefined;

    if (initializeIsMissing) {
      output.error("The init command is not available in this build.");
      return 1;
    }

    let result: Awaited<ReturnType<NonNullable<typeof initialize>>>;

    try {
      result = await initialize();
    } catch (error) {
      output.error(
        `Não foi possível iniciar o projeto: ${getErrorMessage(error)}`,
      );
      return 1;
    }
    output.log("\nPreview da geração (nenhum arquivo foi escrito):");

    for (const document of result.documents) {
      output.log(`  ${document.output}`);
    }

    const documentCount = result.documents.length;
    output.log(
      `\n${documentCount} documentos prontos para a etapa de escrita segura.`,
    );
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

function getErrorMessage(error: unknown): string {
  const errorHasMessage = error instanceof Error;

  return errorHasMessage ? error.message : "erro inesperado.";
}
