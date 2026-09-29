import { describe, expect, it, vi } from "vitest";

import { GenerationTargetStatuses } from "../domain/generation-plan.ts";
import { DecisionStates } from "../domain/decision.ts";
import {
  ProjectNatures,
  ProjectOrganizationKinds,
  PROJECT_SPECIFICATION_SCHEMA_VERSION,
} from "../domain/project-specification.ts";
import { formatHelp } from "./help.ts";
import { runCli } from "./run-cli.ts";
import {
  GenerationWriteError,
  GenerationWriteErrorCodes,
} from "../ports/generation-writer.ts";

function createOutput() {
  return {
    error: vi.fn<(message: string) => void>(),
    log: vi.fn<(message: string) => void>(),
  };
}

describe("runCli", () => {
  const specification = {
    schemaVersion: PROJECT_SPECIFICATION_SCHEMA_VERSION,
    name: "Example",
    summary: { state: DecisionStates.PENDING },
    organization: { kind: ProjectOrganizationKinds.SINGLE_APP },
    nature: { kind: ProjectNatures.BACKEND },
    capabilities: [],
    agentSupport: true,
  } as const;
  const plan = {
    items: [
      {
        id: "project",
        output: "PROJECT.md",
        content: "# Example",
        status: GenerationTargetStatuses.AVAILABLE,
      },
    ],
    summary: { total: 1, available: 1, conflict: 0 },
  } as const;

  it("writes the reviewed plan only after confirmation", async () => {
    const output = createOutput();
    const confirmGeneration = vi.fn().mockResolvedValue(true);
    const writeGeneration = vi.fn().mockResolvedValue(undefined);
    await expect(
      runCli(["init"], {
        initialize: () => Promise.resolve({ plan, specification }),
        confirmGeneration,
        writeGeneration,
        output,
        version: "0",
      }),
    ).resolves.toBe(0);
    expect(confirmGeneration).toHaveBeenCalledWith(plan);
    expect(writeGeneration).toHaveBeenCalledWith(plan);
    expect(output.log).toHaveBeenCalledWith(
      "Geração concluída: 1 documentos criados.",
    );
  });

  it("cancels without writing when confirmation is declined", async () => {
    const output = createOutput();
    const writeGeneration = vi.fn();
    await expect(
      runCli(["init"], {
        initialize: () => Promise.resolve({ plan, specification }),
        confirmGeneration: () => Promise.resolve(false),
        writeGeneration,
        output,
        version: "0",
      }),
    ).resolves.toBe(0);
    expect(writeGeneration).not.toHaveBeenCalled();
    expect(output.log).toHaveBeenCalledWith(
      "Geração cancelada. Nenhum arquivo foi escrito.",
    );
  });

  it("blocks conflicts before confirmation and writing", async () => {
    const output = createOutput();
    const confirmGeneration = vi.fn();
    const writeGeneration = vi.fn();
    const conflictingPlan = {
      ...plan,
      items: [{ ...plan.items[0], status: GenerationTargetStatuses.CONFLICT }],
      summary: { total: 1, available: 0, conflict: 1 },
    };
    await expect(
      runCli(["init"], {
        initialize: () =>
          Promise.resolve({ plan: conflictingPlan, specification }),
        confirmGeneration,
        writeGeneration,
        output,
        version: "0",
      }),
    ).resolves.toBe(1);
    expect(confirmGeneration).not.toHaveBeenCalled();
    expect(writeGeneration).not.toHaveBeenCalled();
  });

  it("does not confirm or write during dry-run", async () => {
    const output = createOutput();
    const confirmGeneration = vi.fn();
    const writeGeneration = vi.fn();
    await runCli(["init", "--dry-run"], {
      initialize: () => Promise.resolve({ plan, specification }),
      confirmGeneration,
      writeGeneration,
      output,
      version: "0",
    });
    expect(confirmGeneration).not.toHaveBeenCalled();
    expect(writeGeneration).not.toHaveBeenCalled();
  });

  it("reports write failures without claiming success", async () => {
    const output = createOutput();
    await expect(
      runCli(["init"], {
        initialize: () => Promise.resolve({ plan, specification }),
        confirmGeneration: () => Promise.resolve(true),
        writeGeneration: () => Promise.reject(new Error("Falha recuperada.")),
        output,
        version: "0",
      }),
    ).resolves.toBe(1);
    expect(output.error).toHaveBeenCalledWith(
      "Não foi possível gerar os documentos: Falha recuperada.",
    );
    expect(output.log).not.toHaveBeenCalledWith(
      "Geração concluída: 1 documentos criados.",
    );
  });

  it("does not write when the confirmation prompt is interrupted", async () => {
    const output = createOutput();
    const writeGeneration = vi.fn();
    await expect(
      runCli(["init"], {
        initialize: () => Promise.resolve({ plan, specification }),
        confirmGeneration: () =>
          Promise.reject(new Error("Geração cancelada.")),
        writeGeneration,
        output,
        version: "0",
      }),
    ).resolves.toBe(1);
    expect(writeGeneration).not.toHaveBeenCalled();
  });

  it("identifies paths requiring manual recovery", async () => {
    const output = createOutput();
    await runCli(["init"], {
      initialize: () => Promise.resolve({ plan, specification }),
      confirmGeneration: () => Promise.resolve(true),
      writeGeneration: () =>
        Promise.reject(
          new GenerationWriteError({
            code: GenerationWriteErrorCodes.ROLLBACK_INCOMPLETE,
            paths: ["PROJECT.md"],
          }),
        ),
      output,
      version: "0",
    });
    expect(output.error).toHaveBeenCalledWith(
      "Não foi possível gerar os documentos: Recuperação incompleta. Revise manualmente os caminhos indicados antes de tentar novamente. Caminhos: PROJECT.md",
    );
  });

  it("fails safely when no writer is configured", async () => {
    const output = createOutput();
    await expect(
      runCli(["init"], {
        initialize: () => Promise.resolve({ plan, specification }),
        output,
        version: "0",
      }),
    ).resolves.toBe(1);
    expect(output.error).toHaveBeenCalledWith(
      "A escrita não está disponível neste build. Use --dry-run.",
    );
  });
  it.each([[[]], [["--help"]], [["-h"]]])(
    "prints help for arguments %j",
    async (arguments_) => {
      const output = createOutput();

      await expect(
        runCli(arguments_, { output, version: "1.2.3" }),
      ).resolves.toBe(0);
      expect(output.log).toHaveBeenCalledWith(formatHelp());
      expect(output.error).not.toHaveBeenCalled();
    },
  );

  it.each([[["--version"]], [["-v"]]])(
    "prints the installed version for arguments %j",
    async (arguments_) => {
      const output = createOutput();

      await expect(
        runCli(arguments_, { output, version: "1.2.3" }),
      ).resolves.toBe(0);
      expect(output.log).toHaveBeenCalledWith("1.2.3");
      expect(output.error).not.toHaveBeenCalled();
    },
  );

  it("runs init in dry-run mode and presents the answers and generation plan", async () => {
    const output = createOutput();
    const initialize = vi.fn().mockResolvedValue({
      plan: {
        items: [
          {
            id: "project",
            output: "PROJECT.md",
            content: "# Billing API",
            status: GenerationTargetStatuses.CONFLICT,
          },
          {
            id: "engineering",
            output: "docs/ENGINEERING.md",
            content: "# Engineering",
            status: GenerationTargetStatuses.AVAILABLE,
          },
        ],
        summary: { total: 2, available: 1, conflict: 1 },
      },
      specification: {
        schemaVersion: PROJECT_SPECIFICATION_SCHEMA_VERSION,
        name: "Billing API",
        summary: { state: DecisionStates.PENDING },
        organization: { kind: ProjectOrganizationKinds.SINGLE_APP },
        nature: { kind: ProjectNatures.BACKEND },
        capabilities: ["http-api"],
        agentSupport: true,
      },
    });

    await expect(
      runCli(["init", "--dry-run"], {
        initialize,
        output,
        version: "1.2.3",
      }),
    ).resolves.toBe(0);
    expect(initialize).toHaveBeenCalledOnce();
    expect(output.log.mock.calls).toEqual([
      ["\nRevise as respostas principais:"],
      ["  Projeto: Billing API"],
      ["  Organização: single-app"],
      ["  Natureza: backend"],
      ["  Capacidades: http-api"],
      ["  Suporte a agentes: sim"],
      ["\nPlano de geração (nenhum arquivo foi escrito):"],
      ["  [conflito] PROJECT.md"],
      ["  [novo] docs/ENGINEERING.md"],
      ["\n2 documentos: 1 novos, 1 conflitos."],
    ]);
    expect(output.error).not.toHaveBeenCalled();
  });

  it("rejects unsupported init options before starting the interview", async () => {
    const output = createOutput();
    const initialize = vi.fn();

    await expect(
      runCli(["init", "--force"], {
        initialize,
        output,
        version: "1.2.3",
      }),
    ).resolves.toBe(1);
    expect(initialize).not.toHaveBeenCalled();
    expect(output.error).toHaveBeenCalledWith(
      "Unknown option for init: --force",
    );
  });

  it("reports an initialization failure without exposing a stack trace", async () => {
    const output = createOutput();
    const initialize = vi.fn().mockRejectedValue(
      Object.assign(new Error("Entrevista cancelada."), {
        code: "INTERVIEW_CANCELLED",
      }),
    );

    await expect(
      runCli(["init"], { initialize, output, version: "1.2.3" }),
    ).resolves.toBe(1);
    expect(output.error).toHaveBeenCalledWith(
      "Não foi possível iniciar o projeto: Entrevista cancelada.",
    );
    expect(output.log).not.toHaveBeenCalled();
  });

  it("returns an error for an unknown command", async () => {
    const output = createOutput();

    await expect(
      runCli(["unknown"], { output, version: "1.2.3" }),
    ).resolves.toBe(1);
    expect(output.log).not.toHaveBeenCalled();
    expect(output.error.mock.calls).toEqual([
      ["Unknown command: unknown"],
      ["Run project-spec-starter --help to see the available commands."],
    ]);
  });
});
