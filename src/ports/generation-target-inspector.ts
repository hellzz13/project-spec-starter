export interface GenerationTargetState {
  readonly exists: boolean;
  readonly output: string;
}

export interface GenerationTargetInspector {
  inspect(
    outputs: readonly string[],
  ): Promise<readonly GenerationTargetState[]>;
}
