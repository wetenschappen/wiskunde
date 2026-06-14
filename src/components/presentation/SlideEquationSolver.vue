<script setup>
import { computed } from 'vue'
import MathSlideWrapper from './shared/MathSlideWrapper.vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 }
})

const emit = defineEmits(['revealNext'])
</script>

<template>
<MathSlideWrapper :title="slide.title || 'Vergelijking Oplossen'" badge="UITWERKING">
    
    <div class="flex flex-col items-center mt-6 w-full">
        <!-- Main Math Box (No Left Border, No Gradients) -->
        <div class="w-full max-w-4xl bg-white border border-slate-200 rounded-xl p-10 shadow-sm relative overflow-hidden">
            <!-- Grid Background -->
            <div class="absolute inset-0 pointer-events-none opacity-[0.01]" 
                 style="background-image: radial-gradient(#0f172a 2px, transparent 2px); background-size: 20px 20px;">
            </div>
            
            <div class="flex flex-col gap-6 relative z-10">
                <div v-for="(step, idx) in slide.steps" :key="idx" 
                     class="flex items-center gap-6 transition-all duration-300"
                     :class="idx <= revealedSteps ? 'opacity-100' : 'opacity-0 translate-y-8 absolute pointer-events-none'">
                    
                    <!-- Left Side of Equation -->
                    <div class="flex-1 flex justify-end">
                        <span class="text-[2.5rem] font-bold text-slate-800 font-math" v-html="step.left"></span>
                    </div>
                    
                    <!-- Operator (=, <, >, etc) -->
                    <div class="w-16 flex justify-center shrink-0">
                        <span class="text-[2.5rem] font-bold text-amber-600 font-math" v-html="step.operator || '='"></span>
                    </div>
                    
                    <!-- Right Side of Equation -->
                    <div class="flex-1 flex justify-start items-center gap-8">
                        <span class="text-[2.5rem] font-bold text-slate-800 font-math" v-html="step.right"></span>
                        
                        <!-- Annotation (e.g. "+ 4 aan beide kanten") -->
                        <div v-if="step.annotation" class="opacity-0 animate-[fadeIn_0.5s_ease-out_0.2s_forwards]">
                            <span class="px-3.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-500 text-[1.3rem] font-extrabold uppercase tracking-wide">
                                | {{ step.annotation }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
        
        <!-- Next Step Prompt -->
        <div class="mt-8 h-10 flex justify-center">
            <div v-if="revealedSteps < slide.steps.length - 1" class="flex items-center gap-2 text-slate-400 font-bold text-[1.2rem] uppercase tracking-wide">
                <span>Druk op</span>
                <span class="px-2.5 py-1 bg-white border border-slate-200 shadow-sm rounded-md font-mono text-[1.1rem] text-slate-600 font-extrabold select-none">SPATIE</span>
                <span>voor de volgende stap</span>
            </div>
            <div v-else class="flex items-center gap-3 text-emerald-800 font-bold bg-emerald-50 px-6 py-2.5 rounded-xl border border-emerald-300 shadow-sm animate-[fadeInUp_0.4s_ease-out]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span class="text-[1.4rem] uppercase tracking-wider">Oplossing Voltooid</span>
            </div>
        </div>
        
    </div>

</MathSlideWrapper>
</template>
