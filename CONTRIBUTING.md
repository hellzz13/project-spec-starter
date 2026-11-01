# Como contribuir

Obrigado pelo interesse no project-spec-starter. Issues, correções de
documentação, testes e propostas de melhoria são bem-vindos. Antes de iniciar
uma mudança maior, abra uma issue para discutir o problema e o alcance.

## Antes de começar

Leia `PROJECT.md`, `docs/ENGINEERING.md`, `docs/BUSINESS_RULES.md`,
`docs/ROADMAP.md`, `docs/GITFLOW.md` e os ADRs relacionados. Confirme que a
proposta se encaixa no escopo do projeto e descreva a necessidade antes de
escolher uma implementação.

Use Node.js 24 ou superior e npm. Para preparar o repositório:

```bash
nvm use
npm ci
```

## Desenvolvimento

Para comportamento novo ou correção:

1. Escreva um teste que descreva o resultado esperado.
2. Confirme que ele falha pelo motivo correto.
3. Implemente a menor mudança necessária.
4. Refatore preservando o comportamento.
5. Execute os gates aplicáveis.

Mudanças em perguntas, templates ou perfis devem testar tanto o conteúdo gerado
quanto invariantes, como ausência de marcadores e referências inválidas.

Antes de abrir o PR, execute:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:package
```

Confira também no diff as regras aplicáveis de `docs/ENGINEERING.md`. Os gates
automatizados não cobrem todas elas.

## Compatibilidade

- Prefira mudanças aditivas.
- Não altere silenciosamente o significado de campos existentes.
- Inclua migração e testes quando modificar um schema persistido.
- Não regenere por cima de documentos editados.
- Atualize changelog e documentação pública quando um contrato mudar.

## Pull requests

Crie uma branch a partir da `main` e abra um PR com escopo pequeno. Descreva o
problema, o comportamento resultante, os testes executados e qualquer impacto
em compatibilidade, perfis, templates ou projetos já gerados. Mudanças de
arquitetura ou difíceis de reverter devem incluir um ADR. O título do PR pode
ser em inglês; prefira a descrição em português para facilitar a revisão atual.

Não inclua segredos, dados pessoais, URLs privadas, arquivos locais ou mudanças
sem relação com o objetivo da contribuição.

## Licença e créditos

O código e a documentação deste repositório são publicados sob a licença MIT,
disponível em [`LICENSE`](LICENSE). Envie apenas material que você pode
contribuir nesses termos e identifique no PR qualquer conteúdo de terceiros e
sua licença. O histórico de commits e PRs registra as contribuições.

A licença dos documentos criados pela CLI para um projeto do usuário ainda será
documentada separadamente. Não presuma que a licença deste repositório escolha
a licença do projeto de quem usa a ferramenta.
