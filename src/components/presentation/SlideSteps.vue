<script setup>
import { inject } from 'vue'
import { PhArrowsOutSimple } from '@phosphor-icons/vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 },
    parsedCursusLink: { type: Object, default: () => ({}) },
    currentMathConfigForAnalysis: { type: Object, default: null }
})

const emit = defineEmits(['revealNext', 'selectAnswer', 'checkAnswer', 'copyLink', 'showConfetti'])

const resolveImageUrl = inject('resolveImageUrl')
const iconMap = inject('iconMap', {})
</script>

<template>
<div class="w-full h-full flex flex-col items-center justify-center p-20 bg-white relative">
    <div class="w-full max-w-7xl">
        <div class="flex items-center gap-8 mb-20">
            <div class="h-24 w-2 bg-amber-500"></div>
            <h3 class="text-7xl font-bold text-slate-900 tracking-tight" v-html="slide.title"></h3>
        </div>
        <div class="grid grid-cols-1 gap-8">
            <div v-for="(step, idx) in slide.steps" :key="idx" 
                 class="flex items-center gap-12 p-10 bg-slate-50 rounded-2xl border border-slate-100 transition-all duration-700"
                 :class="idx < revealedSteps ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'">
                <div class="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-900/10">
                    <component :is="iconMap[step.icon] || PhArrowsOutSimple" class="text-4xl text-amber-300" weight="thin" />
                </div>
                <p class="text-4xl font-medium text-slate-800 leading-tight" v-html="step.text || step.title"></p>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>
</style>
