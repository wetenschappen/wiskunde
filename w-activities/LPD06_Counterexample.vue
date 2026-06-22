<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhLightning,
  PhArrowClockwise, PhLightbulb, PhBrain, PhPencilSimpleLine
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Redeneren: Het Tegenvoorbeeld' },
  instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhLightning }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const hintCount = ref(0)
const feedback = ref({ type: 'info', text: 'Selecteer een getal uit het rooster.' })

// ========== PEDAGOGICAL STATE ==========
const showWorkedExample = ref(true)
const showPrediction = ref(false)
const predictedCategory = ref(null) // 'prime-even', 'multiple-3-even', 'divisible-2-not-4'
const showWhy = ref(false)
const whyText = ref('')
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionDone = ref(false)
const errorDetected = ref('')

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

// ========== LEVEL GENERATION ==========
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const rulePool = [
  {
    id: 'prime-even',
    rule: '"Alle priemgetallen zijn oneven getallen."',
    hint: 'Zoek een priemgetal dat EVEN is.',
    checkTarget: (num) => {
      const isPrime = (n) => { for(let i=2,s=Math.sqrt(n);i<=s;i++) if(n%i===0) return false; return n>1; }
      return isPrime(num) && num % 2 === 0
    },
    successMsg: '2 is een priemgetal, maar is EVEN. Eén tegenvoorbeeld is genoeg om een bewering te ontkrachten!',
    workedExample: {
      rule: '"Alle driehoeken hebben een rechte hoek."',
      reason: 'We zoeken een driehoek ZONDER rechte hoek.',
      counterexample: 'Een gelijkzijdige driehoek (alle hoeken 60°) heeft geen rechte hoek. Eén voorbeeld dat de bewering ontkracht!',
      method: 'Een tegenvoorbeeld is een ENKEL voorbeeld dat voldoet aan de voorwaarden (hier: "driehoek") maar NIET aan de conclusie (hier: "heeft rechte hoek").'
    },
    whyExplanation: 'Een tegenvoorbeeld is zo krachtig omdat wiskundige beweringen voor ALLE gevallen moeten gelden. Eén uitzondering — hoe klein ook — is genoeg om de bewering te ontkrachten. Dit is de basis van logisch redeneren in de wiskunde (LPD 6).'
  },
  {
    id: 'multiple-3-even',
    rule: '"Een veelvoud van 3 is altijd een oneven getal."',
    hint: 'Zoek een getal in de tafel van 3 dat EVEN is.',
    checkTarget: (num) => num % 3 === 0 && num % 2 === 0,
    successMsg: '6, 12 en 18 zijn allemaal veelvouden van 3, maar zijn EVEN. De bewering is vals!',
    workedExample: null, // only on level 0
    whyExplanation: 'De bewering zegt "altijd". Dat betekent: voor élk veelvoud van 3 moet gelden dat het oneven is. Als we één even veelvoud van 3 vinden (zoals 6, 12 of 18), dan is de bewering ontkracht. Eén uitzondering is voldoende!'
  },
  {
    id: 'divisible-2-not-4',
    rule: '"Elk getal deelbaar door 2, is ook deelbaar door 4."',
    hint: 'Zoek een getal dat wel in de tafel van 2 zit, maar NIET in de tafel van 4.',
    checkTarget: (num) => num % 2 === 0 && num % 4 !== 0,
    successMsg: 'Getallen zoals 2, 6, 10, 14 of 18 zijn even, maar niet deelbaar door 4! Bewijs geleverd!',
    workedExample: null,
    whyExplanation: 'De bewering legt een verband: deelbaar door 2 zou deelbaar door 4 moeten betekenen. Maar 2, 6, 10, 14... dit zijn getallen die wél door 2 deelbaar zijn, maar niet door 4. Dit toont aan dat de bewering te sterk is: deelbaarheid door 2 is een zwakkere eigenschap dan deelbaarheid door 4.'
  },
  {
    id: 'ends-5-not-10',
    rule: '"Elk getal dat eindigt op 5 is deelbaar door 10."',
    hint: 'Zoek een getal dat eindigt op 5 maar niet op 0.',
    checkTarget: (num) => num % 5 === 0 && num % 10 !== 0,
    successMsg: '5, 15, 25 zijn allemaal deelbaar door 5 maar niet door 10. De stelling klopt niet!',
    workedExample: null,
    whyExplanation: null
  },
  {
    id: 'gt-10-even',
    rule: '"Als een getal groter is dan 10, dan is het ook even."',
    hint: 'Zoek een getal groter dan 10 dat ONEVEN is.',
    checkTarget: (num) => num > 10 && num % 2 !== 0,
    successMsg: '11, 13, 15, 17 en 19 zijn allemaal groter dan 10, maar oneven. De bewering klopt niet!',
    workedExample: null,
    whyExplanation: null
  }
]

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain
const numbers = Array.from({length: 20}, (_, i) => i + 1)
const selectedNumber = ref(null)
const ruleShattered = ref(false)

function generateLevel(index) {
  // Filter pool to avoid duplicates across levels
  const pool = rulePool.filter(r => {
    if (index === 0) return r.id === 'prime-even' || r.id === 'multiple-3-even'
    if (index === 1) return r.id === 'divisible-2-not-4' || r.id === 'ends-5-not-10'
    return r.id === 'gt-10-even' || r.id === 'prime-even' || r.id === 'multiple-3-even'
  })
  const chosen = pool[index % pool.length] || rulePool[index]
  return { ...chosen }
}

function generateLevels() {
  return Array.from({length: totalInternalLevels}, (_, i) => {
    const lvl = generateLevel(i)
    return lvl
  })
}

// ========== PREDICTION ==========
const predictionOptions = computed(() => [
  { id: 'exact-match', label: 'Een getal dat precies aan de bewering voldoet' },
  { id: 'premise-true-conclusion-false', label: 'Een getal dat aan de voorwaarde voldoet maar NIET aan de conclusie' },
  { id: 'random-example', label: 'Een willekeurig getal om te testen' }
])

function checkPrediction() {
  if (!predictedCategory.value) return
  if (predictedCategory.value === 'premise-true-conclusion-false') {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Juist! Een tegenvoorbeeld voldoet aan de voorwaarde (links) maar NIET aan de conclusie (rechts). Zoek nu zo\'n getal in het rooster.' }
  } else {
    attemptCount.value++
    const hints = [
      'Bekijk de bewering: er staat een voorwaarde (bv. "als x priem is") en een conclusie (bv. "dan is x oneven"). Het tegenvoorbeeld moet wél aan de voorwaarde voldoen, maar NIET aan de conclusie.',
      'Links van "⇒" staat wat WEL moet gelden voor het tegenvoorbeeld. Rechts staat wat NIET mag gelden.',
      'Een tegenvoorbeeld is een uitzondering: het past in de regel maar breekt de uitkomst.'
    ]
    feedback.value = { type: 'error', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== HINTS ==========
function showHint() {
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, 2)
  const hints = [
    currentLevelData.value.hint || 'Zoek een getal dat aan de linkerkant van de bewering voldoet, maar niet aan de rechterkant.',
    'Test elk getal: voldoet het aan de voorwaarde? Zo ja, voldoet het dan ook aan de conclusie? Zo nee: bingo, tegenvoorbeeld!',
    'Probeer de getallen 2, 6, 10, 11, 13, 15, 18, 19 — één van deze getallen is het tegenvoorbeeld dat je zoekt.'
  ]
  feedback.value = { type: 'info', text: hints[idx] }
}

// ========== ANSWER ==========
function selectNumber(num) {
  if (isCorrect.value) return
  selectedNumber.value = num
  checkAnswer(num)
}

function checkAnswer(num) {
  if (currentLevelData.value.checkTarget(num)) {
    isCorrect.value = true
    ruleShattered.value = true
    errorDetected.value = ''
    hintCount.value = 0
    feedback.value = {
      type: 'success',
      text: currentLevelData.value.successMsg + '<br/><br/><strong>LPD 6 bewezen:</strong> Je herkent dat één tegenvoorbeeld volstaat om een universele bewering te ontkrachten. Dit is de kern van logisch redeneren.'
    }
    if (currentLevelData.value.whyExplanation) {
      showWhy.value = true
      whyText.value = currentLevelData.value.whyExplanation
    }
  } else {
    attemptCount.value++
    isCorrect.value = false

    // Error analysis
    const passesPremise = (() => {
      const id = currentLevelData.value.id
      if (id === 'prime-even') { const isPrime = (n) => { for(let i=2,s=Math.sqrt(n);i<=s;i++) if(n%i===0) return false; return n>1; }; return isPrime(num) }
      if (id === 'multiple-3-even') return num % 3 === 0
      if (id === 'divisible-2-not-4') return num % 2 === 0
      if (id === 'ends-5-not-10') return num % 5 === 0
      if (id === 'gt-10-even') return num > 10
      return false
    })()

    let errMsg = ''
    if (!passesPremise && attemptCount.value === 1) {
      errMsg = 'Dit getal voldoet niet eens aan de voorwaarde. Zoek een getal dat WÉL aan de linkerkant voldoet.'
    } else if (passesPremise && attemptCount.value === 1) {
      errMsg = 'Dit getal voldoet aan de voorwaarde én aan de conclusie. Dat is een bevestiging, geen tegenvoorbeeld. Zoek een getal dat wél aan de voorwaarde voldoet maar NIET aan de conclusie.'
    } else if (attemptCount.value >= 3) {
      errMsg = 'Splits de bewering in twee delen: voorwaarde (links) en conclusie (rechts). Het tegenvoorbeeld moet links JA zeggen en rechts NEE.'
    } else {
      errMsg = 'Niet het juiste tegenvoorbeeld. Bekijk de bewering nog eens. Wat is de voorwaarde? Wat is de conclusie? Het tegenvoorbeeld moet aan de voorwaarde voldoen, maar de conclusie ontkrachten.'
    }
    feedback.value = { type: 'error', text: errMsg }
  }
}

// ========== REFLECTION ==========
function checkReflection() {
  const text = reflectionAnswer.value.toLowerCase().trim()
  const hasCounter = text.includes('tegenvoorbeeld') || text.includes('uitzondering')
  const hasReason = text.includes('één') || text.includes('een') && text.includes('voldoet') || text.includes('voorwaarde') && text.includes('conclusie')
  if ((hasCounter || hasReason) && text.length > 15) {
    reflectionDone.value = true
    feedback.value = { type: 'success', text: 'Uitstekend! Je begrijpt de kracht van een tegenvoorbeeld.<br/><br/><strong>LPD 6 bewezen:</strong> Je kan niet alleen tegenvoorbeelden vinden, maar ook verklaren waarom ze wiskundig redeneren ontkrachten.' }
    isCorrect.value = true
  } else {
    attemptCount.value++
    const hints = [
      'Waarom is één tegenvoorbeeld genoeg om een bewering als "Alle priemgetallen zijn oneven" te ontkrachten?',
      'Leg uit in termen van de bewering: de bewering zegt "voor alle X geldt...". Wat betekent één uitzondering voor zo\'n bewering?',
      'Vergelijk het met: "Alle zwanen zijn wit." Je ziet één zwarte zwaan. Wat gebeurt er met de bewering?'
    ]
    feedback.value = { type: 'info', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== NAVIGATION ==========
function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = true
  feedback.value = { type: 'info', text: 'Voorspel eerst: wat zoeken we precies in een tegenvoorbeeld?' }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintCount.value = 0
  selectedNumber.value = null
  ruleShattered.value = false
  errorDetected.value = ''
  showWhy.value = false
  whyText.value = ''
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionDone.value = false
  predictedCategory.value = null

  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value >= 1

  if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel eerst: wat zoeken we in een tegenvoorbeeld?' }
  } else {
    feedback.value = { type: 'info', text: 'Selecteer een getal uit het rooster.' }
  }
}

function handleNext() {
  if (currentInternalLevel.value === totalInternalLevels - 1 && !showReflection.value && !reflectionDone.value) {
    showReflection.value = true
    showWhy.value = false
    isCorrect.value = false
    feedback.value = { type: 'info', text: 'Reflecteer op de kracht van een tegenvoorbeeld in wiskundig redeneren.' }
    return
  }

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
    if (props.fullscreen) {
      nextTick(() => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => {})
      })
    }
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
const handleFullscreenChange = () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
    <div class="absolute inset-0 bg-slate-900/50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
         @click="emit('close')" role="button" tabindex="0"
         @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-slate-800">

      <!-- HEADER -->
      <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-500/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
            <div class="flex items-center gap-3">
              <div class="flex gap-1">
                <span v-for="i in totalInternalLevels" :key="i"
                      class="w-2.5 h-2.5 rounded-full border"
                      :class="i <= currentInternalLevel + 1 ? 'bg-amber-500 border-amber-400' : 'bg-slate-600 border-slate-500'">
                </span>
              </div>
              <span class="text-xs font-semibold text-slate-400">{{ levelLabels[currentInternalLevel] }} — Level {{ currentInternalLevel + 1 }}</span>
              <span v-if="totalSteps > 1" class="text-xs text-slate-500 ml-2">Stap {{ currentStep }} van {{ totalSteps }}</span>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <!-- MAIN -->
      <main class="flex flex-1 overflow-hidden">
        <!-- LEFT SIDEBAR -->
        <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 shadow-inner md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
            <MathText :content="props.instruction || 'Een tegenvoorbeeld ontkracht een wiskundige bewering. Selecteer het juiste getal.'" class="mb-4 prose prose-sm prose-invert text-slate-300" />

            <!-- WORKED EXAMPLE -->
            <div v-if="showWorkedExample && currentLevelData.workedExample" class="bg-amber-900/30 p-4 rounded-lg mb-4 border-l-4 border-amber-500 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-amber-400" weight="fill" />
                <span class="font-bold text-amber-300 text-sm">Voorbeeld — Ik doe voor</span>
              </div>
              <p class="text-sm text-amber-200 font-bold mb-1">Bewering: <span class="text-white">{{ currentLevelData.workedExample.rule }}</span></p>
              <p class="text-sm text-slate-300 mb-1">{{ currentLevelData.workedExample.reason }}</p>
              <div class="bg-slate-900/50 p-3 rounded-lg border border-amber-700 mb-2">
                <p class="text-sm text-emerald-300 font-bold">Tegenvoorbeeld: <span class="text-emerald-200">{{ currentLevelData.workedExample.counterexample }}</span></p>
              </div>
              <p class="text-xs text-slate-400 italic">{{ currentLevelData.workedExample.method }}</p>
              <button @click="skipWorkedExample"
                      class="mt-3 w-full py-2 text-sm font-bold text-amber-400 bg-slate-800 border-2 border-amber-600 rounded-lg hover:bg-slate-700 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen! Zelf doen →
              </button>
            </div>

            <!-- PREDICTION GATE -->
            <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-700 bg-amber-900/20 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhLightbulb class="w-5 h-5 text-amber-400" weight="fill" />
                <span class="font-bold text-amber-300 text-sm">Voorspel</span>
              </div>
              <p class="text-sm text-slate-300 mb-3">Wat is een tegenvoorbeeld?</p>
              <div class="flex flex-col gap-2">
                <button v-for="opt in predictionOptions" :key="opt.id"
                        @click="predictedCategory = opt.id"
                        class="w-full py-2 px-3 rounded-lg font-bold text-sm transition-colors border-2 text-left focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        :class="predictedCategory === opt.id ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-700 border-slate-500 text-slate-300 hover:bg-slate-600'">
                  {{ opt.label }}
                </button>
              </div>
              <button v-if="predictedCategory" @click="checkPrediction"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <!-- WHY EXPLANATION -->
            <div v-if="showWhy && !showReflection" class="mt-4 p-4 bg-indigo-900/30 border border-indigo-700 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-indigo-400" weight="fill" />
                <span class="font-bold text-indigo-300 text-sm">Waarom is dit waar?</span>
              </div>
              <p class="text-sm text-indigo-200">{{ whyText }}</p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection" class="p-4 border border-indigo-700 bg-indigo-900/20 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhPencilSimpleLine class="w-5 h-5 text-indigo-400" weight="fill" />
                <span class="font-bold text-indigo-300 text-sm">Reflectie</span>
              </div>
              <p class="text-sm text-slate-300 mb-3">Waarom is één tegenvoorbeeld genoeg om een universele bewering te ontkrachten? Leg uit in je eigen woorden.</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                class="w-full p-3 border-2 border-indigo-600 rounded-lg text-sm bg-slate-800 text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-700 outline-none resize-none"
                rows="4" placeholder="Eén tegenvoorbeeld is genoeg omdat..."></textarea>
              <button v-if="!reflectionDone" @click="checkReflection"
                      :disabled="!reflectionAnswer.trim()"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
                Bevestig reflectie
              </button>
            </div>
          </div>

          <!-- BOTTOM CONTROLS -->
          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-900/50 text-amber-300 border border-amber-700': feedback.type === 'success',
                          'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error',
                          'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : feedback.type === 'error' ? PhWarningCircle : PhLightbulb"
                         class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug" v-html="feedback.text"></span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState"
                      class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-white shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <PhArrowClockwise />
              </button>

              <!-- Hint -->
              <button v-if="!showWorkedExample && !showPrediction && !showReflection && !isCorrect"
                      @click="showHint"
                      class="flex-1 py-4 font-bold text-slate-300 rounded-lg border-2 border-slate-600 bg-slate-800 hover:bg-slate-700 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none flex items-center justify-center gap-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                Hint ({{ 3 - hintCount }})
              </button>

              <button v-if="isCorrect && !showReflection" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-amber-500 hover:bg-amber-400 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Volgende stap' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <button v-if="isCorrect && showReflection && reflectionDone" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-amber-500 hover:bg-amber-400 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>Afronden</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL — Number Grid -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">

            <!-- The Rule -->
            <div class="relative mb-12 w-full max-w-3xl px-4">
              <div class="bg-slate-800 border-2 border-slate-600 px-8 py-6 rounded-xl shadow-md transition-all duration-700"
                   :class="ruleShattered ? 'opacity-30 scale-110 blur-sm rotate-3' : 'opacity-100 scale-100'">
                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2 text-center">Te ontkrachten bewering</p>
                <h1 class="text-xl md:text-3xl font-black text-center text-white font-mono">
                  {{ currentLevelData.rule }}
                </h1>
              </div>

              <!-- Shatter effect -->
              <div v-if="ruleShattered" class="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div class="w-full max-w-xl h-1.5 bg-amber-500 rotate-12 transform scale-150 animate-slash shadow-[0_0_20px_#fbbf24]"></div>
                <div class="absolute w-full max-w-xl h-1.5 bg-amber-500 -rotate-6 transform scale-150 animate-slash shadow-[0_0_20px_#fbbf24]" style="animation-delay: 0.1s"></div>
              </div>
            </div>

            <!-- Number Grid -->
            <div class="grid grid-cols-5 gap-3 p-6 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 shadow-md z-10 transition-opacity"
                 :class="ruleShattered ? 'opacity-50 pointer-events-none' : 'opacity-100'">
              <button v-for="num in numbers" :key="num"
                      @click="selectNumber(num)"
                      class="w-12 h-12 md:w-16 md:h-16 rounded-xl font-bold text-xl md:text-2xl flex items-center justify-center transition-all border-b-4 active:border-b-0 active:translate-y-1 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                      :class="selectedNumber === num ?
                                (isCorrect ? 'bg-amber-500 border-amber-700 text-white shadow-[0_0_20px_rgba(251,191,36,0.6)]' : 'bg-red-600 border-red-800 text-white animate-shake')
                                : 'bg-slate-700 border-slate-900 text-slate-200 hover:bg-amber-600 hover:text-white hover:border-amber-500'">
                {{ num }}
              </button>
            </div>

            <p v-if="ruleShattered" class="mt-8 text-xl font-bold text-amber-400 animate-fadeIn text-center">
              Regel ontkracht met tegenvoorbeeld: {{ selectedNumber }}
            </p>

          </div>
        </div>
      </main>
    </div>
  <SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel >= totalInternalLevels - 1 && reflectionDone" />
  </div>
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }

.bg-circuit-pattern {
    background-color: #0f172a;
    background-image: radial-gradient(#1e293b 1px, transparent 1px);
    background-size: 20px 20px;
}

.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.animate-shake {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.animate-slash {
    animation: slash 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    transform-origin: center;
}
@keyframes slash {
    0% { transform: scaleX(0); opacity: 1; }
    100% { transform: scaleX(1); opacity: 0.8; }
}

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; }
@keyframes ring-pulse-amber { 0% { box-shadow: 0 0 0 0 #fbbf24; } 70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); } 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); } }
</style>
