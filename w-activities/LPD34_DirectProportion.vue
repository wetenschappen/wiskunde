<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCarProfile, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Evenredigheden: Recht Evenredig' },
  instruction: { 
    type: String, 
    default: 'Een auto rijdt met een constante snelheid van <strong>50 km/uur</strong>. Als je 2 keer zo lang rijdt, leg je 2 keer zoveel afstand af. Dit noemen we <strong>recht evenredig</strong>.<br/><br/><strong>Opdracht:</strong> Vul de ontbrekende afstanden in de tabel aan. Kijk wat er met de grafiek gebeurt!' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCarProfile }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Vul de lege vakjes in de tabel in.' })

// Domain Logic
const ans2 = ref(null)
const ans4 = ref(null)
const ans5 = ref(null)

const speed = 50 // km/h

const points = computed(() => {
    return [
        { x: 1, y: 50, visible: true },
        { x: 2, y: ans2.value || 0, visible: ans2.value !== null },
        { x: 4, y: ans4.value || 0, visible: ans4.value !== null },
        { x: 5, y: ans5.value || 0, visible: ans5.value !== null }
    ]
})

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Vul de lege vakjes in de tabel in.' };
    ans2.value = null;
    ans4.value = null;
    ans5.value = null;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (ans2.value === 100 && ans4.value === 200 && ans5.value === 250) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Perfect! Als je de punten op de grafiek verbindt, krijg je een rechte lijn die vertrekt vanuit de oorsprong (0,0). Dit is hét kenmerk van recht evenredigheid!' 
    }
  } else {
    isCorrect.value = false
    
    if (ans2.value !== 100) {
        feedback.value = { type: 'error', text: 'Fout bij 2 uur. Als je in 1 uur 50 km rijdt, hoeveel dan in 2 uur? (Vermenigvuldig met 2)'}
    } else if (ans4.value !== 200) {
        feedback.value = { type: 'error', text: 'Fout bij 4 uur. Als je in 2 uur 100 km rijdt, hoeveel dan in 4 uur? (Verdubbel de afstand)'}
    } else if (ans5.value !== 250) {
        feedback.value = { type: 'error', text: 'Fout bij 5 uur. De formule is Afstand = Tijd × 50.'}
    } else {
        feedback.value = { type: 'error', text: 'Vul alle vakjes in de tabel in.'}
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-blue-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
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
            
            <div class="p-4 mt-6 border border-blue-200 bg-blue-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-blue-900 mb-4">Tabel:</h4>
               
               <table class="w-full text-center border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                   <thead>
                       <tr class="bg-blue-100 text-blue-800">
                           <th class="p-2 border border-blue-200">Tijd (h)</th>
                           <th class="p-2 border border-blue-200">Afstand (km)</th>
                       </tr>
                   </thead>
                   <tbody>
                       <tr>
                           <td class="p-2 border border-slate-200 font-bold text-slate-700">1</td>
                           <td class="p-2 border border-slate-200 font-bold text-slate-700">50</td>
                       </tr>
                       <tr>
                           <td class="p-2 border border-slate-200 font-bold text-slate-700">2</td>
                           <td class="p-1 border border-slate-200">
                               <input type="number" v-model.number="ans2" :disabled="isCorrect" class="w-full p-1 text-center font-bold border-b-2 focus:border-blue-500 outline-none" :class="ans2 === 100 && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-slate-300'" />
                           </td>
                       </tr>
                       <tr>
                           <td class="p-2 border border-slate-200 font-bold text-slate-700">4</td>
                           <td class="p-1 border border-slate-200">
                               <input type="number" v-model.number="ans4" :disabled="isCorrect" class="w-full p-1 text-center font-bold border-b-2 focus:border-blue-500 outline-none" :class="ans4 === 200 && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-slate-300'" />
                           </td>
                       </tr>
                       <tr>
                           <td class="p-2 border border-slate-200 font-bold text-slate-700">5</td>
                           <td class="p-1 border border-slate-200">
                               <input type="number" v-model.number="ans5" :disabled="isCorrect" class="w-full p-1 text-center font-bold border-b-2 focus:border-blue-500 outline-none" :class="ans5 === 250 && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-slate-300'" />
                           </td>
                       </tr>
                   </tbody>
               </table>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">Controleer Tabel</button>
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-2xl bg-white shadow-xl rounded-3xl border-4 border-slate-300 p-8 flex flex-col items-center">
                  
                  <h4 class="font-bold text-slate-500 uppercase tracking-widest text-xs mb-4">Grafiek: Afstand i.f.v. Tijd</h4>

                  <!-- SVG Graph -->
                  <div class="relative">
                      <svg width="450" height="350" viewBox="0 0 450 350" class="block">
                          <!-- Origin (50, 300) -->
                          
                          <!-- Grid lines -->
                          <g stroke="#e2e8f0" stroke-width="1">
                              <!-- Vertical (x-axis: 0 to 6, step 1) -> 50px per unit. Origin 50, so 50 to 350. -->
                              <line v-for="i in 7" :key="'vg'+i" :x1="50 + (i-1)*60" y1="50" :x2="50 + (i-1)*60" y2="300" />
                              <!-- Horizontal (y-axis: 0 to 300, step 50) -> 40px per 50 units. Origin 300, so 300 to 60. -->
                              <line v-for="i in 7" :key="'hg'+i" x1="50" :y1="300 - (i-1)*40" x2="410" :y2="300 - (i-1)*40" />
                          </g>

                          <!-- Axes -->
                          <line x1="50" y1="300" x2="420" y2="300" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />
                          <line x1="50" y1="300" x2="50" y2="30" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />
                          
                          <defs>
                              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                                  <polygon points="0 0, 10 5, 0 10" fill="#475569" />
                              </marker>
                          </defs>

                          <!-- Labels -->
                          <text x="400" y="325" font-weight="bold" fill="#64748b" font-size="12">Tijd (h)</text>
                          <text x="40" y="20" font-weight="bold" fill="#64748b" font-size="12" text-anchor="end">Afstand (km)</text>

                          <!-- Ticks X -->
                          <g font-size="10" fill="#94a3b8" font-weight="bold" text-anchor="middle">
                              <text x="50" y="315">0</text>
                              <text x="110" y="315">1</text>
                              <text x="170" y="315">2</text>
                              <text x="230" y="315">3</text>
                              <text x="290" y="315">4</text>
                              <text x="350" y="315">5</text>
                          </g>

                          <!-- Ticks Y -->
                          <g font-size="10" fill="#94a3b8" font-weight="bold" text-anchor="end">
                              <text x="40" y="264">50</text>
                              <text x="40" y="224">100</text>
                              <text x="40" y="184">150</text>
                              <text x="40" y="144">200</text>
                              <text x="40" y="104">250</text>
                              <text x="40" y="64">300</text>
                          </g>

                          <!-- Connecting Line (only when correct) -->
                          <line v-if="isCorrect" x1="50" y1="300" :x2="50 + 5*60" :y2="300 - (250/50)*40" stroke="#0ea5e9" stroke-width="3" class="animate-slash origin-bottom-left" />

                          <!-- Data Points -->
                          <g v-for="pt in points" :key="pt.x">
                              <circle v-if="pt.visible" 
                                      :cx="50 + pt.x * 60" 
                                      :cy="300 - (pt.y / 50) * 40" 
                                      r="6" fill="#0284c7" stroke="white" stroke-width="2" class="animate-fadeIn shadow-sm" />
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
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }

.animate-slash {
    animation: slash 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes slash {
    0% { transform: scaleX(0) scaleY(0); opacity: 0;}
    100% { transform: scaleX(1) scaleY(1); opacity: 1;}
}
</style>