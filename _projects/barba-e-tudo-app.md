---
title: "Barba e tudo"
description: "Aplicativo Flutter para operação interna da loja, com foco em estoque, movimentações, despesas, relatórios e controle de acesso por perfil."
date: 2026-04-13
client: "Barba e tudo"
locale: pt_BR
lang: pt-BR
types:
  - "app"
stack:
  - "Flutter"
  - "Dart"
  - "Firebase Auth"
  - "Cloud Firestore"
  - "Drift"
  - "GetIt"
  - "GoRouter"
gallery:
  - src: "/assets/images/projects/barba-e-tudo-app/barba-e-tudo-01.jpg"
    alt: "Tela inicial do app Barba e tudo com resumo financeiro da loja e navegação inferior."
    caption: "A tela inicial resume o estado da operação e destaca, logo de saída, os números que mais ajudam na leitura rápida do negócio."
  - src: "/assets/images/projects/barba-e-tudo-app/barba-e-tudo-02.jpg"
    alt: "Seção de valor do estoque com cards de resumo e ranking de produtos com mais dinheiro parado."
    caption: "Além do resumo financeiro, o app detalha quanto capital está investido no estoque e aponta os produtos que mais concentram dinheiro parado."
  - src: "/assets/images/projects/barba-e-tudo-app/barba-e-tudo-03.jpg"
    alt: "Tela de movimentações com abas de entradas e saídas, busca e lista de registros."
    caption: "A área de movimentações organiza entradas e saídas com busca, filtros e detalhamento suficiente para acompanhar o fluxo operacional da loja."
  - src: "/assets/images/projects/barba-e-tudo-app/barba-e-tudo-04.jpg"
    alt: "Tela de relatórios com filtros por perfil e período e botão para baixar PDF."
    caption: "Os relatórios transformam os dados do dia a dia em consultas mais objetivas, com filtros por período e exportação em PDF."
  - src: "/assets/images/projects/barba-e-tudo-app/barba-e-tudo-05.jpg"
    alt: "Tela de despesas com filtros por status, campo de busca e estado vazio para novas despesas."
    caption: "A área de despesas acompanha custos fixos e operacionais em um fluxo simples, inclusive quando ainda não há registros cadastrados."
  - src: "/assets/images/projects/barba-e-tudo-app/barba-e-tudo-06.jpg"
    alt: "Tela de produtos com busca, filtros e cards exibindo estoque, categoria e preços."
    caption: "O catálogo de produtos combina busca, filtros e visão consolidada de estoque, categoria e preços para agilizar consultas do dia a dia."
  - src: "/assets/images/projects/barba-e-tudo-app/barba-e-tudo-07.jpg"
    alt: "Detalhe da listagem de produtos com cards mostrando status, unidade em estoque e informações de precificação."
    caption: "Os cards de produto aprofundam a consulta com status, quantidade em estoque e faixas de preço sem exigir navegação excessiva."
  - src: "/assets/images/projects/barba-e-tudo-app/barba-e-tudo-08.jpg"
    alt: "Menu lateral do app com acessos para clientes, fornecedores, categorias e configurações."
    caption: "O menu lateral amplia o app para áreas de apoio da operação, como clientes, fornecedores, categorias, configurações e gestão da conta."
---

## Sobre o projeto

O Barba e tudo é um aplicativo de gestão criado para organizar a rotina interna de uma loja ligada ao universo da barbearia. A proposta foi reunir em um único produto os fluxos mais importantes da operação: estoque, movimentações de entrada e saída, despesas, cadastros de apoio e leitura dos indicadores que ajudam no acompanhamento financeiro do negócio.

Mais do que registrar dados, a ideia foi transformar esses dados em uma experiência prática de consulta. O app foi pensado para quem precisa bater o olho e entender rapidamente como a loja está operando, quanto há investido em estoque e onde estão os principais pontos de atenção, sem perder de vista regras de acesso e responsabilidades de cada perfil.

## Meu papel

Neste projeto, atuei na construção da experiência do produto e no desenvolvimento do aplicativo, buscando equilibrar clareza visual, rapidez de uso e organização da informação.

O trabalho também passou por estruturar a navegação, os fluxos de cadastro, consulta e análise, além de apoiar uma arquitetura modular por feature que facilitasse a evolução do sistema ao longo do tempo.

## O que este app entrega

- Dashboard com resumo financeiro da loja e indicadores de leitura imediata
- Controle de produtos com busca, status, categoria, unidade, estoque e precificação
- Registro e acompanhamento de movimentações de entrada e saída
- Área de despesas com filtros por status e acompanhamento de custos operacionais
- Relatórios com recortes por período e por perfil acompanhado, com opção de exportação em PDF
- Cadastros de apoio para clientes, fornecedores e categorias
- Navegação complementar para configurações, documentos legais e gestão da conta
- Autenticação e controle de acesso por perfil para separar leitura, operação e administração

## Como a experiência foi pensada

Uma das preocupações centrais foi reduzir atrito nas tarefas mais repetidas. Por isso, o app organiza a operação em seções bem delimitadas, usa filtros visuais simples e prioriza cards com informações resumidas antes de aprofundar cada fluxo.

A interface também foi desenhada para manter consistência entre as áreas do produto. Busca, chips de filtro, cards de resumo e a navegação principal aparecem como padrões recorrentes, o que ajuda a diminuir a curva de aprendizado no uso cotidiano. Esse cuidado conversa com a própria estrutura do projeto, que separa apresentação, domínio e infraestrutura em módulos por feature.

## Decisões de implementação

- Uso de Flutter para desenvolver uma base única do aplicativo com consistência visual entre as telas
- Arquitetura modular por feature, separando apresentação, domínio e infraestrutura para facilitar manutenção e crescimento do app
- Firebase Auth para autenticação, com regras de acesso por perfil em áreas como produtos, movimentações, despesas e cadastros administrativos
- Cloud Firestore como backend remoto e Drift como persistência local para apoiar uma experiência mais responsiva no dia a dia
- GetIt para composição de dependências e GoRouter para organizar navegação e redirecionamentos conforme autenticação e papel do usuário
- Foco em relatórios acionáveis, com filtros objetivos e exportação em PDF para compartilhamento e consulta
