# Checklist de inicialização — [NOME_DO_PROJETO]

Use esta sequência para preparar um projeto novo. Marque cada item somente após
registrar a decisão ou evidência correspondente.

## 1. Descoberta

- [ ] Definir problema, público, proposta de valor e hipóteses em
      `PROJECT_TEMPLATE.md`.
- [ ] Delimitar incluído, não incluído, restrições e critérios de sucesso.
- [ ] Identificar atores, permissões e regras iniciais em
      `BUSINESS_RULES_TEMPLATE.md`.
- [ ] Listar riscos, dependências e perguntas pendentes.

## 2. Documentação

- [ ] Copiar e preencher `PROJECT_TEMPLATE.md`.
- [ ] Copiar e preencher `ENGINEERING_TEMPLATE.md`.
- [ ] Copiar e preencher `BUSINESS_RULES_TEMPLATE.md`.
- [ ] Copiar e preencher `GITFLOW_TEMPLATE.md`.
- [ ] Criar `AGENTS.md` a partir de `AGENTS_TEMPLATE.md`.
- [ ] Criar `CONTRIBUTING.md` a partir de `CONTRIBUTING_TEMPLATE.md`.
- [ ] Usar `DECISION_RECORD_TEMPLATE.md` para criar um ou mais ADRs em
      `docs/decisions/`.
- [ ] Preencher `ENVIRONMENTS_TEMPLATE.md`.
- [ ] Renomear os templates para os destinos definitivos documentados no
      `README.md` antes de iniciar as etapas seguintes.
- [ ] Revisar todas as referências internas após a renomeação.
- [ ] Remover exemplos e marcadores não aplicáveis.

## 3. Stack e estrutura

- [ ] Escolher linguagem, interface, API, persistência, testes e hospedagem.
- [ ] Registrar escolhas e alternativas no documento de engenharia.
- [ ] Escolher monorepo ou aplicação única com justificativa.
- [ ] Definir fronteiras, dependências e convenções de pastas.
- [ ] Definir critérios de componentização e promoção de componentes.
- [ ] Definir política para `index`, `types`, `constants` e testes.

## 4. Repositório e fluxo

- [ ] Criar repositório privado ou público conforme a decisão registrada.
- [ ] Definir branch de produção e branch de integração.
- [ ] Configurar prefixes de feature, correção e urgência.
- [ ] Configurar revisão, checks, merge, limpeza e rollback.
- [ ] Confirmar que a branch inicial está alinhada ao
      `docs/GITFLOW.md`.

## 5. Ferramentas locais

- [ ] Fixar `[GERENCIADOR_DE_PACOTES]` e criar o lockfile correspondente.
- [ ] Quando Node.js for escolhido, criar `.nvmrc` e alinhar sua versão com
      `package.json#engines.node`, CI e documentação.
- [ ] Configurar formatação em `[COMANDO_DE_FORMAT]`.
- [ ] Configurar lint em `[COMANDO_DE_LINT]`.
- [ ] Configurar typecheck em `[COMANDO_DE_TYPECHECK]`.
- [ ] Configurar testes em `[COMANDO_DE_TESTES]`.
- [ ] Configurar build em `[COMANDO_DE_BUILD]`.
- [ ] Configurar hooks locais sem usar bypass como fluxo normal.

## 6. Testes e qualidade

- [ ] Criar um teste de exemplo para o primeiro comportamento.
- [ ] Definir testes unitários, integração, contrato, acessibilidade e smoke
      conforme o risco.
- [ ] Definir critérios para cobertura e testes flaky.
- [ ] Confirmar que a Definition of Done está preenchida no documento de
      engenharia.

## 7. CI

- [ ] Rodar format, lint, typecheck, testes e build em pull requests.
- [ ] Configurar auditoria de dependências e política de atualização.
- [ ] Aplicar permissões mínimas aos jobs.
- [ ] Impedir que logs exibam segredos ou dados sensíveis.
- [ ] Registrar quais checks bloqueiam merge.

## 8. Segurança e privacidade

- [ ] Definir classificação, retenção e exclusão dos dados.
- [ ] Configurar variáveis em mecanismo seguro, nunca no repositório.
- [ ] Separar credenciais por ambiente.
- [ ] Definir autorização, menor privilégio e auditoria.
- [ ] Definir procedimento para exposição e rotação de credenciais.

## 9. Ambientes e deploy

- [ ] Preencher `docs/ENVIRONMENTS.md` com placeholders, sem valores reais.
- [ ] Criar ambiente local reproduzível.
- [ ] Definir preview e homologação, incluindo isolamento de dados.
- [ ] Configurar deploy de produção com aprovação adequada.
- [ ] Definir migrations, backup, health check, smoke test e rollback.
- [ ] Configurar observabilidade e responsáveis por incidentes.

## 10. Primeira entrega

- [ ] Selecionar um fluxo vertical pequeno e observável.
- [ ] Escrever regras e critérios de aceite.
- [ ] Implementar com teste antes do código.
- [ ] Validar acessibilidade, estados de loading, vazio e erro.
- [ ] Executar todos os gates definidos.
- [ ] Abrir revisão na branch correta.
- [ ] Validar o ambiente de preview ou homologação.
- [ ] Atualizar documentação e decisões.

## Critérios de pronto do bootstrap

- [ ] Uma pessoa nova consegue entender o problema e o escopo.
- [ ] As regras de produto estão separadas das decisões técnicas.
- [ ] A estrutura e a direção de dependências estão documentadas.
- [ ] O fluxo de branches e os ambientes são reproduzíveis.
- [ ] Os gates automatizados executam sem depender de segredos locais.
- [ ] Existe um caminho documentado para rollback e recuperação.
