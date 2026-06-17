<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquaresFour, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Patronen: De Vierhoeksgetallen' },
  instruction: { type: String, default: 'Niet elk patroon is lineair. Soms groeit iets véél sneller!<br/><br/><strong>Opdracht:</strong> Kijk naar de figuren. Ontdek het patroon en vul het antwoord in.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSquaresFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Ontdek het patroon en vul het antwoord in.' })

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  { name: 'Vierkantsgetallen', sequence: [1, 4, 9, 16], formula: 'n²', exp: 2, fig4Ans: 16, color: 'pink' },
  { name: 'Driehoeksgetallen', sequence: [1, 3, 6, 10], formula: 'n(n+1)/2', exp: null, fig4Ans: 10, color: 'blue' },
  { name: 'Vijfhoekgetallen', sequence: [1, 5, 12, 22], formula: 'n(3n-1)/2', exp: null, fig4Ans: 22, color: 'purple' },
]

const currentLevel = computed(() => levels[currentInternalLevel.value])
const ansFig4 = ref(null)
const ansExp = ref(null)
const showFig4 = ref(false)

const colorMap = { pink: 'bg-pink-100 text-pink-600 border-pink-200', blue: 'bg-blue-100 text-blue-600 border-blue-200', purple: 'bg-purple-100 text-purple-600 border-purple-200' }
const colorMapBg = { pink: 'bg-pink-500 border-pink-700', blue: 'bg-blue-500 border-blue-700', purple: 'bg-purple-500 border-purple-700' }

function checkAnswer() {
  isChecked.value = true
  const lvl = currentLevel.value
  if (ansFig4.value === lvl.fig4Ans) {
    if (lvl.exp !== null && ansExp.value !== lvl.exp) {
      isCorrect.value = false
      feedback.value = { type: 'error', text: `Figuur 4 klopt (${lvl.fig4Ans})! Maar de formule is n${lvl.exp === 2 ? '²' : ''}. Wat is de exponent?` }
    } else {
      isCorrect.value = true
      showFig4.value = true
      feedback.value = { type: 'success', text: `Magistraal! Dit zijn de ${lvl.name}: ${lvl.sequence.slice(0,3).join(', ')}... Het patroon volgt ${lvl.formula}.` }
    }
  } else {
    isCorrect.value = false
    feedback.value = { type: 'error', text: `Het aantal in Figuur 4 klopt niet. Het patroon is: ${lvl.sequence.slice(0,3).join(', ')}, ...` }
  }
}

function resetActivityState() {
  isCorrect.value = false; isChecked.value = false; showFig4.value = false
  feedback.value = { type: 'info', text: 'Ontdek het patroon en vul het antwoord in.' }
  ansFig4.value = null; ansExp.value = null
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
  } else { emit('complete') }
}

function goToNextStep() {
  if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
  else emit('complete')
}

watch(() => props.isOpen, (val) => {
  if (val) { currentInternalLevel.value = 0; resetActivityState(); window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}) })
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); window.removeEventListener('keydown', handleKeydown); shouldPulse.value = false }
}, { immediate: true })
function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
const handleFullscreenChange = () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); document.removeEventListener('fullscreenchange', handleFullscreenChange); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}) })
</script>
<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg" :class="colorMap[currentLevel.color]">
            <component :is="props.icon" weight="fill" class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }} — {{ currentLevel.name }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm text-slate-600" v-html="props.instruction"></div>
            <div class="p-4 mt-6 border rounded-xl shadow-inner flex flex-col gap-6" :class="`${currentLevel.color === 'pink' ? 'border-pink-200 bg-pink-50' : currentLevel.color === 'blue' ? 'border-blue-200 bg-blue-50' : 'border-purple-200 bg-purple-50'}`">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold" :class="`text-${currentLevel.color}-900`">1. Hoeveel blokjes in Figuur 4?</label>
                <input type="number" v-model.number="ansFig4" placeholder="..." :disabled="isCorrect" class="w-full font-bold text-lg p-2 border-2 rounded focus:border-${currentLevel.color}-500 text-center"
                  :class="`border-${currentLevel.color}-300`" />
              </div>
              <div v-if="currentLevel.exp !== null" class="flex flex-col gap-2 border-t pt-4" :class="`border-${currentLevel.color}-200`">
                <label class="text-sm font-bold" :class="`text-${currentLevel.color}-900`">2. Algemene Formule (Figuur n):</label>
                <div class="flex items-center justify-center gap-2 font-black text-3xl text-slate-700 bg-white p-3 rounded-lg border" :class="`border-${currentLevel.color}-200`">
                  <span>A = n</span>
                  <input type="number" v-model.number="ansExp" placeholder="?" :disabled="isCorrect" class="w-16 font-bold text-xl p-1 -mt-4 border-b-2 focus:outline-none text-center"
                    :class="`border-${currentLevel.color}-300 focus:border-${currentLevel.color}-500 text-${currentLevel.color}-600`" />
                </div>
              </div>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
              :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]" :disabled="ansFig4 === null">Controleer</button>
              <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevel" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">Volgend Level</button>
              <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">
                <span>Afronden</span><PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
            <div class="w-full max-w-4xl flex items-end justify-center gap-8 min-h-[300px]">
              <div v-for="(figCount, figIdx) in 4" :key="'fig'+figIdx" class="flex flex-col items-center gap-4"
                :class="figIdx === 3 ? 'transition-all duration-1000' + (showFig4 ? ' opacity-100 translate-y-0' : ' opacity-30 translate-y-4 blur-sm') : ''">
                <div v-if="figIdx < 3 || showFig4 || currentInternalLevel === 1" class="grid gap-1" :style="{ gridTemplateColumns: `repeat(${figIdx + 1}, 1fr)` }">
                  <div v-for="i in currentLevel.sequence[figIdx]" :key="'f'+(figIdx+1)+i" class="w-10 h-10 rounded-sm shadow-sm" :class="colorMapBg[currentLevel.color]"></div>
                </div>
                <div v-else class="w-[176px] h-[176px] border-4 border-dashed border-slate-300 rounded-xl flex items-center justify-center">
                  <span class="font-black text-4xl text-slate-300">?</span>
                </div>
                <span class="font-bold uppercase text-xs tracking-widest text-slate-500">Fig {{ figIdx + 1 }}</span>
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
@keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
</style>