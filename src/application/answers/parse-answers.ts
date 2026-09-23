import {
  ProjectNatures,
  PROJECT_SPECIFICATION_SCHEMA_VERSION,
  type ProjectNature,
  type ProjectNatureKind,
  type ProjectOrganization,
  type ProjectSpecification,
  type ProjectUnit,
} from "../../domain/project-specification.js";
import type { Decision } from "../../domain/decision.js";

type AnswersErrorCode = "INVALID_ANSWERS" | "UNSUPPORTED_SCHEMA";

export class AnswersError extends Error {
  readonly code: AnswersErrorCode;
  readonly path: string;

  constructor(options: {
    readonly code: AnswersErrorCode;
    readonly message: string;
    readonly path: string;
  }) {
    super(options.message);
    this.name = "AnswersError";
    this.code = options.code;
    this.path = options.path;
  }
}

export function parseAnswers(input: unknown): ProjectSpecification {
  const root = requireRecord(input, "answers");
  const schemaVersion = root.schemaVersion;

  if (schemaVersion !== PROJECT_SPECIFICATION_SCHEMA_VERSION) {
    throw new AnswersError({
      code: "UNSUPPORTED_SCHEMA",
      path: "schemaVersion",
      message: `Unsupported schema version: ${String(schemaVersion)}`,
    });
  }

  const project = requireRecord(root.project, "project");

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

  if (organization.kind === "single-app") {
    return { kind: "single-app" };
  }

  if (organization.kind !== "monorepo") {
    invalid(`${path}.kind`, 'Expected "single-app" or "monorepo".');
  }

  const units = organization.units;
  if (!isNonEmptyArray(units)) {
    invalid(`${path}.units`, "A monorepo must contain at least one unit.");
  }

  return {
    kind: "monorepo",
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

  if (nature.kind === "custom") {
    return {
      kind: "custom",
      description: requireNonEmptyString(
        nature.description,
        `${path}.description`,
      ),
    };
  }

  if (isKnownNature(nature.kind)) {
    return { kind: nature.kind };
  }

  invalid(`${path}.kind`, `Expected a known project nature or "custom".`);
}

function isKnownNature(input: unknown): input is ProjectNatureKind {
  return ProjectNatures.some((candidate) => candidate === input);
}

function parseStringDecision(input: unknown, path: string): Decision<string> {
  const decision = requireRecord(input, path);

  if (decision.state === "pending") {
    return { state: "pending" };
  }

  if (decision.state === "not-applicable") {
    return { state: "not-applicable" };
  }

  if (decision.state === "defined") {
    return {
      state: "defined",
      value: requireNonEmptyString(decision.value, `${path}.value`),
    };
  }

  invalid(
    `${path}.state`,
    'Expected "defined", "pending" or "not-applicable".',
  );
}

function parseCapabilities(input: unknown, path: string): readonly string[] {
  if (!Array.isArray(input)) {
    invalid(path, "Expected a list of capabilities.");
  }

  const capabilities = input.map((capability, index) =>
    requireNonEmptyString(capability, `${path}[${index}]`),
  );

  return [...new Set(capabilities)];
}

function requireRecord(input: unknown, path: string): Record<string, unknown> {
  if (!isRecord(input)) {
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
  if (typeof input !== "boolean") {
    invalid(path, "Expected a boolean.");
  }

  return input;
}

function invalid(path: string, message: string): never {
  throw new AnswersError({
    code: "INVALID_ANSWERS",
    path,
    message: `${path}: ${message}`,
  });
}
