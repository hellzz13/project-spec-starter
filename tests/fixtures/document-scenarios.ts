interface DocumentScenario {
  readonly id: string;
  readonly answers: Record<string, unknown>;
  readonly expectedNature: string;
  readonly expectsAgentDocument: boolean;
  readonly expectsMonorepoSection: boolean;
  readonly includeProjectSnapshot: boolean;
}

function singleApplicationAnswers(options: {
  readonly name: string;
  readonly nature: Record<string, unknown>;
  readonly summary?: Record<string, unknown>;
  readonly capabilities?: readonly string[];
  readonly agentSupport?: boolean;
}): Record<string, unknown> {
  return {
    schemaVersion: 1,
    project: {
      name: options.name,
      summary: options.summary ?? {
        state: "defined",
        value: `Initial specification for ${options.name}.`,
      },
      organization: { kind: "single-app" },
      nature: options.nature,
      capabilities: options.capabilities ?? [],
      agentSupport: options.agentSupport ?? true,
    },
  };
}

export const documentScenarios = [
  {
    id: "frontend",
    answers: singleApplicationAnswers({
      name: "Customer Portal",
      nature: { kind: "frontend" },
      capabilities: ["web-ui", "accessibility"],
    }),
    expectedNature: "Frontend",
    expectsAgentDocument: true,
    expectsMonorepoSection: false,
    includeProjectSnapshot: false,
  },
  {
    id: "backend",
    answers: singleApplicationAnswers({
      name: "Billing API",
      nature: { kind: "backend" },
      capabilities: ["http-api", "scheduled-jobs"],
    }),
    expectedNature: "Backend",
    expectsAgentDocument: true,
    expectsMonorepoSection: false,
    includeProjectSnapshot: false,
  },
  {
    id: "full-stack",
    answers: singleApplicationAnswers({
      name: "Support Desk",
      nature: { kind: "full-stack" },
      capabilities: ["web-ui", "http-api"],
    }),
    expectedNature: "Full-stack",
    expectsAgentDocument: true,
    expectsMonorepoSection: false,
    includeProjectSnapshot: false,
  },
  {
    id: "heterogeneous-monorepo",
    answers: {
      schemaVersion: 1,
      project: {
        name: "Commerce Platform",
        summary: {
          state: "defined",
          value: "Tools for operating a commerce business.",
        },
        organization: {
          kind: "monorepo",
          units: [
            {
              name: "Storefront",
              path: { state: "defined", value: "apps/storefront" },
              nature: { kind: "frontend" },
              capabilities: ["web-ui"],
            },
            {
              name: "Import pipeline",
              path: { state: "pending" },
              nature: {
                kind: "custom",
                description: "Batch data processing pipeline",
              },
              capabilities: ["scheduled-jobs"],
            },
          ],
        },
        nature: { kind: "full-stack" },
        capabilities: ["web-ui", "http-api"],
        agentSupport: true,
      },
    },
    expectedNature: "Full-stack",
    expectsAgentDocument: true,
    expectsMonorepoSection: true,
    includeProjectSnapshot: true,
  },
  {
    id: "library",
    answers: singleApplicationAnswers({
      name: "Date Utilities",
      nature: { kind: "library" },
      capabilities: ["public-api"],
    }),
    expectedNature: "Biblioteca",
    expectsAgentDocument: true,
    expectsMonorepoSection: false,
    includeProjectSnapshot: false,
  },
  {
    id: "cli",
    answers: singleApplicationAnswers({
      name: "Release Assistant",
      nature: { kind: "cli" },
      capabilities: ["terminal-ui"],
    }),
    expectedNature: "CLI",
    expectsAgentDocument: true,
    expectsMonorepoSection: false,
    includeProjectSnapshot: false,
  },
  {
    id: "worker",
    answers: singleApplicationAnswers({
      name: "Invoice Worker",
      nature: { kind: "worker" },
      capabilities: ["queue-consumer"],
    }),
    expectedNature: "Worker",
    expectsAgentDocument: true,
    expectsMonorepoSection: false,
    includeProjectSnapshot: false,
  },
  {
    id: "custom-type",
    answers: singleApplicationAnswers({
      name: "Research Workbench",
      nature: {
        kind: "custom",
        description: "Interactive scientific experiment workbench",
      },
      capabilities: ["data-visualization", "local-storage"],
    }),
    expectedNature: "Interactive scientific experiment workbench",
    expectsAgentDocument: true,
    expectsMonorepoSection: false,
    includeProjectSnapshot: true,
  },
  {
    id: "pending-decisions",
    answers: singleApplicationAnswers({
      name: "Pending Product",
      nature: { kind: "backend" },
      summary: { state: "pending" },
    }),
    expectedNature: "Backend",
    expectsAgentDocument: true,
    expectsMonorepoSection: false,
    includeProjectSnapshot: false,
  },
  {
    id: "agents-disabled",
    answers: singleApplicationAnswers({
      name: "Manual Operations",
      nature: { kind: "backend" },
      agentSupport: false,
    }),
    expectedNature: "Backend",
    expectsAgentDocument: false,
    expectsMonorepoSection: false,
    includeProjectSnapshot: false,
  },
] satisfies readonly DocumentScenario[];
