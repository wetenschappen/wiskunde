<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCrosshair, PhArrowClockwise, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Coordinaten: Radar Detectie' }, instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhCrosshair }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false)
const isCorrect = ref(false); const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const attemptCount = ref(0)
const showWorkedExample = ref(false); const showReflection = ref(false); const reflectionAnswer = ref(''); const lpdConfirmed = ref(false)

function randomInt(m, M) { return Math.floor(Math.random() * (M - m + 1)) + m }
const levels = ref([])
function generateLevel() { levels.value = [{ targetX: randomInt(-3,3), targetY: randomInt(-3,3) }, { targetX: randomInt(-5,5), targetY: randomInt(-5,5) }, { targetX: randomInt(-5,5), targetY: randomInt(-5,5) }] }
const currentLevel = computed(() => levels.value[currentInternalLevel.value] || { targetX: 0, targetY: 0 })
const userX = ref(null); const userY = ref(null)

function clickRadar(x, y) { if (isCorrect.value) return; userX.value = x; userY.value = y; checkAnswer() }

function resetActivityState() { isCorrect.value = false; celebrationDone.value = false; attemptCount.value = 0; userX.value = null; userY.value = null; feedback.value = { type: 'info', text: 'Klik op de radar.' }; showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false }

function getHintText(t) {
  if (attemptCount.value === 1) return `Doel is x ${t.targetX >= 0 ? 'rechts' : 'links'} en y ${t.targetY >= 0 ? 'boven' : 'onder'}.`
  if (attemptCount.value === 2) return `${Math.abs(t.targetX)} ${t.targetX >= 0 ? 'rechts' : 'links'}, ${Math.abs(t.targetY)} ${t.targetY >= 0 ? 'omhoog' : 'omlaag'}.`
  return `Doel = (${t.targetX}, ${t.targetY}).`
}

function nextLevelTransition() { if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) } else { emit('complete') } }

function checkAnswer() {
  const t = currentLevel.value
  if (userX.value === t.targetX && userY.value === t.targetY) {
    isCorrect.value = true; feedback.value = { type: 'success', text: `BOEM! Voltreffer! (${t.targetX}, ${t.targetY}). Coördinaten worden altijd genoteerd als (x, y) met x eerst (horizontaal) en y daarna (verticaal). De oorsprong (0,0) is het snijpunt van de x-as en y-as.` }
  } else { attemptCount.value++
    if (userX.value === t.targetY && userY.value === t.targetX) feedback.value = { type: 'error', text: `Mis! Je hebt x en y omgedraaid! Eerst horizontaal, dan verticaal. ${getHintText(t)}` }
    else feedback.value = { type: 'error', text: `Mis op (${userX.value}, ${userY.value}). ${getHintText(t)}` }
  }
}

function goToNextStep() { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') }

watch(() => props.isOpen, (val) => { if (val) { generateLevel(); currentInternalLevel.value = 0; resetActivityState(); nextTick(() => mainArea.value?.focus()); window.addEventListener('keydown', handleKeydown) } else { window.removeEventListener('keydown', handleKeydown) } }, { immediate: true })
function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', () => {}))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
  <div class="absolute inset-0 bg-black/50" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-slate-800">
    <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-500/20">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-400" />
        </div>
        <div><h2 class="text-lg font-bold text-slate-100">{{ title }}</h2><p class="text-xs font-medium text-slate-400">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p></div>
      </div>
      <button @click="emit('close')" class="relative p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white"><PhX class="w-6 h-6" /></button>
    </header>
    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 shadow-inner md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
          <MathText :content="props.instruction" class="mb-6 prose prose-sm prose-invert text-slate-300" />

          <div class="mb-4 p-4 bg-indigo-900/40 border border-indigo-700 rounded-xl">
            <button @click="showWorkedExample = !showWorkedExample" class="flex items-center gap-2 text-sm font-bold text-indigo-300 w-full text-left">
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Coördinaten
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-200 space-y-2 animate-fadeIn">
              <p><strong>Stap 1:</strong> Lees eerst de horizontale positie (x-as).</p>
              <p><strong>Stap 2:</strong> Lees dan de verticale positie (y-as).</p>
              <p><strong>Stap 3:</strong> Noteer als (x, y). Altijd horizontaal eerst!</p>
              <p class="font-bold text-indigo-300">Positief x = rechts, negatief x = links. Positief y = omhoog, negatief y = omlaag.</p>
            </div>
          </div>

          <div class="p-4 border border-emerald-900 bg-emerald-900/30 rounded-xl shadow-inner text-center">
            <label class="block text-sm font-bold text-emerald-400 mb-2">Jouw schot:</label>
            <div class="flex items-center justify-center gap-2 text-3xl font-black text-slate-300 mb-2">
              <span>(</span><span class="w-16 p-2 rounded-lg bg-slate-900 border" :class="userX !== null ? 'border-emerald-500 text-emerald-400' : 'border-slate-600 text-slate-500'">{{ userX !== null ? userX : 'x' }}</span><span>,</span>
              <span class="w-16 p-2 rounded-lg bg-slate-900 border" :class="userY !== null ? 'border-blue-500 text-blue-400' : 'border-slate-600 text-slate-500'">{{ userY !== null ? userY : 'y' }}</span><span>)</span>
            </div>
            <p class="text-xs text-slate-500 mt-2">Klik op de radar om te vuren</p>
          </div>

          <div class="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-xl" v-if="!isCorrect && attemptCount > 0">
            <h4 class="text-sm font-bold text-red-300 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op!</h4>
            <ul class="text-xs text-red-200 space-y-1 list-disc list-inside">
              <li>Verwar x en y niet! Eerst horizontaal (x), dan verticaal (y).</li>
              <li>Positief x is rechts, negatief x is links.</li>
            </ul>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-900/40 border border-indigo-700 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-300 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-200">Het cartesisch coördinatenstelsel geeft elk punt een uniek adres (x, y). De x-coördinaat zegt hoe ver het punt links of rechts van de oorsprong ligt, de y-coördinaat zegt hoe ver omhoog of omlaag. Deze ordening is een internationale afspraak.</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-300 underline">Bevestig</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-900/40 border border-indigo-700 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-300 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-200 mb-2">Waarom is de volgorde (x, y) belangrijk? Wat gebeurt er als je ze omdraait?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-600 rounded-lg bg-slate-900 text-slate-100" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed" class="mt-4 p-4 bg-emerald-900/30 border border-emerald-700 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-200 mb-2">Ik kan coördinaten (x, y) aflezen en noteren in een assenstelsel.</p>
            <div class="flex items-center gap-2"><input type="checkbox" id="lpd-radar" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-radar" class="text-xs text-emerald-200 font-medium">Ik bevestig.</label></div>
          </div>
        </div>
        <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-snug">{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700"><PhArrowClockwise /></button>
            <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevelTransition" class="flex-1 py-4 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-emerald-400 hover:bg-emerald-300">Volgend Level</button>
            <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-amber-500 hover:bg-amber-400"><span>Afronden</span><PhArrowRight weight="bold" /></button>
          </div>
        </div>
      </div>
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative">
          <div class="relative bg-slate-800 shadow-md rounded-full overflow-hidden border-8 border-slate-700 p-2">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_#064e3b_0%,_#020617_100%)]"></div>
            <svg width="400" height="400" viewBox="0 0 400 400" class="block relative z-10">
              <circle cx="200" cy="200" r="200" fill="none" stroke="#10b981" stroke-width="2" opacity="0.3" />
              <circle cx="200" cy="200" r="160" fill="none" stroke="#10b981" stroke-width="1" opacity="0.2" />
              <circle cx="200" cy="200" r="120" fill="none" stroke="#10b981" stroke-width="1" opacity="0.2" />
              <circle cx="200" cy="200" r="80" fill="none" stroke="#10b981" stroke-width="1" opacity="0.2" />
              <circle cx="200" cy="200" r="40" fill="none" stroke="#10b981" stroke-width="1" opacity="0.2" />
              <g stroke="#10b981" stroke-width="1" opacity="0.15">
                <line v-for="i in 11" :key="'vg'+i" :x1="(i-1)*40" y1="0" :x2="(i-1)*40" y2="400" />
                <line v-for="i in 11" :key="'hg'+i" x1="0" :y1="(i-1)*40" x2="400" :y2="(i-1)*40" />
              </g>
              <line x1="0" y1="200" x2="400" y2="200" stroke="#10b981" stroke-width="2" opacity="0.5" />
              <line x1="200" y1="0" x2="200" y2="400" stroke="#10b981" stroke-width="2" opacity="0.5" />
              <text x="380" y="190" font-weight="bold" fill="#10b981" font-size="12" opacity="0.7">x</text>
              <text x="210" y="20" font-weight="bold" fill="#10b981" font-size="12" opacity="0.7">y</text>
              <g fill="#10b981" font-size="8" opacity="0.5" font-weight="bold">
                <text x="360" y="215" text-anchor="middle">5</text><text x="280" y="215" text-anchor="middle">2</text><text x="120" y="215" text-anchor="middle">-2</text><text x="40" y="215" text-anchor="middle">-4</text>
                <text x="185" y="40" dominant-baseline="middle">4</text><text x="185" y="120" dominant-baseline="middle">2</text><text x="180" y="280" dominant-baseline="middle">-2</text>
              </g>
              <g v-for="xi in 11" :key="'cx'+xi"><g v-for="yi in 11" :key="'cy'+yi">
                <circle :cx="(xi-1)*40" :cy="(yi-1)*40" r="12" fill="transparent" class="cursor-crosshair hover:fill-emerald-500/30 transition-colors" @click="clickRadar(xi-6, 6-yi)" role="button" tabindex="0" @keydown.enter.prevent="clickRadar(xi-6, 6-yi)" @keydown.space.prevent="clickRadar(xi-6, 6-yi)" aria-label="Selecteer" />
              </g></g>
              <g><circle :cx="200+currentLevel.targetX*40" :cy="200-currentLevel.targetY*40" r="6" fill="#34d399" /><circle :cx="200+currentLevel.targetX*40" :cy="200-currentLevel.targetY*40" r="3" fill="#ecfdf5" /></g>
              <g v-if="userX !== null && userY !== null" class="animate-fadeIn pointer-events-none">
                <circle :cx="200+userX*40" :cy="200-userY*40" r="20" fill="none" :stroke="isCorrect ? '#34d399' : '#ef4444'" stroke-width="4" />
                <circle :cx="200+userX*40" :cy="200-userY*40" r="4" :fill="isCorrect ? '#34d399' : '#ef4444'" />
                <text v-if="isCorrect" :x="200+userX*40" :y="200-userY*40-25" text-anchor="middle" font-weight="900" font-size="16" fill="#34d399" class="animate-fadeIn" style="animation-delay:0.5s">BOEM!</text>
                <text v-else :x="200+userX*40" :y="200-userY*40-25" text-anchor="middle" font-weight="900" font-size="14" fill="#f87171" class="animate-fadeIn" style="animation-delay:0.3s">MIS!</text>
              </g>
              <g class="animate-spin-radar origin-center"><line x1="200" y1="200" x2="200" y2="0" stroke="#34d399" stroke-width="2" opacity="0.8" /><path d="M 200 200 L 200 0 A 200 200 0 0 1 250 6 Z" fill="rgba(52,211,153,0.2)" /></g>
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
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-spin-radar { animation: spin 4s linear infinite; transform-origin: 200px 200px; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
