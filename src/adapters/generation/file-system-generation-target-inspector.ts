import { lstat } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

import type {
  GenerationTargetInspector,
  GenerationTargetState,
} from "../../ports/generation-target-inspector.ts";

export const GenerationTargetErrorCodes = {
  UNSAFE_PATH: "UNSAFE_PATH",
} as const;

export class GenerationTargetError extends Error {
  readonly code = GenerationTargetErrorCodes.UNSAFE_PATH;
  readonly output: string;

  constructor(output: string) {
    super(
      `Generation output escapes the project or crosses a symbolic link: ${output}`,
    );
    this.name = "GenerationTargetError";
    this.output = output;
  }
}

export class FileSystemGenerationTargetInspector implements GenerationTargetInspector {
  readonly #rootPath: string;

  constructor(rootPath: string) {
    this.#rootPath = resolve(rootPath);
  }

  async inspect(
    outputs: readonly string[],
  ): Promise<readonly GenerationTargetState[]> {
    const inspections: GenerationTargetState[] = [];

    for (const output of outputs) {
      inspections.push(await this.#inspectOutput(output));
    }

    return inspections;
  }

  async #inspectOutput(output: string): Promise<GenerationTargetState> {
    const targetPath = resolve(this.#rootPath, output);
    const relativePath = relative(this.#rootPath, targetPath);
    const escapesRoot =
      relativePath === ".." || relativePath.startsWith(`..${sep}`);
    const resolvesAsAbsolutePath = isAbsolute(relativePath);
    const outputIsUnsafe =
      output.length === 0 || escapesRoot || resolvesAsAbsolutePath;

    if (outputIsUnsafe) {
      throw new GenerationTargetError(output);
    }

    const pathSegments = relativePath.split(sep);
    let currentPath = this.#rootPath;

    for (const pathSegment of pathSegments) {
      currentPath = resolve(currentPath, pathSegment);
      const pathState = await readPathState(currentPath);
      const pathIsSymbolicLink = pathState?.isSymbolicLink() === true;

      if (pathIsSymbolicLink) {
        throw new GenerationTargetError(output);
      }

      const pathDoesNotExist = pathState === undefined;

      if (pathDoesNotExist) {
        return { exists: false, output };
      }
    }

    return { exists: true, output };
  }
}

async function readPathState(path: string) {
  try {
    return await lstat(path);
  } catch (error) {
    const pathDoesNotExist =
      error instanceof Error && "code" in error && error.code === "ENOENT";

    if (pathDoesNotExist) {
      return undefined;
    }

    throw error;
  }
}
