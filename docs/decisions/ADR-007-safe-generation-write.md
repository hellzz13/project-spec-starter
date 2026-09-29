# ADR-007 — Publicação exclusiva com recuperação da geração

- Status: Aceita
- Data: 2026-09-28

## Contexto

O plano contém múltiplos documentos. O filesystem não oferece uma transação
atômica para publicar todos em um diretório que pode conter trabalho humano.
Renomear arquivos diretamente pode sobrescrever destinos criados após o preview.

## Decisão

A geração interativa exige confirmação após a apresentação do plano. Conflitos
bloqueiam toda a operação; `--dry-run` apenas inspeciona. O adaptador prepara os
conteúdos em um diretório temporário no mesmo filesystem, revalida destinos e
publica cada arquivo por criação exclusiva de hard link, sem sobrescrita.

Falhas acionam recuperação dos arquivos publicados pela operação. A identidade
dos arquivos é verificada antes da remoção para preservar substituições externas.
Falhas na recuperação são informadas explicitamente, sem anunciar conclusão.

## Consequências

- Não há novas dependências nem mudanças no schema ou nos documentos já gerados.
- A publicação de cada arquivo é atômica, mas o conjunto não é uma transação.
- Filesystems sem suporte a hard links falham e acionam recuperação.
- Encerramento abrupto e alterações concorrentes de diretórios podem impedir a
  recuperação; o destino deve permanecer sem mutações externas durante a geração.
- Validação de links simbólicos reduz riscos, mas não promete proteção contra
  um processo hostil que troque diretórios entre validação e publicação.
