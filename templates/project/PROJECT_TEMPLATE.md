# [NOME_DO_PROJETO]

> Documento de contexto do produto. Substitua os marcadores e remova as
> orientações antes de considerar o documento final.

## Visão

### Problema

- Qual problema está sendo resolvido?
- Para quem ele existe?
- Em qual contexto ele ocorre?

### Proposta de valor

`[Descreva, em uma frase, qual resultado o projeto entrega e para quem.]`

### Hipóteses

| Hipótese   | Evidência esperada | Como validar  | Status                      |
| ---------- | ------------------ | ------------- | --------------------------- |
| [Hipótese] | [Sinal observável] | [Experimento] | [Aberta/validada/rejeitada] |

## Usuários e cenários

| Perfil   | Necessidade   | Cenário principal | Fora do escopo |
| -------- | ------------- | ----------------- | -------------- |
| [Perfil] | [Necessidade] | [Cenário]         | [Limite]       |

## Escopo

### Incluído

- [Capacidade ou fluxo]
- [Capacidade ou fluxo]

### Não incluído

- [Capacidade explicitamente adiada]
- [Capacidade fora do produto]

### Restrições

- [Prazo, orçamento, regulamentação ou dependência]

## Requisitos

### Requisitos funcionais

- `RF-001` — [O sistema deve ...]
- `RF-002` — [O sistema deve ...]

### Requisitos não funcionais

- `RNF-001` — [Disponibilidade, desempenho ou escala]
- `RNF-002` — [Privacidade, segurança ou retenção]
- `RNF-003` — [Acessibilidade e compatibilidade]

### Critérios de aceite

```text
Dado [contexto]
Quando [ação]
Então [resultado esperado]
E [restrição ou resultado adicional]
```

## Arquitetura

### Visão de alto nível

```text
[Cliente] -> [Interface/API] -> [Serviço de aplicação] -> [Persistência]
                                  -> [Integrações externas]
```

### Componentes

| Componente   | Responsabilidade   | Interface  | Dono          |
| ------------ | ------------------ | ---------- | ------------- |
| [Componente] | [Responsabilidade] | [Contrato] | [Time/pessoa] |

### Dados e integrações

- Dados principais: `[entidades ou recursos]`.
- Fonte de verdade: `[sistema ou componente]`.
- Integrações externas: `[integração, finalidade e escopo]`.
- Retenção e exclusão: `[política aplicável]`.

### Decisões arquiteturais

| ID        | Decisão   | Contexto                 | Alternativas       | Data         |
| --------- | --------- | ------------------------ | ------------------ | ------------ |
| `ADR-001` | [Decisão] | [Por que foi necessária] | [Opções avaliadas] | [AAAA-MM-DD] |

## Marcos de entrega

| Marco        | Resultado   | Entregáveis | Critério de conclusão | Status      |
| ------------ | ----------- | ----------- | --------------------- | ----------- |
| 0 — Fundação | [Resultado] | [Itens]     | [Critério]            | [Planejado] |
| 1 — [Nome]   | [Resultado] | [Itens]     | [Critério]            | [Planejado] |

## Critérios de sucesso

| Resultado   | Métrica   | Meta   | Fonte   | Janela    |
| ----------- | --------- | ------ | ------- | --------- |
| [Resultado] | [Métrica] | [Meta] | [Fonte] | [Período] |

## Riscos e dependências

| Risco ou dependência | Probabilidade      | Impacto            | Mitigação | Responsável   |
| -------------------- | ------------------ | ------------------ | --------- | ------------- |
| [Item]               | [Baixa/Média/Alta] | [Baixo/Médio/Alto] | [Ação]    | [Responsável] |

## Backlog

### Próximos itens

- `[P0]` [Item com resultado esperado]
- `[P1]` [Item com resultado esperado]

### Melhorias futuras

- [Item que depende de aprendizado ou escala]

### Decisões pendentes

- [Pergunta, opções e pessoa responsável pela decisão]

## Histórico de alterações

| Data         | Alteração   | Motivo   | Autor   |
| ------------ | ----------- | -------- | ------- |
| [AAAA-MM-DD] | [Alteração] | [Motivo] | [Autor] |
