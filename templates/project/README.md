# Pacote de documentação para novos projetos

Este diretório contém modelos neutros para iniciar um projeto com contexto,
regras técnicas, fluxo de entrega e decisões registradas. Os arquivos foram
separados para que a documentação de produto possa ser compartilhada sem
carregar regras, dados ou decisões de um projeto de origem.

## Como usar

1. Copie os nove modelos para a documentação do novo projeto.
2. Substitua os marcadores entre colchetes, como `[NOME_DO_PROJETO]`.
3. Remova seções que não se aplicarem e registre decisões em vez de deixar
   alternativas ambíguas.
4. Preencha primeiro `PROJECT_TEMPLATE.md` e `BUSINESS_RULES_TEMPLATE.md`.
5. Registre escolhas em `DECISION_RECORD_TEMPLATE.md` antes de fechar decisões
   de produto, arquitetura ou operação.
6. Use `ENGINEERING_TEMPLATE.md` para padrões técnicos e
   `GITFLOW_TEMPLATE.md` para branches, ambientes e promoção.
7. Complete `ENVIRONMENTS_TEMPLATE.md` antes de configurar deploy ou dados.
8. Use `CONTRIBUTING_TEMPLATE.md` para orientar colaboradores humanos e
   `AGENTS_TEMPLATE.md` como instrução para agentes de desenvolvimento.
9. Siga `BOOTSTRAP_CHECKLIST.md` para preparar o repositório e a primeira
   entrega.
10. Revise os documentos junto com o time antes da primeira implementação.

## Princípios

- A visão e as regras do produto pertencem ao projeto que usar os modelos.
- Uma tecnologia citada como opção não é uma obrigação.
- Toda decisão relevante deve registrar contexto, responsável e data.
- Segredos, tokens, URLs privadas, identificadores e dados pessoais nunca
  devem ser preenchidos na documentação versionada.

## Arquivos

- `PROJECT_TEMPLATE.md`: contexto, escopo, requisitos, arquitetura, marcos,
  sucesso, riscos e backlog.
- `ENGINEERING_TEMPLATE.md`: padrões de implementação, qualidade, segurança,
  acessibilidade, testes e definição de pronto.
- `BUSINESS_RULES_TEMPLATE.md`: estrutura para regras, exemplos, estados,
  permissões e casos-limite.
- `GITFLOW_TEMPLATE.md`: fluxo configurável de branches, revisão, ambientes e
  promoção.
- `AGENTS_TEMPLATE.md`: instruções neutras para agentes de desenvolvimento.
- `DECISION_RECORD_TEMPLATE.md`: registro reutilizável de decisões técnicas e
  de produto.
- `ENVIRONMENTS_TEMPLATE.md`: matriz de ambientes, dados, deploy e rollback.
- `BOOTSTRAP_CHECKLIST.md`: checklist sequenciado para iniciar um projeto.
- `CONTRIBUTING_TEMPLATE.md`: instruções neutras para colaboradores humanos.

## Destino recomendado após copiar

Os arquivos com sufixo `_TEMPLATE` são modelos. Depois de copiar e preencher,
renomeie-os conforme a tabela abaixo; os documentos renomeados passam a ser a
fonte de verdade do projeto. Atualize todas as referências internas para os
nomes definitivos.

| Modelo                        | Destino recomendado                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `PROJECT_TEMPLATE.md`         | `PROJECT.md`                                                                                       |
| `ENGINEERING_TEMPLATE.md`     | `docs/ENGINEERING.md`                                                                              |
| `BUSINESS_RULES_TEMPLATE.md`  | `docs/BUSINESS_RULES.md`                                                                           |
| `GITFLOW_TEMPLATE.md`         | `docs/GITFLOW.md`                                                                                  |
| `ENVIRONMENTS_TEMPLATE.md`    | `docs/ENVIRONMENTS.md`                                                                             |
| `AGENTS_TEMPLATE.md`          | `AGENTS.md`                                                                                        |
| `CONTRIBUTING_TEMPLATE.md`    | `CONTRIBUTING.md`                                                                                  |
| `DECISION_RECORD_TEMPLATE.md` | `docs/decisions/ADR-XXX-titulo.md` para cada decisão                                               |
| `BOOTSTRAP_CHECKLIST.md`      | `docs/BOOTSTRAP_CHECKLIST.md`; pode ser arquivado ou removido após o bootstrap conforme a política |

Após a renomeação, referências como `PROJECT_TEMPLATE.md` devem apontar para
`PROJECT.md`, e referências aos demais templates devem apontar para seus
destinos definitivos.

## Manutenção

Este pacote é um ponto de partida. Cada projeto deve adaptar os modelos às suas
necessidades e manter as decisões específicas em seus próprios documentos.
