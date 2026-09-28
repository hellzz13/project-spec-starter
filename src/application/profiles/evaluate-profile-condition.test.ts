import { describe, expect, it } from "vitest";

import {
  ProfileConditionOperators,
  type ProfileCondition,
} from "../../domain/profile.ts";
import { evaluateProfileCondition } from "./evaluate-profile-condition.ts";

const source = {
  project: {
    name: "Billing API",
    capabilities: ["http-api", "scheduled-jobs"],
    agentSupport: false,
  },
};

describe("evaluateProfileCondition", () => {
  it.each([
    {
      operator: "equals",
      condition: {
        operator: ProfileConditionOperators.EQUALS,
        path: "project.name",
        value: "Billing API",
      },
    },
    {
      operator: "includes",
      condition: {
        operator: ProfileConditionOperators.INCLUDES,
        path: "project.capabilities",
        value: "http-api",
      },
    },
    {
      operator: "all",
      condition: {
        operator: ProfileConditionOperators.ALL,
        conditions: [
          {
            operator: ProfileConditionOperators.EQUALS,
            path: "project.name",
            value: "Billing API",
          },
          {
            operator: ProfileConditionOperators.INCLUDES,
            path: "project.capabilities",
            value: "scheduled-jobs",
          },
        ],
      },
    },
    {
      operator: "any",
      condition: {
        operator: ProfileConditionOperators.ANY,
        conditions: [
          {
            operator: ProfileConditionOperators.EQUALS,
            path: "project.agentSupport",
            value: true,
          },
          {
            operator: ProfileConditionOperators.EQUALS,
            path: "project.name",
            value: "Billing API",
          },
        ],
      },
    },
  ] satisfies readonly {
    readonly operator: string;
    readonly condition: ProfileCondition;
  }[])("evaluates the $operator operator", ({ condition }) => {
    expect(evaluateProfileCondition({ condition, source })).toBe(true);
  });

  it("returns false when the comparison path is absent", () => {
    const condition: ProfileCondition = {
      operator: ProfileConditionOperators.EQUALS,
      path: "project.missing",
      value: "value",
    };

    expect(evaluateProfileCondition({ condition, source })).toBe(false);
  });

  it("returns false when includes targets a non-array value", () => {
    const condition: ProfileCondition = {
      operator: ProfileConditionOperators.INCLUDES,
      path: "project.name",
      value: "Billing",
    };

    expect(evaluateProfileCondition({ condition, source })).toBe(false);
  });
});
