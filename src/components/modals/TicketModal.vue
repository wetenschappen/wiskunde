<script setup>
import { ref, computed } from 'vue'
import { PhX, PhCheckCircle, PhXCircle, PhSmiley, PhSmileyMeh, PhSmileySad, PhPaperPlaneRight, PhClipboardText, PhArrowRight, PhWarning } from '@phosphor-icons/vue'
import MathGraphSvg from '../activities/MathGraphSvg.vue'

const props = defineProps({
  isOpen: Boolean,
  mode: {
    type: String,
    default: 'exit'
  },
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

const isEntry = computed(() => props.mode === 'entry')

const currentStepIndex = ref(0)
const answers = ref({})
const selectedMood = ref(null)

const parts = computed(() => {
    const questionParts = props.questions.map((q, index) => ({
        id: q.id || `q${index}`,
        type: q.type || 'mc',
        question: q.question,
        description: q.description,
        options: q.options,
        correct: q.correct,
        mathConfig: q.mathConfig,
        correctPoint: q.correctPoint,
        tolerance: q.tolerance
    }))
    
    if (isEntry.value) {
        return [
            ...questionParts,
            { id: 'finish', type: 'finish' }
        ]
    }
    return [
        ...questionParts,
        { id: 'mood', type: 'mood', question: 'Hoe ging het vandaag?' },
        { id: 'finish', type: 'finish' }
    ]
})

const currentPart = computed(() => parts.value[currentStepIndex.value])
const totalParts = computed(() => parts.value.length)
const progress = computed(() => ((currentStepIndex.value) / (totalParts.value - 1)) * 100)

const canProceed = computed(() => {
    const p = currentPart.value
    if (p.type === 'mc') return answers.value[p.id] !== undefined
    if (p.type === 'open') return (answers.value[p.id] || '').trim().length > 10
    if (p.type === 'graph-point') return answers.value[p.id] !== undefined
    if (p.type === 'mood') return selectedMood.value !== null
    return true
})

function nextStep() {
    if (currentStepIndex.value < totalParts.value - 1) {
        currentStepIndex.value++
    }
}

function selectOption(idx) {
    answers.value[currentPart.value.id] = idx
}

function submit() {
    emit('complete')
    currentStepIndex.value++
    if (currentStepIndex.value >= totalParts.value) {
        close()
    }
}

function close() {
    emit('close')
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
            if (answers.value[p.id] === p.correct) correct++
        } else if (p.type === 'graph-point') {
            total++
            const ans = answers.value[p.id]
            if (ans && p.correctPoint) {
                const dx = ans.x - p.correctPoint.x
                const dy = ans.y - p.correctPoint.y
                const dist = Math.sqrt(dx*dx + dy*dy)
                if (dist <= (p.tolerance || 0.5)) correct++
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

const questionResults = computed(() => {
    return parts.value
        .filter(p => ['mc', 'graph-point'].includes(p.type))
        .map(p => {
            let isCorrect = false
            if (p.type === 'mc') {
                isCorrect = answers.value[p.id] === p.correct
            } else if (p.type === 'graph-point' && p.correctPoint) {
                const ans = answers.value[p.id]
                if (ans) {
                    const dx = ans.x - p.correctPoint.x
                    const dy = ans.y - p.correctPoint.y
                    isCorrect = Math.sqrt(dx*dx + dy*dy) <= (p.tolerance || 0.5)
                }
            }
            return { id: p.id, question: p.question, isCorrect, answer: answers.value[p.id] }
        })
})

const scoredTotal = computed(() => questionResults.value.length)
const scoredCorrect = computed(() => questionResults.value.filter(r => r.isCorrect).length)

const actualQuestionNumber = computed(() => {
    let count = 0
    for (let i = 0; i <= currentStepIndex.value; i++) {
        if (['mc', 'open', 'graph-point'].includes(parts.value[i].type)) count++
    }
    return count
})

const totalQuestions = computed(() => {
    return parts.value.filter(p => ['mc', 'open', 'graph-point'].includes(p.type)).length
})

function selectGraphPoint(id, pt) {
    answers.value[id] = pt
}

function getGraphConfig(part) {
    const baseConfig = { ...part.mathConfig }
    const ans = answers.value[part.id]
    if (ans) {
        baseConfig.points = [
            ...(baseConfig.points || []),
            { id: 'user-ans', x: ans.x, y: ans.y, color: '#4f46e5', label: 'Jouw Antwoord' }
        ]
    }
    return baseConfig
}

const accentBorder   = computed(() => isEntry.value ? 'border-amber-500'   : 'border-indigo-600')
const accentBorderHover = computed(() => isEntry.value ? 'hover:border-amber-400' : 'hover:border-indigo-300')
const accentBgSelected = computed(() => isEntry.value ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-indigo-600 bg-indigo-50 text-indigo-900')
const accentBgHover  = computed(() => isEntry.value ? 'hover:border-amber-300 hover:bg-slate-50' : 'hover:border-indigo-300 hover:bg-slate-50')
const accentDot      = computed(() => isEntry.value ? 'border-amber-500 bg-amber-500' : 'border-indigo-600 bg-indigo-600')
const accentDotHover = computed(() => isEntry.value ? 'group-hover:border-amber-300' : 'group-hover:border-indigo-300')
const accentNavBtn   = computed(() => isEntry.value ? 'hover:bg-amber-500 hover:shadow-amber-200' : 'hover:bg-indigo-600 hover:shadow-indigo-200')
const accentSubmitBtn = computed(() => isEntry.value ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-200' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200')
// These are still used in the template header / progress bar
const title = computed(() => isEntry.value ? 'Toegangsticket' : 'Exit Ticket')
const accentBg = computed(() => isEntry.value ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600')
const progressBarColor = computed(() => isEntry.value ? 'bg-amber-500' : 'bg-indigo-500')
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
    
    <!-- Header -->
    <div class="flex-shrink-0 h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8" :class="isEntry ? 'bg-amber-50/50' : 'bg-indigo-50/30'">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg" :class="accentBg">
          <PhClipboardText v-if="isEntry" weight="fill" class="text-xl" />
          <PhPaperPlaneRight v-else weight="fill" class="text-xl" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900">{{ title }}</h3>
          <div class="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span v-if="['mc', 'open', 'graph-point'].includes(currentPart.type)">Vraag {{ actualQuestionNumber }} van {{ totalQuestions }}</span>
            <span v-else>{{ currentPart.type === 'mood' ? 'Reflectie' : 'Resultaat' }}</span>
          </div>
        </div>
      </div>
      <button @click="close" class="btn-close">
        <PhX weight="bold" class="text-xl" />
      </button>
    </div>

    <!-- Progress Bar -->
    <div class="flex-shrink-0 h-1 bg-slate-100 w-full" v-if="currentPart.type !== 'finish'">
      <div class="h-full transition-all duration-500 ease-out" :class="progressBarColor" :style="{ width: progress + '%' }"></div>
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto px-4 md:px-16 lg:px-32 py-8 flex flex-col">
      
      <Transition name="fade-slide" mode="out-in">

        <!-- MULTIPLE CHOICE -->
        <div v-if="currentPart.type === 'mc'" :key="'mc-'+currentPart.id" class="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          <h4 class="text-2xl md:text-3xl font-bold text-slate-900 mb-8" v-html="currentPart.question"></h4>
            <div class="space-y-4">
            <button 
              v-for="(opt, idx) in currentPart.options" 
              :key="idx"
              @click="selectOption(idx)"
              class="w-full text-left p-5 md:p-6 rounded-2xl border-2 transition-all flex items-center justify-between group text-slate-600"
              :class="answers[currentPart.id] === idx
                ? accentBgSelected
                : ['border-slate-200 text-slate-600', accentBgHover]"
            >
              <span class="text-base md:text-lg font-medium" v-html="opt"></span>
              <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4"
                   :class="answers[currentPart.id] === idx ? accentDot : ['border-slate-300', accentDotHover]">
                <div v-if="answers[currentPart.id] === idx" class="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </button>
          </div>
        </div>

        <!-- OPEN QUESTION -->
        <div v-else-if="currentPart.type === 'open'" :key="'open-'+currentPart.id" class="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          <h4 class="text-2xl md:text-3xl font-bold text-slate-900 mb-4" v-html="currentPart.question"></h4>
          <p class="text-slate-500 text-base md:text-lg mb-6" v-html="currentPart.description"></p>
          <textarea 
            v-model="answers[currentPart.id]" 
            class="flex-1 min-h-64 w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none text-slate-700 placeholder-slate-400 text-base md:text-lg leading-relaxed"
            placeholder="Typ je antwoord hier..."
          ></textarea>
        </div>

        <!-- GRAPH POINT -->
        <div v-else-if="currentPart.type === 'graph-point'" :key="'graph-'+currentPart.id" class="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          <h4 class="text-2xl md:text-3xl font-bold text-slate-900 mb-2" v-html="currentPart.question"></h4>
          <p class="text-slate-500 text-base mb-6" v-html="currentPart.description"></p>
          <div class="flex-1 border-2 border-slate-200 rounded-2xl overflow-hidden bg-white relative cursor-crosshair min-h-[400px]">
            <MathGraphSvg 
              :config="getGraphConfig(currentPart)" 
              @graph-click="(pt) => selectGraphPoint(currentPart.id, pt)" 
            />
            <div v-if="answers[currentPart.id]" class="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-slate-100 text-sm font-mono font-bold text-slate-700 flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-indigo-600"></div>
              Gekozen: ({{ answers[currentPart.id].x.toFixed(1) }}, {{ answers[currentPart.id].y.toFixed(1) }})
            </div>
          </div>
        </div>

        <!-- MOOD SELECTOR -->
        <div v-else-if="currentPart.type === 'mood'" :key="'mood-'+currentPart.id" class="flex-1 flex flex-col justify-center items-center text-center max-w-3xl mx-auto w-full">
          <h4 class="text-3xl md:text-4xl font-bold text-slate-900 mb-12" v-html="currentPart.question"></h4>
          <div class="flex justify-center gap-6 md:gap-8">
            <button @click="selectedMood = 'happy'" class="group relative w-28 h-28 md:w-32 md:h-32 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2" 
              :class="selectedMood === 'happy' ? 'border-emerald-500 bg-emerald-50 text-emerald-600 scale-110 shadow-xl' : 'border-slate-200 text-slate-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-400'">
              <PhSmiley weight="fill" class="text-6xl md:text-7xl transition-transform group-hover:scale-110"/>
              <span class="text-sm font-bold absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600">Zeker</span>
            </button>
            <button @click="selectedMood = 'meh'" class="group relative w-28 h-28 md:w-32 md:h-32 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2"
              :class="selectedMood === 'meh' ? 'border-amber-400 bg-amber-50 text-amber-500 scale-110 shadow-xl' : 'border-slate-200 text-slate-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-400'">
              <PhSmileyMeh weight="fill" class="text-6xl md:text-7xl transition-transform group-hover:scale-110"/>
              <span class="text-sm font-bold absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500">Twijfel</span>
            </button>
            <button @click="selectedMood = 'sad'" class="group relative w-28 h-28 md:w-32 md:h-32 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2"
              :class="selectedMood === 'sad' ? 'border-rose-400 bg-rose-50 text-rose-500 scale-110 shadow-xl' : 'border-slate-200 text-slate-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-400'">
              <PhSmileySad weight="fill" class="text-6xl md:text-7xl transition-transform group-hover:scale-110"/>
              <span class="text-sm font-bold absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500">Onzeker</span>
            </button>
          </div>
        </div>

        <!-- FINISH -->
        <div v-else-if="currentPart.type === 'finish'" :key="'finish-'+currentPart.id" class="flex-1 flex flex-col items-center text-center max-w-2xl mx-auto w-full justify-center">
          <div class="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-[bounce_0.6s_ease-out]" :class="isEntry ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'">
            <PhCheckCircle weight="fill" class="text-4xl"/>
          </div>
          <h4 class="text-3xl font-bold text-slate-900 mb-4" v-if="isEntry">Klaar!</h4>
          <h4 class="text-3xl font-bold text-slate-900 mb-4" v-else>Les Afgerond!</h4>
          
          <div class="w-full bg-slate-50 border border-slate-100 rounded-3xl p-8 mt-4 space-y-6">
            <!-- ENTRY: Diagnostic per-question results -->
            <div v-if="isEntry" class="space-y-3">
              <div v-for="(r, i) in questionResults" :key="r.id" class="flex items-start gap-3 text-left p-3 rounded-xl" :class="r.isCorrect ? 'bg-emerald-50' : 'bg-amber-50'">
                <div class="shrink-0 mt-0.5">
                  <PhCheckCircle v-if="r.isCorrect" weight="fill" class="text-emerald-500 text-lg" />
                  <PhXCircle v-else weight="fill" class="text-amber-500 text-lg" />
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-800" v-html="r.question"></p>
                  <p v-if="!r.isCorrect" class="text-xs text-amber-600 mt-1 font-medium">Dit onderwerp vraagt nog aandacht.</p>
                </div>
              </div>
            </div>

            <!-- EXIT: Score + mood -->
            <div v-else class="flex justify-center items-center gap-8">
              <div class="text-left">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Jouw Score</p>
                <p class="text-4xl font-black text-slate-900">{{ scoredCorrect }} <span class="text-slate-300">/</span> {{ scoredTotal }}</p>
              </div>
              <div class="w-px h-12 bg-slate-200"></div>
              <div class="text-left">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Gevoel</p>
                <p class="text-xl font-bold text-slate-700">{{ getMoodLabel(selectedMood) }}</p>
              </div>
            </div>

            <!-- EXIT: Goals check -->
            <div class="space-y-3 pt-6 border-t border-slate-200" v-if="!isEntry && goals && goals.length > 0">
              <p class="text-xs font-bold text-slate-500 uppercase text-center">Ik kan nu...</p>
              <div class="grid grid-cols-1 gap-3 text-left">
                <div v-for="(goal, idx) in goals" :key="idx" class="flex items-center gap-3 text-base text-slate-600">
                  <PhCheckCircle weight="fill" class="text-emerald-500 shrink-0" />
                  <span v-html="goal"></span>
                </div>
              </div>
            </div>

            <!-- ENTRY: Summary line -->
            <div v-if="isEntry && scoredTotal > 0" class="pt-4 border-t border-slate-200">
              <p class="text-sm font-medium text-slate-600">
                Je hebt <span class="font-bold" :class="scoredCorrect >= scoredTotal ? 'text-emerald-600' : 'text-amber-600'">{{ scoredCorrect }} van {{ scoredTotal }}</span> vragen goed.
                <template v-if="scoredCorrect < scoredTotal"> 
                  Kijk de theorie over deze onderwerpen nog eens na voor je verdergaat.
                </template>
                <template v-else>
                  Je voorkennis zit goed! Je bent klaar voor de les.
                </template>
              </p>
            </div>
          </div>

          <button @click="close" class="mt-8 px-10 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-lg">
            Sluiten
          </button>
        </div>

      </Transition>

      <!-- Footer Actions -->
      <div class="flex-shrink-0 mt-8 pt-6 border-t border-slate-100 flex justify-between items-center max-w-3xl mx-auto w-full" v-if="currentPart.type !== 'finish'">
        <div class="text-xs font-bold text-slate-300 uppercase tracking-wider">
          {{ currentPart.type === 'mc' ? 'Meerkeuze' : currentPart.type === 'open' ? 'Reflectie' : currentPart.type === 'graph-point' ? 'Interactief' : 'Gevoel' }}
        </div>
        
        <button 
          v-if="currentPart.type !== 'mood'"
          @click="nextStep" 
          :disabled="!canProceed"
          class="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center gap-2 group text-base"
          :class="accentNavBtn"
        >
          Volgende <PhArrowRight weight="bold" class="group-hover:translate-x-1 transition-transform"/>
        </button>
        <button 
          v-else
          @click="submit"
          :disabled="!canProceed"
          class="px-10 py-3 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 text-base"
          :class="accentSubmitBtn"
        >
          Afronden <PhPaperPlaneRight weight="bold"/>
        </button>
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
