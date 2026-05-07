# 1. Metodologia i narzędzia

## Narzędzia

Główne narzędzie AI użyte w celu realizacji zadań to Cursor - z racji tego, że pozwala na wybór wielu modeli LLM od różnych providerów, co sprzyja wyborowi odpowiedniego modelu pod konkretne zadanie.
Pozwala to również na użycie różnych modeli w celu np. weryfikacji napisanego rozwiązania pod kątem jakości kodu (np. Claude Sonnet 4.7 od Anthropic), lub porozmawianie o tym rozwiązaniu korzystając z między innymi metody sokratejskiej (używając modeli reasoning jak Claude Opus 4.7).


## Metodologia

### Początek pracy i stworzenie dokumentu z zasadami

Początek pracy polegał na wygenerowaniu dokumentu `conventions.md` korzystając z modelu reasoning Claude Opus 4.7, co pozwoliło wejść w kontekst projektu, zasad i tego co już istnieje (dokument jest żywy, aktualizowany jeśli zajdzie taka potrzeba).

Dokument jest użyteczny dla potencjalnie nowej osoby która chce się zapoznać z projektem, ale przede wszystkim dla narzędzi AI - pozwala zminimalizować generowanie kodu który np. nie pasuje do zasad projektowych, wykracza poza zakres itd.
Ten dokument również był wartościowy, żeby stworzyć plan implementacji poszczególnych zadań.

Jest to użyteczne w mojej opinii głównie jako plik który wprost pokazuje modelowi konwencje projektowe, zasady których trzeba się trzymać itd.

Wynikowy plik `conventions.md` który zwrócił model mi się spodobał - wystarczający pod ten mały projekt.
Dzięki wspomnianej metodzie sokratejskiej, można było uniknąć sporo iteracji po tym pliku, ponieważ już na etapie rozmowy przed wygenerowaniem pliku zostały rozwiane potencjalne wątpliwości.

---

### Przygotowanie do implementacji poszczególnych zadań

Korzystając dalej z modelu reasoning, opierając się na tych zasadach (`conventions.md`) stworzyć pliki markdown dedykowane pojedynczemu zadaniu, które zawierają jasną granicę scope do zaimplementowania, scenariusze testowe, wstępne dane jeśli są niezbędne oraz pozwala na ponowne skorzystanie z metody sokratejskiej - żeby lepiej zrozumieć kontekst, rozwiązywany problem lub znalezienie edge cases których nie było widać na pierwszy rzut oka.

Takie podejście zawsze najbardziej mi pasowało, ponieważ lubię dobrze poznać kontekst zadania zanim zacznie się implementacja (lub po prostu weryfikacje tego co robi agent), jedyny minus takiego rozwiązania to fakt, że modele dość szybko potrafią brać rozbieg i wychodzić poza scope rozmowy - próbują również szukać "lepszych" rozwiązań danego tematu, nawet jeśli udało się już wypracować zaakceptowany plan.

Właśnie z tego powodu często dobrze jest rozbić ten proces na przynajmniej 2 etapy - rozmowa (np. w stylu sokratejskim) w celu wypracowania wysokopoziomowego kontekstu, i w nowej sesji dopiero tworzenie konkretnego planu implementacji - ale w tym repozytorium jak dla mnie to overkill (zadania na tyle małe, że AI dość rzetelnie trzymał się tematu).

Taki dokument może służyć jako dokumentacja projektowa (lub poszczególnego feature) - choć ja nie jestem fanem tego rozwiązania, bo wprowadza dodatkowe miejsce które trzeba utrzymywać wraz z rozwojem danego feature czy projektu (ale jak zawsze, "to zależy").

---

# 2. Zadania

## Zadanie 1

Do zadania 1 wygenerowałem plik który wysokopoziomowo opisuje kontekst, scope zadania, instrukcje, scenariusze testowe (weryfikacja założeń) oraz zakaz wykraczania poza scope zadania.

Agent dość szybko tutaj zrozumiał o co chodzi (zapewne głównie bazując na pliku `readme`), przygotował również sensowne scenariusze testowe i miejsca w których są hardcoded teksty.

### 1a

Wyodrębnienie kodu dla agenta AI raczej nie stanowiło wyzwania - zaproponowałem mu jedynie dodatkowo, żeby również wyniósł do `utils` funkcję `fmtTimeRange`, a nie tylko `fmtTime` - ponieważ obydwie funkcje dotyczą tej samej logiki (jedna nawet korzysta z drugiej) i również kod tej funkcji się powtarzał.

Sprawnie się dostosował do sugestii i sensownie wyniósł te funkcje do współdzielonego pliku, pozbywając się duplikacji.

### 1b

Agent AI sensownie zastosował się do instrukcji, ale mocno przywiązał się do `readme`, zostawiając labele w kodzie JS mimo tego, że to samo zadanie miało w scope dodanie kolejnęgo języka (i biblioteki `vue-i18n`).

Potrzebny był feedback, że skoro i tak zaraz będziemy implementować vue-i18n, to możemy wziąć to pod uwagę i stworzyć coś na zasadzie ENUM'a, dla typów kluczy (unikanie magic strings, redukcja ryzyka literówek).

Wziął to pod uwagę, zapisując na boku kontekst o co chodziło z tymi labelami w kodzie JS - więc można było przeskoczyć do ostatniego etapu bez zostawiania tech debtu 10 sekund po refactoryzacji.

### 1c

W tym segmencie tego zadania została zainstalowana nowa paczka `vue-i18n`, w celu realizacji dodania nowego języka, switch języków w locie.

Wersja v9 wynika z wymagań `readme`, natomiast osobiście produkcyjnie pewnie wybrałbym coś nowszego (`v11`).

Tutaj agent AI miał największe problemy - jak sama instalacja `vue-i18n` przeszła bezproblemowo, tak strasznie nie podobało mi się to co próbował zrobić z konfiguracją tej biblioteki.

Niepotrzebne funkcje IIFE, lazy loading dla 2 języków (bez dynamicznego ich ładowania), duplikacja logiki w komponencie `LocaleSwitcher.vue`, niezbyt dokładna 'wiedza' odnośnie pluralizacji.

Koniecznie trzeba było określić feedback - dołączyć link do dokumentacji (vue-i18n plural), wprowadzić kontekst dynamicznego ładowania plików i położyć nacisk na DRY.
Zależało mi na stworzeniu uniwersalnego kodu, który maksymalnie uprości dodawanie nowego języka do aplikacji w przyszłości.

W międzyczasie doszło do tego iterowanie z agentem (sokratejska metoda), żeby troszkę dostosować wymagania - efektem tego jest dynamiczne ładowanie plików JSON, uproszczenie dodawania nowego języka, przygotowanie Switch'a pod rozszerzenie oraz dodanie funkcji pluralizującej dla PL.

Sam komponent `LocaleSwitcher.vue` jest gotowy na dynamiczną obsługę nowych języków, aczkolwiek gdyby języków pojawiło się więcej - w celu zachowania dobrego UX wymagana byłaby zmiana komponentu na przykładowo dropdown.

Dodanie nowego języka tak naprawdę sprowadza się do:
- Dodanie nowego pliku .json w folderze locales/
- Dodanie nowego, natywnego tłumaczenia w pliku `localeUi.js` (decyzja projektowa opisana niżej)
- (Opcjonalnie) Dodanie kodu nowego języka do tablicy która definiuje kolejność wyświetlania w komponencie UI
    - Najpierw wyświetlane są języki z tej tablicy, a następnie kolejne posortowane.
- (Opcjonalnie) Dodanie funkcji do obsługi pluralizacji nowego języka (przykładowo jak Polski) - z opcjonalnym przeniesieniem tego do osobnych plików jeśli plik zacząłby 'puchnąć' za mocno

Decyzje projektowe w tym zadaniu:
- Języki do wyboru są pokazywane w wersji natywnej - w naszym wypadku 'Polski' oraz 'English', co jest bardziej intuicyjne i przyjazne użytkownikowi.
- Custom funkcja do pluralizacji Polskiego (nie działa dobrze OOTB również według dokumentacji i18n), co dało nam 4 segmentowy plural (dla braku danych, i odpowiednio dla 3 przypadków)
- Split plików i18n - do dynamicznego generowania `messages` dla konfiguracji i18n, dane dla komponentu UI oraz sama konfiguracja
- Hardcoded PL język w `index.html` oraz runtime sync `lang/title`
- Formatowanie daty w `SourcesView` korzysta z natywnego `Intl (toLocaleString(locale.value))` - automatycznie reaguje na zmianę języka, bez hardcoded regionów (na ten moment w mojej opinii wystarczające)
- Dostosowanie styli aplikacji, żeby uniknąć layout shift w momencie zmiany języka.

---

## Zadanie 2

Do zadania 2 również został wygenerowany plik z planem implementacji - poprzedzony iteracyjną rozmową z modelem i przeglądnięciem dokumentacji biblioteki `force-graph`.

Sama rozmowa jak i plan odbyły się poprawnie - natomiast sam proces implementacji przez model był rozczarowujący.

Właściwie większość początkowych rozwiązań modelu były wątpliwej jakości, nadmiarowy kod, sporo code smell (przykładowo logika rozrzucona po 2-3 onMounted w komponencie, nadmiarowe funkcje totalnie ignorując chociażby YAGNI).

UX'owo było źle, agent nie respektował dokumentacji, 2 próby stworzenia custom funkcji która obsłuży przypadek braku odświeżania grafu po wyborze startowego i końcowego węzła w momencie kiedy prosta konfiguracja biblioteki rozwiązywała ten problem.

Zastosowałem tutaj 'mieszane' podejście - przeszedłem na analizę i refinement z modelem od Google Gemini.

Udało się dojść do kluczowych wniosków i ważnych aspektów (UX w kontekście tego konkretnego grafu oraz większej wiedzy odnośnie biblioteki).
Kontekst zbudowany po tej rozmowie pozwolił na sensowną implementacje algorytmu, odpowiednio zaadaptować UX do projektu i pozbyć się code smell.

Implementacja tego zadania wymagała kilka iteracji oraz zaczynania sesji od nowa, ze świeżym kontekstem bez szumu informacyjnego.

Decyzje projektowe w tym zadaniu:
- Mimo, że algorytm BSF jest nieskierowany, strzałki zostały na miejscu jako łagodny indicator przypominający, że kierunek ma znaczenie w tym grafie
- Dodanie prostego button'a do overlay'a informującego o braku ścieżki w wybranych węzłach, który resetuje stan i można zacząć od nowa
- Większość logiki przeniesiona do composable w celu organizacji kodu, w komponencie została
- Startowy węzeł oraz końcowy mają inny kolor obramowania, w celu wyróżnienia krawędzi ścieżki
- Zauważyłem problem przy renderowaniu grafu - w momencie kiedy klikamy na węzeł i wysuwa się drawer. Ale nie naprawiłem go w ramach zadań rekrutacyjnych. Prawdopodobnie podczas animacji robi on resize, a komponent z grafem reaguje na resize i powoduje ten flick.
- Dodanie mini instrukcji informującej o następnym kroku w path mode

## Zadanie 3

Standardowo wygenerowanie pliku implementacji i sesja refinementu z agentem w celu wypracowania optymalnej współpracy poprzedniego zadania z aktualnym.

Agent został użyty do zaimplementowania podstawowej struktury (input, przekazywanie props, tłumaczenia, debounce) a następnie został pokierowany dokładnymi instrukcjami odnośnie priorytetów wyświetlania (path mode nad wyszukiwarką) oraz UX (search badge z liczbą dopasowań).

Poradził sobie sensownie bez zbędnych iteracji.

Decyzje projektowe:
- Badge number jako wskaźnik dopasowań wbudowany w input
- Przy aktywnym path mode, search ma mniejszy priorytet. Jeśli znaleziony węzeł jest poza narysowaną ścieżką, to dalej ma rysowany ring ale jest wyszarzony jak reszta. Jeśli znajduje się on w ścieżce, to ma dodatkowy, subtelny ring w kolorze który identyfikuje znalezione węzły

## Weryfikacja

Zweryfikowanie poprawności implementacji polegała na wykorzystaniu planu który stworzył agent, na podstawie stworzonych dokumentów, kodu oraz `readme.md` zwrócił gotową, sensowną listę kroków do weryfikacji.

Weryfikacja polegała na smoke testach w przeglądarce do czego wykorzystałem pomoc toola dla Cursora, pozwalający mu samodzielnie odwiedzić stronę i się po niej przeklikać.

Ten tool nie jest zawsze stabilny, dlatego postawiłem na hybrydę i testy przeprowadziłem również ręcznie. Do tego weryfikacja osobnym agentem w świeżej sesji code review - dając mu do dyspozycji kontekst wcześniej wygenerowanych plików, `readme`, samego kodu oraz podsumowania po smoke testach.

Niepowiązane poprawki odrzuciłem, a te które uznałem za stosowne zaimplementowałem korzystając z kolejnego agenta, dedykowanemu takim zadaniom.
