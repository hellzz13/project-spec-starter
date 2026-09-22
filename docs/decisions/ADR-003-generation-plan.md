# ADR-003 — Planejar a geração antes de escrever

- Status: Aceita
- Data: 2026-09-22

## Contexto

Geração direta pode deixar arquivos parciais, esconder conflitos e tornar
`--dry-run` diferente da execução real.

## Decisão

Toda operação produz primeiro um `GenerationPlan` completo. Revisão, dry-run e
escrita usam o mesmo plano validado.

## Consequências

- Conflitos e caminhos inseguros são detectados antes da escrita.
- Testes podem avaliar o resultado sem modificar o disco.
- A implementação precisa manter o plano imutável durante a execução.
