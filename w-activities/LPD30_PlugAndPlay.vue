<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhPuzzlePiece, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Getalwaarde: Formules Inpluggen' },
  instruction: {
    type: String,
    default: 'Een formule is een template met lege vakjes. Je "plugt" getallen in de juiste vakjes.<br/><br/><strong>Opdracht:</strong> Klik op een leeg vakje in de formule, kies het juiste getal, en bereken het antwoord.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhPuzzlePiece }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op een leeg vakje in de formule, en klik daarna op het getal in de tekening.' })

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

const attemptCount = ref(0)

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const shapeConfigs = [
  {
    shape: 'driehoek', formula: '(b × h) / 2', label: 'Oppervlakte driehoek',
    slots: ['b', 'h'], hasDiv2: true,
    svg: 'M40,240 L360,240 L120,40',
    tagStyles: [
      { key: 'b', style: 'bottom-[20px] left-[50%] -translate-x-1/2 border-emerald-500 text-emerald-700' },
      { key: 'h', style: 'top-[140px] left-[130px] border-red-500 text-red-600' },
      { key: 'd', style: 'top-[140px] left-[10px] border-slate-400 text-slate-500' }
    ]
  },
  {
    shape: 'rechthoek', formula: 'l × b', label: 'Oppervlakte rechthoek',
    slots: ['l', 'b'], hasDiv2: false,
    svg: 'M40,60 L360,60 L360,260 L40,260',
    tagStyles: [
      { key: 'l', style: 'top-[140px] left-[50%] -translate-x-1/2 border-blue-500 text-blue-700' },
      { key: 'b', style: 'bottom-[50px] left-[180px] border-blue-500 text-blue-700' },
      { key: 'd', style: 'top-[90px] left-[40px] border-slate-400 text-slate-500' }
    ]
  },
  {
    shape: 'parallellogram', formula: 'b × h', label: 'Oppervlakte parallellogram',
    slots: ['b', 'h'], hasDiv2: false,
    svg: 'M40,240 L360,240 L280,60 L-40,60',
    tagStyles: [
      { key: 'b', style: 'bottom-[20px] left-[50%] -translate-x-1/2 border-purple-500 text-purple-700' },
      { key: 'h', style: 'top-[140px] left-[120px] border-purple-500 text-purple-700' },
      { key: 'd', style: 'top-[140px] left-[260px] border-slate-400 text-slate-500' }
    ]
  }
]

function generateLevel() {
  const l = []
  for (let i = 0; i < 3; i++) {
    const cfg = shapeConfigs[i]
    let v1 = randomInt(4, 9)
    let v2 = randomInt(3, 7)

    // Ensure integer target for division
    if (cfg.hasDiv2 && (v1 * v2) % 2 !== 0) {
      v2++
    }

    let distractor
    do { distractor = randomInt(3, 10) } while (distractor === v1 || distractor === v2)

    const target = cfg.hasDiv2 ? (v1 * v2) / 2 : v1 * v2

    const tags = cfg.tagStyles.map(t => ({
      val: t.key === 'd' ? distractor : (t.key === cfg.slots[0] ? v1 : v2),
      style: t.style
    }))

    l.push({
      shape: cfg.shape,
      formula: cfg.formula,
      label: cfg.label,
      slots: cfg.slots,
      values: { [cfg.slots[0]]: v1, [cfg.slots[1]]: v2, distractor },
      target,
      svg: cfg.svg,
      tags,
    })
  }
  levels.value = l
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value] || levels.value[0])
const slotData = ref({})
const activeSlot = ref(null)
const userAns = ref(null)

function selectSlot(slot) {
  if (isCorrect.value) return
  activeSlot.value = slot
}

function assignValue(val) {
  const lvl = currentLevel.value
  if (activeSlot.value && lvl.slots.includes(activeSlot.value)) {
    slotData.value[activeSlot.value] = val
    activeSlot.value = null
  }
}

function getHintText(count, lvl) {
  const bSlot = lvl.slots[0]
  const hSlot = lvl.slots[1]
  const correctB = lvl.values[bSlot]
  const correctH = lvl.values[hSlot]
  if (count === 1) {
    return `Hint: kijk naar de zijden in de tekening. Welke getallen passen bij ${bSlot} en ${hSlot}?`
  } else if (count === 2) {
    return `Hint: ${bSlot} = ${correctB}, ${hSlot} = ${correctH}. Daarna is de formule ${lvl.formula.replace('b', correctB).replace('h', correctH).replace('l', correctB)} = ?`
  } else {
    const calc = lvl.formula.includes('/') ? `(${correctB} × ${correctH}) / 2 = ${lvl.target}` : `${correctB} × ${correctH} = ${lvl.target}`
    return `Het juiste antwoord is ${calc}.`
  }
}

function resetActivityState() {
  isCorrect.value = false
  isChecked.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Klik op een leeg vakje in de formule, en klik daarna op het getal in de tekening.' }
  slotData.value = {}
  activeSlot.value = null
  userAns.value = null
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
  } else {
    emit('complete')
  }
}

function checkAnswer() {
  isChecked.value = true
  const lvl = currentLevel.value
  const sd = slotData.value
  const b = sd[lvl.slots[0]]
  const h = sd[lvl.slots[1]]
  const correctB = lvl.values[lvl.slots[0]]
  const correctH = lvl.values[lvl.slots[1]]

  if (b === correctB && h === correctH && userAns.value === lvl.target) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: `Perfect! ${lvl.formula} = ${b} × ${h} ${lvl.formula.includes('/') ? '/ 2' : ''} = ${lvl.target}.` }
  } else {
    attemptCount.value++
    isCorrect.value = false
    if (b === undefined || h === undefined) {
      feedback.value = { type: 'error', text: `Plug eerst ${lvl.slots[0]} en ${lvl.slots[1]} in! Klik op het vakje en kies het getal. ${getHintText(attemptCount.value, lvl)}` }
    } else if (b === lvl.values.distractor || h === lvl.values.distractor) {
      feedback.value = { type: 'error', text: `Fout ingeplugd! Je koos de afleider (${lvl.values.distractor}). Kijk naar de juiste zijde. ${getHintText(attemptCount.value, lvl)}` }
    } else if (b === correctB && h === correctH && userAns.value !== lvl.target) {
      if (lvl.formula.includes('/') && userAns.value === b * h) {
        feedback.value = { type: 'error', text: `Vergeet niet te delen door 2! ${getHintText(attemptCount.value, lvl)}` }
      } else {
        feedback.value = { type: 'error', text: `Ingeplugd: (${b} × ${h})${lvl.formula.includes('/') ? ' / 2' : ''}. De berekening klopt niet. ${getHintText(attemptCount.value, lvl)}` }
      }
    } else {
      feedback.value = { type: 'error', text: `Controleer welke getallen waar horen in de formule. ${getHintText(attemptCount.value, lvl)}` }
    }
  }
}

function goToNextStep() {
  if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
  else emit('complete')
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    generateLevel()
    resetActivityState()
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}) })
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
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
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }} — {{ currentLevel.shape }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm text-slate-600" v-html="props.instruction"></div>
            <div class="p-4 mt-6 border border-emerald-200 bg-emerald-50 rounded-xl shadow-inner">
              <label class="block text-sm font-bold text-emerald-900 mb-4">Inpluggen:</label>
              <div class="flex items-center justify-center gap-4 text-3xl font-black text-slate-700 mb-4">
                <div class="flex flex-col items-center gap-2">
                  <div class="flex items-center gap-2">
                    <button @click="selectSlot(currentLevel.slots[0])" :disabled="isCorrect"
                      class="min-w-[60px] h-12 bg-white rounded-lg border-2 shadow-sm flex items-center justify-center transition-all hover:scale-105"
                      :class="activeSlot === currentLevel.slots[0] ? 'border-emerald-500 ring-4 ring-emerald-200' : (slotData[currentLevel.slots[0]] ? 'border-emerald-600 text-emerald-700' : 'border-slate-300 text-slate-400 border-dashed')">
                      {{ slotData[currentLevel.slots[0]] !== undefined ? slotData[currentLevel.slots[0]] : `[${currentLevel.slots[0]}]` }}
                    </button>
                    <span class="text-xl" v-if="currentLevel.formula.includes('×')">×</span>
                    <button @click="selectSlot(currentLevel.slots[1])" v-if="currentLevel.slots.length > 1" :disabled="isCorrect"
                      class="min-w-[60px] h-12 bg-white rounded-lg border-2 shadow-sm flex items-center justify-center transition-all hover:scale-105"
                      :class="activeSlot === currentLevel.slots[1] ? 'border-emerald-500 ring-4 ring-emerald-200' : (slotData[currentLevel.slots[1]] ? 'border-emerald-600 text-emerald-700' : 'border-slate-300 text-slate-400 border-dashed')">
                      {{ slotData[currentLevel.slots[1]] !== undefined ? slotData[currentLevel.slots[1]] : `[${currentLevel.slots[1]}]` }}
                    </button>
                  </div>
                  <div v-if="currentLevel.formula.includes('/')" class="w-full">
                    <div class="h-1 w-full bg-slate-700 rounded-full my-1"></div>
                    <span class="block text-center text-xl">2</span>
                  </div>
                </div>
                <span class="ml-4 text-xl">= ?</span>
              </div>
              <div class="flex items-center gap-2 border-t border-emerald-200 pt-4">
                <span class="font-bold text-sm text-emerald-800">Antwoord:</span>
                <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                  class="flex-1 font-bold text-xl p-2 border-2 border-emerald-300 rounded focus:border-emerald-500 text-center bg-white" />
              </div>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
              :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="userAns === null" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Bereken</button>
              <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevel" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">Volgend Level</button>
              <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">
                <span>Afronden</span><PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
            <div class="w-full max-w-2xl flex flex-col items-center">
              <div class="relative bg-white shadow-xl rounded-3xl overflow-hidden border-4 border-slate-200 p-12">
                <svg width="400" height="300" viewBox="0 0 400 300" class="block">
                  <g stroke="#e2e8f0" stroke-width="1">
                    <line v-for="i in 9" :key="'vg'+i" :x1="i * 40" y1="0" :x2="i * 40" y2="300" />
                    <line v-for="i in 7" :key="'hg'+i" x1="0" :y1="i * 40" x2="400" :y2="i * 40" />
                  </g>
                  <polygon :points="currentLevel.svg" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="4" stroke-linejoin="round" />
                </svg>
                <button v-for="tag in currentLevel.tags" :key="tag.val" @click="assignValue(tag.val)"
                  :class="`absolute ${tag.style} bg-white px-3 py-1 rounded-full border-2 font-black shadow-md transition-all hover:scale-110 active:scale-95 ${activeSlot ? 'animate-pulse ring-4' : ''}`">
                  {{ tag.val }}
                </button>
              </div>
              <div class="mt-6 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                Klik op een vakje in de formule (links), en kies een getal uit de tekening!
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>