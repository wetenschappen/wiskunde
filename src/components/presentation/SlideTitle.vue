<script setup>
import { PhPi, PhStudent } from '@phosphor-icons/vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 },
    parsedCursusLink: { type: Object, default: () => ({}) },
    currentMathConfigForAnalysis: { type: Object, default: null }
})

const emit = defineEmits(['revealNext', 'selectAnswer', 'checkAnswer', 'copyLink', 'showConfetti'])
</script>

<template>
<div class="absolute inset-0 bg-slate-900 text-white flex flex-col items-center justify-center p-20 select-none">
    <div class="mb-12">
        <PhStudent weight="thin" class="text-[10rem] text-amber-500 opacity-80" />
    </div>
    <h2 class="text-8xl font-serif italic mb-6 text-center tracking-tight" v-html="slide.title"></h2>
    <div class="w-32 h-1 bg-amber-500 mb-8"></div>
    <p v-if="slide.subtitle" class="text-4xl text-slate-300 max-w-5xl mx-auto leading-relaxed font-light text-center" v-html="slide.subtitle"></p>
    <div v-if="slide.badge" class="mt-24 flex flex-col items-center gap-4">
        <span class="text-xl uppercase tracking-[0.3em] text-amber-500 font-bold border-t border-slate-700 pt-6 px-12">{{ slide.badge }}</span>
    </div>
</div>
</template>

<style scoped>
</style>
