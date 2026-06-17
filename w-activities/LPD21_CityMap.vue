<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMapPin, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Meetkunde: Stratenplan Symbolen' },
  instruction: {
    type: String,
    default: 'Kijk naar de kaart van de stad. Welke straten lopen evenwijdig (∥) of loodrecht (⊥) op elkaar?<br/><br/><strong>Opdracht:</strong> Kies het juiste wiskundige symbool voor elke combinatie van straten.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMapPin }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de lege knoppen om een symbool (∥, ⊥ of ∦) te kiezen.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)

// All possible street relation pairs with their correct symbols and hints
const relationPool = [
  { left: 'a', right: 'b', correctSym: '∥', hint1: 'Straat a en b gaan beide horizontaal. Ze snijden elkaar nooit.', hint2: 'Evenwijdige straten hebben dezelfde richting. a en b lopen parallel.', hint3: 'a ∥ b (evenwijdig)' },
  { left: 'a', right: 'c', correctSym: '⊥', hint1: 'Straat a (horizontaal) en c (verticaal). Hoe staan die op elkaar?', hint2: 'Horizontaal en verticaal vormen een perfecte kruising van 90°.', hint3: 'a ⊥ c (loodrecht)' },
  { left: 'b', right: 'c', correctSym: '⊥', hint1: 'Straat b (horizontaal) en c (verticaal).', hint2: 'Let op het rechte-hoek-tekentje bij het kruispunt.', hint3: 'b ⊥ c (loodrecht)' },
  { left: 'a', right: 'd', correctSym: '∦', hint1: 'Straat a is horizontaal. Straat d is schuin. Ze snijden elkaar, maar is het 90°?', hint2: 'Ze snijden elkaar niet onder een rechte hoek, dus het is niet ⊥ maar ∦.', hint3: 'a ∦ d (snijdend, niet loodrecht)' },
  { left: 'b', right: 'd', correctSym: '∦', hint1: 'Straat b is horizontaal. Straat d is schuin. Ze snijden elkaar.', hint2: 'Horizontaal en schuin zijn nooit loodrecht tenzij de schuine exact 90° staat.', hint3: 'b ∦ d (snijdend, niet loodrecht)' },
  { left: 'c', right: 'd', correctSym: '∦', hint1: 'Straat c is verticaal. Straat d is schuin.', hint2: 'Verticaal en schuin zijn nooit loodrecht. Ze zijn ook niet evenwijdig.', hint3: 'c ∦ d (snijdend, niet loodrecht)' }
]

const levels = ref([])

function generateLevel() {
  const shuffled = [...relationPool].sort(() => Math.random() - 0.5)
  // Split into 3 levels: ~2 relations each
  const level1relations = shuffled.slice(0, 2)
  const level2relations = shuffled.slice(2, 5)
  const level3relations = shuffled.slice(5, 7)

  // Give each a goalText
  return [
    { goalText: 'Opdracht 1: Basis Relaties', relations: level1relations.map(r => ({ ...r, userSym: '' })) },
    { goalText: 'Opdracht 2: Gemengde Straten', relations: level2relations.map(r => ({ ...r, userSym: '' })) },
    { goalText: 'Opdracht 3: Uitdagende Combinaties', relations: level3relations.map(r => ({ ...r, userSym: '' })) }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const symbols = ['∥', '⊥', '∦']

function getHint(rel) {
  if (attemptCount.value >= 3) return rel.hint3
  if (attemptCount.value >= 2) return rel.hint2
  return rel.hint1
}

function cycleSymbol(index) {
    if (isCorrect.value) return;
    const current = levels.value[currentInternalLevel.value].relations[index].userSym
    let nextIdx = symbols.indexOf(current) + 1
    if (nextIdx >= symbols.length) nextIdx = 0
    levels.value[currentInternalLevel.value].relations[index].userSym = symbols[nextIdx]

    // Auto-check: all relations filled in
    const rels = levels.value[currentInternalLevel.value].relations
    const allFilled = rels.every(r => r.userSym !== '')
    if (allFilled) {
        const allCorrect = rels.every(r => r.userSym === r.correctSym)
        if (allCorrect) {
            isCorrect.value = true
            attemptCount.value = 0
            feedback.value = { type: 'success', text: 'Uitstekend! Je hebt de straten perfect geanalyseerd.' }
        } else {
            attemptCount.value++
            const wrongRelation = rels.find(r => r.userSym !== r.correctSym)
            feedback.value = { type: 'error', text: getHint(wrongRelation) }
        }
    } else {
        feedback.value = { type: 'info', text: 'Klik op de resterende knoppen om een symbool te kiezen.' }
    }
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Klik op de lege knoppen om een symbool (∥, ⊥ of ∦) te kiezen.' };
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels.value - 1) {
    currentInternalLevel.value++;
    resetActivityState();
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
  }
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    levels.value = generateLevel();
    resetActivityState();
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) { nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => {}) }) }
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-orange-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-orange-500' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-orange-50 p-4 border border-orange-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-orange-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-orange-200 bg-orange-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-slate-700 mb-4">Relaties:</h4>

               <div class="flex flex-col gap-4">
                   <div v-for="(rel, idx) in currentLevelData.relations" :key="idx" class="flex items-center justify-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm transition-all" :class="isCorrect ? 'border-emerald-400 bg-emerald-50' : ''">
                       <span class="font-black text-2xl text-slate-600">{{ rel.left }}</span>

                       <button @click="cycleSymbol(idx)" :disabled="isCorrect"
                               class="w-12 h-12 rounded-lg border-2 flex items-center justify-center font-black text-2xl transition-colors"
                               :class="isCorrect ? 'border-emerald-500 bg-emerald-100 text-emerald-700' : (rel.userSym ? (rel.userSym === rel.correctSym ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-orange-500 bg-orange-100 text-orange-700') : 'border-dashed border-slate-400 text-slate-400 hover:bg-slate-50')">
                           {{ rel.userSym || '?' }}
                       </button>

                       <span class="font-black text-2xl text-slate-600">{{ rel.right }}</span>
                   </div>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-emerald-50">

              <!-- Map Visualization -->
              <div class="w-full max-w-3xl aspect-[4/3] bg-emerald-100 border-4 border-emerald-300 rounded-3xl overflow-hidden shadow-xl relative">

                  <!-- Grass decor -->
                  <div class="absolute top-10 left-10 w-32 h-32 bg-emerald-200/50 rounded-full blur-xl"></div>
                  <div class="absolute bottom-20 right-20 w-48 h-48 bg-emerald-200/50 rounded-full blur-xl"></div>

                  <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" class="absolute inset-0">

                      <!-- Street A (Horizontal Top) -->
                      <g>
                          <line x1="0" y1="200" x2="800" y2="200" stroke="#475569" stroke-width="24" />
                          <line x1="0" y1="200" x2="800" y2="200" stroke="#f1f5f9" stroke-width="2" stroke-dasharray="12 12" />
                          <!-- Label a -->
                          <rect x="50" y="160" width="30" height="30" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
                          <text x="65" y="180" text-anchor="middle" font-weight="900" font-size="18" fill="#0f172a">a</text>
                      </g>

                      <!-- Street B (Horizontal Bottom) -->
                      <g>
                          <line x1="0" y1="400" x2="800" y2="400" stroke="#475569" stroke-width="24" />
                          <line x1="0" y1="400" x2="800" y2="400" stroke="#f1f5f9" stroke-width="2" stroke-dasharray="12 12" />
                          <!-- Label b -->
                          <rect x="50" y="360" width="30" height="30" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
                          <text x="65" y="380" text-anchor="middle" font-weight="900" font-size="18" fill="#0f172a">b</text>
                      </g>

                      <!-- Street C (Vertical) -->
                      <g>
                          <line x1="600" y1="0" x2="600" y2="600" stroke="#475569" stroke-width="24" />
                          <line x1="600" y1="0" x2="600" y2="600" stroke="#f1f5f9" stroke-width="2" stroke-dasharray="12 12" />
                          <!-- Right angle indicators at intersection of a and c -->
                          <polyline points="588,200 588,188 600,188" fill="none" stroke="#f1f5f9" stroke-width="2" />
                          <polyline points="588,400 588,388 600,388" fill="none" stroke="#f1f5f9" stroke-width="2" />

                          <!-- Label c -->
                          <rect x="620" y="50" width="30" height="30" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
                          <text x="635" y="70" text-anchor="middle" font-weight="900" font-size="18" fill="#0f172a">c</text>
                      </g>

                      <!-- Street D (Diagonal) -->
                      <g>
                          <line x1="200" y1="600" x2="500" y2="0" stroke="#475569" stroke-width="24" />
                          <line x1="200" y1="600" x2="500" y2="0" stroke="#f1f5f9" stroke-width="2" stroke-dasharray="12 12" />
                          <!-- Label d -->
                          <rect x="230" y="450" width="30" height="30" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
                          <text x="245" y="470" text-anchor="middle" font-weight="900" font-size="18" fill="#0f172a">d</text>
                      </g>

                  </svg>
              </div>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
