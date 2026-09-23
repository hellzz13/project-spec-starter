# ADR-001 — Separar domínio, casos de uso e adaptadores

- Status: Aceita
- Data: 2026-09-22

## Contexto

A CLI precisa evoluir sem acoplar regras de geração à biblioteca de prompts,
filesystem, renderizador ou framework de argumentos.

## Decisão

Separar domínio, aplicação, portas, adaptadores e entrada da CLI. O domínio não
depende de APIs concretas de terminal ou filesystem.

O modelo documental pertence à aplicação e permanece neutro quanto a formato e
idioma. A renderização concreta implementa uma porta em adaptadores e recebe o
template selecionado pelo perfil.

## Consequências

- Bibliotecas externas podem ser substituídas por adaptador.
- Casos de uso são testáveis sem terminal ou disco real.
- Templates e renderizadores podem mudar sem alterar domínio ou aplicação.
- A estrutura inicial exige contratos claros e evita atalhos entre camadas.
