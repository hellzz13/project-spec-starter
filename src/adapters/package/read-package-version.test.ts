import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { readPackageVersion } from "./read-package-version.ts";

describe("readPackageVersion", () => {
  it("reads the CLI version from package metadata", async () => {
    const root = await mkdtemp(join(tmpdir(), "package-version-"));

    try {
      await writeFile(join(root, "package.json"), '{"version":"0.1.0"}');

      await expect(readPackageVersion(pathToFileURL(`${root}/`))).resolves.toBe(
        "0.1.0",
      );
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it("rejects package metadata without a version", async () => {
    const root = await mkdtemp(join(tmpdir(), "package-version-"));

    try {
      await writeFile(join(root, "package.json"), "{}");

      await expect(
        readPackageVersion(pathToFileURL(`${root}/`)),
      ).rejects.toThrow("A versão do pacote é inválida.");
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
