<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhListNumbers,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Algebraïsch Oplossen: Tweedegraadsongelijkheden'
  },
  instruction: {
    type: String,
    default: 'Stel de nulwaarden en het tekenschema in. Teken daarna het oplossingsgebied op de getallenlijn.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhListNumbers }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function generateQuadraticExpr(a, r1, r2) {
  const sum = r1 + r2
  const prod = r1 * r2
  const parts = []
  if (a === 1) parts.push('x²')
  else if (a === -1) parts.push('-x²')
  else parts.push(`${a}x²`)
  const coeffX = -a * sum
  if (coeffX !== 0) {
    if (coeffX === 1) parts.push('+ x')
    else if (coeffX === -1) parts.push('− x')
    else if (coeffX > 0) parts.push(`+ ${coeffX}x`)
    else parts.push(`− ${Math.abs(coeffX)}x`)
  }
  const constTerm = a * prod
  if (constTerm > 0) parts.push(`+ ${constTerm}`)
  else if (constTerm < 0) parts.push(`− ${Math.abs(constTerm)}`)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

function generateLevel(levelNum) {
  if (levelNum === 0) {
    const a = 1
    const r1 = -r(2, 5)
    const r2 = r(2, 5)
    const roots = [r1, r2].sort((a, b) => a - b)
    const incl = r(0, 1) === 1
    const sign = incl ? '≤' : '<'
    const expr = generateQuadraticExpr(a, r1, r2)
    return {
      inequality: `${expr} ${sign} 0`,
      rootsCount: 2,
      targetRoots: roots,
      targetSigns: ['+', '-', '+'],
      targetType: 'tussen',
      targetIncluded: incl
    }
  } else if (levelNum === 1) {
    const a = r(0, 1) === 0 ? 1 : -1
    const r1 = -r(2, 5)
    const r2 = r(1, 4)
    const roots = [r1, r2].sort((a, b) => a - b)
    const incl = r(0, 1) === 1
    const sign = incl ? '≥' : '>'
    const expr = generateQuadraticExpr(a, r1, r2)
    const signs = a > 0 ? ['+', '-', '+'] : ['-', '+', '-']
    const type = a > 0 ? 'tussen' : 'buiten'
    return {
      inequality: `${expr} ${sign} 0`,
      rootsCount: 2,
      targetRoots: roots,
      targetSigns: signs,
      targetType: type,
      targetIncluded: incl
    }
  } else {
    // Level 3: possibly double root or wider range
    const isDouble = r(0, 2) === 0
    if (isDouble) {
      const a = r(0, 1) === 0 ? 1 : -1
      const rt = r(1, 4)
      const incl = r(0, 1) === 1
      const sign = incl ? '≥' : '>'
      const expr = generateQuadraticExpr(a, rt, rt)
      const signs = a > 0 ? ['+', '+'] : ['-', '-']
      const type = a > 0 ? 'buiten' : 'tussen'
      return {
        inequality: `${expr} ${sign} 0`,
        rootsCount: 1,
        targetRoots: [rt],
        targetSigns: signs,
        targetType: type,
        targetIncluded: incl
      }
    } else {
      const a = r(0, 1) === 0 ? 1 : -1
      const r1 = -r(1, 6)
      const r2 = r(1, 6)
      const roots = [r1, r2].sort((a, b) => a - b)
      const incl = r(0, 1) === 1
      const sign = incl ? '≤' : '<'
      const expr = generateQuadraticExpr(a, r1, r2)
      const signs = a > 0 ? ['+', '-', '+'] : ['-', '+', '-']
      const type = a > 0 ? 'tussen' : 'buiten'
      return {
        inequality: `${expr} ${sign} 0`,
        rootsCount: 2,
        targetRoots: roots,
        targetSigns: signs,
        targetType: type,
        targetIncluded: incl
      }
    }
  }
}

const levels = ref([])

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// User State - Tekenschema
const userRoot1 = ref(0)
const userRoot2 = ref(1)
const sign1 = ref('')
const sign2 = ref('')
const sign3 = ref('')

const userType = ref('tussen')
const userIntervalIncluded = ref(true)

const sortedUserRoots = computed(() => {
  if (!currentLevelData.value) return [0, 1]
  if (currentLevelData.value.rootsCount === 1) return [userRoot1.value]
  return [userRoot1.value, userRoot2.value].sort((a, b) => a - b)
})

function toggleSign(refStr) {
  if (isCorrect.value) return
  if (refStr === 'sign1') sign1.value = sign1.value === '+' ? '-' : (sign1.value === '-' ? '' : '+')
  if (refStr === 'sign2') sign2.value = sign2.value === '+' ? '-' : (sign2.value === '-' ? '' : '+')
  if (refStr === 'sign3') sign3.value = sign3.value === '+' ? '-' : (sign3.value === '-' ? '' : '+')
  isChecked.value = false
}

function getHint() {
  const target = currentLevelData.value
  if (!target) return ''
  if (attemptCount.value === 1) return 'Kijk naar de vorm van de parabool (a > 0 = dal, a < 0 = berg).'
  if (attemptCount.value === 2) return `Bereken de nulwaarden via de abc-formule of ontbinding. De tekens wisselen bij elke nulwaarde.`
  return `De nulwaarden zijn ${target.targetRoots.join(' en ')}. Het teken is afwisselend + en − tussen de nulwaarden.`
}

function resetActivityState() {
  levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
  isCorrect.value = false
  isChecked.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Bereken de nulwaarden (bijv. via som-product of ABC-formule) en vul het tekenschema in.' }

  userRoot1.value = 0
  userRoot2.value = 1
  sign1.value = ''
  sign2.value = ''
  sign3.value = ''

  userType.value = 'tussen'
  userIntervalIncluded.value = true
}

function checkAnswer() {
  isChecked.value = true
  const target = currentLevelData.value

  let rootsCorrect = false
  if (target.rootsCount === 1) {
    rootsCorrect = userRoot1.value === target.targetRoots[0]
  } else {
    rootsCorrect = sortedUserRoots.value[0] === target.targetRoots[0] && sortedUserRoots.value[1] === target.targetRoots[1]
  }

  let signsCorrect = false
  if (target.rootsCount === 1) {
    signsCorrect = sign1.value === target.targetSigns[0] && sign2.value === target.targetSigns[1]
  } else {
    if (userRoot1.value >= userRoot2.value && target.rootsCount === 2) {
      attemptCount.value++
      feedback.value = { type: 'error', text: `Zorg dat de kleinste nulwaarde links in de tabel staat! ${getHint()}` }
      isCorrect.value = false
      return
    }
    signsCorrect = sign1.value === target.targetSigns[0] && sign2.value === target.targetSigns[1] && sign3.value === target.targetSigns[2]
  }

  const typeCorrect = userType.value === target.targetType
  const includedCorrect = userIntervalIncluded.value === target.targetIncluded

  if (rootsCorrect && signsCorrect && typeCorrect && includedCorrect) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = {
      type: 'success',
      text: 'Uitstekend! Je hebt de ongelijkheid perfect algebraïsch opgelost.'
    }
  } else {
    attemptCount.value++
    if (!rootsCorrect) {
      feedback.value = { type: 'error', text: `Je nulwaarden (oplossingen van f(x)=0) kloppen niet. ${getHint()}` }
    } else if (!signsCorrect) {
      feedback.value = { type: 'error', text: `De nulwaarden kloppen, maar het tekenschema is fout. Kijk naar de factor a: is het een berg- of dalparabool? ${getHint()}` }
    } else if (!typeCorrect) {
      feedback.value = { type: 'error', text: `Tekenschema klopt! Maar het interval op de getallenlijn is fout. Moet je het gebied met het + of het − teken hebben?` }
    } else if (!includedCorrect) {
      feedback.value = { type: 'error', text: `Bijna! Let op de ongelijkheid. Moeten de nulwaarden open (<, >) of gesloten (≤, ≥) bolletjes zijn?` }
    }
  }
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-blue-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-blue-500' : 'bg-slate-200'"></div>
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

            <div class="text-center bg-blue-50 p-4 border border-blue-200 rounded-xl shadow-sm mb-6">
              <p class="text-sm font-bold text-blue-800 mb-1">Los op:</p>
              <p class="font-mono text-2xl font-black text-blue-600">{{ currentLevelData.inequality }}</p>
            </div>

            <div class="space-y-6">

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label class="block font-bold text-slate-700 mb-2">1. Stel de nulwaarden in</label>
                <div class="space-y-3">
                  <div>
                    <span class="text-xs font-bold text-slate-500">Nulwaarde (links): {{ userRoot1 }}</span>
                    <input type="range" v-model.number="userRoot1" min="-8" max="8" step="1" class="w-full accent-blue-500">
                  </div>
                  <div v-if="currentLevelData.rootsCount > 1">
                    <span class="text-xs font-bold text-slate-500">Nulwaarde (rechts): {{ userRoot2 }}</span>
                    <input type="range" v-model.number="userRoot2" min="-8" max="8" step="1" class="w-full accent-blue-500">
                  </div>
                </div>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label class="block font-bold text-slate-700 mb-2">2. Kies het intervalgebied</label>
                <div class="flex gap-2">
                  <button @click="userType = 'tussen'"
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all"
                          :class="userType === 'tussen' ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Binnen
                  </button>
                  <button @click="userType = 'buiten'"
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all"
                          :class="userType === 'buiten' ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Buiten
                  </button>
                </div>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label class="block font-bold text-slate-700 mb-2">3. Grenzen meerekenen?</label>
                <div class="flex gap-2">
                  <button @click="userIntervalIncluded = true"
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all text-sm"
                          :class="userIntervalIncluded ? 'border-emerald-500 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Ja (≤, ≥)
                  </button>
                  <button @click="userIntervalIncluded = false"
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all text-sm"
                          :class="!userIntervalIncluded ? 'border-emerald-500 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Nee (<, >)
                  </button>
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

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">
                Controleer
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

            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden gap-12">

              <div class="bg-white p-8 rounded-xl shadow-md border border-slate-200 overflow-hidden text-center w-full max-w-lg z-10">
                <p class="font-bold text-slate-700 mb-4 text-left">Tekenschema (klik om te wijzigen):</p>

                <table class="w-full border-collapse">
                   <tr>
                     <td class="border-b-2 border-r-2 border-slate-300 text-lg font-bold text-slate-500 py-4 w-20">x</td>
                     <td class="border-b-2 border-slate-300 py-4"></td>
                     <td class="border-b-2 border-slate-300 font-mono font-bold text-xl text-blue-600">{{ userRoot1 }}</td>
                     <td class="border-b-2 border-slate-300 py-4"></td>
                     <td v-if="currentLevelData.rootsCount > 1" class="border-b-2 border-slate-300 font-mono font-bold text-xl text-blue-600">{{ userRoot2 }}</td>
                     <td v-if="currentLevelData.rootsCount > 1" class="border-b-2 border-slate-300 py-4"></td>
                   </tr>
                   <tr>
                     <td class="text-lg font-bold text-slate-500 py-4 border-r-2 border-slate-300">f(x)</td>

                     <td class="py-4">
                       <button @click="toggleSign('sign1')" class="w-12 h-12 bg-slate-100 rounded hover:bg-slate-200 font-mono text-2xl font-bold text-slate-700 border border-slate-300 transition-colors">
                         {{ sign1 }}
                       </button>
                     </td>

                     <td class="font-mono font-bold text-2xl text-slate-400 py-4">0</td>

                     <td class="py-4">
                       <button @click="toggleSign('sign2')" class="w-12 h-12 bg-slate-100 rounded hover:bg-slate-200 font-mono text-2xl font-bold text-slate-700 border border-slate-300 transition-colors">
                         {{ sign2 }}
                       </button>
                     </td>

                     <td v-if="currentLevelData.rootsCount > 1" class="font-mono font-bold text-2xl text-slate-400 py-4">0</td>

                     <td v-if="currentLevelData.rootsCount > 1" class="py-4">
                       <button @click="toggleSign('sign3')" class="w-12 h-12 bg-slate-100 rounded hover:bg-slate-200 font-mono text-2xl font-bold text-slate-700 border border-slate-300 transition-colors">
                         {{ sign3 }}
                       </button>
                     </td>
                   </tr>
                 </table>
              </div>

              <svg width="400" height="80" viewBox="-120 -40 240 80" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10 px-8 py-4">
                <g v-if="userType === 'tussen'">
                  <rect v-if="currentLevelData.rootsCount > 1" :x="sortedUserRoots[0]*15" y="-10" :width="(sortedUserRoots[1] - sortedUserRoots[0])*15" height="20" fill="#3b82f6" opacity="0.2" class="transition-all duration-300" />
                </g>
                <g v-else>
                  <rect x="-120" y="-10" :width="120 + sortedUserRoots[0]*15" height="20" fill="#3b82f6" opacity="0.2" class="transition-all duration-300" />
                  <rect v-if="currentLevelData.rootsCount > 1" :x="sortedUserRoots[1]*15" y="-10" :width="120 - sortedUserRoots[1]*15" height="20" fill="#3b82f6" opacity="0.2" class="transition-all duration-300" />
                  <rect v-else :x="sortedUserRoots[0]*15" y="-10" :width="120 - sortedUserRoots[0]*15" height="20" fill="#3b82f6" opacity="0.2" class="transition-all duration-300" />
                </g>
                <line x1="-120" y1="0" x2="120" y2="0" stroke="#64748b" stroke-width="3" stroke-linecap="round" />
                <circle :cx="sortedUserRoots[0]*15" cy="0" r="6" :fill="userIntervalIncluded ? '#3b82f6' : 'white'" :stroke="userIntervalIncluded ? 'none' : '#3b82f6'" stroke-width="3" class="transition-all duration-300" />
                <circle v-if="currentLevelData.rootsCount > 1" :cx="sortedUserRoots[1]*15" cy="0" r="6" :fill="userIntervalIncluded ? '#3b82f6' : 'white'" :stroke="userIntervalIncluded ? 'none' : '#3b82f6'" stroke-width="3" class="transition-all duration-300" />
              </svg>

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