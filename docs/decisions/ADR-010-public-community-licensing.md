# ADR-010 — Manter a base pública para contribuições

- Status: Proposta
- Data: 2026-11-01

## Contexto

O código e a documentação do project-spec-starter 1.0.0 já foram publicados
sob MIT no GitHub e no npm. O projeto começou a atrair interesse externo. O
mantenedor quer preservar a identificação de autoria, receber contribuições e
avaliar futuras skills ou ofertas complementares.

## Proposta

Manter o repositório principal público e a licença MIT para a base atual. Usar
o repositório como referência de portfólio e ponto de colaboração. Explicitar
o fluxo de contribuição e registrar créditos no histórico de commits e PRs.

Avaliar skills e outros produtos como entregas próprias quando tiverem escopo e
valor definidos. Não restringir retroativamente a versão 1.0.0 nem supor que
tornar o repositório privado retire os direitos já concedidos por sua licença.

Antes de decidir sobre licenças diferentes para componentes futuros, revisar a
titularidade e as contribuições recebidas. Definir separadamente a política
para documentos gerados pela CLI e a forma de atribuição no aviso de copyright.

## Alternativas consideradas

| Alternativa                                       | Impacto principal                                                                              |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Tornar o repositório privado                      | Reduz a descoberta e a colaboração; não altera a licença já concedida para a versão publicada. |
| Criar somente uma edição básica pública           | Exige definir e manter uma fronteira de produto antes de haver demanda demonstrada.            |
| Manter a base pública e criar complementos depois | Preserva adoção e contribuições, com liberdade para experimentar entregas separadas.           |

## Pendências para aceitação

- Confirmar a estratégia de licença para contribuições futuras.
- Decidir como identificar a autoria no `LICENSE`, considerando os direitos de
  quem já contribuiu ou venha a contribuir.
- Definir a política de licença dos documentos gerados pela CLI.
