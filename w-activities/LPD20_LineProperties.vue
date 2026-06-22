<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScan, PhArrowClockwise, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Merkwaardige Lijnen: Identiteitskaart' },
  instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhScan }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kijk naar het rechte-hoek-tekentje en de streepjes op de zijde.' })
const attemptCount = ref(0)
const showWorkedExample = ref(false)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const lpdConfirmed = ref(false)

const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)
const levels = ref([])

function generateLevel() {
  const pool = [
    { targetName: 'middelloodlijn', targetQ1: false, targetQ2: true, targetQ3: true, svgDraw: 'middelloodlijn',
      successMsg: 'Uitstekend! Loodrecht en in het midden van de zijde, maar raakt geen hoekpunt. De Middelloodlijn.',
      hint1: 'Gaat de lijn door een hoekpunt?', hint2: 'Let op het rechte-hoek-tekentje (loodrecht) en de streepjes (midden).', hint3: 'Het antwoord is: M... (vul zelf aan)',
      why: 'Een middelloodlijn staat loodrecht op een zijde en gaat door het midden ervan. Alle punten op deze lijn liggen even ver van de twee hoekpunten van die zijde. Daarom is dit de lijn voor de omgeschreven cirkel.' },
    { targetName: 'hoogtelijn', targetQ1: true, targetQ2: true, targetQ3: false, svgDraw: 'hoogtelijn',
      successMsg: 'Perfect! Door de top en loodrecht naar beneden. De Hoogtelijn.',
      hint1: 'Kijk of de lijn door een hoekpunt gaat en loodrecht staat.', hint2: 'Hoogtelijn: door hoekpunt (ja), loodrecht (ja), deelt zijde in midden (nee).', hint3: 'Het antwoord is: H... (vul zelf aan)',
      why: 'Een hoogtelijn gaat door een hoekpunt en staat loodrecht op de overstaande zijde. Ze wordt gebruikt om de hoogte van een driehoek te meten en is belangrijk voor de oppervlakteberekening.' },
    { targetName: 'zwaartelijn', targetQ1: true, targetQ2: false, targetQ3: true, svgDraw: 'zwaartelijn',
      successMsg: 'Geweldig! Hoekpunt naar het midden van de overstaande zijde. De Zwaartelijn.',
      hint1: 'Kijk of de lijn door een hoekpunt gaat en de overstaande zijde middendoor deelt.', hint2: 'Zwaartelijn: door hoekpunt (ja), loodrecht (nee), deelt zijde in midden (ja).', hint3: 'Het antwoord is: Z... (vul zelf aan)',
      why: 'Een zwaartelijn verbindt een hoekpunt met het midden van de overstaande zijde. Het snijpunt van de drie zwaartelijnen is het zwaartepunt, waar de driehoek perfect balanceert.' },
    { targetName: 'bissectrice', targetQ1: true, targetQ2: false, targetQ3: false, svgDraw: 'bissectrice',
      successMsg: 'Knap! Een bissectrice verdeelt de hoek in twee gelijke delen.',
      hint1: 'Een bissectrice vertrekt vanuit een hoekpunt en verdeelt de hoek.', hint2: 'Bissectrice: door hoekpunt (ja), loodrecht (nee), deelt zijde in midden (nee).', hint3: 'Het antwoord is: B... (vul zelf aan)',
      why: 'Een bissectrice (deellijn) verdeelt een hoek in twee gelijke delen. Elk punt op de bissectrice ligt even ver van beide benen van de hoek. Het snijpunt van de drie bissectrices is het middelpunt van de ingeschreven cirkel.' }
  ]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const q1 = ref(null)
const q2 = ref(null)
const q3 = ref(null)
const finalName = ref('')

function getHint(data) {
  if (attemptCount.value >= 3) return data.hint3
  if (attemptCount.value >= 2) return data.hint2
  return data.hint1
}

function resetActivityState() {
  isCorrect.value = false; celebrationDone.value = false; isChecked.value = false; attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Kijk naar het rechte-hoek-tekentje en de streepjes op de zijde.' }
  q1.value = null; q2.value = null; q3.value = null; finalName.value = ''
  showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false
}

function checkAnswer() {
  isChecked.value = true
  const allQsAnswered = q1.value !== null && q2.value !== null && q3.value !== null && finalName.value !== ''
  if (!allQsAnswered) {
    isCorrect.value = false
    feedback.value = { type: 'error', text: 'Niet helemaal... Vul eerst alle Ja/Nee vragen en de naam in.'}
    return
  }
  const data = currentLevelData.value
  if (q1.value === data.targetQ1 && q2.value === data.targetQ2 && q3.value === data.targetQ3 && finalName.value === data.targetName) {
    isCorrect.value = true; attemptCount.value = 0
    feedback.value = { type: 'success', text: data.successMsg + ' ' + data.why }
  } else {
    isCorrect.value = false; attemptCount.value++
    const hint = getHint(data)
    if (q1.value !== data.targetQ1) feedback.value = { type: 'error', text: `Kijk naar Vraag 1. Raakt de rode lijn het hoekpunt? ${data.targetQ1 ? 'Ja!' : 'Nee, hij gaat er net naast!'} ${hint}`}
    else if (q2.value !== data.targetQ2) feedback.value = { type: 'error', text: `Kijk naar Vraag 2. Zie je een rood vierkantje (90°)? ${data.targetQ2 ? 'Ja, loodrecht.' : 'Nee, schuin.'} ${hint}`}
    else if (q3.value !== data.targetQ3) feedback.value = { type: 'error', text: `Kijk naar Vraag 3. Zwarte streepjes op de zijde? ${data.targetQ3 ? 'Ja.' : 'Nee.'} ${hint}`}
    else feedback.value = { type: 'error', text: `Je Ja/Nee kloppen, maar de naam is fout. Denk logisch na. ${hint}`}
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels.value - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) }
  else { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') }
}

watch(() => props.isOpen, (val) => {
  if (val) { currentInternalLevel.value = 0; levels.value = generateLevel(); resetActivityState(); nextTick(() => mainArea.value?.focus()); window.addEventListener('keydown', handleKeydown) }
  else { window.removeEventListener('keydown', handleKeydown); shouldPulse.value = false }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', () => {}))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })
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
            <div class="flex gap-1"><div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div></div>
          </div>
        </div>
      </div>
      <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
    </header>
    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

          <!-- Worked Example -->
          <div class="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <button @click="showWorkedExample = !showWorkedExample" class="flex items-center gap-2 text-sm font-bold text-indigo-700 w-full text-left">
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Identiteitskaart invullen
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>Voorbeeld:</strong> Een lijn gaat door het hoekpunt (JA) en staat loodrecht (JA) maar deelt de zijde niet middendoor (NEE).</p>
              <p><strong>Analyse:</strong> Door hoekpunt + loodrecht = hoogtelijn.</p>
              <p><strong>Tip:</strong> Gebruik de drie Ja/Nee-vragen als een determinatietabel. Elke combinatie hoort bij exact één type lijn.</p>
            </div>
          </div>

          <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
            <span class="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-2">{{ currentLevelData ? currentLevelData.goalText || 'Opdracht' : 'Opdracht' }}</span>
          </div>

          <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
            <h4 class="font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">Identiteitskaart</h4>
            <div class="space-y-4">
              <div class="flex flex-col gap-2">
                <span class="text-sm font-bold text-slate-600">Gaat door het hoekpunt?</span>
                <div class="flex gap-2">
                  <button @click="q1 = true" :disabled="isCorrect" class="flex-1 py-2 text-sm border-2 rounded-lg transition-colors" :class="q1 === true ? 'bg-amber-500 border-amber-600 text-white font-bold' : 'bg-white border-slate-300 text-slate-500'">JA</button>
                  <button @click="q1 = false" :disabled="isCorrect" class="flex-1 py-2 text-sm border-2 rounded-lg transition-colors" :class="q1 === false ? 'bg-amber-500 border-amber-600 text-white font-bold' : 'bg-white border-slate-300 text-slate-500'">NEE</button>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <span class="text-sm font-bold text-slate-600">Loodrecht op de zijde? (90°)</span>
                <div class="flex gap-2">
                  <button @click="q2 = true" :disabled="isCorrect" class="flex-1 py-2 text-sm border-2 rounded-lg transition-colors" :class="q2 === true ? 'bg-amber-500 border-amber-600 text-white font-bold' : 'bg-white border-slate-300 text-slate-500'">JA</button>
                  <button @click="q2 = false" :disabled="isCorrect" class="flex-1 py-2 text-sm border-2 rounded-lg transition-colors" :class="q2 === false ? 'bg-amber-500 border-amber-600 text-white font-bold' : 'bg-white border-slate-300 text-slate-500'">NEE</button>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <span class="text-sm font-bold text-slate-600">Deelt zijde in het midden?</span>
                <div class="flex gap-2">
                  <button @click="q3 = true" :disabled="isCorrect" class="flex-1 py-2 text-sm border-2 rounded-lg transition-colors" :class="q3 === true ? 'bg-amber-500 border-amber-600 text-white font-bold' : 'bg-white border-slate-300 text-slate-500'">JA</button>
                  <button @click="q3 = false" :disabled="isCorrect" class="flex-1 py-2 text-sm border-2 rounded-lg transition-colors" :class="q3 === false ? 'bg-amber-500 border-amber-600 text-white font-bold' : 'bg-white border-slate-300 text-slate-500'">NEE</button>
                </div>
              </div>
              <div class="flex flex-col gap-2 pt-4 border-t border-slate-200">
                <span class="text-sm font-bold text-slate-800">Naam van de lijn:</span>
                <select v-model="finalName" :disabled="isCorrect" class="w-full p-4 border-2 border-slate-300 rounded-lg font-bold text-slate-700 bg-white">
                  <option value="" disabled>Kies...</option>
                  <option value="hoogtelijn">Hoogtelijn</option>
                  <option value="zwaartelijn">Zwaartelijn</option>
                  <option value="middelloodlijn">Middelloodlijn</option>
                  <option value="bissectrice">Bissectrice (Deellijn)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Error Analysis -->
          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 1">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op! Veelgemaakte fouten:</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>Zwaartelijn en middelloodlijn lijken op elkaar: zwaartelijn gaat door hoekpunt, middelloodlijn niet.</li>
              <li>Hoogtelijn en zwaartelijn zijn allebei door een hoekpunt, maar alleen hoogtelijn is loodrecht.</li>
              <li>Bissectrice deelt de hoek, niet de zijde. Daarom zijn Q2 en Q3 allebei NEE.</li>
            </ul>
          </div>

          <!-- Reflection and LPD -->
          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">{{ currentLevelData.why }}</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig dat je dit begrijpt</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom heeft elk type lijn een unieke combinatie van eigenschappen (hoekpunt, loodrecht, midden)? Hoe helpt de determinatietabel je om de juiste lijn te kiezen?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed && !isCorrect" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik kan de vier merkwaardige lijnen herkennen aan hun eigenschappen en de juiste naam geven.</p>
            <div class="flex items-center gap-2">
              <input type="checkbox" id="lpd-lineprop" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-lineprop" class="text-xs text-emerald-700 font-medium">Ik bevestig dat ik dit begrijp.</label>
            </div>
          </div>
        </div>

        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span class="leading-snug">{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
            <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900">Controleer Kaart</button>
            <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span><PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-4 border-slate-300 p-8">
            <svg width="400" height="350" viewBox="0 0 400 350" :key="currentInternalLevel">
              <polygon points="100,50 50,300 350,300" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" />
              <circle cx="100" cy="50" r="6" fill="#1e293b" /><circle cx="50" cy="300" r="6" fill="#1e293b" /><circle cx="350" cy="300" r="6" fill="#1e293b" />
              <g v-if="currentLevelData.svgDraw === 'middelloodlijn'" class="animate-fadeIn">
                <line x1="200" y1="350" x2="200" y2="0" stroke="#ef4444" stroke-width="4" stroke-dasharray="10 5" />
                <polyline points="200,285 215,285 215,300" fill="none" stroke="#ef4444" stroke-width="3" />
                <line x1="125" y1="290" x2="125" y2="310" stroke="#1e293b" stroke-width="3" />
                <line x1="130" y1="290" x2="130" y2="310" stroke="#1e293b" stroke-width="3" />
                <line x1="270" y1="290" x2="270" y2="310" stroke="#1e293b" stroke-width="3" />
                <line x1="275" y1="290" x2="275" y2="310" stroke="#1e293b" stroke-width="3" />
              </g>
              <g v-if="currentLevelData.svgDraw === 'hoogtelijn'" class="animate-fadeIn">
                <line x1="100" y1="50" x2="100" y2="350" stroke="#ef4444" stroke-width="4" stroke-dasharray="10 5" />
                <polyline points="100,285 115,285 115,300" fill="none" stroke="#ef4444" stroke-width="3" />
              </g>
              <g v-if="currentLevelData.svgDraw === 'zwaartelijn'" class="animate-fadeIn">
                <line x1="100" y1="50" x2="200" y2="300" stroke="#ef4444" stroke-width="4" stroke-dasharray="10 5" />
                <line x1="125" y1="290" x2="125" y2="310" stroke="#1e293b" stroke-width="3" />
                <line x1="130" y1="290" x2="130" y2="310" stroke="#1e293b" stroke-width="3" />
                <line x1="270" y1="290" x2="270" y2="310" stroke="#1e293b" stroke-width="3" />
                <line x1="275" y1="290" x2="275" y2="310" stroke="#1e293b" stroke-width="3" />
              </g>
              <g v-if="currentLevelData.svgDraw === 'bissectrice'" class="animate-fadeIn">
                <line x1="100" y1="50" x2="220" y2="300" stroke="#ef4444" stroke-width="4" stroke-dasharray="10 5" />
              </g>
            </svg>
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
