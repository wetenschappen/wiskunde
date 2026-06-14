<script setup>
const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 },
    parsedCursusLink: { type: Object, default: () => ({}) },
    currentMathConfigForAnalysis: { type: Object, default: null }
})

const emit = defineEmits(['revealNext', 'selectAnswer', 'checkAnswer', 'copyLink', 'showConfetti'])
</script>

<template>
<div class="w-full h-full flex flex-col items-center justify-center p-20 bg-white">
    <div class="w-full max-w-6xl">
        <h3 class="text-6xl font-bold text-slate-900 mb-16 tracking-tight border-b-4 border-slate-100 pb-8" v-html="slide.title"></h3>
        <div class="text-5xl leading-relaxed text-slate-600 font-serif italic">
            <div v-html="slide.content || slide.text"></div>
        </div>
    </div>
</div>
</template>

<style scoped>
</style>
