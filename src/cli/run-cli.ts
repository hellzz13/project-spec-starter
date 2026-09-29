import {
  GenerationTargetStatuses,
  type GenerationPlan,
} from "../domain/generation-plan.ts";
import {
  ProjectNatures,
  type ProjectSpecification,
} from "../domain/project-specification.ts";
import { formatHelp } from "./help.ts";
import {
  GenerationWriteError,
  GenerationWriteErrorCodes,
  type GenerationWriteErrorCode,
} from "../ports/generation-writer.ts";

export interface CliOutput {
  error(message: string): void;
  log(message: string): void;
}

export interface RunCliOptions {
  confirmGeneration?: (plan: GenerationPlan) => Promise<boolean>;
  writeGeneration?: (plan: GenerationPlan) => Promise<void>;
  initialize?: () => Promise<{
    readonly plan: GenerationPlan;
    readonly specification: ProjectSpecification;
  }>;
  output: CliOutput;
  version: string;
}

export async function runCli(
  arguments_: readonly string[],
  {
    initialize,
    confirmGeneration,
    writeGeneration,
    output,
    version,
  }: RunCliOptions,
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
    const unsupportedOption = requestedOptions.find(isUnsupportedInitOption);
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
    const isDryRun = requestedOptions.includes("--dry-run");

    if (isDryRun) {
      return 0;
    }

    const hasConflictingTargets = result.plan.items.some(isConflictingTarget);

    if (hasConflictingTargets) {
      output.error(
        "Geração bloqueada por conflitos. Preserve os arquivos existentes e escolha um diretório livre.",
      );
      return 1;
    }

    const writerIsUnavailable =
      confirmGeneration === undefined || writeGeneration === undefined;

    if (writerIsUnavailable) {
      output.error("A escrita não está disponível neste build. Use --dry-run.");
      return 1;
    }

    try {
      const generationIsApproved = await confirmGeneration(result.plan);

      if (!generationIsApproved) {
        output.log("Geração cancelada. Nenhum arquivo foi escrito.");
        return 0;
      }

      await writeGeneration(result.plan);
      output.log(`Geração concluída: ${total} documentos criados.`);
      return 0;
    } catch (error) {
      output.error(
        `Não foi possível gerar os documentos: ${getErrorMessage(error)}`,
      );
      return 1;
    }
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

function isConflictingTarget(item: GenerationPlan["items"][number]): boolean {
  return item.status === GenerationTargetStatuses.CONFLICT;
}

function isUnsupportedInitOption(option: string): boolean {
  return option !== "--dry-run";
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
  const agentSupportIsEnabled = specification.agentSupport;
  const agentSupport = agentSupportIsEnabled ? "sim" : "não";

  output.log("\nRevise as respostas principais:");
  output.log(`  Projeto: ${specification.name}`);
  output.log(`  Organização: ${specification.organization.kind}`);
  output.log(`  Natureza: ${nature}`);
  output.log(`  Capacidades: ${capabilityReview}`);
  output.log(`  Suporte a agentes: ${agentSupport}`);
}

function getErrorMessage(error: unknown): string {
  const isGenerationWriteError = error instanceof GenerationWriteError;

  if (isGenerationWriteError) {
    const messages: Record<GenerationWriteErrorCode, string> = {
      [GenerationWriteErrorCodes.FILE_CONFLICT]:
        "Conflito de arquivos. Nenhum arquivo existente foi sobrescrito.",
      [GenerationWriteErrorCodes.WRITE_FAILED]:
        "Falha de escrita. Os arquivos criados foram removidos.",
      [GenerationWriteErrorCodes.ROLLBACK_INCOMPLETE]:
        "Recuperação incompleta. Revise manualmente os caminhos indicados antes de tentar novamente.",
    };
    return `${messages[error.code]} Caminhos: ${error.paths.join(", ")}`;
  }

  const errorHasMessage = error instanceof Error;

  return errorHasMessage ? error.message : "erro inesperado.";
}
