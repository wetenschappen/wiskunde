<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCube, PhArrowClockwise, PhEye
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Ruimtemeetkunde: De Optische Illusie' },
  instruction: { 
    type: String, 
    default: 'Als we de 3D-wereld op een plat 2D-scherm tekenen, treedt er <strong>verlies van informatie</strong> op. Diepte verdwijnt!<br/><br/><strong>Opdracht:</strong> Kijk naar de twee rode lijnen in de kubus. Snijden ze elkaar? Verander je perspectief om de échte ligging (de waarheid) te ontdekken.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCube }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op "Verander Perspectief" om rond de kubus te wandelen.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Het X-patroon',
    svg2D: `
      <rect x="100" y="50" width="200" height="200" fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" stroke-width="2" />
      <line x1="100" y1="50" x2="300" y2="250" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />
      <line x1="100" y1="250" x2="300" y2="50" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />
      <rect x="100" y="50" width="200" height="200" fill="transparent" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" />
    `,
    svg3D: `
      <!-- Connecting Edges -->
      <line x1="50" y1="100" x2="150" y2="30" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
      <line x1="250" y1="100" x2="350" y2="30" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
      <line x1="50" y1="300" x2="150" y2="230" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
      <line x1="250" y1="300" x2="350" y2="230" stroke="#94a3b8" stroke-width="2" />

      <!-- Back face -->
      <rect x="150" y="30" width="200" height="200" fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
      <!-- Line 2 BACK -->
      <line x1="150" y1="230" x2="350" y2="30" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />

      <!-- Front face -->
      <rect x="50" y="100" width="200" height="200" fill="rgba(255, 255, 255, 0.5)" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" />
      <!-- Line 1 FRONT -->
      <line x1="50" y1="100" x2="250" y2="300" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />
      
      <!-- Gap hint -->
      <circle cx="200" cy="130" r="15" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 4" class="animate-spin-slow" />
      <text x="220" y="135" font-weight="bold" fill="#d97706" font-size="12">Grote ruimte ertussen!</text>
    `,
    correctAns: 'kruisend',
    successMsg: 'Perfect! Lijnen die in 3D niet evenwijdig zijn én elkaar nooit snijden (omdat ze in een ander vlak liggen) noemen we KRUISENDE rechten.'
  },
  {
    goalText: 'Opdracht 2: Het Dak',
    svg2D: `
      <!-- Looks like two lines forming a triangle /|\\ -->
      <rect x="100" y="50" width="200" height="200" fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" stroke-width="2" />
      <!-- Diagonal 1: (100,250) to (200,50) -->
      <line x1="100" y1="250" x2="200" y2="50" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />
      <!-- Diagonal 2: (300,250) to (200,50) -->
      <line x1="300" y1="250" x2="200" y2="50" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />
      <rect x="100" y="50" width="200" height="200" fill="transparent" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" />
    `,
    svg3D: `
      <line x1="50" y1="100" x2="150" y2="30" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
      <line x1="250" y1="100" x2="350" y2="30" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
      <line x1="50" y1="300" x2="150" y2="230" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
      <line x1="250" y1="300" x2="350" y2="230" stroke="#94a3b8" stroke-width="2" />

      <!-- Back face -->
      <rect x="150" y="30" width="200" height="200" fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
      
      <!-- Line 2: BACK face bottom right (350,230) to FRONT face top mid (150,100). Wait, needs to match 2D projection. -->
      <!-- In 2D: (300,250) to (200,50). So bottom right to top mid. -->
      <!-- In 3D back face: BR is (350,230). Top mid of front face is (150,100). -->
      <!-- Line 1: In 2D: (100,250) to (200,50). Bottom left to top mid. -->
      <!-- In 3D front face: BL is (50,300). Top mid of back face is (250,30). -->
      <!-- They don't actually meet! One goes to front top, one goes to back top! -->
      
      <!-- Line 2 (Goes to back top mid) -->
      <line x1="350" y1="230" x2="250" y2="30" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />

      <!-- Front face -->
      <rect x="50" y="100" width="200" height="200" fill="rgba(255, 255, 255, 0.5)" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" />

      <!-- Line 1 (Goes to front top mid) -->
      <line x1="50" y1="300" x2="150" y2="100" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />

      <circle cx="200" cy="65" r="15" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 4" class="animate-spin-slow" />
      <text x="220" y="70" font-weight="bold" fill="#d97706" font-size="12">Verschillende top!</text>
    `,
    correctAns: 'kruisend',
    successMsg: 'Fantastisch! In 2D leek het alsof ze in 1 punt samenkwamen als een dakje (snijdend), maar de ene lijn stopte vooraan en de andere achteraan. Kruisend dus!'
  },
  {
    goalText: 'Opdracht 3: Diagonale verwarring',
    svg2D: `
      <!-- Looks like two parallel lines // -->
      <rect x="100" y="50" width="200" height="200" fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" stroke-width="2" />
      <!-- Line 1: (100,50) to (200,250) -->
      <line x1="100" y1="50" x2="200" y2="250" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />
      <!-- Line 2: (200,50) to (300,250) -->
      <line x1="200" y1="50" x2="300" y2="250" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />
      <rect x="100" y="50" width="200" height="200" fill="transparent" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" />
    `,
    svg3D: `
      <line x1="50" y1="100" x2="150" y2="30" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
      <line x1="250" y1="100" x2="350" y2="30" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
      <line x1="50" y1="300" x2="150" y2="230" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
      <line x1="250" y1="300" x2="350" y2="230" stroke="#94a3b8" stroke-width="2" />

      <!-- Back face -->
      <rect x="150" y="30" width="200" height="200" fill="rgba(148, 163, 184, 0.1)" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
      
      <!-- Line 2: Back face top left to back face bottom mid. No, it's (200,50) to (300,250) in 2D. -->
      <!-- Let's map it: 200,50 is top mid. 300,250 is bottom right. -->
      <!-- Back face top mid is 250,30. Back face bottom right is 350,230. -->
      <!-- Let's make them actually PARALLEL in 3D. So Line 1 on front face, Line 2 on back face but exact same relative vector. -->
      <!-- Front face: Top left (50,100) to bottom mid (150,300). -->
      <line x1="250" y1="30" x2="350" y2="230" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />

      <!-- Front face -->
      <rect x="50" y="100" width="200" height="200" fill="rgba(255, 255, 255, 0.5)" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" />

      <!-- Line 1: Front face top left (50,100) to bottom mid (150,300) -->
      <!-- Wait, 2D 100,50 is TL. 200,250 is bottom mid. So yes. -->
      <line x1="50" y1="100" x2="150" y2="300" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />
      
      <circle cx="200" cy="180" r="15" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4 4" class="animate-spin-slow" />
      <text x="220" y="185" font-weight="bold" fill="#047857" font-size="12">Zelfde richting = Evenwijdig!</text>
    `,
    correctAns: 'evenwijdig',
    successMsg: 'Heel goed! Deze keer was de 2D-tekening géén leugen. Zelfs in 3D-ruimte lopen deze lijnen in exact dezelfde richting (zonder te snijden).'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const is3D = ref(false)
const userAns = ref('') // 'snijdend', 'evenwijdig', 'kruisend'

function togglePerspective() {
    if (isCorrect.value) return;
    is3D.value = !is3D.value
    if (is3D.value) {
        if (currentLevelData.value.correctAns === 'evenwijdig') {
            feedback.value = { type: 'success', text: 'Kijk! Ze zitten in verschillende vlakken (voor en achter), maar lopen wel in krek dezelfde richting.' }
        } else {
            feedback.value = { type: 'success', text: 'Kijk nu nog eens goed! De ene lijn ligt vooraan, de andere helemaal achteraan. Ze raken elkaar niet eens!' }
        }
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op "Verander Perspectief" om rond de kubus te wandelen.' };
    is3D.value = false;
    userAns.value = '';
}

function checkAnswer() {
  isChecked.value = true;
  
  if (userAns.value === currentLevelData.value.correctAns) {
    if (is3D.value) {
        isCorrect.value = true
        feedback.value = { type: 'success', text: currentLevelData.value.successMsg }
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: 'Je hebt helemaal gelijk! Maar wissel het perspectief naar 3D om het ook visueel te bewijzen.'}
    }
  } else {
    isCorrect.value = false
    
    if (userAns.value === 'snijdend') {
        if (!is3D.value) {
            feedback.value = { type: 'error', text: 'In dit platte vooraanzicht LIJKT het alsof ze snijden (ze kruisen of raken op de 2D tekening). Verander je perspectief naar 3D!'}
        } else {
            feedback.value = { type: 'error', text: 'Kijk naar de 3D-weergave. Ze raken elkaar absoluut niet! Eentje plakt op de voorkant, de ander op de achterkant.'}
        }
    } else if (userAns.value === 'evenwijdig') {
        feedback.value = { type: 'error', text: 'Evenwijdige lijnen lopen in exact dezelfde richting (zoals treinsporen). Deze lopen dwars op elkaar.'}
    } else if (userAns.value === 'kruisend') {
        feedback.value = { type: 'error', text: 'Kruisend betekent: NIET snijdend EN NIET evenwijdig. Maar lopen deze lijnen niet toevallig wél in dezelfde richting?'}
    } else {
        feedback.value = { type: 'error', text: 'Kies een antwoord uit de lijst.'}
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
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
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm text-slate-600" v-html="instruction"></div>
            
            <div class="text-center bg-teal-50 p-4 border border-teal-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-teal-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-teal-200 bg-teal-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-teal-900 mb-2">Onderlinge ligging in 3D:</label>
               <select v-model="userAns" :disabled="isCorrect" class="w-full p-3 border-2 border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 font-bold text-slate-700 bg-white">
                   <option value="" disabled>Kies een relatie...</option>
                   <option value="snijdend">Snijdende rechten (ze snijden in 1 punt)</option>
                   <option value="evenwijdig">Evenwijdige rechten (ze lopen perfect naast elkaar)</option>
                   <option value="kruisend">Kruisende rechten (ze zijn niet evenwijdig én snijden nooit)</option>
               </select>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === ''" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Ligging</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-2xl flex flex-col items-center">
                  
                  <div class="mb-12">
                      <button @click="togglePerspective" :disabled="isCorrect" 
                              class="px-6 py-3 font-bold text-white rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 border-2"
                              :class="is3D ? 'bg-indigo-600 border-indigo-700 hover:bg-indigo-500' : 'bg-slate-800 border-slate-900 hover:bg-slate-700'">
                          <PhEye weight="fill" class="w-6 h-6" /> {{ is3D ? 'Terug naar 2D Platvlak' : 'Bekijk in 3D (Draai)' }}
                      </button>
                  </div>

                  <!-- Visualisation Area -->
                  <div class="relative bg-white shadow-xl rounded-3xl overflow-hidden border-4 border-slate-200 p-8 flex items-center justify-center" style="width: 500px; height: 400px;" :key="currentInternalLevel">
                      
                      <!-- 2D View -->
                      <svg v-if="!is3D" width="400" height="300" viewBox="0 0 400 300" class="animate-fadeIn" v-html="currentLevelData.svg2D"></svg>

                      <!-- 3D View -->
                      <svg v-if="is3D" width="400" height="300" viewBox="0 0 400 300" class="animate-fadeIn" v-html="currentLevelData.svg3D"></svg>

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
.animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.animate-spin-slow { animation: spin 4s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>