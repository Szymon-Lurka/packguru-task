<template>
  <div class="chunk-panel">
    <div class="panel-header">
      <div class="panel-title">
        <span class="type-badge type-procedure">{{ t('part.badge') }}</span>
        <h2>{{ part.title }}</h2>
        <p class="summary">
          {{ part.source_name }} · {{ t('part.partWord') }} {{ part.part_index }}{{ fmtTimeRange(part.start_seconds, part.end_seconds) }}{{ langSuffix }}
        </p>
      </div>
      <button class="close-btn" :title="t('part.closeTitle')" @click="emit('close')">&#x2715;</button>
    </div>
    <div class="panel-body">
      <div class="markdown-content" v-html="parsedBody" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import { fmtTimeRange } from '../utils/format.js'

const { t } = useI18n()

const props = defineProps({
  part: { type: Object, required: true },
})
const emit = defineEmits(['close'])

const langSuffix = computed(() => props.part.language ? ` · ${props.part.language}` : '')
const parsedBody = computed(() => marked.parse(props.part.body_markdown || ''))
</script>
