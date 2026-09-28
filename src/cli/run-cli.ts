import {
  GenerationTargetStatuses,
  type GenerationPlan,
} from "../domain/generation-plan.ts";
import {
  ProjectNatures,
  type ProjectSpecification,
} from "../domain/project-specification.ts";
import { formatHelp } from "./help.ts";

export interface CliOutput {
  error(message: string): void;
  log(message: string): void;
}

export interface RunCliOptions {
  initialize?: () => Promise<{
    readonly plan: GenerationPlan;
    readonly specification: ProjectSpecification;
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
    const requestedOptions = arguments_.slice(1);
    const unsupportedOption = requestedOptions.find(
      (option) => option !== "--dry-run",
    );
    const hasUnsupportedOption = unsupportedOption !== undefined;

    if (hasUnsupportedOption) {
      output.error(`Unknown option for init: ${unsupportedOption}`);
      return 1;
    }

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
    printSpecificationReview({ output, specification: result.specification });
    output.log("\nPlano de geração (nenhum arquivo foi escrito):");

    for (const item of result.plan.items) {
      const targetIsConflicting =
        item.status === GenerationTargetStatuses.CONFLICT;
      const statusLabel = targetIsConflicting ? "conflito" : "novo";
      output.log(`  [${statusLabel}] ${item.output}`);
    }

    const { available, conflict, total } = result.plan.summary;
    output.log(
      `\n${total} documentos: ${available} novos, ${conflict} conflitos.`,
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

function printSpecificationReview(options: {
  readonly output: CliOutput;
  readonly specification: ProjectSpecification;
}): void {
  const { output, specification } = options;
  const natureIsCustom = specification.nature.kind === ProjectNatures.CUSTOM;
  const nature = natureIsCustom
    ? specification.nature.description
    : specification.nature.kind;
  const capabilities = specification.capabilities.join(", ");
  const hasNoCapabilities = capabilities.length === 0;
  const capabilityReview = hasNoCapabilities ? "nenhuma" : capabilities;
  const agentSupport = specification.agentSupport ? "sim" : "não";

  output.log("\nRevise as respostas principais:");
  output.log(`  Projeto: ${specification.name}`);
  output.log(`  Organização: ${specification.organization.kind}`);
  output.log(`  Natureza: ${nature}`);
  output.log(`  Capacidades: ${capabilityReview}`);
  output.log(`  Suporte a agentes: ${agentSupport}`);
}

function getErrorMessage(error: unknown): string {
  const errorHasMessage = error instanceof Error;

  return errorHasMessage ? error.message : "erro inesperado.";
}
