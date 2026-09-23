import {
  ProjectOrganizationKinds,
  ProjectNatures,
  PROJECT_SPECIFICATION_SCHEMA_VERSION,
  type ProjectNature,
  type ProjectNatureKind,
  type ProjectOrganization,
  type ProjectSpecification,
  type ProjectUnit,
} from "../../domain/project-specification.js";
import { DecisionStates, type Decision } from "../../domain/decision.js";
import { migrateAnswers, type AnswersMigration } from "./migrate-answers.js";
import { AnswersError, AnswersErrorCodes } from "./answers-error.js";

export { AnswersError } from "./answers-error.js";

export function parseAnswers(
  input: unknown,
  migrations: readonly AnswersMigration[] = [],
): ProjectSpecification {
  const root = requireRecord(input, "answers");
  const migratedInput = migrateAnswers(root, migrations);
  const migratedRoot = requireRecord(migratedInput, "answers");
  const schemaVersion = migratedRoot.schemaVersion;
  const isUnsupportedSchemaVersion =
    schemaVersion !== PROJECT_SPECIFICATION_SCHEMA_VERSION;

  if (isUnsupportedSchemaVersion) {
    throw new AnswersError({
      code: AnswersErrorCodes.UNSUPPORTED_SCHEMA,
      path: "schemaVersion",
      message: `Unsupported schema version: ${String(schemaVersion)}`,
    });
  }

  const project = requireRecord(migratedRoot.project, "project");

  return {
    schemaVersion,
    name: requireNonEmptyString(project.name, "project.name"),
    summary: parseStringDecision(project.summary, "project.summary"),
    organization: parseOrganization(
      project.organization,
      "project.organization",
    ),
    nature: parseNature(project.nature, "project.nature"),
    capabilities: parseCapabilities(
      project.capabilities,
      "project.capabilities",
    ),
    agentSupport: requireBoolean(project.agentSupport, "project.agentSupport"),
  };
}

function parseOrganization(input: unknown, path: string): ProjectOrganization {
  const organization = requireRecord(input, path);
  const isSingleApplication =
    organization.kind === ProjectOrganizationKinds.SINGLE_APP;

  if (isSingleApplication) {
    return { kind: ProjectOrganizationKinds.SINGLE_APP };
  }

  const isUnsupportedOrganization =
    organization.kind !== ProjectOrganizationKinds.MONOREPO;

  if (isUnsupportedOrganization) {
    invalid(`${path}.kind`, 'Expected "single-app" or "monorepo".');
  }

  const units = organization.units;
  const hasNoUnits = !isNonEmptyArray(units);

  if (hasNoUnits) {
    invalid(`${path}.units`, "A monorepo must contain at least one unit.");
  }

  return {
    kind: ProjectOrganizationKinds.MONOREPO,
    units: units.map((unit, index) =>
      parseUnit(unit, `${path}.units[${index}]`),
    ),
  };
}

function parseUnit(input: unknown, path: string): ProjectUnit {
  const unit = requireRecord(input, path);

  return {
    name: requireNonEmptyString(unit.name, `${path}.name`),
    path: parseStringDecision(unit.path, `${path}.path`),
    nature: parseNature(unit.nature, `${path}.nature`),
    capabilities: parseCapabilities(unit.capabilities, `${path}.capabilities`),
  };
}

function parseNature(input: unknown, path: string): ProjectNature {
  const nature = requireRecord(input, path);
  const isCustomNature = nature.kind === ProjectNatures.CUSTOM;

  if (isCustomNature) {
    return {
      kind: ProjectNatures.CUSTOM,
      description: requireNonEmptyString(
        nature.description,
        `${path}.description`,
      ),
    };
  }

  const natureKind = nature.kind;
  const isSupportedNature = isKnownNature(natureKind);

  if (isSupportedNature) {
    return { kind: natureKind };
  }

  invalid(`${path}.kind`, `Expected a known project nature or "custom".`);
}

function isKnownNature(input: unknown): input is ProjectNatureKind {
  return Object.values(ProjectNatures).some((candidate) => {
    const matchesRequestedNature = candidate === input;
    const isStandardNature = candidate !== ProjectNatures.CUSTOM;

    return matchesRequestedNature && isStandardNature;
  });
}

function parseStringDecision(input: unknown, path: string): Decision<string> {
  const decision = requireRecord(input, path);
  const isPendingDecision = decision.state === DecisionStates.PENDING;

  if (isPendingDecision) {
    return { state: DecisionStates.PENDING };
  }

  const isNotApplicableDecision =
    decision.state === DecisionStates.NOT_APPLICABLE;

  if (isNotApplicableDecision) {
    return { state: DecisionStates.NOT_APPLICABLE };
  }

  const isDefinedDecision = decision.state === DecisionStates.DEFINED;

  if (isDefinedDecision) {
    return {
      state: DecisionStates.DEFINED,
      value: requireNonEmptyString(decision.value, `${path}.value`),
    };
  }

  invalid(
    `${path}.state`,
    'Expected "defined", "pending" or "not-applicable".',
  );
}

function parseCapabilities(input: unknown, path: string): readonly string[] {
  const isInvalidCapabilitiesList = !Array.isArray(input);

  if (isInvalidCapabilitiesList) {
    invalid(path, "Expected a list of capabilities.");
  }

  const capabilities = input.map((capability, index) =>
    requireNonEmptyString(capability, `${path}[${index}]`),
  );

  return [...new Set(capabilities)];
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

function isNonEmptyArray(input: unknown): input is unknown[] {
  return Array.isArray(input) && input.length > 0;
}

function requireNonEmptyString(input: unknown, path: string): string {
  const isInvalidString =
    typeof input !== "string" || input.trim().length === 0;

  if (isInvalidString) {
    invalid(path, "Expected a non-empty string.");
  }

  return input.trim();
}

function requireBoolean(input: unknown, path: string): boolean {
  const isInvalidBoolean = typeof input !== "boolean";

  if (isInvalidBoolean) {
    invalid(path, "Expected a boolean.");
  }

  return input;
}

function invalid(path: string, message: string): never {
  throw new AnswersError({
    code: AnswersErrorCodes.INVALID_ANSWERS,
    path,
    message: `${path}: ${message}`,
  });
}
