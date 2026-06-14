<script setup>
import { ref } from 'vue'
import MathSlideWrapper from './shared/MathSlideWrapper.vue'

const props = defineProps({
  slide: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['answer'])

const selectedAnswer = ref(null)

const handleAnswer = (index) => {
  if (selectedAnswer.value !== null) return;
  selectedAnswer.value = index;
  emit('answer', {
    selectedIndex: index,
    isCorrect: props.slide.options[index].correct
  });
}
</script>

<template>
<MathSlideWrapper :title="slide.title || 'QUIZ'" badge="OEFENING">
    
    <div class="flex flex-col items-center mt-4">
        <!-- Question Box (No Gradients) -->
        <div class="w-full max-w-4xl bg-white border border-slate-200 p-8 rounded-xl shadow-sm text-center mb-8">
            <div class="text-[2.1rem] text-slate-800 font-bold leading-relaxed" v-html="slide.question"></div>
        </div>
        
        <!-- Options Grid -->
        <div class="grid grid-cols-2 gap-6 w-full max-w-4xl">
            <button
                v-for="(option, index) in slide.options"
                :key="index"
                @click="handleAnswer(index)"
                :disabled="selectedAnswer !== null"
                class="text-left w-full cursor-pointer focus:outline-none"
            >
                <div class="flex items-center gap-5 bg-white border rounded-xl p-5 transition-all duration-300 shadow-sm"
                     :class="[
                       selectedAnswer === null ? 'border-slate-200 hover:border-amber-450 hover:bg-slate-50/50' : '',
                       selectedAnswer === index && option.correct ? 'border-emerald-300 bg-emerald-50/20 scale-[1.01]' : '',
                       selectedAnswer === index && !option.correct ? 'border-red-300 bg-red-50/20' : '',
                       selectedAnswer !== null && selectedAnswer !== index && option.correct ? 'border-emerald-250 bg-emerald-50/10' : '',
                       selectedAnswer !== null && selectedAnswer !== index && !option.correct ? 'border-slate-200 opacity-50 grayscale' : ''
                     ]">
                    
                    <!-- Label Badge -->
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[1.3rem] shrink-0 transition-colors shadow-sm"
                         :class="[
                            selectedAnswer === null ? 'bg-slate-100 text-slate-700' : '',
                            selectedAnswer === index && option.correct ? 'bg-emerald-600 text-white' : '',
                            selectedAnswer === index && !option.correct ? 'bg-red-500 text-white' : '',
                            selectedAnswer !== null && selectedAnswer !== index && option.correct ? 'bg-emerald-600/70 text-white' : '',
                            selectedAnswer !== null && selectedAnswer !== index && !option.correct ? 'bg-slate-100 text-slate-400' : ''
                         ]">
                        {{ option.label || String.fromCharCode(65 + index) }}
                    </div>
                    
                    <div class="text-[1.55rem] font-semibold text-slate-700 flex-1 leading-snug" v-html="option.text"></div>
                    
                    <!-- Status Icon -->
                    <div v-if="selectedAnswer !== null" class="w-8 h-8 flex items-center justify-center shrink-0">
                        <svg v-if="option.correct" class="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <svg v-else-if="selectedAnswer === index && !option.correct" class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </div>
                </div>
            </button>
        </div>
        
        <!-- Explanation Section (Amber Theme, No Left Border Strip) -->
        <div v-if="selectedAnswer !== null && slide.explanation" class="w-full max-w-4xl mt-8 animate-[fadeInUp_0.3s_ease-out]">
            <div class="p-8 bg-amber-50/20 border border-amber-200 rounded-xl">
                <h4 class="text-[1.1rem] font-bold uppercase tracking-wider text-amber-850 mb-2">Uitleg</h4>
                <div class="text-[1.6rem] text-slate-750 leading-relaxed font-semibold" v-html="slide.explanation"></div>
            </div>
        </div>
        
    </div>
</MathSlideWrapper>
</template>
