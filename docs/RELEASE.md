# Preparação e publicação de versões

A publicação no npm exige autorização explícita após revisão do pacote. A
primeira versão pública é `1.0.0`; as próximas seguem a política do ADR-009.
O primeiro envio é manual. Automação com trusted publishing pode ser adicionada
em um PR posterior, sem guardar token de publicação no repositório.

## Antes de publicar

1. Confirmar que `main` contém o PR revisado e não há mudanças locais.
2. Conferir a mesma versão em `package.json`, `package-lock.json` e
   `CHANGELOG.md`. Schema, perfil e perguntas mantêm versões independentes.
3. Executar `nvm use`, `npm ci`, `npm run format:check`, `npm run lint`,
   `npm run typecheck`, `npm test`, `npm run build` e `npm run test:package`.
   Conferir os checks do PR em Node.js 24 e 26.
4. Executar `npm pack --dry-run --json` e conferir executável, perfil,
   perguntas, templates, README, licença e changelog. Verificar que não há
   credenciais, dados privados ou arquivos locais inesperados.
5. Executar `npm audit --omit=dev` para as dependências distribuídas. Avaliar
   separadamente os avisos das ferramentas de desenvolvimento; não aplicar
   `npm audit fix --force` sem revisar o impacto nos gates.
6. Revisar manualmente as regras aplicáveis de `docs/ENGINEERING.md`, segurança
   de caminhos, compatibilidade de respostas antigas, opções da CLI e
   preservação de documentos existentes.
7. Confirmar `npm whoami`, a disponibilidade e a titularidade do nome no
   registro. A primeira publicação exige conta com e-mail verificado e 2FA.

## Publicação manual

Depois da autorização específica para o nome e a versão, executar `npm publish`
no commit revisado. A autenticação deve ocorrer diretamente no npm; nunca
registrar senhas, tokens ou códigos de recuperação em arquivos ou logs.

Conferir `npm view project-spec-starter version` e instalar a versão do registro
em um diretório temporário. Validar `--help`, `--version`, `init --dry-run` e
geração antes de anunciar o comando público. Depois da verificação, criar a tag
`vX.Y.Z` no commit publicado e registrar a release no GitHub.

Se a publicação falhar, consultar o registro antes de tentar novamente para
detectar um envio parcial. Uma combinação de nome e versão publicada não pode
ser reutilizada; uma correção recebe nova versão.

## Próximas versões

Abrir um PR por release com versão, changelog, impacto de compatibilidade e
validação do tarball. Usar uma versão explícita, como
`npx project-spec-starter@1.0.0 init`, quando a reprodução exata importar.
O comando sem versão usa a versão associada à tag `latest` do npm.
