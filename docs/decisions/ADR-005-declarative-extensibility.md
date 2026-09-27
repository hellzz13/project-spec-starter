# ADR-005 — Começar com extensibilidade declarativa

- Status: Aceita
- Data: 2026-09-22

## Contexto

Perguntas, templates e geradores precisam ser editáveis, mas plugins executáveis
ampliam riscos de segurança, compatibilidade e suporte.

## Decisão

O MVP aceita manifestos, perguntas, templates e receitas declarativas. Código
externo executável fica fora do escopo até existir um modelo de confiança.

O manifesto do perfil associa cada documento ao template e ao caminho de saída.
O arquivo de template é a fonte canônica do conteúdo; renderizadores não mantêm
uma segunda cópia do documento em código.

Perguntas ficam em módulos ordenados e versionados. Aplicabilidade usa condições
declarativas (`equals`, `includes`, `all` e `any`); os módulos não executam
código. Grupos repetíveis descrevem coleções como unidades de monorepo sem
acoplar essa estrutura à biblioteca de prompts.

## Consequências

- Personalizações são auditáveis e mais fáceis de validar.
- Um perfil ou configuração local pode substituir templates sem alterar casos de
  uso.
- Alguns comportamentos avançados exigirão evolução do formato declarativo.
- Presets técnicos devem declarar arquivos e condições sem executar scripts por
  padrão.
- O carregador valida manifesto, módulos, referências e limites de caminho antes
  que a CLI apresente perguntas ou produza documentos.
