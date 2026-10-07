import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { createProfileResourceSelection } from "./create-profile-resource-selection.ts";

describe("createProfileResourceSelection", () => {
  it("uses local overrides, then a selected profile, then bundled resources", async () => {
    const root = await mkdtemp(join(tmpdir(), "profile-selection-"));
    const packageRoot = join(root, "package");
    const selectedRoot = join(root, "selected");
    const overridesRoot = join(root, "overrides");

    try {
      await mkdir(packageRoot);
      await mkdir(selectedRoot);
      await mkdir(overridesRoot);
      await writeFile(join(packageRoot, "default.md"), "package");
      await writeFile(join(selectedRoot, "profile.json"), "{}");
      await writeFile(join(selectedRoot, "selected.md"), "selected");
      await writeFile(join(selectedRoot, "shared.md"), "selected");
      await writeFile(join(overridesRoot, "shared.md"), "override");

      const { manifestPath, reader } = await createProfileResourceSelection({
        packageRootUrl: pathToFileURL(`${packageRoot}/`),
        profilePath: join(selectedRoot, "profile.json"),
        overridesPath: overridesRoot,
      });

      expect(manifestPath).toBe("profile.json");
      await expect(reader.readText("shared.md")).resolves.toBe("override");
      await expect(reader.readText("selected.md")).resolves.toBe("selected");
      await expect(reader.readText("default.md")).resolves.toBe("package");
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it("rejects a missing selected manifest before using bundled resources", async () => {
    const root = await mkdtemp(join(tmpdir(), "profile-selection-"));

    try {
      await expect(
        createProfileResourceSelection({
          packageRootUrl: pathToFileURL(`${root}/`),
          profilePath: join(root, "missing.json"),
          overridesPath: undefined,
        }),
      ).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
