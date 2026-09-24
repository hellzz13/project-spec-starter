import { readFile, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { ProfileResourceReader } from "../../ports/profile-resource-reader.js";

export const ProfileResourceErrorCodes = {
  UNSAFE_PROFILE_RESOURCE_PATH: "UNSAFE_PROFILE_RESOURCE_PATH",
} as const;

export class ProfileResourceError extends Error {
  readonly code = ProfileResourceErrorCodes.UNSAFE_PROFILE_RESOURCE_PATH;
  readonly path: string;

  constructor(path: string) {
    super(`Profile resource path escapes its root: ${path}`);
    this.name = "ProfileResourceError";
    this.path = path;
  }
}

export class FileSystemProfileResourceReader implements ProfileResourceReader {
  readonly #rootPath: string;

  constructor(rootUrl: URL) {
    this.#rootPath = fileURLToPath(rootUrl);
  }

  async readText(path: string): Promise<string> {
    const resourcePath = resolve(this.#rootPath, path);
    assertPathWithinRoot({
      originalPath: path,
      resourcePath,
      rootPath: this.#rootPath,
    });

    const [realRootPath, realResourcePath] = await Promise.all([
      realpath(this.#rootPath),
      realpath(resourcePath),
    ]);
    assertPathWithinRoot({
      originalPath: path,
      resourcePath: realResourcePath,
      rootPath: realRootPath,
    });

    return readFile(realResourcePath, "utf8");
  }
}

function assertPathWithinRoot(options: {
  readonly originalPath: string;
  readonly resourcePath: string;
  readonly rootPath: string;
}): void {
  const { originalPath, resourcePath, rootPath } = options;
  const relativePath = relative(rootPath, resourcePath);
  const escapesRoot = relativePath.startsWith("..");
  const resolvesAsAbsolutePath = isAbsolute(relativePath);
  const isUnsafePath = escapesRoot || resolvesAsAbsolutePath;

  if (isUnsafePath) {
    throw new ProfileResourceError(originalPath);
  }
}
