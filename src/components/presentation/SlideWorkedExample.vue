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
<MathSlideWrapper :title="slide.title" badge="VOORBEELD">
    
    <div class="flex-1 grid grid-cols-[1fr_1.2fr] gap-8 mt-4 pb-6">
        <!-- Left: Problem -->
        <div>
            <PedagogyPanel variant="example" title="Opgave" icon="worked-example">
                <div v-if="slide.method" class="mb-4 inline-flex px-4 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[1.1rem] font-bold tracking-wider uppercase">
                    Methode: {{ slide.method }}
                </div>
                <div class="text-[1.7rem] leading-relaxed text-slate-700 font-medium" v-html="slide.problem"></div>
            </PedagogyPanel>
        </div>
        
        <!-- Right: Solution steps -->
        <div class="flex flex-col gap-5 pt-4">
            <h4 class="text-[1.2rem] font-bold uppercase tracking-wider text-slate-400 mb-2 pl-2">Uitwerking</h4>
            
            <div class="space-y-4">
                <div v-for="(step, idx) in slide.steps" :key="idx"
                     class="relative transition-all duration-300"
                     :class="idx < revealedSteps ? 'opacity-100' : 'opacity-0 translate-y-8 absolute pointer-events-none'">
                    
                    <div class="relative bg-white rounded-xl p-6 border border-slate-200 flex gap-5 overflow-hidden shadow-sm">
                        <!-- Step vertical timeline connector -->
                        <div class="absolute left-9 top-18 bottom-[-2rem] w-px bg-slate-200" v-if="idx < slide.steps.length - 1"></div>
                        
                        <!-- Step number badge (Navy) -->
                        <div class="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[1.4rem] font-bold shrink-0 shadow-sm relative z-10">
                            {{ idx + 1 }}
                        </div>
                        
                        <!-- Step content -->
                        <div class="flex-1 pt-0.5">
                            <p class="text-[1.3rem] text-amber-800 mb-2 font-bold tracking-wider uppercase" v-html="step.action"></p>
                            <p class="text-[2.2rem] font-bold text-slate-800 font-math" v-html="step.result"></p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Answer Box (Flat border style, Amber theme) -->
            <div v-if="slide.answer && revealedSteps >= slide.steps.length" 
                 class="mt-4 relative bg-amber-50 border border-amber-200 text-slate-800 p-6 rounded-xl shadow-sm animate-[fadeInUp_0.3s_ease-out]">
                 
                 <div class="relative z-10">
                    <h4 class="text-[1.1rem] font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Eindresultaat
                    </h4>
                    <p class="text-[2.6rem] font-extrabold text-slate-900 font-math" v-html="slide.answer"></p>
                    <p v-if="slide.check" class="text-[1.45rem] text-slate-700 mt-4 bg-white p-3 rounded-lg border border-slate-200" v-html="slide.check"></p>
                 </div>
            </div>
        </div>
    </div>
</MathSlideWrapper>
</template>
