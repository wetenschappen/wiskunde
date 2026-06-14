<script setup>
import { inject, computed } from 'vue'
import MathSlideWrapper from './shared/MathSlideWrapper.vue'
import PedagogyPanel from './shared/PedagogyPanel.vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 },
    parsedCursusLink: { type: Object, default: () => ({}) },
    currentMathConfigForAnalysis: { type: Object, default: null }
})

const emit = defineEmits(['revealNext', 'selectAnswer', 'checkAnswer', 'copyLink', 'showConfetti'])

const hasHighlight = computed(() => {
    return props.slide.rows?.some(row => row.highlight)
})
</script>

<template>
<MathSlideWrapper :title="slide.title" badge="WAARDETABEL">
    
    <div class="flex flex-col items-center justify-center min-h-[450px] mt-4">
        
        <!-- Formula Header -->
        <PedagogyPanel v-if="slide.formula" variant="formula" title="Functievoorschrift" icon="formula" class="w-full max-w-4xl mb-8 shadow-sm">
            <div class="text-[2.2rem] font-bold text-center font-math text-slate-800" v-html="slide.formula"></div>
        </PedagogyPanel>
        
        <!-- Table container (No Glows or Shadows) -->
        <div class="relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table class="text-[1.8rem] border-collapse min-w-[600px]">
                <thead>
                    <tr class="bg-slate-900 text-white">
                        <th class="px-6 py-4 text-center font-bold font-math text-[2rem] border-r border-slate-800 min-w-[120px]">{{ slide.xLabel || 'x' }}</th>
                        <th v-for="(row, idx) in slide.rows" :key="'x-'+idx" 
                            class="px-6 py-4 text-center font-bold font-math text-[2rem] border-r border-slate-800 last:border-r-0 min-w-[80px]"
                            :class="{'bg-amber-600 text-white border-r-amber-500': row.highlight}">
                            <span v-html="row.x"></span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="bg-white">
                        <td class="px-6 py-4 text-center font-bold text-slate-900 font-math text-[2rem] bg-slate-50 border-r border-slate-200">
                            {{ slide.yLabel || 'f(x)' }}
                        </td>
                        <td v-for="(row, idx) in slide.rows" :key="'y-'+idx" 
                            class="px-6 py-4 text-center border-r border-slate-200 last:border-r-0 font-math text-[2rem]"
                            :class="row.highlight ? 'bg-amber-50 font-extrabold text-amber-900' : 'text-slate-700'">
                            <span v-html="row.y"></span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Optional Note -->
        <div v-if="slide.note" class="mt-8 text-[1.4rem] text-slate-500 font-medium bg-white px-5 py-2 rounded-full border border-slate-200 shadow-sm" v-html="slide.note"></div>
    </div>
    
</MathSlideWrapper>
</template>

<style scoped>
table, th, td {
  font-family: 'Open Sans', sans-serif;
}
</style>
