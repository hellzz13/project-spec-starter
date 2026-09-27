import { describe, expect, it } from "vitest";

import {
  FileSystemProfileResourceReader,
  ProfileResourceErrorCodes,
} from "./file-system-profile-resource-reader.js";

describe("FileSystemProfileResourceReader", () => {
  it("rejects a resource outside the configured root", async () => {
    const reader = new FileSystemProfileResourceReader(
      new URL("../../../", import.meta.url),
    );

    await expect(reader.readText("../private.json")).rejects.toMatchObject({
      code: ProfileResourceErrorCodes.UNSAFE_PROFILE_RESOURCE_PATH,
      path: "../private.json",
    });
  });

  it("rejects a symbolic link that escapes the configured root", async () => {
    const temporaryDirectory = await mkdtemp(
      join(tmpdir(), "project-spec-profile-"),
    );
    const profileRoot = join(temporaryDirectory, "profile");
    const outsideFile = join(temporaryDirectory, "outside.json");

    try {
      await mkdir(profileRoot);
      await writeFile(outsideFile, "{}", "utf8");
      await symlink(outsideFile, join(profileRoot, "linked.json"));

      const reader = new FileSystemProfileResourceReader(
        pathToFileURL(`${profileRoot}/`),
      );

      await expect(reader.readText("linked.json")).rejects.toMatchObject({
        code: ProfileResourceErrorCodes.UNSAFE_PROFILE_RESOURCE_PATH,
        path: "linked.json",
      });
    } finally {
      await rm(temporaryDirectory, { force: true, recursive: true });
    }
  });
});
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
