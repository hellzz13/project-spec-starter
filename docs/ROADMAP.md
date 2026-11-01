# Roadmap

## Marco 0 — Especificação

- [x] Definir objetivo, escopo e público.
- [x] Definir entrevista mínima e refinamento por agentes.
- [x] Definir extensibilidade de perfis, templates e geradores.
- [x] Registrar as decisões arquiteturais iniciais.
- [x] Revisar os documentos definitivos antes da implementação.

## Marco 1 — Fundação técnica

- [x] Configurar Node.js, TypeScript e npm.
- [x] Configurar testes, lint, formatação, tipos e build.
- [x] Criar o executável com `--help` e códigos de saída consistentes.
- [x] Verificar o conteúdo real do pacote npm empacotado.

## Marco 2 — Domínio e schema

- [x] Modelar projeto, organização, unidades e capacidades.
- [x] Modelar decisões definidas, pendentes e não aplicáveis.
- [x] Criar schema versionado e validação.
- [x] Criar pipeline isolado de migrações e fixtures representativas.

## Marco 3 — Motor documental

- [x] Criar manifesto central de documentos.
- [x] Criar perfil padrão e perguntas declarativas.
- [x] Construir o modelo documental intermediário.
- [x] Renderizar todos os documentos em memória.
- [x] Cobrir os cenários principais com snapshots e invariantes.

## Marco 4 — CLI interativa

- [x] Implementar entrevista curta e condicional.
- [x] Cadastrar unidades de monorepo.
- [x] Integrar runtime e padrão de engenharia ao contrato versionado de
      respostas.
- [x] Revisar respostas antes da geração.
- [x] Aceitar configuração JSON sem interação.

## Marco 5 — Escrita segura

- [x] Criar `GenerationPlan`.
- [x] Implementar `--dry-run` e detecção de conflitos.
- [x] Publicar arquivos atomicamente, validar caminhos e recuperar falhas
      observáveis conforme ADR-007.
- [x] Preservar arquivos existentes e cancelamentos antes da escrita.

## Marco 6 — Primeira versão pública 1.0.0

- [x] Documentar instalação para teste, uso e personalização disponível.
- [x] Expor seleção de perfil e sobrescritas locais pela CLI, com validação e
      compatibilidade, antes de anunciá-las como recurso da 1.0.0.
- [x] Configurar CI e matriz de Node.js.
- [x] Validar o pacote npm em diretório temporário.
- [x] Preparar changelog e procedimento de publicação.
- [x] Preparar metadados, documentação de uso público e política de upgrades.
- [x] Publicar a versão 1.0.0 no npm, mediante autorização.

## Prioridade principal — Aplicação das convenções após o bootstrap

**Causa observada:** no uso da CLI no portfólio hpndev, o bootstrap produziu a
documentação inicial, mas isso não garantiu que as convenções de engenharia
fossem aplicadas antes da implementação. O perfil já descreve parte das regras
em `ENGINEERING_TEMPLATE.md` e `AGENTS_TEMPLATE.md`; os testes atuais verificam
principalmente a presença de trechos, sem demonstrar a revisão do código e do
diff. Orientação escrita, isoladamente, não é um gate de execução.

**Escopo da entrega futura:** tornar explícito no perfil padrão o passo de ler
as convenções aplicáveis antes de codificar e de confrontá-las com cada arquivo
alterado antes da conclusão. Cobrir, quando a linguagem e o projeto permitirem,
conjuntos fechados em objetos `as const` com tipos derivados, condições de fluxo
nomeadas, separação entre constantes, conteúdo e regras, convenção de exports no
fim do módulo e matriz de revisão do diff. Registrar exceções justificadas, sem
impor essas convenções a linguagens ou projetos aos quais não se apliquem.

**Mudanças propostas para revisão:**

- [ ] Refinar os módulos de `templates/project/ENGINEERING_TEMPLATE.md` e
      `templates/project/AGENTS_TEMPLATE.md` com instruções operacionais antes
      da implementação e uma matriz explícita de regra, arquivos examinados,
      evidência e exceção. Tratar posição dos exports como convenção proposta a
      validar no padrão do projeto, pois ainda não está definida nos contratos
      atuais.
- [ ] Avaliar no perfil versionado como apresentar e permitir editar ou
      desabilitar convenções condicionais sem alterar silenciosamente respostas
      antigas. Não sobrescrever documentos já editados; disponibilizar diferenças
      para incorporação manual, conforme ADR-004 e ADR-006.
- [ ] Reforçar testes de contrato e cenários de geração para verificar instruções
      completas, aplicabilidade e ausência de instruções contraditórias; avaliar
      um gate estático para regras objetivamente detectáveis. Manter a matriz
      humana obrigatória para regras que exigem julgamento.

**Critérios de aceite:** um projeto novo com agentes habilitados recebe um
procedimento claro de leitura, implementação e revisão; cada convenção aplicável
tem evidência na matriz do diff ou exceção motivada; opções condicionais podem
ser ajustadas sem escolher stack pelo usuário; projetos existentes continuam
funcionando e seus documentos editados são preservados. A entrega identifica
quais verificações são automáticas e quais dependem de revisão humana.

**Validação planejada:** começar com testes que falhem pela ausência das
instruções e casos condicionais, atualizar templates/perfil, executar formatação,
lint, tipos, testes, build e `test:package`, inspecionar o tarball e gerar um
projeto de exemplo. Revisar o diff desse exemplo pela matriz, incluindo um caso
com exceção justificada e outro em que a convenção não se aplica.

## Depois desta prioridade — Licença e autoria

- [ ] Revisar a licença MIT publicada na versão 1.0.0, a atribuição de autoria
      no `LICENSE` e a consistência entre repositório, pacote npm e site.
- [ ] Definir, com decisão explícita do mantenedor, a estratégia para versões
      futuras: manter MIT, adotar outra licença para contribuições futuras ou
      separar licenças por componentes. Revisar a proposta no ADR-010 e registrar
      impactos para usuários atuais, contribuições de terceiros e eventual
      distribuição comercial.
- [ ] Definir e documentar a licença aplicável aos documentos gerados e às
      contribuições, sem presumir que a licença do código resolva esses casos.
- [ ] Implementar a decisão aprovada em uma entrega própria, com revisão do
      pacote distribuível e comunicação clara de qualquer mudança de licença.

## Depois da licença — Conteúdo em inglês

- [ ] Traduzir a página e sua documentação em drawer para inglês, mantendo
      português disponível e oferecendo seleção de idioma acessível.
- [ ] Oferecer specs e instruções geradas em inglês como opção explícita do
      perfil, preservando português como padrão para respostas antigas.
- [ ] Manter chaves e estados do schema independentes do idioma; versionar
      recursos alterados e testar os dois idiomas no pacote distribuível.
- [ ] Revisar perguntas da CLI e documentação de uso para que idioma de
      interface e idioma dos documentos sejam decisões claras para o usuário.

## Marco 7 — Geradores

- [ ] Criar manifesto declarativo de geradores.
- [ ] Implementar `generate adr`.
- [ ] Permitir receitas locais substituíveis.
- [ ] Adicionar presets técnicos versionados.
- [ ] Adicionar geradores de componentes, serviços e features.

## Marco 8 — Integrações opcionais com agentes

- [ ] Definir um contrato portável para integrações com agentes sem tornar um
      fornecedor obrigatório para o funcionamento da CLI.
- [ ] Criar uma Skill de setup que leia os documentos gerados, identifique
      lacunas relevantes e conduza o refinamento do projeto.
- [ ] Criar uma Skill de revisão que confronte código, documentação e padrões de
      engenharia aplicáveis.
- [ ] Criar uma Skill para avaliar decisões arquiteturais e gerar ADRs pelo
      contrato declarativo existente.
- [ ] Permitir que a CLI instale integrações compatíveis de forma opcional,
      mantendo `AGENTS.md` e os documentos como fontes portáveis de contexto.
- [ ] Garantir que Skills referenciem os contratos e templates existentes, sem
      manter uma segunda cópia das regras.
- [ ] Testar instalação, atualização e compatibilidade das integrações em um
      projeto gerado.

## Manutenção de releases

- [ ] Reavaliar os avisos de auditoria das ferramentas de desenvolvimento
      quando houver versões compatíveis corrigidas; manter zero avisos nas
      dependências distribuídas.
- [ ] Após a primeira publicação manual, preparar publicação opcional por
      trusted publishing com revisão e proveniência, sem token permanente.
