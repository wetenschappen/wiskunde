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
<div class="w-full h-full flex flex-col items-center justify-center p-20 bg-white relative">
    <div class="w-full max-w-7xl text-center">
        <h3 class="text-4xl uppercase tracking-[0.4em] text-slate-400 mb-20 font-bold" v-html="slide.title"></h3>
        
        <div class="bg-slate-50 p-20 rounded-[2rem] border-2 border-slate-100 mb-8 inline-block font-mono shadow-sm">
            <p class="text-[9rem] font-bold text-slate-900 tracking-tighter">{{ slide.equation }}</p>
        </div>
        
        <!-- Subtitle under the equation -->
        <p v-if="slide.subtitle" class="text-2xl text-slate-500 mb-16 italic">{{ slide.subtitle }}</p>

        <div v-if="slide.parts && slide.parts.length" class="flex justify-center gap-12">
            <div v-for="(part, idx) in slide.parts" :key="idx" 
                 class="p-10 rounded-2xl border-t-4 bg-white shadow-sm ring-1 ring-slate-100 text-left w-[500px]"
                 :class="part.color === 'violet' ? 'border-slate-400' : 'border-amber-500'">
                <h4 class="text-2xl uppercase tracking-widest font-bold mb-6 text-slate-400">
                    {{ part.label }}
                </h4>
                <ul class="space-y-4">
                     <li v-for="item in part.items" :key="item" class="text-3xl text-slate-600 font-light">{{ item }}</li>
                </ul>
             </div>
        </div>
    </div>
</div>
</template>

<style scoped>
</style>
