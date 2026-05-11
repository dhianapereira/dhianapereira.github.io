# Portfólio

My engineering journal :)

## Estrutura

- `_projects/`: projetos do portfólio
- `_notes/`: notas de engenharia
- `pages/`: páginas de índice, como projetos e notas
- `_data/site.yml`: perfil, contatos e stack
- `_data/i18n/`: textos da interface por idioma
- `_layouts/` e `_includes/`: arquitetura modular do site
- `assets/`: imagens, logo e outros arquivos estáticos
- `styles/`: CSS separado por camadas (`tokens`, `base`, `layout`, `components`, `pages`, `utilities`, `responsive`)
- `scripts/`: comportamentos de interface separados por responsabilidade

## Rodando localmente

O repositório inclui `Gemfile`. Em um ambiente com Ruby instalado:

```bash
bundle install
bundle exec jekyll serve
```

Ou com Docker Compose:

```bash
docker compose up
```

Isso sobe o Jekyll em `http://localhost:4000` usando Ruby alinhado ao ecossistema atual do GitHub Pages.

## Licença

Código licenciado sob a [Licença MIT](./LICENSE).

Conteúdo © Dhiana Pereira.
