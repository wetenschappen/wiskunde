<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhBoundingBox, PhArrowClockwise,
  PhLightbulb, PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Classificatie: De Vierhoeken-Hiërarchie' },
  instruction: {
    type: String,
    default: 'Vierhoeken zitten in elkaar genest. Een vorm met strengere regels (zoals een vierkant) past binnen een vorm met minder regels (zoals een rechthoek).<br/><br/><strong>Opdracht:</strong> Is de uitspraak WAAR of VALS? Denk eerst goed na over de regels van elke figuur.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhBoundingBox }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Lees de uitspraak en klik op WAAR of VALS.' })
const attemptCount = ref(0)
const hintCount = ref(0)

// --- 8-element state ---
const showPrediction = ref(true)
const predictionAnswer = ref(null)
const predictionSubmitted = ref(false)
const showWorkedExample = ref(true)
const showWhy = ref(false)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionSubmitted = ref(false)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const statementPool = [
  {
    text: 'Elk vierkant is ook een rechthoek.',
    isTrue: true,
    inner: 'Vierkant', outer: 'Rechthoek',
    predictionQuestion: 'Denk eerst na: heeft een vierkant alle eigenschappen van een rechthoek?',
    predictionHint: 'Rechthoek: 4 rechte hoeken, overstaande zijden evenwijdig en gelijk. Vierkant: heeft dat allemaal?',
    workedExample: {
      title: 'Voorbeeld: Vierkant en Rechthoek',
      content: 'Rechthoek = vierhoek met 4 rechte hoeken, overstaande zijden evenwijdig en gelijk.<br/>Vierkant = rechthoek met ALLE vier zijden gelijk.<br/><br/>Omdat een vierkant alle regels van een rechthoek volgt, IS elk vierkant ook een rechthoek. Het is gewoon een "speciale" rechthoek.',
      property: 'Extra eigenschap vierkant: alle 4 zijden gelijk.'
    },
    hintLevels: [
      'Welke regels heeft een rechthoek? (Evenwijdige overstaande zijden, rechte hoeken...) Volgt het vierkant die allemaal?',
      'Een vierkant heeft rechte hoeken en evenwijdige zijden, net als een rechthoek. Het enige verschil: vierkant heeft een EXTRA regel (alle zijden gelijk).',
      'Rechthoek regels: 4 rechte __, overstaande zijden evenwijdig. Vierkant: heeft dit __ (wel/niet).'
    ],
    whyExplanation: 'Een vierkant heeft ALLE eigenschappen van een rechthoek (4 rechte hoeken, overstaande zijden evenwijdig en gelijk) PLUS de extra eigenschap dat alle zijden even lang zijn. Daarom is elk vierkant een speciale rechthoek.',
    reflectionQuestion: 'Welke extra eigenschap heeft een vierkant die niet alle rechthoeken hebben?',
    reflectionAnswer: 'Een vierkant heeft alle vier zijden even lang. Een rechthoek kan twee verschillende zijdelengtes hebben.',
    errorAnalysis: {
      falseAnswer: 'Niet elke rechthoek is een vierkant, maar elk vierkant IS een rechthoek. Een vierkant volgt ALLE regels van een rechthoek.'
    }
  },
  {
    text: 'Elke rechthoek is ook een vierkant.',
    isTrue: false,
    inner: 'Rechthoek', outer: 'Vierkant',
    predictionQuestion: 'Denk eerst na: heeft elke rechthoek alle vier de zijden even lang?',
    predictionHint: 'Stel je een breed, plat rechthoekig veld voor. Zijn breedte en hoogte gelijk?',
    workedExample: {
      title: 'Voorbeeld: Rechthoek en Vierkant',
      content: 'Vierkant = 4 rechte hoeken EN alle zijden gelijk.<br/>Rechthoek = 4 rechte hoeken, overstaande zijden gelijk.<br/><br/>Een rechthoek van 8 bij 3 heeft niet alle zijden gelijk, dus is het GEEN vierkant. Alleen rechthoeken met alle zijden gelijk zijn vierkanten.',
      property: 'Vierkant vereist: alle 4 zijden even lang.'
    },
    hintLevels: [
      'Om een vierkant te zijn, moeten ALLE vier zijden even lang zijn. Geldt dat voor elke rechthoek?',
      'Denk aan een breed, plat veld van 10 m bij 3 m. Heeft die alle zijden even lang? Nee. Dus is het geen vierkant.',
      'Een vierkant eist: alle __ zijden even lang. Een rechthoek van 5 bij 3 heeft dat __ (wel/niet).'
    ],
    whyExplanation: 'Een vierkant is een SPECIAAL geval van een rechthoek. Omgekeerd geldt het niet: een rechthoek hoeft geen vierkant te zijn. Een rechthoek van 5 bij 3 heeft twee korte en twee lange zijden, dus het is geen vierkant.',
    reflectionQuestion: 'Noem een rechthoek die geen vierkant is. Waarom niet?',
    reflectionAnswer: 'Bijv. een rechthoek van 6 bij 2 is geen vierkant omdat niet alle zijden even lang zijn.',
    errorAnalysis: {
      trueAnswer: 'Niet alle rechthoeken zijn vierkanten. Een vierkant heeft een EXTRA regel: alle zijden even lang. Alleen rechthoeken die ook aan die extra regel voldoen zijn vierkanten.'
    }
  },
  {
    text: 'Elke ruit is ook een vierkant.',
    isTrue: false,
    inner: 'Ruit', outer: 'Vierkant',
    predictionQuestion: 'Denk eerst na: heeft een ruit altijd rechte hoeken?',
    predictionHint: 'Een ruit heeft gelijke zijden, maar wat met de hoeken? Zijn die altijd 90°?',
    workedExample: {
      title: 'Voorbeeld: Ruit en Vierkant',
      content: 'Ruit = vierhoek met alle vier zijden gelijk (overstaande zijden evenwijdig).<br/>Vierkant = ruit met 4 rechte hoeken (90°).<br/><br/>Een ruit kan scheef staan: alle zijden even lang maar hoeken van bijv. 60° en 120°. Dan is het geen vierkant.',
      property: 'Vierkant vereist: 4 rechte hoeken van 90°.'
    },
    hintLevels: [
      'Een vierkant heeft rechte hoeken (90°). Heeft een ruit dat altijd? Of kunnen de hoeken anders zijn?',
      'Een ruit heeft gelijke zijden, maar de hoeken mogen verschillen van 90°. Denk aan een "scheve" ruit: alle zijden even lang, maar hoeken van 60° en 120°.',
      'Vierkant = ruit + __ hoeken (90°). Niet alle ruiten hebben rechte hoeken, dus niet alle ruiten zijn __.'
    ],
    whyExplanation: 'Een vierkant is een ruit met rechte hoeken. Een ruit heeft wel alle zijden gelijk (net als een vierkant), maar de hoeken mogen afwijken van 90°. Daarom is niet elke ruit een vierkant.',
    reflectionQuestion: 'Wat is het verschil tussen een ruit en een vierkant?',
    reflectionAnswer: 'Een vierkant heeft rechte hoeken (90°); een ruit kan scheve hoeken hebben.',
    errorAnalysis: {
      trueAnswer: 'Niet elke ruit is een vierkant. Hoewel beide gelijke zijden hebben, heeft een vierkant ook 4 rechte hoeken. Een ruit kan scheve hoeken hebben.'
    }
  },
  {
    text: 'Elk vierkant is ook een ruit.',
    isTrue: true,
    inner: 'Vierkant', outer: 'Ruit',
    predictionQuestion: 'Denk eerst na: heeft een vierkant alle eigenschappen van een ruit?',
    predictionHint: 'Ruit: alle vier zijden gelijk. Heeft een vierkant dat?',
    workedExample: {
      title: 'Voorbeeld: Vierkant en Ruit',
      content: 'Ruit = vierhoek met alle vier zijden gelijk.<br/>Vierkant = ruit met 4 rechte hoeken.<br/><br/>Een vierkant heeft alle zijden gelijk (ruit-eigenschap!) plus rechte hoeken. Dus elk vierkant is een bijzondere ruit.',
      property: 'Ruit vereist: alle 4 zijden gelijk. Vierkant heeft dat.'
    },
    hintLevels: [
      'Een ruit heeft gelijke zijden en overstaande evenwijdige zijden. Heeft een vierkant dat?',
      'Tel de eigenschappen: vierkant heeft alle zijden gelijk (ruit!), plus rechte hoeken. Het voldoet dus aan de regels van een ruit.',
      'Ruit: alle __ zijden gelijk, overstaande zijden evenwijdig. Vierkant: heeft dit __ (wel/niet).'
    ],
    whyExplanation: 'Een vierkant heeft alle vier zijden gelijk, wat de belangrijkste eigenschap van een ruit is. Daarnaast heeft het ook rechte hoeken. Omdat het aan de definitie van een ruit voldoet, is elk vierkant ook een ruit.',
    reflectionQuestion: 'Waarom is elk vierkant ook een ruit, maar niet omgekeerd?',
    reflectionAnswer: 'Omdat een vierkant alle regels van een ruit volgt (gelijke zijden) plus extra regels (rechte hoeken).'
  },
  {
    text: 'Elke rechthoek is ook een parallellogram.',
    isTrue: true,
    inner: 'Rechthoek', outer: 'Parallellogram',
    predictionQuestion: 'Denk eerst na: heeft een rechthoek evenwijdige overstaande zijden?',
    predictionHint: 'Parallellogram: overstaande zijden evenwijdig. Heeft een rechthoek dat?',
    workedExample: {
      title: 'Voorbeeld: Rechthoek en Parallellogram',
      content: 'Parallellogram = vierhoek met overstaande zijden evenwijdig.<br/>Rechthoek = parallellogram met 4 rechte hoeken.<br/><br/>Een rechthoek heeft overstaande zijden die evenwijdig zijn, dus het voldoet aan de definitie van een parallellogram.',
      property: 'Parallellogram vereist: overstaande zijden evenwijdig.'
    },
    hintLevels: [
      'Een parallellogram heeft overstaande zijden evenwijdig. Heeft een rechthoek dat? Ja, altijd.',
      'Een rechthoek is eigenlijk een "rechte" versie van een parallellogram. De overstaande zijden zijn evenwijdig, net als bij een parallellogram.',
      'Parallellogram: overstaande zijden evenwijdig. Rechthoek: __ __ __. Dus ja.'
    ],
    whyExplanation: 'Een rechthoek heeft overstaande zijden die evenwijdig zijn - dat is precies de definitie van een parallellogram. Het enige extra aan een rechthoek is dat alle hoeken 90° zijn. Dus een rechthoek is een "speciaal" parallellogram.',
    reflectionQuestion: 'Wat maakt een rechthoek anders dan een gewoon parallellogram?',
    reflectionAnswer: 'Een rechthoek heeft 4 rechte hoeken (90°), terwijl een parallellogram scheve hoeken mag hebben.',
    errorAnalysis: {
      falseAnswer: 'Een rechthoek heeft wél evenwijdige overstaande zijden. Het is dus een speciaal parallellogram. De omkering (elk parallellogram is een rechthoek) is niet waar.'
    }
  },
  {
    text: 'Elk parallellogram is ook een rechthoek.',
    isTrue: false,
    inner: 'Parallellogram', outer: 'Rechthoek',
    predictionQuestion: 'Denk eerst na: heeft elk parallellogram rechte hoeken?',
    predictionHint: 'Stel je een scheef parallellogram voor. Zijn de hoeken 90°?',
    workedExample: {
      title: 'Voorbeeld: Parallellogram en Rechthoek',
      content: 'Rechthoek = parallellogram met 4 rechte hoeken (90°).<br/>Parallellogram = vierhoek met overstaande zijden evenwijdig.<br/><br/>Een parallellogram mag scheef staan. De hoeken zijn dan geen 90°. Bijv. een parallellogram met hoeken van 70° en 110° is geen rechthoek.',
      property: 'Rechthoek vereist: 4 rechte hoeken.'
    },
    hintLevels: [
      'Een rechthoek vereist rechte hoeken (90°). Heeft een parallellogram dat altijd?',
      'Een parallellogram kan scheef staan. Hoeken van bijv. 60° en 120° zijn mogelijk. Dan zijn het geen rechte hoeken en is het geen rechthoek.',
      'Rechthoek: __ rechte hoeken. Parallellogram: overstaande zijden evenwijdig, maar hoeken mogen __ van 90° zijn.'
    ],
    whyExplanation: 'Een parallellogram heeft overstaande zijden evenwijdig, maar de hoeken hoeven geen 90° te zijn. Alleen parallellogrammen met 4 rechte hoeken zijn rechthoeken. De meeste parallellogrammen zijn "scheef".',
    reflectionQuestion: 'Wanneer is een parallellogram ook een rechthoek?',
    reflectionAnswer: 'Wanneer alle vier hoeken 90° zijn (rechte hoeken).',
    errorAnalysis: {
      trueAnswer: 'Niet elk parallellogram is een rechthoek. Een rechthoek vereist rechte hoeken. Een parallellogram kan scheve hoeken hebben.'
    }
  },
  {
    text: 'Elke ruit is ook een parallellogram.',
    isTrue: true,
    inner: 'Ruit', outer: 'Parallellogram',
    predictionQuestion: 'Denk eerst na: heeft een ruit overstaande zijden evenwijdig?',
    predictionHint: 'Parallellogram: overstaande zijden evenwijdig. Alle zijden van een ruit zijn gelijk... wat betekent dat voor evenwijdigheid?',
    workedExample: {
      title: 'Voorbeeld: Ruit en Parallellogram',
      content: 'Parallellogram = vierhoek met overstaande zijden evenwijdig.<br/>Ruit = parallellogram met alle vier zijden gelijk.<br/><br/>Een ruit heeft overstaande zijden die evenwijdig zijn (de gelijke zijden zorgen daarvoor). Dus elke ruit is een speciaal parallellogram.',
      property: 'Ruit = parallellogram met alle zijden gelijk.'
    },
    hintLevels: [
      'Een parallellogram heeft overstaande zijden evenwijdig. Heeft een ruit dat? (Hint: alle zijden zijn even lang.)',
      'Een ruit heeft alle zijden gelijk. Daardoor zijn overstaande zijden automatisch evenwijdig, net als bij een parallellogram.',
      'Ruit: alle __ zijden gelijk, overstaande zijden evenwijdig. Parallellogram: __ __ __. Dus ja.'
    ],
    whyExplanation: 'Een ruit heeft alle vier zijden gelijk. Daardoor zijn overstaande zijden altijd evenwijdig aan elkaar, wat precies de definitie van een parallellogram is. Een ruit is dus altijd een bijzonder parallellogram.',
    reflectionQuestion: 'Wat is het verschil tussen een ruit en een parallellogram?',
    reflectionAnswer: 'Een ruit heeft alle vier zijden gelijk; een parallellogram hoeft alleen overstaande zijden evenwijdig te hebben.',
    errorAnalysis: {
      falseAnswer: 'Een ruit heeft overstaande zijden die evenwijdig zijn. Het is dus een speciaal parallellogram (met alle zijden gelijk).'
    }
  }
]

const shuffledPool = ref([])

function initLevels() {
  const shuffled = [...statementPool].sort(() => Math.random() - 0.5)
  shuffledPool.value = shuffled.slice(0, 3)
}

const currentLevelData = computed(() => shuffledPool.value[currentInternalLevel.value])

const userAns = ref(null)

function answerPrediction(val) {
  predictionAnswer.value = val
  predictionSubmitted.value = true
  feedback.value = { type: 'info', text: 'Denk aan je antwoord terwijl je het voorbeeld bekijkt.' }
}

function dismissWorkedExample() {
  showWorkedExample.value = false
  feedback.value = { type: 'info', text: 'Klik op WAAR of VALS.' }
}

function checkAnswer(ans) {
  if (isCorrect.value) return
  userAns.value = ans
  isChecked.value = true
  const data = currentLevelData.value

  if (ans === data.isTrue) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = { type: 'success', text: `Correct! De ${data.inner} volgt alle regels van de ${data.outer}.` }
    showWhy.value = true
  } else {
    isCorrect.value = false
    attemptCount.value++

    if (attemptCount.value === 1) {
      // Error analysis
      if (data.isTrue) {
        feedback.value = { type: 'error', text: data.errorAnalysis.falseAnswer || `Fout. De ${data.inner} volgt wél alle regels van de ${data.outer}.` }
      } else {
        feedback.value = { type: 'error', text: data.errorAnalysis.trueAnswer || `Fout. De ${data.outer} is strenger dan de ${data.inner}.` }
      }
    } else if (attemptCount.value === 2) {
      feedback.value = { type: 'error', text: data.hintLevels[0] }
    } else {
      feedback.value = { type: 'error', text: data.hintLevels[1] }
    }
  }
}

function showHint() {
  hintCount.value++
  const data = currentLevelData.value
  if (data && data.hintLevels) {
    const idx = Math.min(hintCount.value - 1, data.hintLevels.length - 1)
    if (idx >= 0) {
      feedback.value = { type: 'info', text: data.hintLevels[idx] }
    }
  }
}

function submitReflection() {
  if (reflectionAnswer.value.trim().length > 3) {
    reflectionSubmitted.value = true
  }
}

function resetActivityState() {
  initLevels()
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintCount.value = 0
  feedback.value = { type: 'info', text: 'Lees de uitspraak en klik op WAAR of VALS.' }
  userAns.value = null
  showPrediction.value = true
  predictionAnswer.value = null
  predictionSubmitted.value = false
  showWorkedExample.value = true
  showWhy.value = false
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionSubmitted.value = false
}

function handleNext() {
  if (showWhy.value && !showReflection.value) {
    showReflection.value = true
    return
  }
  if (showReflection.value && !reflectionSubmitted.value) {
    return
  }
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    initLevels()
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
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
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Achtergrond sluiten"></div>
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
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <!-- PREDICTION GATE -->
            <div v-if="showPrediction" class="animate-fadeIn">
              <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Voorspelling</h3>
              <div class="p-5 bg-amber-50 border border-amber-200 rounded-xl shadow-sm mb-4">
                <div class="flex items-start gap-3 mb-3">
                  <PhQuestion weight="fill" class="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p class="font-bold text-slate-800 text-base">{{ currentLevelData.predictionQuestion }}</p>
                    <p class="text-sm text-slate-500 italic mt-1">{{ currentLevelData.predictionHint }}</p>
                  </div>
                </div>
                <div class="flex gap-3">
                  <button @click="answerPrediction(true)"
                          class="flex-1 py-3 rounded-lg font-bold border-2 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="predictionAnswer === true ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-300'">
                    Ja
                  </button>
                  <button @click="answerPrediction(false)"
                          class="flex-1 py-3 rounded-lg font-bold border-2 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="predictionAnswer === false ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-300'">
                    Nee
                  </button>
                </div>
              </div>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="showWorkedExample && predictionSubmitted" class="animate-fadeIn">
              <div class="p-4 bg-amber-50 border border-amber-300 rounded-xl shadow-sm mb-4">
                <h4 class="font-bold text-amber-800 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                  <PhLightbulb weight="fill" class="w-4 h-4" /> {{ currentLevelData.workedExample.title }}
                </h4>
                <MathText :content="currentLevelData.workedExample.content" class="text-sm text-slate-700 prose prose-sm" />
                <div class="mt-3 p-2 bg-white border border-amber-200 rounded-lg text-xs font-medium text-amber-800">
                  {{ currentLevelData.workedExample.property }}
                </div>
              </div>
              <button @click="dismissWorkedExample"
                      class="w-full py-2.5 rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-400 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500">
                Begrepen! Beoordeel de uitspraak
              </button>
            </div>

            <!-- MAIN ACTIVITY -->
            <div v-if="!showPrediction && !showWorkedExample">
              <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
              <MathText :content="instruction" class="mb-4 prose prose-sm text-slate-600" />

              <button @click="showHint" :disabled="isCorrect"
                      class="w-full mb-3 py-2 rounded-lg font-bold text-sm bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-500"
                      :class="isCorrect ? 'opacity-50 cursor-not-allowed' : ''">
                <PhLightbulb weight="fill" class="w-4 h-4 text-amber-500" />
                Hint {{ hintCount > 0 ? hintCount : '' }}
              </button>

              <div class="p-4 border border-amber-200 bg-amber-50 rounded-xl shadow-sm text-center animate-fadeIn">
                <span class="text-xs font-bold text-amber-800 uppercase tracking-widest block mb-2">Uitspraak {{ currentInternalLevel + 1 }}</span>
                <p class="font-bold text-lg text-slate-800 mb-5 bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                  "{{ currentLevelData.text }}"
                </p>
                <div class="flex gap-3">
                  <button @click="checkAnswer(true)" :disabled="isCorrect"
                          class="flex-1 py-4 rounded-lg font-bold text-base transition-colors border-2 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="userAns === true ? (userAns === currentLevelData.isTrue ? 'bg-amber-500 border-amber-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-300'">
                    WAAR
                  </button>
                  <button @click="checkAnswer(false)" :disabled="isCorrect"
                          class="flex-1 py-4 rounded-lg font-bold text-base transition-colors border-2 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="userAns === false ? (userAns === currentLevelData.isTrue ? 'bg-amber-500 border-amber-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-300'">
                    VALS
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom bar -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-100 text-amber-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-slate-100 text-slate-700': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>

            <div v-if="showWhy" class="p-3 mb-3 bg-amber-50 border border-amber-200 rounded-lg animate-fadeIn">
              <p class="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Waarom is dit zo?</p>
              <p class="text-sm text-slate-700 leading-relaxed">{{ currentLevelData.whyExplanation }}</p>
            </div>

            <div v-if="showReflection" class="p-3 mb-3 bg-slate-100 border border-slate-200 rounded-lg animate-fadeIn">
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reflectie</p>
              <p class="text-sm font-medium text-slate-800 mb-2">{{ currentLevelData.reflectionQuestion }}</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionSubmitted"
                        class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                        rows="2" placeholder="Typ je antwoord..."></textarea>
              <button v-if="!reflectionSubmitted" @click="submitReflection"
                      class="mt-2 px-4 py-1.5 text-sm font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500">
                Bevestig
              </button>
              <p v-if="reflectionSubmitted" class="text-xs text-slate-500 mt-1 italic">Goed nagedacht!</p>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500">
                <PhArrowClockwise />
              </button>
              <button v-if="isCorrect" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 text-sm">
                <span v-if="showWhy && !showReflection">Bekijk uitleg</span>
                <span v-else-if="showReflection && !reflectionSubmitted">Reflecteer eerst</span>
                <span v-else>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <!-- Right panel: Nesting visualization -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

            <div v-if="currentLevelData" class="w-full h-full flex flex-col items-center justify-center relative animate-fadeIn">

              <!-- Statement display -->
              <div class="mb-6 p-4 bg-white rounded-xl shadow-sm border-2 border-slate-200 max-w-md text-center">
                <p class="text-base font-bold text-slate-800">
                  "{{ currentLevelData.text }}"
                </p>
              </div>

              <!-- Nesting visualization -->
              <div class="w-72 h-72 relative">
                <!-- Outer box -->
                <div class="absolute inset-0 border-4 border-slate-600 bg-white rounded-xl shadow-md flex items-start justify-center pt-4 transition-all duration-1000"
                     :class="isChecked ? (currentLevelData.isTrue ? 'border-amber-500 bg-amber-50' : 'border-red-400 bg-red-50') : ''">
                  <span class="font-black text-xl text-slate-700 uppercase tracking-widest mt-2">{{ currentLevelData.outer }}</span>
                </div>

                <!-- Inner floating box -->
                <div class="w-48 h-48 border-4 border-amber-400 bg-amber-50 rounded-xl shadow-md flex items-center justify-center absolute transition-all duration-1000 ease-in-out"
                     :class="isChecked && currentLevelData.isTrue ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]' : 'top-6 left-6 translate-x-0'">
                  <span class="font-black text-lg text-amber-700 uppercase tracking-widest text-center px-2">{{ currentLevelData.inner }}</span>

                  <!-- X mark when statement is false -->
                  <div v-if="isChecked && !currentLevelData.isTrue" class="absolute inset-0 flex items-center justify-center pointer-events-none animate-fadeIn">
                    <PhX weight="bold" class="w-28 h-28 text-red-400/60" />
                  </div>

                  <!-- Checkmark when nested correctly -->
                  <div v-if="isChecked && currentLevelData.isTrue" class="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                    <PhCheckCircle weight="fill" class="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <!-- Legend -->
              <div v-if="isChecked" class="mt-6 flex items-center gap-4 text-sm animate-fadeIn">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-0.5 bg-amber-500"></div>
                  <span class="text-slate-600">{{ currentLevelData.isTrue ? 'Past in' : 'Past niet in' }} de buitenste figuur</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone && !showWhy" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
