---
title: "Design System em Flutter: cuidados que tento tomar ao implementar"
description: "Um registro sobre cuidados que tenho ao implementar componentes de design system em Flutter, especialmente acessibilidade, tokens, estilos e componentes com muitos estados."
date: 2026-06-14
locale: pt_BR
lang: pt-BR
topics:
  - "design system"
  - "Flutter"
  - "acessibilidade"
---

## Sumário

- [Sumário](#sumário)
- [Introdução](#introdução)
- [O recorte deste texto](#o-recorte-deste-texto)
- [Estrutura do projeto](#estrutura-do-projeto)
  - [Pacote do design system](#pacote-do-design-system)
  - [Widgetbook](#widgetbook)
- [Foundations e tokens](#foundations-e-tokens)
  - [Tokens primitivos](#tokens-primitivos)
  - [Tokens semânticos](#tokens-semânticos)
  - [Tema como ponto de integração](#tema-como-ponto-de-integração)
- [Separação entre componente e estilo](#separação-entre-componente-e-estilo)
  - [Por que separar](#por-que-separar)
  - [Botões como exemplo](#botões-como-exemplo)
  - [Estados importantes em um lugar só](#estados-importantes-em-um-lugar-só)
- [Acessibilidade como parte da API](#acessibilidade-como-parte-da-api)
  - [Labels semânticos](#labels-semânticos)
  - [Área mínima de toque](#área-mínima-de-toque)
  - [Semântica de estado](#semântica-de-estado)
  - [Texto longo e layouts limitados](#texto-longo-e-layouts-limitados)
- [Componentes com muitos estados](#componentes-com-muitos-estados)
  - [Variantes e tamanhos](#variantes-e-tamanhos)
  - [Loading e disabled](#loading-e-disabled)
  - [Erro, helper text e conteúdo opcional](#erro-helper-text-e-conteúdo-opcional)
- [Para fechar](#para-fechar)
- [Referências](#referências)

## Introdução

Esse texto guarda alguns cuidados que tento tomar quando implemento componentes de design system em Flutter.

Não é um guia definitivo, nem uma tentativa de dizer que todo design system precisa ser feito desse jeito. É mais um recorte do que tenho usado como referência para organizar o código, reduzir decisões espalhadas e lembrar de coisas que são fáceis de deixar para depois, principalmente acessibilidade.

O exemplo usado aqui é o repositório [dhianapereira/design-system-example](https://github.com/dhianapereira/design-system-example). Ele é pequeno de propósito, mas tenta simular decisões que aparecem em bases maiores: tokens, tema claro e escuro, componentes testáveis, Widgetbook e alguns cuidados com semântica.

Quando penso em design system no código, tento não olhar só para aparência. A aparência é importante, claro, mas o componente também precisa carregar comportamento, estados, acessibilidade e uma API que seja difícil de usar de um jeito ruim.

Para mim, a implementação começa a valer mais quando ela ajuda quem vai consumir o componente a fazer a coisa certa com menos esforço.

## O recorte deste texto

O recorte aqui é implementação de componentes em Flutter.

Não vou entrar tanto na parte de processo de design, governança, Figma, contribuição entre times ou versionamento de biblioteca. Esses temas também importam bastante, mas este texto está mais perto do código.

No exemplo, a organização tenta manter separados alguns pontos que começam a se misturar com facilidade: variantes, tamanhos, estados, tema claro e escuro e acessibilidade.

A estrutura principal é:

```txt
apps/
  widgetbook/

packages/
  design_system/
    lib/
    test/
```

Dentro do pacote `design_system`, existem algumas divisões:

```txt
lib/
  src/
    components/
    foundations/
    theme/
```

Essa separação me ajuda a pensar em camadas:

- `foundations`, com tokens mais básicos;
- `theme`, com valores semânticos que variam por tema;
- `components`, com a implementação dos componentes;
- `styles`, dentro de cada grupo de componente, com a resolução visual de variantes e tamanhos.

Não é uma estrutura complexa, mas ela ajuda a separar decisões que têm naturezas diferentes.

## Estrutura do projeto

### Pacote do design system

O pacote `packages/design_system` é onde ficam os componentes e os contratos públicos.

A ideia é que uma aplicação que consome o design system importe esse pacote e use componentes como:

```dart
DSButton(
  label: 'Continue',
  onPressed: () {},
)
```

ou:

```dart
DSTextField(
  label: 'Email',
  hintText: 'name@example.com',
  keyboardType: TextInputType.emailAddress,
)
```

Tento manter essa API com nomes explícitos. Em componente de design system, o custo de uma API confusa aparece muitas vezes, porque o componente tende a ser usado em muitos lugares.

Também tento evitar que quem usa o componente precise conhecer demais a implementação interna. No caso de um botão, por exemplo, a tela que consome o design system não precisa montar `ButtonStyle`, lembrar padding, lembrar tamanho mínimo, decidir cor de loading e ainda cuidar da semântica básica. Se isso acontece em todo uso, o componente está entregando pouco.

### Widgetbook

O projeto também tem um app em `apps/widgetbook`.

Tenho gostado de usar Widgetbook como uma forma de deixar os componentes navegáveis fora da aplicação real. Isso ajuda a testar visualmente combinações que talvez não apareçam todas no produto no mesmo dia.

No exemplo, o use case do `DSButton` permite mexer em:

- label;
- variante;
- tamanho;
- ícone;
- posição do ícone;
- loading;
- disabled.

Esse tipo de playground é útil porque componente de design system quase nunca tem um único estado. O botão "pronto" não é só o botão primário habilitado. Ele também precisa fazer sentido desabilitado, carregando, com ícone, sem ícone, pequeno, grande, em tema claro e em tema escuro.

## Foundations e tokens

### Tokens primitivos

No exemplo, os tokens mais básicos ficam em `foundations`.

Existem arquivos para:

- `DSPalette`;
- `DSSpacing`;
- `DSRadius`;
- `DSElevation`;
- `DSTypography`;
- `DSMotion`;
- `DSSize`;
- `DSBreakpoints`;
- `DSOpacity`;
- `DSBorderWidth`.

Ter esses valores com nomes próprios ajuda a criar uma linguagem compartilhada no código.

Em vez de espalhar `48`, `16`, `BorderRadius.circular(8)` e `Duration(milliseconds: 150)` por vários componentes, prefiro que essas decisões passem por tokens. Isso deixa mais fácil entender se um valor é uma decisão de design system ou só um número perdido.

Um exemplo pequeno é `DSSize.minTouchTarget`:

```dart
abstract final class DSSize {
  static const double minTouchTarget = 48;
}
```

Esse token aparece nos componentes interativos para garantir uma área mínima de toque. O valor em si é simples, mas o nome deixa a intenção muito mais clara.

### Tokens semânticos

Uma coisa que tento evitar é fazer componente depender direto da paleta primitiva.

No exemplo, `DSColorScheme` cria uma camada semântica:

```dart
class DSColorScheme {
  const DSColorScheme({
    required this.background,
    required this.surface,
    required this.textPrimary,
    required this.textDisabled,
    required this.border,
    required this.focus,
    required this.primary,
    required this.onPrimary,
    required this.secondary,
    required this.onSecondary,
    required this.error,
    required this.onError,
  });
}
```

Essa camada é importante porque o componente não precisa saber se a cor vem de `blue600`, `neutral900` ou `red300`.

O botão primário precisa saber que usa `primary` e `onPrimary`. O campo com erro precisa saber que usa `error` e talvez `onError`. A decisão de qual azul representa `primary` no tema claro ou no tema escuro fica em outro lugar. Para mim, isso reduz acoplamento entre componente e paleta e deixa a intenção mais fácil de revisar. Quando leio `colors.textDisabled`, entendo o papel daquela cor. Quando leio `DSPalette.neutral500`, preciso inferir.

### Tema como ponto de integração

No exemplo, `DSThemeData` é uma `ThemeExtension`.

Isso permite plugar os valores do design system no `ThemeData` do Flutter:

```dart
extension DSThemeBuildContext on BuildContext {
  DSThemeData get dsTheme {
    final theme = Theme.of(this).extension<DSThemeData>();
    assert(
      theme != null,
      'DSThemeData was not found. Use DSTheme.light or DSTheme.dark.',
    );
    return theme ?? DSThemeData.light;
  }
}
```

Esse formato mantém os componentes integrados ao ecossistema do Flutter, mas sem depender só dos campos padrão do `ThemeData`.

O componente pode ler:

```dart
final colors = context.dsTheme.colors;
```

e resolver seus estilos a partir dali.

Esse ponto também ajuda com tema claro e escuro. O componente não precisa ter um `if` para light e outro para dark. Ele recebe um esquema de cores já resolvido e trabalha com papéis semânticos.

## Separação entre componente e estilo

### Por que separar

Uma coisa que venho tentando fazer é separar bem a responsabilidade do widget e a responsabilidade de estilo.

Costumo deixar o widget cuidando de composição, acessibilidade, callbacks e comportamento.

E deixo o estilo cuidando de:

- cor;
- padding;
- tamanho;
- borda;
- tipografia;
- raio;
- variações por tamanho;
- variações por variante.

Quando tudo isso fica dentro do método `build`, o componente até começa simples, mas costuma crescer rápido. Primeiro entram `primary`, `secondary` e `outline`; depois `sm`, `md` e `lg`; depois disabled, loading e erro. Quando vejo, o `build` virou uma tabela de decisão espalhada.

Separar estilo não resolve toda a complexidade, mas ajuda a colocar cada tipo de decisão em um lugar previsível.

### Botões como exemplo

O botão é um bom exemplo porque parece simples, mas normalmente acumula muitos estados.

No exemplo, o `DSButton` recebe:

- `label`;
- `onPressed`;
- `variant`;
- `size`;
- `icon`;
- `iconPosition`;
- `isLoading`;
- `loadingBuilder`;
- `animationBuilder`;
- `semanticLabel`.

Se cada combinação dessas propriedades fosse resolvida diretamente no `build`, o componente ficaria difícil de ler.

Por isso, o estilo fica em `DSButtonStyle`:

```dart
final style = DSButtonStyle.resolve(
  variant: variant,
  size: size,
  colors: colors,
);
```

E o tamanho fica em `DSButtonSizeStyle`:

```dart
static DSButtonSizeStyle resolve(DSButtonSize size) {
  return switch (size) {
    DSButtonSize.sm => const DSButtonSizeStyle(...),
    DSButtonSize.md => const DSButtonSizeStyle(...),
    DSButtonSize.lg => const DSButtonSizeStyle(...),
  };
}
```

Esse desenho agrupa as decisões:

- variante resolve cores e borda;
- tamanho resolve altura, padding, ícone e espaçamento;
- componente decide qual widget Flutter usar e como compor conteúdo, loading e semântica.

Isso deixa o `DSButton` mais próximo de uma composição e menos de uma lista de condicionais visuais.

### Estados importantes em um lugar só

Outro cuidado é não deixar estados importantes implícitos demais.

No `DSButton`, existe um getter:

```dart
bool get _isEnabled => onPressed != null && !isLoading;
```

Parece pequeno, mas esse tipo de centralização deixa claro que loading também desabilita interação.

Sem isso, é fácil cair em uma situação em que o botão mostra loading, mas ainda aceita toque. Ou a UI parece desabilitada, mas o callback ainda dispara.

Esse tipo de detalhe fica ainda mais importante em componentes reutilizados. Um bug pequeno no componente base vira um bug repetido em várias telas.

## Acessibilidade como parte da API

### Labels semânticos

Tenho tentado tratar acessibilidade como parte da API pública do componente.

No exemplo, vários componentes recebem `semanticLabel` ou `semanticsLabel`:

- `DSButton`;
- `DSIconButton`;
- `DSTextField`;
- `DSCheckbox`;
- `DSRadio`;
- `DSSwitch`;
- `DSDropdown`;
- `DSBadge`;
- `DSCard`;
- `DSText`.

Isso é especialmente importante quando o texto visível não é suficiente.

Um botão com label "OK" pode ser visualmente aceitável em um contexto específico, mas talvez precise de um label mais descritivo para tecnologia assistiva. Um `DSIconButton`, por ser só ícone, exige `semanticLabel`.

No exemplo, isso aparece dentro da implementação do `DSIconButton`, que repassa o mesmo texto para o `tooltip` do `IconButton` do Flutter:

```dart
IconButton(
  tooltip: semanticLabel,
  onPressed: _isEnabled ? onPressed : null,
  ...
)
```

Essa decisão evita que um botão só com ícone fique mudo. A API faz a pessoa nomear a ação.

### Área mínima de toque

Outro cuidado é área mínima de toque.

Às vezes o visual do componente é pequeno, mas a área interativa precisa continuar confortável. No exemplo, botões e controles de seleção usam `DSSize.minTouchTarget`.

No `DSButton`, por exemplo:

```dart
ConstrainedBox(
  constraints: const BoxConstraints(
    minHeight: DSSize.minTouchTarget,
    minWidth: DSSize.minTouchTarget,
  ),
  child: ...
)
```

No `DSCheckbox`, o controle fica dentro de um `SizedBox.square` com esse tamanho mínimo.

Com isso, a decisão não depende de cada tela lembrar de adicionar padding em volta do componente. O próprio componente já nasce com uma área mínima mais segura.

### Semântica de estado

Além do label, o estado também precisa ser comunicado.

No exemplo, dá para ver esse cuidado em componentes que expõem corretamente:

- botão habilitado ou desabilitado;
- checkbox marcado ou desmarcado;
- switch ligado ou desligado;
- radio selecionado;
- card interativo com semântica de botão;
- card estático sem semântica de botão.

Esse ponto é importante porque acessibilidade não é só "ter um texto alternativo".

Um checkbox precisa expor que é um checkbox e se está marcado. Um switch precisa expor se está ligado. Um card clicável precisa ser percebido como uma ação, mas um card estático não precisa fingir que é interativo.

O uso de `MergeSemantics` em componentes como checkbox, radio e switch com label também ajuda a tratar controle e texto como uma unidade para leitura.

### Texto longo e layouts limitados

Um cuidado que às vezes fica esquecido é o comportamento com texto longo.

No exemplo, o `DSCheckbox` lida com labels longas em layouts com largura limitada e também em cenários horizontais sem limite finito.

Isso parece detalhe, mas design system precisa sobreviver a conteúdo real.

Na prática, labels mudam, traduções ficam maiores, nomes de produtos crescem, erros podem vir de API, e uma tela que parecia perfeita com "Email" pode quebrar com um texto maior.

Por isso tento fazer o componente lidar com `Flexible`, constraints e conteúdo opcional em vez de assumir que todo texto vai caber.

## Componentes com muitos estados

### Variantes e tamanhos

Uma forma que tenho usado para controlar complexidade é representar variações como enums pequenos.

No exemplo:

```dart
enum DSButtonVariant {
  primary,
  secondary,
  outline,
}
```

e:

```dart
enum DSButtonSize {
  sm,
  md,
  lg,
}
```

Isso deixa a API fechada o suficiente para ser previsível.

Se qualquer tela pode passar uma cor, um padding e uma altura diferentes, o componente vira quase um wrapper fino em cima do Flutter. Às vezes isso é necessário, mas para design system eu prefiro começar com opções nomeadas e bem testadas.

Isso não significa que nunca exista customização. No próprio `DSButton`, há `loadingBuilder` e `animationBuilder`. Mas essas customizações são pontos específicos, não uma abertura completa para desmontar o componente.

### Loading e disabled

Loading é um estado que tento modelar explicitamente.

No `DSButton`, `isLoading` faz algumas coisas ao mesmo tempo:

- troca o conteúdo por um indicador;
- desabilita a interação;
- mantém a semântica de botão;
- usa a cor de foreground resolvida para aquele estilo.

Esse estado poderia ser feito fora do componente, repetido tela por tela. Mas prefiro colocar essa regra dentro do design system porque ela tende a ser recorrente e porque loading não é só aparência. Ele muda comportamento.

### Erro, helper text e conteúdo opcional

Campos, checkboxes, radios e dropdowns costumam ter mais combinações do que parecem.

Um checkbox pode ter:

- label;
- helper text;
- error text;
- estado marcado;
- estado desmarcado;
- estado indeterminado;
- disabled;
- tamanho diferente.

No exemplo, o `DSCheckbox` trata `errorText` como informação visual e comportamental:

- exibe o texto de erro;
- marca o `Checkbox` com `isError`;
- usa cores de erro;
- preserva a semântica do controle.

Também existe um assert para evitar valor nulo quando `tristate` é falso:

```dart
assert(
  tristate || value != null,
  'value cannot be null when tristate is false.',
);
```

Esse tipo de validação explicita uma regra de uso. Em vez de aceitar uma combinação inválida e falhar de um jeito estranho depois, o componente aponta o problema perto da origem.

## Para fechar

O ponto principal desse cuidado todo é tentar reduzir a quantidade de decisões repetidas nas telas.

Se cada tela precisa lembrar de acessibilidade, padding, loading, disabled, cor, ícone, tema e erro, o design system provavelmente não está carregando a complexidade que eu esperaria dele.

Mas também tento tomar cuidado para não transformar o design system em uma abstração pesada demais. O equilíbrio que venho buscando é: componentes com comportamento consistente, APIs explícitas e pontos de customização bem escolhidos.

## Referências

- [Flutter: ThemeExtension](https://api.flutter.dev/flutter/material/ThemeExtension-class.html)
- [Flutter: Semantics](https://api.flutter.dev/flutter/widgets/Semantics-class.html)
- [Flutter: MergeSemantics](https://api.flutter.dev/flutter/widgets/MergeSemantics-class.html)
- [Widgetbook](https://docs.widgetbook.io/)
