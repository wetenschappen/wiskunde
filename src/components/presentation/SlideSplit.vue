<script setup>
import { inject } from 'vue'
import MathSlideWrapper from './shared/MathSlideWrapper.vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 },
    parsedCursusLink: { type: Object, default: () => ({}) },
    currentMathConfigForAnalysis: { type: Object, default: null }
})

const emit = defineEmits(['revealNext', 'selectAnswer', 'checkAnswer', 'copyLink', 'showConfetti'])

const resolveImageUrl = inject('resolveImageUrl')
</script>

<template>
  <MathSlideWrapper :title="slide.title || 'Uitleg'" badge="UITLEG">
    <div class="grid grid-cols-2 gap-8 h-full flex-1 min-h-[400px]">
      <!-- Text Side -->
      <div class="flex flex-col h-full" :class="{ 'order-first': slide.imagePosition === 'right', 'order-last': slide.imagePosition === 'left' }">
        <div class="flex-1 bg-white rounded-xl border border-slate-200 p-8 overflow-y-auto exercise-scroll shadow-sm">
          <div class="text-[1.6rem] leading-relaxed text-slate-700 font-medium" v-html="slide.content || slide.text"></div>
        </div>
      </div>
      
      <!-- Image Side -->
      <div class="relative h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm"
           :class="{ 'order-last': slide.imagePosition === 'right' || !slide.imagePosition, 'order-first': slide.imagePosition === 'left' }">
        <img :src="resolveImageUrl(slide.image)" class="w-full h-full object-cover">
      </div>
    </div>
  </MathSlideWrapper>
</template>
