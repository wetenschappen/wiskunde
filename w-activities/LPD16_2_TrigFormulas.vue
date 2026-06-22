<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhSwap,
  PhArrowClockwise,
  PhLightbulb,
  PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Verwante Hoeken'
  },
  instruction: {
    type: String,
    default: 'Draai hoek B naar de juiste positie op de eenheidscirkel om de symmetrie met hoek α te ontdekken.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSwap }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

const attemptCount = ref(0)
const levels = ref([])
const baseAngle = ref(40)

// --- 8-element additions ---
const showPrediction = ref(false)
const predictUserAns = ref(null)
const predictionDone = ref(false)
const showReflection = ref(false)
const reflectAns = ref('')
const reflectDone = ref(false)
const workedExampleShown = ref(false)

function generateLevel() {
  const base = (20 + Math.floor(Math.random() * 7) * 5)

  const target1 = 360 - base
  const target2 = 180 - base
  const target3 = 180 + base

  baseAngle.value = base

  levels.value = [
    {
      name: 'Tegengestelde Hoek (-α)',
      goalText: `Opdracht 1: Draai hoek B naar de tegengestelde hoek (-α).`,
      targetAngle: target1,
      validate: (a) => a === target1,
      successText: 'Correct! cos(360°-α) = cos(α) en sin(360°-α) = -sin(α). De tegengestelde hoek is een spiegeling over de x-as.',
      hintLevels: [
        'De tegengestelde hoek klapt de driehoek omlaag over de x-as. De x-coördinaat (cosinus) blijft hetzelfde, de y-coördinaat (sinus) wordt negatief.',
        `Als α = ${base}°, dan spiegelen we over de x-as. cos(${base}°) ≈ ${Math.cos(base * Math.PI / 180).toFixed(2)}. Zoek de hoek waar cos dezelfde waarde heeft.`,
        `360° - ${base}° = __° (de cirkel rond tot vlak voor 360°)`
      ]
    },
    {
      name: 'Supplementaire Hoek (180° - α)',
      goalText: `Opdracht 2: Draai hoek B naar de supplementaire hoek (180° - α).`,
      targetAngle: target2,
      validate: (a) => a === target2,
      successText: 'Juist! sin(180°-α) = sin(α) maar cos(180°-α) = -cos(α). De supplementaire hoek is een spiegeling over de y-as.',
      hintLevels: [
        'Supplementair = samen 180°. Spiegelen over de y-as: de y-coördinaat (sinus) blijft gelijk, de x-coördinaat (cosinus) wordt negatief.',
        `Als α = ${base}°, dan is 180° - ${base}° = ?. Wat gebeurt er met cos en sin bij deze spiegeling?`,
        `180° - ${base}° = __°`
      ]
    },
    {
      name: 'Anti-Supplementaire Hoek (180° + α)',
      goalText: `Opdracht 3: Draai hoek B naar (180° + α).`,
      targetAngle: target3,
      validate: (a) => a === target3,
      successText: 'Perfect! sin(180°+α) = -sin(α) en cos(180°+α) = -cos(α). Zowel sinus als cosinus wisselen van teken — dit is een spiegeling door de oorsprong.',
      hintLevels: [
        '180° + α betekent een halve draai (180°) extra. De x én y coördinaten worden negatief.',
        `Tel 180° op bij α = ${base}°: ${base}° + 180° = ?. Welk teken krijgen cos en sin?`,
        `${base}° + 180° = __°`
      ]
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Interactive State for Angle B
const userAngle = ref(0)

const alphaRad = computed(() => baseAngle.value * (Math.PI / 180))
const betaRad = computed(() => userAngle.value * (Math.PI / 180))

const cosAlpha = computed(() => Math.cos(alphaRad.value))
const sinAlpha = computed(() => Math.sin(alphaRad.value))

const cosBeta = computed(() => Math.cos(betaRad.value))
const sinBeta = computed(() => Math.sin(betaRad.value))

function showPredictionGate() {
  showPrediction.value = true
  predictUserAns.value = null
  feedback.value = { type: 'info', text: '' }
}

function submitPrediction() {
  if (predictUserAns.value === null) return
  showPrediction.value = false
  predictionDone.value = true
  workedExampleShown.value = true

  const level = currentInternalLevel.value
  const base = baseAngle.value

  if (level === 0) {
    if (predictUserAns.value === 0) {
      feedback.value = { type: 'info', text: `Je vermoedt dat sin(-α) = 0 of cos(-α) = 0? Laten we kijken!` }
    } else {
      feedback.value = { type: 'info', text: `Je voorspelling: de tegengestelde hoek heeft invloed op het teken. Schuif de slider om te ontdekken hoe.` }
    }
  } else if (level === 1) {
    feedback.value = { type: 'info', text: `We gaan de supplementaire hoek voor α = ${base}° ontdekken. Wat gebeurt er met cos en sin?` }
  } else {
    feedback.value = { type: 'info', text: `Nu de anti-supplementaire hoek. Wat gebeurt er met de tekens van cos en sin?` }
  }
}

function submitReflection() {
  if (reflectAns.value.trim().length > 0) {
    reflectDone.value = true
  }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: '' }
  userAngle.value = 0
  showPrediction.value = false
  predictUserAns.value = null
  predictionDone.value = false
  showReflection.value = false
  reflectAns.value = ''
  reflectDone.value = false
  workedExampleShown.value = false
  generateLevel()
  // Show prediction at start of each level
  nextTick(() => { showPredictionGate() })
}

// Watch for correct angle match - auto detect
watch(userAngle, (newAngle) => {
  if (isCorrect.value || !currentLevelData.value) return
  if (currentLevelData.value.validate(newAngle)) {
    isCorrect.value = true
    const level = currentInternalLevel.value
    const base = baseAngle.value
    let whyText = ''
    if (level === 0) {
      whyText = `<br><br><strong>Waarom?</strong> De tegengestelde hoek (-α) is een spiegeling over de x-as. De x-coördinaat (cosinus) blijft behouden, maar de y-coördinaat (sinus) wordt negatief. Daarom: cos(-α) = cos(α) en sin(-α) = -sin(α). Let op bij supplementaire hoeken (180° - α): dit is een spiegeling over de y-as, dus enkel cosinus verandert van teken. Bij anti-supplementaire (180° + α): beide veranderen — een spiegeling door de oorsprong.`
    } else if (level === 1) {
      whyText = `<br><br><strong>Waarom?</strong> Supplementaire hoeken (180° - α) zijn een spiegeling over de y-as. De y-coördinaat (sinus) blijft behouden, de x-coördinaat (cosinus) wordt negatief. Dit is anders dan bij de tegengestelde hoek (-α), waar enkel sinus van teken verandert. Het is belangrijk deze twee niet te verwarren!`
    } else {
      whyText = `<br><br><strong>Waarom?</strong> Bij anti-supplementaire hoeken (180° + α) draaien we 180° bij — een spiegeling door de oorsprong. Beide coördinaten worden negatief. Dit combineert de effecten van de tegengestelde en supplementaire hoek.`
    }
    feedback.value = {
      type: 'success',
      text: currentLevelData.value.successText + whyText
    }
    showReflection.value = true
  } else if (!isChecked.value && newAngle !== 0 && !showPrediction.value) {
    attemptCount.value++
    const hints = currentLevelData.value.hintLevels || []
    if (attemptCount.value >= 5) {
      const hintIdx = Math.min(Math.floor((attemptCount.value - 1) / 3), hints.length - 1)
      feedback.value = {
        type: 'error',
        text: `Niet juist. ${hints[hintIdx] || 'Probeer een andere hoek.'}`
      }
    }
  }
})

function handleNext() {
  if (!reflectDone.value && showReflection.value) {
    feedback.value = { type: 'info', text: 'Beantwoord eerst de vraag: waarom verschillen de tekens tussen supplementaire en anti-supplementaire hoeken?' }
    return
  }
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) {
      emit('update:currentStep', props.currentStep + 1)
    } else {
      emit('complete')
    }
  }
}

// Check if this is the first time opening a level
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>

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
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-amber-50 p-5 border border-amber-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-amber-800 text-lg">{{ currentLevelData.name }}</p>
              <p class="text-sm text-amber-700 mt-2">{{ currentLevelData.goalText }}</p>
            </div>

            <!-- PREDICTION GATE -->
            <div v-if="showPrediction" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Voorspel!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3" v-if="currentInternalLevel === 0">
                Bij de tegengestelde hoek (-α), wat gebeurt er met <strong>cos(180°-α)</strong> vergeleken met cos(α)?
              </p>
              <p class="text-sm text-amber-800 mb-3" v-else-if="currentInternalLevel === 1">
                Wat denk je: bij supplementaire hoeken (180°-α), wat gebeurt er met sin(180°-α) vergeleken met sin(α)?
              </p>
              <p class="text-sm text-amber-800 mb-3" v-else>
                Bij anti-supplementaire hoeken (180°+α): wat gebeurt er met zowel cos als sin?
              </p>
              <div class="flex flex-wrap gap-2">
                <button @click="() => { predictUserAns = 'same'; submitPrediction() }"
                        class="px-4 py-2 text-sm font-bold bg-white border-2 border-amber-300 rounded-lg hover:bg-amber-100 transition-all focus-visible:ring-2 focus-visible:ring-amber-500">
                  Beide blijven gelijk
                </button>
                <button @click="() => { predictUserAns = 'cos'; submitPrediction() }"
                        class="px-4 py-2 text-sm font-bold bg-white border-2 border-amber-300 rounded-lg hover:bg-amber-100 transition-all focus-visible:ring-2 focus-visible:ring-amber-500">
                  Enkel cos verandert
                </button>
                <button @click="() => { predictUserAns = 'sin'; submitPrediction() }"
                        class="px-4 py-2 text-sm font-bold bg-white border-2 border-amber-300 rounded-lg hover:bg-amber-100 transition-all focus-visible:ring-2 focus-visible:ring-amber-500">
                  Enkel sin verandert
                </button>
                <button @click="() => { predictUserAns = 'both'; submitPrediction() }"
                        class="px-4 py-2 text-sm font-bold bg-white border-2 border-amber-300 rounded-lg hover:bg-amber-100 transition-all focus-visible:ring-2 focus-visible:ring-amber-500">
                  Beide veranderen
                </button>
              </div>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="workedExampleShown && !showPrediction && !showReflection && !isCorrect" class="p-4 border border-amber-200 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                <span class="font-bold text-amber-700 text-sm">Voorbeeld met α = 40°</span>
              </div>
              <p class="text-xs text-amber-700 leading-relaxed">
                <span v-if="currentInternalLevel === 0">
                  De <strong>tegengestelde hoek</strong> van 40° is 360° - 40° = 320°.<br>
                  cos(40°) ≈ 0,77 en cos(320°) ≈ 0,77 (zelfde x-waarde)<br>
                  sin(40°) ≈ 0,64 en sin(320°) ≈ -0,64 (y-waarde wordt negatief)<br>
                  <span class="font-bold">Dus: cos(-α) = cos(α) en sin(-α) = -sin(α)</span><br>
                  <span class="text-amber-600">Dit is een spiegeling over de x-as. Alleen sin verandert van teken.</span>
                </span>
                <span v-else-if="currentInternalLevel === 1">
                  De <strong>supplementaire hoek</strong> van 40° is 180° - 40° = 140°.<br>
                  cos(40°) ≈ 0,77 en cos(140°) ≈ -0,77 (x-waarde wordt negatief)<br>
                  sin(40°) ≈ 0,64 en sin(140°) ≈ 0,64 (zelfde y-waarde)<br>
                  <span class="font-bold">Dus: cos(180°-α) = -cos(α) en sin(180°-α) = sin(α)</span><br>
                  <span class="text-amber-600">Let op: dit is een spiegeling over de y-as. Enkel cos verandert! Anders dan bij tegengestelde hoek (-α).</span>
                </span>
                <span v-else>
                  De <strong>anti-supplementaire hoek</strong> van 40° is 180° + 40° = 220°.<br>
                  cos(40°) ≈ 0,77 en cos(220°) ≈ -0,77 (x wordt negatief)<br>
                  sin(40°) ≈ 0,64 en sin(220°) ≈ -0,64 (y wordt ook negatief)<br>
                  <span class="font-bold">Dus: cos(180°+α) = -cos(α) en sin(180°+α) = -sin(α)</span><br>
                  <span class="text-amber-600">Dit is een spiegeling door de oorsprong. Beide veranderen!</span>
                </span>
              </p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection && !reflectDone" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Denk na!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                <span v-if="currentInternalLevel === 0">
                  Waarom blijft cosinus gelijk bij de tegengestelde hoek (-α) maar verandert wel bij de supplementaire hoek (180°-α)?<br>
                  <span class="text-xs text-slate-500">Denk aan de spiegeling: over welke as wordt er gespiegeld?</span>
                </span>
                <span v-else-if="currentInternalLevel === 1">
                  Waarom is sin(180°-α) = sin(α) maar sin(-α) = -sin(α)?<br>
                  <span class="text-xs text-slate-500">Wat is het verschil tussen een spiegeling over de y-as en over de x-as?</span>
                </span>
                <span v-else>
                  Waarom veranderen bij 180°+α beide tekens, maar bij -α enkel de sinus?<br>
                  <span class="text-xs text-slate-500">Hoe hangt dit samen met de symmetrie van de eenheidscirkel?</span>
                </span>
              </p>
              <textarea v-model="reflectAns" rows="2"
                        class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                        :placeholder="currentInternalLevel === 0 ? 'Bij tegengesteld spiegelen we over de x-as...' : currentInternalLevel === 1 ? 'Bij supplementair spiegelen we over de y-as...' : 'Bij anti-supplementair draaien we 180°...'"></textarea>
              <button @click="submitReflection" :disabled="reflectAns.trim().length === 0"
                      class="mt-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig
              </button>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner space-y-6">
              <!-- Alpha reference -->
              <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                <span class="font-bold text-slate-600">Referentie hoek α</span>
                <span class="font-mono font-bold text-slate-800">{{ baseAngle }}°</span>
              </div>

              <!-- Interactive Beta slider -->
              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Verwante hoek B: <span class="text-amber-600 font-mono text-lg">{{ userAngle }}°</span></label>
                <input type="range" v-model.number="userAngle" min="0" max="360" step="5" class="w-full accent-amber-500">
              </div>

              <!-- Live Comparison -->
              <div class="grid grid-cols-2 gap-4">
                 <div class="bg-white p-4 rounded-lg border border-slate-200 text-center shadow-sm">
                   <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">sin(α)</div>
                   <div class="font-mono text-sm text-slate-800">{{ sinAlpha.toFixed(2) }}</div>
                   <div class="h-px w-full bg-slate-200 my-2"></div>
                   <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">sin(B)</div>
                   <div class="font-mono text-sm text-amber-600">{{ sinBeta.toFixed(2) }}</div>
                 </div>

                 <div class="bg-white p-4 rounded-lg border border-slate-200 text-center shadow-sm">
                   <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">cos(α)</div>
                   <div class="font-mono text-sm text-slate-800">{{ cosAlpha.toFixed(2) }}</div>
                   <div class="h-px w-full bg-slate-200 my-2"></div>
                   <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">cos(B)</div>
                   <div class="font-mono text-sm text-amber-600">{{ cosBeta.toFixed(2) }}</div>
                 </div>
              </div>
            </div>

          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{
                   'bg-amber-100 text-amber-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-amber-50 text-amber-700': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed" v-html="feedback.text"></span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                 <PhArrowClockwise />
              </button>

              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <svg width="450" height="450" viewBox="-150 -150 300 300" class="overflow-visible bg-white rounded-full shadow-inner border-4 border-slate-200 z-10">

                <!-- Inner grid subtle -->
                <g stroke="#f1f5f9" stroke-width="1">
                  <line v-for="i in 11" :key="'v'+i" :x1="(i-6)*20" y1="-100" :x2="(i-6)*20" y2="100" />
                  <line v-for="i in 11" :key="'h'+i" x1="-100" :y1="(i-6)*20" x2="100" :y2="(i-6)*20" />
                </g>

                <!-- Axes -->
                <line x1="-130" y1="0" x2="130" y2="0" stroke="#94a3b8" stroke-width="2" />
                <line x1="0" y1="-130" x2="0" y2="130" stroke="#94a3b8" stroke-width="2" />

                <!-- Circle R=100 -->
                <circle cx="0" cy="0" r="100" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4" />

                <!-- ALPHA (Reference angle, fixed) -->
                <g opacity="0.4">
                   <line x1="0" y1="0" :x2="100 * cosAlpha" :y2="-100 * sinAlpha" stroke="#64748b" stroke-width="3" />
                   <line :x1="100 * cosAlpha" y1="0" :x2="100 * cosAlpha" :y2="-100 * sinAlpha" stroke="#64748b" stroke-width="2" stroke-dasharray="2,2" />
                   <line x1="0" :y1="-100 * sinAlpha" :x2="100 * cosAlpha" :y2="-100 * sinAlpha" stroke="#64748b" stroke-width="2" stroke-dasharray="2,2" />
                   <circle :cx="100 * cosAlpha" :cy="-100 * sinAlpha" r="5" fill="#64748b" />
                   <text :x="100 * cosAlpha + 10" :y="-100 * sinAlpha - 10" font-weight="bold" fill="#64748b">α</text>
                </g>

                <!-- BETA (User angle, interactive) -->
                <g class="transition-all duration-100">
                   <line x1="0" y1="0" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />
                   <line :x1="100 * cosBeta" y1="0" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4,4" />
                   <line x1="0" :y1="-100 * sinBeta" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4,4" />
                   <circle :cx="100 * cosBeta" :cy="-100 * sinBeta" r="8" fill="#f59e0b" stroke="white" stroke-width="2" class="shadow-sm" />
                   <text :x="100 * cosBeta + 12" :y="-100 * sinBeta - 12" font-weight="bold" fill="#f59e0b">B</text>
                </g>

                <!-- Highlight Visual Alignment if Correct -->
                <g v-if="isCorrect" class="animate-fadeIn">
                   <line :x1="100 * cosAlpha" :y1="-100 * sinAlpha" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#d97706" stroke-width="4" stroke-linecap="round" stroke-dasharray="6,6" />
                </g>

              </svg>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }

.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}

.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
