<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhXCircle, PhTextAa, PhLightbulb, PhTrophy, PhArrowClockwise, PhInfo, PhListBullets } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Vul de Lege Plekken In'
  },
  instruction: {
    type: String,
    default: 'Typ het juiste woord of getal'
  },
  questions: {
    type: Array,
    default: () => []
  },
  fullscreen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'complete'])

// STATE
const currentIndex = ref(0)
const userInput = ref('')
const feedback = ref(null) // 'correct' | 'incorrect' | null
const showHint = ref(false)
const results = ref([]) 
const isComplete = ref(false)

const questionState = ref(0) // 0: base, 1: extension
const extensionAnswers = ref([])
const extensionFeedback = ref(null)

const currentQuestion = computed(() => props.questions[currentIndex.value] || {})

const progressPercent = computed(() => {
  return Math.round((currentIndex.value / props.questions.length) * 100)
})

const correctCount = computed(() => {
  return results.value.filter(r => r.correct).length
})

// Persistence Key
const STORAGE_KEY = computed(() => `fill-blanks-progress-${props.title.replace(/\s+/g, '-').toLowerCase()}`)

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY.value)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      currentIndex.value = data.currentIndex || 0
      results.value = data.results || []
      isComplete.value = data.isComplete || false
      // If we are in the middle of a question, reset its local temp state
      resetQuestion()
    } catch(e) {
      resetActivity()
    }
  } else {
    resetActivity()
  }
})

// Watch for changes to save progress
watch([currentIndex, results, isComplete], () => {
    const data = {
        currentIndex: currentIndex.value,
        results: results.value,
        isComplete: isComplete.value
    }
    localStorage.setItem(STORAGE_KEY.value, JSON.stringify(data))
}, { deep: true })

function resetActivity() {
  currentIndex.value = 0
  resetQuestion()
  results.value = []
  isComplete.value = false
  localStorage.removeItem(STORAGE_KEY.value)
}

function resetQuestion() {
  userInput.value = ''
  feedback.value = null
  showHint.value = false
  questionState.value = 0
  extensionAnswers.value = []
  extensionFeedback.value = null
}

function resolveImageUrl(url) {
    if (!url) return ''
    if (url.startsWith('http') || url.startsWith('data:')) return url
    const baseUrl = import.meta.env.BASE_URL || '/'
    let normalizedUrl = url
    if (normalizedUrl.startsWith('./')) normalizedUrl = normalizedUrl.substring(2)
    if (normalizedUrl.startsWith('/')) normalizedUrl = normalizedUrl.substring(1)
    return baseUrl.endsWith('/') ? baseUrl + normalizedUrl : baseUrl + '/' + normalizedUrl
}

function checkAnswer() {
  if (feedback.value === 'correct') return
  const userAnswer = userInput.value.trim().toLowerCase()
  const correctAnswer = currentQuestion.value.answer.toLowerCase()
  
  if (userAnswer === correctAnswer || (currentQuestion.value.altAnswers && currentQuestion.value.altAnswers.some(a => a.toLowerCase() === userAnswer))) {
    feedback.value = 'correct'
    if (currentQuestion.value.extension) {
      setTimeout(() => {
          questionState.value = 1
          extensionAnswers.value = currentQuestion.value.extension.filter(e => e.type === 'select').map(() => '')
      }, 500)
    } else {
      results.value.push({ correct: true, answer: currentQuestion.value.answer })
      setTimeout(nextQuestion, 1500)
    }
  } else {
    feedback.value = 'incorrect'
    setTimeout(() => {
      feedback.value = null
      userInput.value = ''
    }, 1500)
  }
}

function checkExtension() {
  const selects = currentQuestion.value.extension.filter(e => e.type === 'select')
  const allCorrect = selects.every((s, i) => s.correct === extensionAnswers.value[i])
  
  if (allCorrect) {
    extensionFeedback.value = 'correct'
    results.value.push({ correct: true, answer: currentQuestion.value.answer })
    setTimeout(nextQuestion, 1500)
  } else {
    extensionFeedback.value = 'incorrect'
    setTimeout(() => {
      extensionFeedback.value = null
    }, 1500)
  }
}

function nextQuestion() {
  if (currentIndex.value < props.questions.length - 1) {
    currentIndex.value++
    resetQuestion()
  } else {
    isComplete.value = true
    // Do NOT automatically emit complete here to avoid closing the modal
  }
}

function handleFinalClose() {
    if (isComplete.value && correctCount.value === props.questions.length) {
        emit('complete') // This marks as done AND closes
    } else {
        emit('close')
    }
}

function close() {
  emit('close')
}

// FULLSCREEN & PULSE
const shouldPulse = ref(false)

watch(() => props.isOpen, (val) => {
    if (!val) {
        if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
        window.removeEventListener('keydown', handleKeydown)
        shouldPulse.value = false
    } else {
        window.addEventListener('keydown', handleKeydown)
        
        nextTick(() => {
            shouldPulse.value = true
            setTimeout(() => { shouldPulse.value = false }, 3000)
        })

        if (props.fullscreen) {
            nextTick(() => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(e => {})
                }
            })
        }
    }
}, { immediate: true })

function handleKeydown(e) {
    if (e.key === 'Escape' && props.isOpen) {
        emit('close')
    }
}

const handleFullscreenChange = () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
        emit('close')
    }
}

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => {})
    }
})

// Add listener in onMounted
const originalOnMounted = onMounted
onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    // original onMounted logic...
    const saved = localStorage.getItem(STORAGE_KEY.value)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        currentIndex.value = data.currentIndex || 0
        results.value = data.results || []
        isComplete.value = data.isComplete || false
        resetQuestion()
      } catch(e) {
        resetActivity()
      }
    } else {
      resetActivity()
    }
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-0">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="close"></div>
    <div class="relative bg-slate-100 shadow-2xl overflow-hidden flex flex-col w-screen h-screen rounded-none"
         @click.stop>
      
      <!-- Header -->
      <div class="bg-indigo-600 px-6 py-5 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3">
          <div class="bg-white/20 p-2 rounded-lg text-white">
            <PhTextAa weight="bold" class="text-xl"/>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white m-0">{{ title }}</h3>
            <p class="text-xs text-white/70 m-0">Diagram Analyse</p>
          </div>
        </div>
        <button @click="close" 
                class="text-white/70 hover:text-white p-2 rounded-full transition-all relative"
                :class="{ 'ring-pulse-white': shouldPulse }">
          <PhX class="text-2xl" />
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="h-1 bg-slate-200 shrink-0">
        <div 
          class="h-full bg-emerald-500 transition-all duration-500 ease-out" 
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>

      <!-- Body -->
      <div class="p-8 overflow-hidden flex flex-col flex-1 bg-slate-100">
        
        <p class="text-slate-500 text-center font-bold mb-6 uppercase tracking-wider text-sm">{{ instruction }}</p>

        <!-- Main Content Area -->
        <div class="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
          
          <!-- Image Section (Left) - Persistent during summary -->
          <div class="w-full lg:w-1/2 flex items-center justify-center bg-white rounded-3xl border-4 border-slate-300 p-6 shadow-inner relative overflow-hidden h-full">
            <img :src="resolveImageUrl(questions[0]?.image)" class="max-h-full max-w-full object-contain" alt="Vraag afbeelding" />
          </div>

          <!-- Right Section: Question or Summary -->
          <div class="flex-1 flex flex-col h-full overflow-y-auto pr-4 pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            
            <!-- SUMMARY STATE -->
            <div v-if="isComplete" class="space-y-6">
                <div class="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <PhTrophy weight="fill" class="text-4xl text-white"/>
                    </div>
                    <div>
                        <h4 class="text-2xl font-black m-0 leading-tight">Analyse Voltooid!</h4>
                        <p class="text-white/80 m-0 font-medium">Overzicht van de krachten op de doos:</p>
                    </div>
                </div>

                <div class="grid gap-4">
                    <div v-for="(q, idx) in questions" :key="idx" 
                         class="bg-white p-6 rounded-2xl border-l-8 shadow-sm flex flex-col gap-2 translate-x-0 transition-transform hover:translate-x-2"
                         :class="idx === 3 ? 'border-amber-400 opacity-80' : 'border-emerald-500'">
                        
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-black uppercase tracking-widest" :class="idx === 3 ? 'text-amber-600' : 'text-emerald-600'">
                                {{ idx === 3 ? 'Bonus Recap' : 'Kracht #' + (idx + 1) }}
                            </span>
                            <span class="font-mono font-bold text-slate-400">0{{ idx + 1 }}</span>
                        </div>

                        <div class="text-2xl font-black text-slate-800 flex items-center gap-3">
                            {{ q.answer }} <span class="text-slate-300 text-base font-medium">({{ q.altAnswers[0] }})</span>
                        </div>

                        <p v-if="q.extension" class="text-lg text-slate-600 leading-snug bg-slate-50 p-3 rounded-lg flex flex-wrap gap-x-1 items-center border border-slate-100">
                            <PhInfo weight="bold" class="text-indigo-500 mr-2 shrink-0"/>
                            <template v-for="(ext, eIdx) in q.extension" :key="eIdx">
                                <span v-if="ext.type === 'text'">{{ ext.value }}</span>
                                <span v-else-if="ext.type === 'auto'" class="font-bold text-emerald-600">{{ q.answer }}</span>
                                <span v-else-if="ext.type === 'select'" class="font-bold text-indigo-600 underline decoration-indigo-200">{{ ext.correct }}</span>
                            </template>
                        </p>
                        <p v-else class="text-lg text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {{ q.sentence.split('___').join(q.answer) }}
                        </p>
                    </div>
                </div>

                <div class="flex justify-between items-center bg-slate-200/50 p-6 rounded-2xl mt-8">
                     <button @click="resetActivity" class="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold flex items-center gap-2 transition-colors">
                        <PhArrowClockwise weight="bold" /> Opnieuw
                     </button>
                     <button @click="handleFinalClose" class="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-lg shadow-lg hover:shadow-indigo-200 transition-all">
                        Sluiten
                     </button>
                </div>
            </div>

            <!-- QUESTION STATE -->
            <div v-else class="h-full flex flex-col">
                <div class="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">
                  Opgave {{ currentIndex + 1 }} / {{ questions.length }}
                </div>

                <!-- Part 1: Base Question -->
                <div class="bg-white rounded-2xl p-6 border-2 shadow-sm transition-all" 
                     :class="feedback === 'correct' ? 'border-emerald-200 bg-emerald-50/30' : 'border-white shadow-md'">
                   
                   <div class="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
                      <template v-for="(part, i) in currentQuestion.sentence.split('___')" :key="i">
                        <span v-html="part"></span>
                        <span v-if="i < currentQuestion.sentence.split('___').length - 1" 
                              class="inline-block min-w-[120px] mx-1 border-b-4 border-dashed border-indigo-400 text-indigo-700 text-center px-4"
                              :class="{'text-emerald-700 border-emerald-500 border-solid bg-emerald-100 rounded-t-lg': feedback === 'correct'}">
                          {{ feedback === 'correct' ? currentQuestion.answer : (userInput || '...') }}
                        </span>
                      </template>
                   </div>

                   <!-- Input Field -->
                   <div class="relative mb-4" v-if="feedback !== 'correct'">
                     <input 
                       v-model="userInput"
                       @keydown.enter="checkAnswer"
                       :disabled="feedback === 'incorrect'"
                       type="text"
                       class="w-full px-5 py-3 text-lg bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400"
                       :class="{'border-red-400 bg-red-50 text-red-700': feedback === 'incorrect'}"
                       placeholder="Typ je antwoord..."
                       autocomplete="off"
                       autocapitalize="off"
                     >
                     <div v-if="feedback === 'incorrect'" class="absolute right-4 top-1/2 -translate-y-1/2">
                       <PhXCircle weight="fill" class="text-2xl text-red-500"/>
                     </div>
                   </div>

                   <div class="flex items-center justify-between" v-if="feedback !== 'correct'">
                     <button v-if="currentQuestion.hint && !showHint" @click="showHint = true" class="text-xs font-bold text-amber-500 flex items-center gap-1">
                       <PhLightbulb weight="fill" /> Hint nodig?
                     </button>
                     <p v-if="showHint" class="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mr-4 border border-amber-100">
                        {{ currentQuestion.hint }}
                     </p>
                     <button @click="checkAnswer" :disabled="!userInput.trim() || feedback === 'incorrect'" class="ml-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-black rounded-xl transition-all shadow-sm">
                       Verstuur
                     </button>
                   </div>
                </div>

                <!-- Part 2: Extension Question -->
                <div v-if="questionState === 1" class="mt-6 bg-white rounded-2xl p-6 border-b-8 border-emerald-500 shadow-xl animate-in slide-in-from-top-4 duration-500">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="bg-emerald-500 text-white p-1.5 rounded-lg shadow-sm">
                            <PhLightbulb weight="bold" class="text-lg" />
                        </div>
                        <h4 class="text-sm font-black text-emerald-600 uppercase tracking-widest">Dieper Inzicht</h4>
                    </div>
                    
                    <div class="text-xl font-bold text-slate-800 mb-6 leading-relaxed flex flex-wrap items-center gap-y-2">
                        <template v-for="(ext, idx) in currentQuestion.extension" :key="idx">
                            <span v-if="ext.type === 'text'">{{ ext.value }}</span>
                            <span v-else-if="ext.type === 'auto'" class="font-black text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-200 mx-1">
                                {{ currentQuestion.answer }}
                            </span>
                            <div v-else-if="ext.type === 'select'" class="inline-block relative">
                                <select v-model="extensionAnswers[currentQuestion.extension.filter(e => e.type === 'select').indexOf(ext)]"
                                        :disabled="extensionFeedback === 'correct'"
                                        class="mx-1 px-3 py-1 bg-white border-2 border-slate-200 rounded-lg outline-none font-black text-indigo-600 text-lg cursor-pointer hover:border-indigo-400 focus:border-indigo-600 transition-colors appearance-none pr-8 min-w-[100px]"
                                        :class="{'border-emerald-400 bg-emerald-50 !text-emerald-600': extensionFeedback === 'correct', 'border-red-400 bg-red-50 !text-red-600': extensionFeedback === 'incorrect'}">
                                    <option disabled value="">...</option>
                                    <option v-for="opt in ext.options" :key="opt" :value="opt">{{ opt }}</option>
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-2 flex items-center px-1 text-slate-400">
                                    <svg class="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </template>
                    </div>

                    <div class="flex justify-end mt-4" v-if="extensionFeedback !== 'correct'">
                        <button @click="checkExtension" 
                                :disabled="extensionAnswers.includes('')" 
                                class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-black rounded-xl transition-all shadow-md">
                            Bevestig
                        </button>
                    </div>
                </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop.open {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-in {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}
.slide-in-from-top-4 {
  animation-name: slideInTop;
}
@keyframes slideInTop {
  from { transform: translateY(-1rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes zoomIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.ring-pulse-white {
    animation: ring-pulse-white 0.8s cubic-bezier(0.24, 1, 0.32, 1) 3;
    z-index: 50;
}

@keyframes ring-pulse-white {
    0% {
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 1);
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(1);
    }
    50% {
        box-shadow: 0 0 0 20px rgba(255, 255, 255, 0.8);
        background-color: rgba(255, 255, 255, 0.6);
        transform: scale(1.1);
    }
    100% {
        box-shadow: 0 0 0 40px rgba(255, 255, 255, 0);
        background-color: transparent;
        transform: scale(1);
    }
}
</style>
