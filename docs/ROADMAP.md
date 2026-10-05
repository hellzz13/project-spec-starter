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
- [ ] Aceitar configuração JSON sem interação.

## Marco 5 — Escrita segura

- [x] Criar `GenerationPlan`.
- [x] Implementar `--dry-run` e detecção de conflitos.
- [x] Publicar arquivos atomicamente, validar caminhos e recuperar falhas
      observáveis conforme ADR-007.
- [x] Preservar arquivos existentes e cancelamentos antes da escrita.

## Marco 6 — Versão 0.1.0

- [ ] Documentar instalação, uso e personalização.
- [ ] Configurar CI e matriz de Node.js.
- [ ] Validar o pacote npm em diretório temporário.
- [ ] Preparar changelog e publicação, mediante autorização.

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
