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
<MathSlideWrapper :title="slide.title || 'Definitie'" badge="THEORIE">
    <PedagogyPanel variant="theory" :title="slide.term || 'Definitie'" icon="definition">
        <div v-if="slide.formula" class="text-center py-6 mb-6">
            <p class="text-[4.5rem] text-slate-800 font-bold" v-html="slide.formula"></p>
        </div>
        
        <p v-html="slide.explanation" class="text-[1.8rem] text-slate-700 font-medium"></p>
        
        <ul v-if="slide.conditions && slide.conditions.length" class="mt-6 space-y-3">
            <li v-for="(condition, idx) in slide.conditions" :key="idx" 
                class="text-[1.5rem] text-slate-600 flex items-start gap-3 bg-slate-50 border border-slate-200 p-4 rounded-lg">
                <div class="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                </div>
                <span v-html="condition" class="pt-0.5"></span>
            </li>
        </ul>
    </PedagogyPanel>
    
    <!-- Examples Grid (No gradients or shadows) -->
    <div v-if="slide.examples && slide.examples.length" class="grid grid-cols-2 gap-6 mt-6">
        <div v-for="(example, idx) in slide.examples" :key="idx"
             class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <p class="text-[2.2rem] font-bold text-slate-800 mb-3" v-html="example.formula"></p>
            <p class="text-[1.45rem] text-slate-500 leading-relaxed font-medium" v-html="example.note"></p>
        </div>
    </div>
    
    <!-- Related Terms (No backdrop blur or absolute overlays) -->
    <div v-if="slide.relatedTerms && slide.relatedTerms.length" class="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-100">
        <span v-for="(term, idx) in slide.relatedTerms" :key="idx"
              class="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-full text-[1.3rem] text-slate-650 font-bold tracking-wide uppercase cursor-default">
            {{ term }}
        </span>
    </div>
</MathSlideWrapper>
</template>
