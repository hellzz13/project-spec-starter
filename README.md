# project-spec-starter

CLI compartilhável para iniciar projetos orientados por especificações. A
ferramenta conduz uma entrevista curta, gera documentação definitiva e prepara
o projeto para ser refinado progressivamente por pessoas e agentes.

## Estado

O projeto concluiu sua especificação inicial e está na fundação técnica. A
primeira versão entregará o bootstrap documental; geradores de código serão
adicionados posteriormente por meio de receitas e presets explícitos.

## Desenvolvimento

Esta CLI requer Node.js 24 ou superior e usa npm:

```bash
nvm use
npm install
npm test
npm run lint
npm run typecheck
npm run build
```

Para testar a entrevista interativa e revisar os caminhos dos documentos que
serão gerados, sem escrever arquivos no projeto:

```bash
node dist/cli.js init --dry-run
```

Para gerar, execute `node /caminho/do/project-spec-starter/dist/cli.js init`
no diretório do projeto de destino. Depois da entrevista, a CLI apresenta o
plano e pede confirmação, com resposta padrão negativa. Conflitos bloqueiam
toda a geração; arquivos existentes não são sobrescritos.

Para usar respostas versionadas em JSON sem entrevista, salve um arquivo como:

```json
{
  "schemaVersion": 1,
  "project": {
    "name": "Billing API",
    "summary": { "state": "pending" },
    "organization": { "kind": "single-app" },
    "nature": { "kind": "backend" },
    "capabilities": ["http-api"],
    "agentSupport": true
  },
  "runtime": { "node": { "enabled": true, "version": "24" } },
  "engineeringStandard": "recommended"
}
```

No diretório de destino, revise o plano e depois execute a geração:

```bash
node /caminho/do/project-spec-starter/dist/cli.js init --answers answers.json --dry-run
node /caminho/do/project-spec-starter/dist/cli.js init --answers answers.json --yes
```

`--yes` autoriza a escrita sem prompt. Sem `--yes` ou `--dry-run`, o comando
recusa o modo JSON; conflitos continuam bloqueando a geração. O arquivo JSON
registra a entrevista inicial, enquanto os documentos gerados passam a ser a
fonte de verdade para decisões posteriores.

O [guia de uso](docs/USAGE.md) detalha as duas formas de entrada, os campos
aceitos no JSON, decisões pendentes, monorepos e tipos personalizados.

Os conteúdos são preparados antes de publicar os arquivos. Em caso de falha,
a CLI tenta remover apenas os arquivos que criou e informa se a recuperação
ficou incompleta. Essa recuperação não equivale a uma transação do filesystem:
interrupção abrupta do processo pode exigir revisão manual. Evite alterações
simultâneas no diretório durante a geração.

## Princípios

- Nenhuma linguagem, framework ou provedor é obrigatório.
- Perguntas iniciais devem ser poucas e condicionais.
- Decisões desconhecidas são registradas como pendentes, nunca inventadas.
- Templates, perguntas, perfis e geradores devem poder ser substituídos.
- Arquivos existentes não são sobrescritos silenciosamente.
- O núcleo não depende do terminal, filesystem ou renderizador concreto.

## Documentação

- [Contexto e escopo](PROJECT.md)
- [Padrões de engenharia](docs/ENGINEERING.md)
- [Regras de negócio](docs/BUSINESS_RULES.md)
- [Fluxo de entrega](docs/GITFLOW.md)
- [Ambientes](docs/ENVIRONMENTS.md)
- [Roadmap](docs/ROADMAP.md)
- [Guia de uso](docs/USAGE.md)
- [Checklist de bootstrap](docs/BOOTSTRAP_CHECKLIST.md)
- [Decisões arquiteturais](docs/decisions/)
- [Instruções para agentes](AGENTS.md)
- [Como contribuir](CONTRIBUTING.md)
