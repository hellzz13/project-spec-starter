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
- [ ] Criar migrações isoladas e fixtures representativas.

## Marco 3 — Motor documental

- [ ] Criar manifesto central de documentos.
- [ ] Criar perfil padrão e perguntas declarativas.
- [x] Construir o modelo documental intermediário.
- [ ] Renderizar todos os documentos em memória.
- [ ] Cobrir os cenários principais com snapshots e invariantes.

## Marco 4 — CLI interativa

- [ ] Implementar entrevista curta e condicional.
- [ ] Cadastrar unidades de monorepo.
- [ ] Revisar respostas antes da geração.
- [ ] Aceitar configuração JSON sem interação.

## Marco 5 — Escrita segura

- [ ] Criar `GenerationPlan`.
- [ ] Implementar `--dry-run` e detecção de conflitos.
- [ ] Garantir escrita atômica e caminhos seguros.
- [ ] Preservar arquivos existentes e cancelamentos limpos.

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
