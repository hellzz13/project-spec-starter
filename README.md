# project-spec-starter

[Site e guia rápido](https://hellzz13.github.io/project-spec-starter/) · [Pacote no npm](https://www.npmjs.com/package/project-spec-starter) · [Documentação completa](docs/USAGE.md)

[Entenda cada pergunta da entrevista](docs/QUESTIONS.md).

CLI compartilhável para iniciar projetos orientados por especificações. A
ferramenta conduz uma entrevista curta, gera documentação definitiva e prepara
o projeto para ser refinado progressivamente por pessoas e agentes.

## Estado

O bootstrap documental funciona pela entrevista interativa ou por respostas
JSON versionadas. A versão 1.0.0 entrega o bootstrap documental; geradores de
código serão adicionados posteriormente por meio de receitas e presets
explícitos.

## Uso

Use Node.js 24 ou superior. No diretório do projeto que receberá os documentos,
execute a entrevista. A CLI mostra o plano e pede confirmação antes da escrita:

```bash
npx project-spec-starter@1.0.0 init
```

A CLI não cria uma pasta de projeto: ela escreve no diretório em que o comando
é executado. Arquivos existentes geram conflito e não são sobrescritos.
Se você já preparou respostas em JSON, pode usar `--dry-run` para inspecionar o
plano e depois gerar com o mesmo arquivo, sem repetir a entrevista. Veja o
[guia de uso](docs/USAGE.md#arquivo-json).

## Teste a partir do repositório

Para testar uma versão ainda não publicada, clone o repositório e prepare a CLI
com npm:

```bash
git clone https://github.com/hellzz13/project-spec-starter.git
cd project-spec-starter
nvm use
npm ci
npm run build
```

No diretório do projeto que receberá os documentos, execute a CLI compilada
pelo caminho absoluto. A entrevista mostra o plano antes de pedir confirmação:

```bash
node /caminho/do/project-spec-starter/dist/cli.js init
```

O pacote distribuível pode ser conferido com `npm run test:package`.

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
aceitos no JSON, decisões pendentes, monorepos, tipos personalizados e as
possibilidades de personalização por perfil e sobrescritas locais.

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
- [Changelog](CHANGELOG.md)
- [Procedimento de release](docs/RELEASE.md)
- [Checklist de bootstrap](docs/BOOTSTRAP_CHECKLIST.md)
- [Decisões arquiteturais](docs/decisions/)
- [Instruções para agentes](AGENTS.md)
- [Como contribuir](CONTRIBUTING.md)

## Licença e participação

Este repositório é mantido por [Hélio Palença Neto](https://hpndev.vercel.app/)
([@hellzz13](https://github.com/hellzz13)) e aceita contribuições. Veja
[como contribuir](CONTRIBUTING.md) antes de abrir um PR. O
código e a documentação do repositório são distribuídos sob a
[licença MIT](LICENSE); o histórico de commits e PRs registra quem contribuiu.
