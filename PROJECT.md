# project-spec-starter

## Visão

### Problema

Iniciar um projeto exige decisões de produto, arquitetura, qualidade, entrega e
operação. Essas decisões costumam ficar dispersas, ser assumidas por ferramentas
ou permanecer apenas em conversas. Templates manuais ajudam, mas são demorados
de preencher e frequentemente preservam lacunas ambíguas.

### Proposta de valor

Permitir que uma pessoa com um projeto parcialmente definido execute uma CLI,
responda poucas perguntas e obtenha documentação inicial coerente, editável e
pronta para orientar pessoas e agentes de desenvolvimento.

### Público

- Pessoas iniciando projetos individuais ou em equipe.
- Equipes que desejam padronizar o bootstrap sem impor uma stack.
- Usuários de agentes de desenvolvimento que precisam de contexto persistente.
- Mantenedores que desejam criar perfis e geradores reutilizáveis.

## Escopo

### Incluído no MVP

- Entrevista curta e condicional.
- Aplicação única ou monorepo.
- Frontend, backend, full-stack, biblioteca, CLI, worker, infraestrutura,
  mobile e tipos personalizados.
- Capacidades independentes do tipo declarado.
- Estados definido, pendente e não aplicável.
- Geração dos documentos definitivos do projeto.
- Entrada interativa ou por configuração JSON versionada.
- Revisão, `dry-run`, detecção de conflitos e escrita segura.
- Perfil padrão substituível por configuração local.
- Orientações para refinamento progressivo por agentes.

### Evolução planejada

- Geradores documentais, começando por ADRs.
- Receitas locais de geração.
- Presets técnicos versionados.
- Geradores de componentes, serviços, features e casos de uso.
- Inspeção e migração assistida de configurações antigas.

### Fora do MVP

- Instalar frameworks ou dependências no projeto gerado.
- Executar código arbitrário de extensões.
- Escolher tecnologias em nome do usuário.
- Mesclar automaticamente templates novos em documentos editados.
- Publicar, criar repositórios remotos ou configurar provedores externos.

## Experiência principal

```text
executar init
  -> responder perguntas essenciais
  -> revisar respostas e plano de arquivos
  -> gerar documentação
  -> abrir o projeto com um agente
  -> refinar pendências conforme a tarefa exigir
```

Comando principal planejado:

```bash
npx project-spec-starter init
```

## Requisitos funcionais

- `RF-001` — Iniciar um projeto no diretório atual ou em um destino informado.
- `RF-002` — Coletar identidade, organização, natureza e capacidades do projeto.
- `RF-003` — Aceitar um tipo personalizado descrito pelo usuário.
- `RF-004` — Permitir múltiplas unidades em monorepos.
- `RF-005` — Mostrar somente perguntas aplicáveis às respostas anteriores.
- `RF-006` — Aceitar decisões definidas, pendentes ou não aplicáveis.
- `RF-007` — Produzir o mesmo plano para respostas interativas ou em JSON.
- `RF-008` — Exibir o plano completo antes de escrever arquivos.
- `RF-009` — Detectar conflitos sem sobrescrever arquivos silenciosamente.
- `RF-010` — Permitir inspecionar a geração com `--dry-run`.
- `RF-011` — Gerar `AGENTS.md` quando o uso de agentes estiver habilitado.
- `RF-012` — Permitir sobrescritas locais de perfil, perguntas e templates.

## Requisitos não funcionais

- `RNF-001` — Funcionar sem conexão de rede depois de instalado.
- `RNF-002` — Não solicitar nem registrar segredos ou valores privados.
- `RNF-003` — Produzir saída determinística para a mesma entrada e versão.
- `RNF-004` — Preservar compatibilidade por schema e migrações explícitas.
- `RNF-005` — Isolar domínio de terminal, filesystem e renderização.
- `RNF-006` — Ser testável sem interação real ou escrita permanente.
- `RNF-007` — Oferecer mensagens e prompts acessíveis e compreensíveis.

## Critérios de sucesso do MVP

- Uma pessoa conclui o bootstrap sem precisar conhecer a arquitetura interna.
- Frontend, backend, full-stack, monorepo e projeto personalizado são cobertos.
- Nenhum documento gerado contém marcador acidental não resolvido.
- Cancelamentos e conflitos não deixam geração parcial.
- Um agente consegue identificar fontes de verdade e pendências pelo `AGENTS.md`.
- O pacote npm empacotado inclui todos os perfis e templates necessários.

## Riscos

| Risco                                   | Mitigação                                           |
| --------------------------------------- | --------------------------------------------------- |
| Entrevista crescer demais               | Núcleo mínimo e aprofundamento progressivo          |
| Templates acoplados ao schema           | Modelo documental intermediário                     |
| Sobrescrita de trabalho humano          | Plano prévio e bloqueio de conflitos                |
| Extensibilidade virar execução insegura | Extensões declarativas antes de plugins executáveis |
| Presets imporem uma stack               | Ativação explícita e compatibilidade declarada      |

## Decisões pendentes

- Biblioteca de parsing dos argumentos da CLI.
- Biblioteca de prompts interativos.
- Biblioteca de validação do schema.
- Sintaxe de templates e condicionais.
- Versões mínimas do Node.js suportadas.
