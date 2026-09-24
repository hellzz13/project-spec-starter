import {
  PROFILE_SCHEMA_VERSION,
  type Profile,
  type ProfileDocument,
  type ProfileEngineeringStandard,
} from "../../domain/profile.js";
import { ProfileError, ProfileErrorCodes } from "./profile-error.js";
import { parseProfileCondition } from "./parse-profile-condition.js";

export { ProfileError } from "./profile-error.js";

export function parseProfile(input: unknown): Profile {
  const profile = requireRecord(input, "profile");
  const schemaVersion = profile.schemaVersion;
  const isIntegerSchemaVersion =
    typeof schemaVersion === "number" && Number.isInteger(schemaVersion);
  const hasUnsupportedSchemaVersion =
    isIntegerSchemaVersion && schemaVersion !== PROFILE_SCHEMA_VERSION;

  if (hasUnsupportedSchemaVersion) {
    throw new ProfileError({
      code: ProfileErrorCodes.UNSUPPORTED_PROFILE_SCHEMA,
      path: "schemaVersion",
      message: `Unsupported profile schema version: ${String(schemaVersion)}`,
    });
  }

  const isInvalidSchemaVersion = schemaVersion !== PROFILE_SCHEMA_VERSION;

  if (isInvalidSchemaVersion) {
    invalid("schemaVersion", "Expected the current schema version.");
  }

  const questionModules = requireArray(
    profile.questionModules,
    "questionModules",
  ).map((modulePath, index) =>
    requireSafeRelativePath(modulePath, `questionModules[${index}]`),
  );
  const documents = requireArray(profile.documents, "documents").map(
    (document, index) => parseDocument(document, `documents[${index}]`),
  );
  const customizable = requireArray(profile.customizable, "customizable").map(
    (settingPath, index) =>
      requireNonEmptyString(settingPath, `customizable[${index}]`),
  );

  assertUnique(questionModules, "questionModules");
  assertUnique(customizable, "customizable");
  assertUnique(
    documents.map((document) => document.id),
    "documents.id",
  );
  assertUnique(
    documents.map((document) => document.output),
    "documents.output",
  );

  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    id: requireNonEmptyString(profile.id, "id"),
    version: requirePositiveInteger(profile.version, "version"),
    defaults: requireRecord(profile.defaults, "defaults"),
    customizable,
    engineeringStandards: parseEngineeringStandards(
      profile.engineeringStandards,
      "engineeringStandards",
    ),
    questionModules,
    documents,
  };
}

function parseDocument(input: unknown, path: string): ProfileDocument {
  const document = requireRecord(input, path);
  const conditionIsPresent = Object.hasOwn(document, "condition");
  const parsedDocument = {
    id: requireNonEmptyString(document.id, `${path}.id`),
    output: requireSafeRelativePath(document.output, `${path}.output`),
    template: requireSafeRelativePath(document.template, `${path}.template`),
  };

  if (conditionIsPresent) {
    return {
      ...parsedDocument,
      condition: parseProfileCondition({
        input: document.condition,
        invalid,
        path: `${path}.condition`,
      }),
    };
  }

  return parsedDocument;
}

function parseEngineeringStandards(
  input: unknown,
  path: string,
): Readonly<Record<string, ProfileEngineeringStandard>> {
  const standards = requireRecord(input, path);
  const entries = Object.entries(standards).map(([id, standard]) => {
    const standardPath = `${path}.${id}`;
    const standardRecord = requireRecord(standard, standardPath);
    const templateIsPresent = Object.hasOwn(standardRecord, "template");
    const parsedStandard = {
      description: requireNonEmptyString(
        standardRecord.description,
        `${standardPath}.description`,
      ),
    };

    if (templateIsPresent) {
      return [
        id,
        {
          ...parsedStandard,
          template: requireSafeRelativePath(
            standardRecord.template,
            `${standardPath}.template`,
          ),
        },
      ] as const;
    }

    return [id, parsedStandard] as const;
  });

  return Object.fromEntries(entries);
}

function requireRecord(input: unknown, path: string): Record<string, unknown> {
  const isInvalidRecord = !isRecord(input);

  if (isInvalidRecord) {
    invalid(path, "Expected an object.");
  }

  return input;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function requireArray(input: unknown, path: string): unknown[] {
  const isInvalidArray = !Array.isArray(input);

  if (isInvalidArray) {
    invalid(path, "Expected a list.");
  }

  return input;
}

function requireNonEmptyString(input: unknown, path: string): string {
  const isInvalidString =
    typeof input !== "string" || input.trim().length === 0;

  if (isInvalidString) {
    invalid(path, "Expected a non-empty string.");
  }

  return input.trim();
}

function requirePositiveInteger(input: unknown, path: string): number {
  const isInvalidPositiveInteger =
    typeof input !== "number" || !Number.isInteger(input) || input <= 0;

  if (isInvalidPositiveInteger) {
    invalid(path, "Expected a positive integer.");
  }

  return input;
}

function requireSafeRelativePath(input: unknown, path: string): string {
  const value = requireNonEmptyString(input, path);
  const usesBackslash = value.includes("\\");
  const startsFromRoot = value.startsWith("/");
  const hasWindowsDrivePrefix = /^[A-Za-z]:/u.test(value);
  const escapesParent = value.split("/").some((segment) => {
    const isParentSegment = segment === "..";

    return isParentSegment;
  });
  const isUnsafePath =
    usesBackslash || startsFromRoot || hasWindowsDrivePrefix || escapesParent;

  if (isUnsafePath) {
    invalid(path, "Expected a safe relative path.");
  }

  return value;
}

function assertUnique(values: readonly string[], path: string): void {
  const uniqueValues = new Set(values);
  const hasDuplicateValues = uniqueValues.size !== values.length;

  if (hasDuplicateValues) {
    invalid(path, "Expected unique values.");
  }
}

function invalid(path: string, message: string): never {
  throw new ProfileError({
    code: ProfileErrorCodes.INVALID_PROFILE,
    path,
    message: `${path}: ${message}`,
  });
}
