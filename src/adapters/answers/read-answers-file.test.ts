import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { readAnswersFile } from "./read-answers-file.ts";

describe("readAnswersFile", () => {
  it("reads a JSON object without changing its values", async () => {
    const directory = await mkdtemp(join(tmpdir(), "project-spec-answers-"));

    try {
      const path = join(directory, "answers.json");
      await writeFile(path, '{"schemaVersion":1,"project":{"name":"Demo"}}');

      await expect(readAnswersFile(path)).resolves.toEqual({
        schemaVersion: 1,
        project: { name: "Demo" },
      });
    } finally {
      await rm(directory, { recursive: true });
    }
  });

  it("rejects malformed JSON without exposing its contents", async () => {
    const directory = await mkdtemp(join(tmpdir(), "project-spec-answers-"));

    try {
      const path = join(directory, "answers.json");
      await writeFile(path, '{"secret":"private-value",');

      await expect(readAnswersFile(path)).rejects.toThrow(
        "Arquivo de respostas não contém JSON válido.",
      );
    } finally {
      await rm(directory, { recursive: true });
    }
  });

  it("rejects arrays because answers require an object", async () => {
    const directory = await mkdtemp(join(tmpdir(), "project-spec-answers-"));

    try {
      const path = join(directory, "answers.json");
      await writeFile(path, "[]");

      await expect(readAnswersFile(path)).rejects.toThrow(
        "Arquivo de respostas deve conter um objeto JSON.",
      );
    } finally {
      await rm(directory, { recursive: true });
    }
  });
});
