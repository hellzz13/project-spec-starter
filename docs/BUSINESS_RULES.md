# Regras de negócio — project-spec-starter

## Glossário

| Termo            | Definição                                               |
| ---------------- | ------------------------------------------------------- |
| Perfil           | Conjunto versionado de perguntas, manifesto e templates |
| Capacidade       | Característica funcional independente do tipo declarado |
| Unidade          | Aplicação ou pacote pertencente a um monorepo           |
| Pendência        | Decisão necessária que ainda não foi tomada             |
| Não aplicável    | Decisão avaliada que não pertence ao projeto            |
| Plano de geração | Descrição completa das alterações antes da escrita      |
| Receita          | Definição declarativa de um gerador de artefatos        |

## Atores

| Ator            | Responsabilidade                                              |
| --------------- | ------------------------------------------------------------- |
| Usuário         | Fornecer contexto e aprovar a geração                         |
| Mantenedor      | Evoluir CLI, schema e perfil padrão                           |
| Autor de perfil | Adaptar perguntas e documentos sem alterar o núcleo           |
| Agente          | Ler documentos, detectar lacunas e pedir decisões necessárias |

## Catálogo de regras

### `BR-001` — Entrevista mínima

A CLI pergunta somente o necessário para criar documentação inicial coerente.
Detalhes que não bloqueiam o bootstrap são registrados para refinamento futuro.

### `BR-002` — Tecnologia explícita

Uma tecnologia só aparece como decisão do projeto quando o usuário a informar
ou confirmar. Tipo de projeto e capacidades não escolhem frameworks.

### `BR-003` — Estados distintos

Toda decisão opcional distingue valor definido, pendente e não aplicável.
Ausência de resposta não pode ser interpretada automaticamente como ausência da
capacidade.

### `BR-004` — Tipo personalizado

O usuário pode descrever um tipo não previsto. Capacidades, e não o rótulo do
tipo, determinam as perguntas e seções aplicáveis.

### `BR-005` — Monorepo heterogêneo

Um monorepo pode conter múltiplas unidades de tipos diferentes. Nomes e pastas
não são presumidos pelo gerador documental.

### `BR-006` — Geração previsível

A mesma entrada, perfil e versões produzem o mesmo plano de geração, exceto por
metadados explicitamente declarados como variáveis.

### `BR-007` — Preservação de arquivos

Um arquivo existente gera conflito. O fluxo padrão não sobrescreve nem mescla o
conteúdo automaticamente.

### `BR-008` — Escrita integral

Conflitos são resolvidos antes da primeira escrita. Falha ou cancelamento não
deixa um conjunto parcial apresentado como geração concluída.

### `BR-009` — Refinamento por agentes

O agente pergunta somente sobre lacunas relevantes para a tarefa atual, não
inventa decisões e atualiza a fonte de verdade depois da resposta.

### `BR-010` — Documentos como fonte de verdade

Depois do bootstrap, os documentos editados são a fonte de verdade. O arquivo
de respostas registra a entrevista original e não substitui decisões humanas
posteriores.

### `BR-011` — Geradores dependem de receita

Geradores técnicos só ficam disponíveis quando existe receita local ou preset
compatível. O núcleo não inventa a estrutura de componentes ou serviços.

### `BR-012` — Nenhum segredo

A CLI coleta nomes de variáveis e mecanismos de armazenamento, nunca valores
reais de credenciais, tokens ou endereços privados.

### `BR-013` — Padrão recomendado editável

O perfil padrão oferece convenções de engenharia neutras. O usuário pode
aceitar, substituir ou desabilitar regras e módulos condicionais. Convenções de
uma tecnologia só aparecem quando a tecnologia ou capacidade correspondente
for escolhida.

### `BR-014` — Versão do Node.js reproduzível

Quando o projeto usar Node.js, a CLI sugere uma versão LTS suportada, permite
alterá-la e gera `.nvmrc`. O arquivo de versão, engines, CI e documentação devem
representar versões compatíveis.

## Erros observáveis

| Código                | Situação                        | Recuperação                                   |
| --------------------- | ------------------------------- | --------------------------------------------- |
| `INVALID_ANSWERS`     | Respostas não atendem ao schema | Corrigir os campos indicados                  |
| `UNSUPPORTED_SCHEMA`  | Versão não suportada            | Executar uma migração disponível              |
| `FILE_CONFLICT`       | Destino já existe               | Escolher outro destino ou revisar manualmente |
| `UNSAFE_PATH`         | Caminho escapa do projeto       | Corrigir perfil ou configuração               |
| `UNRESOLVED_TEMPLATE` | Marcador inesperado permaneceu  | Corrigir modelo ou template                   |
| `MISSING_RECIPE`      | Gerador não está configurado    | Instalar ou criar uma receita compatível      |
