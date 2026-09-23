import { rm } from "node:fs/promises";
import { URL } from "node:url";

const distributionDirectory = new URL("../dist", import.meta.url);

await rm(distributionDirectory, { force: true, recursive: true });
