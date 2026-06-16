<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCube, PhArrowClockwise, PhCornersOut
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Oppervlakte: De Kubus Ontvouwen' },
  instruction: { 
    type: String, 
    default: 'Formules blokken is saai. Als je de <strong>oppervlakte</strong> (al het "verfwerk" aan de buitenkant) van een 3D-vorm zoekt, vouw hem dan gewoon plat!<br/><br/><strong>Opdracht:</strong> Ontvouw de kubus. Uit hoeveel gelijke vierkanten bestaat hij? Bereken de totale oppervlakte.' 
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
const feedback = ref({ type: 'info', text: 'Klik op de knop om de kubus uit te vouwen.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  { side: 4 }, // Area = 6 * 16 = 96
  { side: 3 }, // Area = 6 * 9 = 54
  { side: 5 }  // Area = 6 * 25 = 150
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])
const singleArea = computed(() => currentLevelData.value.side * currentLevelData.value.side)
const totalArea = computed(() => singleArea.value * 6)

// Domain Logic
const userAns = ref(null)
const isUnfolded = ref(false)

function unfoldCube() {
    if (isCorrect.value) return;
    isUnfolded.value = true
    feedback.value = { type: 'success', text: `Kijk! Een 3D-kubus is gewoon een verzameling van 6 platte 2D-vierkanten (de "ontwikkeling"). Bereken nu de totale oppervlakte.` }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de knop om de kubus uit te vouwen.' };
    isUnfolded.value = false;
    userAns.value = null;
}

function checkAnswer() {
  isChecked.value = true;

  if (userAns.value === totalArea.value) {
    if (isUnfolded.value) {
        isCorrect.value = true
        feedback.value = { 
          type: 'success', 
          text: `Perfect! Één vierkantje is ${currentLevelData.value.side}×${currentLevelData.value.side} = ${singleArea.value}. Er zijn er 6, dus ${singleArea.value} × 6 = ${totalArea.value}.` 
        }
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: `${totalArea.value} is correct! Maar ontvouw eerst de kubus om visueel te zien WAAROM de formule 6 × z² is.`}
    }
  } else {
    isCorrect.value = false
    
    if (userAns.value === currentLevelData.value.side * currentLevelData.value.side * currentLevelData.value.side) {
        feedback.value = { type: 'error', text: `Je hebt het VOLUME (Inhoud) berekend: ${currentLevelData.value.side}×${currentLevelData.value.side}×${currentLevelData.value.side}. Maar we zoeken de OPPERVLAKTE (verf nodig voor de buitenkant). Ontvouw hem!`}
    } else if (userAns.value === singleArea.value) {
        feedback.value = { type: 'error', text: `${singleArea.value} is de oppervlakte van slechts ÉÉN van de zijvlakken. Uit hoeveel van die vierkanten bestaat de kubus?`}
    } else {
        feedback.value = { type: 'error', text: 'Bereken de oppervlakte van één vlak (L × B) en vermenigvuldig dit met het totaal aantal vlakken.'}
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
            
            <div class="p-4 mt-6 border border-teal-200 bg-teal-50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-teal-900 mb-2">Totale Oppervlakte:</label>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                          class="w-full font-bold text-2xl p-3 border-2 border-teal-300 rounded-lg focus:border-teal-500 focus:ring-teal-500 text-center bg-white" />
                   <span class="font-black text-2xl text-slate-500">cm²</span>
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === null" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
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
                      <button @click="unfoldCube" :disabled="isCorrect || isUnfolded" 
                              class="px-6 py-3 font-bold bg-slate-800 text-white rounded-xl shadow-lg flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50">
                          <PhCornersOut weight="bold" class="w-6 h-6" /> Ontvouw Kubus
                      </button>
                  </div>

                  <!-- Visualisation Area -->
                  <!-- 3D to 2D animation using CSS transforms on 6 faces -->
                  <!-- We simulate a 3D environment with perspective, then flatten it out. -->
                  
                  <div class="relative w-[500px] h-[400px] perspective-container flex items-center justify-center" :key="currentInternalLevel">
                      
                      <!-- 3D Cube Container (rotates slightly when solid, flattens when unfolded) -->
                      <!-- If unfolded, we rotate the container to front view (0,0,0) so the net is flat. -->
                      <div class="cube-assembly preserve-3d transition-transform duration-1000 ease-in-out w-32 h-32 relative"
                           :style="{ transform: isUnfolded ? 'rotateX(0deg) rotateY(0deg) scale(1.2)' : 'rotateX(-20deg) rotateY(-30deg)' }">
                           
                           <!-- Face dimensions: 128x128. Translate Z is 64px. -->
                           
                           <!-- Front -->
                           <!-- Stays in place, just z-translates back to 0 when unfolded -->
                           <div class="face front bg-blue-500 border-2 border-blue-700 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                                :style="{ transform: isUnfolded ? 'rotateY(0deg) translateZ(0px)' : 'rotateY(0deg) translateZ(64px)' }">
                                <span class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}×{{ currentLevelData.side }}</span>
                           </div>

                           <!-- Back -->
                           <!-- Flips UP when unfolded -->
                           <div class="face back bg-indigo-500 border-2 border-indigo-700 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                                :style="{ transform: isUnfolded ? 'rotateX(180deg) translateZ(0px) translateY(256px)' : 'rotateY(180deg) translateZ(64px)' }">
                                <span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80" style="transform: rotate(180deg)">{{ currentLevelData.side }}×{{ currentLevelData.side }}</span>
                           </div>

                           <!-- Top -->
                           <!-- Flips UP -->
                           <div class="face top bg-sky-400 border-2 border-sky-600 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                                :style="{ transform: isUnfolded ? 'rotateX(0deg) translateZ(0px) translateY(-128px)' : 'rotateX(90deg) translateZ(64px)' }">
                                <span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}×{{ currentLevelData.side }}</span>
                           </div>

                           <!-- Bottom -->
                           <!-- Flips DOWN -->
                           <div class="face bottom bg-cyan-600 border-2 border-cyan-800 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                                :style="{ transform: isUnfolded ? 'rotateX(0deg) translateZ(0px) translateY(128px)' : 'rotateX(-90deg) translateZ(64px)' }">
                                <span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}×{{ currentLevelData.side }}</span>
                           </div>

                           <!-- Left -->
                           <!-- Flips LEFT -->
                           <div class="face left bg-teal-500 border-2 border-teal-700 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                                :style="{ transform: isUnfolded ? 'rotateY(0deg) translateZ(0px) translateX(-128px)' : 'rotateY(-90deg) translateZ(64px)' }">
                                <span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}×{{ currentLevelData.side }}</span>
                           </div>

                           <!-- Right -->
                           <!-- Flips RIGHT -->
                           <div class="face right bg-emerald-500 border-2 border-emerald-700 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                                :style="{ transform: isUnfolded ? 'rotateY(0deg) translateZ(0px) translateX(128px)' : 'rotateY(90deg) translateZ(64px)' }">
                                <span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}×{{ currentLevelData.side }}</span>
                           </div>

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

/* 3D Cube Logic */
.perspective-container {
    perspective: 1000px;
}
.preserve-3d {
    transform-style: preserve-3d;
}
.face {
    position: absolute;
    width: 128px;
    height: 128px;
    transition: transform 1s cubic-bezier(0.25, 0.1, 0.25, 1);
    backface-visibility: visible; /* Important for the flat net view to see all faces */
}
</style>