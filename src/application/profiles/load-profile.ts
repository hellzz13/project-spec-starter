import type { Profile } from "../../domain/profile.js";
import type { QuestionModule } from "../../domain/question-module.js";
import type { ProfileResourceReader } from "../../ports/profile-resource-reader.js";
import { parseProfile } from "./parse-profile.js";
import { parseQuestionModule } from "./parse-question-module.js";
import { ProfileError, ProfileErrorCodes } from "./profile-error.js";

export interface LoadedProfile {
  readonly profile: Profile;
  readonly questionModules: readonly QuestionModule[];
  readonly templates: Readonly<Record<string, string>>;
}

export async function loadProfile(options: {
  readonly manifestPath: string;
  readonly reader: ProfileResourceReader;
}): Promise<LoadedProfile> {
  const { manifestPath, reader } = options;
  const manifestContents = await reader.readText(manifestPath);
  const profile = parseProfileJson(manifestContents, manifestPath);
  const questionModules = await Promise.all(
    profile.questionModules.map(async (modulePath) => {
      const moduleContents = await reader.readText(modulePath);
      const moduleInput = parseJson(moduleContents, modulePath);

      return parseQuestionModule(moduleInput);
    }),
  );
  const templatePaths = collectTemplatePaths(profile);
  const templateEntries = await Promise.all(
    templatePaths.map(async (templatePath) => {
      const contents = await reader.readText(templatePath);

      return [templatePath, contents] as const;
    }),
  );

  return {
    profile,
    questionModules,
    templates: Object.fromEntries(templateEntries),
  };
}

function parseProfileJson(contents: string, path: string): Profile {
  return parseProfile(parseJson(contents, path));
}

function parseJson(contents: string, path: string): unknown {
  try {
    return JSON.parse(contents) as unknown;
  } catch (error) {
    const isSyntaxError = error instanceof SyntaxError;
    const message = isSyntaxError
      ? `Invalid JSON in profile resource: ${path}`
      : `Unable to parse profile resource: ${path}`;

    throw new ProfileError({
      code: ProfileErrorCodes.INVALID_PROFILE,
      path,
      message,
    });
  }
}

function collectTemplatePaths(profile: Profile): readonly string[] {
  const documentTemplates = profile.documents.map(
    (document) => document.template,
  );
  const engineeringTemplates = Object.values(profile.engineeringStandards)
    .map((standard) => standard.template)
    .filter((template): template is string => {
      const hasTemplate = template !== undefined;

      return hasTemplate;
    });

  return [...new Set([...documentTemplates, ...engineeringTemplates])];
}
