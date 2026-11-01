# Guia das perguntas da CLI

Este guia explica as perguntas do perfil padrão da versão `1.0.0`. A
entrevista é condicional: perguntas sobre unidades aparecem apenas para
monorepos; as de descrição de tipo aparecem ao escolher **Outro**; a versão do
Node.js aparece apenas se o projeto usar Node.js.

A CLI **gera documentos no diretório atual**. Ela não cria uma pasta de projeto,
aplicações, pacotes ou código. `--dry-run` mostra as respostas e o plano sem
escrever arquivos; `init` sem essa opção pede confirmação antes da geração.

## Identidade e organização do projeto

| Pergunta exibida                                    | O que informar                                                                                                                                        | Exemplo ou efeito                                      |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Qual é o nome do projeto?**                       | O nome pelo qual você quer identificar o projeto na documentação. Não precisa ser o nome de um pacote npm.                                            | `DisciplineHub` ou `Portal de clientes`.               |
| **Como você resume o objetivo inicial do projeto?** | Uma ou duas frases sobre o problema e o resultado esperado. Se ainda não souber, marque a decisão como **pendente**; o documento registrará a lacuna. | `Permitir que estudantes acompanhem hábitos e metas.`  |
| **Como o projeto será organizado?**                 | **Aplicação única** para uma única aplicação ou pacote; **Monorepo** para várias unidades mantidas no mesmo repositório.                              | Um site e uma API no mesmo repositório → **Monorepo**. |

### Se você escolher monorepo

Uma **unidade** é uma aplicação ou pacote que fará parte do monorepo, como uma
interface, API, biblioteca compartilhada ou worker. A pergunta **“Quais unidades fazem parte do monorepo?”** pede a quantidade de unidades que você quer **descrever agora**. Informe um número
inteiro de pelo menos `1`; a CLI repetirá as perguntas abaixo uma vez por
unidade. A quantidade não representa usuários, ambientes, repositórios nem
pastas que serão criadas.

| Pergunta exibida para cada unidade                 | O que informar                                                                                                                   | Exemplo ou efeito                                      |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Qual é o nome da unidade?**                      | Um nome para identificá-la nos documentos.                                                                                       | `Web`, `API` ou `Biblioteca de componentes`.           |
| **Qual será o caminho da unidade?**                | O caminho relativo planejado dentro do monorepo. Se ainda não decidiu, marque como **pendente**. A CLI não cria esse caminho.    | `apps/web`, `apps/api`, `packages/ui`.                 |
| **Qual é a natureza da unidade?**                  | O papel principal daquela unidade: frontend, backend, full-stack, biblioteca, CLI, worker, infraestrutura, mobile ou outro tipo. | `API` → **Backend**; `Web` → **Frontend**.             |
| **Como você descreve esse outro tipo de unidade?** | Só aparece quando a natureza escolhida for **Outro**. Descreva o tipo em suas palavras.                                          | `Pipeline de importação de dados`.                     |
| **Quais capacidades essa unidade possui?**         | O que essa unidade faz, independentemente do seu tipo. É possível selecionar várias opções ou informar uma capacidade própria.   | Uma API pode ter **API HTTP** e **Tarefas agendadas**. |

Exemplo: um monorepo com `Web` em `apps/web` e `API` em `apps/api` tem **duas
unidades**. O caminho de cada uma pode continuar pendente. A lista documenta a
estrutura planejada e pode ser refinada depois.

## Tipo e capacidades do conjunto

| Pergunta exibida                                          | O que informar                                                                                                                                                                                                                   | Exemplo ou efeito                                                                            |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Qual é a natureza principal do projeto?**               | O tipo do projeto como um todo. Para um monorepo, representa o conjunto, não substitui a natureza individual das unidades. As opções são frontend, backend, full-stack, biblioteca, CLI, worker, infraestrutura, mobile e outro. | Um repositório com site e API pode ser **Full-stack**; cada unidade mantém seu tipo próprio. |
| **Como você descreve esse outro tipo de projeto?**        | Só aparece ao escolher **Outro**. Escreva uma descrição curta do tipo de projeto.                                                                                                                                                | `Plataforma de automação de dados`.                                                          |
| **Quais capacidades o projeto precisa ter inicialmente?** | Marque características esperadas do conjunto. Pode escolher várias opções ou acrescentar uma própria. Isso não instala ferramentas nem escolhe frameworks.                                                                       | **Interface web**, **API HTTP**, **Persistência de dados**.                                  |
| **O projeto usará agentes de desenvolvimento?**           | Responda **Sim** se agentes de código participarão do desenvolvimento. Nesse caso, o perfil padrão inclui `AGENTS.md` para orientá-los.                                                                                          | Não é necessário escolher um fornecedor de agente.                                           |

**Tipo** descreve o que o projeto ou a unidade é; **capacidade** descreve o que
faz. Por exemplo, um projeto **Backend** pode ter **API HTTP** e **Tarefas
agendadas**. Essas respostas orientam os documentos, sem gerar aplicações ou
serviços.

## Runtime e padrão de engenharia

| Pergunta exibida                                       | O que informar                                                                                                                                                                         | Exemplo ou efeito                                     |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **O projeto usa Node.js?**                             | Responda conforme o runtime do projeto que está criando. A CLI usa Node.js para rodar, mas isso não obriga o projeto gerado a usá-lo.                                                  | Um backend em outra linguagem pode responder **Não**. |
| **Qual versão do Node.js o projeto deve usar?**        | Só aparece após responder **Sim**. Informe a versão que o projeto adotará. O perfil padrão sugere `24` e gera `.nvmrc` com a versão escolhida.                                         | `24` ou `24.14.1`.                                    |
| **Qual padrão de engenharia deve orientar o projeto?** | **Recomendado e editável** gera as convenções padrão; **Fornecido pelo usuário** registra que você definirá suas regras sem inventá-las; **Não gerar** deixa o padrão inicial de fora. | É possível editar os documentos gerados depois.       |

## Depois de responder

A CLI apresenta as respostas e o plano de arquivos. Revise o diretório atual e
os caminhos antes de confirmar. Arquivos existentes geram conflito e não são
sobrescritos. Depois da geração, os documentos editados são a fonte de verdade
do projeto. Consulte o [guia de uso](USAGE.md) para opções da CLI, respostas em
JSON e personalização de perfis.
