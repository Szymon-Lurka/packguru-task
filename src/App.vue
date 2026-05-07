<template>
  <div class="app">
    <header class="app-header">
      <h1>{{ t('app.title') }}</h1>
      <nav class="tabs">
        <button :class="['tab', { active: tab === 'graph' }]" @click="tab = 'graph'">
          {{ t('app.tabGraph') }}
        </button>
        <button :class="['tab', { active: tab === 'sources' }]" @click="tab = 'sources'">
          {{ t('app.tabSources') }}
        </button>
      </nav>
      <div class="app-header-end">
        <template v-if="tab === 'graph'">
          <div class="graph-search" :class="{ active: !!graphSearchQuery }">
            <div class="graph-search-input-wrap">
              <input
                ref="graphSearchEl"
                v-model="graphSearchQuery"
                class="graph-search-input"
                type="text"
                name="graph-search"
                role="search"
                autocomplete="off"
                spellcheck="false"
                :placeholder="t('search.placeholder')"
                :aria-label="t('search.ariaLabel')"
              >
              <span
                v-if="graphSearchQueryDebounced"
                class="graph-search-badge"
                :title="t('search.matches', graphSearchMatchCount, { n: graphSearchMatchCount })"
                :aria-label="t('search.matches', graphSearchMatchCount, { n: graphSearchMatchCount })"
              >
                {{ t('search.matchesShort', graphSearchMatchCount, { n: graphSearchMatchCount }) }}
              </span>
              <button
                v-if="graphSearchQuery"
                class="graph-search-clear"
                type="button"
                :title="t('search.clearTitle')"
                :aria-label="t('search.clearTitle')"
                @click="clearGraphSearch"
              >
                ×
              </button>
            </div>
          </div>
          <span class="app-header-divider" aria-hidden="true" />
          <span class="status">{{ graphStatusLine }}</span>
        </template>
        <LocaleSwitcher />
      </div>
    </header>

    <div v-if="tab === 'graph'" class="app-body">
      <div class="graph-pane">
        <Graph
          :data="graphData"
          :filter-query="graphSearchQueryDebounced"
          :selected-slug="selectedSlug"
          @matches-change="setGraphSearchMatchCount($event)"
          @select="onSelect"
        />
      </div>
      <div :class="['detail-pane', { open: !!selectedSlug }]">
        <div v-if="chunkLoading" class="panel-loading">{{ t('app.loading') }}</div>
        <ChunkPanel
          v-else-if="chunk"
          :chunk="chunk"
          @navigate="selectedSlug = $event"
          @close="selectedSlug = null"
        />
        <div v-else class="empty-state">{{ t('app.emptySelectNode') }}</div>
      </div>
    </div>

    <SourcesView v-if="tab === 'sources'" />
  </div>
</template>

<script setup>
import { ref, watch, watchEffect, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { graphData, getChunk } from './data/mock.js'
import Graph from './components/Graph.vue'
import ChunkPanel from './components/ChunkPanel.vue'
import SourcesView from './components/SourcesView.vue'
import LocaleSwitcher from './components/LocaleSwitcher.vue'
import { useGraphSearch } from './composables/useGraphSearch.js'

const { t, locale } = useI18n()

const graphStatusLine = computed(() => {
  const nc = graphData.nodes.length
  const nl = graphData.links.length
  return `${t('app.statusChunks', nc, { n: nc })} · ${t('app.statusLinks', nl, { n: nl })}`
})

const tab = ref('graph')
const selectedSlug = ref(null)
const chunk = ref(null)
const chunkLoading = ref(false)

const isGraphTab = computed(() => tab.value === 'graph')
const {
  inputEl: graphSearchEl,
  query: graphSearchQuery,
  debouncedQuery: graphSearchQueryDebounced,
  matchCount: graphSearchMatchCount,
  setMatchCount: setGraphSearchMatchCount,
  clear: clearGraphSearch,
} = useGraphSearch({
  isActiveRef: isGraphTab,
  debounceMs: 250,
  minQueryLength: 3,
  resetOnDeactivate: true,
})

watchEffect(() => {
  document.title = t('app.title')
  document.documentElement.lang = locale.value
})

function onSelect(slug) {
  selectedSlug.value = selectedSlug.value === slug ? null : slug
}

watch(selectedSlug, async (slug) => {
  if (!slug) { chunk.value = null; return }
  chunkLoading.value = true
  await new Promise(r => setTimeout(r, 80))
  chunk.value = getChunk(slug)
  chunkLoading.value = false
})
</script>
