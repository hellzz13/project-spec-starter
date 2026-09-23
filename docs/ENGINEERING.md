# Padrões de engenharia — project-spec-starter

## Stack definida

| Área              | Escolha    | Estado   |
| ----------------- | ---------- | -------- |
| Runtime           | Node.js    | Definido |
| Linguagem         | TypeScript | Definido |
| Gerenciador       | npm        | Definido |
| Testes            | Vitest     | Definido |
| Argumentos da CLI | A decidir  | Pendente |
| Prompts           | A decidir  | Pendente |
| Validação         | A decidir  | Pendente |
| Renderização      | A decidir  | Pendente |

Dependências pendentes só serão escolhidas quando existir um comportamento e um
teste que demonstrem a necessidade.

## Runtime

- Node.js 22 é a versão mínima suportada.
- `.nvmrc` contém a linha padrão usada no desenvolvimento local.
- `.nvmrc`, `package.json#engines.node`, CI e documentação permanecem alinhados.
- A versão mínima só muda com validação dos testes e do pacote empacotado.

## Arquitetura

```text
CLI -> casos de uso -> domínio
             |
             -> portas <- adaptadores
```

- O domínio representa projetos, capacidades, decisões e planos de geração.
- Casos de uso coordenam o domínio sem conhecer bibliotecas concretas.
- Portas definem contratos para prompts, filesystem, renderização e perfis.
- Adaptadores implementam esses contratos.
- A CLI interpreta argumentos, chama casos de uso e apresenta resultados.

Direção obrigatória das dependências:

```text
cli -> application -> domain
adapters -> ports <- application
```

O domínio não importa módulos de CLI, adaptadores ou APIs concretas do Node.js.

## Organização inicial

```text
src/
  domain/
  application/
  ports/
  adapters/
  cli/
  shared/
profiles/
  default/
    profile.json
    questions/
    templates/
tests/
  fixtures/
  snapshots/
  integration/
```

Pastas serão criadas quando receberem uma responsabilidade real. Não serão
adicionadas apenas para reproduzir o diagrama.

## Padrão de código

- TypeScript permanece em modo estrito.
- Não usar `any`; valores desconhecidos usam `unknown` com validação e narrowing.
- Preferir exports nomeados, funções pequenas e nomes orientados ao domínio.
- Preferir early returns quando reduzirem indentação sem esconder o fluxo.
- Toda condição que controla fluxo deve ter nome semântico antes do uso, mesmo
  quando a comparação for simples. A regra vale para `if`, `while`, ternários e
  callbacks condicionais; predicados nomeados também atendem ao padrão.
- Separar validação estrutural da regra que consome seu resultado.
- Não manter código comentado, imports sem uso ou logs de depuração.
- Configuração repetida possui uma única fonte no menor escopo coerente.

### Nomenclatura

- Variáveis e funções usam `camelCase`; classes e tipos usam `PascalCase`.
- Constantes primitivas de módulo usam `UPPER_SNAKE_CASE` quando representam
  valores verdadeiramente imutáveis e relevantes.
- Objetos de constantes usam `PascalCase` e chaves `UPPER_SNAKE_CASE`.
- Nomes genéricos como `condition`, `data` ou `flag` devem ser substituídos por
  termos que revelem intenção.

### Funções e fluxo

- Mais de dois argumentos relacionados são agrupados em objeto tipado.
- Não usar comparações ou expressões booleanas anônimas diretamente em
  estruturas de controle; declarar a intenção em uma constante ou predicado.
- Não usar ternários aninhados.
- Usar `.some()` quando a pergunta for apenas sobre existência.
- Quando `0`, string vazia ou `false` forem válidos, usar `??` ou verificação
  explícita em vez de `||`.
- Preferir `Boolean(value)` e `Number(value)` para conversões que façam parte da
  regra.
- `switch` representa uniões discriminadas e deve ser exaustivo; mapeamentos
  simples usam `Record`.
- `try/catch` exige recuperação, tradução do erro ou contexto adicional.

### TypeScript

- Preferir objetos `as const` e tipos derivados para conjuntos simples.
- Enums só representam entidades estáveis de domínio necessárias em runtime.
- Assertions não podem forçar compatibilidade nem contornar validação.
- Usar uniões discriminadas para estados mutuamente exclusivos.
- Usar `satisfies` para validar estruturas sem perder inferência literal.
- Usar `Record` quando todas as chaves de uma união forem obrigatórias.

## Contratos centrais

- `Answers`: respostas brutas associadas a uma versão de schema.
- `ProjectSpecification`: representação validada e normalizada.
- `DocumentModel`: dados estáveis consumidos pelos templates.
- `GenerationPlan`: arquivos planejados, conflitos, avisos e itens ignorados.
- `Profile`: manifesto, perguntas, templates e geradores declarativos.
- `GeneratorRecipe`: receita opcional para gerar um artefato.

## Extensibilidade

A ordem de resolução será:

```text
configuração local -> perfil selecionado -> perfil padrão do pacote
```

Perguntas e templates não ficam embutidos nos comandos. Regras de segurança,
validação de caminhos e compatibilidade permanecem no código do núcleo.

Extensões executáveis de terceiros não fazem parte do MVP. Perfis e receitas
começam declarativos para manter comportamento auditável.

## Compatibilidade

- CLI, schema, perfil e presets possuem versões próprias.
- Campos novos devem ter default seguro ou permanecer opcionais.
- Renomear ou dividir campos exige migração testada.
- Remover uma API pública exige depreciação e versão incompatível apropriada.
- Configurações antigas nunca são reinterpretadas silenciosamente.
- Documentos editados por pessoas ou agentes nunca são regenerados por cima.

## Desenvolvimento guiado por testes

Cada comportamento segue este ciclo:

1. Escrever o teste do resultado observável.
2. Confirmar a falha pelo motivo correto.
3. Implementar a menor mudança suficiente.
4. Refatorar preservando o comportamento.
5. Executar os gates relevantes.

A primeira fatia vertical será:

```text
answers.json mínimo
  -> validação
  -> modelo documental
  -> PROJECT.md em memória
  -> snapshot
```

## Delegação de trabalho

O agente principal pode usar modelos mais econômicos para tarefas independentes,
delimitadas e verificáveis, como inventários, documentação, mudanças mecânicas e
implementações isoladas. Cada delegação informa contexto, escopo, resultado e
critérios de aceite.

Arquitetura, segurança, privacidade, requisitos ambíguos, integração e revisão
final permanecem com o agente principal. Toda entrega delegada é revisada e
validada novamente no contexto completo.

## Estratégia de testes

- Unitários para domínio, condições, normalização e migrações.
- Contrato para adaptadores de perfil, renderização e filesystem.
- Snapshots para documentos completos de cenários representativos.
- Invariantes para marcadores, referências e seções incompatíveis.
- Integração para cancelamento, conflitos, `dry-run` e escrita atômica.
- Empacotamento para confirmar que templates e perfis chegam ao consumidor.

Os cenários mínimos são frontend, backend, full-stack, monorepo, biblioteca,
CLI, worker, tipo personalizado, decisões pendentes e agentes desabilitados.

## Segurança

- A CLI não solicita valores de tokens, senhas ou URLs privadas.
- Caminhos de saída são resolvidos e verificados dentro do destino.
- Links simbólicos não podem escapar do projeto.
- Arquivos existentes bloqueiam a escrita até uma decisão explícita.
- Extensões declarativas não executam comandos arbitrários.
- Logs e erros não exibem conteúdo sensível.

## Acessibilidade

- Perguntas não dependem apenas de cor ou símbolos.
- Mensagens identificam campo, problema e forma de correção.
- Fluxos interativos têm equivalentes não interativos por configuração.
- A saída funciona em terminais sem recursos visuais avançados.

## Gates

| Gate       | Comando                |
| ---------- | ---------------------- |
| Formatação | `npm run format:check` |
| Lint       | `npm run lint`         |
| Tipos      | `npm run typecheck`    |
| Testes     | `npm test`             |
| Build      | `npm run build`        |

## Definition of Done

- Comportamento e erros possuem testes relevantes.
- Compatibilidade do schema foi avaliada.
- Nenhum arquivo existente é alterado sem intenção explícita.
- Segurança de caminhos e dados foi revisada.
- Documentação e ADRs refletem a implementação.
- Gates aplicáveis passam no pacote realmente distribuído.
