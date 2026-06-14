<script setup>
import { ref, computed } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { PhX, PhCheckCircle, PhWarning, PhSmiley, PhSmileyMeh, PhSmileySad, PhPaperPlaneRight, PhCaretRight, PhArrowRight } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  questions: {
    type: Array,
    required: true
  },
  goals: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'complete'])

// STATE
const currentStepIndex = ref(0)
const answers = ref({})
const selectedMood = ref(null)

// QUIZ DATA - Nu gecombineerd van props + standaard mood/finish stappen
const parts = computed(() => {
    // Combineer de meegegeven vragen met standaard mood en finish stappen
    const questionParts = props.questions.map((q, index) => ({
        id: q.id || `q${index}`,
        type: q.type || 'mc',
        question: q.question,
        description: q.description,
        options: q.options,
        correct: q.correct
    }))
    
    // Voeg mood en finish stappen toe
    return [
        ...questionParts,
        {
            id: 'mood',
            type: 'mood',
            question: 'Hoe ging het vandaag?'
        },
        {
            id: 'finish',
            type: 'finish'
        }
    ]
})

const currentPart = computed(() => parts.value[currentStepIndex.value])
const progress = computed(() => ((currentStepIndex.value) / (parts.value.length - 1)) * 100)

const canProceed = computed(() => {
    const p = currentPart.value
    if (p.type === 'mc') return answers.value[p.id] !== undefined
    if (p.type === 'open') return (answers.value[p.id] || '').trim().length > 10 // Min length
    if (p.type === 'mood') return selectedMood.value !== null
    return true
})

// ACTIONS
function nextStep() {
    if (currentStepIndex.value < parts.value.length - 1) {
        currentStepIndex.value++
    } else {
        close()
    }
}

function selectOption(idx) {
    answers.value[currentPart.value.id] = idx
    // Optional: Auto advance for MC (maybe with small delay)
    // setTimeout(nextStep, 300) 
}

function submit() {
    emit('complete')
    nextStep()
}

function close() {
    emit('close')
    // Reset state after a delay or immediately if you prefer
    setTimeout(() => {
        currentStepIndex.value = 0
        answers.value = {}
        selectedMood.value = null
    }, 500)
}

const mcScore = computed(() => {
    let correct = 0
    let total = 0
    parts.value.forEach(p => {
        if (p.type === 'mc') {
            total++
            if (answers.value[p.id] === p.correct) {
                correct++
            }
        }
    })
    return { correct, total }
})

function getMoodLabel(mood) {
    if (mood === 'happy') return 'Zeker'
    if (mood === 'meh') return 'Twijfel'
    if (mood === 'sad') return 'Onzeker'
    return ''
}

const actualQuestionNumber = computed(() => {
  // Tel hoeveel MC of OPEN vragen we al gepasseerd zijn
  let count = 0
  for (let i = 0; i <= currentStepIndex.value; i++) {
    if (parts.value[i].type === 'mc' || parts.value[i].type === 'open') {
      count++
    }
  }
  return count
})

const totalQuestions = computed(() => {
  return parts.value.filter(p => p.type === 'mc' || p.type === 'open').length
})

function renderMath(text) {
  if (!text) return ''
  return String(text).replace(/\\\((.+?)\\\)/gs, (_, formula) => {
    try {
      return katex.renderToString(formula.trim(), { throwOnError: false, displayMode: false })
    } catch {
      return text
    }
  })
}
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop open" @click="close">
    <div class="modal-content max-w-xl w-full" @click.stop>
        
        <!-- Header with Progress -->
        <div class="bg-white px-6 py-4 rounded-t-2xl border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                    <PhPaperPlaneRight weight="fill" class="text-xl"/>
                </div>
                <div>
                   <h3 class="text-base font-bold text-slate-900">Exit Ticket</h3>
                   <div class="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span v-if="currentPart.type === 'mc' || currentPart.type === 'open'">Vraag {{ actualQuestionNumber }} van {{ totalQuestions }}</span>
                      <span v-else>{{ currentPart.type === 'mood' ? 'Reflectie' : 'Resultaat' }}</span>
                   </div>
                </div>
            </div>
            <button @click="close" class="text-slate-400 hover:text-slate-700 p-2 hover:bg-slate-50 rounded-full transition-colors">
                <PhX weight="bold" />
            </button>
        </div>

        <!-- Progress Bar -->
        <div class="h-1 bg-slate-100 w-full" v-if="currentPart.type !== 'finish'">
            <div class="h-full bg-indigo-500 transition-all duration-500 ease-out" :style="{ width: progress + '%' }"></div>
        </div>

        <!-- Body -->
        <div class="p-8 flex-1 flex flex-col overflow-y-auto">
            
                <!-- TRANSITION WRAPPER -->
            <Transition name="fade-slide" mode="out-in">

                <!-- MULTIPLE CHOICE -->
                <div v-if="currentPart.type === 'mc'" :key="'mc-'+currentPart.id" class="flex-1 flex flex-col">
                    <h4 class="text-xl font-bold text-slate-900 mb-6" v-html="renderMath(currentPart.question)"></h4>
                    
                    <div class="space-y-3">
                        <button 
                            v-for="(opt, idx) in currentPart.options" 
                            :key="idx"
                            @click="selectOption(idx)"
                            class="w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group"
                            :class="answers[currentPart.id] === idx ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600'"
                        >
                            <span class="font-medium text-sm" v-html="renderMath(opt)"></span>
                            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                 :class="answers[currentPart.id] === idx ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-indigo-300'">
                                <div v-if="answers[currentPart.id] === idx" class="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- OPEN QUESTION -->
                <div v-else-if="currentPart.type === 'open'" :key="'open-'+currentPart.id" class="flex-1 flex flex-col">
                    <h4 class="text-xl font-bold text-slate-900 mb-2" v-html="renderMath(currentPart.question)"></h4>
                    <p class="text-slate-500 text-sm mb-6" v-html="renderMath(currentPart.description)"></p>
                    
                    <textarea 
                        v-model="answers[currentPart.id]" 
                        class="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none text-slate-700 placeholder-slate-400 font-medium"
                        placeholder="Typ je antwoord hier..."
                    ></textarea>
                </div>

                <!-- MOOD SELECTOR -->
                <div v-else-if="currentPart.type === 'mood'" :key="'mood-'+currentPart.id" class="flex-1 flex flex-col justify-center text-center">
                    <h4 class="text-xl font-bold text-slate-900 mb-8">{{ currentPart.question }}</h4>
                    
                    <div class="flex justify-center gap-4">
                        <button @click="selectedMood = 'happy'" class="group relative w-24 h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2" 
                            :class="selectedMood === 'happy' ? 'border-emerald-500 bg-emerald-50 text-emerald-600 scale-110 shadow-lg' : 'border-slate-100 text-slate-300 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-400'">
                            <PhSmiley weight="fill" class="text-5xl transition-transform group-hover:scale-110"/>
                            <span class="text-xs font-bold absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600">Zeker</span>
                        </button>

                        <button @click="selectedMood = 'meh'" class="group relative w-24 h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2"
                            :class="selectedMood === 'meh' ? 'border-amber-400 bg-amber-50 text-amber-500 scale-110 shadow-lg' : 'border-slate-100 text-slate-300 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-400'">
                            <PhSmileyMeh weight="fill" class="text-5xl transition-transform group-hover:scale-110"/>
                            <span class="text-xs font-bold absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500">Twijfel</span>
                        </button>

                        <button @click="selectedMood = 'sad'" class="group relative w-24 h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2"
                            :class="selectedMood === 'sad' ? 'border-rose-400 bg-rose-50 text-rose-500 scale-110 shadow-lg' : 'border-slate-100 text-slate-300 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-400'">
                            <PhSmileySad weight="fill" class="text-5xl transition-transform group-hover:scale-110"/>
                            <span class="text-xs font-bold absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500">Onzeker</span>
                        </button>
                    </div>
                </div>

                <!-- FINISH -->
                <div v-else-if="currentPart.type === 'finish'" :key="'finish-'+currentPart.id" class="flex-1 flex flex-col items-center text-center">
                    <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 animate-[bounce_0.6s_ease-out]">
                        <PhCheckCircle weight="fill" class="text-3xl"/>
                    </div>
                    <h4 class="text-2xl font-bold text-slate-900 mb-2">Les Afgerond!</h4>
                    
                    <!-- Result Summary Box -->
                    <div class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 mt-4 space-y-6">
                        <!-- Score Display -->
                        <div class="flex justify-center items-center gap-6">
                            <div class="text-left">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Jouw Score</p>
                                <p class="text-3xl font-black text-slate-900">{{ mcScore.correct }} <span class="text-slate-300">/</span> {{ mcScore.total }}</p>
                            </div>
                            <div class="w-px h-10 bg-slate-200"></div>
                            <div class="text-left">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Gevoel</p>
                                <p class="text-lg font-bold text-slate-700">{{ getMoodLabel(selectedMood) }}</p>
                            </div>
                        </div>

                        <!-- Competency Check -->
                        <div class="space-y-3 pt-4 border-t border-slate-200" v-if="goals && goals.length > 0">
                            <p class="text-xs font-bold text-slate-500 uppercase">Ik kan nu...</p>
                            <div class="grid grid-cols-1 gap-2 text-left">
                                <div v-for="(goal, idx) in goals" :key="idx" class="flex items-center gap-3 text-sm text-slate-600">
                                    <!-- Use a standard check style for goals. A future version could have actual checkboxes or link this to performance -->
                                    <PhCheckCircle weight="fill" class="text-emerald-500 shrink-0"/>
                                    <span v-html="renderMath(goal)"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </Transition>

            <!-- FOOTER ACTIONS -->
            <div class="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center" v-if="currentPart.type !== 'finish'">
                <div class="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {{ currentPart.type === 'mc' ? 'Meerkeuze' : currentPart.type === 'open' ? 'Reflectie' : 'Gevoel' }}
                </div>
                
                <button 
                    v-if="currentPart.type !== 'mood'"
                    @click="nextStep" 
                    :disabled="!canProceed"
                    class="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-lg shadow-lg shadow-slate-200 hover:shadow-indigo-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center gap-2 group"
                >
                    Volgende <PhArrowRight weight="bold" class="group-hover:translate-x-1 transition-transform"/>
                </button>
                <button 
                    v-else
                    @click="submit"
                    :disabled="!canProceed"
                    class="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                    Afronden <PhPaperPlaneRight weight="bold"/>
                </button>
            </div>

            <!-- Finish Close Button causes a different layout, handled here -->
            <div v-else class="mt-8 flex justify-center">
                 <button @click="close" class="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                    Sluiten
                </button>
            </div>

        </div>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
