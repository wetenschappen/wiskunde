<script setup>
import { PhPi } from '@phosphor-icons/vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 },
    parsedCursusLink: { type: Object, default: () => ({}) },
    currentMathConfigForAnalysis: { type: Object, default: null }
})

const emit = defineEmits(['revealNext', 'selectAnswer', 'checkAnswer', 'copyLink', 'showConfetti'])
</script>

<template>
<div class="absolute inset-0 bg-white text-slate-800 flex flex-col justify-between select-none">
    <!-- Clean Top Header Bar (With Amber bottom border) -->
    <div class="h-[120px] flex items-center px-20 border-b-4 border-amber-500 bg-slate-900 text-white">
        <div class="w-12 h-12 bg-amber-500 text-slate-900 rounded-lg flex items-center justify-center shadow-sm">
            <PhPi weight="bold" class="text-[1.8rem]" />
        </div>
    </div>
    
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col justify-center px-20">
        <h2 class="text-[4.5rem] font-extrabold text-slate-900 leading-tight tracking-tight max-w-5xl" v-html="slide.title"></h2>
        <p v-if="slide.subtitle" class="text-[2rem] text-slate-500 font-light mt-6 max-w-4xl leading-relaxed" v-html="slide.subtitle"></p>
        
        <!-- Amber Badge (Replacing Blue Badge) -->
        <div v-if="slide.badge" class="mt-8">
            <span class="inline-flex px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[1.2rem] font-bold tracking-wider uppercase">
                {{ slide.badge }}
            </span>
        </div>
    </div>
    
    <!-- Bottom Accent Line (Amber) -->
    <div class="h-1.5 bg-amber-500 shrink-0"></div>
</div>
</template>

<style scoped>
h2, p {
  font-family: 'Open Sans', sans-serif;
}
</style>
