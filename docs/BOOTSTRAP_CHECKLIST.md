# Checklist de bootstrap — project-spec-starter

## Especificação

- [x] Definir problema, público, escopo e critérios de sucesso.
- [x] Separar produto, negócio, engenharia, colaboração e operação.
- [x] Registrar arquitetura, versionamento e estratégia de geração em ADRs.
- [x] Definir a política de delegação para modelos mais econômicos.
- [x] Remover referências específicas ao projeto de origem.

## Fundação técnica

- [x] Confirmar Node.js 22 como versão mínima suportada.
- [x] Inicializar o pacote npm e criar `package-lock.json`.
- [x] Configurar TypeScript e build do executável.
- [ ] Escolher ferramentas de argumentos, prompts, validação e templates.
- [x] Configurar formatação, lint, typecheck e Vitest.

## Primeiro comportamento

- [ ] Criar fixture mínima de respostas válidas.
- [ ] Escrever teste para a geração de `PROJECT.md` em memória.
- [ ] Confirmar a falha inicial pelo motivo correto.
- [ ] Implementar schema, normalização e modelo documental mínimos.
- [ ] Implementar a menor renderização que passe no teste.
- [ ] Validar ausência de marcadores não resolvidos.

## Qualidade e distribuição

- [ ] Cobrir os cenários definidos no roadmap.
- [ ] Testar conflito, cancelamento, dry-run e escrita atômica.
- [ ] Configurar CI com permissões mínimas.
- [ ] Testar o conteúdo do pacote npm empacotado.
- [ ] Documentar instalação, uso, perfis e sobrescritas locais.

## Critério de conclusão

- [ ] Uma pessoa consegue concluir o bootstrap pela entrevista mínima.
- [ ] Entrada interativa e JSON produzem o mesmo plano.
- [ ] Projetos conhecidos e personalizados geram documentos coerentes.
- [ ] O agente consegue identificar fontes de verdade e pendências.
- [ ] Arquivos existentes e configurações antigas são preservados.
