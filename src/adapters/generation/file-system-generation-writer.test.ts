import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  GenerationTargetStatuses,
  type GenerationPlan,
} from "../../domain/generation-plan.ts";
import { GenerationWriteErrorCodes } from "../../ports/generation-writer.ts";
import { FileSystemGenerationWriter } from "./file-system-generation-writer.ts";

const failures = vi.hoisted(() => ({
  publicationCount: 0,
  failAt: 0,
  replaceFirst: false,
  lateConflict: false,
  firstTarget: "",
}));
vi.mock("node:fs/promises", async (importOriginal) => {
  const filesystem = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...filesystem,
    link: async (source: string, destination: string) => {
      failures.publicationCount += 1;
      const failureIsDue = failures.publicationCount === failures.failAt;
      if (failureIsDue) {
        const firstFileMustBeReplaced = failures.replaceFirst;
        if (firstFileMustBeReplaced) {
          await filesystem.unlink(failures.firstTarget);
          await filesystem.writeFile(
            failures.firstTarget,
            "external replacement",
          );
        }
        const lateConflictIsRequested = failures.lateConflict;
        if (lateConflictIsRequested) {
          await filesystem.writeFile(destination, "external conflict");
          await filesystem.link(source, destination);
        }
        throw new Error("injected publication failure");
      }
      await filesystem.link(source, destination);
      failures.firstTarget = destination;
    },
  };
});
const roots: string[] = [];
afterEach(async () => {
  failures.publicationCount = 0;
  failures.failAt = 0;
  failures.replaceFirst = false;
  failures.lateConflict = false;
  failures.firstTarget = "";
  await Promise.all(
    roots.map((root) => rm(root, { recursive: true, force: true })),
  );
});
async function temporaryRoot() {
  const root = await mkdtemp(join(tmpdir(), "generation-writer-"));
  roots.push(root);
  return root;
}
function plan(outputs: readonly string[]): GenerationPlan {
  return {
    items: outputs.map((output) => ({
      id: output,
      output,
      content: `content ${output}`,
      status: GenerationTargetStatuses.AVAILABLE,
    })),
    summary: { total: outputs.length, available: outputs.length, conflict: 0 },
  };
}
describe("FileSystemGenerationWriter", () => {
  it("publishes nested documents and removes staging", async () => {
    const root = await temporaryRoot();
    await new FileSystemGenerationWriter(root).write(
      plan(["PROJECT.md", "docs/ENGINEERING.md"]),
    );
    expect(await readFile(join(root, "docs/ENGINEERING.md"), "utf8")).toBe(
      "content docs/ENGINEERING.md",
    );
    expect((await readdir(root)).sort()).toEqual(["PROJECT.md", "docs"]);
  });
  it("blocks stale conflicts before writing anything", async () => {
    const root = await temporaryRoot();
    await writeFile(join(root, "existing.md"), "human");
    await expect(
      new FileSystemGenerationWriter(root).write(
        plan(["new.md", "existing.md"]),
      ),
    ).rejects.toMatchObject({ code: GenerationWriteErrorCodes.FILE_CONFLICT });
    expect(await readdir(root)).toEqual(["existing.md"]);
    expect(await readFile(join(root, "existing.md"), "utf8")).toBe("human");
  });
  it("blocks conflicts declared in the plan without filesystem changes", async () => {
    const root = await temporaryRoot();
    const original = plan(["PROJECT.md"]);
    const conflict: GenerationPlan = {
      ...original,
      items: original.items.map((item) => ({
        ...item,
        status: GenerationTargetStatuses.CONFLICT,
      })),
    };
    await expect(
      new FileSystemGenerationWriter(root).write(conflict),
    ).rejects.toMatchObject({ code: GenerationWriteErrorCodes.FILE_CONFLICT });
    expect(await readdir(root)).toEqual([]);
  });
  it("rolls back published files and only newly created empty directories after a failure", async () => {
    const root = await temporaryRoot();
    await mkdir(join(root, "existing"));
    failures.failAt = 2;
    await expect(
      new FileSystemGenerationWriter(root).write(
        plan(["new/first.md", "existing/second.md"]),
      ),
    ).rejects.toMatchObject({
      code: GenerationWriteErrorCodes.WRITE_FAILED,
      paths: ["existing/second.md"],
    });
    expect(await readdir(root)).toEqual(["existing"]);
    expect(await readdir(join(root, "existing"))).toEqual([]);
  });
  it("preserves a replaced file and reports incomplete rollback without content", async () => {
    const root = await temporaryRoot();
    failures.failAt = 2;
    failures.replaceFirst = true;
    await expect(
      new FileSystemGenerationWriter(root).write(
        plan(["first.md", "second.md"]),
      ),
    ).rejects.toMatchObject({
      code: GenerationWriteErrorCodes.ROLLBACK_INCOMPLETE,
      paths: ["first.md"],
    });
    expect(await readFile(join(root, "first.md"), "utf8")).toBe(
      "external replacement",
    );
    expect(await readdir(root)).toEqual(["first.md"]);
  });
  it("does not overwrite a destination created after validation", async () => {
    const root = await temporaryRoot();
    failures.failAt = 2;
    failures.lateConflict = true;
    await expect(
      new FileSystemGenerationWriter(root).write(
        plan(["first.md", "second.md"]),
      ),
    ).rejects.toMatchObject({
      code: GenerationWriteErrorCodes.FILE_CONFLICT,
      paths: ["second.md"],
    });
    expect(await readdir(root)).toEqual(["second.md"]);
    expect(await readFile(join(root, "second.md"), "utf8")).toBe(
      "external conflict",
    );
  });
  it("rejects a symlink root", async () => {
    const root = await temporaryRoot();
    const outside = await temporaryRoot();
    await symlink(outside, join(root, "destination"));
    await expect(
      new FileSystemGenerationWriter(join(root, "destination")).write(
        plan(["PROJECT.md"]),
      ),
    ).rejects.toMatchObject({ code: "UNSAFE_PATH" });
    expect(await readdir(outside)).toEqual([]);
  });
  it("never overwrites aliased duplicate outputs in a forged plan", async () => {
    const root = await temporaryRoot();
    await expect(
      new FileSystemGenerationWriter(root).write(
        plan(["document.md", "./document.md"]),
      ),
    ).rejects.toMatchObject({ code: GenerationWriteErrorCodes.FILE_CONFLICT });
    expect(await readdir(root)).toEqual([]);
  });
  it("rejects escapes and symlink ancestors", async () => {
    const root = await temporaryRoot();
    const outside = await temporaryRoot();
    await mkdir(join(outside, "docs"));
    await symlink(join(outside, "docs"), join(root, "docs"));
    await expect(
      new FileSystemGenerationWriter(root).write(plan(["docs/PROJECT.md"])),
    ).rejects.toMatchObject({ code: "UNSAFE_PATH" });
    await expect(
      new FileSystemGenerationWriter(root).write(plan(["../escape.md"])),
    ).rejects.toMatchObject({ code: "UNSAFE_PATH" });
    expect(await readdir(join(outside, "docs"))).toEqual([]);
  });
});
