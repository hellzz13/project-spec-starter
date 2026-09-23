# ADR-006 — Oferecer padrões recomendados em módulos editáveis

- Status: Aceita
- Data: 2026-09-22

## Contexto

O padrão de engenharia de referência contém regras universais e convenções
específicas de React, NestJS, Supabase, Tailwind e identidade visual. Copiá-lo
integralmente tornaria a CLI inadequada para outros tipos de projeto.

## Decisão

O perfil padrão oferece um núcleo recomendado e neutro. Regras dependentes de
stack ou capacidade são módulos condicionais. O usuário pode aceitar, alterar,
substituir ou desabilitar o padrão durante o setup ou por sobrescrita local.

Projetos Node.js recebem `.nvmrc` com a versão escolhida. A sugestão inicial do
perfil é versionada e também pode ser substituída.

Regras essenciais do padrão recomendado são protegidas por testes de contrato
quando forem verificáveis. Regras que dependem de julgamento entram na matriz de
revisão do diff; a passagem dos gates automatizados não basta para declará-las
atendidas.

## Consequências

- Projetos começam com práticas consistentes sem receber uma stack obrigatória.
- Perfis precisam declarar condições e possibilidades de substituição.
- Regras específicas de produto, marca ou provedor não pertencem ao padrão
  neutro.
- Testes devem validar coerência entre defaults, arquivos gerados e metadados.
- Agentes recebem uma etapa explícita para confrontar as regras aplicáveis com o
  diff antes da conclusão.
