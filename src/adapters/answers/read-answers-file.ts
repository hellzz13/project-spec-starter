import { readFile } from "node:fs/promises";

export async function readAnswersFile(
  path: string,
): Promise<Readonly<Record<string, unknown>>> {
  const contents = await readFile(path, "utf8");
  let parsed: unknown;

  try {
    parsed = JSON.parse(contents) as unknown;
  } catch {
    throw new Error("Arquivo de respostas não contém JSON válido.");
  }

  const answersAreObject =
    typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);

  if (!answersAreObject) {
    throw new Error("Arquivo de respostas deve conter um objeto JSON.");
  }

  return parsed as Readonly<Record<string, unknown>>;
}
