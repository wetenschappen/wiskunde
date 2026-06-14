<script setup>
import { inject } from 'vue'

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
<div class="absolute inset-0 w-full h-full bg-slate-950 flex flex-col select-none">
    <div class="flex-1 relative">
        <img :src="resolveImageUrl(slide.image)" class="w-full h-full object-cover opacity-50" />
        <!-- Soft solid dimming overlay -->
        <div class="absolute inset-0 bg-slate-950/30"></div>
        
        <!-- Content Box -->
        <div class="absolute bottom-20 left-16 right-16">
            <h2 class="text-[4rem] leading-tight font-extrabold text-white mb-4 tracking-tight" v-html="slide.title"></h2>
            <p class="text-[2rem] text-amber-400 max-w-4xl leading-relaxed font-light" v-html="slide.subtitle"></p>
        </div>
    </div>
    <div v-if="slide.credit" class="h-12 bg-slate-900 border-t border-slate-800 flex items-center px-16 shrink-0">
        <span class="text-white/40 text-[1.1rem]">Afbeelding: {{ slide.credit }}</span>
    </div>
</div>
</template>

<style scoped>
h2, p {
  font-family: 'Open Sans', sans-serif;
}
</style>
