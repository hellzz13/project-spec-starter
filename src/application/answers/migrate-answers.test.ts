import { describe, expect, it, vi } from "vitest";

import { AnswersError } from "./answers-error.js";
import { migrateAnswers, type AnswersMigration } from "./migrate-answers.js";

describe("migrateAnswers", () => {
  it("preserves input already using the current schema", () => {
    const migrate = vi.fn<AnswersMigration["migrate"]>();
    const input = { schemaVersion: 1 };

    expect(
      migrateAnswers(input, [{ fromVersion: 1, toVersion: 2, migrate }]),
    ).toBe(input);
    expect(migrate).not.toHaveBeenCalled();
  });

  it("applies an injected migration without mutating its input", () => {
    const input = { schemaVersion: 0, projectName: "Example" };
    const migration: AnswersMigration = {
      fromVersion: 0,
      toVersion: 1,
      migrate: (migrationInput) => ({
        ...requireRecord(migrationInput),
        schemaVersion: 1,
      }),
    };

    expect(migrateAnswers(input, [migration])).toEqual({
      schemaVersion: 1,
      projectName: "Example",
    });
    expect(input).toEqual({ schemaVersion: 0, projectName: "Example" });
  });

  it.each([
    { input: { schemaVersion: 0 }, migrations: [] },
    {
      input: { schemaVersion: 0 },
      migrations: [
        {
          fromVersion: 0,
          toVersion: 1,
          migrate: () => ({ schemaVersion: 0 }),
        },
      ],
    },
    {
      input: { schemaVersion: 2 },
      migrations: [
        {
          fromVersion: 2,
          toVersion: 3,
          migrate: () => ({ schemaVersion: 3 }),
        },
      ],
    },
  ])(
    "rejects a schema without a valid path: $input",
    ({ input, migrations }) => {
      expect(() => migrateAnswers(input, migrations)).toThrowError(
        expect.objectContaining<Partial<AnswersError>>({
          code: "UNSUPPORTED_SCHEMA",
          path: "schemaVersion",
        }),
      );
    },
  );
});

function requireRecord(input: unknown): Record<string, unknown> {
  const isInvalidRecord = !isRecord(input);

  if (isInvalidRecord) {
    throw new Error("Synthetic migration expected a record.");
  }

  return input;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}
