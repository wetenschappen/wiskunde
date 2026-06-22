<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhBrain, PhArrowClockwise, PhCloudRain, PhTruck
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Redeneren: Implicatie vs Equivalentie' },
  instruction: {
    type: String,
    default: 'We bestuderen de logische regel (implicatie): <strong>"ALS het regent (A), DAN is de straat nat (B)."</strong><br/><br/>Gebruik de straat-simulatie om te ontdekken wat je hier wel en niet uit mag afleiden!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhBrain }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Experimenteer met de simulatie en beantwoord de vraag.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 4
const reflectionAnswer = ref('')
const showReflection = ref(false)

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const scenarioPool = [
  {
    simStart: 'rain',
    goalText: 'Het is keihard aan het regenen. Wat weet je 100% zeker over de straat?',
    options: ['De straat is nat', 'De straat is droog', 'We weten het niet zeker'],
    targetAns: 'De straat is nat',
    hint: 'Kijk naar de regel: ALS het regent, DAN... '
  },
  {
    simStart: 'dry',
    goalText: 'Je kijkt naar buiten en ziet dat de straat kurkdroog is. Heeft het net geregend?',
    options: ['Ja, het heeft geregend', 'Nee, het heeft niet geregend', 'We weten het niet zeker'],
    targetAns: 'Nee, het heeft niet geregend',
    hint: 'Als het geregend zou hebben, MOEST de straat nat zijn. Maar hij is droog. Dus...?'
  },
  {
    simStart: 'wet',
    goalText: 'Je ziet dat de straat nat is. Kun je nu met 100% zekerheid zeggen dat het geregend heeft?',
    options: ['Ja, het heeft zeker geregend', 'Nee, dat weet je niet zeker'],
    targetAns: 'Nee, dat weet je niet zeker',
    hint: 'Druk eens op de knop "Sproeiwagen". Kan de straat nat zijn ZONDER dat het regent?'
  }
]

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const userAnswer = ref(null)

// Domain Logic
const streetState = ref('dry') // 'dry', 'rain', 'truck', 'wet'

function triggerRain() { streetState.value = 'rain' }
function triggerTruck() { streetState.value = 'truck' }

function generateLevel() {
  return scenarioPool.map((s, i) => ({ ...s, goalText: s.goalText }))
}

function checkReflection() {
  if (!reflectionAnswer.value.trim()) return
  const text = reflectionAnswer.value.toLowerCase()
  const hasImplicatie = text.includes('implicatie') || text.includes('als') && text.includes('dan')
  const hasEquivalentie = text.includes('equivalentie') || text.includes('als en slechts') || text.includes('beide kanten') || text.includes('omgekeerd')
  if (hasImplicatie && hasEquivalentie && text.length > 20) {
    isCorrect.value = true; isChecked.value = true
    feedback.value = { type: 'success', text: '👍 Uitstekende uitleg!<br/><br/><strong>Waarom dit belangrijk is:</strong> Een implicatie (A→B) werkt één richting: ALS A DAN B. Maar B kan ook zonder A gebeuren (sproeiwagen!). Een equivalentie (A↔B) werkt twee richtingen: A geldt alleen als B geldt én vice versa.<br/><br/>Regen→nat, maar nat↛regen → dus implicatie, geen equivalentie!<br/><br/>✏️ <strong>LPD-doel:</strong> Je herkent het verschil tussen een implicatie (één richting) en een equivalentie (twee richtingen), en je kunt in een concrete context bepalen welke logische relatie geldt.' }
  } else {
    attemptCount.value++
    const hints = [
      'Probeer deze zinnen: "Een implicatie is ... Een equivalentie is ..."',
      'Denk aan de straat: regen⇒nat. Geldt nat⇒regen ook altijd?',
      'Implicatie = één richting (ALS...DAN). Equivalentie = twee richtingen (ALS EN SLECHTS ALS).' ]
    feedback.value = { type: 'error', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

function resetActivityState() {
    levels.value = generateLevel()
    reflectionAnswer.value = ''
    showReflection.value = (currentInternalLevel.value === 3)
    isCorrect.value = false; celebrationDone.value = false
    isChecked.value = false
    if (currentInternalLevel.value === 3) {
      feedback.value = { type: 'info', text: 'Schrijf in je eigen woorden: wat is het verschil tussen een implicatie en een equivalentie?' }
      streetState.value = 'wet'
    } else {
      feedback.value = { type: 'info', text: 'Experimenteer met de simulatie en beantwoord de vraag.' }
      streetState.value = currentLevelData.value?.simStart || 'dry'
    }
    attemptCount.value = 0;
    userAnswer.value = null;
}

function checkAnswer() {
  if (currentInternalLevel.value === 3) { checkReflection(); return }
  isChecked.value = true;

  if (userAnswer.value === currentLevelData.value.targetAns) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = {
      type: 'success',
      text: 'Prima! beredeneerd! Logica gaat om wat je met 100% zekerheid kunt afleiden uit een stelling.'
    }
  } else {
    attemptCount.value++
    isCorrect.value = false

    if (attemptCount.value === 1) {
      feedback.value = { type: 'error', text: `Niet helemaal juist. ${currentLevelData.value.hint}`}
    } else if (attemptCount.value === 2) {
      const hint2 = currentInternalLevel.value === 0
        ? 'Denk aan het pijltje: regen => natte straat. Wat volgt er uit het regenen?'
        : currentInternalLevel.value === 1
          ? 'Als de straat droog is, kan het dan geregend hebben?'
          : 'Kan de straat ook nat worden op een andere manier?'
      feedback.value = { type: 'error', text: `Probeer opnieuw. ${hint2}`}
    } else {
      const hint3 = currentInternalLevel.value === 0
        ? 'De regel is: ALS regen DAN nat. A (regen) is waar, dus B (nat) moet waar zijn.'
        : currentInternalLevel.value === 1
          ? 'Stel: het heeft wel geregend. Dan MOEST de straat nat zijn. Maar de straat is droog. Dat kan niet. Dus...'
          : 'Herinner je: regen is niet de ENIGE manier om de straat nat te maken!'
      feedback.value = { type: 'error', text: `${hint3} Kies het antwoord dat WISKUNDIG zeker is.`}
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
  }
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
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
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-600-bg">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-amber-600' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <!-- Level 4: Reflection -->
            <div v-if="showReflection">
              <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm mb-4">
                <p class="font-bold text-amber-800 mb-3">Fase 4: Reflectie</p>
                <label class="block text-sm font-bold text-slate-700 mb-2">Wat is het verschil tussen een <strong>implicatie</strong> (A→B) en een <strong>equivalentie</strong> (A↔B)? Schrijf in je eigen woorden.</label>
                <textarea v-model="reflectionAnswer" :disabled="isCorrect"
                  class="w-full p-3 border-2 border-slate-300 rounded-lg text-sm bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                  rows="4" placeholder="Een implicatie is... terwijl een equivalentie..."></textarea>
              </div>
            </div>

            <div v-if="!showReflection" class="p-4 mt-6 border border-amber-200 bg-amber-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-amber-600 mb-3">{{ currentLevelData.goalText }}</label>
               <div class="flex flex-col gap-2">
                    <button v-for="opt in currentLevelData.options" :key="opt"
                            @click="if(!isCorrect) { userAnswer = opt; isChecked = false; }"
                            class="w-full py-2 rounded-lg font-bold transition-colors border-2 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                           :class="userAnswer === opt ? 'bg-amber-600 border-amber-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                       {{ opt }}
                   </button>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-amber-50 text-amber-800': feedback.type === 'success', 'bg-red-50 text-red-800': feedback.type === 'error', 'bg-slate-100 text-slate-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || (showReflection ? !reflectionAnswer.trim() : !userAnswer)" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <!-- Interactive Visual Controls -->
              <div class="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4 bg-white p-2 rounded-xl shadow-md border border-slate-200 z-20">
                  <button @click="triggerRain" class="px-4 py-2 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none" :class="streetState === 'rain' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'text-slate-500 hover:bg-slate-100 border-transparent'"><PhCloudRain weight="bold" /> Laat het regenen</button>
                  <button @click="triggerTruck" class="px-4 py-2 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none" :class="streetState === 'truck' ? 'bg-amber-600-bg text-amber-600 border-surface-200' : 'text-slate-500 hover:bg-slate-100 border-transparent'"><PhTruck weight="bold" /> Laat sproeiwagen passeren</button>
              </div>

              <!-- The Street Scene -->
              <div class="w-full max-w-2xl h-[400px] bg-white rounded-xl border-4 border-slate-300 shadow-md relative overflow-hidden flex flex-col">

                  <!-- Sky/Clouds -->
                  <div class="h-1/2 w-full relative transition-colors duration-1000" :class="streetState === 'rain' ? 'bg-slate-400' : 'bg-slate-50'">
                      <!-- Clouds -->
                      <div class="absolute top-10 left-20 w-32 h-16 bg-white rounded-full mix-blend-overlay opacity-80 filter blur-sm transition-all" :class="streetState === 'rain' ? 'bg-slate-600 scale-110' : ''"></div>
                      <div class="absolute top-4 right-32 w-48 h-20 bg-white rounded-full mix-blend-overlay opacity-90 filter blur-md transition-all" :class="streetState === 'rain' ? 'bg-slate-700 scale-110' : ''"></div>

                      <!-- Rain Animation -->
                      <div v-if="streetState === 'rain'" class="absolute inset-0 overflow-hidden opacity-60">
                          <div v-for="i in 50" :key="i" class="absolute w-0.5 h-6 bg-amber-400 rounded-lg"
                               :style="{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 100}%`,
                                  animation: `fall ${0.5 + Math.random() * 0.5}s linear infinite`
                               }">
                          </div>
                      </div>
                  </div>

                  <!-- The Street -->
                  <div class="h-1/2 w-full relative transition-colors duration-1000" :class="streetState === 'dry' ? 'bg-slate-300' : 'bg-slate-500'">
                      <!-- Road markings -->
                      <div class="absolute top-1/2 left-0 w-full h-2 flex justify-between px-10">
                          <div v-for="i in 8" :key="'l'+i" class="w-16 h-full bg-white opacity-50"></div>
                      </div>

                      <!-- Puddles / Wetness -->
                      <div v-if="streetState !== 'dry'" class="absolute inset-0 animate-fadeIn opacity-40">
                          <div class="absolute top-10 left-20 w-40 h-8 bg-slate-900 rounded-full filter blur-sm transform scale-y-50"></div>
                          <div class="absolute bottom-10 right-32 w-64 h-12 bg-slate-900 rounded-full filter blur-sm transform scale-y-50"></div>
                          <div class="absolute top-5 right-10 w-24 h-6 bg-slate-900 rounded-full filter blur-sm transform scale-y-50"></div>
                      </div>

                      <!-- Truck Animation -->
                      <div v-if="streetState === 'truck'" class="absolute top-4 -left-32 animate-driveRight">
                          <div class="relative w-48 h-24">
                              <div class="absolute bottom-0 w-32 h-16 bg-amber-600 rounded-l-lg border-2 border-amber-500 z-10"></div>
                              <div class="absolute bottom-0 right-0 w-16 h-12 bg-slate-200 rounded-r-lg border-2 border-slate-400 z-10"></div>
                              <div class="absolute -bottom-2 left-4 w-8 h-8 bg-slate-800 rounded-full border-2 border-slate-400 z-20"></div>
                              <div class="absolute -bottom-2 right-4 w-8 h-8 bg-slate-800 rounded-full border-2 border-slate-400 z-20"></div>
                              <!-- Water spray -->
                              <div class="absolute bottom-2 -left-16 w-20 h-10 bg-amber-400/50 rounded-full filter blur-md origin-right transform scale-x-150 animate-pulse"></div>
                          </div>
                      </div>

                  </div>
              </div>

              <!-- Logical Summary Box -->
              <div class="mt-8 bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm w-full max-w-2xl text-center">
                  <div class="font-mono font-bold text-xl flex items-center justify-center gap-4 text-slate-700">
                      <span>Regen</span>
                      <span class="text-amber-500 font-black">=></span>
                      <span>Straat Nat</span>
                  </div>
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }


@keyframes fall {
    0% { transform: translateY(-100px); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(200px); opacity: 0; }
}

@keyframes driveRight {
    0% { transform: translateX(-100px); }
    100% { transform: translateX(800px); }
}
.animate-driveRight {
    animation: driveRight 3s linear forwards;
}
</style>
