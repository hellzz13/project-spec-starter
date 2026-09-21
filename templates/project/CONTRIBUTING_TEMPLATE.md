# Contribuindo — [NOME_DO_PROJETO]

Estas orientações são para colaboradores humanos. Substitua os marcadores pelos
procedimentos do projeto e remova o que não se aplicar.

## Antes de começar

- Requisitos: `[VERSÃO_DA_LINGUAGEM]`, `[FERRAMENTAS]` e `[ACESSOS]`.
- Gerenciador escolhido: `[GERENCIADOR_DE_PACOTES]`.
- Setup local: `[COMANDO_DE_SETUP]`.
- Variáveis: copie `[ARQUIVO_DE_EXEMPLO]` e preencha somente valores seguros.
- Documentos obrigatórios: `PROJECT.md`, `docs/ENGINEERING.md`,
  `docs/BUSINESS_RULES.md`, `docs/GITFLOW.md` e
  `docs/ENVIRONMENTS.md`.
- Decisões relevantes ficam em `docs/decisions/`.

Antes de codificar, leia a documentação atual e confirme que o problema,
escopo, regra e critério de aceite estão claros. Se houver ambiguidade, registre
a pergunta e alinhe a decisão antes de implementar.

## Branches e commits

- Branch base para trabalho comum: `[BRANCH_INTEGRACAO]`.
- Branch de produção: `[BRANCH_PRODUCAO]`.
- Nomenclatura: `[feature/*]`, `[fix/*]` e `[hotfix/*]`.
- Não trabalhe diretamente nas branches permanentes.
- Mantenha cada commit pequeno, coerente e reversível.
- Formato de commit: `[PADRAO_DE_COMMIT]`.
- Não inclua segredos, dados pessoais, arquivos gerados ou mudanças sem relação.

## Ciclo de desenvolvimento

Para cada comportamento novo ou correção:

1. Escreva um teste que descreva o resultado esperado.
2. Confirme a falha pelo motivo correto.
3. Implemente a menor mudança necessária.
4. Refatore preservando o comportamento.
5. Execute todos os comandos obrigatórios.

Use as fronteiras e convenções de componentização definidas em
`docs/ENGINEERING.md`. Views não devem conter regras de negócio, chamadas
HTTP ou acesso a storage.

## Comandos obrigatórios

Execute antes de abrir uma revisão:

- Formatação: `[COMANDO_DE_FORMAT]`
- Lint: `[COMANDO_DE_LINT]`
- Tipos: `[COMANDO_DE_TYPECHECK]`
- Testes: `[COMANDO_DE_TESTES]`
- Build: `[COMANDO_DE_BUILD]`

Se um comando falhar, investigue e informe a causa. Não use bypass como fluxo
normal. Registre exceções e valide-as antes do merge.

## Documentação e decisões

- Atualize `PROJECT.md` quando escopo, requisitos, riscos ou métricas mudarem.
- Atualize `docs/BUSINESS_RULES.md` quando regras de produto mudarem.
- Crie um ADR em `docs/decisions/` para decisões relevantes, usando
  a estrutura de ADR adotada em `docs/decisions/` ou, durante o bootstrap,
  partindo de `DECISION_RECORD_TEMPLATE.md`.
- Atualize `docs/ENVIRONMENTS.md` para mudanças de configuração, dados,
  deploy, observabilidade ou rollback.
- Mantenha contratos, exemplos e links internos coerentes.

## Segurança e acessibilidade

- Não publique credenciais, tokens, dados pessoais ou detalhes internos em
  commits, issues, revisões, logs ou mensagens de erro.
- Use o canal privado `[CANAL_DE_SEGURANCA]` para relatar vulnerabilidades.
  Não abra uma issue pública nem descreva a exploração publicamente antes da
  orientação do responsável.
- Registre escopo, impacto, reprodução mínima e contato seguro, sem anexar
  segredos ou dados reais.
- Garanta semântica, teclado, foco visível, contraste, feedback de erro e
  estados de carregamento.
- Solicite revisão adicional para mudanças de autorização, privacidade ou dados.

## Migrations e incompatibilidades

- Toda alteração de schema ou dados deve documentar impacto, ordem de execução,
  backup, compatibilidade e rollback.
- Não execute migration destrutiva em ambiente compartilhado sem aprovação
  explícita e restauração testada.
- Mudanças incompatíveis exigem plano de migração, período de compatibilidade,
  comunicação e critério de remoção.
- Atualize contratos e consumidores antes de remover ou alterar uma interface.

## Pull request e revisão

1. Atualize a branch temporária com a branch base.
2. Descreva problema, solução, escopo, testes e riscos.
3. Relacione migrations, flags, decisões e rollout quando aplicável.
4. Abra o pull request contra `[BRANCH_INTEGRACAO]`.
5. Aguarde checks e revisores definidos em `docs/GITFLOW.md`.
6. Resolva comentários com evidência e atualize a documentação.
7. Valide o ambiente de preview antes do merge quando houver mudança visual ou
   operacional.

## Definition of Done

- [ ] Critérios de aceite e casos de erro estão cobertos.
- [ ] Testes, formatação, lint, tipos e build passam.
- [ ] Segurança, autorização, privacidade e acessibilidade foram revisadas.
- [ ] Loading, vazio e erro foram tratados quando aplicável.
- [ ] Migrations e alterações incompatíveis têm plano seguro.
- [ ] Documentação e ADRs estão atualizados.
- [ ] O pull request tem descrição, evidências e revisão necessária.
- [ ] Rollout, observabilidade e rollback estão definidos quando necessário.

## Código de conduta e suporte

- Código de conduta: `[LINK_OU_ARQUIVO_DE_CODIGO_DE_CONDUTA]`.
- Canal para dúvidas: `[CANAL_DE_SUPORTE]`.
- Responsável pela manutenção: `[PESSOA_OU_EQUIPE]`.
