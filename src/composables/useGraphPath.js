import { ref, computed } from 'vue'

function slugOf(end) {
  return typeof end === 'string' ? end : end?.slug
}

function linkKey(a, b) {
  if (!a || !b) return null
  return [a, b].sort().join('|')
}

function bfsShortestPath(adj, start, end) {
  if (!start || !end) return null
  if (start === end) return [start]
  if (!adj.has(start) || !adj.has(end)) return null

  const queue = [start]
  let head = 0
  const prev = new Map()
  prev.set(start, null)

  while (head < queue.length) {
    const cur = queue[head++]
    if (cur === end) break
    const nbrs = adj.get(cur)
    if (!nbrs) continue
    for (const nxt of nbrs) {
      if (prev.has(nxt)) continue
      prev.set(nxt, cur)
      queue.push(nxt)
    }
  }

  if (!prev.has(end)) return null

  const out = []
  let cur = end
  while (cur != null) {
    out.push(cur)
    cur = prev.get(cur)
  }
  out.reverse()
  return out
}

export function useGraphPath(dataRef) {
  const pathMode = ref(false)
  const pathStart = ref(null)
  const pathEnd = ref(null)
  const pathNodes = ref(new Set())
  const pathLinks = ref(new Set())
  const pathNotFound = ref(false)

  const adjacency = computed(() => {
    const data = dataRef.value || { nodes: [], links: [] }
    const m = new Map()

    for (const node of data.nodes) {
      m.set(node.slug, new Set())
    }

    for (const link of data.links) {
      const a = slugOf(link.source)
      const b = slugOf(link.target)
      if (!a || !b) continue
      if (!m.has(a)) m.set(a, new Set())
      if (!m.has(b)) m.set(b, new Set())
      m.get(a).add(b)
      m.get(b).add(a)
    }

    return m
  })

  function resetPathState() {
    pathStart.value = null
    pathEnd.value = null
    pathNodes.value = new Set()
    pathLinks.value = new Set()
    pathNotFound.value = false
  }

  function applyPathResult(slugs) {
    if (!slugs || slugs.length === 0) {
      pathNodes.value = new Set()
      pathLinks.value = new Set()
      pathNotFound.value = !!(pathStart.value && pathEnd.value)
      return
    }

    const nodes = new Set(slugs)
    const links = new Set()
    for (let i = 0; i < slugs.length - 1; i++) {
      const key = linkKey(slugs[i], slugs[i + 1])
      if (key) links.add(key)
    }
    pathNodes.value = nodes
    pathLinks.value = links
    pathNotFound.value = false
  }

  function recomputePath() {
    if (!pathStart.value || !pathEnd.value) {
      pathNodes.value = new Set()
      pathLinks.value = new Set()
      pathNotFound.value = false
      return
    }
    const slugs = bfsShortestPath(adjacency.value, pathStart.value, pathEnd.value)
    applyPathResult(slugs)
  }

  function togglePathMode(opts = {}) {
    const next = !pathMode.value
    pathMode.value = next
    resetPathState()
    if (next && typeof opts.onEnter === 'function') opts.onEnter()
    if (!next && typeof opts.onExit === 'function') opts.onExit()
  }

  function onNodeClick(slug) {
    if (!slug) return
    if (!pathMode.value) return

    if (!pathStart.value) {
      pathStart.value = slug
      return
    }

    if (!pathEnd.value) {
      if (slug === pathStart.value) {
        resetPathState()
        return
      }
      pathEnd.value = slug
      recomputePath()
      return
    }

    if (slug === pathStart.value) {
      resetPathState()
      return
    }

    if (slug === pathEnd.value) return
    pathEnd.value = slug
    recomputePath()
  }

  function deactivate() {
    pathMode.value = false
    resetPathState()
  }

  function clearPathSelection() {
    resetPathState()
  }

  return {
    pathMode,
    pathStart,
    pathEnd,
    pathNodes,
    pathLinks,
    pathNotFound,
    togglePathMode,
    onNodeClick,
    deactivate,
    clearPathSelection,
    slugOf,
    linkKey,
  }
}

