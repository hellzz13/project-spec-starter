import { describe, expect, it, vi } from "vitest";

import { formatHelp } from "./help.js";
import { runCli } from "./run-cli.js";

function createOutput() {
  return {
    error: vi.fn<(message: string) => void>(),
    log: vi.fn<(message: string) => void>(),
  };
}

describe("runCli", () => {
  it.each([[[]], [["--help"]], [["-h"]]])(
    "prints help for arguments %j",
    (arguments_) => {
      const output = createOutput();

      expect(runCli(arguments_, { output, version: "1.2.3" })).toBe(0);
      expect(output.log).toHaveBeenCalledWith(formatHelp());
      expect(output.error).not.toHaveBeenCalled();
    },
  );

  it.each([[["--version"]], [["-v"]]])(
    "prints the installed version for arguments %j",
    (arguments_) => {
      const output = createOutput();

      expect(runCli(arguments_, { output, version: "1.2.3" })).toBe(0);
      expect(output.log).toHaveBeenCalledWith("1.2.3");
      expect(output.error).not.toHaveBeenCalled();
    },
  );

  it("returns an error for an unknown command", () => {
    const output = createOutput();

    expect(runCli(["unknown"], { output, version: "1.2.3" })).toBe(1);
    expect(output.log).not.toHaveBeenCalled();
    expect(output.error.mock.calls).toEqual([
      ["Unknown command: unknown"],
      ["Run project-spec-starter --help to see the available commands."],
    ]);
  });
});
