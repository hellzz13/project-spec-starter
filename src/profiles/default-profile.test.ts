import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { FileSystemProfileResourceReader } from "../adapters/profiles/file-system-profile-resource-reader.js";
import { loadProfile } from "../application/profiles/load-profile.js";
import { parseProfile } from "../application/profiles/parse-profile.js";
import { parseQuestionModule } from "../application/profiles/parse-question-module.js";

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

async function readText(path: string): Promise<string> {
  return readFile(new URL(path, PROJECT_ROOT), "utf8");
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
  it("loads all packaged profile resources through the filesystem adapter", async () => {
    const reader = new FileSystemProfileResourceReader(PROJECT_ROOT);
    const loadedProfile = await loadProfile({
      manifestPath: "profiles/default/profile.json",
      reader,
    });

    expect(loadedProfile.profile.id).toBe("default");
    expect(loadedProfile.questionModules).toHaveLength(3);
    expect(Object.keys(loadedProfile.templates)).toHaveLength(8);
  });

  it("offers an editable recommended engineering standard", async () => {
    const profile = parseProfile(
      await readJsonRecord("profiles/default/profile.json"),
    );

    expect(profile).toMatchObject({
      id: "default",
      schemaVersion: 1,
      defaults: {
        engineeringStandard: "recommended",
      },
    });
    expect(profile.customizable).toContain("engineeringStandard");
  });

  it("declares the replaceable project document template", async () => {
    const profile = parseProfile(
      await readJsonRecord("profiles/default/profile.json"),
    );

    expect(profile.documents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "project",
          output: "PROJECT.md",
          template: "templates/project/PROJECT_TEMPLATE.md",
        }),
      ]),
    );
    expect(profile.customizable).toContain("documents.project.template");
  });

  it("declares every initial document in deterministic order", async () => {
    const profile = parseProfile(
      await readJsonRecord("profiles/default/profile.json"),
    );

    expect(profile.documents.map((document) => document.id)).toEqual([
      "project",
      "engineering",
      "business-rules",
      "gitflow",
      "environments",
      "agents",
      "contributing",
      "bootstrap-checklist",
    ]);

    await Promise.all(
      profile.documents.map((document) => readText(document.template)),
    );
  });

  it("loads every declarative question module from the packaged profile", async () => {
    const profile = parseProfile(
      await readJsonRecord("profiles/default/profile.json"),
    );
    const modules = await Promise.all(
      profile.questionModules.map(async (modulePath) =>
        parseQuestionModule(await readJsonRecord(modulePath)),
      ),
    );

    expect(modules.map((module) => module.id)).toEqual([
      "project",
      "runtime",
      "engineering",
    ]);
  });

  it("keeps mandatory flow rules in the internal and distributed standards", async () => {
    const standards = await Promise.all([
      readText("docs/ENGINEERING.md"),
      readText("templates/project/ENGINEERING_TEMPLATE.md"),
    ]);

    for (const standard of standards) {
      expect(standard).toMatch(/condiç.+nome semântico/isu);
      expect(standard).toMatch(/Evitar `switch`/u);
      expect(standard).toMatch(/Resultados compostos recebem um nome/u);
      expect(standard).toMatch(/object literals/u);
    }
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
