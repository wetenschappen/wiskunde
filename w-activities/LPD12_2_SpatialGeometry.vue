<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhCube,
  PhArrowClockwise,
  PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Onderlinge ligging in de ruimte'
  },
  instruction: {
    type: String,
    default: 'Klik op twee lijnen in de kubus om aan de opdracht te voldoen.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCube }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// Definition of all lines
const allLines = [
  'AB', 'BC', 'CD', 'AD',
  'EF', 'FG', 'GH', 'EH',
  'AE', 'BF', 'CG', 'DH',
  'AG', 'BH', 'CE', 'DF'
]

// Parallel groups
const parallelGroups = [
  ['AB', 'CD', 'EF', 'GH'],
  ['AD', 'BC', 'EH', 'FG'],
  ['AE', 'BF', 'CG', 'DH']
]

// Helper to check relationship
function getRelationship(l1, l2) {
  if (l1 === l2) return 'identical'
  for (let group of parallelGroups) {
    if (group.includes(l1) && group.includes(l2)) return 'evenwijdig'
  }
  const set1 = new Set(l1.split(''))
  const set2 = new Set(l2.split(''))
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  if (intersection.size === 1) return 'snijdend'
  const diagonals = ['AG', 'BH', 'CE', 'DF']
  if (diagonals.includes(l1) && diagonals.includes(l2)) return 'snijdend'
  return 'kruisend'
}

// Levels — now generated
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function generateLevel(levelIndex) {
  // Each level asks for a different relationship
  const relations = ['snijdend', 'evenwijdig', 'kruisend']

  let targetRel
  if (levelIndex === 0) targetRel = 'snijdend'
  else if (levelIndex === 1) targetRel = 'evenwijdig'
  else targetRel = 'kruisend'

  const names = {
    'snijdend': 'elkaar snijden',
    'evenwijdig': 'evenwijdig zijn',
    'kruisend': 'kruisend zijn (niet evenwijdig en niet snijdend)'
  }

  return {
    goalText: `Opdracht ${levelIndex + 1}: Selecteer twee lijnen die ${names[targetRel]}.`,
    targetRel
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const selectedLines = ref([])

function getHintText() {
  const targetRel = currentLevelData.value.targetRel
  if (attemptCount.value === 1) {
    if (targetRel === 'snijdend') return 'Snijdende lijnen hebben een gemeenschappelijk punt. Zoek twee lijnen die een hoekpunt delen.'
    if (targetRel === 'evenwijdig') return 'Evenwijdige lijnen lopen in dezelfde richting en ontmoeten elkaar nooit. Denk aan tegenoverliggende ribben.'
    return 'Kruisende lijnen zijn niet evenwijdig, maar snijden elkaar ook niet. Ze lopen in verschillende richtingen zonder elkaar te raken.'
  }
  if (attemptCount.value === 2) {
    if (targetRel === 'snijdend') return 'Kies twee lijnen die samenkomen in een hoekpunt, zoals een verticale en een horizontale ribbe.'
    if (targetRel === 'evenwijdig') return 'Zoek twee ribben die tegenover elkaar liggen in hetzelfde vlak, zoals de linker en rechter verticale ribben.'
    return 'Zoek een lijn op het voorvlak en een lijn op het achtervlak die elkaar niet kruisen, zoals een horizontale en een verticale lijn op verschillende vlakken.'
  }
  // Provide example pairs
  if (targetRel === 'snijdend') return 'Voorbeeld: AB en BC snijden elkaar in punt B. Of AE en EF in punt E.'
  if (targetRel === 'evenwijdig') return 'Voorbeeld: AB is evenwijdig aan CD. Of AE is evenwijdig aan CG.'
  return 'Voorbeeld: AB en DH kruisen elkaar (ze zijn niet evenwijdig en hebben geen gemeenschappelijk punt).'
}

function toggleLine(lineName) {
  if (isCorrect.value) return

  if (selectedLines.value.includes(lineName)) {
    selectedLines.value = selectedLines.value.filter(l => l !== lineName)
  } else {
    if (selectedLines.value.length < 2) {
      selectedLines.value.push(lineName)
    } else {
      selectedLines.value.shift()
      selectedLines.value.push(lineName)
    }
  }
  isChecked.value = false

  // Auto-correct when 2 lines selected and they match
  if (selectedLines.value.length === 2) {
    tryAutoCorrect()
  }
}

function tryAutoCorrect() {
  const rel = getRelationship(selectedLines.value[0], selectedLines.value[1])
  const targetRel = currentLevelData.value.targetRel

  if (rel === targetRel) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Perfect! De lijnen ${selectedLines.value[0]} en ${selectedLines.value[1]} zijn inderdaad ${rel}.`
    }
  }
}

function showHint() {
  attemptCount.value++
}

function resetActivityState() {
  const newLevels = []
  for (let i = 0; i < totalInternalLevels; i++) {
    newLevels.push(generateLevel(i))
  }
  levels.value = newLevels

  isCorrect.value = false
celebrationDone.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: 'Selecteer exact 2 lijnen.' }
  attemptCount.value = 0
  selectedLines.value = []
}

function handleNext() {
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

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) {
      nextTick(() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => {})
        }
      })
    }
    nextTick(() => {
      shouldPulse.value = true
      setTimeout(() => { shouldPulse.value = false }, 3000)
    })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
      emit('close')
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
})
// Success verification placeholder: Prima!
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit(" @keydown.space.prevent="emit(" aria-label="Interactief element"></div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-math-blue-bg">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-math-blue" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-math-blue' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-math-blue-bg p-5 border border-surface-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-math-blue text-lg">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-6 shadow-inner text-center">
              <p class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Geselecteerde Lijnen</p>
              <div class="flex gap-4 justify-center">
                <div class="h-16 w-16 bg-white border-2 border-dashed rounded-xl flex items-center justify-center font-mono font-bold text-xl transition-all"
                     :class="selectedLines[0] ? 'border-math-blue text-math-blue bg-math-blue-bg ring-4 ring-math-blue' : 'border-slate-300 text-slate-300'">
                  {{ selectedLines[0] || '?' }}
                </div>
                <div class="h-16 w-16 bg-white border-2 border-dashed rounded-xl flex items-center justify-center font-mono font-bold text-xl transition-all"
                     :class="selectedLines[1] ? 'border-math-blue text-math-blue bg-math-blue-bg ring-4 ring-math-blue' : 'border-slate-300 text-slate-300'">
                  {{ selectedLines[1] || '?' }}
                </div>
              </div>
            </div>

          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true" :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <!-- Progressive hint -->
            <div v-if="!isCorrect && attemptCount > 0"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn bg-math-blue-bg text-math-blue border border-surface-200">
               <PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ getHintText() }}</span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                 <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect" @click="showHint" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                Geef me een hint
              </button>

              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <!-- Isometric Cube SVG -->
              <svg width="400" height="400" viewBox="-20 -20 240 240" class="overflow-visible stroke-slate-800 stroke-2 fill-none" stroke-linejoin="round" stroke-linecap="round">

                <!-- Background transparent faces -->
                <polygon points="50,150 150,150 150,50 50,50" fill="white" opacity="0.6"/>
                <polygon points="150,150 180,110 180,10 150,50" fill="#f8fafc" opacity="0.6"/>
                <polygon points="50,50 150,50 180,10 80,10" fill="#f1f5f9" opacity="0.6"/>

                <!-- Bottom Edges -->
                <line x1="50" y1="150" x2="150" y2="150" :stroke="selectedLines.includes('AB') ? '#f97316' : '#cbd5e1'" :stroke-width="selectedLines.includes('AB') ? 8 : 4" @click="toggleLine('AB')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="150" y1="150" x2="180" y2="110" :stroke="selectedLines.includes('BC') ? '#f97316' : '#cbd5e1'" :stroke-width="selectedLines.includes('BC') ? 8 : 4" @click="toggleLine('BC')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="180" y1="110" x2="80" y2="110" :stroke="selectedLines.includes('CD') ? '#f97316' : '#94a3b8'" stroke-dasharray="6,4" :stroke-width="selectedLines.includes('CD') ? 8 : 4" @click="toggleLine('CD')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="50" y1="150" x2="80" y2="110" :stroke="selectedLines.includes('AD') ? '#f97316' : '#94a3b8'" stroke-dasharray="6,4" :stroke-width="selectedLines.includes('AD') ? 8 : 4" @click="toggleLine('AD')" class="cursor-pointer transition-all hover:stroke-orange-300" />

                <!-- Top Edges -->
                <line x1="50" y1="50" x2="150" y2="50" :stroke="selectedLines.includes('EF') ? '#f97316' : '#64748b'" :stroke-width="selectedLines.includes('EF') ? 8 : 4" @click="toggleLine('EF')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="150" y1="50" x2="180" y2="10" :stroke="selectedLines.includes('FG') ? '#f97316' : '#64748b'" :stroke-width="selectedLines.includes('FG') ? 8 : 4" @click="toggleLine('FG')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="180" y1="10" x2="80" y2="10" :stroke="selectedLines.includes('GH') ? '#f97316' : '#64748b'" :stroke-width="selectedLines.includes('GH') ? 8 : 4" @click="toggleLine('GH')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="50" y1="50" x2="80" y2="10" :stroke="selectedLines.includes('EH') ? '#f97316' : '#64748b'" :stroke-width="selectedLines.includes('EH') ? 8 : 4" @click="toggleLine('EH')" class="cursor-pointer transition-all hover:stroke-orange-300" />

                <!-- Vertical Edges -->
                <line x1="50" y1="150" x2="50" y2="50" :stroke="selectedLines.includes('AE') ? '#f97316' : '#94a3b8'" :stroke-width="selectedLines.includes('AE') ? 8 : 4" @click="toggleLine('AE')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="150" y1="150" x2="150" y2="50" :stroke="selectedLines.includes('BF') ? '#f97316' : '#64748b'" :stroke-width="selectedLines.includes('BF') ? 8 : 4" @click="toggleLine('BF')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="180" y1="110" x2="180" y2="10" :stroke="selectedLines.includes('CG') ? '#f97316' : '#64748b'" :stroke-width="selectedLines.includes('CG') ? 8 : 4" @click="toggleLine('CG')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="80" y1="110" x2="80" y2="10" :stroke="selectedLines.includes('DH') ? '#f97316' : '#94a3b8'" stroke-dasharray="6,4" :stroke-width="selectedLines.includes('DH') ? 8 : 4" @click="toggleLine('DH')" class="cursor-pointer transition-all hover:stroke-orange-300" />

                <!-- Internal Diagonals -->
                <line v-if="selectedLines.includes('AG')" x1="50" y1="150" x2="180" y2="10" stroke="#f97316" stroke-width="8" class="pointer-events-none" />
                <line v-if="selectedLines.includes('BH')" x1="150" y1="150" x2="80" y2="10" stroke="#f97316" stroke-width="8" class="pointer-events-none" />
                <line v-if="selectedLines.includes('CE')" x1="180" y1="110" x2="50" y2="50" stroke="#f97316" stroke-width="8" class="pointer-events-none" />
                <line v-if="selectedLines.includes('DF')" x1="80" y1="110" x2="150" y2="50" stroke="#f97316" stroke-width="8" class="pointer-events-none" />

                <!-- Ghost hitboxes for diagonals -->
                <line x1="50" y1="150" x2="180" y2="10" stroke="transparent" stroke-width="20" @click="toggleLine('AG')" class="cursor-pointer" />
                <line x1="150" y1="150" x2="80" y2="10" stroke="transparent" stroke-width="20" @click="toggleLine('BH')" class="cursor-pointer" />
                <line x1="180" y1="110" x2="50" y2="50" stroke="transparent" stroke-width="20" @click="toggleLine('CE')" class="cursor-pointer" />
                <line x1="80" y1="110" x2="150" y2="50" stroke="transparent" stroke-width="20" @click="toggleLine('DF')" class="cursor-pointer" />

                <!-- Labels -->
                <g fill="#1e293b" font-weight="bold" font-size="16" stroke="none">
                  <text x="35" y="165">A</text>
                  <text x="155" y="165">B</text>
                  <text x="185" y="125">C</text>
                  <text x="65" y="125">D</text>
                  <text x="35" y="45">E</text>
                  <text x="155" y="45">F</text>
                  <text x="185" y="5">G</text>
                  <text x="65" y="5">H</text>
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

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
