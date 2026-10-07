import type { ProfileResourceReader } from "../../ports/profile-resource-reader.ts";

export class LayeredProfileResourceReader implements ProfileResourceReader {
  constructor(private readonly readers: readonly ProfileResourceReader[]) {}

  async readText(path: string): Promise<string> {
    for (const reader of this.readers) {
      try {
        return await reader.readText(path);
      } catch (error) {
        const resourceIsMissing =
          error instanceof Error && "code" in error && error.code === "ENOENT";

        if (!resourceIsMissing) {
          throw error;
        }
      }
    }

    throw new Error(`Profile resource not found: ${path}`);
  }
}
