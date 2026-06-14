<script setup>
import { inject, computed, ref, watch } from 'vue'
import MathGraphSvg from '../activities/MathGraphSvg.vue'
import MathSlideWrapper from './shared/MathSlideWrapper.vue'
import { PhCheckCircle, PhCheck } from '@phosphor-icons/vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 },
    parsedCursusLink: { type: Object, default: () => ({}) },
    currentMathConfigForAnalysis: { type: Object, default: null }
})

const emit = defineEmits(['revealNext', 'selectAnswer', 'checkAnswer', 'copyLink', 'showConfetti'])

const interactivePoint = ref(null)

watch(() => props.revealedSteps, () => {
    interactivePoint.value = null
})

watch(() => props.slide, () => {
    interactivePoint.value = null
})

function handleGraphClick({ x, y }) {
    if (!props.currentMathConfigForAnalysis) return
    
    // Snap x to nearest 0.1
    const snappedX = Math.round(x * 10) / 10
    let finalX = snappedX
    let finalY = y
    let label = `(${finalX.toFixed(1)}, ${finalY.toFixed(1)})`
    
    const config = props.currentMathConfigForAnalysis
    if (config.functions && config.functions.length > 0) {
        let nearestFn = null
        let minDistance = Infinity
        let bestY = y
        
        config.functions.forEach(f => {
            try {
                const fVal = f.fn(finalX)
                if (fVal !== null && !isNaN(fVal) && isFinite(fVal)) {
                    const dist = Math.abs(fVal - y)
                    if (dist < minDistance) {
                        minDistance = dist
                        nearestFn = f
                        bestY = fVal
                    }
                }
            } catch (e) {}
        })
        
        if (nearestFn) {
            finalY = Math.round(bestY * 10) / 10
            label = `(${finalX.toFixed(1)}, ${finalY.toFixed(1)})`
        }
    } else {
        finalX = Math.round(x * 2) / 2
        finalY = Math.round(y * 2) / 2
        label = `(${finalX.toFixed(1)}, ${finalY.toFixed(1)})`
    }
    
    interactivePoint.value = {
        id: 'interactive-point',
        x: finalX,
        y: finalY,
        color: '#ea580c', // Amber-600
        label: label
    }
}

const projections = computed(() => {
    if (!interactivePoint.value) return []
    const { x, y } = interactivePoint.value
    return [
        { x1: 0, y1: y, x2: x, y2: y, color: '#ea580c', dashed: true, width: 1.5 },
        { x1: x, y1: 0, x2: x, y2: y, color: '#ea580c', dashed: true, width: 1.5 }
    ]
})

const mergedConfig = computed(() => {
    const baseConfig = props.currentMathConfigForAnalysis
    if (!baseConfig) return null
    
    const configCopy = { ...baseConfig }
    configCopy.points = configCopy.points ? [...configCopy.points] : []
    configCopy.segments = configCopy.segments ? [...configCopy.segments] : []
    
    if (interactivePoint.value) {
        configCopy.points.push(interactivePoint.value)
    }
    if (projections.value.length > 0) {
        configCopy.segments.push(...projections.value)
    }
    
    return configCopy
})
</script>

<template>
<MathSlideWrapper :title="slide.title" badge="GRAFIEK">
    
    <div class="flex-1 flex gap-8 mt-4 pb-8 h-full min-h-[500px]">
        
        <!-- Graph Area -->
        <div class="w-[55%] relative h-[calc(100vh-280px)]">
            <div class="relative h-full bg-white border border-slate-200 rounded-xl flex items-center justify-center p-4 overflow-hidden shadow-sm">
                <!-- Grid decoration -->
                <div class="absolute inset-0 pointer-events-none opacity-[0.01]" 
                     style="background-image: radial-gradient(#0f172a 2px, transparent 2px); background-size: 24px 24px;">
                </div>
                
                <Transition name="fade-image" mode="out-in">
                   <MathGraphSvg :key="'graph-'+revealedSteps" v-if="mergedConfig" :config="mergedConfig" @graph-click="handleGraphClick" class="max-w-full max-h-full drop-shadow-sm transition-all duration-500 relative z-10" />
                </Transition>

                <!-- Interactive Coordinates Overlay Badge -->
                <div v-if="interactivePoint" class="absolute bottom-6 left-6 bg-slate-900/90 text-white border border-slate-700 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-[fadeInUp_0.2s_ease-out] z-20">
                    <div class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></div>
                    <div class="text-[1.3rem] font-bold tracking-wide">
                        Geselecteerd: <span class="text-amber-400 font-mono text-[1.4rem] ml-1">{{ interactivePoint.x.toFixed(1) }} ↦ {{ interactivePoint.y.toFixed(1) }}</span>
                    </div>
                    <button @click.stop="interactivePoint = null" class="ml-2 text-white/40 hover:text-white text-[1.1rem] hover:bg-white/10 w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                        ✕
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Steps Area -->
        <div class="w-[45%] flex flex-col gap-6 h-[calc(100vh-280px)]">
            <div class="flex-1 overflow-y-auto pr-2 exercise-scroll">
                <div class="space-y-4">
                    <div v-for="(step, idx) in slide.steps" :key="idx" 
                        class="relative transition-all duration-300"
                        :class="idx < revealedSteps ? 'opacity-50 grayscale-[0.5] scale-[0.98]' : (idx === revealedSteps ? 'opacity-100 scale-100' : 'opacity-0 translate-y-8 absolute pointer-events-none')">
                        
                        <div class="relative rounded-xl border p-6 bg-white transition-all duration-300 overflow-hidden shadow-sm"
                             :class="idx === revealedSteps ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200 bg-white'">
                            
                            <div class="flex items-start gap-4 mb-3">
                                <!-- Clean Navy/Amber indicators -->
                                <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm font-bold text-[1.4rem]"
                                     :class="idx < revealedSteps ? 'bg-slate-900 text-white border border-slate-950' : 'bg-amber-500 text-slate-900 border border-amber-400'">
                                    <PhCheck v-if="idx < revealedSteps" weight="bold" class="text-[1.4rem]" />
                                    <span v-else>{{ idx + 1 }}</span>
                                </div>
                                <h4 class="text-[1.7rem] font-bold text-slate-800 mt-1.5" v-html="step.title"></h4>
                            </div>
                            <div class="text-[1.5rem] leading-relaxed text-slate-650 pl-14" v-html="step.description"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Table Box -->
            <div v-if="slide.steps[revealedSteps]?.table && slide.tableColumns" class="shrink-0 animate-[fadeInUp_0.3s_ease-out]">
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
                    <h3 v-if="slide.tableTitle" class="text-[1.2rem] font-bold text-slate-800 uppercase tracking-widest mb-4 shrink-0" v-html="slide.tableTitle"></h3>
                    
                    <div class="rounded-lg border border-slate-200 overflow-hidden bg-white">
                        <table class="w-full text-[1.45rem] text-left">
                            <thead class="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th v-for="col in slide.tableColumns" :key="col.key" class="px-5 py-3 font-bold text-slate-700 border-r border-slate-200 last:border-r-0 uppercase tracking-wide text-[1.1rem]" v-html="col.label"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="(row, i) in slide.steps[revealedSteps].table" :key="i" 
                                    class="transition-colors hover:bg-slate-50/50" 
                                    :class="{'bg-amber-50/40': row.highlight}">
                                    <td v-for="col in slide.tableColumns" :key="col.key" class="px-5 py-3 border-r border-slate-100 last:border-r-0" :class="row.highlight ? 'text-amber-800 font-bold' : 'text-slate-700'" v-html="row[col.key]"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Completed Banner -->
            <div v-if="revealedSteps >= slide.steps.length" class="mt-4 p-5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-3 animate-[fadeInUp_0.4s_ease-out] shadow-sm">
                <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center shadow-inner">
                    <PhCheckCircle weight="fill" class="text-[1.6rem]" />
                </div>
                <span class="text-[1.5rem] font-bold text-amber-900 tracking-wide uppercase">Oefening voltooid</span>
            </div>
        </div>
    </div>
</MathSlideWrapper>
</template>

<style scoped>
table, th, td {
  font-family: 'Open Sans', sans-serif;
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
