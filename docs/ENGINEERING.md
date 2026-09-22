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
    manifest.json
    questions/
    templates/
tests/
  fixtures/
  snapshots/
  integration/
```

Pastas serão criadas quando receberem uma responsabilidade real. Não serão
adicionadas apenas para reproduzir o diagrama.

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
