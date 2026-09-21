# Regras de negócio — [NOME_DO_PROJETO]

Este documento é a fonte de verdade para comportamentos do produto. Escreva
regras observáveis, independentes de framework e acompanhadas de exemplos.

## Convenções

- Cada regra recebe um identificador estável.
- Diferenciar regra de negócio, requisito de interface e decisão técnica.
- Registrar permissões, pré-condições, efeitos e casos-limite.
- Definir o que acontece quando uma informação está ausente, inválida ou antiga.
- Atualizar os exemplos quando a regra mudar.

## Glossário

| Termo   | Definição               | Sinônimos proibidos ou ambíguos |
| ------- | ----------------------- | ------------------------------- |
| [Termo] | [Definição operacional] | [Termos]                        |

## Atores e permissões

| Ator   | Pode fazer | Não pode fazer | Condição   |
| ------ | ---------- | -------------- | ---------- |
| [Ator] | [Ação]     | [Ação]         | [Condição] |

## Entidades e estados

| Entidade   | Estado   | Entrada permitida | Saída permitida   | Efeitos  |
| ---------- | -------- | ----------------- | ----------------- | -------- |
| [Entidade] | [Estado] | [Evento]          | [Estado seguinte] | [Efeito] |

```text
[estado inicial] -> [evento] -> [estado seguinte]
                         \
                          -> [erro ou rejeição]
```

## Catálogo de regras

### `[BR-001] [Nome curto da regra]`

- Intenção: `[Por que esta regra existe]`.
- Escopo: `[Onde se aplica]`.
- Pré-condições: `[O que precisa ser verdade]`.
- Regra: `[Comportamento obrigatório]`.
- Resultado de sucesso: `[Estado ou resposta]`.
- Resultado de erro: `[Resposta e mensagem segura]`.
- Autorização: `[Quem pode executar]`.
- Persistência/eventos: `[Efeitos]`.

#### Exemplos

| Contexto            | Ação   | Resultado esperado |
| ------------------- | ------ | ------------------ |
| [Contexto válido]   | [Ação] | [Resultado]        |
| [Contexto inválido] | [Ação] | [Erro]             |

#### Casos-limite

- `[Caso-limite]` → `[Comportamento]`.

## Regras de cálculo

| Identificador | Fórmula ou algoritmo | Arredondamento | Exemplo                 |
| ------------- | -------------------- | -------------- | ----------------------- |
| `[BR-XXX]`    | `[Fórmula]`          | `[Regra]`      | `[Valores e resultado]` |

```text
[variável] = [fórmula descrita em linguagem neutra]
```

## Validade temporal e fuso

- Referência temporal: `[UTC, fuso do usuário, fuso do recurso]`.
- Início e fim do período: `[Definição]`.
- Dados atrasados ou futuros: `[Política]`.
- Mudança de fuso ou horário de verão: `[Comportamento]`.

## Erros e feedback

| Código interno | Situação   | Mensagem para usuário | Ação de recuperação |
| -------------- | ---------- | --------------------- | ------------------- |
| `[ERR-001]`    | [Situação] | [Mensagem clara]      | [Ação]              |

Mensagens não devem revelar credenciais, detalhes internos ou dados de outras
pessoas.

## Privacidade e retenção

- Dados coletados: `[Dados]`.
- Finalidade: `[Finalidade]`.
- Visibilidade: `[Quem pode consultar]`.
- Retenção: `[Prazo ou evento de exclusão]`.
- Exportação e exclusão: `[Como atender solicitações]`.

## Regras pendentes

| Pergunta   | Opções   | Impacto   | Responsável   | Prazo        |
| ---------- | -------- | --------- | ------------- | ------------ |
| [Pergunta] | [Opções] | [Impacto] | [Responsável] | [AAAA-MM-DD] |

## Histórico

| Data         | Regra afetada | Alteração   | Motivo   | Autor   |
| ------------ | ------------- | ----------- | -------- | ------- |
| [AAAA-MM-DD] | `[BR-XXX]`    | [Alteração] | [Motivo] | [Autor] |
