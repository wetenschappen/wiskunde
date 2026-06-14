<script setup>
import { inject } from 'vue'
import MathSlideWrapper from './shared/MathSlideWrapper.vue'

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
<MathSlideWrapper :title="slide.title" badge="STAPPENPLAN">
    
    <div class="flex-1 mt-4 pb-8">
        <div class="grid gap-6" :class="slide.steps.length > 4 ? 'grid-cols-3' : 'grid-cols-2'">
            
            <div v-for="(step, idx) in slide.steps" :key="idx"
                 class="relative transition-all duration-300"
                 :class="idx < revealedSteps ? 'opacity-100' : 'opacity-40 scale-[0.98] grayscale-[0.5]'">
                 
                <div class="relative flex flex-col h-full p-8 rounded-xl border bg-white overflow-hidden shadow-sm"
                     :class="idx < revealedSteps ? 'border-amber-250 bg-amber-50/10' : 'border-slate-200 bg-white'">
                     
                    <div class="flex items-center gap-4 mb-5 relative z-10">
                      <!-- Step badge (Navy/Amber styled) -->
                      <div class="w-11 h-11 rounded-lg flex items-center justify-center text-[1.4rem] font-bold shrink-0 shadow-sm"
                           :class="idx < revealedSteps ? 'bg-amber-500 text-slate-900 border border-amber-400' : 'bg-slate-100 text-slate-500'">
                          <component v-if="step.icon && iconMap[step.icon]" :is="iconMap[step.icon]" weight="bold" class="text-[1.6rem]" />
                          <span v-else>{{ idx + 1 }}</span>
                      </div>
                      <div v-if="step.title" class="text-[1.4rem] font-extrabold uppercase tracking-wider" :class="idx < revealedSteps ? 'text-amber-850' : 'text-slate-400'" v-html="step.title"></div>
                    </div>

                    <p class="text-[1.6rem] font-medium text-slate-700 leading-relaxed relative z-10" v-html="step.text"></p>
                </div>
            </div>

            <!-- Optional Image Box -->
            <div v-if="slide.image" class="rounded-xl overflow-hidden flex items-center justify-center bg-white border border-slate-200 shadow-sm p-4 relative group min-h-[220px]">
                <img :src="resolveImageUrl(slide.image)" class="max-w-full max-h-full object-contain transition-transform duration-500">
            </div>
        </div>
    </div>
</MathSlideWrapper>
</template>
