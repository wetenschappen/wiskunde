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
<MathSlideWrapper :title="slide.title" badge="VERGELIJKING">
    
    <div class="flex-1 grid grid-cols-2 gap-8 mt-4 pb-6">
        <!-- Left Panel (Slate Theme, No Left Border strip, No Glows) -->
        <div class="h-full flex flex-col bg-white border border-slate-200 rounded-xl p-8 shadow-sm relative overflow-hidden">
            <div class="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 shrink-0">
                <div class="w-11 h-11 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <component v-if="iconMap[slide.left?.icon]" :is="iconMap[slide.left?.icon]" class="text-[1.6rem]" weight="bold" />
                </div>
                <h4 class="text-[1.8rem] font-bold text-slate-800 uppercase tracking-wider" v-html="slide.left?.title || slide.leftTitle"></h4>
            </div>
            
            <p class="text-[1.6rem] leading-relaxed text-slate-600 mb-6 flex-shrink-0" v-html="slide.left?.content || slide.leftContent"></p>
            
            <div v-if="slide.left?.example || slide.leftExample" class="shrink-0 mt-auto bg-slate-50 p-5 rounded-lg border border-slate-200">
                <p class="text-[1.1rem] font-bold text-slate-700 uppercase tracking-wider mb-2">Voorbeeld</p>
                <div class="font-math text-[1.7rem] font-bold text-slate-900" v-html="slide.left?.example || slide.leftExample"></div>
            </div>
            
            <div v-if="slide.left?.image" class="mt-auto pt-4 shrink-0 flex justify-center">
                <img :src="resolveImageUrl(slide.left.image)" class="rounded-lg border border-slate-200 max-h-[200px] object-contain shadow-sm">
            </div>
        </div>

        <!-- Right Panel (Amber Theme, No Right Border strip, No Glows) -->
        <div class="h-full flex flex-col bg-white border border-amber-200 rounded-xl p-8 shadow-sm relative overflow-hidden">
            <div class="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 shrink-0">
                <div class="w-11 h-11 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <component v-if="iconMap[slide.right?.icon]" :is="iconMap[slide.right?.icon]" class="text-[1.6rem]" weight="bold" />
                </div>
                <h4 class="text-[1.8rem] font-bold text-slate-800 uppercase tracking-wider" v-html="slide.right?.title || slide.rightTitle"></h4>
            </div>
            
            <p class="text-[1.6rem] leading-relaxed text-slate-650 mb-6 flex-shrink-0" v-html="slide.right?.content || slide.rightContent"></p>
            
            <div v-if="slide.right?.example || slide.rightExample" class="shrink-0 mt-auto bg-amber-50/20 p-5 rounded-lg border border-amber-100">
                <p class="text-[1.1rem] font-bold text-amber-800 uppercase tracking-wider mb-2">Voorbeeld</p>
                <div class="font-math text-[1.7rem] font-bold text-amber-900" v-html="slide.right?.example || slide.rightExample"></div>
            </div>
            
            <div v-if="slide.right?.image" class="mt-auto pt-4 shrink-0 flex justify-center">
                <img :src="resolveImageUrl(slide.right.image)" class="rounded-lg border border-slate-200 max-h-[200px] object-contain shadow-sm">
            </div>
        </div>
    </div>
</MathSlideWrapper>
</template>
