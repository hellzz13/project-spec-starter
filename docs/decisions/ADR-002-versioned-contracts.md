# ADR-002 — Versionar schema, perfis e presets separadamente

- Status: Aceita
- Data: 2026-09-22

## Contexto

Respostas persistidas, conteúdo documental e receitas técnicas evoluem em
ritmos diferentes.

## Decisão

CLI, schema de respostas, perfil documental, módulos de perguntas e presets
técnicos terão versões independentes. Alterações estruturais terão migrações
explícitas.

## Consequências

- Projetos antigos podem ser interpretados de forma previsível.
- O perfil padrão pode melhorar sem exigir uma nova estrutura de respostas.
- Módulos de perguntas podem evoluir sem alterar templates ou reinterpretar
  respostas persistidas.
- A manutenção precisa testar combinações suportadas e caminhos de migração.
