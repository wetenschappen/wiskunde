<template>
  <span v-html="rendered"></span>
</template>

<script setup>
import { computed } from 'vue'
import { renderMath } from '../src/composables/useMathRenderer.js'

const props = defineProps({
  content: { type: String, default: '' }
})

const rendered = computed(() => renderMath(props.content))
</script>
