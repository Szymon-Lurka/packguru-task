import { ref, watch, onMounted, onUnmounted } from 'vue'

export function useGraphSearch(opts = {}) {
  const {
    isActiveRef = null,
    debounceMs = 180,
    minQueryLength = 1,
    resetOnDeactivate = true,
  } = opts

  const inputEl = ref(null)
  const query = ref('')
  const debouncedQuery = ref('')
  const matchCount = ref(0)

  let debounceTimer = null

  function clear() {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    query.value = ''
    debouncedQuery.value = ''
    matchCount.value = 0
    if (!isActiveRef || isActiveRef.value) {
      inputEl.value?.focus()
    }
  }

  watch(query, q => {
    const qNorm = String(q || '').trim()
    if (!qNorm || qNorm.length < minQueryLength) {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
      debouncedQuery.value = ''
      matchCount.value = 0
      return
    }

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debouncedQuery.value = qNorm
      debounceTimer = null
    }, debounceMs)
  })

  function onKeydown(e) {
    if (isActiveRef && !isActiveRef.value) return

    if (e.key === '/') {
      e.preventDefault()
      inputEl.value?.focus()
      return
    }

    if (e.key === 'Escape') {
      if (!query.value) return
      e.preventDefault()
      clear()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
    if (debounceTimer) clearTimeout(debounceTimer)
  })

  if (isActiveRef && resetOnDeactivate) {
    watch(isActiveRef, active => {
      if (active) return
      if (!query.value && !debouncedQuery.value) return
      clear()
    })
  }

  return {
    inputEl,
    query,
    debouncedQuery,
    matchCount,
    setMatchCount(n) { matchCount.value = n || 0 },
    clear,
  }
}

