export type Decision<T> =
  | { readonly state: "defined"; readonly value: T }
  | { readonly state: "pending" }
  | { readonly state: "not-applicable" };
