<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhCompass,
  PhArrowClockwise,
  PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Goniometrische Getallen (SOS CAS TOA)'
  },
  instruction: {
    type: String,
    default: 'Klik in de driehoek de twee zijden aan die samen de gevraagde goniometrische verhouding vormen.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCompass }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// Levels — now generated
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateLevel(levelIndex) {
  const ratios = ['sin', 'cos', 'tan']
  const angles = ['alpha', 'beta']
  let targetRatio, targetAngle, correctSides, goalText, transform

  if (levelIndex === 0) {
    // Level 1: simple sin/cos with alpha
    targetRatio = pick(['sin', 'cos'])
    targetAngle = 'alpha'

    if (targetRatio === 'sin') {
      correctSides = ['overstaand_alpha', 'schuin']
      goalText = 'Wat is de sinus van hoek \u03b1? Selecteer de twee benodigde zijden.'
    } else {
      correctSides = ['aanliggend_alpha', 'schuin']
      goalText = 'Wat is de cosinus van hoek \u03b1? Selecteer de twee benodigde zijden.'
    }
    transform = 'scale(1, 1)'
  } else if (levelIndex === 1) {
    // Level 2: the other ratio with alpha, or sin/cos mirrored
    targetAngle = 'alpha'
    const used = ['sin', 'cos']
    targetRatio = pick(used)

    if (targetRatio === 'sin') {
      correctSides = ['overstaand_alpha', 'schuin']
      goalText = 'Wat is de sinus van hoek \u03b1? Selecteer de twee benodigde zijden.'
    } else {
      correctSides = ['aanliggend_alpha', 'schuin']
      goalText = 'Wat is de cosinus van hoek \u03b1? Selecteer de twee benodigde zijden.'
    }
    transform = pick(['scale(-1, 1) translate(-200, 0)', 'scale(1, 1)'])
  } else {
    // Level 3: tan with either angle, or mixed
    targetRatio = pick(['tan', ...ratios])
    targetAngle = pick(angles)

    if (targetRatio === 'tan') {
      if (targetAngle === 'alpha') {
        correctSides = ['overstaand_alpha', 'aanliggend_alpha']
        goalText = 'Wat is de tangens van hoek \u03b1? Selecteer de twee benodigde zijden.'
      } else {
        correctSides = ['overstaand_beta', 'aanliggend_beta']
        goalText = 'Let op! Wat is de tangens van hoek \u03b2 (bovenaan)? Selecteer de twee benodigde zijden.'
      }
      transform = pick(['rotate(180 100 75)', 'scale(1, 1)'])
    } else if (targetRatio === 'sin') {
      targetAngle = 'beta'
      correctSides = ['overstaand_beta', 'schuin']
      goalText = 'Wat is de sinus van hoek \u03b2? Selecteer de twee benodigde zijden.'
      transform = 'rotate(180 100 75)'
    } else {
      targetAngle = 'beta'
      correctSides = ['aanliggend_beta', 'schuin']
      goalText = 'Wat is de cosinus van hoek \u03b2? Selecteer de twee benodigde zijden.'
      transform = 'rotate(180 100 75)'
    }
  }

  return {
    goalText,
    targetRatio, targetAngle, correctSides, transform
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// User State
const selectedSides = ref([])

const sideMap = {
  'verticaal': {
    alpha: 'overstaand_alpha',
    beta: 'aanliggend_beta'
  },
  'horizontaal': {
    alpha: 'aanliggend_alpha',
    beta: 'overstaand_beta'
  },
  'schuin': {
    alpha: 'schuin',
    beta: 'schuin'
  }
}

function getHintText() {
  const d = currentLevelData.value
  if (attemptCount.value === 1) {
    if (d.targetRatio === 'sin') {
      return 'SOS: Sinus = Overstaand gedeeld door Schuin. Klik op de overstaande en de schuine zijde.'
    }
    if (d.targetRatio === 'cos') {
      return 'CAS: Cosinus = Aanliggend gedeeld door Schuin. Klik op de aanliggende en de schuine zijde.'
    }
    return 'TOA: Tangens = Overstaand gedeeld door Aanliggend. Let op: de schuine zijde wordt NIET gebruikt!'
  }
  if (attemptCount.value === 2) {
    if (d.targetRatio === 'tan') {
      return 'De tangens gebruikt alleen de twee rechthoekszijden. Welke twee? Overstaand en Aanliggend bij de hoek.'
    }
    return 'Je zoekt twee zijden voor een breuk. De schuine zijde (hypotenusa) is altijd de noemer. Welke zijde is de teller?'
  }
  return `De ${d.targetRatio}-verhouding gebruik je met SOS CAS TOA. De juiste zijden zijn: ${d.correctSides.join(' en ')}.`
}

function toggleSide(physicalSide) {
  if (isCorrect.value) return
  const logicalSide = sideMap[physicalSide][currentLevelData.value.targetAngle]

  const index = selectedSides.value.indexOf(logicalSide)
  if (index > -1) {
    selectedSides.value.splice(index, 1)
  } else {
    if (selectedSides.value.length < 2) {
      selectedSides.value.push(logicalSide)
    } else {
      selectedSides.value.shift()
      selectedSides.value.push(logicalSide)
    }
  }
  isChecked.value = false

  // Auto-correct when exactly 2 correct sides selected
  if (selectedSides.value.length === 2) {
    tryAutoCorrect()
  }
}

function tryAutoCorrect() {
  const target = currentLevelData.value
  const correct1 = target.correctSides[0]
  const correct2 = target.correctSides[1]

  const hasCorrect1 = selectedSides.value.includes(correct1)
  const hasCorrect2 = selectedSides.value.includes(correct2)

  if (hasCorrect1 && hasCorrect2) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Perfect! Je hebt de ${target.targetRatio}-verhouding fysiek correct aangeduid.`
    }
  }
}

function isSelected(physicalSide) {
  return selectedSides.value.includes(sideMap[physicalSide][currentLevelData.value.targetAngle])
}

function resetActivityState() {
  const newLevels = []
  for (let i = 0; i < totalInternalLevels; i++) {
    newLevels.push(generateLevel(i))
  }
  levels.value = newLevels

  isCorrect.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: 'Klik op twee zijden in de driehoek.' }
  attemptCount.value = 0
  selectedSides.value = []
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
  } else {
    if (props.currentStep < props.totalSteps) {
      emit('update:currentStep', props.currentStep + 1)
    } else {
      emit('complete')
    }
  }
}

function showHint() {
  attemptCount.value++
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
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
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-teal-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-teal-500' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-teal-50 p-5 border border-teal-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-teal-800 text-lg">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
              <p class="text-sm text-slate-500 font-bold mb-4 uppercase tracking-wider text-center">Geselecteerde Zijden ({{ selectedSides.length }}/2)</p>

              <div class="flex gap-2 justify-center">
                 <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                      :class="selectedSides.length >= 1 ? 'bg-teal-500 text-white' : 'bg-white border-2 border-dashed border-slate-300 text-slate-300'">
                   1
                 </div>
                 <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                      :class="selectedSides.length >= 2 ? 'bg-teal-500 text-white' : 'bg-white border-2 border-dashed border-slate-300 text-slate-300'">
                   2
                 </div>
              </div>
            </div>

          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <!-- Progressive hint -->
            <div v-if="!isCorrect && attemptCount > 0"
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn bg-amber-50 text-amber-800 border border-amber-200">
               <PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ getHintText() }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect" @click="showHint" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">
                Geef me een hint
              </button>

              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <div class="relative w-80 h-64">
                <!-- Transform container for rotation/mirroring based on level -->
                <svg width="100%" height="100%" viewBox="0 0 200 150" class="overflow-visible transition-transform duration-700 ease-in-out" :transform="currentLevelData.transform">

                  <!-- Base triangle fill -->
                  <polygon points="10,140 190,140 190,10" fill="white" stroke="none" />

                  <!-- Right angle marker -->
                  <polyline points="170,140 170,120 190,120" fill="none" stroke="#64748b" stroke-width="2"/>

                  <!-- Angle alpha arc -->
                  <path d="M 40 140 A 30 30 0 0 0 35 122" fill="none" stroke="#3b82f6" stroke-width="4"/>

                  <!-- Angle beta arc (top) -->
                  <path d="M 190 40 A 30 30 0 0 0 172 35" fill="none" stroke="#f43f5e" stroke-width="4"/>

                  <!-- Interactive Sides -->
                  <!-- Horizontaal (bottom) -->
                  <line x1="10" y1="140" x2="190" y2="140"
                        stroke-width="12" stroke-linecap="round" class="cursor-pointer transition-all duration-200 hover:opacity-80"
                        :stroke="isSelected('horizontaal') ? '#f59e0b' : '#1e293b'"
                        @click="toggleSide('horizontaal')" />

                  <!-- Verticaal (right) -->
                  <line x1="190" y1="140" x2="190" y2="10"
                        stroke-width="12" stroke-linecap="round" class="cursor-pointer transition-all duration-200 hover:opacity-80"
                        :stroke="isSelected('verticaal') ? '#f59e0b' : '#1e293b'"
                        @click="toggleSide('verticaal')" />

                  <!-- Schuin (hypotenuse) -->
                  <line x1="10" y1="140" x2="190" y2="10"
                        stroke-width="12" stroke-linecap="round" class="cursor-pointer transition-all duration-200 hover:opacity-80"
                        :stroke="isSelected('schuin') ? '#f59e0b' : '#1e293b'"
                        @click="toggleSide('schuin')" />

                  <!-- Invisible hitboxes to make clicking easier -->
                  <line x1="10" y1="140" x2="190" y2="140" stroke="transparent" stroke-width="24" @click="toggleSide('horizontaal')" class="cursor-pointer" />
                  <line x1="190" y1="140" x2="190" y2="10" stroke="transparent" stroke-width="24" @click="toggleSide('verticaal')" class="cursor-pointer" />
                  <line x1="10" y1="140" x2="190" y2="10" stroke="transparent" stroke-width="24" @click="toggleSide('schuin')" class="cursor-pointer" />
                </svg>

                <!-- Static labels overlay (absolute positioned so they don't flip upside down with the SVG) -->

                <!-- We compute label placement based on level data -->
                <div class="absolute inset-0 pointer-events-none">
                   <!-- alpha label -->
                   <div v-if="currentLevelData.targetAngle === 'alpha' || currentInternalLevel === 0"
                        class="text-blue-600 font-black text-2xl font-serif"
                        :class="{
                          'absolute bottom-1 left-8': currentLevelData.transform === 'scale(1, 1)',
                          'absolute bottom-1 right-8': currentLevelData.transform.includes('scale(-1'),
                          'absolute top-1 right-8': currentLevelData.transform.includes('rotate(180')
                        }">\u03b1</div>
                   <!-- beta label -->
                   <div class="text-rose-500 font-black text-2xl font-serif"
                        :class="{
                          'absolute top-8 right-6': currentLevelData.transform === 'scale(1, 1)',
                          'absolute top-8 left-6': currentLevelData.transform.includes('scale(-1'),
                          'absolute bottom-8 left-6': currentLevelData.transform.includes('rotate(180')
                        }">\u03b2</div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
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
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>