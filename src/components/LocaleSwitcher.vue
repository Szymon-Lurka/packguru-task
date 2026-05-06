<template>
  <div class="locale-switch" role="group" :aria-label="t('locale.switchLabel')">
    <button
      v-for="item in LOCALES"
      :key="item.code"
      type="button"
      :class="['locale-btn', { active: locale === item.code }]"
      @click="setLocale(item.code)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { displayedLocaleCodes, localeNativeName } from '../i18n/localeUi.js'

const { locale, t } = useI18n()

const LOCALES = computed(() =>
  displayedLocaleCodes.map((code) => ({
    code,
    label: localeNativeName(code),
  })),
)

function setLocale(code) {
  locale.value = code
}
</script>
