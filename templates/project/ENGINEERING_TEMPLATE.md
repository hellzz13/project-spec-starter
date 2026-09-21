# Padrões de engenharia — [NOME_DO_PROJETO]

Use este documento para registrar padrões técnicos. Uma opção de tecnologia só
se torna obrigatória depois de ser escolhida na seção de decisões.

## Colaboração

- Toda fase começa com inspeção do estado atual, escopo e plano.
- Trabalho concreto pode ser delegado quando houver contexto suficiente e
  revisão independente posterior.
- Arquitetura, segurança, privacidade, decisões ambíguas e validação final
  permanecem sob responsabilidade do mantenedor principal.
- O custo da implementação nunca reduz cobertura, segurança, acessibilidade ou
  qualidade exigida.

## Decisões de stack

| Camada        | Opções consideradas      | Escolha   | Motivo   | Data         |
| ------------- | ------------------------ | --------- | -------- | ------------ |
| Interface     | [React/Vue/Svelte/outro] | [Escolha] | [Motivo] | [AAAA-MM-DD] |
| API           | [Framework ou serviço]   | [Escolha] | [Motivo] | [AAAA-MM-DD] |
| Persistência  | [Banco ou serviço]       | [Escolha] | [Motivo] | [AAAA-MM-DD] |
| Estado remoto | [Biblioteca/abordagem]   | [Escolha] | [Motivo] | [AAAA-MM-DD] |
| Estilos       | [CSS/Tailwind/outro]     | [Escolha] | [Motivo] | [AAAA-MM-DD] |
| Testes        | [Runner e ferramentas]   | [Escolha] | [Motivo] | [AAAA-MM-DD] |
| Hospedagem    | [Opções]                 | [Escolha] | [Motivo] | [AAAA-MM-DD] |

## Princípios mínimos

- Usar tipagem estrita quando a linguagem oferecer esse recurso.
- Evitar tipos frouxos; validar valores desconhecidos na fronteira.
- Preferir funções pequenas, nomes orientados à intenção e exports explícitos.
- Extrair condições relevantes para nomes semânticos.
- Centralizar configuração repetida no menor escopo compartilhado coerente.
- Não deixar requisições ou regras de persistência em componentes de
  apresentação.
- Não manter código comentado, imports sem uso ou logs de depuração.

## Organização

Registre a estrutura adotada e a direção de dependências:

```text
[camada de apresentação] -> [casos de uso] -> [infraestrutura]
```

| Área             | Responsabilidade                       | Pode depender de         |
| ---------------- | -------------------------------------- | ------------------------ |
| [Apresentação]   | [Composição de interface e interação]  | [Casos de uso/contratos] |
| [Aplicação]      | [Orquestração e regras]                | [Contratos]              |
| [Infraestrutura] | [Banco, rede, filesystem e provedores] | [Bibliotecas externas]   |

### Estrutura como decisão

A estrutura de pastas abaixo é uma opção de organização, não uma regra
universal. Registre a escolha do projeto, o motivo, os limites de cada camada e
as exceções aprovadas. Prefira uma estrutura que torne as dependências e os
limites do domínio fáceis de encontrar.

#### Exemplo de monorepo configurável

```text
apps/
  web/
    src/
  api/
    src/
packages/
  shared-contracts/
  shared-ui/
docs/
tests/
```

Substitua, remova ou renomeie os diretórios conforme as aplicações e pacotes
realmente existentes. Compartilhe apenas contratos ou componentes semânticos
que tenham consumidores independentes e uma API estável.

#### Exemplo de aplicação única

```text
src/
  features/
  components/
  services/
  infra/
  shared/
tests/
```

Uma aplicação pequena pode começar mais simples. Não crie camadas vazias apenas
para seguir o diagrama; promova uma área quando surgir uma responsabilidade
real ou uma necessidade clara de reutilização.

### Organização de frontend

Quando houver interface, uma feature ou domínio pode ser organizado assim:

```text
features/[dominio]/
  flows/                 # composição de páginas e jornadas
  pages/                 # entrada visual, quando fizer sentido separar
  components/            # componentes locais do domínio
  controllers/          # interação, queries, mutations e regras de tela
  hooks/                 # coordenação reutilizável da feature
  services/              # contratos de aplicação
  infra/                 # HTTP, storage, navegador e integrações externas
  types.ts               # contratos locais compartilhados
  constants.ts           # valores estáveis reutilizados
```

`flows` e `pages` devem compor a tela, enquanto controllers e hooks coordenam
interação e estado. Components locais recebem dados e callbacks; não conhecem
HTTP, storage, navegação ou regras de persistência. Services declaram contratos;
infraestrutura fornece implementações concretas.

### Organização de backend

Quando houver servidor, uma feature ou domínio pode ser organizado assim:

```text
features/[dominio]/
  controllers/           # entrada HTTP ou equivalente
  use-cases/             # regras e orquestração da aplicação
  services/              # serviços de domínio ou aplicação, se necessários
  repositories/          # persistência concreta
  ports/                 # contratos das dependências
  infra/                 # banco, filas, provedores e transporte externo
  types.ts
  constants.ts
```

Controllers traduzem entradas e saídas; casos de uso aplicam regras; ports
definem dependências; repositories e infra implementam essas dependências.
Autorização, validação de fronteira e tratamento de erros não devem depender da
interface que iniciou a chamada.

### Arquivos e convenções

- `index` é a entrada pública de uma unidade somente quando isso melhorar a
  descoberta; não criar barrel exports automaticamente.
- `types` contém contratos do menor escopo coerente e não deve virar um arquivo
  global para tipos sem relação.
- `constants` contém valores estáveis reutilizados, separados por escopo e
  acompanhados de nomes semânticos.
- Testes ficam próximos da unidade testada ou em uma árvore de testes definida
  pelo projeto; registre essa decisão antes de misturar os dois estilos.
- Exports e imports devem tornar a origem do contrato clara; evitar reexports
  que ocultem ciclos ou dependências inesperadas.

### Dependências e limites

Defina uma direção explícita, por exemplo:

```text
pages/flows -> controllers/hooks -> services/ports -> infra
components locais -> componentes compartilhados sem domínio
```

- Camadas externas podem depender de contratos internos; o inverso não é
  permitido.
- Um domínio não importa arquivos internos de outro domínio por caminhos
  profundos. Exponha uma API pública pequena e documentada.
- Infraestrutura não deve vazar detalhes de provedores para componentes ou
  casos de uso além dos contratos necessários.
- Dependências compartilhadas precisam ter consumidores reais; evitar um módulo
  comum que acumule utilitários sem relação.

### Critérios de componentização

Extraia um componente quando houver pelo menos uma destas condições:

- uma responsabilidade visual ou de interação claramente separável;
- repetição real em duas ou mais partes da interface;
- necessidade de testar um comportamento isoladamente;
- uma área que possui estado, acessibilidade ou ciclo de vida próprios;
- um limite visual que melhora a leitura da página que o compõe.

Promova um componente local para compartilhado ou UI somente quando existir
reutilização concreta, API pequena, linguagem visual comum e ausência de regra
específica do domínio. Não fragmente apenas para atingir uma quantidade de
linhas: tamanho é um sinal para revisar, mas responsabilidade, coesão e
legibilidade são os critérios principais.

Views não devem conter lógica de negócio, chamadas HTTP, acesso a storage ou
transformações acopladas a provedores. Extraia esses comportamentos para a
camada apropriada e injete dados e callbacks na view.

### Checklist de revisão de componentização

- [ ] A unidade tem uma responsabilidade clara?
- [ ] A API de props ou contrato é pequena e explícita?
- [ ] A extração evita duplicação ou isola um comportamento testável?
- [ ] A unidade não conhece HTTP, storage ou regras de persistência?
- [ ] Dependências seguem a direção definida e não usam imports profundos?
- [ ] O componente pertence ao domínio correto e só foi promovido se houver
      reutilização concreta?
- [ ] Estados de loading, erro, vazio, foco e teclado continuam acessíveis?

## Tipos e contratos

- Manter contratos próximos ao domínio que os utiliza.
- Preferir uniões discriminadas para estados mutuamente exclusivos.
- Usar objetos imutáveis e tipos derivados para conjuntos simples de valores.
- Usar enums apenas quando uma entidade de domínio precisar de representação
  em runtime.
- Validar entradas e respostas externas na fronteira.
- Não usar assertions para contornar validação.

## Frontend (se aplicável)

- Componentes de apresentação recebem dados e callbacks por props.
- Controllers e hooks coordenam queries, mutations e interação.
- Estado remoto pertence à biblioteca escolhida para esse fim.
- Chaves de query ficam centralizadas em constantes ou builders nomeados.
- Toda tela dependente de dados exibe skeleton durante o carregamento inicial.
- Efeitos sincronizam sistemas externos; não calculam estado derivado.
- Condições relevantes de exibição recebem nomes semânticos.
- Toda constante de classes de estilo termina com `Style`, quando essa convenção
  for adotada pelo projeto.
- Componentes e fluxos precisam atender teclado, foco, contraste, semântica e
  leitores de tela.

## Backend (se aplicável)

- Separar controller, caso de uso/serviço e repositório.
- Validar DTOs e parâmetros antes de executar regras.
- Aplicar autorização no servidor, independentemente da interface.
- Usar códigos de resposta nomeados ou abstrações do framework; evitar números
  mágicos.
- Centralizar rotas HTTP em um catálogo coerente quando houver cliente próprio.
- Padronizar erros sem expor segredos, stack traces ou dados internos.

## Desenvolvimento guiado por testes

Para cada comportamento novo ou correção:

1. Escrever um teste que represente o comportamento esperado.
2. Confirmar que ele falha pelo motivo correto.
3. Implementar o mínimo necessário.
4. Refatorar sem alterar o comportamento.
5. Executar testes, lint e formatação.

Regras de domínio, permissões, datas, hooks, endpoints e integrações exigem
testes diretos. Configuração declarativa pode ser coberta indiretamente.

## Segurança e privacidade

- Segredos e tokens ficam fora do repositório e dos logs.
- Arquivos de ambiente versionados contêm somente nomes e exemplos seguros.
- Chaves privilegiadas ficam exclusivamente no servidor.
- Validar e normalizar entradas externas.
- Aplicar menor privilégio, autorização por recurso e isolamento de dados.
- Definir retenção, exclusão, auditoria e tratamento de dados pessoais.
- Rotacionar imediatamente qualquer credencial exposta.

## Acessibilidade e experiência

- Usar HTML semântico e labels associados aos controles.
- Garantir navegação por teclado e foco visível.
- Não comunicar estado apenas por cor.
- Reservar espaço para feedback assíncrono e informar loading, sucesso e erro.
- Testar em larguras e tecnologias assistivas relevantes ao público.

## Automação de qualidade

| Gate       | Execução  | Bloqueia merge? |
| ---------- | --------- | --------------- |
| Formatação | [Comando] | [Sim/Não]       |
| Lint       | [Comando] | [Sim/Não]       |
| Tipos      | [Comando] | [Sim/Não]       |
| Testes     | [Comando] | [Sim/Não]       |
| Build      | [Comando] | [Sim/Não]       |
| Auditoria  | [Comando] | [Sim/Não]       |

## Definition of Done

- [ ] Comportamento e casos de erro definidos.
- [ ] Validação e autorização revisadas.
- [ ] Estados de loading, vazio e erro tratados quando aplicável.
- [ ] Testes relevantes passando.
- [ ] Formatação, lint, typecheck e build passando.
- [ ] Acessibilidade revisada.
- [ ] Nenhum segredo ou dado sensível incluído.
- [ ] Documentação e decisões atualizadas.
- [ ] Observabilidade ou rollback definidos quando necessário.
