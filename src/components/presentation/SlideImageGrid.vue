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
  <MathSlideWrapper :title="slide.title || 'Afbeeldingen'" badge="AFBEELDINGEN">
    <div class="grid gap-6 h-full flex-1"
         :class="{
           'grid-cols-2': !slide.columns || slide.columns === 2,
           'grid-cols-3': slide.columns === 3,
           'grid-cols-4': slide.columns === 4,
         }">
      <div v-for="(img, idx) in slide.images" :key="idx" class="flex flex-col h-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div class="flex-1 overflow-hidden flex items-center justify-center p-2 min-h-[220px]">
          <img :src="resolveImageUrl(img.src)" class="max-w-full max-h-full object-contain">
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1 text-center">
          <p class="text-[1.5rem] text-slate-800 font-semibold" v-html="img.caption"></p>
          <p v-if="img.title" class="text-[1.2rem] text-slate-400 font-medium" v-html="img.title"></p>
        </div>
      </div>
    </div>
  </MathSlideWrapper>
</template>
