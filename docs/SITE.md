# Site do projeto

A landing page pública fica em [`website/`](../website/). É HTML, CSS e
JavaScript estáticos, sem build nem dependências adicionais. A documentação
principal abre em um drawer na própria página, com guia de instalação via npm,
perguntas, personalização e comandos copiáveis. O conteúdo acompanha
[`docs/USAGE.md`](USAGE.md), [`docs/QUESTIONS.md`](QUESTIONS.md) e o perfil
padrão. Uma mudança nas perguntas, opções ou comandos públicos exige revisão
do conteúdo do drawer na mesma entrega.

## Prévia local

Na raiz do repositório, execute:

```bash
python3 -m http.server 8000 --directory website
```

Abra `http://localhost:8000`. O site também pode ser aberto diretamente pelo
`index.html`, mas o servidor local reproduz melhor a entrega por HTTP.

## Publicação

O workflow [`.github/workflows/pages.yml`](../.github/workflows/pages.yml)
envia o conteúdo de `website/` ao GitHub Pages quando a pasta ou o próprio
workflow mudam na `main`. Também aceita execução manual pelo GitHub Actions.

Antes do primeiro deploy, em **Settings → Pages → Build and deployment**, escolha
**GitHub Actions** como origem. Depois do merge do PR, confirme o workflow
**Publish documentation site** e o endereço publicado em
`https://hellzz13.github.io/project-spec-starter/`.

Alterações no site passam por PR e revisão. Não coloque tokens ou conteúdo
privado na pasta `website/`: tudo nela será público. Dados pessoais só entram
com autorização explícita do titular; a identificação do criador no rodapé foi
solicitada pelo mantenedor. A publicação do site é independente do pacote npm e
não altera projetos já gerados.
