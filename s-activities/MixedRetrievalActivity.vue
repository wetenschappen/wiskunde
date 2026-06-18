<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhBrain, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTrophy, PhArrowClockwise, PhLightbulb, PhCards } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Kennis-Check' },
  questions: {
    type: Array,
    default: () => [
      { q: "Wat is de discriminant van ax² + bx + c = 0?", a: ["b² - 4ac", "b² + 4ac", "√(b² - 4ac)"], c: 0 },
      { q: "Bij welke D-waarde zijn er twee verschillende reële wortels?", a: ["D < 0", "D = 0", "D > 0"], c: 2 },
      { q: "Wat is de rico van de rechte door (0,0) en (2,4)?", a: ["1/2", "2", "4"], c: 1 }
    ]
  },
  fullscreen: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'complete'])

const currentIndex = ref(0)
const selectedOption = ref(null)
const isChecked = ref(false)
const isCorrect = ref(false)
const isComplete = ref(false)
const score = ref(0)

const currentQuestion = computed(() => props.questions[currentIndex.value])

function selectOption(idx) {
  if (isChecked.value) return
  selectedOption.value = idx
}

function checkAnswer() {
  if (selectedOption.value === null) return
  isChecked.value = true
  isCorrect.value = selectedOption.value === currentQuestion.value.c
  if (isCorrect.value) score.value++
}

function nextQuestion() {
  if (currentIndex.value < props.questions.length - 1) {
    currentIndex.value++
    selectedOption.value = null
    isChecked.value = false
    isCorrect.value = false
  } else {
    isComplete.value = true
    emit('complete')
  }
}

function resetActivity() {
  currentIndex.value = 0
  selectedOption.value = null
  isChecked.value = false
  isCorrect.value = false
  isComplete.value = false
  score.value = 0
}

// FULLSCREEN & ESCAPE
watch(() => props.isOpen, (val) => {
  if (val) {
    resetActivity()
    if (props.fullscreen && !document.fullscreenElement) {
      nextTick(() => document.documentElement.requestFullscreen().catch(() => {}))
    }
  } else if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-0 font-sans">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="emit('close')"></div>
    <div class="relative bg-white shadow-2xl overflow-hidden flex flex-col w-screen h-screen rounded-none" @click.stop>
      
      <!-- Header -->
      <header class="bg-indigo-600 px-6 py-5 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3 text-white">
          <div class="bg-white/20 p-2 rounded-lg"><PhCards weight="fill" class="text-xl"/></div>
          <div>
            <h3 class="text-lg font-bold m-0">{{ title }}</h3>
            <p class="text-xs text-white/70 m-0">Consolidatie & Herhaling</p>
          </div>
        </div>
        <button @click="emit('close')" class="text-white/70 hover:text-white p-2 rounded-full transition-all">
          <PhX class="text-2xl" />
        </button>
      </header>

      <!-- Progress -->
      <div class="h-1 bg-slate-200 shrink-0">
        <div class="h-full bg-emerald-500 transition-all duration-500" 
             :style="{ width: ((currentIndex + (isComplete?1:0)) / questions.length * 100) + '%' }"></div>
      </div>

      <!-- Main -->
      <main class="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-slate-50">
        
        <div v-if="isComplete" class="text-center animate-in fade-in zoom-in duration-300">
          <div class="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <PhTrophy weight="fill" class="text-6xl text-amber-500"/>
          </div>
          <h2 class="text-3xl font-black text-slate-800 mb-2">Herhaling Voltooid!</h2>
          <p class="text-lg text-slate-500 mb-8">Je scoorde {{ score }} van de {{ questions.length }} punten.</p>
          <div class="flex gap-4 justify-center">
            <button @click="resetActivity" class="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-300 transition-all">
              <PhArrowClockwise weight="bold"/> Opnieuw
            </button>
            <button @click="emit('close')" class="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-500 transition-all">
              Sluiten
            </button>
          </div>
        </div>

        <div v-else class="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-xl border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
          <div class="flex items-center justify-between mb-8">
            <span class="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-full">Vraag {{ currentIndex + 1 }}</span>
            <div class="flex gap-1">
               <div v-for="n in questions.length" :key="n" class="w-2 h-2 rounded-full" 
                    :class="n-1 < currentIndex ? 'bg-emerald-500' : (n-1 === currentIndex ? 'bg-indigo-500 scale-125' : 'bg-slate-200')"></div>
            </div>
          </div>

          <h4 class="text-2xl font-bold text-slate-800 mb-8 leading-tight">{{ currentQuestion.q }}</h4>

          <div class="space-y-3">
            <button v-for="(opt, idx) in currentQuestion.a" :key="idx"
                    @click="selectOption(idx)"
                    :disabled="isChecked"
                    class="w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group"
                    :class="[
                        selectedOption === idx ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50',
                        isChecked && idx === currentQuestion.c ? '!border-emerald-500 !bg-emerald-50' : '',
                        isChecked && selectedOption === idx && idx !== currentQuestion.c ? '!border-red-500 !bg-red-50' : ''
                    ]">
              <span class="font-bold text-lg" :class="isChecked && idx === currentQuestion.c ? 'text-emerald-700' : (isChecked && selectedOption === idx ? 'text-red-700' : 'text-slate-700')">
                {{ opt }}
              </span>
              <div v-if="isChecked">
                <PhCheckCircle v-if="idx === currentQuestion.c" weight="fill" class="text-2xl text-emerald-500"/>
                <PhXCircle v-else-if="selectedOption === idx" weight="fill" class="text-2xl text-red-500"/>
              </div>
            </button>
          </div>

          <div class="mt-10 flex gap-4">
            <button v-if="!isChecked" @click="checkAnswer" :disabled="selectedOption === null"
                    class="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-lg hover:bg-slate-800 disabled:opacity-30 transition-all active:scale-95">
              Controleer Antwoord
            </button>
            <button v-else @click="nextQuestion"
                    class="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
              {{ currentIndex < questions.length - 1 ? 'Volgende Vraag' : 'Bekijk Resultaat' }}
              <PhArrowRight weight="bold" />
            </button>
          </div>
        </div>

      </main>

      <!-- Footer Info -->
      <footer class="bg-white border-t border-slate-100 p-4 text-center">
        <p class="text-slate-400 text-xs font-medium flex items-center justify-center gap-1">
          <PhLightbulb weight="fill" class="text-amber-400"/>
          Tip: Denk rustig na voor je een optie selecteert.
        </p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.animate-in { animation-duration: 0.5s; animation-fill-mode: both; }
.fade-in { animation-name: fadeIn; }
.zoom-in { animation-name: zoomIn; }
.slide-in-from-bottom-4 { animation-name: slideInBottom; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes slideInBottom { from { opacity: 0; transform: translateY(1rem); } to { opacity: 1; transform: translateY(0); } }
</style>
