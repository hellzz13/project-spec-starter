# ADR-009 — Estabilizar o contrato público na primeira versão

- Status: Aceita
- Data: 2026-11-01

## Contexto

A primeira publicação cria um contrato com projetos que não controlamos.
Atualizar a CLI não pode exigir regeneração nem sobrescrever documentos editados.
O número da versão do pacote não substitui as versões do schema de respostas,
perfil e módulos de perguntas definidas no ADR-002.

## Decisão

A primeira versão pública do bootstrap documental será `1.0.0`. Seu contrato
inclui o comando `init`, suas opções documentadas, o schema de respostas aceito,
o formato versionado dos perfis e a preservação dos arquivos existentes.
Geradores e integrações opcionais com agentes permanecem fora desta versão.

Após a publicação, mudanças compatíveis usam versão `patch` para correções e
`minor` para recursos aditivos. Mudanças incompatíveis do contrato público usam
versão `major`, mesmo que o schema ou perfil tenham versionamento próprio.
Campos novos têm defaults seguros ou são opcionais; mudanças estruturais exigem
migração explícita, testes com entradas antigas e instruções no changelog.

A CLI não atualiza documentos editados automaticamente. Novas versões podem
gerar projetos novos com templates melhores, enquanto projetos já gerados
continuam válidos sem migração forçada. O usuário escolhe quando adotar uma
versão nova; exemplos de uso reproduzível fixam a versão do pacote.

## Consequências

- Cada release atualiza `package.json`, lockfile e changelog e valida o tarball.
- Releases documentam impacto sobre projetos existentes, schemas, perfis e
  opções da CLI.
- Uma versão publicada não é reescrita; correções recebem outra versão.
- Os geradores futuros entram de forma aditiva, sem mudar o comportamento de
  `init` para projetos existentes.
