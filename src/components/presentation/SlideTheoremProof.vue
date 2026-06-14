<script setup>
import { computed } from 'vue'
import MathSlideWrapper from './shared/MathSlideWrapper.vue'
import PedagogyPanel from './shared/PedagogyPanel.vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 }
})

const emit = defineEmits(['revealNext'])
</script>

<template>
<MathSlideWrapper :title="slide.title || 'Stelling'" badge="WISKUNDIG BEWIJS">
    
    <div class="flex-1 grid grid-cols-[1fr_1.2fr] gap-8 mt-4 pb-6">
        
        <!-- Left: Statement (Given & To Prove) -->
        <div class="flex flex-col gap-6">
            <PedagogyPanel variant="theory" title="Gegeven" icon="info">
                <div class="text-[1.7rem] text-slate-700 leading-relaxed font-medium" v-html="slide.given"></div>
                <div v-if="slide.image" class="mt-6 flex justify-center">
                    <img :src="slide.image" class="max-w-full max-h-[240px] object-contain rounded-xl border border-slate-200 shadow-sm" />
                </div>
            </PedagogyPanel>
            
            <PedagogyPanel variant="formula" title="Te Bewijzen" icon="target">
                <div class="text-[2.2rem] text-amber-800 font-math font-extrabold" v-html="slide.toProve"></div>
            </PedagogyPanel>
        </div>
        
        <!-- Right: Proof Steps (No Gradients or Violet Shadows) -->
        <div class="relative bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col h-full overflow-hidden">
            
            <h4 class="text-[1.2rem] font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 shrink-0">
                <div class="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                Bewijs
            </h4>
            
            <div class="flex-1 overflow-y-auto exercise-scroll pr-2 space-y-6">
                <div v-for="(step, idx) in slide.steps" :key="idx"
                     class="transition-all duration-300 relative"
                     :class="idx < revealedSteps ? 'opacity-100' : 'opacity-0 -translate-x-8 absolute pointer-events-none'">
                     
                    <!-- Connecting line -->
                    <div v-if="idx < slide.steps.length - 1" class="absolute left-4 top-10 bottom-[-2rem] w-px bg-slate-200"></div>
                     
                    <div class="flex gap-4 relative z-10">
                        <div class="w-8 h-8 rounded-full bg-slate-800 text-white font-extrabold flex items-center justify-center shrink-0 border-2 border-white mt-1 shadow-sm">
                            {{ idx + 1 }}
                        </div>
                        <div class="flex-1">
                            <p class="text-[1.7rem] text-slate-700 font-medium leading-[1.6]" v-html="step.text"></p>
                            <div v-if="step.formula" class="mt-3 p-5 bg-slate-50 rounded-xl border border-slate-200 text-[2rem] font-bold text-slate-800 text-center" v-html="step.formula"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Q.E.D. Box (Solid Black Square) -->
                <div v-if="revealedSteps >= slide.steps.length" class="flex justify-end pt-4 animate-[fadeInUp_0.3s_ease-out]">
                    <div class="w-7 h-7 bg-slate-900 flex items-center justify-center shadow-sm">
                        <div class="w-3.5 h-3.5 bg-white"></div>
                    </div>
                </div>
            </div>
            
            <!-- Progress interaction -->
            <div v-if="revealedSteps < slide.steps.length" class="mt-6 pt-4 border-t border-slate-100 flex justify-center shrink-0">
                <div class="flex items-center gap-2 text-slate-400 font-bold text-[1.2rem] uppercase tracking-wide">
                    <span>Druk op</span>
                    <span class="px-2 py-1 bg-slate-100 rounded border border-slate-300 font-mono text-[1.1rem] text-slate-600 font-extrabold select-none">SPATIE</span>
                    <span>voor de volgende stap</span>
                </div>
            </div>
            
        </div>
    </div>
</MathSlideWrapper>
</template>
