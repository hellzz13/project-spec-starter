# Instruções de colaboração — [NOME_DO_PROJETO]

Use este arquivo como instrução para agentes de desenvolvimento. Substitua os
marcadores e remova orientações que não se aplicarem ao projeto.

## Contexto obrigatório

Antes de alterar qualquer coisa, leia os documentos abaixo na ordem indicada:

1. `PROJECT.md` preenchido.
2. `docs/ENGINEERING.md` preenchido.
3. `docs/BUSINESS_RULES.md` preenchido.
4. `docs/GITFLOW.md` preenchido.
5. `[Outros documentos obrigatórios]`.

Se algum documento não existir ou estiver contraditório, pare para registrar a
lacuna e peça uma decisão antes de implementar uma mudança ambígua.

## Início de cada fase

- Inspecione o estado atual do repositório, branch, mudanças locais e testes.
- Defina escopo, dependências, riscos e critérios de conclusão.
- Apresente um plano curto antes de iniciar a implementação.
- Separe trabalho de leitura, planejamento, implementação e validação.
- Não considere trabalho em andamento como percentual concluído.

## Delegação

- Quando houver uma tarefa independente, bem delimitada e verificável, o agente
  principal pode delegá-la a um modelo mais econômico.
- Informe ao agente delegado o contexto necessário, arquivos e escopo permitidos,
  resultado esperado e critérios de aceite.
- Prefira delegar inventários, leitura focada, documentação, tarefas mecânicas e
  implementações isoladas com comportamento claramente verificável.
- Delegue somente tarefas concretas, delimitadas e sem decisões ambíguas.
- O agente principal mantém responsabilidade por arquitetura, segurança,
  privacidade, revisão independente e integração final.
- Não delegue trabalho interdependente, decisões transversais, requisitos em
  aberto ou mudanças de alto impacto sem supervisão direta.
- Não delegue tratamento de segredos, ações destrutivas ou autorização externa.
- A delegação não amplia a autorização nem o escopo original da tarefa.
- Revise toda entrega delegada e execute novamente os gates no contexto final.

## Desenvolvimento

- Siga TDD: teste esperado, falha correta, implementação mínima e refatoração.
- Respeite as fronteiras, pastas, contratos e critérios de componentização de
  `docs/ENGINEERING.md`.
- Não coloque regra de negócio, HTTP, storage ou persistência em views.
- Preserve mudanças existentes e não sobrescreva trabalho sem autorização.
- Use somente `[GERENCIADOR_DE_PACOTES_ESCOLHIDO]` e seus arquivos de lock.
- Não adicione dependências ou altere a stack sem registrar a decisão.

## Ações externas e segurança

- Peça autorização antes de enviar mensagens, publicar dados, alterar serviços
  externos ou modificar configurações fora do repositório.
- Confirme o alvo antes de qualquer ação destrutiva, remoção ou migração.
- Nunca invente, copie ou exponha tokens, credenciais, URLs privadas ou dados
  pessoais.
- Mantenha segredos somente em `[MECANISMO_DE_SEGREDOS]`.
- Se um segredo for exposto, interrompa o fluxo, registre o incidente e
  solicite rotação imediata.

## Gates obrigatórios

Antes de concluir uma fase, execute com sucesso:

- Formatação: `[COMANDO_DE_FORMAT]`
- Lint: `[COMANDO_DE_LINT]`
- Tipos: `[COMANDO_DE_TYPECHECK]`
- Testes: `[COMANDO_DE_TESTES]`
- Build: `[COMANDO_DE_BUILD]`

Inclua testes de integração, segurança, acessibilidade ou smoke test quando a
mudança os exigir. Registre falhas, exceções e validações adiadas.

## Documentação e entrega

- Atualize `PROJECT.md` quando escopo, requisitos, riscos ou métricas
  mudarem.
- Atualize `docs/BUSINESS_RULES.md` quando uma regra de produto mudar.
- Crie ou atualize um registro em `docs/decisions/ADR-XXX-titulo.md` para decisões
  relevantes.
- Atualize `docs/ENVIRONMENTS.md` para alterações operacionais.
- Siga o fluxo em `docs/GITFLOW.md` e abra a revisão na branch configurada.
- Informe arquivos alterados, comandos executados, resultado dos gates, riscos
  restantes e percentual consolidado de desenvolvimento.

## Critério de conclusão

Uma fase só está concluída quando comportamento, erros, autorização, testes,
documentação e gates estiverem tratados. Se algo permanecer pendente, liste o
item explicitamente e não o apresente como concluído.
