# Ambientes e operação — project-spec-starter

## Ambientes

| Ambiente | Finalidade | Dados |
| --- | --- | --- |
| Local | Desenvolvimento e TDD | Fixtures sintéticas |
| CI | Gates e empacotamento | Fixtures sintéticas e diretórios temporários |
| Distribuição | Registro npm | Artefato público, sem segredos |

Não existe aplicação hospedada no MVP. Exemplos e testes nunca usam projetos,
credenciais, URLs privadas ou dados pessoais reais.

## Configuração

- O desenvolvimento local deve funcionar após instalação pelo npm.
- Variáveis de ambiente, se necessárias no futuro, serão documentadas por nome
  em `.env.example` com valores fictícios seguros.
- Tokens de publicação ficam no mecanismo seguro da plataforma de CI.
- Logs de testes e publicação não podem exibir credenciais.

## Empacotamento

O artefato deve incluir:

- JavaScript compilado e declarações necessárias.
- Executável da CLI.
- Perfil padrão.
- Perguntas, templates e manifestos distribuídos.
- README, licença e metadados do pacote.

Antes de publicar, o arquivo empacotado será instalado em um diretório temporário
e usado para executar `--help`, validação e um bootstrap completo.

## Compatibilidade

A matriz de versões do Node.js será definida no Marco 1. A CI deverá testar todas
as versões declaradas como suportadas antes de uma release.

## Recuperação

- Uma release incorreta será corrigida por nova versão; versões publicadas não
  serão reescritas.
- Uma versão problemática pode ser marcada como desaconselhada no registro.
- Documentos gerados permanecem no projeto do usuário e não dependem do serviço
  de distribuição depois da instalação.
