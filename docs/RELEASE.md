# Preparação e publicação da versão 0.1.0

Este procedimento separa validação local de publicação no npm. A publicação
exige autorização explícita e só deve ocorrer após revisão do PR de release.

## Antes de publicar

1. Confirmar que `main` contém a versão desejada e não há mudanças locais.
2. Conferir `package.json`, `package-lock.json` e `CHANGELOG.md` para a mesma
   versão de CLI. Versões de schema, perfil e perguntas são contratos separados.
3. Executar `npm ci`, formatação, lint, typecheck, testes, build e
   `npm run test:package` em Node.js 24. Conferir os checks do PR em Node.js 24
   e 26.
4. Inspecionar o tarball com `npm pack --dry-run` e confirmar executável,
   perfil, perguntas, templates, README, licença e changelog. Verificar que não
   há credenciais, dados privados ou arquivos locais inesperados.
5. Revisar manualmente as regras aplicáveis de `docs/ENGINEERING.md`, segurança
   dos caminhos, compatibilidade das respostas antigas e preservação dos
   documentos existentes.
6. Confirmar a disponibilidade e a titularidade do nome do pacote no registro
   npm antes da primeira publicação. Resolver qualquer divergência de nome em
   um PR próprio, com novo teste do tarball.

## Passo externo

Depois da autorização específica para publicar, publicar o tarball validado no
registro npm usando as credenciais seguras do mantenedor. Não registrar tokens
em arquivos ou logs. Conferir a versão e o comando instalado a partir do
registro antes de anunciar `npx project-spec-starter init` como forma pública
de uso.

Caso a publicação apresente erro, verificar se houve publicação parcial antes
de tentar novamente. Versões já publicadas não são reescritas; uma correção
recebe uma nova versão.
