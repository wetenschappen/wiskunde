<script setup>
import { inject, computed } from 'vue'
import MathGraphSvg from '../activities/MathGraphSvg.vue'
import MathSlideWrapper from './shared/MathSlideWrapper.vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 },
    parsedCursusLink: { type: Object, default: () => ({}) },
    currentMathConfigForAnalysis: { type: Object, default: null },
    currentMathConfigForCycle: { type: Object, default: null }
})

const emit = defineEmits(['revealNext', 'selectAnswer', 'checkAnswer', 'copyLink', 'showConfetti'])

const resolveImageUrl = inject('resolveImageUrl')

const hasVisualContent = computed(() => {
    return props.slide.image || props.currentMathConfigForCycle
})
</script>

<template>
<MathSlideWrapper :title="slide.imageTitle || slide.title || slide.headerLabel || 'Oefening'" badge="OEFENING">
    
    <!-- Context block (No Left Border) -->
    <div v-if="slide.context && !hasVisualContent" class="mb-8 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div class="text-[1.1rem] font-bold text-slate-400 uppercase tracking-wider mb-2">Context</div>
        <p class="text-[1.7rem] text-slate-700 leading-relaxed" v-html="slide.context"></p>
    </div>

    <!-- Simple Layout (no visual) -->
    <div v-if="!hasVisualContent" class="space-y-6 pb-6">
        <div v-for="(step, idx) in slide.steps" :key="idx"
             class="relative transition-all duration-300"
             :class="idx < revealedSteps ? 'opacity-100' : 'opacity-40 scale-[0.98] grayscale-[0.3]'">
                 
            <div class="relative bg-white rounded-xl border overflow-hidden transition-all duration-300 shadow-sm"
                 :class="idx < revealedSteps ? 'border-amber-250 bg-amber-50/10' : 'border-slate-200'">
                
                <!-- Question Area -->
                <div class="px-8 py-5 flex items-center gap-4" :class="idx < revealedSteps ? 'border-b border-slate-100' : ''">
                     <div class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[1.3rem] shadow-sm shrink-0"
                          :class="idx < revealedSteps ? 'bg-slate-900 text-white border border-slate-950' : 'bg-slate-100 text-slate-500'">
                          {{ idx + 1 }}
                     </div>
                     <div class="text-[1.7rem] font-bold text-slate-800 leading-snug" v-html="step.question || step.title"></div>
                </div>
                
                <!-- Answer Area (Amber Highlight, No Left Border) -->
                <div v-if="idx < revealedSteps" class="px-8 py-6 bg-amber-50/20 text-[1.6rem] text-slate-700 leading-relaxed animate-[fadeInUp_0.3s_ease-out]">
                     <div class="flex items-start gap-4">
                         <span v-if="step.answer" class="text-amber-850 font-bold uppercase tracking-wider text-[1.1rem] mt-1 shrink-0 bg-amber-100 border border-amber-250 px-3 py-1 rounded-md">Antwoord</span>
                         <span v-html="step.answer || step.content" class="block pt-0.5"></span>
                     </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Visual Layout (with image/graph) -->
    <div v-else class="grid grid-cols-[1fr_520px] gap-8 pb-4 h-full min-h-[500px]">
        <!-- Visual Content Left Side -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-8 relative shadow-sm">
            <!-- Grid pattern -->
            <div class="absolute inset-0 pointer-events-none opacity-[0.02]" 
                 style="background-image: radial-gradient(#0f172a 2px, transparent 2px); background-size: 24px 24px;">
            </div>
            
            <img v-if="slide.image && !currentMathConfigForCycle" :src="resolveImageUrl(slide.image)" class="max-w-full max-h-full object-contain relative z-10">
            
            <Transition name="fade-image" mode="out-in">
                <MathGraphSvg 
                    v-if="currentMathConfigForCycle" 
                    :key="'circuit-'+revealedSteps" 
                    :config="currentMathConfigForCycle" 
                    class="max-w-full max-h-full drop-shadow-sm transition-all duration-500 relative z-10" 
                />
            </Transition>
        </div>

        <!-- Steps Right Side -->
        <div class="flex flex-col gap-5">
            <div v-for="(step, idx) in slide.steps" :key="idx"
                 class="relative bg-white rounded-xl border overflow-hidden transition-all duration-300"
                 :class="idx < revealedSteps ? 'border-amber-250 bg-amber-50/10 shadow-sm' : 'border-slate-200 shadow-sm opacity-50 scale-[0.98]'">
                
                <!-- Step Header -->
                <div class="px-6 py-4 flex items-center gap-4" :class="idx < revealedSteps ? 'bg-amber-50/20 border-b border-amber-100/50' : 'bg-slate-50/50'">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[1.1rem] shrink-0 shadow-sm"
                         :class="idx < revealedSteps ? 'bg-slate-900 text-white' : 'bg-slate-250 text-slate-500'">
                        {{ idx + 1 }}
                    </div>
                    <h4 class="text-[1.5rem] font-bold text-slate-800" v-html="step.title || step.question"></h4>
                </div>
                
                <!-- Step Content -->
                <div v-if="idx < revealedSteps" class="px-6 py-5 bg-white text-[1.5rem] leading-relaxed text-slate-650 animate-[fadeInUp_0.3s_ease-out]">
                    <div v-html="step.content || step.answer"></div>
                </div>
            </div>
            
            <div v-if="revealedSteps >= slide.steps.length" class="mt-2 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-3 animate-[fadeIn_0.4s_ease-out]">
                <div class="w-7 h-7 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center shadow-inner">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span class="text-[1.35rem] font-bold text-amber-900 uppercase tracking-wider">Alle stappen voltooid</span>
            </div>
        </div>
    </div>
</MathSlideWrapper>
</template>
