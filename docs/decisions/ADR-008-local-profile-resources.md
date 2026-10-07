# ADR-008 — Resolver recursos de perfil por camadas locais

- Status: Aceita
- Data: 2026-10-07

## Contexto

O perfil padrão precisa continuar funcionando sem configuração, enquanto
autores de perfis alteram perguntas e templates sem modificar o pacote
instalado. Uma substituição parcial não deve exigir cópia de todos os recursos.

## Decisão

`init` aceita `--profile FILE` para selecionar um manifesto local e
`--overrides DIR` para substituir recursos por caminho relativo. A resolução
segue a ordem: pasta de sobrescritas, pasta do manifesto selecionado e pacote.
Sem `--profile`, o manifesto padrão do pacote permanece selecionado. Um
manifesto selecionado deve existir; só a ausência de um recurso permite buscar
na camada seguinte. Erros de validação, leitura e caminho inseguro são
propagados.

Manifestos e módulos mantêm seus contratos versionados. O carregamento é apenas
de dados declarativos; não há execução de código local. Os caminhos de saída
continuam sujeitos ao plano de geração e à proteção contra conflitos.

## Consequências

- Projetos existentes mantêm o comportamento padrão sem novas opções.
- Autores podem substituir um único template ou módulo sem duplicar o perfil.
- Perfis locais devem declarar caminhos compatíveis com seus recursos ou com o
  pacote de fallback; falhas aparecem antes da escrita.
- A documentação deve mostrar o formato da pasta de sobrescritas e a ordem de
  resolução para evitar dependências acidentais do pacote.
