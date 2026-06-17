<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhArrowsOutLine,
  PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Inproduct (Scalair product) van Vectoren'
  },
  instruction: {
    type: String,
    default: 'Pas de y-coördinaat van vector b aan met de slider zodat vector a en vector b loodrecht op elkaar staan. Tip: Twee vectoren staan loodrecht als hun inproduct gelijk is aan 0.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhArrowsOutLine }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// --- Randomization: generateLevel() ---
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel(lvl) {
  let aRange, bxRange, sliderRange
  if (lvl === 0) {
    aRange = [-3, 3]
    bxRange = [-3, 3]
    sliderRange = [-4, 6]
  } else if (lvl === 1) {
    aRange = [-5, 5]
    bxRange = [-5, 5]
    sliderRange = [-6, 10]
  } else {
    aRange = [-7, 7]
    bxRange = [-6, 6]
    sliderRange = [-8, 12]
  }

  let vecA, vecB_x, correctB_y
  // Rejection sampling: find values that produce an integer answer
  for (let attempt = 0; attempt < 50; attempt++) {
    const ax = randInt(aRange[0], aRange[1])
    const ay = randInt(aRange[0], aRange[1])
    const bx = randInt(bxRange[0], bxRange[1])
    if (ay === 0 || bx === 0) continue
    // dot = ax*bx + ay*by = 0  =>  by = -(ax*bx)/ay
    if ((-(ax * bx)) % ay !== 0) continue
    const by = -(ax * bx) / ay
    if (by < sliderRange[0] || by > sliderRange[1]) continue
    vecA = { x: ax, y: ay }
    vecB_x = bx
    correctB_y = by
    break
  }
  // Fallback: if no valid random, use a known-good pair
  if (!vecA) {
    const fallbacks = [
      { a: { x: 2, y: 1 }, bx: -2, by: 4, sr: [-4, 6] },
      { a: { x: 4, y: 2 }, bx: -2, by: 4, sr: [-6, 10] },
      { a: { x: 6, y: 3 }, bx: -3, by: 6, sr: [-8, 12] }
    ]
    const f = fallbacks[lvl] || fallbacks[0]
    vecA = f.a
    vecB_x = f.bx
    correctB_y = f.by
  }

  // Default slider position: slightly off the correct value
  const defaultB_y = correctB_y + (randInt(1, 2) * (Math.random() > 0.5 ? 1 : -1))

  const insLvl =
    lvl === 0
      ? 'Level 1: Start met een eenvoudig voorbeeld.<br/><br/>Vector a = (' + vecA.x + ', ' + vecA.y + ') en vector b = (' + vecB_x + ', ?). Pas de y-coördinaat van b aan zodat a en b loodrecht op elkaar staan.'
      : lvl === 1
        ? 'Level 2: Pas de y-coördinaat van vector b aan met de slider zodat vector a en vector b loodrecht op elkaar staan. Tip: Twee vectoren staan loodrecht als hun inproduct gelijk is aan 0.'
        : 'Level 3: Grotere getallen, zelfde principe.<br/><br/>Vector a = (' + vecA.x + ', ' + vecA.y + ') en vector b = (' + vecB_x + ', ?). Vind de juiste y-coördinaat zodat het inproduct 0 wordt.'

  return {
    vecA,
    vecB_x,
    defaultB_y,
    correctB_y,
    sliderMin: sliderRange[0],
    sliderMax: sliderRange[1],
    instruction: insLvl,
    successFeedback:
      lvl === 0
        ? 'Perfect! Het inproduct is 0, de vectoren staan loodrecht. Klaar voor level 2?'
        : lvl === 1
          ? 'Perfect! Het inproduct is 0, de vectoren staan loodrecht.'
          : 'Uitstekend! Je begrijpt het inproduct van vectoren volledig.'
  }
}

function generateLevels() {
  const arr = []
  for (let i = 0; i < totalInternalLevels; i++) {
    arr.push(generateLevel(i))
  }
  levels.value = arr
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Activity State — derived from current level
const vecA = computed(() => currentLevelData.value.vecA)
const vecB_x = computed(() => currentLevelData.value.vecB_x)
const vecB_y = ref(0)

const dotProduct = computed(() => {
  return vecA.value.x * vecB_x.value + vecA.value.y * vecB_y.value
})

function getHint() {
  const c = attemptCount.value
  if (c === 1) return 'Hint: Het inproduct moet 0 zijn. Gebruik de formule: x1*x2 + y1*y2 = 0.'
  if (c === 2) return 'Hint: a = (' + vecA.value.x + ', ' + vecA.value.y + '), b.x = ' + vecB_x.value + '. Bereken welke y dit nul maakt: (' + vecA.value.x + ' * ' + vecB_x.value + ') + (' + vecA.value.y + ' * y) = 0.'
  return 'Hint: Los op: ' + vecA.value.y + ' * y = ' + (-(vecA.value.x * vecB_x.value)) + ', dus y = ' + (-(vecA.value.x * vecB_x.value)) + ' / ' + vecA.value.y + ' = ?'
}

function resetActivityState() {
  generateLevels()
  attemptCount.value = 0
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  vecB_y.value = currentLevelData.value.defaultB_y;
}

function nextLevel() {
    currentInternalLevel.value++
    resetActivityState()
}

function handleLevelComplete() {
    if (currentInternalLevel.value < totalInternalLevels - 1) {
        nextLevel()
    } else {
        goToNextStep()
    }
}

function checkAnswer() {
  isChecked.value = true;
  if (dotProduct.value === 0) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: currentLevelData.value.successFeedback
    }
  } else {
    attemptCount.value++
    isCorrect.value = false
    feedback.value = {
      type: 'error',
      text: 'Niet helemaal. Het inproduct is nu ' + dotProduct.value + '. Het moet 0 zijn.<br/><br/>' + getHint()
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState();
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-indigo-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-3 mt-0.5">
              <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
              <div class="flex items-center gap-2 text-xs text-slate-400">
                <span class="font-medium">Level {{ currentInternalLevel + 1 }}/{{ totalInternalLevels }}</span>
                <div class="flex items-center gap-1">
                  <span v-for="lvl in totalInternalLevels" :key="lvl"
                        class="w-2 h-2 rounded-full transition-all duration-300"
                        :class="lvl - 1 <= currentInternalLevel ? 'bg-indigo-400' : 'bg-slate-300'">
                  </span>
                </div>
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
            <div class="mb-6 prose prose-sm text-slate-600" v-html="currentLevelData.instruction"></div>

            <div class="p-6 mt-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6">

              <div class="font-mono text-sm space-y-2">
                <p><span class="text-blue-600 font-bold">a</span> = ({{ vecA.x }}, {{ vecA.y }})</p>
                <p><span class="text-emerald-600 font-bold">b</span> = ({{ vecB_x }}, {{ vecB_y }})</p>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Pas y-coördinaat van b aan:</label>
                <input type="range" v-model.number="vecB_y" :min="currentLevelData.sliderMin" :max="currentLevelData.sliderMax" step="1" class="w-full accent-emerald-600">
                <div class="flex justify-between mt-1 text-xs text-slate-400">
                  <span>{{ currentLevelData.sliderMin }}</span><span>{{ currentLevelData.sliderMax }}</span>
                </div>
              </div>

              <div class="bg-white p-4 rounded border border-slate-200">
                <p class="text-sm font-bold text-slate-500 mb-2">Inproduct a &middot; b:</p>
                <p class="font-mono text-sm text-slate-600">(x&8321; &middot; x&#x2082;) + (y&8321; &middot; y&#x2082;)</p>
                <p class="font-mono text-sm text-slate-600">({{ vecA.x }} &middot; {{ vecB_x }}) + ({{ vecA.y }} &middot; {{ vecB_y }})</p>
                <p class="font-mono font-bold text-lg text-slate-800 mt-2">= {{ dotProduct }}</p>
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
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <!-- Slider + check button: keep Controleer for number/slider interaction -->
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>

              <button v-else @click="handleLevelComplete" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <div class="relative w-80 h-80 flex items-center justify-center">
                <!-- SVG Vector Grid -->
                <svg width="320" height="320" viewBox="-160 -160 320 320" class="overflow-visible bg-white/50 rounded shadow-sm border border-slate-300">
                  <defs>
                    <marker id="head-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
                    </marker>
                    <marker id="head-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
                    </marker>
                  </defs>

                  <!-- Axes -->
                  <line x1="-160" y1="0" x2="160" y2="0" stroke="#cbd5e1" stroke-width="2" />
                  <line x1="0" y1="-160" x2="0" y2="160" stroke="#cbd5e1" stroke-width="2" />

                  <!-- Vector A -->
                  <line x1="0" y1="0" :x2="vecA.x * 20" :y2="-vecA.y * 20" stroke="#2563eb" stroke-width="3" marker-end="url(#head-a)" />
                  <text :x="(vecA.x * 20) + 10" :y="(-vecA.y * 20) + 5" fill="#2563eb" font-weight="bold">a</text>

                  <!-- Vector B -->
                  <line x1="0" y1="0" :x2="vecB_x * 20" :y2="-vecB_y * 20" stroke="#059669" stroke-width="3" marker-end="url(#head-b)" />
                  <text :x="(vecB_x * 20) - 20" :y="(-vecB_y * 20) - 5" fill="#059669" font-weight="bold">b</text>

                  <!-- Right Angle indicator when dotProduct === 0 -->
                  <g v-if="dotProduct === 0">
                    <path d="M 12 -6 L 18 6 L 6 12" fill="none" stroke="#ef4444" stroke-width="2" />
                  </g>
                </svg>
              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
:root { font-family: 'Inter', sans-serif; }

.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 20px 20px;
    background-position: center center;
}

.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>