# Konwencje kodu

Reguły obowiązujące w tym repo. Każdy nowy fragment kodu (ręczny lub generowany przez AI) musi się do nich stosować.

---

## Stack

- **Vue 3** (Composition API) + **Vite**.
- **Czysty JavaScript** (ESM). **Brak TypeScriptu**, brak `tsconfig`, brak adnotacji typów.
- Render markdown: `marked` + `v-html`. Graf: `force-graph`. i18n: `vue-i18n` v9.

## Styl plików i formatowania

- Pliki źródłowe: `.js` lub `.vue`. Nie wprowadzaj `.ts` / `.tsx`.
- Wcięcie: **2 spacje**.
- Cudzysłowy: **pojedyncze** (`'…'`); szablony (`` `…` ``) tylko gdy potrzebna interpolacja.
- **Bez średników** na końcu instrukcji.
- Pliki tekstowe kończą się znakiem nowej linii.
- Importy: **względne** wobec bieżącego pliku (np. `./utils/format.js`, `../i18n/localeUi.js`). Nie używaj aliasów (`@/…`) — nie ma ich w konfiguracji.

## JavaScript

- Używaj **ES modules** (`import` / `export`). `"type": "module"` w `package.json`.
- Top-level helpery i handlery: `function nazwa() { … }`. Krótkie callbacki: arrow.
- `const` domyślnie; `let` tylko gdy reassign jest świadomy (np. instancja `force-graph`).
- Porównania: `===` / `!==`. Wyjątek: `== null` świadomie do złapania `null` i `undefined` (np. `secs`).
- Nie eksportuj rzeczy „na zapas” — eksportuj tylko to, co jest używane poza modułem.

## Vue 3 — komponenty

- Każdy komponent: `<template>` + `<script setup>` + (opcjonalnie) styl globalny w `src/style.css`. **Bez `<style scoped>`** — w tym repo style są globalne.
- **Stan:** `ref` dla wartości, `computed` dla pochodnych, `watch` / `watchEffect` dla efektów.
- **Props:** `defineProps({ name: { type, default, required } })`. Nie destrukturyzuj `props` (utrata reaktywności) — używaj `props.x` lub `toRefs`.
- **Emity:** `const emit = defineEmits(['select', 'close', …])`; w szablonie `@event="handler"` lub skrót `@event="state = $event"`.
- Nazwy zdarzeń: krótkie, czasownikowe (`select`, `navigate`, `close`).
- Side-effecty w `onMounted` muszą mieć cleanup w `onUnmounted` (np. `ResizeObserver`, instancja `force-graph`).
- Nie używaj Options API, mixinów, `setup()` z `return`.

## i18n (obowiązkowe)

- Każdy tekst widoczny dla użytkownika idzie przez `t('klucz')`. **Brak literałów** w szablonach i `aria-label` / `title`.
- Klucze hierarchiczne: `app.*`, `chunk.*`, `part.*`, `sources.*`, `common.*`. Jedna fraza = jeden klucz.
- Pluralizacja przez segmenty `|` w komunikacie + przekazanie liczby (`t('klucz', n, { n })`).
- Dodanie języka: `src/locales/{kod}.json` + autonim w `src/i18n/localeUi.js`. Nie modyfikuj `src/i18n/index.js` ani `messages.js` przy zwykłym dodawaniu locale.
- Separatory typograficzne (`·`, `–`, `—`) traktujemy jak format, nie jak treść — mogą być w szablonie lub w `src/utils/format.js`.

## Style (CSS)

- Wszystkie reguły w `src/style.css`. **Nie dodawaj** `<style scoped>` w komponentach.
- Klasy semantyczne, kebab-case: `app-header`, `panel-title`, `chunk-panel`, `parts-table`.
- Klasa typu węzła: `type-badge` + `type-${chunk.type}` (np. `type-concept`). Klucze muszą być spójne z `src/utils/types.js`.
- Motyw ciemny (`#1a1a2e` tło, `#e0e0e0` tekst); używaj istniejących zmiennych kolorystycznych zamiast wprowadzać nowe.

## `Graph.vue` (force-graph)

- Instancja biblioteki w `let fg`, nie w `ref`. Lifecycle w `onMounted` / `onUnmounted`.
- Synchronizacja danych: `watch(() => props.data, …)` i `watch(() => props.selectedSlug, …)`.
- Po mutacjach biblioteki `link.source` / `link.target` mogą być **slugami albo referencjami do węzłów** — kod musi obsługiwać oba warianty.

## Komentarze

- Komentuj **dlaczego**, nie **co**. Nie dodawaj komentarzy narracyjnych typu „// import modułu”.
- TODO / FIXME zostawiaj tylko z konkretem (np. „TODO Task 2 — BFS”).

## Czego NIE robić

- Nie zmieniaj `src/data/mock.js` (wymóg README).
- Nie wprowadzaj TypeScriptu, Pinii, Vue Router, Tailwinda, ESLint/Prettier configów ani innych zależności bez uzasadnienia w `TASK.md`.
- Nie dodawaj literałów UI w komponentach — zawsze przez i18n.
- Nie destrukturyzuj `props` w `<script setup>`.
- Nie używaj `<style scoped>` w tym projekcie.
- Nie eksportuj zbędnych symboli „na przyszłość”.

## Weryfikacja

- `npm run build` musi przejść bez błędów.
- W dev konsola nie wyświetla ostrzeżeń `vue-i18n` o brakujących kluczach.
- Smoke manualny w obu językach (`pl`, `en`) na ścieżkach: header, Graph + ChunkPanel, Source Files + PartPanel.
