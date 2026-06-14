<script setup>
import { inject } from 'vue'
import MathSlideWrapper from './shared/MathSlideWrapper.vue'
import PedagogyPanel from './shared/PedagogyPanel.vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 },
    parsedCursusLink: { type: Object, default: () => ({}) },
    currentMathConfigForAnalysis: { type: Object, default: null }
})

const emit = defineEmits(['revealNext', 'selectAnswer', 'checkAnswer', 'copyLink', 'showConfetti'])
</script>

<template>
<MathSlideWrapper :title="slide.title" badge="UITLEG">
    <PedagogyPanel variant="theory" :title="slide.subtitle || 'Concept'" icon="info">
        <div class="text-[1.8rem] leading-[1.7] text-ink" v-html="slide.content || slide.text"></div>
    </PedagogyPanel>
</MathSlideWrapper>
</template>
