import { messages } from './messages.js'

const LOCALE_BUTTON_ORDER = ['pl', 'en']

const LOCALE_NATIVE_NAMES = {
  pl: 'Polski',
  en: 'English',
}

const keys = Object.keys(messages)
const head = LOCALE_BUTTON_ORDER.filter((c) => keys.includes(c))
const tail = keys.filter((k) => !head.includes(k)).sort()

export const displayedLocaleCodes = [...head, ...tail]

export function localeNativeName(code) {
  return LOCALE_NATIVE_NAMES[code] ?? String(code)
}
