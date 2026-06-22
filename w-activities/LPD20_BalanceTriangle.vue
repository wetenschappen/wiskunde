<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCrosshair, PhArrowClockwise,
  PhLightbulb, PhTarget
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Merkwaardige Lijnen: Praktisch Nut' },
  instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhCrosshair }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kies de juiste merkwaardige lijnen voor dit probleem.' })
const attemptCount = ref(0)
const showWorkedExample = ref(false)
const predictionMade = ref(false)
const studentPrediction = ref('')
const showReflection = ref(false)
const reflectionAnswer = ref('')
const lpdConfirmed = ref(false)
const hintLevel = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function generateLevel() {
  const pool = [
    {
      goalText: 'Missie 1: Balanceren',
      problemDesc: 'Je wilt een zware driehoekige houten plaat perfect laten balanceren op één vinger. Je zoekt het exacte evenwichtspunt.',
      targetLine: 'zwaarte',
      correctMsg: 'Briljant! De zwaartelijnen snijden elkaar in het zwaartepunt. De driehoek balanceert nu perfect!',
      errorHoogte: 'Hoogtelijnen meten enkel hoe hoog het is. Je plaat valt!',
      errorMiddel: 'Middelloodlijnen bepalen het middelpunt van de omgeschreven cirkel, niet het gewicht.',
      errorBissec: 'Bissectrices halveren hoeken, maar zeggen weinig over de massaverdeling.',
      context: 'finger',
      hint1: 'Het gaat om het evenwicht of balans van de driehoek.',
      hint2: 'Het snijpunt van de juiste lijnen is het zwaartepunt.',
      hint3: 'Het juiste type is: Z... (vul zelf aan)',
      why: 'Het zwaartepunt is het snijpunt van de drie zwaartelijnen. Elke zwaartelijn verbindt een hoekpunt met het midden van de overstaande zijde. Dit punt is het massamiddelpunt: de driehoek balanceert er perfect op.'
    },
    {
      goalText: 'Missie 2: De Spinkhaan',
      problemDesc: 'Een spin wil een web weven binnenin een driehoekig raamkozijn. Het web moet precies raken aan alle drie de randen.',
      targetLine: 'bissec',
      correctMsg: 'Perfect! Bissectrices snijden elkaar in het middelpunt van de ingeschreven cirkel.',
      errorHoogte: 'Hoogtelijnen geven geen cirkel die precies past.',
      errorZwaarte: 'Zwaartelijnen geven het zwaartepunt, niet het geometrisch midden.',
      errorMiddel: 'Middelloodlijnen bepalen de cirkel RONDOM de driehoek, niet erin.',
      context: 'spider',
      hint1: 'Welke lijnen hebben te maken met het gelijk verdelen van hoeken?',
      hint2: 'Deellijnen (bissectrices) delen elke hoek in twee gelijke helften.',
      hint3: 'Het juiste type is: B... (vul zelf aan)',
      why: 'Het middelpunt van de ingeschreven cirkel is het snijpunt van de drie bissectrices. Een bissectrice verdeelt een hoek in twee gelijke delen, waardoor elk punt op de bissectrice even ver van beide benen van de hoek ligt.'
    },
    {
      goalText: 'Missie 3: Het Brandweerstation',
      problemDesc: 'Drie dorpen willen samen één brandweerstation bouwen. Het station moet van alle drie EXACT even ver weg liggen.',
      targetLine: 'middel',
      correctMsg: 'Geweldig! De middelloodlijnen snijden elkaar in het middelpunt van de omgeschreven cirkel.',
      errorHoogte: 'Hoogtelijnen helpen niet bij het zoeken van afstanden.',
      errorZwaarte: 'Het zwaartepunt ligt niet exact even ver van elk dorp.',
      errorBissec: 'Bissectrices zoeken een punt even ver van de WEGEN, niet van de dorpen.',
      context: 'map',
      hint1: 'Het gaat om een punt dat exact even ver ligt van de drie hoekpunten.',
      hint2: 'Middelloodlijnen snijden elkaar in het middelpunt van de omgeschreven cirkel.',
      hint3: 'Het juiste type is: M... (vul zelf aan)',
      why: 'Het middelpunt van de omgeschreven cirkel is het snijpunt van de drie middelloodlijnen. Een middelloodlijn staat loodrecht op een zijde en gaat door het midden ervan. Alle punten op deze lijn liggen even ver van de twee eindpunten.'
    }
  ]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const activeLines = ref('')

function getHint(data) {
  if (attemptCount.value >= 3) return data.hint3
  if (attemptCount.value >= 2) return data.hint2
  return data.hint1
}

function setLines(type) {
  if (isCorrect.value) return
  activeLines.value = type
  isChecked.value = true

  const data = currentLevelData.value
  if (type === data.targetLine) {
    isCorrect.value = true
    attemptCount.value = 0
    hintLevel.value = 0
    const whyText = data.why
    feedback.value = { type: 'success', text: data.correctMsg + ' ' + whyText }
  } else {
    isCorrect.value = false
    attemptCount.value++
    let msg = ''
    if (type === 'hoogte') msg = data.errorHoogte
    else if (type === 'zwaarte') msg = data.errorZwaarte
    else if (type === 'middel') msg = data.errorMiddel
    else if (type === 'bissec') msg = data.errorBissec
    feedback.value = { type: 'error', text: msg + ' ' + getHint(data) }
  }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintLevel.value = 0
  feedback.value = { type: 'info', text: 'Kies de juiste merkwaardige lijnen voor dit probleem.' }
  activeLines.value = ''
  predictionMade.value = false
  studentPrediction.value = ''
  showReflection.value = false
  reflectionAnswer.value = ''
  lpdConfirmed.value = false
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    levels.value = generateLevel()
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
const handleFullscreenChange = () => {}
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
            <div class="flex gap-1">
              <div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
            </div>
          </div>
        </div>
      </div>
      <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98]" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
    </header>

    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

          <!-- Worked Example -->
          <div class="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <button @click="showWorkedExample = !showWorkedExample" class="flex items-center gap-2 text-sm font-bold text-indigo-700 w-full text-left">
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Hoe herken je merkwaardige lijnen?
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>Voorbeeld:</strong> Een cirkel moet precies door de drie hoeken van een driehoek passen.</p>
              <p><strong>Stap 1:</strong> Dit is een omgeschreven cirkel. Het middelpunt moet even ver van elke hoek liggen.</p>
              <p><strong>Stap 2:</strong> Middelloodlijnen geven een punt dat even ver ligt van twee hoekpunten.</p>
              <p><strong>Stap 3:</strong> Het snijpunt van de drie middelloodlijnen is het gezochte middelpunt.</p>
              <p class="text-indigo-600 font-bold">Jouw beurt: lees de missie en kies het juiste type lijn.</p>
            </div>
          </div>

          <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
            <span class="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-2">{{ currentLevelData.goalText }}</span>
            <p class="font-medium text-sm text-slate-800">{{ currentLevelData.problemDesc }}</p>
          </div>

          <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
            <h4 class="font-bold text-slate-700 mb-3">Kies het juiste type lijn:</h4>
            <div class="flex flex-col gap-2">
              <button @click="setLines('hoogte')" :disabled="isCorrect" class="py-4 px-4 rounded-lg border-2 font-bold text-left transition-all active:scale-[0.98] shadow-sm" :class="activeLines === 'hoogte' ? (isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">Hoogtelijnen</button>
              <button @click="setLines('zwaarte')" :disabled="isCorrect" class="py-4 px-4 rounded-lg border-2 font-bold text-left transition-all active:scale-[0.98] shadow-sm" :class="activeLines === 'zwaarte' ? (isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">Zwaartelijnen</button>
              <button @click="setLines('middel')" :disabled="isCorrect" class="py-4 px-4 rounded-lg border-2 font-bold text-left transition-all active:scale-[0.98] shadow-sm" :class="activeLines === 'middel' ? (isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">Middelloodlijnen</button>
              <button @click="setLines('bissec')" :disabled="isCorrect" class="py-4 px-4 rounded-lg border-2 font-bold text-left transition-all active:scale-[0.98] shadow-sm" :class="activeLines === 'bissec' ? (isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">Bissectrices (Deellijnen)</button>
            </div>
          </div>

          <!-- Error Analysis -->
          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 1">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op! Veelgemaakte fouten:</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>Verwar zwaartelijn niet met middelloodlijn: zwaartelijn gaat door een hoekpunt, middelloodlijn door het midden van een zijde.</li>
              <li>Bissectrices delen hoeken, niet zijden. Ze zijn nuttig voor de ingeschreven cirkel.</li>
              <li>Hoogtelijnen zijn loodrecht, maar geven geen informatie over afstanden tot hoekpunten.</li>
            </ul>
          </div>

          <!-- Reflection after success -->
          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">{{ currentLevelData.why }}</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig dat je dit begrijpt</button>
          </div>

          <!-- Reflection Question -->
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom bepaalt het snijpunt van bepaalde lijnen een bijzonder punt van de driehoek? Welke eigenschap van die lijnen zorgt daarvoor?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50 hover:bg-indigo-500">Bevestig</button>
          </div>

          <!-- LPD Evidence -->
          <div v-if="lpdConfirmed && !isCorrect" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik kan de vier merkwaardige lijnen (hoogtelijn, zwaartelijn, middelloodlijn, bissectrice) herkennen en toepassen in contextproblemen.</p>
            <div class="flex items-center gap-2">
              <input type="checkbox" id="lpd-balance" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" />
              <label for="lpd-balance" class="text-xs text-emerald-700 font-medium">Ik bevestig dat ik dit begrijp en kan toepassen.</label>
            </div>
          </div>
        </div>

        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span class="leading-snug">{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98]"><PhArrowClockwise /></button>
            <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
            <div v-else class="flex-1 py-4"></div>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="relative w-[500px] h-[450px] flex items-center justify-center" :key="'lvl' + currentInternalLevel">
            <div class="absolute inset-0 transition-transform duration-700 ease-in-out origin-[183px_250px]" :class="currentInternalLevel >= 0 && activeLines && !isCorrect ? 'rotate-12 translate-y-12' : ''">
              <div v-if="currentLevelData.context === 'finger'" class="absolute w-12 h-32 bg-[#fcd34d] border-4 border-[#d97706] rounded-t-full shadow-md z-20 flex flex-col items-center pt-2 transition-all duration-700" :class="!activeLines ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'" style="left: calc(183.3px - 24px); top: 250px;"><div class="w-6 h-4 bg-white/40 rounded-full mb-1"></div></div>
              <div v-if="currentLevelData.context === 'map'" class="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <svg width="500" height="400" viewBox="0 0 500 400" class="absolute inset-0 z-30 drop-shadow-md">
                <polygon points="100,50 50,350 400,350" :fill="currentLevelData.context === 'finger' ? '#b45309' : (currentLevelData.context === 'spider' ? 'rgba(0,0,0,0.05)' : (currentLevelData.context === 'map' ? '#4ade80' : '#94a3b8'))" :stroke="currentLevelData.context === 'finger' ? '#78350f' : (currentLevelData.context === 'spider' ? '#94a3b8' : (currentLevelData.context === 'map' ? '#166534' : '#64748b'))" :stroke-width="currentLevelData.context === 'spider' ? 2 : 6" stroke-linejoin="round" />
                <g v-if="currentLevelData.context === 'map'">
                  <circle cx="100" cy="50" r="15" fill="#ef4444" /><circle cx="50" cy="350" r="15" fill="#ef4444" /><circle cx="400" cy="350" r="15" fill="#ef4444" />
                </g>
                <g v-if="activeLines === 'zwaarte'" stroke="#facc15" stroke-width="3" stroke-dasharray="8 4" class="animate-fadeIn">
                  <line x1="100" y1="50" x2="225" y2="350" /><line x1="50" y1="350" x2="250" y2="200" /><line x1="400" y1="350" x2="75" y2="200" /><circle cx="183.3" cy="250" r="8" fill="#facc15" />
                </g>
                <g v-if="activeLines === 'hoogte'" stroke="#ef4444" stroke-width="3" stroke-dasharray="8 4" class="animate-fadeIn">
                  <line x1="100" y1="50" x2="100" y2="350" /><line x1="50" y1="350" x2="160" y2="100" /><circle cx="100" cy="300" r="8" fill="#ef4444" />
                </g>
                <g v-if="activeLines === 'middel'" stroke="#10b981" stroke-width="3" stroke-dasharray="8 4" class="animate-fadeIn">
                  <line x1="225" y1="350" x2="225" y2="100" /><circle cx="225" cy="210" r="8" fill="#10b981" />
                  <circle v-if="isCorrect && currentLevelData.targetLine === 'middel'" cx="225" cy="210" r="185" fill="none" stroke="#10b981" stroke-width="4" class="animate-fadeIn" />
                </g>
                <g v-if="activeLines === 'bissec'" stroke="#a855f7" stroke-width="3" stroke-dasharray="8 4" class="animate-fadeIn">
                  <line x1="100" y1="50" x2="190" y2="350" /><line x1="50" y1="350" x2="350" y2="150" /><circle cx="170" cy="245" r="8" fill="#a855f7" />
                  <circle v-if="isCorrect && currentLevelData.targetLine === 'bissec'" cx="170" cy="245" r="105" fill="rgba(255,255,255,0.8)" stroke="#a855f7" stroke-width="4" class="animate-fadeIn" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</div>
</template>

<style scoped>
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
