# Fluxo de entrega — project-spec-starter

## Branches

- `main` é a branch estável e base das entregas.
- Trabalho comum usa branches `feature/*`, `fix/*` ou `docs/*`.
- Correções urgentes podem usar `hotfix/*` quando o projeto estiver publicado.

Enquanto o projeto tiver poucos mantenedores, não haverá branch permanente de
integração. Essa decisão deve ser revista caso volume de mudanças ou cadência de
release justifiquem uma segunda branch permanente.

## Fluxo comum

```text
main -> branch temporária -> testes e revisão -> main
```

1. Criar a branch a partir de `main` atualizada.
2. Implementar mudanças pequenas e coerentes.
3. Executar os gates aplicáveis.
4. Revisar compatibilidade de schema, perfis e documentos.
5. Abrir pull request contra `main`.
6. Fazer merge somente depois dos checks e da revisão exigida.
7. Excluir a branch temporária após o merge.

## Commits

Usar mensagens orientadas à mudança, preferencialmente no formato Conventional
Commits:

```text
feat: add project capability model
fix: preserve files when generation conflicts
docs: record profile versioning decision
```

## Revisão

Uma revisão deve verificar:

- Comportamento observável e casos de erro.
- Testes novos ou atualizados.
- Compatibilidade com configurações anteriores.
- Segurança de caminhos e preservação de arquivos.
- Ausência de tecnologia imposta pelo perfil padrão.
- Documentação e ADRs afetados.
- Conteúdo do pacote npm quando templates ou perfis mudarem.
- Matriz entre regras aplicáveis de `docs/ENGINEERING.md` e arquivos alterados,
  incluindo verificações manuais que não estejam cobertas por lint ou testes.

## Releases

- Versões seguem versionamento semântico.
- Mudanças do schema e do perfil são registradas no changelog.
- Releases validam o pacote empacotado em um diretório temporário.
- Publicação no npm exige autorização explícita até que exista um processo de
  release aprovado.

## CI planejada

Pull requests executarão formatação, lint, typecheck, testes e build. Releases
também validarão o conteúdo do pacote e uma execução completa da CLI instalada
a partir do artefato.
