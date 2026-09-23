import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const PROJECT_ROOT = new URL("../../", import.meta.url);

async function readJsonRecord(path: string): Promise<Record<string, unknown>> {
  const contents = await readFile(new URL(path, PROJECT_ROOT), "utf8");
  const parsed: unknown = JSON.parse(contents);
  const isInvalidJsonRecord = !isRecord(parsed);

  if (isInvalidJsonRecord) {
    throw new Error(`Expected ${path} to contain a JSON object.`);
  }

  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown): Record<string, unknown> {
  const isInvalidJsonRecord = !isRecord(value);

  if (isInvalidJsonRecord) {
    throw new Error("Expected a JSON object.");
  }

  return value;
}

describe("default profile", () => {
  it("offers an editable recommended engineering standard", async () => {
    const profile = await readJsonRecord("profiles/default/profile.json");

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
    const profile = await readJsonRecord("profiles/default/profile.json");
    const defaults = requireRecord(profile.defaults);
    const runtime = requireRecord(defaults.runtime);
    const node = requireRecord(runtime.node);
    const packageJson = await readJsonRecord("package.json");
    const engines = requireRecord(packageJson.engines);
    const nvmVersion = (
      await readFile(new URL(".nvmrc", PROJECT_ROOT), "utf8")
    ).trim();

    expect(node).toEqual({
      appliesWhen: "runtime.node.enabled",
      version: nvmVersion,
      versionFile: ".nvmrc",
    });
    expect(engines.node).toBe(`>=${nvmVersion}`);
  });
});
