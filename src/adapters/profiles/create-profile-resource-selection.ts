import { stat } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import type { ProfileResourceReader } from "../../ports/profile-resource-reader.ts";
import { FileSystemProfileResourceReader } from "./file-system-profile-resource-reader.ts";
import { LayeredProfileResourceReader } from "./layered-profile-resource-reader.ts";

const DEFAULT_MANIFEST_PATH = "profiles/default/profile.json";

export interface ProfileResourceSelection {
  readonly manifestPath: string;
  readonly reader: ProfileResourceReader;
}

export async function createProfileResourceSelection(options: {
  readonly packageRootUrl: URL;
  readonly profilePath: string | undefined;
  readonly overridesPath: string | undefined;
}): Promise<ProfileResourceSelection> {
  const { packageRootUrl, profilePath, overridesPath } = options;
  const readers: ProfileResourceReader[] = [];

  if (overridesPath !== undefined) {
    const rootPath = resolve(overridesPath);
    const rootStat = await stat(rootPath);
    const rootIsNotDirectory = !rootStat.isDirectory();

    if (rootIsNotDirectory) {
      throw new Error(
        `O caminho de sobrescritas não é uma pasta: ${overridesPath}`,
      );
    }

    readers.push(
      new FileSystemProfileResourceReader(pathToFileURL(`${rootPath}/`)),
    );
  }

  let manifestPath = DEFAULT_MANIFEST_PATH;

  if (profilePath !== undefined) {
    const absoluteProfilePath = resolve(profilePath);
    const profileStat = await stat(absoluteProfilePath);
    const profileIsNotFile = !profileStat.isFile();

    if (profileIsNotFile) {
      throw new Error(`O perfil não é um arquivo: ${profilePath}`);
    }

    const profileRoot = dirname(absoluteProfilePath);
    const selectedReader = new FileSystemProfileResourceReader(
      pathToFileURL(`${profileRoot}/`),
    );
    manifestPath = basename(absoluteProfilePath);
    await selectedReader.readText(manifestPath);
    readers.push(selectedReader);
  }

  readers.push(new FileSystemProfileResourceReader(packageRootUrl));

  return {
    manifestPath,
    reader: new LayeredProfileResourceReader(readers),
  };
}
