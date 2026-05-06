const localeModules = import.meta.glob('../locales/*.json', { eager: true })

function buildMessages() {
  const messages = {}
  for (const path of Object.keys(localeModules)) {
    const m = path.match(/^\.\.\/locales\/([^/]+)\.json$/)
    if (!m) continue
    const code = m[1]
    const raw = localeModules[path]?.default
    if (raw && typeof raw === 'object') messages[code] = raw
  }
  return messages
}

export const messages = buildMessages()
