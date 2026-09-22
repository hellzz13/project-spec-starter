import { describe, expect, it } from "vitest";

import { formatHelp } from "./help.js";

describe("formatHelp", () => {
  it("describes the CLI and its initial commands", () => {
    expect(formatHelp()).toMatchInlineSnapshot(`
      "project-spec-starter

      Bootstrap specification-driven projects.

      Usage:
        project-spec-starter <command> [options]

      Commands:
        init       Create the initial project documentation
        inspect    Inspect the current project specification
        validate   Validate a project answers file

      Options:
        -h, --help     Show this help
        -v, --version  Show the installed version"
    `);
  });
});
