<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhLightbulb, PhSteps, PhProhibit, PhShieldCheck, PhPuzzlePiece,
  PhTarget, PhBrain
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

const currentMode = ref(props.initialMode)
const currentStep = ref(0)

const proofType = ref('direct')
const proofSteps = ref([])
const availableSteps = ref([])
const proofCompleted = ref(false)
const proofFeedback = ref('')

const statementIndex = ref(0)
const userCounterexample = ref('')
const counterexampleChecked = ref(false)
const counterexampleCorrect = ref(false)

const challengeActive = ref(false)
const challengeType = ref('')
const challengeFeedback = ref('')
const challengeSolved = ref(false)
const selectedAnswer = ref(null)

const proofTemplates = {
  direct: {
    title: 'Direct bewijs',
    description: 'Bewijs door logische afleiding vanuit de gegevens',
    structure: ['gegeven', 'te_bewijzen', 'bewijs', 'gevolg'],
    steps: [
      { id: 'g1', type: 'gegeven', text: 'Neem aan dat n een even getal is', latex: 'n is even' },
      { id: 'g2', type: 'gegeven', text: 'Neem aan dat n een oneven getal is', latex: 'n is oneven' },
      { id: 'tb1', type: 'te_bewijzen', text: 'Te bewijzen: n² is even', latex: 'n² is even' },
      { id: 'tb2', type: 'te_bewijzen', text: 'Te bewijzen: n² is deelbaar door 4', latex: '4 | n²' },
      { id: 'b1', type: 'bewijs', text: 'Dan is n = 2k voor zekere k in Z', latex: 'n = 2k, k in Z' },
      { id: 'b2', type: 'bewijs', text: 'Dus n² = (2k)² = 4k²', latex: 'n² = (2k)² = 4k²' },
      { id: 'b3', type: 'bewijs', text: 'Dan is n = 2k + 1 voor zekere k in Z', latex: 'n = 2k + 1' },
      { id: 'b4', type: 'bewijs', text: 'Dus n² = 4k² + 4k + 1', latex: 'n² = 2(2k² + 2k) + 1' },
      { id: 'gv1', type: 'gevolg', text: 'Dus n² is even', latex: 'dus n² is even' },
      { id: 'gv2', type: 'gevolg', text: 'Dus n² is oneven', latex: 'dus n² is oneven' }
    ]
  },
  contradiction: {
    title: 'Bewijs uit het ongerijmde',
    description: 'Bewijs door aanname van het tegendeel te weerleggen',
    structure: ['aanname', 'afleiding', 'tegenspraak', 'conclusie'],
    steps: [
      { id: 'a1', type: 'aanname', text: 'Stel dat wortel(2) rationaal is', latex: 'Stel: wortel(2) in Q' },
      { id: 'a2', type: 'aanname', text: 'Stel dat er een grootste priemgetal is', latex: 'Er is een max priem' },
      { id: 'af1', type: 'afleiding', text: 'Dan wortel(2) = p/q met p,q copriem', latex: 'wortel(2) = p/q' },
      { id: 'af2', type: 'afleiding', text: 'Dan 2 = p²/q² dus p² = 2q²', latex: '2 = p²/q²' },
      { id: 'af3', type: 'afleiding', text: 'Dus p² is even, dus p is even', latex: 'p² even => p even' },
      { id: 'af4', type: 'afleiding', text: 'Dus p = 2k, dus 4k² = 2q²', latex: 'p = 2k' },
      { id: 'af5', type: 'afleiding', text: 'Dus q² = 2k², dus q is even', latex: 'q even' },
      { id: 'ts1', type: 'tegenspraak', text: 'Tegenspraak: p en q zijn beide even', latex: 'ggd(p,q) >= 2' },
      { id: 'ts2', type: 'tegenspraak', text: 'Tegenspraak met copriem-aanname', latex: 'Tegenspraak!' },
      { id: 'c1', type: 'conclusie', text: 'Dus wortel(2) is irrationaal', latex: 'wortel(2) niet in Q' }
    ]
  },
  counterexample: {
    title: 'Tegenvoorbeeld',
    description: 'Toon aan dat een uitspraak niet altijd geldt',
    structure: ['uitspraak', 'tegenvoorbeeld', 'verificatie'],
    steps: [
      { id: 'u1', type: 'uitspraak', text: 'Alle priemgetallen zijn oneven', latex: 'Alle priemgetallen zijn oneven' },
      { id: 'u2', type: 'uitspraak', text: 'n² > n voor alle n in N', latex: 'n² > n voor alle n' },
      { id: 'u3', type: 'uitspraak', text: 'Als n|ab dan n|a of n|b', latex: 'n|ab => n|a of n|b' },
      { id: 'tv1', type: 'tegenvoorbeeld', text: 'Tegenvoorbeeld: n = 2', latex: 'n = 2' },
      { id: 'tv2', type: 'tegenvoorbeeld', text: 'Tegenvoorbeeld: n = 0 of n = 1', latex: 'n = 0 of 1' },
      { id: 'tv3', type: 'tegenvoorbeeld', text: 'Tegenvoorbeeld: n = 6, a = 2, b = 3', latex: 'n=6, a=2, b=3' },
      { id: 'v1', type: 'verificatie', text: '2 is priem en even', latex: '2 is priem en even' },
      { id: 'v2', type: 'verificatie', text: '0² = 0 en 1² = 1', latex: '0² = 0, 1² = 1' },
      { id: 'v3', type: 'verificatie', text: '6|6 maar 6-deelt-2 niet en 6-deelt-3 niet', latex: '6|6, 6|2, 6|3' }
    ]
  }
}

const counterexampleStatements = [
  {
    statement: 'Voor alle n in N geldt: n² >= n',
    latex: 'Vn in N: n² >= n',
    counterexample: '0 of 1',
    explanation: 'Voor n = 0: 0² = 0 en voor n = 1: 1² = 1. Gelijkheid, niet strikt groter.'
  },
  {
    statement: 'Alle deelbaar door 4 getallen zijn even',
    latex: '4|n => 2|n',
    counterexample: 'onmogelijk',
    explanation: 'Deze uitspraak is WAAR. Elk getal deelbaar door 4 is deelbaar door 2.'
  },
  {
    statement: 'Als n² deelbaar is door 4, dan is n even',
    latex: '4|n² => 2|n',
    counterexample: 'onmogelijk',
    explanation: 'Deze uitspraak is WAAR. Als n² deelbaar is door 4, bevat n minstens factor 2.'
  },
  {
    statement: 'Voor alle a,b in R geldt: wortel(a² + b²) = a + b',
    latex: 'wortel(a²+b²) = a+b',
    counterexample: 'a = 3, b = 4',
    explanation: 'wortel(9+16) = 5, maar 3+4 = 7. Dus 5 ≠ 7.'
  },
  {
    statement: 'De som van twee irrationale getallen is irrationaal',
    latex: 'x,y niet in Q => x+y niet in Q',
    counterexample: 'wortel(2) en -wortel(2)',
    explanation: 'wortel(2) is irrationaal, en -wortel(2) ook. Maar hun som is 0, wat rationaal is.'
  }
]

const challenges = [
  {
    type: 'complete-proof',
    question: 'Welke bewijsmethode gebruik je om te bewijzen dat er oneindig veel priemgetallen zijn?',
    options: [
      { id: 'a', text: 'Direct bewijs', correct: false },
      { id: 'b', text: 'Bewijs uit het ongerijmde', correct: true },
      { id: 'c', text: 'Tegenvoorbeeld', correct: false },
      { id: 'd', text: 'Volledige inductie', correct: false }
    ],
    explanation: 'Euclides bewees dit uit het ongerijmde: stel eindig veel priemgetallen, leid tegenspraak af.'
  },
  {
    type: 'find-error',
    question: 'Wat is er fout in dit "bewijs" dat 1 = 2? Stel a=b, dan a²=ab, dus a²-b²=ab-b², dus (a+b)(a-b)=b(a-b), dus a+b=b, dus 2b=b, dus 2=1',
    options: [
      { id: 'a', text: 'Stap 3 is fout', correct: false },
      { id: 'b', text: 'Stap 4 is fout', correct: false },
      { id: 'c', text: 'Stap 5 is fout (delen door nul)', correct: true },
      { id: 'd', text: 'Stap 6 is fout', correct: false }
    ],
    explanation: 'In stap 5 wordt er gedeeld door (a-b), maar omdat a=b, is a-b=0. Delen door nul is niet toegestaan!'
  },
  {
    type: 'choose-method',
    question: 'Je wilt bewijzen: "Als n² even is, dan is n even." Welke methode?',
    options: [
      { id: 'a', text: 'Direct bewijs via contrapositie', correct: false },
      { id: 'b', text: 'Direct bewijs door n²=2k uit te werken', correct: false },
      { id: 'c', text: 'Bewijs uit het ongerijmde', correct: true },
      { id: 'd', text: 'Tegenvoorbeeld', correct: false }
    ],
    explanation: 'Bewijs uit het ongerijmde: stel n is oneven (n=2k+1), dan is n² oneven. Tegenspraak!'
  }
]

const currentProof = computed(() => proofTemplates[proofType.value])
const currentStatement = computed(() => counterexampleStatements[statementIndex.value])
const currentChallenge = computed(() => challenges.find(c => c.type === challengeType.value) || challenges[0])

function initializeProofBuilder() {
  proofSteps.value = []
  proofCompleted.value = false
  proofFeedback.value = ''
  availableSteps.value = [...currentProof.value.steps]
}

function addStepToProof(step) {
  const expectedType = currentProof.value.structure[proofSteps.value.length]
  if (step.type === expectedType) {
    proofSteps.value.push(step)
    availableSteps.value = availableSteps.value.filter(s => s.id !== step.id)
    if (proofSteps.value.length === currentProof.value.structure.length) {
      proofCompleted.value = true
      proofFeedback.value = 'Perfect! Je hebt een correct bewijs opgebouwd.'
    }
  } else {
    proofFeedback.value = `Fout! Je moet nu een "${expectedType}" stap toevoegen.`
  }
}

function removeStep(index) {
  const step = proofSteps.value[index]
  proofSteps.value.splice(index, 1)
  availableSteps.value.push(step)
  proofCompleted.value = false
  proofFeedback.value = ''
}

function resetProof() {
  initializeProofBuilder()
}

function nextStatement() {
  statementIndex.value = (statementIndex.value + 1) % counterexampleStatements.length
  userCounterexample.value = ''
  counterexampleChecked.value = false
}

function prevStatement() {
  statementIndex.value = (statementIndex.value - 1 + counterexampleStatements.length) % counterexampleStatements.length
  userCounterexample.value = ''
  counterexampleChecked.value = false
}

function checkCounterexample() {
  counterexampleChecked.value = true
  const current = currentStatement.value
  const userAnswer = userCounterexample.value.toLowerCase().trim()
  if (current.counterexample === 'onmogelijk') {
    counterexampleCorrect.value = userAnswer === 'onmogelijk' || userAnswer === 'geen'
  } else {
    counterexampleCorrect.value = userAnswer.includes(current.counterexample.toLowerCase())
  }
}

function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  selectedAnswer.value = null
}

function checkChallenge() {
  if (!selectedAnswer.value) return
  const correct = selectedAnswer.value.correct
  challengeSolved.value = correct
  challengeFeedback.value = correct 
    ? 'Correct! ' + currentChallenge.value.explanation
    : 'Helaas. ' + currentChallenge.value.explanation
}

function closeChallenge() {
  challengeActive.value = false
  selectedAnswer.value = null
  challengeFeedback.value = ''
}

watch(() => props.isOpen, (val) => {
  if (val && !document.fullscreenElement) {
  } else if (!val && document.fullscreenElement) {
  }
  if (val) initializeProofBuilder()
}, { immediate: true })

onUnmounted(() => {
})

watch(proofType, () => initializeProofBuilder())

const analysisSteps = [
  {
    title: 'Direct bewijs',
    description: 'Leid het te bewijzen rechtstreeks af uit de gegevens.',
    focus: 'direct',
    instruction: 'Bouw een direct bewijs door de juiste stappen te selecteren.',
    details: [
      'Start met wat gegeven is',
      'Geef aan wat je moet bewijzen',
      'Werk stap voor stap toe naar het gevolg',
      'Gebruik wiskundige eigenschappen'
    ]
  },
  {
    title: 'Bewijs uit het ongerijmde',
    description: 'Neem het tegendeel aan en toon dat dit tot een tegenspraak leidt.',
    focus: 'contradiction',
    instruction: 'Bouw een bewijs uit het ongerijmde.',
    details: [
      'Neem aan dat het tegendeel waar is',
      'Leid logische gevolgen af',
      'Vind een tegenspraak',
      'Concludeer dat de aanname fout was'
    ]
  },
  {
    title: 'Tegenvoorbeeld',
    description: 'Toon aan dat een uitspraak niet altijd geldt met een concreet voorbeeld.',
    focus: 'counterexample',
    instruction: 'Zoek tegenvoorbeelden voor de gegeven uitspraken.',
    details: [
      'Begrijp de universele uitspraak',
      'Zoek een specifiek geval waarvoor het niet geldt',
      'Verifieer je tegenvoorbeeld',
      'Notatie: bestaat x: niet P(x)'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    proofType.value = analysisSteps[currentStep.value].focus
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    proofType.value = analysisSteps[currentStep.value].focus
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans">
      <!-- Header -->
      <div class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center">
            <PhBrain class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Wiskundig Redeneren</h1>
            <p class="text-sm text-slate-500">Bewijstechnieken en logica</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="flex bg-slate-100 rounded-lg p-1">
            <button 
              @click="currentMode = 'analysis'"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', 
                currentMode === 'analysis' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              Bewijsstructuren
            </button>
            <button 
              @click="currentMode = 'derivation'"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', 
                currentMode === 'derivation' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              Redeneeruitdagingen
            </button>
          </div>
          
          <button @click="emit('close')" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <PhX weight="bold" class="text-xl" />
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex overflow-hidden">
        
        <!-- Left Panel: Controls & Analysis -->
        <div class="w-96 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          
          <!-- Mode: Analysis (Proof Structures) -->
          <template v-if="currentMode === 'analysis'">
            <!-- Step Navigation -->
            <div class="p-4 border-b border-slate-200">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Stap {{ currentStep + 1 }} van {{ analysisSteps.length }}</span>
                <div class="flex gap-1">
                  <button 
                    @click="prevStep" 
                    :disabled="currentStep === 0"
                    class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <PhArrowLeft class="text-lg" />
                  </button>
                  <button 
                    @click="nextStep"
                    :disabled="currentStep === analysisSteps.length - 1"
                    class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <PhArrowRight class="text-lg" />
                  </button>
                </div>
              </div>
              <h2 class="text-base font-bold text-slate-800 mb-1">{{ analysisSteps[currentStep].title }}</h2>
              <p class="text-sm text-slate-600">{{ analysisSteps[currentStep].description }}</p>
            </div>

            <!-- Proof Builder Controls -->
            <div class="p-4 space-y-4">
              <p class="text-sm text-slate-500 italic">{{ analysisSteps[currentStep].instruction }}</p>
              
              <!-- Proof Type Selector -->
              <div class="flex gap-2">
                <button 
                  v-for="(template, key) in proofTemplates" 
                  :key="key"
                  @click="proofType = key"
                  :class="['px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1', 
                    proofType === key ? 'bg-brand-dark text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                >
                  {{ template.title }}
                </button>
              </div>

              <!-- Current Proof Structure -->
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-sm font-bold text-slate-700 mb-2">Bewijsstructuur:</p>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="(step, idx) in currentProof.structure" 
                    :key="idx"
                    :class="['px-2 py-1 rounded text-xs font-medium', 
                      idx < proofSteps.length ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500']"
                  >
                    {{ idx + 1 }}. {{ step }}
                  </span>
                </div>
              </div>

              <!-- Available Steps -->
              <div v-if="!proofCompleted">
                <p class="text-sm font-bold text-slate-700 mb-2">Kies de volgende stap:</p>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                  <button
                    v-for="step in availableSteps.filter(s => s.type === currentProof.structure[proofSteps.length])"
                    :key="step.id"
                    @click="addStepToProof(step)"
                    class="w-full p-2 text-left bg-white border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all text-sm"
                  >
                    <span class="font-mono text-xs text-brand-orange block mb-1">{{ step.latex }}</span>
                    <span class="text-slate-700">{{ step.text }}</span>
                  </button>
                </div>
                <p v-if="!availableSteps.filter(s => s.type === currentProof.structure[proofSteps.length]).length" 
                   class="text-sm text-slate-400 italic">
                  Geen stappen meer beschikbaar voor dit type.
                </p>
              </div>

              <!-- Reset Button -->
              <button 
                @click="resetProof"
                class="w-full py-2 text-slate-500 hover:text-slate-700 text-sm transition-colors"
              >
                Reset bewijs
              </button>

              <!-- Feedback -->
              <div v-if="proofFeedback" 
                   :class="['p-3 rounded-lg text-sm', 
                     proofCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200']">
                {{ proofFeedback }}
              </div>

              <!-- Educational details -->
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <ul class="space-y-1 text-sm text-slate-600">
                  <li v-for="(detail, idx) in analysisSteps[currentStep].details" :key="idx" class="flex items-start gap-2">
                    <span class="text-brand-orange mt-1">•</span>
                    <span>{{ detail }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </template>

          <!-- Mode: Derivation/Challenges -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Redeneeruitdagingen</h2>
              <p class="text-sm text-slate-600">Test je kennis van bewijstechnieken.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een uitdaging:</p>
                
                <button @click="generateChallenge('complete-proof')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2">
                    <PhPuzzlePiece class="text-brand-orange" />
                    <span class="font-medium text-sm text-slate-800">Kies de juiste methode</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Welke bewijstechniek past het best?</div>
                </button>
                
                <button @click="generateChallenge('find-error')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2">
                    <PhTarget class="text-rose-500" />
                    <span class="font-medium text-sm text-slate-800">Vind de fout</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Analyseer een foutief bewijs.</div>
                </button>
                
                <button @click="generateChallenge('choose-method')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2">
                    <PhLightbulb class="text-amber-500" />
                    <span class="font-medium text-sm text-slate-800">Logisch redeneren</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Pas je kennis toe op een probleem.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium whitespace-pre-line">{{ currentChallenge.question }}</p>
                </div>

                <!-- Answer Options -->
                <div class="space-y-2">
                  <button
                    v-for="option in currentChallenge.options"
                    :key="option.id"
                    @click="selectedAnswer = option"
                    :class="['w-full p-3 text-left border rounded-lg transition-all text-sm',
                      selectedAnswer?.id === option.id 
                        ? 'border-brand-orange bg-orange-50' 
                        : 'border-slate-200 hover:border-slate-300']"
                  >
                    <span class="font-bold text-brand-dark mr-2">{{ option.id.toUpperCase() }}.</span>
                    <span class="text-slate-700">{{ option.text }}</span>
                  </button>
                </div>

                <!-- Actions -->
                <div class="space-y-2">
                  <button 
                    @click="checkChallenge" 
                    :disabled="!selectedAnswer"
                    class="w-full py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Controleer
                  </button>
                  <button @click="closeChallenge" class="w-full py-2 text-slate-500 hover:text-slate-700 text-sm transition-colors">
                    Annuleer
                  </button>
                </div>

                <!-- Feedback -->
                <div v-if="challengeFeedback" 
                     :class="['p-3 rounded-lg text-sm whitespace-pre-line', 
                       challengeSolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200']">
                  {{ challengeFeedback }}
                </div>
              </div>
            </div>
          </template>

          <!-- Mathematical Characteristics Panel -->
          <div class="mt-auto p-4 bg-slate-50 border-t border-slate-200">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bewijstechnieken</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-slate-600">Direct bewijs:</span>
                <span class="text-xs text-slate-500">A => B stap voor stap</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-600">Contradictie:</span>
                <span class="text-xs text-slate-500">niet A => botsing dus A</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-600">Contrapositie:</span>
                <span class="text-xs text-slate-500">niet B => niet A dus A => B</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-600">Tegenvoorbeeld:</span>
                <span class="text-xs text-slate-500">bestaat x: niet P(x)</span>
              </div>
              <div class="flex justify-between items-center border-t border-slate-200 pt-2 mt-2">
                <span class="text-slate-600">Volledige inductie:</span>
                <span class="text-xs text-slate-500">P(1) en (P(n)=>P(n+1))</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          
          <!-- Mode: Analysis -->
          <template v-if="currentMode === 'analysis'">
            <!-- Counterexample Mode -->
            <template v-if="proofType === 'counterexample'">
              <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-sm text-slate-500">Zoek een tegenvoorbeeld voor:</span>
                    <p class="text-lg font-mono font-bold text-brand-dark mt-1">{{ currentStatement.latex }}</p>
                    <p class="text-slate-700 mt-1">{{ currentStatement.statement }}</p>
                  </div>
                  <div class="flex gap-1">
                    <button @click="prevStatement" class="p-1.5 rounded-md hover:bg-slate-100 transition-colors">
                      <PhArrowLeft class="text-lg" />
                    </button>
                    <button @click="nextStatement" class="p-1.5 rounded-md hover:bg-slate-100 transition-colors">
                      <PhArrowRight class="text-lg" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Counterexample Input -->
              <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-4">
                <label class="block text-sm font-bold text-slate-700 mb-2">Jouw tegenvoorbeeld (of "onmogelijk"):</label>
                <div class="flex gap-3">
                  <input 
                    type="text" 
                    v-model="userCounterexample"
                    placeholder="bijv. n = 2"
                    class="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    @keyup.enter="checkCounterexample"
                  >
                  <button 
                    @click="checkCounterexample"
                    class="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors"
                  >
                    Controleer
                  </button>
                </div>
              </div>

              <!-- Feedback -->
              <div v-if="counterexampleChecked" 
                   :class="['bg-white rounded-xl p-4 shadow-sm border mb-4',
                     counterexampleCorrect ? 'border-emerald-200' : 'border-rose-200']">
                <div class="flex items-start gap-3">
                  <PhCheckCircle v-if="counterexampleCorrect" class="text-emerald-500 text-xl shrink-0" weight="fill" />
                  <PhProhibit v-else class="text-rose-500 text-xl shrink-0" weight="fill" />
                  <div>
                    <p :class="['font-medium', counterexampleCorrect ? 'text-emerald-700' : 'text-rose-700']">
                      {{ counterexampleCorrect ? 'Correct!' : 'Niet helemaal...' }}
                    </p>
                    <p class="text-sm text-slate-600 mt-1">{{ currentStatement.explanation }}</p>
                  </div>
                </div>
              </div>
            </template>

            <!-- Proof Visualization -->
            <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
              <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PhSteps class="text-brand-orange" />
                {{ currentProof.title }}
              </h3>
              <p class="text-sm text-slate-500 mb-6">{{ currentProof.description }}</p>

              <!-- Built Proof Steps -->
              <div class="space-y-3">
                <div 
                  v-for="(step, index) in proofSteps" 
                  :key="index"
                  class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div class="w-6 h-6 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1">
                    <span class="text-xs font-bold text-slate-400 uppercase">{{ step.type }}</span>
                    <p class="font-mono text-sm text-brand-dark mt-1">{{ step.latex }}</p>
                    <p class="text-sm text-slate-600">{{ step.text }}</p>
                  </div>
                  <button @click="removeStep(index)" class="text-slate-400 hover:text-rose-600">
                    <PhX weight="bold" />
                  </button>
                </div>

                <!-- Empty slots -->
                <div 
                  v-for="n in currentProof.structure.length - proofSteps.length" 
                  :key="`empty-${n}`"
                  class="flex items-center gap-3 p-3 border-2 border-dashed border-slate-200 rounded-lg"
                >
                  <div class="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {{ proofSteps.length + n }}
                  </div>
                  <span class="text-sm text-slate-400">
                    {{ currentProof.structure[proofSteps.length + n - 1] }}
                  </span>
                </div>
              </div>

              <!-- Success Message -->
              <div v-if="proofCompleted" class="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                <PhShieldCheck class="text-emerald-500 text-2xl" weight="fill" />
                <div>
                  <p class="font-bold text-emerald-700">Bewijs voltooid!</p>
                  <p class="text-sm text-emerald-600">Je hebt een correct {{ currentProof.title.toLowerCase() }} opgebouwd.</p>
                </div>
              </div>
            </div>
          </template>

          <!-- Mode: Derivation -->
          <template v-if="currentMode === 'derivation'">
            <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
              <div v-if="!challengeActive" class="max-w-md">
                <div class="w-16 h-16 bg-brand-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <PhBrain class="text-3xl text-brand-orange" weight="fill" />
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">Redeneeruitdagingen</h3>
                <p class="text-slate-600 mb-6">Test je begrip van wiskundige bewijstechnieken met interactieve uitdagingen. Kies een categorie aan de linkerkant.</p>
                
                <div class="grid grid-cols-3 gap-3 text-sm">
                  <div class="p-3 bg-slate-50 rounded-lg">
                    <PhPuzzlePiece class="text-brand-orange mx-auto mb-2" />
                    <span class="text-slate-600">Methode kiezen</span>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-lg">
                    <PhTarget class="text-rose-500 mx-auto mb-2" />
                    <span class="text-slate-600">Fouten vinden</span>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-lg">
                    <PhLightbulb class="text-amber-500 mx-auto mb-2" />
                    <span class="text-slate-600">Logica toepassen</span>
                  </div>
                </div>
              </div>

              <div v-else class="w-full max-w-2xl">
                <div class="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <PhPuzzlePiece v-if="challengeType === 'complete-proof'" class="text-2xl text-brand-orange" />
                  <PhTarget v-else-if="challengeType === 'find-error'" class="text-2xl text-rose-500" />
                  <PhLightbulb v-else class="text-2xl text-amber-500" />
                </div>
                
                <p class="text-lg text-slate-700 mb-8">{{ currentChallenge.question }}</p>
                
                <div class="bg-slate-50 rounded-lg p-6">
                  <p class="text-sm text-slate-500 mb-4">Kies je antwoord aan de linkerkant om te controleren.</p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #F97316;
  border-radius: 50%;
  cursor: pointer;
}
</style>
