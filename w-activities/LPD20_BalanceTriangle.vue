<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCrosshair, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Merkwaardige Lijnen: Praktisch Nut' },
  instruction: { 
    type: String, 
    default: 'Merkwaardige lijnen zijn geen saaie theorie, ze lossen échte problemen op!<br/><br/><strong>Opdracht:</strong> Lees de missie en klik op het type lijn dat dit probleem oplost. We simuleren dan het resultaat.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCrosshair }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kies de juiste merkwaardige lijnen voor dit probleem.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Missie 1: Balanceren',
    problemDesc: 'Je wilt een zware driehoekige houten plaat perfect laten balanceren op één vinger. Je zoekt het exacte evenwichtspunt.',
    targetLine: 'zwaarte',
    correctMsg: 'Briljant! De zwaartelijnen snijden elkaar in het zwaartepunt. De driehoek balanceert nu perfect op je vinger!',
    errorHoogte: 'Hoogtelijnen meten enkel hoe hoog het is. Je plaat valt onmiddellijk van je vinger!',
    errorMiddel: 'Middelloodlijnen bepalen het middelpunt van de omgeschreven cirkel, niet het gewicht. Plaf! Daar gaat je driehoek.',
    errorBissec: 'Bissectrices halveren hoeken, maar zeggen weinig over de massaverdeling. Je plaat valt!'
  },
  {
    goalText: 'Missie 2: De Spinkhaan',
    problemDesc: 'Een spin wil een web weven binnenin een driehoekig raamkozijn. Het web moet precies raken aan alle drie de randen (ingeschreven cirkel).',
    targetLine: 'bissec',
    correctMsg: 'Perfect! Bissectrices (deellijnen) snijden elkaar in het middelpunt van de ingeschreven cirkel. De spin is blij!',
    errorHoogte: 'Hoogtelijnen geven geen cirkel die precies past. Het web gaat scheef hangen.',
    errorZwaarte: 'Zwaartelijnen geven het zwaartepunt, niet het geometrisch midden voor randen.',
    errorMiddel: 'Middelloodlijnen bepalen de cirkel RONDOM de driehoek, niet er ín. De spin weeft zijn web buiten het raam!'
  },
  {
    goalText: 'Missie 3: Het Brandweerstation',
    problemDesc: 'Drie dorpen willen samen één brandweerstation bouwen. Het station moet van alle drie de dorpen EXACT even ver weg liggen (omgeschreven cirkel).',
    targetLine: 'middel',
    correctMsg: 'Geweldig! De middelloodlijnen snijden elkaar in een punt dat van alle drie de hoekpunten exact even ver ligt. Een eerlijke keuze!',
    errorHoogte: 'Hoogtelijnen helpen niet bij het zoeken van afstanden tot hoekpunten.',
    errorZwaarte: 'Het zwaartepunt ligt wel in het midden, maar niet exact even ver van elk dorp.',
    errorBissec: 'Bissectrices zoeken het punt dat even ver van de WEGEN ligt, niet van de dorpen (hoekpunten) zelf.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const activeLines = ref('') // 'hoogte', 'zwaarte', 'middel', 'bissec'

function setLines(type) {
    if (isCorrect.value) return;
    activeLines.value = type;
    isChecked.value = true;
    
    const data = currentLevelData.value;
    
    if (type === data.targetLine) {
        isCorrect.value = true
        feedback.value = { type: 'success', text: data.correctMsg }
    } else {
        isCorrect.value = false
        if (type === 'hoogte') feedback.value = { type: 'error', text: data.errorHoogte }
        else if (type === 'zwaarte') feedback.value = { type: 'error', text: data.errorZwaarte }
        else if (type === 'middel') feedback.value = { type: 'error', text: data.errorMiddel }
        else if (type === 'bissec') feedback.value = { type: 'error', text: data.errorBissec }
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Kies de juiste merkwaardige lijnen voor dit probleem.' };
    activeLines.value = '';
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-orange-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-orange-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-orange-50 p-4 border border-orange-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <span class="text-xs font-bold text-orange-800 uppercase tracking-widest block mb-2">{{ currentLevelData.goalText }}</span>
              <p class="font-medium text-sm text-slate-800">{{ currentLevelData.problemDesc }}</p>
            </div>

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-slate-700 mb-3">Teken de lijnen:</h4>
               
               <div class="flex flex-col gap-2">
                   <button @click="setLines('hoogte')" :disabled="isCorrect" class="py-3 px-4 rounded-lg border-2 font-bold text-left transition-all active:scale-[0.98] shadow-sm" :class="activeLines === 'hoogte' ? (isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">Hoogtelijnen</button>
                   <button @click="setLines('zwaarte')" :disabled="isCorrect" class="py-3 px-4 rounded-lg border-2 font-bold text-left transition-all active:scale-[0.98] shadow-sm" :class="activeLines === 'zwaarte' ? (isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">Zwaartelijnen</button>
                   <button @click="setLines('middel')" :disabled="isCorrect" class="py-3 px-4 rounded-lg border-2 font-bold text-left transition-all active:scale-[0.98] shadow-sm" :class="activeLines === 'middel' ? (isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">Middelloodlijnen</button>
                   <button @click="setLines('bissec')" :disabled="isCorrect" class="py-3 px-4 rounded-lg border-2 font-bold text-left transition-all active:scale-[0.98] shadow-sm" :class="activeLines === 'bissec' ? (isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">Bissectrices (Deellijnen)</button>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <!-- Visualisation Area -->
              <div class="relative w-[500px] h-[450px] flex items-center justify-center" :key="'lvl' + currentInternalLevel">
                  
                  <div class="absolute inset-0 transition-transform duration-700 ease-in-out origin-[183px_250px]"
                       :class="currentInternalLevel === 0 && activeLines && !isCorrect ? 'rotate-12 translate-y-12' : ''">
                       
                      <!-- Contextual backdrop (Finger, Spin, Map) -->
                      
                      <!-- Lvl 1: Finger -->
                      <div v-if="currentInternalLevel === 0" class="absolute w-12 h-32 bg-[#fcd34d] border-4 border-[#d97706] rounded-t-full shadow-2xl z-20 flex flex-col items-center pt-2 transition-all duration-700"
                           :class="!activeLines ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'"
                           style="left: calc(183.3px - 24px); top: 250px;">
                           <div class="w-6 h-4 bg-white/40 rounded-full mb-1"></div> <!-- Nail -->
                      </div>

                      <!-- Lvl 3: Map background -->
                      <div v-if="currentInternalLevel === 2" class="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                      
                      <!-- The Triangle -->
                      <svg width="500" height="400" viewBox="0 0 500 400" class="absolute inset-0 z-30 drop-shadow-2xl">
                          
                          <!-- Solid wood/metal looking triangle for L1, transparent web for L2, grass for L3 -->
                          <polygon points="100,50 50,350 400,350" 
                                   :fill="currentInternalLevel === 0 ? '#b45309' : (currentInternalLevel === 1 ? 'rgba(0,0,0,0.05)' : '#4ade80')" 
                                   :stroke="currentInternalLevel === 0 ? '#78350f' : (currentInternalLevel === 1 ? '#94a3b8' : '#166534')" 
                                   :stroke-width="currentInternalLevel === 1 ? 2 : 6" stroke-linejoin="round" />
                          
                          <!-- Lvl 3: Villages -->
                          <g v-if="currentInternalLevel === 2">
                              <circle cx="100" cy="50" r="15" fill="#ef4444" />
                              <circle cx="50" cy="350" r="15" fill="#ef4444" />
                              <circle cx="400" cy="350" r="15" fill="#ef4444" />
                          </g>

                          <!-- The Lines based on state -->
                          <g v-if="activeLines === 'zwaarte'" stroke="#facc15" stroke-width="3" stroke-dasharray="8 4" class="animate-fadeIn">
                              <!-- A to mid BC(225, 350) -->
                              <line x1="100" y1="50" x2="225" y2="350" />
                              <!-- B to mid AC(250, 200) -->
                              <line x1="50" y1="350" x2="250" y2="200" />
                              <!-- C to mid AB(75, 200) -->
                              <line x1="400" y1="350" x2="75" y2="200" />
                              <circle cx="183.3" cy="250" r="8" fill="#facc15" />
                          </g>

                          <g v-if="activeLines === 'hoogte'" stroke="#ef4444" stroke-width="3" stroke-dasharray="8 4" class="animate-fadeIn">
                              <line x1="100" y1="50" x2="100" y2="350" />
                              <line x1="50" y1="350" x2="160" y2="100" /> 
                              <circle cx="100" cy="300" r="8" fill="#ef4444" />
                          </g>

                          <g v-if="activeLines === 'middel'" stroke="#10b981" stroke-width="3" stroke-dasharray="8 4" class="animate-fadeIn">
                              <line x1="225" y1="350" x2="225" y2="100" />
                              <!-- intersection approx 225, 200 -->
                              <circle cx="225" cy="210" r="8" fill="#10b981" />
                              <!-- Circumcircle if correct -->
                              <circle v-if="isCorrect && currentInternalLevel === 2" cx="225" cy="210" r="185" fill="none" stroke="#10b981" stroke-width="4" stroke-dasharray="0" class="animate-fadeIn" />
                              <text v-if="isCorrect && currentInternalLevel === 2" x="225" y="215" text-anchor="middle" font-weight="900" font-size="24" fill="white">🚒</text>
                          </g>

                          <g v-if="activeLines === 'bissec'" stroke="#a855f7" stroke-width="3" stroke-dasharray="8 4" class="animate-fadeIn">
                              <line x1="100" y1="50" x2="190" y2="350" />
                              <line x1="50" y1="350" x2="350" y2="150" />
                              <circle cx="170" cy="245" r="8" fill="#a855f7" />
                              <!-- Incircle if correct -->
                              <circle v-if="isCorrect && currentInternalLevel === 1" cx="170" cy="245" r="105" fill="rgba(255,255,255,0.8)" stroke="#a855f7" stroke-width="4" stroke-dasharray="0" class="animate-fadeIn" />
                              <text v-if="isCorrect && currentInternalLevel === 1" x="170" y="255" text-anchor="middle" font-weight="900" font-size="40">🕷️</text>
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
</style>