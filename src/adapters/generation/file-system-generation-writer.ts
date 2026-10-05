import {
  link,
  lstat,
  mkdir,
  mkdtemp,
  rm,
  rmdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";

import { GenerationTargetStatuses } from "../../domain/generation-plan.ts";
import type { GenerationPlan } from "../../domain/generation-plan.ts";
import {
  GenerationWriteError,
  GenerationWriteErrorCodes,
} from "../../ports/generation-writer.ts";
import type { GenerationWriter } from "../../ports/generation-writer.ts";
import {
  FileSystemGenerationTargetInspector,
  GenerationTargetError,
} from "./file-system-generation-target-inspector.ts";

type FileIdentity = { readonly dev: number; readonly ino: number };
type OwnedPath = { readonly path: string; readonly identity: FileIdentity };

/**
 * Exclusive hard links prevent overwrites; reinspection limits symlink races.
 * Node's path APIs cannot eliminate hostile concurrent ancestor replacement.
 * This transaction assumes the destination directories are not mutated by an
 * untrusted concurrent process; rollback also checks ownership before deletion.
 */
export class FileSystemGenerationWriter implements GenerationWriter {
  readonly #rootPath: string;
  readonly #inspector: FileSystemGenerationTargetInspector;

  constructor(rootPath: string) {
    this.#rootPath = resolve(rootPath);
    this.#inspector = new FileSystemGenerationTargetInspector(this.#rootPath);
  }

  async write(plan: GenerationPlan): Promise<void> {
    const declaredConflicts = plan.items
      .filter(isConflictingItem)
      .map((item) => item.output);
    const hasDeclaredConflicts = declaredConflicts.length > 0;
    if (hasDeclaredConflicts) {
      throw conflictError(declaredConflicts);
    }

    const outputs = plan.items.map((item) => item.output);
    await this.#assertRootDirectory();
    await this.#assertAvailable(outputs);
    const planIsEmpty = plan.items.length === 0;
    if (planIsEmpty) {
      return;
    }

    const published: OwnedPath[] = [];
    const directories: OwnedPath[] = [];
    let stagingPath: string | undefined;
    let currentOutput = "";
    try {
      stagingPath = await mkdtemp(
        join(this.#rootPath, ".project-spec-staging-"),
      );
      const stagedFiles: OwnedPath[] = [];
      for (const [index, item] of plan.items.entries()) {
        currentOutput = item.output;
        const path = join(stagingPath, String(index));
        await writeFile(path, item.content, { flag: "wx", mode: 0o644 });
        stagedFiles.push({ path, identity: await lstat(path) });
      }

      for (const [index, item] of plan.items.entries()) {
        currentOutput = item.output;
        await this.#assertRootDirectory();
        await this.#assertAvailable([item.output]);
        const targetPath = resolve(this.#rootPath, item.output);
        await this.#createDirectories(dirname(targetPath), directories);
        await this.#assertAvailable([item.output]);
        const stagedFile = stagedFiles[index];
        const stagedFileIsMissing = stagedFile === undefined;
        if (stagedFileIsMissing) {
          throw new GenerationWriteError({
            code: GenerationWriteErrorCodes.WRITE_FAILED,
            paths: [item.output],
          });
        }
        await link(stagedFile.path, targetPath);
        published.push({ path: targetPath, identity: stagedFile.identity });
      }
      await rm(stagingPath, { recursive: true });
    } catch (error) {
      const remainingPaths = await this.#rollback({
        published,
        directories,
        stagingPath,
      });
      const rollbackIsIncomplete = remainingPaths.length > 0;
      if (rollbackIsIncomplete) {
        throw new GenerationWriteError({
          code: GenerationWriteErrorCodes.ROLLBACK_INCOMPLETE,
          paths: remainingPaths,
        });
      }
      const errorIsKnown =
        error instanceof GenerationWriteError ||
        error instanceof GenerationTargetError;
      if (errorIsKnown) {
        throw error;
      }
      const destinationWasCreated = hasErrorCode(error, "EEXIST");
      const code = destinationWasCreated
        ? GenerationWriteErrorCodes.FILE_CONFLICT
        : GenerationWriteErrorCodes.WRITE_FAILED;
      throw new GenerationWriteError({ code, paths: [currentOutput] });
    }
  }

  async #assertRootDirectory(): Promise<void> {
    const rootState = await lstat(this.#rootPath);
    const rootIsUnsafe = rootState.isSymbolicLink() || !rootState.isDirectory();
    if (rootIsUnsafe) {
      throw new GenerationTargetError(".");
    }
  }

  async #assertAvailable(outputs: readonly string[]): Promise<void> {
    const states = await this.#inspector.inspect(outputs);
    const conflicts = states
      .filter(isExistingTarget)
      .map((state) => state.output);
    const hasConflicts = conflicts.length > 0;
    if (hasConflicts) {
      throw conflictError(conflicts);
    }
  }

  async #createDirectories(
    parentPath: string,
    created: OwnedPath[],
  ): Promise<void> {
    const segments = relative(this.#rootPath, parentPath)
      .split(sep)
      .filter(Boolean);
    let currentPath = this.#rootPath;
    for (const segment of segments) {
      currentPath = join(currentPath, segment);
      try {
        await mkdir(currentPath);
        created.push({ path: currentPath, identity: await lstat(currentPath) });
      } catch (error) {
        const directoryAlreadyExists = hasErrorCode(error, "EEXIST");
        if (!directoryAlreadyExists) {
          throw error;
        }
      }
      const currentState = await lstat(currentPath);
      const directoryIsUnsafe =
        currentState.isSymbolicLink() || !currentState.isDirectory();
      if (directoryIsUnsafe) {
        throw new GenerationTargetError(relative(this.#rootPath, currentPath));
      }
    }
  }

  async #rollback(options: {
    readonly published: readonly OwnedPath[];
    readonly directories: readonly OwnedPath[];
    readonly stagingPath: string | undefined;
  }): Promise<string[]> {
    const remaining: string[] = [];
    try {
      await this.#assertRootDirectory();
    } catch {
      const ownedPaths = [...options.published, ...options.directories].map(
        (owned) => relative(this.#rootPath, owned.path),
      );
      const hasStagingPath = options.stagingPath !== undefined;
      if (hasStagingPath) {
        ownedPaths.push(relative(this.#rootPath, options.stagingPath));
      }
      return ownedPaths;
    }
    for (const owned of [...options.published].reverse()) {
      try {
        await this.#inspector.inspect([relative(this.#rootPath, owned.path)]);
        const state = await lstat(owned.path);
        const pathIsOwned = matchesIdentity(state, owned.identity);
        if (!pathIsOwned) {
          remaining.push(relative(this.#rootPath, owned.path));
          continue;
        }
        await unlink(owned.path);
      } catch (error) {
        const pathIsAlreadyAbsent = hasErrorCode(error, "ENOENT");
        if (!pathIsAlreadyAbsent) {
          remaining.push(relative(this.#rootPath, owned.path));
        }
      }
    }
    for (const owned of [...options.directories].reverse()) {
      try {
        await this.#inspector.inspect([relative(this.#rootPath, owned.path)]);
        const state = await lstat(owned.path);
        const directoryIsOwned = matchesIdentity(state, owned.identity);
        if (directoryIsOwned) {
          await rmdir(owned.path);
        }
      } catch (error) {
        const directoryIsAbsent = hasErrorCode(error, "ENOENT");
        const directoryContainsOtherFiles = hasErrorCode(error, "ENOTEMPTY");
        const directoryCanBePreserved =
          directoryIsAbsent || directoryContainsOtherFiles;
        if (!directoryCanBePreserved) {
          remaining.push(relative(this.#rootPath, owned.path));
        }
      }
    }
    const stagingExists = options.stagingPath !== undefined;
    if (stagingExists) {
      try {
        await rm(options.stagingPath, { recursive: true, force: true });
      } catch {
        remaining.push(relative(this.#rootPath, options.stagingPath));
      }
    }
    return remaining;
  }
}

function isConflictingItem(item: GenerationPlan["items"][number]): boolean {
  return item.status === GenerationTargetStatuses.CONFLICT;
}
function isExistingTarget(target: { readonly exists: boolean }): boolean {
  return target.exists;
}
function conflictError(paths: readonly string[]): GenerationWriteError {
  return new GenerationWriteError({
    code: GenerationWriteErrorCodes.FILE_CONFLICT,
    paths,
  });
}
function hasErrorCode(error: unknown, code: string): boolean {
  return error instanceof Error && "code" in error && error.code === code;
}
function matchesIdentity(
  actual: FileIdentity,
  expected: FileIdentity,
): boolean {
  return actual.dev === expected.dev && actual.ino === expected.ino;
}
