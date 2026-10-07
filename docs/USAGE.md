# Uso da CLI

## Antes de começar

A CLI ainda não foi publicada no npm. Para testá-la, clone o repositório,
execute `nvm use`, `npm ci` e `npm run build` com Node.js 24 ou superior.
Use o caminho absoluto da CLI compilada nos exemplos abaixo. O comando
`npx project-spec-starter init` só será uma opção pública depois da publicação.

A CLI gera documentos no diretório em que o comando é executado. Ela oferece
duas formas de fornecer as respostas iniciais:

| Entrada                 | Quando usar                                                                  | Comando                                                  |
| ----------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------- |
| Entrevista no terminal  | Projeto parcialmente definido; a CLI faz as perguntas aplicáveis             | `init`                                                   |
| Arquivo JSON versionado | Respostas preparadas por uma pessoa, equipe ou agente; execução reproduzível | `init --answers answers.json` com `--dry-run` ou `--yes` |

O arquivo JSON é lido do caminho informado, relativo ao diretório atual ou
absoluto. Os documentos são sempre planejados para o diretório atual. A opção
`--answers` não copia nem modifica o arquivo de entrada.
Hoje a CLI não recebe respostas por stdin nem por flags individuais; esses
formatos exigiriam um contrato próprio antes de serem oferecidos.

## Entrevista

```bash
node /caminho/do/project-spec-starter/dist/cli.js init --dry-run
node /caminho/do/project-spec-starter/dist/cli.js init
```

A primeira execução mostra as respostas e o plano sem escrever. A segunda
mostra o plano e pede confirmação antes de criar os arquivos.

## Arquivo JSON

Um exemplo para uma aplicação única, com as opções de Node.js e padrão de
engenharia incluídas:

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

Salve o conteúdo em `answers.json`, entre no diretório do projeto de destino e
execute:

```bash
node /caminho/do/project-spec-starter/dist/cli.js init --answers answers.json --dry-run
node /caminho/do/project-spec-starter/dist/cli.js init --answers answers.json --yes
```

`--dry-run` apenas inspeciona. `--yes` autoriza a geração sem perguntas. No modo
JSON, uma dessas opções é obrigatória; elas não podem ser combinadas. A CLI
valida as respostas antes de planejar a geração. Um schema não suportado ou
campos inválidos encerram o comando com erro.

## Campos e possibilidades de resposta

`schemaVersion` deve ser `1`. O objeto `project` requer `name`, `summary`,
`organization`, `nature`, `capabilities` e `agentSupport`.

- `summary` usa `{ "state": "defined", "value": "..." }` quando há uma decisão,
  `{ "state": "pending" }` quando ela ainda será tomada ou
  `{ "state": "not-applicable" }` quando foi avaliada e não se aplica.
- `organization.kind` aceita `single-app` ou `monorepo`. Um monorepo requer uma
  lista não vazia em `organization.units`. Cada unidade informa `name`, `path`
  como decisão, `nature` e `capabilities`.
- `nature.kind` aceita `frontend`, `backend`, `full-stack`, `library`, `cli`,
  `worker`, `infrastructure`, `mobile` ou `custom`. Com `custom`, inclua uma
  descrição não vazia em `nature.description`.
- `capabilities` é uma lista de nomes. Pode conter capacidades próprias do
  projeto; a CLI não escolhe frameworks a partir delas.
- `agentSupport` é um booleano. Quando `true`, o perfil padrão inclui
  `AGENTS.md`.
- `runtime` é opcional. Para gerar `.nvmrc`, use
  `{ "node": { "enabled": true, "version": "24" } }`. A versão aceita números
  como `24` ou `24.14.1`, opcionalmente com prefixo `v`. Para não usar Node.js,
  informe `{ "node": { "enabled": false } }` ou omita `runtime`.
- `engineeringStandard` é opcional. O perfil padrão oferece `recommended`,
  `custom` e `disabled`. `recommended` gera o padrão inicial editável;
  `custom` registra que o padrão será fornecido pela pessoa, sem inventar seu
  conteúdo; `disabled` não gera um padrão inicial.

Os arquivos [heterogeneous-monorepo.json](../tests/fixtures/heterogeneous-monorepo.json)
e [custom-type-decisions.json](../tests/fixtures/custom-type-decisions.json)
mostram monorepo, tipo personalizado e os três estados de decisão.

## Segurança e evolução

A CLI mostra o plano antes da escrita e bloqueia toda a geração quando encontra
um arquivo de destino existente. Não sobrescreve documentos editados. O JSON
registra a entrada inicial; depois da geração, os documentos editados passam a
ser a fonte de verdade do projeto. Não coloque segredos, tokens, senhas ou URLs
privadas no arquivo de respostas.

## Personalização disponível

Durante a entrevista, é possível escolher o tipo de projeto, capacidades,
unidades de monorepo, suporte a agentes, versão do Node.js e o padrão de
engenharia. O modo JSON aceita as mesmas decisões pelo contrato versionado.
Escolher `engineeringStandard: "custom"` registra que a pessoa fornecerá suas
próprias regras; isso não cria automaticamente um arquivo de regras. Depois do
bootstrap, edite os documentos gerados diretamente: eles são a fonte de verdade
e a CLI não os mescla nem sobrescreve em uma nova execução.

Autores do perfil padrão podem alterar, neste repositório, o manifesto em
[`profiles/default/profile.json`](../profiles/default/profile.json), os módulos
em [`profiles/default/questions/`](../profiles/default/questions/) e os
arquivos em [`templates/project/`](../templates/project/). O manifesto declara
a ordem, as condições e os caminhos dos documentos. Mudanças nesses recursos
precisam passar por testes, build e `npm run test:package` antes de distribuir
um pacote novo. O perfil e os módulos têm versões próprias; mudanças estruturais
exigem migração explícita e não podem reinterpretar respostas antigas.

A seleção de um perfil externo e as sobrescritas locais de perguntas ou
templates **ainda não estão expostas pela CLI**. Editar arquivos dentro de um
pacote instalado também não é um mecanismo suportado de personalização. Essa
lacuna deve ser fechada antes de anunciar perfis locais substituíveis como
recurso da versão 0.1.0.
