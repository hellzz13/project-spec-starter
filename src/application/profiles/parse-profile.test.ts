import { describe, expect, it } from "vitest";

import { ProfileError, ProfileErrorCodes } from "./profile-error.js";
import { parseProfile } from "./parse-profile.js";

const validProfile = {
  schemaVersion: 1,
  id: "starter",
  version: 2,
  defaults: { engineeringStandard: "recommended" },
  customizable: ["engineeringStandard"],
  engineeringStandards: {
    recommended: {
      description: "Neutral defaults",
      template: "templates/engineering.md",
    },
  },
  questionModules: [
    "profiles/questions/core.json",
    "profiles/questions/runtime.json",
  ],
  documents: [
    {
      id: "project",
      output: "PROJECT.md",
      template: "templates/project.md",
      condition: {
        operator: "all",
        conditions: [
          { operator: "equals", path: "project.kind", value: "app" },
          {
            operator: "any",
            conditions: [
              {
                operator: "includes",
                path: "project.capabilities",
                value: "web",
              },
            ],
          },
        ],
      },
    },
  ],
};

describe("parseProfile", () => {
  it("parses a versioned profile with ordered documents and nested conditions", () => {
    expect(parseProfile(validProfile)).toEqual(validProfile);
  });

  it.each([
    ["id", { ...validProfile, id: "  " }, "id"],
    ["version", { ...validProfile, version: 0 }, "version"],
    [
      "document output",
      {
        ...validProfile,
        documents: [{ ...validProfile.documents[0], output: "" }],
      },
      "documents[0].output",
    ],
    [
      "question module",
      { ...validProfile, questionModules: [""] },
      "questionModules[0]",
    ],
  ])("rejects invalid %s with a field path", (_label, profile, path) => {
    try {
      parseProfile(profile);
      throw new Error("Expected profile parsing to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(ProfileError);
      expect(error).toMatchObject({
        code: ProfileErrorCodes.INVALID_PROFILE,
        path,
      });
    }
  });

  it("reports a future schema as unsupported", () => {
    try {
      parseProfile({ ...validProfile, schemaVersion: 2 });
      throw new Error("Expected profile parsing to fail.");
    } catch (error) {
      expect(error).toMatchObject({
        code: ProfileErrorCodes.UNSUPPORTED_PROFILE_SCHEMA,
        path: "schemaVersion",
      });
    }
  });

  it("rejects a condition that omits its comparison value", () => {
    const profile = {
      ...validProfile,
      documents: [
        {
          id: "project",
          output: "PROJECT.md",
          template: "templates/project.md",
          condition: { operator: "equals", path: "project.kind" },
        },
      ],
    };

    expect(() => parseProfile(profile)).toThrow(
      expect.objectContaining({
        code: ProfileErrorCodes.INVALID_PROFILE,
        path: "documents[0].condition.value",
      }),
    );
  });

  it("rejects an empty condition group", () => {
    const profile = {
      ...validProfile,
      documents: [
        {
          ...validProfile.documents[0],
          condition: { operator: "all", conditions: [] },
        },
      ],
    };

    expect(() => parseProfile(profile)).toThrow(
      expect.objectContaining({
        code: ProfileErrorCodes.INVALID_PROFILE,
        path: "documents[0].condition.conditions",
      }),
    );
  });

  it.each([
    {
      label: "an unsafe template path",
      path: "documents[0].template",
      profile: {
        ...validProfile,
        documents: [
          { ...validProfile.documents[0], template: "../private.md" },
        ],
      },
    },
    {
      label: "duplicate document outputs",
      path: "documents.output",
      profile: {
        ...validProfile,
        documents: [
          validProfile.documents[0],
          { ...validProfile.documents[0], id: "other" },
        ],
      },
    },
    {
      label: "duplicate question modules",
      path: "questionModules",
      profile: {
        ...validProfile,
        questionModules: [
          "profiles/questions/core.json",
          "profiles/questions/core.json",
        ],
      },
    },
  ])("rejects $label", ({ path, profile }) => {
    expect(() => parseProfile(profile)).toThrow(
      expect.objectContaining({
        code: ProfileErrorCodes.INVALID_PROFILE,
        path,
      }),
    );
  });
});
