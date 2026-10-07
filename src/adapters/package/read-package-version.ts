import { readFile } from "node:fs/promises";

export async function readPackageVersion(packageRootUrl: URL): Promise<string> {
  const metadataText = await readFile(
    new URL("package.json", packageRootUrl),
    "utf8",
  );
  const metadata: unknown = JSON.parse(metadataText);
  const metadataIsRecord =
    typeof metadata === "object" &&
    metadata !== null &&
    !Array.isArray(metadata);
  const hasVersion = metadataIsRecord && "version" in metadata;
  const version = hasVersion ? metadata.version : undefined;
  const versionIsInvalid =
    typeof version !== "string" || version.trim().length === 0;

  if (versionIsInvalid) {
    throw new Error("A versão do pacote é inválida.");
  }

  return version;
}
