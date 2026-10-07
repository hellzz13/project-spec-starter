import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { FileSystemProfileResourceReader } from "./file-system-profile-resource-reader.ts";
import { LayeredProfileResourceReader } from "./layered-profile-resource-reader.ts";

describe("LayeredProfileResourceReader", () => {
  it("uses local resources before selected and bundled resources", async () => {
    const root = await mkdtemp(join(tmpdir(), "profile-layers-"));
    const paths = ["local", "selected", "bundled"].map((name) =>
      join(root, name),
    );

    try {
      for (const path of paths) {
        await mkdir(path);
      }
      await writeFile(join(paths[0]!, "shared.md"), "local");
      await writeFile(join(paths[1]!, "shared.md"), "selected");
      await writeFile(join(paths[1]!, "selected.md"), "selected");
      await writeFile(join(paths[2]!, "shared.md"), "bundled");
      await writeFile(join(paths[2]!, "bundled.md"), "bundled");

      const reader = new LayeredProfileResourceReader(
        paths.map(
          (path) =>
            new FileSystemProfileResourceReader(pathToFileURL(`${path}/`)),
        ),
      );

      await expect(reader.readText("shared.md")).resolves.toBe("local");
      await expect(reader.readText("selected.md")).resolves.toBe("selected");
      await expect(reader.readText("bundled.md")).resolves.toBe("bundled");
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it("does not fall back when a higher priority file escapes its root", async () => {
    const root = await mkdtemp(join(tmpdir(), "profile-layers-"));
    const local = join(root, "local");
    const bundled = join(root, "bundled");

    try {
      await mkdir(local);
      await mkdir(bundled);
      await writeFile(join(root, "outside.md"), "private");
      await symlink(join(root, "outside.md"), join(local, "shared.md"));
      await writeFile(join(bundled, "shared.md"), "bundled");
      const reader = new LayeredProfileResourceReader([
        new FileSystemProfileResourceReader(pathToFileURL(`${local}/`)),
        new FileSystemProfileResourceReader(pathToFileURL(`${bundled}/`)),
      ]);

      await expect(reader.readText("shared.md")).rejects.toMatchObject({
        code: "UNSAFE_PROFILE_RESOURCE_PATH",
      });
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
