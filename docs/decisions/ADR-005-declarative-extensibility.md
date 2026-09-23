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

## Consequências

- Personalizações são auditáveis e mais fáceis de validar.
- Um perfil ou configuração local pode substituir templates sem alterar casos de
  uso.
- Alguns comportamentos avançados exigirão evolução do formato declarativo.
- Presets técnicos devem declarar arquivos e condições sem executar scripts por
  padrão.
