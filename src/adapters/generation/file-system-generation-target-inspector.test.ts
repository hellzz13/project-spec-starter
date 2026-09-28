import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  FileSystemGenerationTargetInspector,
  GenerationTargetErrorCodes,
} from "./file-system-generation-target-inspector.ts";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe("FileSystemGenerationTargetInspector", () => {
  it("reports available and conflicting outputs in input order", async () => {
    const rootPath = await createTemporaryDirectory();
    await mkdir(join(rootPath, "docs"));
    await writeFile(join(rootPath, "PROJECT.md"), "existing", "utf8");
    const inspector = new FileSystemGenerationTargetInspector(rootPath);

    await expect(
      inspector.inspect(["PROJECT.md", "docs/ENGINEERING.md"]),
    ).resolves.toEqual([
      { exists: true, output: "PROJECT.md" },
      { exists: false, output: "docs/ENGINEERING.md" },
    ]);
  });

  it.each(["../outside.md", "/tmp/outside.md", "docs/../../outside.md"])(
    "rejects an output outside the project: %s",
    async (output) => {
      const rootPath = await createTemporaryDirectory();
      const inspector = new FileSystemGenerationTargetInspector(rootPath);

      await expect(inspector.inspect([output])).rejects.toMatchObject({
        code: GenerationTargetErrorCodes.UNSAFE_PATH,
        output,
      });
    },
  );

  it("rejects an output whose existing ancestor is a symbolic link", async () => {
    const rootPath = await createTemporaryDirectory();
    const outsidePath = await createTemporaryDirectory();
    await symlink(outsidePath, join(rootPath, "docs"));
    const inspector = new FileSystemGenerationTargetInspector(rootPath);

    await expect(
      inspector.inspect(["docs/ENGINEERING.md"]),
    ).rejects.toMatchObject({
      code: GenerationTargetErrorCodes.UNSAFE_PATH,
      output: "docs/ENGINEERING.md",
    });
  });
});

async function createTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "project-spec-starter-"));
  temporaryDirectories.push(directory);

  return directory;
}
