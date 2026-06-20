<template>
  <span v-html="rendered"></span>
</template>

<script setup>
import { computed } from 'vue'
import { processMathText } from '../src/composables/useMathEngine.js'

const props = defineProps({
  content: { type: String, default: '' }
})

const rendered = computed(() => processMathText(props.content))
</script>
