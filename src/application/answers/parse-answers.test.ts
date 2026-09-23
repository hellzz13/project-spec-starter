import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { AnswersError, parseAnswers } from "./parse-answers.js";

describe("parseAnswers", () => {
  it("normalizes valid answers for a single application", () => {
    const specification = parseAnswers({
      schemaVersion: 1,
      project: {
        name: "Billing API",
        summary: { state: "pending" },
        organization: { kind: "single-app" },
        nature: { kind: "backend" },
        capabilities: ["http-api", "scheduled-jobs", "http-api"],
        agentSupport: true,
      },
    });

    expect(specification).toEqual({
      schemaVersion: 1,
      name: "Billing API",
      summary: { state: "pending" },
      organization: { kind: "single-app" },
      nature: { kind: "backend" },
      capabilities: ["http-api", "scheduled-jobs"],
      agentSupport: true,
    });
  });

  it("accepts a heterogeneous monorepo and a custom project nature", () => {
    const specification = parseAnswers({
      schemaVersion: 1,
      project: {
        name: "Commerce Platform",
        summary: {
          state: "defined",
          value: "Tools for operating a commerce business.",
        },
        organization: {
          kind: "monorepo",
          units: [
            {
              name: "Storefront",
              path: { state: "defined", value: "apps/storefront" },
              nature: { kind: "frontend" },
              capabilities: ["web-ui"],
            },
            {
              name: "Import pipeline",
              path: { state: "pending" },
              nature: {
                kind: "custom",
                description: "Batch data processing pipeline",
              },
              capabilities: ["scheduled-jobs"],
            },
          ],
        },
        nature: { kind: "full-stack" },
        capabilities: ["web-ui", "http-api"],
        agentSupport: false,
      },
    });

    expect(specification.organization).toEqual({
      kind: "monorepo",
      units: [
        {
          name: "Storefront",
          path: { state: "defined", value: "apps/storefront" },
          nature: { kind: "frontend" },
          capabilities: ["web-ui"],
        },
        {
          name: "Import pipeline",
          path: { state: "pending" },
          nature: {
            kind: "custom",
            description: "Batch data processing pipeline",
          },
          capabilities: ["scheduled-jobs"],
        },
      ],
    });
  });

  it.each([
    {
      label: "an empty project name",
      answers: {
        schemaVersion: 1,
        project: {
          name: "  ",
          summary: { state: "pending" },
          organization: { kind: "single-app" },
          nature: { kind: "backend" },
          capabilities: [],
          agentSupport: true,
        },
      },
      path: "project.name",
    },
    {
      label: "a custom nature without a description",
      answers: {
        schemaVersion: 1,
        project: {
          name: "Example",
          summary: { state: "pending" },
          organization: { kind: "single-app" },
          nature: { kind: "custom", description: "" },
          capabilities: [],
          agentSupport: true,
        },
      },
      path: "project.nature.description",
    },
    {
      label: "a monorepo without units",
      answers: {
        schemaVersion: 1,
        project: {
          name: "Example",
          summary: { state: "pending" },
          organization: { kind: "monorepo", units: [] },
          nature: { kind: "full-stack" },
          capabilities: [],
          agentSupport: true,
        },
      },
      path: "project.organization.units",
    },
  ])("rejects $label", ({ answers, path }) => {
    expect(() => parseAnswers(answers)).toThrowError(
      expect.objectContaining<Partial<AnswersError>>({
        code: "INVALID_ANSWERS",
        path,
      }),
    );
  });

  it("distinguishes an unsupported schema version", () => {
    expect(() => parseAnswers({ schemaVersion: 2 })).toThrowError(
      expect.objectContaining<Partial<AnswersError>>({
        code: "UNSUPPORTED_SCHEMA",
        path: "schemaVersion",
      }),
    );
  });

  it.each(["heterogeneous-monorepo.json", "custom-type-decisions.json"])(
    "parses representative fixture %s",
    (fixtureName) => {
      const input: unknown = JSON.parse(
        readFileSync(fixturePath(fixtureName), "utf8"),
      );

      expect(() => parseAnswers(input)).not.toThrow();
    },
  );
});

function fixturePath(name: string): URL {
  return new URL(`../../../tests/fixtures/${name}`, import.meta.url);
}
