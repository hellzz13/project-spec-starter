# Changelog

Mudanças relevantes do projeto são registradas por versão. Schema de respostas,
perfil e módulos de perguntas mantêm versões próprias, independentes da versão
da CLI.

## 0.1.0 — publicação pendente

Primeira versão do bootstrap documental.

### Recursos

- Entrevista curta e condicional para aplicação única ou monorepo, incluindo
  tipos personalizados, capacidades e decisões pendentes.
- Entrada por JSON versionado, com revisão do plano e modo `--dry-run`.
- Geração de documentos por perfil declarativo, com padrão de engenharia
  recomendado e `.nvmrc` quando Node.js é escolhido.
- Seleção de perfil local e sobrescritas de recursos por caminho relativo.
- Escrita segura: conflitos impedem a geração e arquivos existentes são
  preservados; falhas de escrita acionam recuperação dos arquivos criados.

### Compatibilidade

- A CLI requer Node.js 24 ou superior e usa npm.
- O schema de respostas inicial é `1`; o perfil padrão está na versão `2`.
- Documentos gerados e posteriormente editados são a fonte de verdade do
  projeto. A CLI não mescla nem sobrescreve esses documentos em nova execução.
- Geradores de código e integração opcional por Skills pertencem a marcos
  futuros e não fazem parte desta versão.
