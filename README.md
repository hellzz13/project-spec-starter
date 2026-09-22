# project-spec-starter

CLI compartilhável para iniciar projetos orientados por especificações. A
ferramenta conduz uma entrevista curta, gera documentação definitiva e prepara
o projeto para ser refinado progressivamente por pessoas e agentes.

## Estado

O projeto concluiu sua especificação inicial e está na fundação técnica. A
primeira versão entregará o bootstrap documental; geradores de código serão
adicionados posteriormente por meio de receitas e presets explícitos.

## Desenvolvimento

O projeto requer Node.js 22 ou superior e usa npm:

```bash
npm install
npm test
npm run lint
npm run typecheck
npm run build
```

## Princípios

- Nenhuma linguagem, framework ou provedor é obrigatório.
- Perguntas iniciais devem ser poucas e condicionais.
- Decisões desconhecidas são registradas como pendentes, nunca inventadas.
- Templates, perguntas, perfis e geradores devem poder ser substituídos.
- Arquivos existentes não são sobrescritos silenciosamente.
- O núcleo não depende do terminal, filesystem ou renderizador concreto.

## Documentação

- [Contexto e escopo](PROJECT.md)
- [Padrões de engenharia](docs/ENGINEERING.md)
- [Regras de negócio](docs/BUSINESS_RULES.md)
- [Fluxo de entrega](docs/GITFLOW.md)
- [Ambientes](docs/ENVIRONMENTS.md)
- [Roadmap](docs/ROADMAP.md)
- [Checklist de bootstrap](docs/BOOTSTRAP_CHECKLIST.md)
- [Decisões arquiteturais](docs/decisions/)
- [Instruções para agentes](AGENTS.md)
- [Como contribuir](CONTRIBUTING.md)
