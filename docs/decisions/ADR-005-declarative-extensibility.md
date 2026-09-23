# ADR-005 — Começar com extensibilidade declarativa

- Status: Aceita
- Data: 2026-09-22

## Contexto

Perguntas, templates e geradores precisam ser editáveis, mas plugins executáveis
ampliam riscos de segurança, compatibilidade e suporte.

## Decisão

O MVP aceita manifestos, perguntas, templates e receitas declarativas. Código
externo executável fica fora do escopo até existir um modelo de confiança.

## Consequências

- Personalizações são auditáveis e mais fáceis de validar.
- Alguns comportamentos avançados exigirão evolução do formato declarativo.
- Presets técnicos devem declarar arquivos e condições sem executar scripts por
  padrão.
