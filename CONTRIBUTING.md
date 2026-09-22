# Contribuindo — project-spec-starter

## Antes de começar

Leia `PROJECT.md`, `docs/ENGINEERING.md`, `docs/BUSINESS_RULES.md`, o roadmap e
os ADRs relacionados. Confirme que a mudança pertence ao marco atual.

O gerenciador do repositório é npm. Os comandos definitivos serão adicionados no
Marco 1 e documentados aqui quando a configuração técnica existir.

## Desenvolvimento

Para comportamento novo ou correção:

1. Escreva um teste que descreva o resultado esperado.
2. Confirme que ele falha pelo motivo correto.
3. Implemente a menor mudança necessária.
4. Refatore preservando o comportamento.
5. Execute os gates aplicáveis.

Mudanças em perguntas, templates ou perfis devem testar tanto o conteúdo gerado
quanto invariantes, como ausência de marcadores e referências inválidas.

## Compatibilidade

- Prefira mudanças aditivas.
- Não altere silenciosamente o significado de campos existentes.
- Inclua migração e testes quando modificar um schema persistido.
- Não regenere por cima de documentos editados.
- Atualize changelog e documentação pública quando um contrato mudar.

## Pull requests

Descreva o problema, o comportamento resultante, os testes executados e qualquer
impacto em compatibilidade. Mudanças de arquitetura ou difíceis de reverter
devem incluir um ADR.

Não inclua segredos, dados pessoais, URLs privadas, arquivos locais ou mudanças
sem relação com o objetivo da contribuição.
