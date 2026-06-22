<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMapPin, PhArrowClockwise, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Coordinaten: De Schatkaart' }, instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhMapPin }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false)
const isCorrect = ref(false); const celebrationDone = ref(false); const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const attemptCount = ref(0)
const showWorkedExample = ref(false); const showReflection = ref(false); const reflectionAnswer = ref(''); const lpdConfirmed = ref(false)

function randomInt(m, M) { return Math.floor(Math.random() * (M - m + 1)) + m }
const levels = ref([])
function generateLevel() {
  const l = []
  for (let i = 0; i < 3; i++) {
    let x, y; do { x = randomInt(-3,3); y = randomInt(-3,3) } while (x === 0 || y === 0 || x === y); l.push({ targetX: x, targetY: y })
  }
  levels.value = l
}
const currentLevel = computed(() => levels.value[currentInternalLevel.value] || { targetX: 0, targetY: 0 })
const userX = ref(null); const userY = ref(null)

function clickGrid(x, y) { if (isCorrect.value) return; userX.value = x; userY.value = y; checkAnswer() }

function resetActivityState() { isCorrect.value = false; celebrationDone.value = false; isChecked.value = false; attemptCount.value = 0; feedback.value = { type: 'info', text: 'Klik op een kruispunt.' }; userX.value = null; userY.value = null; showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false }

function getHintText(t) {
  if (attemptCount.value === 1) return `De schat ligt in kwadrant ${t.targetX > 0 ? (t.targetY > 0 ? 'I (x>0, y>0)' : 'IV (x>0, y<0)') : (t.targetY > 0 ? 'II (x<0, y>0)' : 'III (x<0, y<0)')}.`
  if (attemptCount.value === 2) return `x = ${t.targetX}. Tel ${Math.abs(t.targetX)} ${t.targetX > 0 ? 'rechts' : 'links'} van 0.`
  return `Antwoord = (${t.targetX}, ${t.targetY}).`
}

function nextLevelTransition() { if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) } else { emit('complete') } }

function checkAnswer() {
  isChecked.value = true; const t = currentLevel.value
  if (userX.value === t.targetX && userY.value === t.targetY) {
    isCorrect.value = true; feedback.value = { type: 'success', text: `Schat gevonden op (${t.targetX}, ${t.targetY})! Het assenstelsel werkt als een stratenplan: x zegt hoe ver horizontaal, y zegt hoe ver verticaal. De oorsprong (0,0) is het vertrekpunt.` }
  } else { attemptCount.value++
    if (userX.value === t.targetY && userY.value === t.targetX) feedback.value = { type: 'error', text: `Oeps! Je draaide x en y om! Eerst horizontaal (x), dan verticaal (y). ${getHintText(t)}` }
    else feedback.value = { type: 'error', text: `Hier ligt geen schat. Doel was (${t.targetX}, ${t.targetY}). ${getHintText(t)}` }
  }
}

function goToNextStep() { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') }

watch(() => props.isOpen, (val) => { if (val) { generateLevel(); currentInternalLevel.value = 0; resetActivityState(); nextTick(() => mainArea.value?.focus()); window.addEventListener('keydown', handleKeydown) } else { window.removeEventListener('keydown', handleKeydown) } }, { immediate: true })
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
        <div><h2 class="text-lg font-bold text-slate-900">{{ title }}</h2><p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p></div>
      </div>
      <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100"><PhX class="w-6 h-6" /></button>
    </header>
    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />

          <div class="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <button @click="showWorkedExample = !showWorkedExample" class="flex items-center gap-2 text-sm font-bold text-indigo-700 w-full text-left">
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Schatkaart
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>Stap 1:</strong> Bepaal het kwadrant. x>0 = rechts, x<0 = links. y>0 = omhoog, y<0 = omlaag.</p>
              <p><strong>Stap 2:</strong> Tel het aantal stappen horizontaal vanaf 0.</p>
              <p><strong>Stap 3:</strong> Tel het aantal stappen verticaal vanaf 0.</p>
              <p class="font-bold text-indigo-600">Schat = (x, y). Eerst horizontaal, dan verticaal.</p>
            </div>
          </div>

          <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner text-center">
            <label class="block text-sm font-bold text-slate-700 mb-2">Jouw klik:</label>
            <div class="flex items-center justify-center gap-2 text-3xl font-black text-slate-700">
              <span>(</span><div class="w-16 p-2 rounded-lg shadow-sm border" :class="userX !== null ? 'border-amber-400 bg-white text-amber-600' : 'border-slate-200 bg-slate-50 text-slate-300'">{{ userX !== null ? userX : 'x' }}</div><span>,</span>
              <div class="w-16 p-2 rounded-lg shadow-sm border" :class="userY !== null ? 'border-blue-300 bg-white text-blue-600' : 'border-slate-200 bg-slate-50 text-slate-300'">{{ userY !== null ? userY : 'y' }}</div><span>)</span>
            </div>
            <p class="mt-3 text-xs text-amber-600 font-medium">Tip: Kwadrant { currentLevel.targetX > 0 && currentLevel.targetY > 0 ? 'I' : currentLevel.targetX < 0 && currentLevel.targetY > 0 ? 'II' : currentLevel.targetX < 0 && currentLevel.targetY < 0 ? 'III' : 'IV' }</p>
          </div>

          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 0">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op!</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>Altijd eerst x (horizontaal), dan y (verticaal).</li>
              <li>Let op de tekens: -x is links, -y is omlaag.</li>
            </ul>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">Het cartesisch stelsel deelt het vlak in vier kwadranten. De x-as (horizontaal) en y-as (verticaal) geven samen een uniek adres aan elk punt. Positieve getallen zijn rechts en omhoog, negatieve getallen links en omlaag. Deze standaardnotatie wordt wereldwijd gebruikt in wiskunde, navigatie en techniek.</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom gebruiken we vier kwadranten in een assenstelsel? Wat is het nut van negatieve coördinaten?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik kan een punt in het cartesisch vlak aanduiden met coördinaten (x, y).</p>
            <div class="flex items-center gap-2"><input type="checkbox" id="lpd-treasure" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-treasure" class="text-xs text-emerald-700 font-medium">Ik bevestig.</label></div>
          </div>
        </div>
        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-snug">{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
            <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevelTransition" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500">Volgend Level</button>
            <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500"><span>Afronden</span><PhArrowRight weight="bold" /></button>
          </div>
        </div>
      </div>
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-map">
          <div class="relative bg-[#fdfbf7] shadow-md rounded-xl overflow-hidden border-4 border-slate-800 p-4">
            <svg width="500" height="500" viewBox="0 0 500 500" class="block">
              <g stroke="#cbd5e1" stroke-width="1"><line v-for="i in 11" :key="'vg'+i" :x1="(i-1)*50" y1="0" :x2="(i-1)*50" y2="500" /><line v-for="i in 11" :key="'hg'+i" x1="0" :y1="(i-1)*50" x2="500" :y2="(i-1)*50" /></g>
              <line x1="0" y1="250" x2="500" y2="250" stroke="#0ea5e9" stroke-width="4" />
              <line x1="250" y1="0" x2="250" y2="500" stroke="#f97316" stroke-width="4" />
              <text x="480" y="240" font-weight="bold" fill="#0ea5e9" font-size="16">x</text><text x="260" y="20" font-weight="bold" fill="#f97316" font-size="16">y</text>
              <text x="260" y="240" font-weight="bold" fill="#334155" font-size="12">0</text>
              <text x="440" y="40" fill="#e2e8f0" font-size="20" font-weight="900">I</text><text x="40" y="40" fill="#e2e8f0" font-size="20" font-weight="900">II</text>
              <text x="40" y="480" fill="#e2e8f0" font-size="20" font-weight="900">III</text><text x="440" y="480" fill="#e2e8f0" font-size="20" font-weight="900">IV</text>
              <g v-for="x in 11" :key="'ix'+x"><g v-for="y in 11" :key="'iy'+y">
                <circle :cx="(x-1)*50" :cy="(y-1)*50" r="15" fill="transparent" class="cursor-crosshair hover:fill-amber-500/30 transition-colors" @click="clickGrid(x-6, 6-y)" role="button" tabindex="0" @keydown.enter.prevent="clickGrid(x-6, 6-y)" @keydown.space.prevent="clickGrid(x-6, 6-y)" aria-label="Selecteer" />
              </g></g>
              <g v-if="userX !== null && userY !== null" class="animate-fadeIn pointer-events-none">
                <circle :cx="(userX+5)*50" :cy="(5-userY)*50" r="12" fill="none" :stroke="isCorrect ? '#10b981' : '#ef4444'" stroke-width="4" />
                <circle :cx="(userX+5)*50" :cy="(5-userY)*50" r="4" :fill="isCorrect ? '#10b981' : '#ef4444'" />
                <text v-if="isCorrect" :x="(userX+5)*50" :y="(5-userY)*50-20" text-anchor="middle" font-size="28">DIAMOND</text>
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
.pattern-map { background-color: #f8fafc; background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 L 100 100 M 100 0 L 0 100" stroke="rgba(0,0,0,0.03)" stroke-width="1"/></svg>'); }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
