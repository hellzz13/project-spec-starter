import { describe, expect, it, vi } from "vitest";
import { confirmGeneration } from "./confirm-generation.ts";

describe("confirmGeneration", () => {
  it("identifies the destination and file count with a safe default", async () => {
    const prompt = vi.fn().mockResolvedValue(true);
    await expect(
      confirmGeneration({ count: 3, destination: "/project", prompt }),
    ).resolves.toBe(true);
    expect(prompt).toHaveBeenCalledWith({
      message: "Criar 3 documentos em /project conforme o plano apresentado?",
      default: false,
    });
  });

  it("translates terminal cancellation before writing", async () => {
    const prompt = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error("exit"), { name: "ExitPromptError" }),
      );
    await expect(
      confirmGeneration({ count: 3, destination: "/project", prompt }),
    ).rejects.toThrow("Geração cancelada. Nenhum arquivo foi escrito.");
  });
});
