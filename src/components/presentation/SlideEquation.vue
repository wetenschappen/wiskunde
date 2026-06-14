<script setup>
import MathSlideWrapper from './shared/MathSlideWrapper.vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 },
    parsedCursusLink: { type: Object, default: () => ({}) },
    currentMathConfigForAnalysis: { type: Object, default: null }
})

const emit = defineEmits(['revealNext', 'selectAnswer', 'checkAnswer', 'copyLink', 'showConfetti'])

function getPartColors(color) {
    // Unify all variables under Navy/Amber palette for memory comfort
    if (color === 'orange' || color === 'amber' || color === 'violet') {
        return { border: 'border-amber-200 bg-amber-50/10', title: 'text-amber-800', dot: 'bg-amber-500' }
    }
    return { border: 'border-slate-200 bg-white', title: 'text-slate-800', dot: 'bg-slate-900' }
}
</script>

<template>
  <MathSlideWrapper :title="slide.title || 'Wiskundige Formule'" badge="FORMULE">
    <div class="flex flex-col gap-6 h-full">
      <!-- Equation Highlight Box -->
      <div v-if="slide.equation" class="bg-amber-50/20 border border-amber-200 rounded-xl p-10 text-center shadow-sm">
        <p class="text-[5rem] font-bold text-slate-800 tracking-wider font-math" v-html="slide.equation"></p>
      </div>
      
      <!-- Parts Explanation Grid -->
      <div v-if="slide.parts && slide.parts.length" 
           class="grid gap-6 flex-1" 
           :class="slide.parts.length > 2 ? 'grid-cols-3' : 'grid-cols-2'">
        <div v-for="(part, idx) in slide.parts" :key="idx" 
             class="border rounded-xl p-6 shadow-sm flex flex-col"
             :class="getPartColors(part.color).border">
          <h4 class="text-[1.8rem] font-bold mb-4" :class="getPartColors(part.color).title">
            {{ part.label }}
          </h4>
          <ul class="space-y-3 flex-1">
            <li v-for="item in part.items" :key="item" class="text-[1.4rem] text-slate-650 flex items-start gap-2.5">
              <span class="w-2 h-2 rounded-full mt-2.5 flex-shrink-0" :class="getPartColors(part.color).dot"></span>
              <span v-html="item"></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </MathSlideWrapper>
</template>
