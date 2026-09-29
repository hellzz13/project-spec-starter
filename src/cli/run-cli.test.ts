import { describe, expect, it, vi } from "vitest";

import { formatHelp } from "./help.ts";
import { runCli } from "./run-cli.ts";

function createOutput() {
  return {
    error: vi.fn<(message: string) => void>(),
    log: vi.fn<(message: string) => void>(),
  };
}

describe("runCli", () => {
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

  it("runs the init command and presents its document preview", async () => {
    const output = createOutput();
    const initialize = vi.fn().mockResolvedValue({
      documents: [
        { id: "project", output: "PROJECT.md", content: "# Billing API" },
        {
          id: "engineering",
          output: "docs/ENGINEERING.md",
          content: "# Engineering",
        },
      ],
    });

    await expect(
      runCli(["init"], { initialize, output, version: "1.2.3" }),
    ).resolves.toBe(0);
    expect(initialize).toHaveBeenCalledOnce();
    expect(output.log.mock.calls).toEqual([
      ["\nPreview da geração (nenhum arquivo foi escrito):"],
      ["  PROJECT.md"],
      ["  docs/ENGINEERING.md"],
      ["\n2 documentos prontos para a etapa de escrita segura."],
    ]);
    expect(output.error).not.toHaveBeenCalled();
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
