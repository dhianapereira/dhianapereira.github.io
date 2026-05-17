---
title: "Testes em Flutter: anotações e práticas que uso"
description: "Um conjunto de práticas, aprendizados e anotações que venho acumulando escrevendo testes em Flutter."
date: 2026-05-17
locale: pt_BR
lang: pt-BR
topics:
  - "testes"
  - "Flutter"
---

## Sumário

- [Sumário](#sumário)
- [Introdução](#introdução)
- [Organização e convenções](#organização-e-convenções)
  - [Testes precisam ser simples de ler](#testes-precisam-ser-simples-de-ler)
  - [Nomenclatura](#nomenclatura)
  - [Cada teste deve validar uma coisa principal](#cada-teste-deve-validar-uma-coisa-principal)
  - [AAA e Given / When / Then](#aaa-e-given--when--then)
  - [Estrutura das pastas](#estrutura-das-pastas)
  - [Dummies, fakes e mocks](#dummies-fakes-e-mocks)
    - [Dummy](#dummy)
    - [Fake](#fake)
    - [Mock](#mock)
  - [Mocks compartilhados](#mocks-compartilhados)
  - [Dependências por construtor](#dependências-por-construtor)
  - [Encapsular libs externas](#encapsular-libs-externas)
  - [setUp, tearDown e isolamento](#setup-teardown-e-isolamento)
  - [Rodar testes em ordem aleatória](#rodar-testes-em-ordem-aleatória)
- [Testes unitários](#testes-unitários)
  - [O que costumo priorizar](#o-que-costumo-priorizar)
  - [O que geralmente não me traz tanto retorno](#o-que-geralmente-não-me-traz-tanto-retorno)
  - [Exemplo](#exemplo)
- [Testes de widget](#testes-de-widget)
  - [O que costumo validar](#o-que-costumo-validar)
  - [GetIt nesse nível](#getit-nesse-nível)
  - [Widgets com animação](#widgets-com-animação)
  - [Exemplo](#exemplo-1)
- [Golden tests com Alchemist](#golden-tests-com-alchemist)
  - [Por que tenho preferido alchemist](#por-que-tenho-preferido-alchemist)
  - [O que costumo cobrir](#o-que-costumo-cobrir)
  - [Tamanho de tela](#tamanho-de-tela)
  - [Exemplo](#exemplo-2)
  - [Sobre manutenção](#sobre-manutenção)
- [Testes de integração](#testes-de-integração)
  - [O que costumo validar](#o-que-costumo-validar-1)
  - [Exemplo do fluxo principal](#exemplo-do-fluxo-principal)
- [Referências](#referências)

## Introdução

Esse texto reúne anotações e práticas que venho acumulando ao escrever testes em Flutter.

Não é um guia definitivo nem uma regra sobre como testes devem ser feitos. É só um recorte do que tem funcionado para mim e do que venho refinando nos projetos em que trabalhei.

Os exemplos usados aqui foram adaptados principalmente do projeto [dhianapereira/rick-and-morty](https://github.com/dhianapereira/rick-and-morty). Em alguns pontos simplifiquei os trechos, mas preservei a estrutura, as ferramentas e o estilo dos testes que realmente uso.

## Organização e convenções

Com o tempo fui percebendo que a parte mais difícil dos testes raramente é escrever o primeiro. O mais trabalhoso costuma ser manter a suíte saudável quando o projeto cresce.

Por isso, hoje tento priorizar previsibilidade, isolamento e legibilidade.

### Testes precisam ser simples de ler

Legibilidade pesa bastante para mim.

Na maior parte do tempo alguém vai abrir aquele teste tentando responder perguntas como:

- o que esse código deveria fazer?
- qual comportamento está sendo validado?
- o que quebrou?

Por isso, prefiro testes mais explícitos do que soluções muito abstratas ou cheias de camadas.

### Nomenclatura

Costumo tratar nome de teste quase como documentação.

No `rick-and-morty`, o padrão mais recorrente ficou próximo de:

```dart
Should expose loaded episodes when initial page load succeeds
```

ou:

```dart
Should retry loading when try again button is tapped
```

Não existe um formato perfeito, mas gosto quando o nome deixa claro:

- comportamento
- contexto
- resultado esperado

### Cada teste deve validar uma coisa principal

Quando um teste tenta validar muitas coisas ao mesmo tempo, ele costuma ficar:

- difícil de manter
- difícil de entender
- difícil de depurar

Então prefiro separar cenários em testes menores, mesmo quando eles compartilham boa parte da preparação.

### AAA e Given / When / Then

Quando o teste cresce, gosto de separar a leitura usando AAA:

```dart
// Arrange
when(
  () => repository.fetchPage(1),
).thenAnswer((_) async => _buildEpisodePage(page: 1));

// Act
await sut.loadInitialPage();

// Assert
expect(sut.value.currentPage, 1);
expect(sut.value.episodes.length, 10);
```

Em cenários maiores, principalmente em widget e integração, também gosto de pensar em Given / When / Then, mesmo que eu não deixe isso comentado no arquivo.

Se você quiser se aprofundar especificamente nesses dois formatos, deixei algumas referências sobre AAA e Given/When/Then no fim do texto.

### Estrutura das pastas

Na pasta `test/`, costumo espelhar a estrutura da `lib/`.

```txt
lib/
└── features/
    └── episodes/
        └── presentation/
            └── pages/
                └── episode_list_page.dart

test/
└── features/
    └── episodes/
        └── presentation/
            └── pages/
                └── episode_list_page_test.dart
```

Isso facilita bastante quando o projeto cresce, porque fica simples localizar o teste relacionado a uma feature.

### Dummies, fakes e mocks

Durante muito tempo eu usava "mock" para tudo, mas com o tempo fui separando melhor as responsabilidades.

#### Dummy

Objeto usado só para preencher um parâmetro quando o valor em si não importa.

```dart
const episode = Episode(
  id: 1,
  name: 'Pilot',
  code: 'S01E01',
  airDate: 'December 2, 2013',
);
```

#### Fake

Implementação simplificada de algo real.

```dart
class FakeEpisodeRepository implements EpisodeRepository {
  @override
  Future<EpisodePage> fetchPage(int page) async {
    return const EpisodePage(
      currentPage: 1,
      totalPages: 1,
      totalEpisodes: 1,
      episodes: <Episode>[
        Episode(
          id: 1,
          name: 'Pilot',
          code: 'S01E01',
          airDate: 'December 2, 2013',
        ),
      ],
    );
  }
}
```

#### Mock

Objeto usado para controlar respostas e validar interações.

```dart
class _MockEpisodeRepository extends Mock implements EpisodeRepository {}
```

Na maioria dos projetos uso bastante a lib [`mocktail`](https://pub.dev/packages/mocktail).

### Mocks compartilhados

Tenho evitado arquivos globais enormes de mocks compartilhados.

Na maioria das vezes prefiro criar o mock no próprio arquivo de teste:

```dart
class _MockEpisodeListController extends Mock
    implements EpisodeListController {}
```

Isso deixa o teste mais independente e reduz atrito com importações desnecessárias.

### Dependências por construtor

Nos testes unitários, prefiro receber dependências por construtor:

```dart
sut = EpisodeListController(
  repository: repository,
  searchDebounceDuration: const Duration(milliseconds: 1),
);
```

Aqui também vale uma observação sobre nome. `sut` é uma sigla para `system under test`, ou seja, o objeto principal que está sendo testado naquele cenário.

Eu não uso esse nome em absolutamente todo projeto, mas ele aparece com frequência em exemplos de teste e também no `rick-and-morty`, então achei melhor manter esse padrão nos trechos do texto.

Esse tipo de composição deixa muito mais simples montar cenários isolados sem depender de estado global.

### Encapsular libs externas

Também gosto de evitar dependências externas espalhadas pela regra de negócio.

Em vez de deixar uma feature acoplada diretamente a uma biblioteca de HTTP, prefiro concentrar isso em uma camada própria. Assim, a regra da aplicação conversa com interfaces mais previsíveis, e os testes ficam mais baratos de escrever e manter.

### setUp, tearDown e isolamento

Quase todos os testes que escrevo usam `setUp`.

Nos testes unitários do `rick-and-morty`, por exemplo, a base costuma ser algo assim:

```dart
late EpisodeRepository repository;
late EpisodeListController sut;

setUp(() {
  repository = _MockEpisodeRepository();
  sut = EpisodeListController(
    repository: repository,
    searchDebounceDuration: const Duration(milliseconds: 1),
  );
});
```

Em testes de widget e golden, também uso `tearDown` com frequência para limpar estado global, principalmente quando registro dependências no `GetIt`.

```dart
tearDown(() async {
  stateNotifier.dispose();
  await GetIt.I.reset();
});
```

Quase nunca uso `setUpAll`.

Ele pode ajudar em alguns cenários, mas prefiro manter cada teste totalmente independente. Isso reduz o risco de vazamento de estado e deixa as falhas mais fáceis de interpretar.

### Rodar testes em ordem aleatória

Sempre que dá, gosto de rodar a suíte em ordem aleatória.

Quando um teste só passa porque outro rodou antes, quase sempre existe algum estado vazando. Esse tipo de problema aparece cedo quando a ordem de execução deixa de ser previsível.

## Testes unitários

Testes unitários continuam sendo a base da maior parte do que escrevo.

São rápidos, têm custo baixo de manutenção e costumam cobrir boa parte das regras que mais quebram com a evolução do código.

### O que costumo priorizar

Geralmente foco em:

- regras de negócio
- controllers e use cases
- repositories
- transformações de dados
- tratamento de erro
- estados
- fluxos críticos

### O que geralmente não me traz tanto retorno

Existem alguns cenários em que costumo ver menos valor:

- classes muito simples
- widgets muito pequenos e sem comportamento
- integrações acopladas diretamente a SDKs, sem uma interface intermediária

Quando não existe uma abstração clara, às vezes prefiro validar o comportamento em outro nível de teste.

### Exemplo

Esse é um recorte bem próximo do que está no projeto:

```dart
test(
  'Should expose error message when repository throws exception',
  () async {
    when(
      () => repository.fetchPage(1),
    ).thenThrow(const EpisodeException('Unable to fetch episodes.'));

    await sut.loadInitialPage();

    expect(sut.value.hasError, isTrue);
    expect(sut.value.errorMessage, 'Unable to fetch episodes.');
    expect(sut.value.hasContent, isFalse);
  },
);
```

Uma coisa que tento evitar é colocar lógica demais dentro do próprio teste. Quando ele começa a parecer uma implementação paralela da feature, isso costuma indicar que o cenário ficou complexo demais.

## Testes de widget

Testes de widget são, de longe, um dos níveis que mais gosto de usar.

Eles conseguem validar comportamento, renderização e interação sem o custo de um teste de integração completo.

### O que costumo validar

Geralmente foco em:

- renderização básica
- interações
- navegação
- loading
- mensagens de erro
- atualização de estado

Na maior parte do tempo me preocupo mais com comportamento do que com detalhes internos da implementação.

### GetIt nesse nível

Em testes unitários, prefiro depender de construtor. Já em testes de widget, se o widget real usa `GetIt`, não me incomodo em usar o mesmo caminho no teste.

No `rick-and-morty`, esse padrão aparece bastante:

```dart
setUp(() {
  controller = _MockEpisodeListController();
  GetIt.I.registerSingleton<EpisodeListController>(controller);
});
```

Isso deixa o teste mais próximo da forma como a tela realmente funciona na aplicação.

### Widgets com animação

Animações costumam ser uma parte mais chata de testar.

Quando preciso lidar com isso, tento manter o teste previsível: controlo bem o uso de `pump`, evito depender cegamente de `pumpAndSettle` e, se fizer sentido, reduzo ou neutralizo a animação no ambiente de teste.

### Exemplo

Esse é um dos cenários do `episode_list_page_test.dart`:

```dart
testWidgets('Should retry loading when try again button is tapped', (
  WidgetTester tester,
) async {
  stateNotifier.value = const EpisodeListState(
    errorMessage: 'Temporary failure.',
  );

  when(() => controller.retry()).thenAnswer((_) async {
    stateNotifier.value = _buildLoadedState(page: 1);
  });

  await tester.pumpWidget(_buildTestApp());
  await tester.pump();

  expect(find.text('Unable to load episodes'), findsOneWidget);

  await tester.tap(find.widgetWithText(FilledButton, 'Try again'));
  await tester.pump();

  expect(find.text('Episode 1'), findsOneWidget);
  verify(() => controller.retry()).called(1);
});
```

Esse tipo de teste me agrada porque valida o que a pessoa usuária enxerga e faz, sem depender demais de detalhes internos.

## Golden tests com Alchemist

Golden tests passaram a fazer mais sentido para mim quando comecei a usá-los para validar regressões visuais maiores, e não como substituto de todo teste de widget.

Atualmente, a biblioteca que uso para isso é o [`alchemist`](https://pub.dev/packages/alchemist).

### Por que tenho preferido alchemist

No fluxo que venho usando, o `alchemist` deixou os cenários mais claros e a configuração mais previsível, especialmente por causa da forma como lida com cenários, temas e execução em CI.

No `rick-and-morty`, a configuração global fica em `test/flutter_test_config.dart`:

```dart
return AlchemistConfig.runWithConfig(
  config: AlchemistConfig(
    platformGoldensConfig: PlatformGoldensConfig(
      platforms: _platforms,
      diffThreshold: 0.003,
    ),
    ciGoldensConfig: CiGoldensConfig(diffThreshold: 0.001),
  ),
  run: () async {
    await testMain();
  },
);
```

### O que costumo cobrir

No projeto, tenho usado golden principalmente para:

- telas completas
- estados importantes, como carregado e erro
- diferenças de tema, como light e dark

Tenho evitado criar golden para widgets muito pequenos, porque o custo de manutenção sobe rápido e o retorno nem sempre compensa.

### Tamanho de tela

No estado atual do `rick-and-morty`, os goldens estão padronizados em um cenário mobile fixo por meio de um helper:

```dart
GoldenTestGroup buildMobileGoldenScenario({
  required Widget child,
  String name = 'mobile',
  int columns = 1,
}) {
  return GoldenTestGroup(
    columns: columns,
    children: <Widget>[
      GoldenTestScenario(
        name: name,
        child: SizedBox(width: 390, height: 844, child: child),
      ),
    ],
  );
}
```

Ou seja: neste projeto eu não estou validando vários breakpoints nos goldens. Se eu precisar cobrir outros tamanhos, prefiro adicionar isso de forma explícita, em vez de transformar cada snapshot em uma matriz enorme.

### Exemplo

Esse é um exemplo fiel ao estilo usado no repositório:

```dart
goldenTest(
  'Should render loaded episode list page when light theme is active',
  fileName: 'episode_list_page_loaded_light',
  builder: () {
    stateNotifier.value = _buildLoadedState();

    return buildMobileGoldenScenario(
      child: const Scaffold(
        body: EpisodeListPage(),
      ).toTestApp(theme: AppTheme.light),
    );
  },
);
```

Além desse cenário, o projeto também cobre o estado de erro e o tema escuro.

### Sobre manutenção

Golden é ótimo para pegar regressão visual, mas também pode ficar frágil com facilidade.

Por isso, tento evitar:

- excesso de snapshots
- cenários pequenos demais
- validação de detalhes irrelevantes
- atualização de imagem sem revisar a mudança visual

## Testes de integração

Também uso testes de integração principalmente para validar fluxos críticos.

Não tento cobrir tudo nesse nível, porque esse tipo de teste costuma ser mais lento, mais caro de manter e mais sensível a pequenas mudanças.

### O que costumo validar

Geralmente foco em:

- caminho feliz
- navegação entre telas
- integrações que só fazem sentido ponta a ponta

### Exemplo do fluxo principal

No `rick-and-morty`, o teste de integração principal valida algo próximo disto:

```txt
abrir app
→ avançar para a próxima página da lista de episódios
→ buscar por "Pilot"
→ abrir os detalhes do episódio
→ tocar em um personagem
→ validar a tela de detalhes do personagem
```

O nome do teste no projeto deixa isso bem claro:

```dart
Should navigate from episode list to character details When user completes the main flow
```

Para mim, esse tipo de teste funciona melhor quando cobre o fluxo central da aplicação sem tentar resolver todas as variações possíveis de uma vez.

## Referências

Esses materiais me ajudam bastante quando estudo ou revisito testes em Flutter:

- [Documentação de testes do Flutter](https://docs.flutter.dev/testing)
- [Introdução a testes de integração no Flutter](https://docs.flutter.dev/cookbook/testing/integration/introduction)
- [AAA em testes de unidade no Microsoft Learn](https://learn.microsoft.com/pt-br/visualstudio/test/unit-test-basics?view=visualstudio)
- [Given/When/Then no Martin Fowler](https://martinfowler.com/bliki/GivenWhenThen.html)
- [BDD e Gherkin na documentação do Cucumber](https://cucumber.io/docs/bdd/who-does-what/)
- [Very Good Ventures](https://verygood.ventures/blog/?tag=Testing)

Existem muitas formas válidas de organizar testes.

Essas são só algumas práticas e anotações que vêm fazendo sentido para mim até aqui. :)
