import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const PROJECT_ROOT = new URL("../../", import.meta.url);

async function readJson<T>(path: string): Promise<T> {
  const contents = await readFile(new URL(path, PROJECT_ROOT), "utf8");
  return JSON.parse(contents) as T;
}

describe("default profile", () => {
  it("offers an editable recommended engineering standard", async () => {
    const profile = await readJson<{
      customizable: string[];
      defaults: {
        engineeringStandard: string;
      };
      id: string;
      schemaVersion: number;
    }>("profiles/default/profile.json");

    expect(profile).toMatchObject({
      id: "default",
      schemaVersion: 1,
      defaults: {
        engineeringStandard: "recommended",
      },
    });
    expect(profile.customizable).toContain("engineeringStandard");
  });

  it("keeps the default Node version aligned with this project", async () => {
    const profile = await readJson<{
      defaults: {
        runtime: {
          node: {
            appliesWhen: string;
            version: string;
            versionFile: string;
          };
        };
      };
    }>("profiles/default/profile.json");
    const packageJson = await readJson<{ engines: { node: string } }>(
      "package.json",
    );
    const nvmVersion = (
      await readFile(new URL(".nvmrc", PROJECT_ROOT), "utf8")
    ).trim();

    expect(profile.defaults.runtime.node).toEqual({
      appliesWhen: "runtime.node.enabled",
      version: nvmVersion,
      versionFile: ".nvmrc",
    });
    expect(packageJson.engines.node).toBe(`>=${nvmVersion}`);
  });
});
