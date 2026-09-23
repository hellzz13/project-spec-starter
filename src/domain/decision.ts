export const DecisionStates = {
  DEFINED: "defined",
  PENDING: "pending",
  NOT_APPLICABLE: "not-applicable",
} as const;

export type DecisionState =
  (typeof DecisionStates)[keyof typeof DecisionStates];

export type Decision<T> =
  | { readonly state: typeof DecisionStates.DEFINED; readonly value: T }
  | { readonly state: typeof DecisionStates.PENDING }
  | { readonly state: typeof DecisionStates.NOT_APPLICABLE };
