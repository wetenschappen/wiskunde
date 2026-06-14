<script setup>
import { inject, computed } from 'vue'
import MathSlideWrapper from './shared/MathSlideWrapper.vue'
import PedagogyPanel from './shared/PedagogyPanel.vue'
import MathGraphSvg from '../activities/MathGraphSvg.vue'
import { PhGraph } from '@phosphor-icons/vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 },
    parsedCursusLink: { type: Object, default: () => ({}) },
    currentMathConfigForAnalysis: { type: Object, default: null }
})

const emit = defineEmits(['revealNext', 'selectAnswer', 'checkAnswer', 'copyLink', 'showConfetti'])

const resolveImageUrl = inject('resolveImageUrl')
const iconMap = inject('iconMap', {})

const hasGraph = computed(() => {
    return props.slide.image || props.currentMathConfigForAnalysis
})

function getIcon(iconName) {
    return iconMap[iconName] || iconMap['info']
}
</script>

<template>
<MathSlideWrapper :title="slide.title" badge="EIGENSCHAPPEN">
    
    <div class="flex-1 grid grid-cols-[1.2fr_1fr] gap-8 mt-4 pb-6">
        <!-- Properties List -->
        <div class="flex flex-col gap-5">
            <div v-for="(prop, idx) in slide.properties" :key="idx" 
                 class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden">
                
                <div class="flex items-start gap-4">
                    <!-- Clean Icon Badge (No Gradients) -->
                    <div class="w-11 h-11 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                        <component :is="getIcon(prop.icon)" weight="bold" class="text-[1.6rem]" />
                    </div>
                    <div class="flex-1 pt-0.5">
                        <div class="text-[1.2rem] font-bold text-amber-600 uppercase tracking-wider mb-1.5" v-html="prop.label"></div>
                        <div class="text-[1.7rem] text-slate-700 font-medium leading-relaxed" v-html="prop.value"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Graph Area (No Blur or Gradients) -->
        <div v-if="hasGraph" class="bg-white border border-slate-200 rounded-xl flex items-center justify-center p-8 overflow-hidden relative shadow-sm">
            <!-- Grid decoration -->
            <div class="absolute inset-0 pointer-events-none opacity-[0.01]" 
                 style="background-image: radial-gradient(#0f172a 2px, transparent 2px); background-size: 20px 20px;">
            </div>
            
            <img v-if="slide.image" :src="resolveImageUrl(slide.image)" class="max-w-full max-h-full object-contain relative z-10" />
            <MathGraphSvg v-else-if="currentMathConfigForAnalysis" 
                          :config="currentMathConfigForAnalysis" 
                          class="max-w-full max-h-full drop-shadow-sm relative z-10" />
        </div>
    </div>
    
    <!-- Summary block (No Left Border, No Gradients) -->
    <div v-if="slide.summary" class="mt-4">
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
            <p class="text-[1.6rem] text-amber-900 font-semibold leading-relaxed" v-html="slide.summary"></p>
        </div>
    </div>
</MathSlideWrapper>
</template>
