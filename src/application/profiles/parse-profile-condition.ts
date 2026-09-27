import {
  ProfileConditionOperators,
  type ProfileCondition,
} from "../../domain/profile.js";

type InvalidProfileValue = (path: string, message: string) => never;

export function parseProfileCondition(options: {
  readonly input: unknown;
  readonly invalid: InvalidProfileValue;
  readonly path: string;
}): ProfileCondition {
  const { input, invalid, path } = options;
  const condition = requireRecord({ input, invalid, path });
  const operator = condition.operator;
  const isEqualsCondition = operator === ProfileConditionOperators.EQUALS;

  if (isEqualsCondition) {
    return {
      operator: ProfileConditionOperators.EQUALS,
      path: requireNonEmptyString({
        input: condition.path,
        invalid,
        path: `${path}.path`,
      }),
      value: requireOwnProperty({
        invalid,
        path: `${path}.value`,
        property: "value",
        record: condition,
      }),
    };
  }

  const isIncludesCondition = operator === ProfileConditionOperators.INCLUDES;

  if (isIncludesCondition) {
    return {
      operator: ProfileConditionOperators.INCLUDES,
      path: requireNonEmptyString({
        input: condition.path,
        invalid,
        path: `${path}.path`,
      }),
      value: requireOwnProperty({
        invalid,
        path: `${path}.value`,
        property: "value",
        record: condition,
      }),
    };
  }

  const isAllCondition = operator === ProfileConditionOperators.ALL;

  if (isAllCondition) {
    return parseConditionGroup({
      condition,
      invalid,
      operator: ProfileConditionOperators.ALL,
      path,
    });
  }

  const isAnyCondition = operator === ProfileConditionOperators.ANY;

  if (isAnyCondition) {
    return parseConditionGroup({
      condition,
      invalid,
      operator: ProfileConditionOperators.ANY,
      path,
    });
  }

  return invalid(
    `${path}.operator`,
    "Expected a supported condition operator.",
  );
}

function parseConditionGroup(options: {
  readonly condition: Record<string, unknown>;
  readonly invalid: InvalidProfileValue;
  readonly operator:
    typeof ProfileConditionOperators.ALL | typeof ProfileConditionOperators.ANY;
  readonly path: string;
}): ProfileCondition {
  const { condition, invalid, operator, path } = options;
  const conditions = requireArray({
    input: condition.conditions,
    invalid,
    path: `${path}.conditions`,
  });
  const hasNoConditions = conditions.length === 0;

  if (hasNoConditions) {
    invalid(`${path}.conditions`, "Expected at least one condition.");
  }

  return {
    operator,
    conditions: conditions.map((nestedCondition, index) =>
      parseProfileCondition({
        input: nestedCondition,
        invalid,
        path: `${path}.conditions[${index}]`,
      }),
    ),
  };
}

function requireRecord(options: {
  readonly input: unknown;
  readonly invalid: InvalidProfileValue;
  readonly path: string;
}): Record<string, unknown> {
  const { input, invalid, path } = options;
  const isInvalidRecord = !isRecord(input);

  if (isInvalidRecord) {
    return invalid(path, "Expected an object.");
  }

  return input;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function requireArray(options: {
  readonly input: unknown;
  readonly invalid: InvalidProfileValue;
  readonly path: string;
}): unknown[] {
  const { input, invalid, path } = options;
  const isInvalidArray = !Array.isArray(input);

  if (isInvalidArray) {
    return invalid(path, "Expected a list.");
  }

  return input;
}

function requireNonEmptyString(options: {
  readonly input: unknown;
  readonly invalid: InvalidProfileValue;
  readonly path: string;
}): string {
  const { input, invalid, path } = options;
  const isInvalidString =
    typeof input !== "string" || input.trim().length === 0;

  if (isInvalidString) {
    return invalid(path, "Expected a non-empty string.");
  }

  return input.trim();
}

function requireOwnProperty(options: {
  readonly invalid: InvalidProfileValue;
  readonly path: string;
  readonly property: string;
  readonly record: Record<string, unknown>;
}): unknown {
  const { invalid, path, property, record } = options;
  const propertyIsMissing = !Object.hasOwn(record, property);

  if (propertyIsMissing) {
    invalid(path, "Expected this field to be present.");
  }

  return record[property];
}
