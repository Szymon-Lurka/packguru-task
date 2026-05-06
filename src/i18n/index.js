import { createI18n } from 'vue-i18n'
import { messages } from './messages.js'

function pluralPolish(choice, choicesLength) {
  const n = Math.abs(choice)
  if (choicesLength === 4) {
    if (n === 0) return 0
    if (n === 1) return 1
    const mod10 = n % 10
    const mod100 = n % 100
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 2
    return 3
  }
  if (n === 1) return 0
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 1
  return 2
}

export const i18n = createI18n({
  legacy: false,
  locale: 'pl',
  fallbackLocale: 'en',
  messages,
  missingWarn: import.meta.env.DEV,
  fallbackWarn: import.meta.env.DEV,
  pluralRules: {
    pl: pluralPolish,
  },
})
