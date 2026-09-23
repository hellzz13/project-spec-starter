# Ambientes e operação — [NOME_DO_PROJETO]

Preencha esta matriz sem colocar URLs reais, credenciais, tokens ou dados
sensíveis no repositório. Use placeholders e aponte para o mecanismo seguro que
guarda os valores reais.

## Matriz de ambientes

| Ambiente    | Branch/evento | URL pública         | Dados                    | Acesso                   | Isolamento        |
| ----------- | ------------- | ------------------- | ------------------------ | ------------------------ | ----------------- |
| Local       | `[Evento]`    | `[URL_LOCAL]`       | `[Fixtures locais]`      | `[Equipe]`               | `[Total/Parcial]` |
| Preview     | `[Evento]`    | `[URL_PREVIEW]`     | `[Dados controlados]`    | `[Revisores]`            | `[Total/Parcial]` |
| Homologação | `[Evento]`    | `[URL_HOMOLOGACAO]` | `[Dados não produtivos]` | `[Equipe]`               | `[Total]`         |
| Produção    | `[Evento]`    | `[URL_PRODUCAO]`    | `[Dados reais]`          | `[Usuários autorizados]` | `[Total]`         |

## Configuração por ambiente

| Ambiente     | Variáveis necessárias    | Onde ficam os segredos | Dono            |
| ------------ | ------------------------ | ---------------------- | --------------- |
| `[Ambiente]` | `[Nomes, nunca valores]` | `[Gerenciador seguro]` | `[Responsável]` |

- Arquivos de exemplo devem conter somente nomes e valores fictícios seguros.
- Variáveis públicas precisam ser explicitamente classificadas como públicas.
- Credenciais de produção nunca são reutilizadas em ambientes inferiores.
- Rotacione e revogue credenciais conforme `[POLITICA_DE_ROTACAO]`.

## Runtime e reprodutibilidade

- Runtime: `[RUNTIME ou Não se aplica]`.
- Versão suportada: `[VERSAO]`.
- Arquivo de versão: `[ARQUIVO ou Não se aplica]`.
- Matriz de CI: `[VERSOES_TESTADAS]`.

Quando o projeto usar Node.js, `.nvmrc`, `package.json#engines.node`, imagens de
CI e documentação devem indicar versões compatíveis.

## Deploy

| Ambiente     | Gatilho               | Processo                     | Aprovação     | Janela     |
| ------------ | --------------------- | ---------------------------- | ------------- | ---------- |
| `[Ambiente]` | `[Branch/tag/manual]` | `[Pipeline ou procedimento]` | `[Aprovador]` | `[Janela]` |

Documente artefato, versão, permissões mínimas e como identificar o commit
publicado. Mudanças manuais devem ser registradas e reproduzíveis.

## Banco e migrations

- Fonte de verdade: `[Repositório ou ferramenta]`.
- Execução local: `[Comando]`.
- Execução em homologação: `[Comando e aprovação]`.
- Execução em produção: `[Comando, janela e aprovação]`.
- Backup e restauração: `[Procedimento e responsável]`.
- Compatibilidade entre versões: `[Política]`.

Nunca execute migrations destrutivas em dados compartilhados sem backup,
aprovação explícita e plano de restauração. Não use dados reais em ambientes
inferiores sem base legal, anonimização e autorização documentada.

## Health e smoke test

| Ambiente     | Health check         | Smoke test | Frequência                | Critério de sucesso |
| ------------ | -------------------- | ---------- | ------------------------- | ------------------- |
| `[Ambiente]` | `[Endpoint/comando]` | `[Fluxo]`  | `[Após deploy/periódico]` | `[Critério]`        |

## Observabilidade

| Sinal                  | Ferramenta ou fonte | Limite     | Ação         | Responsável |
| ---------------------- | ------------------- | ---------- | ------------ | ----------- |
| `[Métrica/log/alerta]` | `[Fonte]`           | `[Limite]` | `[Resposta]` | `[Dono]`    |

Não registre tokens, senhas, dados pessoais desnecessários ou payloads
confidenciais em logs, métricas ou traces.

## Rollback e recuperação

- Versão anterior conhecida: `[Artefato/tag/commit]`.
- Procedimento de rollback: `[Passos]`.
- Limite de tempo para decisão: `[Tempo]`.
- Dono da decisão: `[Responsável]`.
- Recuperação de dados: `[Passos e backup]`.
- Comunicação do incidente: `[Canal ou procedimento]`.

## Promoção entre ambientes

```text
[local] -> [preview] -> [homologação] -> [produção]
```

Defina os gates e aprovações de cada transição:

| Origem       | Destino      | Gates      | Aprovação       | Evidência            |
| ------------ | ------------ | ---------- | --------------- | -------------------- |
| `[Ambiente]` | `[Ambiente]` | `[Checks]` | `[Responsável]` | `[Link ou registro]` |

## Regras de isolamento

- Não compartilhar dados de forma destrutiva entre ambientes.
- Não apontar testes automatizados destrutivos para produção.
- Separar credenciais, filas, storage e serviços quando o risco exigir.
- Documentar toda dependência compartilhada e seu impacto em caso de falha.
- Tratar um preview visual como validação limitada, não como homologação
  isolada, até que dados e serviços estejam separados.
