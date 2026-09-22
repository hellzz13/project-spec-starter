# ADR-004 — Tratar documentos como fonte de verdade após o bootstrap

- Status: Aceita
- Data: 2026-09-22

## Contexto

Depois da geração, pessoas e agentes refinam os documentos. Sincronização
automática com as respostas originais poderia apagar decisões posteriores.

## Decisão

O arquivo de respostas registra a entrevista inicial. Após o bootstrap, os
documentos editados são a fonte de verdade. O MVP não faz merge automático.

## Consequências

- Trabalho humano é preservado.
- Atualizações de perfil precisam apresentar diferenças para revisão manual.
- Regeneração integral não é o mecanismo padrão de manutenção.
