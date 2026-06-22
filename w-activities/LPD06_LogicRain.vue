<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhBrain,
  PhArrowClockwise, PhLightbulb, PhCloudRain, PhTruck, PhPencilSimpleLine
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Redeneren: Implicatie vs Equivalentie' },
  instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhBrain }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const hintCount = ref(0)
const feedback = ref({ type: 'info', text: '' })

// ========== PEDAGOGICAL STATE ==========
const showWorkedExample = ref(true)
const showPrediction = ref(false)
const predictedAnswer = ref(null)
const showWhy = ref(false)
const whyText = ref('')
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionDone = ref(false)
const errorDetected = ref('')

const currentInternalLevel = ref(0)
const totalInternalLevels = 4
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren', 'Reflecteren']
const reflectionAnswerSubmitted = ref(false)

// ========== SCENARIO POOL ==========
const scenarioPool = [
  {
    id: 'rain-wet',
    simStart: 'rain',
    goalText: 'Het is keihard aan het regenen. Wat weet je 100% zeker over de straat?',
    options: ['De straat is nat', 'De straat is droog', 'We weten het niet zeker'],
    targetAns: 'De straat is nat',
    hint: 'De regel is: ALS het regent, DAN is de straat nat. Het regent nu, dus...',
    hint2: 'A (regen) is waar. Volgens A⇒B moet B dan ook waar zijn.',
    hint3: 'Als het regent, MOET de straat nat zijn (A⇒B). A is waar, dus B is waar.'
  },
  {
    id: 'dry-no-rain',
    simStart: 'dry',
    goalText: 'Je kijkt naar buiten en ziet dat de straat kurkdroog is. Heeft het net geregend?',
    options: ['Ja, het heeft geregend', 'Nee, het heeft niet geregend', 'We weten het niet zeker'],
    targetAns: 'Nee, het heeft niet geregend',
    hint: 'Als het wél geregend had, MOEST de straat nat zijn (A⇒B). Maar de straat is droog. Dus...',
    hint2: 'Dit is de "modus tollens"-regel: A⇒B, niet B, dus niet A.',
    hint3: 'Stel: het heeft geregend. Dan was de straat nat (A⇒B). Maar de straat is droog. Dat kan niet kloppen. Dus het heeft niet geregend.'
  },
  {
    id: 'wet-unknown',
    simStart: 'wet',
    goalText: 'Je ziet dat de straat nat is. Kun je nu met 100% zekerheid zeggen dat het geregend heeft?',
    options: ['Ja, het heeft zeker geregend', 'Nee, dat weet je niet zeker'],
    targetAns: 'Nee, dat weet je niet zeker',
    hint: 'Kan de straat nat zijn ZONDER dat het regent? Probeer de sproeiwagen!',
    hint2: 'A⇒B betekent: ALS A DAN B. Maar B kan ook door andere oorzaken waar zijn. Dit is de "affirming the consequent"-drogreden.',
    hint3: 'Regen⇒Natte Straat. Maar Natte Straat wordt niet ALLEEN door regen veroorzaakt. De omgekeerde pijl geldt niet.'
  }
]

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const userAnswer = ref(null)

// Domain
const streetState = ref('dry')
function triggerRain() { streetState.value = 'rain' }
function triggerTruck() { streetState.value = 'truck' }

function generateLevels() {
  return scenarioPool.map(s => ({ ...s }))
}

// ========== WORKED EXAMPLE ==========
const workedExample = {
  rule: 'ALS de zon schijnt (Z), DAN is het licht (L) [Z ⇒ L]',
  scenarios: [
    'Scenario 1: De zon schijnt. → Het is licht. (Z waar ⇒ L waar)',
    'Scenario 2: De zon schijnt NIET. → Is het donker? Niet per se! (lampen, kaarsen...)'
  ],
  key: 'Implicatie (⇒) werkt één richting: Z ⇒ L betekent niet L ⇒ Z. Het kan ook licht zijn zonder zon.',
  lesson: 'Kortom: A⇒B betekent "ALS A DAN B". Van A weet je B (regen⇒nat), maar van B weet je NIET automatisch A (nat⇒? niet perse regen).'
}

// ========== PREDICTION ==========
function checkPrediction() {
  if (!predictedAnswer.value) return
  const target = currentLevelData.value.targetAns
  if (predictedAnswer.value === target) {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Juist ingeschat! Laten we het verifiëren met de simulatie.' }
    userAnswer.value = target
  } else {
    attemptCount.value++
    const hints = [
      'Denk aan de regel A⇒B. Wat zegt die over de huidige situatie?',
      'Welke informatie heb je? Welke conclusie kun je met 100% zekerheid trekken?',
      'Splits de situatie: wat weet je zeker en wat niet?'
    ]
    feedback.value = { type: 'error', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== HINTS ==========
function showHint() {
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, 2)
  const hints = [
    currentLevelData.value.hint,
    currentLevelData.value.hint2,
    currentLevelData.value.hint3
  ]
  feedback.value = { type: 'info', text: hints[idx] || 'Denk aan de logica: wat volgt er uit de regel?' }
}

// ========== ANSWER CHECK ==========
function checkAnswer() {
  isChecked.value = true
  if (userAnswer.value === currentLevelData.value.targetAns) {
    isCorrect.value = true
    hintCount.value = 0
    const whyTexts = {
      'rain-wet': 'Regen veroorzaakt natte straten. Dit is de implicatie A⇒B: als A (regen) waar is, dan is B (natte straat) ook waar. Simpel!',
      'dry-no-rain': 'Dit is het "modus tollens"-principe: als A⇒B geldt en B is onwaar, dan moet A ook onwaar zijn. Wiskundig: ¬B ⇒ ¬A. Dit is een geldige redenering!',
      'wet-unknown': 'Dit is de "affirming the consequent"-drogreden. B kan waar zijn zonder A. De sproeiwagen maakt de straat ook nat. A⇒B betekent NIET B⇒A!'
    }
    const why = whyTexts[currentLevelData.value.id] || ''
    showWhy.value = true
    whyText.value = why + '<br/><br/><strong>LPD 6 bewezen:</strong> Je herkent het verschil tussen wat je WEL en NIET kunt afleiden uit een implicatie. Dit is de kern van logisch redeneren.'
    feedback.value = { type: 'success', text: 'Prima beredeneerd!' }
  } else {
    attemptCount.value++
    isCorrect.value = false
    feedback.value = { type: 'error', text: attemptCount.value === 1
      ? `Niet helemaal. ${currentLevelData.value.hint}`
      : attemptCount.value === 2
        ? `Probeer opnieuw. ${currentLevelData.value.hint2}`
        : `${currentLevelData.value.hint3} Kies het antwoord dat WISKUNDIG zeker is.` }
  }
}

// ========== REFLECTION (Level 4) ==========
function checkReflection() {
  const text = reflectionAnswer.value.toLowerCase().trim()
  const hasImplicatie = text.includes('implicatie') || (text.includes('als') && text.includes('dan'))
  const hasEquivalentie = text.includes('equivalentie') || text.includes('als en slechts') || text.includes('beide kanten') || text.includes('omgekeerd')
  const hasRichting = text.includes('richting') || text.includes('één') || text.includes('twee')
  const hasReason = text.length > 20

  if ((hasImplicatie || hasRichting) && hasReason) {
    reflectionDone.value = true
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: 'Uitstekende uitleg!<br/><br/><strong>Waarom dit belangrijk is:</strong> Een implicatie (A→B) werkt één richting: ALS A DAN B. Maar B kan ook zonder A gebeuren (sproeiwagen!). Een equivalentie (A↔B) werkt twee richtingen: A geldt alleen als B geldt én vice versa.<br/><br/>Regen→nat, maar nat↛regen → dus implicatie, geen equivalentie!<br/><br/><strong>LPD 6 bewezen:</strong> Je herkent het verschil tussen een implicatie (één richting) en een equivalentie (twee richtingen), en je kunt in een concrete context bepalen welke logische relatie geldt.'
    }
  } else {
    attemptCount.value++
    const hints = [
      'Probeer deze zinnen: "Een implicatie is ... Een equivalentie is ..."',
      'Denk aan de straat: regen⇒nat. Geldt nat⇒regen ook altijd? Waarom wel/niet?',
      'Implicatie = één richting (ALS...DAN). Equivalentie = twee richtingen (ALS EN SLECHTS ALS).'
    ]
    feedback.value = { type: 'info', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== NAVIGATION ==========
function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = true
  feedback.value = { type: 'info', text: 'Voorspel eerst het juiste antwoord. Daarna verifiëren we met de simulatie.' }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintCount.value = 0
  userAnswer.value = null
  predictedAnswer.value = null
  errorDetected.value = ''
  showWhy.value = false
  whyText.value = ''
  reflectionAnswer.value = ''
  reflectionAnswerSubmitted.value = false

  // Only show worked example on level 0
  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value >= 1

  if (currentInternalLevel.value === 3) {
    // Reflection level
    showReflection.value = true
    showPrediction.value = false
    showWorkedExample.value = false
    feedback.value = { type: 'info', text: 'Schrijf in je eigen woorden: wat is het verschil tussen een implicatie en een equivalentie?' }
    streetState.value = 'wet'
  } else if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel eerst het juiste antwoord.' }
    streetState.value = currentLevelData.value?.simStart || 'dry'
  } else {
    feedback.value = { type: 'info', text: 'Experimenteer met de simulatie en kies het juiste antwoord.' }
    streetState.value = currentLevelData.value?.simStart || 'dry'
  }
  reflectionDone.value = false
  showReflection.value = currentInternalLevel.value === 3
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    levels.value = generateLevels()
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

// ========== LIFECYCLE ==========
watch(() => props.isOpen, (val) => {
  if (val) {
    levels.value = generateLevels()
    currentInternalLevel.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
         @click="emit('close')" role="button" tabindex="0"
         @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <!-- HEADER -->
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-3">
              <div class="flex gap-1">
                <span v-for="i in totalInternalLevels" :key="i"
                      class="w-2.5 h-2.5 rounded-full border"
                      :class="i <= currentInternalLevel + 1 ? 'bg-amber-500 border-amber-600' : 'bg-slate-200 border-slate-300'">
                </span>
              </div>
              <span class="text-xs font-semibold text-slate-500">{{ levelLabels[currentInternalLevel] }} — Level {{ currentInternalLevel + 1 }}</span>
              <span v-if="totalSteps > 1" class="text-xs text-slate-400 ml-2">Stap {{ currentStep }} van {{ totalSteps }}</span>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <!-- MAIN -->
      <main class="flex flex-1 overflow-hidden">
        <!-- LEFT SIDEBAR -->
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="props.instruction || 'We bestuderen implicaties (ALS...DAN) met de straat-simulatie.'" class="mb-4 prose prose-sm text-slate-600" />

            <!-- WORKED EXAMPLE -->
            <div v-if="showWorkedExample" class="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800 text-sm">Voorbeeld — Ik doe voor</span>
              </div>
              <p class="text-sm text-slate-700 font-bold mb-2">{{ workedExample.rule }}</p>
              <div class="space-y-1.5 text-sm text-slate-600 mb-2">
                <div v-for="(s, si) in workedExample.scenarios" :key="si" class="flex items-start gap-2">
                  <span class="text-amber-500 font-bold shrink-0">{{ si + 1 }}.</span>
                  <span>{{ s }}</span>
                </div>
              </div>
              <div class="bg-white p-3 rounded-lg border border-amber-200 text-sm text-slate-700 mb-2">
                <span class="font-bold text-amber-700">Kern: </span>{{ workedExample.key }}
              </div>
              <p class="text-xs text-slate-500 italic">{{ workedExample.lesson }}</p>
              <button @click="skipWorkedExample"
                      class="mt-3 w-full py-2 text-sm font-bold text-amber-700 bg-white border-2 border-amber-300 rounded-lg hover:bg-amber-100 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen! Zelf doen →
              </button>
            </div>

            <!-- PREDICTION GATE (levels 1-2) -->
            <div v-if="showPrediction && !showWorkedExample && currentInternalLevel < 3" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhLightbulb class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800 text-sm">Voorspel</span>
              </div>
              <p class="text-sm text-slate-700 mb-3"><strong>{{ currentLevelData.goalText }}</strong></p>
              <div class="flex flex-col gap-2">
                <button v-for="(opt, oi) in currentLevelData.options" :key="oi"
                        @click="predictedAnswer = opt"
                        class="w-full py-2 px-3 rounded-lg font-bold text-sm transition-colors border-2 text-left focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        :class="predictedAnswer === opt ? 'bg-amber-500 text-white border-amber-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                  {{ opt }}
                </button>
              </div>
              <button v-if="predictedAnswer" @click="checkPrediction"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <!-- TASK (level 0) or CONFIRMATION (levels 1-2 after prediction) -->
            <div v-if="!showWorkedExample && !showReflection && (currentInternalLevel === 0 || (!showPrediction && currentInternalLevel < 3))" class="p-4 border border-amber-200 bg-amber-50 rounded-xl shadow-sm mb-4 animate-fadeIn">
              <label class="block text-sm font-bold text-amber-700 mb-3">{{ currentLevelData.goalText }}</label>
              <div class="flex flex-col gap-2">
                <button v-for="(opt, oi) in currentLevelData.options" :key="oi"
                        @click="if(!isCorrect) { userAnswer = opt; isChecked = false }"
                        class="w-full py-2 rounded-lg font-bold transition-colors border-2 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        :class="userAnswer === opt ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                  {{ opt }}
                </button>
              </div>
              <button v-if="userAnswer && !isCorrect" @click="checkAnswer"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Controleer
              </button>
            </div>

            <!-- WHY EXPLANATION -->
            <div v-if="showWhy && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Waarom is dit waar?</span>
              </div>
              <p class="text-sm text-indigo-700" v-html="whyText"></p>
            </div>

            <!-- REFLECTION (Level 4) -->
            <div v-if="showReflection" class="p-4 border border-indigo-200 bg-indigo-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhPencilSimpleLine class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Reflectie</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Wat is het verschil tussen een <strong>implicatie</strong> (A→B) en een <strong>equivalentie</strong> (A↔B)? Schrijf in je eigen woorden.</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                class="w-full p-3 border-2 border-indigo-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows="4" placeholder="Een implicatie is... terwijl een equivalentie..."></textarea>
              <button v-if="!reflectionDone" @click="checkReflection"
                      :disabled="!reflectionAnswer.trim()"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
                Bevestig reflectie
              </button>
            </div>
          </div>

          <!-- BOTTOM CONTROLS -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-50 text-amber-800 border border-amber-200': feedback.type === 'success',
                          'bg-red-50 text-red-800 border border-red-200': feedback.type === 'error',
                          'bg-blue-50 text-blue-800 border border-blue-200': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : feedback.type === 'error' ? PhWarningCircle : PhLightbulb"
                         class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug" v-html="feedback.text"></span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState"
                      class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <PhArrowClockwise />
              </button>

              <!-- Hint — only on task levels not on reflection -->
              <button v-if="!showWorkedExample && !showPrediction && !showReflection && !isCorrect && currentInternalLevel < 3"
                      @click="showHint"
                      class="flex-1 py-4 font-bold text-slate-600 rounded-lg border-2 border-slate-300 bg-white hover:bg-slate-50 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none flex items-center justify-center gap-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                Hint
              </button>

              <button v-if="isCorrect && !showReflection" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Volgende stap' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <button v-if="isCorrect && showReflection && reflectionDone" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>Afronden</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL — Street Simulation -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

            <!-- Controls -->
            <div v-if="!showReflection" class="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4 bg-white p-2 rounded-xl shadow-md border border-slate-200 z-20">
              <button @click="triggerRain"
                      class="px-4 py-2 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                      :class="streetState === 'rain' ? 'bg-amber-50 text-amber-700 border-2 border-amber-300' : 'text-slate-500 hover:bg-slate-100'">
                <PhCloudRain weight="bold" /> Laat het regenen
              </button>
              <button @click="triggerTruck"
                      class="px-4 py-2 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                      :class="streetState === 'truck' ? 'bg-amber-50 text-amber-700 border-2 border-amber-300' : 'text-slate-500 hover:bg-slate-100'">
                <PhTruck weight="bold" /> Sproeiwagen
              </button>
            </div>

            <!-- The Street Scene -->
            <div class="w-full max-w-2xl h-[400px] bg-white rounded-xl border-4 border-slate-300 shadow-md relative overflow-hidden flex flex-col">
              <!-- Sky -->
              <div class="h-1/2 w-full relative transition-colors duration-1000" :class="streetState === 'rain' ? 'bg-slate-400' : 'bg-sky-100'">
                <div class="absolute top-10 left-20 w-32 h-16 bg-white rounded-full mix-blend-overlay opacity-80 blur-sm transition-all"
                     :class="streetState === 'rain' ? 'bg-slate-600 scale-110' : ''"></div>
                <div class="absolute top-4 right-32 w-48 h-20 bg-white rounded-full mix-blend-overlay opacity-90 blur-md transition-all"
                     :class="streetState === 'rain' ? 'bg-slate-700 scale-110' : ''"></div>
                <!-- Rain -->
                <div v-if="streetState === 'rain'" class="absolute inset-0 overflow-hidden opacity-60">
                  <div v-for="i in 40" :key="i" class="absolute w-0.5 h-5 bg-amber-400 rounded-lg"
                       :style="{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `fall ${0.5 + Math.random() * 0.5}s linear infinite` }"></div>
                </div>
              </div>
              <!-- Street -->
              <div class="h-1/2 w-full relative transition-colors duration-1000" :class="streetState === 'dry' ? 'bg-slate-300' : 'bg-slate-500'">
                <div class="absolute top-1/2 left-0 w-full h-2 flex justify-between px-10">
                  <div v-for="i in 8" :key="'l'+i" class="w-16 h-full bg-white opacity-50"></div>
                </div>
                <!-- Puddles -->
                <div v-if="streetState !== 'dry'" class="absolute inset-0 animate-fadeIn opacity-40">
                  <div class="absolute top-10 left-20 w-40 h-8 bg-slate-900 rounded-full blur-sm transform scale-y-50"></div>
                  <div class="absolute bottom-10 right-32 w-64 h-12 bg-slate-900 rounded-full blur-sm transform scale-y-50"></div>
                  <div class="absolute top-5 right-10 w-24 h-6 bg-slate-900 rounded-full blur-sm transform scale-y-50"></div>
                </div>
                <!-- Truck -->
                <div v-if="streetState === 'truck'" class="absolute top-4 -left-32 animate-driveRight">
                  <div class="relative w-48 h-24">
                    <div class="absolute bottom-0 w-32 h-16 bg-amber-600 rounded-l-lg border-2 border-amber-500 z-10"></div>
                    <div class="absolute bottom-0 right-0 w-16 h-12 bg-slate-200 rounded-r-lg border-2 border-slate-400 z-10"></div>
                    <div class="absolute -bottom-2 left-4 w-8 h-8 bg-slate-800 rounded-full border-2 border-slate-400 z-20"></div>
                    <div class="absolute -bottom-2 right-4 w-8 h-8 bg-slate-800 rounded-full border-2 border-slate-400 z-20"></div>
                    <div class="absolute bottom-2 -left-16 w-20 h-10 bg-amber-400/50 rounded-full blur-md origin-right scale-x-150 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Logical Summary Box -->
            <div class="mt-6 bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm w-full max-w-2xl text-center">
              <div class="font-mono font-bold text-xl flex items-center justify-center gap-4 text-slate-700">
                <span>Regen</span>
                <span class="text-amber-500 font-black text-2xl">⇒</span>
                <span>Straat Nat</span>
              </div>
              <p class="text-xs text-slate-400 mt-1">Implicatie (ALS...DAN) — werkt één richting</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  <SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel >= totalInternalLevels - 1 && reflectionDone" />
  </div>
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; }
@keyframes ring-pulse-amber { 0% { box-shadow: 0 0 0 0 #fbbf24; } 70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); } 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); } }

@keyframes fall {
    0% { transform: translateY(-100px); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(200px); opacity: 0; }
}

@keyframes driveRight {
    0% { transform: translateX(-100px); }
    100% { transform: translateX(800px); }
}
.animate-driveRight {
    animation: driveRight 3s linear forwards;
}
</style>
