# Instruções para agentes — project-spec-starter

## Contexto obrigatório

Antes de alterar o projeto, leia nesta ordem:

1. `PROJECT.md`
2. `docs/ENGINEERING.md`
3. `docs/BUSINESS_RULES.md`
4. `docs/ROADMAP.md`
5. `docs/GITFLOW.md`
6. ADRs relacionados em `docs/decisions/`

## Trabalho com lacunas

- Não invente requisitos, regras, tecnologias, provedores ou caminhos.
- Diferencie uma decisão pendente de algo declarado como não aplicável.
- Pergunte apenas quando a lacuna afetar a tarefa atual.
- Ao apresentar alternativas, explique impactos relevantes e recomende uma.
- Depois da decisão, atualize o documento responsável.
- Registre em ADR decisões arquiteturais, difíceis de reverter ou com impacto
  amplo.

## Desenvolvimento

- Inspecione branch, mudanças locais e testes antes de editar.
- Preserve alterações existentes e evite mudanças sem relação com a tarefa.
- Siga TDD para comportamento novo ou correções.
- Mantenha domínio, casos de uso, portas, adaptadores e CLI separados conforme
  `docs/ENGINEERING.md`.
- Não acople perguntas ou templates aos comandos da CLI.
- Não adicione dependências sem justificar a necessidade e avaliar alternativas.
- Use npm e mantenha somente `package-lock.json` como lockfile.
- Antes de concluir a revisão, confronte cada regra aplicável de
  `docs/ENGINEERING.md` com os arquivos alterados. Gates automatizados não
  substituem essa verificação.
- Conjuntos estáveis de estados, códigos e kinds usam objetos `as const` e tipos
  derivados. Prefira mapeamentos exaustivos a `switch`.

## Delegação e custo

- Tarefas independentes, delimitadas e verificáveis podem ser delegadas a um
  modelo mais econômico.
- Forneça contexto, arquivos permitidos, resultado esperado e critérios de
  aceite explícitos.
- Prefira delegar leitura focada, inventários, documentação, tarefas mecânicas e
  implementações isoladas com teste objetivo.
- Mantenha com o agente principal arquitetura, segurança, privacidade,
  ambiguidades, integração e revisão final.
- Não delegue segredos, ações destrutivas, autorização externa ou decisões
  transversais de alto impacto.
- Delegação não amplia a autorização original. Revise a entrega e execute os
  gates relevantes no contexto integrado.

## Compatibilidade

- Trate schema, perfis e receitas como contratos versionados.
- Prefira mudanças aditivas e defaults seguros.
- Crie migração explícita para alterações estruturais.
- Não reinterprete configuração antiga silenciosamente.
- Não sobrescreva documentos editados durante atualização ou regeneração.

## Segurança

- Nunca solicite ou grave segredos, tokens, URLs privadas ou dados pessoais.
- Valide que todo destino permanece dentro do diretório do projeto.
- Não execute scripts de perfis ou geradores sem um modelo de confiança
  explicitamente aprovado.
- Não publique, instale dependências ou altere serviços externos sem autorização.

## Conclusão

Antes de concluir uma mudança, execute os gates disponíveis, revise o pacote
distribuível quando afetado e informe comportamento alterado, validações, riscos
e pendências reais. Regras sem verificação automática devem ser conferidas no
diff por uma matriz de revisão explícita.
