import { execFileSync, spawnSync } from "node:child_process";
import console from "node:console";
import { access, cp, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const fixturePath = join(packageRoot, "tests/fixtures/minimal-answers.json");
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const temporaryRoot = await mkdtemp(join(tmpdir(), "project-spec-package-"));
const temporaryNpmCache = join(temporaryRoot, "npm-cache");

function run(command, arguments_, options = {}) {
  return execFileSync(command, arguments_, {
    cwd: options.cwd ?? packageRoot,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, npm_config_cache: temporaryNpmCache },
  });
}

try {
  const packOutput = run(npmCommand, [
    "pack",
    "--json",
    "--pack-destination",
    temporaryRoot,
  ]);
  const [packageManifest] = JSON.parse(packOutput);
  const packageFiles = new Set(packageManifest.files.map((file) => file.path));
  const requiredFiles = [
    "dist/cli.js",
    "profiles/default/profile.json",
    "profiles/default/questions/project.json",
    "templates/project/PROJECT_TEMPLATE.md",
    "README.md",
    "LICENSE",
  ];

  for (const file of requiredFiles) {
    const fileIsPackaged = packageFiles.has(file);

    if (!fileIsPackaged) {
      throw new Error(`Arquivo ausente do pacote: ${file}`);
    }
  }

  const tarballPath = join(temporaryRoot, packageManifest.filename);
  const consumerRoot = join(temporaryRoot, "consumer");
  run(npmCommand, [
    "install",
    "--prefix",
    consumerRoot,
    "--no-audit",
    "--no-fund",
    "--ignore-scripts",
    "--package-lock=false",
    tarballPath,
  ]);

  const installedCli = join(
    consumerRoot,
    "node_modules/project-spec-starter/dist/cli.js",
  );
  const help = run(process.execPath, [installedCli, "--help"], {
    cwd: temporaryRoot,
  });
  const helpListsInit = help.includes("init");
  const installedVersion = run(process.execPath, [installedCli, "--version"], {
    cwd: temporaryRoot,
  }).trim();
  const versionMatchesPackage = installedVersion === packageManifest.version;
  const installedCliIsInvalid = !helpListsInit || !versionMatchesPackage;

  if (installedCliIsInvalid) {
    throw new Error(
      "O executável instalado não apresentou help ou versão corretos.",
    );
  }

  const projectRoot = join(temporaryRoot, "generated-project");
  await mkdir(projectRoot);
  await cp(fixturePath, join(projectRoot, "answers.json"), {
    force: false,
    recursive: false,
  });

  const preview = run(
    process.execPath,
    [installedCli, "init", "--answers", "answers.json", "--dry-run"],
    { cwd: projectRoot },
  );
  const previewListsProject = preview.includes("PROJECT.md");

  if (!previewListsProject) {
    throw new Error("O dry-run instalado não apresentou PROJECT.md.");
  }

  const previewWroteProject = await access(
    join(projectRoot, "PROJECT.md"),
  ).then(
    () => true,
    () => false,
  );

  if (previewWroteProject) {
    throw new Error("O dry-run escreveu PROJECT.md.");
  }

  run(
    process.execPath,
    [installedCli, "init", "--answers", "answers.json", "--yes"],
    { cwd: projectRoot },
  );

  const generatedProject = await readFile(
    join(projectRoot, "PROJECT.md"),
    "utf8",
  );
  const generatedAgents = await readFile(
    join(projectRoot, "AGENTS.md"),
    "utf8",
  );
  const projectHasName = generatedProject.includes("Billing API");
  const agentsHasInstructions = generatedAgents.includes(
    "Instruções de colaboração",
  );
  const generatedDocumentsAreInvalid =
    !projectHasName || !agentsHasInstructions;

  if (generatedDocumentsAreInvalid) {
    throw new Error("O pacote instalado não gerou os documentos esperados.");
  }

  const secondGeneration = spawnSync(
    process.execPath,
    [installedCli, "init", "--answers", "answers.json", "--yes"],
    { cwd: projectRoot, encoding: "utf8" },
  );
  const conflictWasRejected = secondGeneration.status === 1;
  const projectWasPreserved =
    (await readFile(join(projectRoot, "PROJECT.md"), "utf8")) ===
    generatedProject;
  const conflictProtectionFailed = !conflictWasRejected || !projectWasPreserved;

  if (conflictProtectionFailed) {
    throw new Error("A segunda geração não preservou os arquivos existentes.");
  }

  console.log(
    "Pacote instalado: help, dry-run, geração e conflitos validados.",
  );
} finally {
  await rm(temporaryRoot, { force: true, recursive: true });
}
