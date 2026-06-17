<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquaresFour, PhArrowClockwise, PhHandGrabbing } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Merkwaardige Producten: (a+b)²' },
  instruction: { type: String, default: '(a+b)² is NIET a²+b²!<br/><br/><strong>Opdracht:</strong> Splits het vierkant en ontdek de formule.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhSquaresFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op "Splits Vierkant" om de formule te ontdekken.' })

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  { a: 3, b: 1, label: '(3+1)²', aPx: 225, bPx: 75 },
  { a: 4, b: 2, label: '(4+2)²', aPx: 200, bPx: 100 },
  { a: 5, b: 3, label: '(5+3)²', aPx: 188, bPx: 112 },
]

const currentLevel = computed(() => levels[currentInternalLevel.value])
const isSplit = ref(false)
const userAns = ref('')

function splitSquare() { if (!isCorrect.value) { isSplit.value = true; feedback.value = { type: 'success', text: `Kijk! a² (blauw) + b² (roze) + 2× ab (oranje). Dus (a+b)² = a² + 2ab + b²` } } }

function checkAnswer() {
  isChecked.value = true
  if (userAns.value === 'correct') {
    if (isSplit.value) { isCorrect.value = true; feedback.value = { type: 'success', text: `Briljant! (${currentLevel.value.a}+${currentLevel.value.b})² = ${currentLevel.value.a}² + 2(${currentLevel.value.a}·${currentLevel.value.b}) + ${currentLevel.value.b}² = ${currentLevel.value.a * currentLevel.value.a} + ${2*currentLevel.value.a*currentLevel.value.b} + ${currentLevel.value.b * currentLevel.value.b} = ${(currentLevel.value.a+currentLevel.value.b)**2}.` } }
    else feedback.value = { type: 'error', text: 'Splits eerst het vierkant!' }
  } else {
    isCorrect.value = false
    if (userAns.value === 'wrong1') feedback.value = { type: 'error', text: 'Je mist 1 ab-rechthoek! Er zijn TWEE oranje rechthoeken (ab + ab = 2ab).' }
    else if (userAns.value === 'wrong2') feedback.value = { type: 'error', text: 'Dat is net de fout die we willen aantonen! De twee oranje ab-rechthoeken ontbreken.' }
    else feedback.value = { type: 'error', text: 'Kies een formule.' }
  }
}

function resetActivityState() { isCorrect.value = false; isChecked.value = false; isSplit.value = false; feedback.value = { type: 'info', text: 'Klik op "Splits Vierkant" om de formule te ontdekken.' }; userAns.value = '' }

function nextLevel() { if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState() } else emit('complete') }

function goToNextStep() { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') }

watch(() => props.isOpen, (val) => { if (val) { currentInternalLevel.value = 0; resetActivityState(); window.addEventListener('keydown', handleKeydown); if (props.fullscreen) nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}) }); nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) }) } else { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); window.removeEventListener('keydown', handleKeydown); shouldPulse.value = false } }, { immediate: true })
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-teal-100"><component :is="props.icon" weight="fill" class="w-6 h-6 text-teal-600" /></div>
          <div><h2 class="text-lg font-bold text-slate-900">{{ title }}</h2><p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p></div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm text-slate-600" v-html="props.instruction"></div>
            <div class="p-4 mt-6 border border-teal-200 bg-teal-50 rounded-xl shadow-inner text-center">
              <label class="block text-sm font-bold text-teal-900 mb-2">Conclusie: (a + b)² = ...</label>
              <select v-model="userAns" :disabled="isCorrect" class="w-full p-3 border-2 border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 font-bold text-slate-700 bg-white">
                <option value="" disabled>Kies de formule...</option>
                <option value="wrong2">a² + b²</option>
                <option value="wrong1">a² + ab + b²</option>
                <option value="correct">a² + 2ab + b²</option>
              </select>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]" :disabled="userAns === ''">Controleer</button>
              <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevel" class="flex-1 py-3 font-bold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500">Volgend Level</button>
              <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500"><span>Afronden</span><PhArrowRight weight="bold" /></button>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
            <div class="w-full max-w-4xl flex flex-col items-center">
              <div class="font-mono font-black text-2xl text-slate-600 mb-4">(a + b)² = ({{currentLevel.a}} + {{currentLevel.b}})²</div>
              <div class="mb-8">
                <button @click="splitSquare" :disabled="isCorrect || isSplit" class="px-6 py-3 font-bold bg-slate-800 text-white rounded-xl shadow-lg flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50">
                  <PhHandGrabbing weight="bold" class="w-6 h-6" /> Splits Vierkant
                </button>
              </div>
              <div class="relative bg-white shadow-xl rounded-2xl border-4 border-slate-300 p-12 flex items-center justify-center">
                <div class="relative" :style="{ width: (currentLevel.aPx + currentLevel.bPx) + 'px', height: (currentLevel.aPx + currentLevel.bPx) + 'px' }">
                  <div class="absolute top-0 left-0 flex items-center justify-center shadow-sm transition-all duration-700 ease-in-out" :style="{ width: currentLevel.aPx + 'px', height: currentLevel.aPx + 'px' }" :class="isSplit ? '-translate-x-4 -translate-y-4' : ''" style="background: rgba(59,130,246,0.15); border: 4px solid #3b82f6;">
                    <span class="font-black text-4xl text-blue-600">a²</span>
                  </div>
                  <div class="absolute top-0 flex items-center justify-center shadow-sm transition-all duration-700 ease-in-out" :style="{ left: currentLevel.aPx + 'px', width: currentLevel.bPx + 'px', height: currentLevel.aPx + 'px' }" :class="isSplit ? 'translate-x-4 -translate-y-4' : ''" style="background: rgba(251,146,60,0.15); border: 4px solid #f97316;">
                    <span class="font-black text-2xl text-orange-600">ab</span>
                  </div>
                  <div class="absolute left-0 flex items-center justify-center shadow-sm transition-all duration-700 ease-in-out" :style="{ top: currentLevel.aPx + 'px', width: currentLevel.aPx + 'px', height: currentLevel.bPx + 'px' }" :class="isSplit ? '-translate-x-4 translate-y-4' : ''" style="background: rgba(251,146,60,0.15); border: 4px solid #f97316;">
                    <span class="font-black text-2xl text-orange-600">ab</span>
                  </div>
                  <div class="absolute flex items-center justify-center shadow-sm transition-all duration-700 ease-in-out" :style="{ top: currentLevel.aPx + 'px', left: currentLevel.aPx + 'px', width: currentLevel.bPx + 'px', height: currentLevel.bPx + 'px' }" :class="isSplit ? 'translate-x-4 translate-y-4' : ''" style="background: rgba(236,72,153,0.15); border: 4px solid #ec4899;">
                    <span class="font-black text-2xl text-pink-600">b²</span>
                  </div>
                  <div class="absolute -top-8 font-black text-xl text-slate-500 transition-opacity" :class="isSplit ? 'opacity-0' : 'opacity-100'" :style="{ left: (currentLevel.aPx / 2 - 10) + 'px' }">a</div>
                  <div class="absolute -top-8 font-black text-xl text-slate-500 transition-opacity" :class="isSplit ? 'opacity-0' : 'opacity-100'" :style="{ left: (currentLevel.aPx + currentLevel.bPx / 2) + 'px' }">b</div>
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>