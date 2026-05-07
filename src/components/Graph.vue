<template>
  <div class="graph-root">
    <div class="graph-overlay-controls">
      <button
        class="graph-path-btn"
        :class="{ active: pathMode }"
        type="button"
        :title="t('graph.pathToggleTitle')"
        :aria-label="t('graph.pathToggleTitle')"
        @click="togglePathMode"
      >
        {{ t('graph.pathToggle') }}
      </button>
      <div v-if="pathHint" class="graph-overlay-hint">
        {{ pathHint }}
      </div>
    </div>

    <div v-if="pathNotFound" class="graph-overlay-message">
      <div class="graph-overlay-message-text">{{ t('graph.noPathFound') }}</div>
      <button
        class="graph-overlay-btn"
        type="button"
        :title="t('graph.resetSelectionTitle')"
        :aria-label="t('graph.resetSelectionTitle')"
        @click="clearPathSelection"
      >
        {{ t('graph.resetSelection') }}
      </button>
    </div>

    <div ref="containerEl" class="graph-canvas" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import ForceGraph from 'force-graph'
import { useI18n } from 'vue-i18n'
import { TYPE_COLORS } from '../utils/types.js'
import { useGraphPath } from '../composables/useGraphPath.js'

const COLORS = {
  canvasBg: '#1a1a2e',
  nodeDefault: '#95a5a6',

  linkDefault: '#334455',
  linkDim: 'rgba(51,68,85,0.18)',
  linkPath: 'rgba(232,232,232,0.92)',

  ringSelected: '#ffffff',
  ringPathMid: '#ffffff',
  ringPathEndpoint: '#ff6b6b',
  ringPathStart: '#55d98a',
  ringPathEnd: '#ff6b6b',
  ringSearch: '#7db3f7',

  label: 'rgba(220,220,220,0.85)',
  arrowDim: 'rgba(140,150,165,0.22)',
  arrowDefault: '#334455',

  overlayBg: 'rgba(15, 52, 96, 0.65)',
  overlayBorder: 'rgba(26, 74, 128, 0.7)',
  overlayText: '#e8e8e8',
}

const SIZES = {
  dimAlpha: 0.2,
  nodeR: 4,
  nodeSelectedR: 7,
  ringGap: 2.5,
  ringWidth: 1.5,
  arrowLen: 3,
  arrowLenPath: 5,
  linkWidth: 1,
  linkWidthPath: 2.5,
}

const props = defineProps({
  data:         { type: Object, default: () => ({ nodes: [], links: [] }) },
  selectedSlug: { type: String, default: null },
  filterQuery:  { type: String, default: '' },
})
const emit = defineEmits(['select', 'matches-change'])
const { t } = useI18n()

const containerEl = ref(null)
let fg = null

const pathHint = computed(() => {
  if (!pathMode.value) return ''
  if (!pathStart.value) return t('graph.pathPickStart')
  if (!pathEnd.value) return t('graph.pathPickEnd')
  return ''
})

const {
  pathMode,
  pathStart,
  pathEnd,
  pathNodes,
  pathLinks,
  pathNotFound,
  togglePathMode: togglePathModeInternal,
  onNodeClick: onPathNodeClick,
  deactivate: deactivatePath,
  clearPathSelection,
  slugOf,
  linkKey,
} = useGraphPath(computed(() => props.data))

function nodeColor(node) {
  return TYPE_COLORS[node.type] || COLORS.nodeDefault
}

function isPathResultActive() {
  return !!(pathMode.value && pathStart.value && pathEnd.value)
}

function norm(s) {
  return String(s || '').trim().toLowerCase()
}

function isNodeMatch(node, qRaw) {
  const q = norm(qRaw)
  if (!q) return true
  return (
    norm(node?.title).includes(q) ||
    norm(node?.slug).includes(q) ||
    norm(node?.type).includes(q)
  )
}

function nodeAlpha({
  isSelected,
  hasPathEndpoints,
  isPathHighlight,
  queryActive,
  isMatch,
  isPathActive,
}) {
  if (hasPathEndpoints) return (isPathHighlight || isSelected) ? 1 : SIZES.dimAlpha
  if (!isPathActive && queryActive) return (isMatch || isSelected) ? 1 : SIZES.dimAlpha
  return 1
}

const matchCount = computed(() => {
  const q = norm(props.filterQuery)
  if (!q) return 0
  return props.data.nodes.reduce((acc, n) => acc + (isNodeMatch(n, q) ? 1 : 0), 0)
})

watch(matchCount, n => {
  emit('matches-change', n)
}, { immediate: true })

function isPathLink(link) {
  const a = slugOf(link.source)
  const b = slugOf(link.target)
  const key = linkKey(a, b)
  if (!key) return false
  return pathLinks.value.has(key)
}

function togglePathMode() {
  togglePathModeInternal({
    onEnter() {
      // UX: entering Path mode should not compete with the details drawer.
      // Close the drawer by clearing selection in the parent.
      emit('select', null)
    },
  })
}

function onNodeClick(node) {
  const slug = node?.slug
  if (!slug) return

  if (!pathMode.value) {
    emit('select', slug)
    return
  }

  onPathNodeClick(slug)
}

function onKeydown(e) {
  if (!pathMode.value) return
  if (e.key !== 'Escape') return
  deactivatePath()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)

  fg = ForceGraph()(containerEl.value)
    .graphData(props.data)
    .nodeId('slug')
    .nodeLabel('title')
    .autoPauseRedraw(false)
    .linkColor(link => {
      if (!isPathResultActive()) return COLORS.linkDefault
      return isPathLink(link) ? COLORS.linkPath : COLORS.linkDim
    })
    .linkWidth(link => {
      if (!isPathResultActive()) return SIZES.linkWidth
      return isPathLink(link) ? SIZES.linkWidthPath : SIZES.linkWidth
    })
    .linkDirectionalArrowColor(link => {
      if (!isPathResultActive()) return COLORS.arrowDefault
      return isPathLink(link) ? COLORS.linkPath : COLORS.arrowDim
    })
    .linkDirectionalArrowLength(link => {
      if (!isPathResultActive()) return SIZES.arrowLen
      return isPathLink(link) ? SIZES.arrowLenPath : SIZES.arrowLen
    })
    .linkDirectionalArrowRelPos(1)
    .linkLabel('label')
    .backgroundColor(COLORS.canvasBg)
    .onNodeClick(onNodeClick)
    .nodeCanvasObject((node, ctx, globalScale) => {
      const isSelected = node.slug === props.selectedSlug
      const isPathMode = pathMode.value && pathStart.value
      const hasPathEndpoints = pathMode.value && pathStart.value && pathEnd.value
      const isPathPicking = pathMode.value && pathStart.value && !pathEnd.value
      const isStart = isPathMode && node.slug === pathStart.value
      const isEnd = isPathMode && node.slug === pathEnd.value
      const isOnPath = isPathMode && pathNodes.value.has(node.slug)
      const isPathHighlight = isStart || isEnd || isOnPath

      const queryActive = !!norm(props.filterQuery)
      const isMatch = isNodeMatch(node, props.filterQuery)
      const isPathActive = !!pathMode.value

      ctx.globalAlpha = nodeAlpha({
        isSelected,
        hasPathEndpoints,
        isPathHighlight,
        queryActive,
        isMatch,
        isPathActive,
      })

      const color = nodeColor(node)
      const r = isSelected ? SIZES.nodeSelectedR : SIZES.nodeR

      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()

      if (isSelected) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + SIZES.ringGap, 0, 2 * Math.PI)
        ctx.strokeStyle = COLORS.ringSelected
        ctx.lineWidth = SIZES.ringWidth
        ctx.stroke()
      }

      if ((hasPathEndpoints || isPathPicking) && isPathHighlight) {
        const ringColor = isStart
          ? COLORS.ringPathStart
          : (isEnd ? COLORS.ringPathEnd : COLORS.ringPathMid)
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + SIZES.ringGap, 0, 2 * Math.PI)
        ctx.strokeStyle = ringColor
        ctx.lineWidth = SIZES.ringWidth
        ctx.stroke()
      }

      if (queryActive && isMatch && !isSelected) {
        ctx.beginPath()
        const ringExtra = isPathHighlight ? 2 : 0
        ctx.arc(node.x, node.y, r + SIZES.ringGap + ringExtra, 0, 2 * Math.PI)
        ctx.strokeStyle = COLORS.ringSearch
        ctx.lineWidth = 1
        ctx.stroke()
      }

      if (globalScale >= 1.2) {
        const fontSize = Math.min(12 / globalScale, 3)
        ctx.font = `${fontSize}px Sans-Serif`
        ctx.fillStyle = COLORS.label
        ctx.textAlign = 'center'
        const ringPad = (isSelected || isPathHighlight) ? 5 : 1
        ctx.fillText(node.title, node.x, node.y + r + ringPad + fontSize + 1)
      }

      ctx.globalAlpha = 1
    })
    .nodeCanvasObjectMode(() => 'replace')

  const { width, height } = containerEl.value.getBoundingClientRect()
  if (width && height) fg.width(width).height(height)

  const ro = new ResizeObserver(([e]) => {
    fg?.width(e.contentRect.width).height(e.contentRect.height)
  })
  ro.observe(containerEl.value)
  onUnmounted(() => ro.disconnect())
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  fg?.pauseAnimation()
  fg = null
})

watch(() => props.data, d => {
  fg?.graphData(d)
  if (pathMode.value) {
    deactivatePath()
  }
})

watch(() => props.selectedSlug, slug => {
  if (!slug || !fg) return
  const node = fg.graphData().nodes.find(n => n.slug === slug)
  if (node?.x != null) fg.centerAt(node.x, node.y, 400)
})

</script>
