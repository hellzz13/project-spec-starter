import { describe, expect, it } from "vitest";

import type { ProfileResourceReader } from "../../ports/profile-resource-reader.js";
import { loadProfile } from "./load-profile.js";
import { ProfileErrorCodes } from "./profile-error.js";

const resources = {
  "profile.json": JSON.stringify({
    schemaVersion: 1,
    id: "test",
    version: 1,
    defaults: {},
    customizable: [],
    engineeringStandards: {},
    questionModules: ["questions/core.json"],
    documents: [
      {
        id: "project",
        output: "PROJECT.md",
        template: "templates/project.md",
      },
    ],
  }),
  "questions/core.json": JSON.stringify({
    schemaVersion: 1,
    id: "core",
    version: 1,
    questions: [
      {
        type: "text",
        id: "name",
        target: "project.name",
        prompt: "Name?",
        required: true,
      },
    ],
  }),
  "templates/project.md": "# {{PROJECT_NAME}}",
} as const;

const reader: ProfileResourceReader = {
  readText(path) {
    const resource = resources[path as keyof typeof resources];
    const resourceIsMissing = resource === undefined;

    if (resourceIsMissing) {
      throw new Error(`Missing test resource: ${path}`);
    }

    return Promise.resolve(resource);
  },
};

describe("loadProfile", () => {
  it("loads the manifest, question modules and referenced templates", async () => {
    const loadedProfile = await loadProfile({
      manifestPath: "profile.json",
      reader,
    });

    expect(loadedProfile.profile.id).toBe("test");
    expect(loadedProfile.questionModules.map((module) => module.id)).toEqual([
      "core",
    ]);
    expect(loadedProfile.templates).toEqual({
      "templates/project.md": "# {{PROJECT_NAME}}",
    });
  });

  it("reports invalid JSON with the resource path", async () => {
    const invalidReader: ProfileResourceReader = {
      readText() {
        return Promise.resolve("{");
      },
    };

    await expect(
      loadProfile({ manifestPath: "broken.json", reader: invalidReader }),
    ).rejects.toMatchObject({
      code: ProfileErrorCodes.INVALID_PROFILE,
      path: "broken.json",
    });
  });
});
