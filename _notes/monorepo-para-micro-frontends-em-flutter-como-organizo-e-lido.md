---
title: "Monorepo para micro frontends em Flutter: como organizo e lido"
description: "Anotações sobre como tenho organizado monorepo Flutter pensado para micro frontends, com shell app, micro apps, pacotes compartilhados, Melos e CI."
date: 2026-06-04
locale: pt_BR
lang: pt-BR
topics:
  - "monorepo"
  - "Flutter"
  - "micro frontends"
---

## Sumário

- [Sumário](#sumário)
- [Introdução](#introdução)
- [O recorte deste texto](#o-recorte-deste-texto)
- [Estrutura do repositório](#estrutura-do-repositório)
  - [Shell app](#shell-app)
  - [Micro apps](#micro-apps)
  - [Pacotes compartilhados](#pacotes-compartilhados)
  - [Documentação](#documentação)
- [Limites entre pacotes](#limites-entre-pacotes)
  - [Dependências declaradas onde são usadas](#dependências-declaradas-onde-são-usadas)
  - [Direção das dependências](#direção-das-dependências)
  - [Pacotes compartilhados pequenos](#pacotes-compartilhados-pequenos)
- [Composição da aplicação](#composição-da-aplicação)
  - [Contrato de micro app](#contrato-de-micro-app)
  - [Registro no shell](#registro-no-shell)
  - [Rotas](#rotas)
  - [Navegação interna do micro app](#navegação-interna-do-micro-app)
  - [Eventos entre módulos](#eventos-entre-módulos)
- [Localização](#localização)
- [Melos e workspace](#melos-e-workspace)
  - [Bootstrap](#bootstrap)
  - [Testes](#testes)
  - [Análise estática](#análise-estática)
- [CI](#ci)
  - [Pull requests](#pull-requests)
  - [Main](#main)
- [Coisas que tento observar](#coisas-que-tento-observar)
- [Referências](#referências)

## Introdução

Esse texto reúne anotações sobre como tenho organizado e lidado com monorepo em Flutter quando a intenção é estruturar uma aplicação em micro frontends.

Não é um guia definitivo, nem uma tentativa de dizer que todo projeto deveria seguir esse formato. Também não é um texto sobre monorepo no sentido amplo, com vários apps independentes vivendo no mesmo repositório. É mais um registro para meu próprio estudo e memória sobre um recorte específico: um app shell compondo micro apps que fazem parte da mesma experiência.

O exemplo usado aqui é o repositório [dhianapereira/micro-frontends-example](https://github.com/dhianapereira/micro-frontends-example). Ele é pequeno de propósito, mas tenta simular decisões que aparecem em bases maiores: shell app, micro apps, contratos compartilhados, localização por módulo, scripts com Melos e CI filtrando pacotes afetados.

## O recorte deste texto

Nesse contexto, monorepo não é só "vários projetos na mesma pasta".

O recorte aqui é um único produto Flutter dividido em partes menores. Existe um app principal, que funciona como shell, e existem micro apps responsáveis por áreas de produto dentro da mesma aplicação.

Isso é diferente de um monorepo com vários apps independentes, por exemplo:

- um app de cliente;
- um app de entregador;
- um app administrativo;
- pacotes compartilhados entre eles.

Esse outro formato também pode fazer sentido, mas não é o foco deste texto.

Aqui, a pergunta é mais específica: como organizar um repositório em que o shell compõe módulos de feature, cada módulo expõe suas rotas e contratos, e tudo ainda precisa parecer uma aplicação só para quem usa?

Para mim, a parte mais importante é ter um único repositório com vários pacotes que fazem parte da mesma experiência, mas que não deveriam virar uma massa única em que qualquer pacote importa qualquer coisa.

No exemplo, o monorepo tem:

- um app principal, que funciona como shell;
- micro apps com telas e rotas próprias;
- pacotes compartilhados com contratos e infraestrutura pequena;
- documentação sobre arquitetura e criação de novos módulos;
- scripts de workspace para rodar bootstrap, testes e análise.

O que eu tento evitar é transformar o monorepo em um "monolito com pastas". A pasta estar no mesmo repositório não significa que todo mundo deveria conhecer todo mundo.

## Estrutura do repositório

A estrutura principal ficou assim:

```txt
base_app/
micro_apps/
  micro_app_home/
  micro_app_login/
packages/
  event_bus/
  foundations/
  navigation/
docs/
```

Gosto dessa separação porque ela deixa explícito o papel de cada coisa logo de cara.

### Shell app

O `base_app` é o host da aplicação.

Ele é responsável por:

- inicializar a aplicação;
- registrar os micro apps;
- controlar a rota raiz `/`;
- compor as rotas expostas pelos micro apps;
- configurar o `MaterialApp.router`;
- agregar delegates de localização;
- manter os targets Android e iOS.

No exemplo, ele não tenta ser dono das telas de feature. A tela de login fica no `micro_app_login`, a tela de home fica no `micro_app_home`, e o shell só orquestra.

Esse ponto é importante para mim porque shell app tende a virar uma pasta tentadora. Se qualquer fluxo começa a cair ali, aos poucos ele deixa de ser shell e vira o app inteiro.

### Micro apps

Os micro apps ficam dentro de `micro_apps/`.

Cada micro app é um pacote Flutter próprio, com:

- `pubspec.yaml`;
- `analysis_options.yaml`;
- arquivos de localização;
- telas e widgets;
- configuração do próprio micro app;
- testes.

Por exemplo:

```txt
micro_apps/micro_app_login/
  lib/
    micro_app_login.dart
    src/
      configs/
        constants.dart
        micro_app.dart
      events/
        auth_success_event.dart
      l10n/
      login_page.dart
  test/
```

O micro app de login conhece a tela de login e o evento de autenticação bem-sucedida. Ele não precisa conhecer como o shell vai reagir a esse evento.

### Pacotes compartilhados

Os pacotes compartilhados ficam em `packages/`.

No exemplo existem três:

- `foundations`, com contratos básicos como `MicroApp`;
- `navigation`, com `AppRoute` e `AppRouter`;
- `event_bus`, com `AppEvent` e `EventBus`.

O ponto que mais quero lembrar aqui é que "compartilhado" não deveria significar "qualquer coisa que não sei onde colocar".

Um pacote compartilhado precisa ter um motivo claro para existir. Se ele começa a juntar helpers aleatórios, constantes de feature, wrappers de tudo e dependências convenientes, ele provavelmente está escondendo acoplamento.

### Documentação

O repositório também tem uma pasta `docs/`.

Ela tem dois arquivos principais:

- `architecture.md`, descrevendo a estrutura, responsabilidades e direção de dependências;
- `creating_a_micro_app.md`, documentando o caminho esperado para criar um novo micro app.

Tenho gostado desse tipo de documentação pequena e próxima do código. Não precisa ser uma especificação enorme. Mas ajuda muito quando o projeto tem convenções que não são óbvias só olhando uma classe isolada.

## Limites entre pacotes

O maior cuidado que tento ter em monorepo é com limite.

É muito fácil um monorepo dar a sensação de que tudo está perto, então tudo pode ser importado. Só que essa proximidade física engana. Se o `home` importa algo interno do `login`, ou se um pacote compartilhado começa a depender de uma feature específica, o custo aparece depois.

### Dependências declaradas onde são usadas

No exemplo, cada pacote declara suas próprias dependências.

O `micro_app_login` depende de `event_bus` porque emite um evento quando o botão de login é pressionado:

```yaml
dependencies:
  event_bus:
    path: ../../packages/event_bus
  foundations:
    path: ../../packages/foundations
  navigation:
    path: ../../packages/navigation
```

Já o `micro_app_home` não depende de `event_bus`, porque ele não usa eventos:

```yaml
dependencies:
  foundations:
    path: ../../packages/foundations
  navigation:
    path: ../../packages/navigation
```

Isso parece pequeno, mas gosto dessa disciplina. A dependência fica visível onde ela realmente é necessária.

Também evita aquela situação em que um pacote depende de um pacote "core" enorme só para acessar uma coisa simples, e de brinde recebe várias dependências indiretas que não têm nada a ver com ele.

### Direção das dependências

A direção de dependências que tentei manter foi:

```txt
base_app
  -> micro_apps/*
  -> packages/*

micro_apps/*
  -> packages/foundations
  -> packages/navigation
  -> packages/event_bus, quando necessário

packages/*
  -> sem dependência de base_app ou micro apps
```

O shell pode conhecer os micro apps porque ele precisa compor a aplicação.

Os micro apps podem conhecer contratos compartilhados porque precisam expor rotas e participar do ciclo de vida.

Os pacotes compartilhados não deveriam conhecer o shell nem uma feature específica.

Essa direção ajuda a responder uma pergunta simples: "se eu mexer nesse pacote, quem pode quebrar?".

### Pacotes compartilhados pequenos

O pacote `foundations` é um bom exemplo do nível de simplicidade que tentei manter.

Ele expõe o contrato `MicroApp`:

```dart
abstract class MicroApp {
  String get microAppName;
  List<AppRoute> get routes;
  Future<void> injectionsRegister();
  void registerEventHandlers();
}
```

Só isso já dá para o shell uma forma de registrar módulos sem conhecer detalhes internos de cada feature.

Ao mesmo tempo, `foundations` não guarda:

- lógica de feature;
- setup de router;
- event bus;
- arquivos de localização;
- injeção de dependências concreta;
- dependências úteis só para um micro app.

Quanto menor esse tipo de pacote fica, menor a chance de ele virar um ponto de acoplamento global.

## Composição da aplicação

A composição acontece no `base_app`.

Ele instancia os micro apps, coleta rotas, registra inicializações e configura como a aplicação reage a eventos globais.

### Contrato de micro app

Cada micro app implementa `MicroApp`.

No `micro_app_login`, a implementação é assim:

```dart
class MicroAppLogin implements MicroApp {
  @override
  String get microAppName => Constants.microAppName;

  @override
  List<AppRoute> get routes => [
    AppRoute.page(path: '/login', builder: (_) => const LoginPage()),
    AppRoute.page(
      path: '/login/forgot-password',
      builder: (_) => const ForgotPasswordPage(),
    ),
  ];

  @override
  Future<void> injectionsRegister() async {}

  @override
  void registerEventHandlers() {}
}
```

O que gosto nesse formato é que o micro app expõe uma superfície pequena:

- nome;
- rotas;
- ponto de registro de dependências;
- ponto de registro de handlers.

Hoje os métodos de injeção e eventos estão vazios nos micro apps do exemplo, mas eles existem como ponto de extensão. Se o módulo crescer, o contrato já tem um lugar previsível para esse setup.

### Registro no shell

No `base_app`, os micro apps são registrados em uma lista:

```dart
final List<MicroApp> _microApps = [MicroAppLogin(), MicroAppHome()];
```

Depois o shell coleta as rotas:

```dart
List<AppRoute> get _microAppRoutes {
  return _microApps.expand((microApp) => microApp.routes).toList();
}
```

E inicializa cada micro app:

```dart
Future<void> _registerInjections() async {
  for (final microApp in _microApps) {
    await microApp.injectionsRegister();
  }
}
```

É uma composição manual e simples. Para esse exemplo, eu prefiro isso a uma descoberta automática mais esperta. A lista explícita deixa claro quais módulos fazem parte do app.

### Rotas

O pacote `navigation` concentra a integração com `go_router`.

Os micro apps não exportam `GoRoute` diretamente. Eles exportam `AppRoute`:

```dart
class AppRoute {
  const AppRoute({required this.path, required this.builder});

  factory AppRoute.page({
    required String path,
    required WidgetBuilder builder,
  }) {
    return AppRoute(path: path, builder: (context, _) => builder(context));
  }

  final String path;
  final AppRouteBuilder builder;
}
```

O `AppRouter` transforma esses contratos em rotas do `GoRouter` e também implementa o contrato `AppNavigator`.

Ele também valida duas coisas que acho importantes:

- a rota raiz precisa ser `/`;
- micro apps não podem registrar `/`;
- rotas duplicadas geram erro.

No código:

```dart
if (reservedPaths.contains(route.path)) {
  throw StateError(
    'Route "${route.path}" is reserved by the shell and cannot be '
    'registered by a micro app.',
  );
}

final previousRoute = routesByPath[route.path];
if (previousRoute != null) {
  throw StateError('Duplicated route "${route.path}" found.');
}
```

Gosto de falhar cedo nesses casos. Se dois micro apps registram `/profile`, por exemplo, eu prefiro que a aplicação quebre no setup do que descobrir depois que uma rota sobrescreveu a outra silenciosamente.

### Navegação interna do micro app

Para navegação de uma página de um micro app para outra página do mesmo micro app, o exemplo usa o pacote `navigation`.

No `micro_app_login`, o próprio micro app declara a rota principal e a rota de recuperação de senha:

```dart
class MicroAppLogin implements MicroApp {
  @override
  List<AppRoute> get routes => [
    AppRoute.page(path: '/login', builder: (_) => const LoginPage()),
    AppRoute.page(
      path: '/login/forgot-password',
      builder: (_) => const ForgotPasswordPage(),
    ),
  ];
}
```

Assim, a rota `/login/forgot-password` continua pertencendo ao `micro_app_login`, mas o shell ainda consegue compor tudo em um único router.

Para navegar, a `LoginPage` não importa `go_router` diretamente. Ela usa a extensão `context.appNavigator`, exportada pelo pacote `navigation`:

```dart
TextButton(
  key: const ValueKey('forgot-password-button'),
  onPressed: () {
    context.appNavigator.push('/login/forgot-password');
  },
  child: Text(context.l10n.forgotPassword),
)
```

A tela de recuperação também usa o mesmo contrato para voltar:

```dart
TextButton(
  key: const ValueKey('back-to-login-button'),
  onPressed: () {
    context.appNavigator.pop();
  },
  child: Text(context.l10n.backToLogin),
)
```

Por baixo, o `AppNavigator` ainda usa `GoRouter`, mas isso fica escondido no pacote `navigation`:

```dart
abstract class AppNavigator {
  void go(String location, {Object? extra});

  Future<T?> push<T extends Object?>(String location, {Object? extra});

  void pop<T extends Object?>([T? result]);

  bool canPop();
}
```

Esse detalhe deixa a decisão mais coerente para mim. Os micro apps continuam tendo uma forma simples de navegar, mas não ficam espalhando chamadas diretas para a lib de roteamento.

Ainda é uma navegação em um router único, porque quem monta a aplicação é o shell. A diferença é que a rota interna continua sendo declarada pelo micro app que é dono daquela área.

Para navegação dentro do mesmo micro app, essa regra me parece razoável:

- o micro app declara suas próprias rotas;
- o shell compõe as rotas declaradas;
- a página navega para rotas do próprio micro app usando um contrato do pacote `navigation`;
- navegações entre micro apps ou decisões globais continuam no shell ou passam por eventos de alto nível.

### Eventos entre módulos

Para comunicação entre módulos, o exemplo usa um `event_bus` bem pequeno.

O `micro_app_login` define o evento que pertence ao comportamento dele:

```dart
class AuthSuccessEvent extends AppEvent {
  const AuthSuccessEvent();
}
```

Na tela de login, o botão emite esse evento:

```dart
onPressed: () {
  EventBus.emit(const AuthSuccessEvent());
}
```

O shell escuta:

```dart
EventBus.listen((event) {
  if (event is AuthSuccessEvent) {
    _appRouter.go('/home');
  }
});
```

Essa separação é um detalhe que eu gosto bastante.

O login sabe dizer "autenticação deu certo". O shell decide "quando autenticação dá certo, navego para home". Assim, a decisão de navegação fica centralizada no lugar que compõe o app.

## Localização

Cada micro app é dono das strings que exibe.

No `micro_app_login`, os ARBs ficam em:

```txt
lib/src/l10n/arb/app_en.arb
lib/src/l10n/arb/app_pt.arb
```

E o `l10n.yaml` aponta a geração para dentro do próprio pacote:

```yaml
arb-dir: lib/src/l10n/arb
template-arb-file: app_en.arb
output-localization-file: micro_app_login_localizations.dart
output-class: MicroAppLoginLocalizations
output-dir: lib/src/l10n/generated
synthetic-package: false
nullable-getter: false
```

O micro app exporta uma extensão `context.l10n` pela biblioteca pública.

Depois, o shell agrega os delegates:

```dart
localizationsDelegates: const [
  GlobalMaterialLocalizations.delegate,
  GlobalCupertinoLocalizations.delegate,
  GlobalWidgetsLocalizations.delegate,
  MicroAppHomeLocalizations.delegate,
  MicroAppLoginLocalizations.delegate,
],
supportedLocales: const [Locale('en'), Locale('pt')],
```

Essa escolha mantém as strings perto de quem usa.

Eu prefiro isso a criar uma pasta global de traduções para tudo, porque a pasta global tende a crescer junto com o acoplamento. Se uma tela pertence ao micro app de login, faz sentido que as strings dela também pertençam a ele.

## Melos e workspace

O repositório usa Dart workspace e Melos.

No `pubspec.yaml` da raiz, os pacotes são registrados assim:

```yaml
workspace:
  - base_app
  - packages/foundations
  - packages/event_bus
  - packages/navigation
  - micro_apps/micro_app_home
  - micro_apps/micro_app_login
```

E cada pacote usa:

```yaml
resolution: workspace
```

Isso ajuda a tratar o repositório como um conjunto coordenado de pacotes, sem precisar resolver cada um como se fosse um projeto completamente separado.

### Bootstrap

O script principal de setup é:

```yaml
clean-and-bs:
  description: Clean the workspace and fetch Flutter dependencies
  run: |
    melos clean
    melos bootstrap
```

No dia a dia, eu gosto de ter um comando óbvio para "deixar o workspace saudável de novo".

Em monorepo, é comum mexer em vários pacotes, alterar dependências locais e gerar arquivos. Um comando de bootstrap bem conhecido reduz atrito.

### Testes

Para testes, o repositório tem:

```yaml
test:all:
  run: melos run test --no-select

test:
  run: |
    melos exec -c 1 --fail-fast -- \
      "flutter test --no-pub"
  packageFilters:
    dirExists:
      - test
```

Algumas escolhas aqui são intencionais:

- rodar apenas pacotes com pasta `test`;
- usar `--no-pub`, porque o bootstrap já resolveu dependências;
- usar `--fail-fast`, para parar cedo quando algo quebra;
- usar concorrência `-c 1`, que deixa a execução mais previsível.

Dependendo do projeto, dá para aumentar concorrência. Mas quando estou ajustando arquitetura, prefiro previsibilidade primeiro.

### Análise estática

O README também documenta o comando:

```bash
melos exec -c 1 --fail-fast -- flutter analyze --no-pub
```

Além disso, existe um `analysis_options.yaml` na raiz com regras compartilhadas, e cada pacote tem seu próprio `analysis_options.yaml`.

Gosto desse formato porque o monorepo mantém um padrão comum, mas cada pacote continua sendo uma unidade analisável.

## CI

O CI é uma das partes em que monorepo mais pede cuidado.

Se toda alteração em documentação roda análise e teste de todos os pacotes, o pipeline fica caro e barulhento. Mas, se o filtro for restritivo demais, uma mudança pode quebrar pacotes dependentes sem que o CI perceba.

No exemplo, tentei separar o comportamento entre pull request e `main`.

### Pull requests

Em PR, o workflow:

- detecta se houve mudança em arquivos Dart ou em arquivos que afetam pacotes Flutter;
- pula setup de Flutter quando a mudança é só documentação ou arquivo sem impacto runtime;
- usa `melos --diff` para selecionar pacotes afetados;
- usa `--include-dependents` para incluir pacotes que dependem do que mudou;
- roda análise nos afetados;
- roda testes nos afetados que têm pasta `test`.

Um detalhe importante é que mudanças em arquivos da raiz, como `pubspec.yaml`, `pubspec.lock` ou `analysis_options.yaml`, disparam análise/testes do workspace inteiro. Faz sentido, porque esse tipo de arquivo pode afetar qualquer pacote.

Esse é o equilíbrio que eu tento buscar: economizar quando a mudança é pequena, mas ampliar a validação quando a alteração muda resolução de dependência ou regra compartilhada.

### Main

No `main`, o workflow roda a suíte completa com cobertura:

```bash
dart run melos exec -c 1 --fail-fast \
  --dir-exists=test \
  -- flutter test --coverage --no-pub
```

Depois, um script junta os arquivos `lcov.info` e atualiza o badge de cobertura no README por PR automático.

Eu não acho que badge de cobertura seja a coisa mais importante do mundo, mas gosto do fluxo por um motivo: ele obriga a cobertura publicada a vir do estado real da branch principal, não de uma execução local solta.

## Coisas que tento observar

Algumas perguntas que quero manter por perto quando estiver lidando com esse tipo de monorepo:

- Esse pacote está importando algo interno de outro módulo sem necessidade?
- Essa dependência está declarada no pacote que realmente usa?
- Esse pacote compartilhado tem uma responsabilidade clara?
- O shell está só compondo ou começou a ter regra de feature?
- Uma mudança nesse pacote afeta quais outros pacotes?
- O CI está testando pacotes dependentes quando um pacote base muda?
- A documentação explica as decisões de arquitetura sem depender de conhecimento que só está na cabeça de algumas pessoas?
- As strings estão perto da feature que as exibe?
- As rotas falham cedo quando há duplicidade?
- A navegação interna do micro app passa por um contrato claro?
- Eventos globais estão representando acontecimentos relevantes ou viraram atalho para qualquer comunicação?

O ponto principal, para mim, é que monorepo não resolve organização sozinho.

Ele facilita algumas coisas: refatoração coordenada, versionamento único, scripts compartilhados, CI centralizado e visibilidade do sistema como um todo.

Mas também pode piorar acoplamento se os limites não forem cuidados. Então tenho tentado tratar esse formato como uma forma de aproximar micro apps sem apagar as fronteiras entre eles.

## Referências

- [Melos](https://melos.invertase.dev/)
- [Dart workspaces](https://dart.dev/tools/pub/workspaces)
- [Micro Frontends, por Cam Jackson no Martin Fowler](https://martinfowler.com/articles/micro-frontends.html)
- [Micro Frontends, por Michael Geers](https://micro-frontends.org/)
