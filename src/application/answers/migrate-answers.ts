import { PROJECT_SPECIFICATION_SCHEMA_VERSION } from "../../domain/project-specification.js";
import { AnswersError } from "./answers-error.js";

export interface AnswersMigration {
  readonly fromVersion: number;
  readonly toVersion: number;
  migrate(input: unknown): unknown;
}

export function migrateAnswers(
  input: unknown,
  migrations: readonly AnswersMigration[] = [],
): unknown {
  const initialVersion = readSchemaVersion(input);
  const isCurrentSchema =
    initialVersion === PROJECT_SPECIFICATION_SCHEMA_VERSION;
  const isFutureVersion = initialVersion > PROJECT_SPECIFICATION_SCHEMA_VERSION;

  if (isCurrentSchema) {
    return input;
  }

  if (isFutureVersion) {
    unsupportedSchema(initialVersion);
  }

  let currentInput = input;
  let currentVersion = initialVersion;

  while (requiresMigration(currentVersion)) {
    const nextVersion = currentVersion + 1;
    const migration = migrations.find((candidate) => {
      const startsAtCurrentVersion = candidate.fromVersion === currentVersion;
      const advancesToNextVersion = candidate.toVersion === nextVersion;

      return startsAtCurrentVersion && advancesToNextVersion;
    });
    const isMigrationMissing = migration === undefined;

    if (isMigrationMissing) {
      unsupportedSchema(currentVersion);
    }

    currentInput = migration.migrate(currentInput);
    const migratedVersion = readSchemaVersion(currentInput);
    const hasUnexpectedTargetVersion = migratedVersion !== migration.toVersion;

    if (hasUnexpectedTargetVersion) {
      unsupportedSchema(migratedVersion);
    }

    currentVersion = migratedVersion;
  }

  return currentInput;
}

function requiresMigration(version: number): boolean {
  return version !== PROJECT_SPECIFICATION_SCHEMA_VERSION;
}

function readSchemaVersion(input: unknown): number {
  const isInvalidAnswersRecord = !isRecord(input);

  if (isInvalidAnswersRecord) {
    unsupportedSchema(undefined);
  }

  const schemaVersion = input.schemaVersion;
  const isInvalidSchemaVersion =
    typeof schemaVersion !== "number" || !Number.isInteger(schemaVersion);

  if (isInvalidSchemaVersion) {
    unsupportedSchema(schemaVersion);
  }

  return schemaVersion;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function unsupportedSchema(version: unknown): never {
  throw new AnswersError({
    code: "UNSUPPORTED_SCHEMA",
    path: "schemaVersion",
    message: `Unsupported schema version: ${String(version)}`,
  });
}
