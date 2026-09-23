# ADR-001 — Separar domínio, casos de uso e adaptadores

- Status: Aceita
- Data: 2026-09-22

## Contexto

A CLI precisa evoluir sem acoplar regras de geração à biblioteca de prompts,
filesystem, renderizador ou framework de argumentos.

## Decisão

Separar domínio, aplicação, portas, adaptadores e entrada da CLI. O domínio não
depende de APIs concretas de terminal ou filesystem.

## Consequências

- Bibliotecas externas podem ser substituídas por adaptador.
- Casos de uso são testáveis sem terminal ou disco real.
- A estrutura inicial exige contratos claros e evita atalhos entre camadas.
