import { confirm } from "@inquirer/prompts";

type ConfirmationPrompt = (options: {
  readonly message: string;
  readonly default: boolean;
}) => Promise<boolean>;

export async function confirmGeneration(options: {
  readonly count: number;
  readonly destination: string;
  readonly prompt?: ConfirmationPrompt;
}): Promise<boolean> {
  const prompt = options.prompt ?? confirm;

  try {
    return await prompt({
      message: `Criar ${options.count} documentos em ${options.destination} conforme o plano apresentado?`,
      default: false,
    });
  } catch (error) {
    const promptWasCancelled =
      error instanceof Error && error.name === "ExitPromptError";

    if (promptWasCancelled) {
      throw new Error("Geração cancelada. Nenhum arquivo foi escrito.", {
        cause: error,
      });
    }

    throw error;
  }
}
