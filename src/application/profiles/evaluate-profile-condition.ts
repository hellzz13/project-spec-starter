import {
  ProfileConditionOperators,
  type ProfileCondition,
} from "../../domain/profile.js";

export function evaluateProfileCondition(options: {
  readonly condition: ProfileCondition;
  readonly source: unknown;
}): boolean {
  const { condition, source } = options;
  const isEqualsCondition =
    condition.operator === ProfileConditionOperators.EQUALS;

  if (isEqualsCondition) {
    const actualValue = resolvePath(source, condition.path);

    return Object.is(actualValue, condition.value);
  }

  const isIncludesCondition =
    condition.operator === ProfileConditionOperators.INCLUDES;

  if (isIncludesCondition) {
    const actualValue = resolvePath(source, condition.path);
    const isCollection = Array.isArray(actualValue);

    if (!isCollection) {
      return false;
    }

    const itemMatchesExpectedValue = (item: unknown): boolean =>
      Object.is(item, condition.value);

    return actualValue.some(itemMatchesExpectedValue);
  }

  const nestedConditionMatches = (nestedCondition: ProfileCondition): boolean =>
    evaluateProfileCondition({ condition: nestedCondition, source });
  const isAllCondition = condition.operator === ProfileConditionOperators.ALL;

  if (isAllCondition) {
    return condition.conditions.every(nestedConditionMatches);
  }

  return condition.conditions.some(nestedConditionMatches);
}

function resolvePath(source: unknown, path: string): unknown {
  const readPathSegment = (
    currentValue: unknown,
    pathSegment: string,
  ): unknown => {
    const canReadPathSegment = isRecord(currentValue);

    return canReadPathSegment ? currentValue[pathSegment] : undefined;
  };

  return path.split(".").reduce<unknown>(readPathSegment, source);
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
