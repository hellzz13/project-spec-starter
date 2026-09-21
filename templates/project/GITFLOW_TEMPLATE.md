# Fluxo de entrega — [NOME_DO_PROJETO]

Este modelo descreve um fluxo configurável. Adapte nomes de branches, ambientes
e regras de aprovação ao serviço de hospedagem e ao plano de controle de versão
escolhidos.

## Decisões do projeto

| Item                   | Escolha                  |
| ---------------------- | ------------------------ |
| Branch de produção     | `[BRANCH_PRODUCAO]`      |
| Branch de integração   | `[BRANCH_INTEGRACAO]`    |
| Prefixo de feature     | `[feature/*]`            |
| Prefixo de correção    | `[fix/*]`                |
| Prefixo de urgência    | `[hotfix/*]`             |
| Revisores obrigatórios | `[Quantidade ou equipe]` |
| Checks obrigatórios    | `[Lista de checks]`      |
| Deploy de produção     | `[Evento e ambiente]`    |
| Deploy de integração   | `[Evento e ambiente]`    |

## Branches permanentes

### `[BRANCH_PRODUCAO]`

Representa o código elegível para produção. Recebe apenas entregas revisadas,
aprovadas e validadas pelos checks obrigatórios.

### `[BRANCH_INTEGRACAO]`

Integra as próximas entregas e serve de base para features e correções comuns.
Seu ambiente associado deve ser adequado ao nível de estabilidade esperado.

## Branches temporárias

- `[feature/*]`: nova capacidade, criada a partir da branch de integração.
- `[fix/*]`: correção não urgente, criada a partir da branch de integração.
- `[release/*]`: estabilização opcional antes da promoção para produção.
- `[hotfix/*]`: correção urgente, criada a partir da branch de produção e
  sincronizada novamente com a integração após a validação.

## Fluxo comum

```text
[integração] -> [feature/* ou fix/*] -> revisão -> [integração]
             -> validação -> promoção -> [produção]
```

1. Atualize a branch de integração localmente.
2. Crie uma branch temporária com nome descritivo.
3. Implemente em commits pequenos e verificáveis.
4. Execute os gates locais definidos em `ENGINEERING_TEMPLATE.md`.
5. Abra uma revisão apontando para a branch de integração.
6. Valide checks, revisão, acessibilidade e ambiente de preview.
7. Faça merge conforme a política do projeto.
8. Promova a integração para produção por uma revisão separada.
9. Confirme o deploy e execute o smoke test.

## Hotfix

```text
[produção] -> [hotfix/*] -> revisão -> [produção]
                      -> sincronização -> [integração]
```

Uma correção urgente deve conter apenas o necessário para mitigar o incidente.
Depois do deploy, sincronize a correção com a branch de integração para evitar
que ela seja perdida na próxima promoção.

## Ambientes

| Branch/evento         | Ambiente                | Dados                                | Objetivo             |
| --------------------- | ----------------------- | ------------------------------------ | -------------------- |
| `[produção]`          | `[Produção]`            | `[Dados reais ou controlados]`       | [Uso final]          |
| `[integração]`        | `[Homologação/preview]` | `[Dados isolados ou compartilhados]` | [Validação]          |
| `[branch temporária]` | `[Preview efêmero]`     | `[Dados]`                            | [Revisão da mudança] |

Se dois ambientes compartilharem dados ou serviços, documente os riscos e não
execute testes destrutivos sem autorização. Um preview visual não é, por si só,
um ambiente isolado.

## CI/CD

| Evento                 | Checks                               | Ação                   |
| ---------------------- | ------------------------------------ | ---------------------- |
| Pull request           | [Format, lint, tipos, testes, build] | [Bloquear ou informar] |
| Push na integração     | [Checks]                             | [Deploy de integração] |
| Push na produção       | [Checks]                             | [Deploy de produção]   |
| Dependência atualizada | [Checks e auditoria]                 | [Revisão]              |

### Segredos e permissões

- Armazenar segredos no mecanismo de configuração do ambiente, nunca no Git.
- Usar permissões mínimas para jobs de CI/CD.
- Separar credenciais de integração e produção.
- Registrar quem pode aprovar e executar deploys.
- Definir rotação e revogação de credenciais.

## Política de revisão

- [ ] O objetivo e o escopo estão claros.
- [ ] Os testes cobrem o comportamento alterado.
- [ ] Não há segredo, dado sensível ou mudança não relacionada.
- [ ] Acessibilidade e estados de erro/loading foram revisados quando aplicável.
- [ ] Migrations, contratos e documentação estão atualizados.
- [ ] O rollback ou plano de recuperação está definido para mudanças de risco.

## Sincronização e limpeza

- Atualizar branches temporárias antes do merge quando necessário.
- Excluir branches temporárias após o merge conforme a política do repositório.
- Manter a branch de integração alinhada com correções urgentes.
- Registrar exceções ao fluxo e o motivo.

## Limitações da plataforma

`[Documente aqui quais regras são realmente aplicadas pela plataforma escolhida,
quais dependem de plano pago e quais são apenas convenções do time.]`
