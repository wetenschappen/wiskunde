<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScales, PhArrowClockwise, PhMathOperations
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Vergelijkingen: De Balansmethode' },
  instruction: { 
    type: String, 
    default: 'Een vergelijking oplossen is zoals een weegschaal in evenwicht houden: <strong>alles wat je links doet, móét je rechts ook doen!</strong><br/><br/><strong>Opdracht:</strong> Isoleer de onbekende (zorg dat 1x alleen overblijft) door bewerkingen uit te voeren op beide kanten.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhScales }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kies een actie uit de knoppen om toe te passen op BEIDE kanten.' })

// Domain Logic
// Equation: 3x + 2 = 11
const initialXCount = 3
const initialConstantLeft = 2
const initialConstantRight = 11

const xCount = ref(3)
const constLeft = ref(2)
const constRight = ref(11)

const isBalanced = computed(() => {
    // To check if they broke math, we assume x=3 is the true weight.
    // Left weight = xCount * 3 + constLeft. Right weight = constRight.
    // But since they can only apply valid operations to both sides simultaneously via our buttons, it will always stay balanced.
    return true
})

function performOperation(op) {
    if (isCorrect.value) return;
    
    if (op === 'sub2') {
        if (constLeft.value >= 2 && constRight.value >= 2) {
            constLeft.value -= 2
            constRight.value -= 2
            feedback.value = { type: 'success', text: 'Goed! Je hebt links en rechts 2 blokjes weggehaald. De weegschaal is nog steeds in evenwicht.' }
        } else {
            feedback.value = { type: 'error', text: 'Je kan er geen 2 weghalen, want je hebt ze niet overal!' }
        }
    } else if (op === 'div3') {
        if (xCount.value % 3 === 0 && constLeft.value % 3 === 0 && constRight.value % 3 === 0) {
            xCount.value /= 3
            constLeft.value /= 3
            constRight.value /= 3
            
            if (xCount.value === 1 && constLeft.value === 0) {
                isCorrect.value = true
                isChecked.value = true
                feedback.value = { type: 'success', text: 'Perfect! Je hebt alles in 3 gedeeld. Je houdt nu exact 1 x over, dus x = 3!' }
            } else {
                feedback.value = { type: 'success', text: 'Oké, je hebt gedeeld door 3.' }
            }
        } else {
            feedback.value = { type: 'error', text: 'Dat kan niet zomaar. Je kan niet alles netjes door 3 delen op dit moment zonder breuken te maken. Verwijder eerst de losse blokjes!' }
        }
    } else if (op === 'add2') {
        constLeft.value += 2
        constRight.value += 2
        feedback.value = { type: 'error', text: 'Je hebt links en rechts blokjes toegevoegd. Dat mag wiskundig (balans blijft), maar je maakt de vergelijking alleen maar complexer! We willen x afzonderen.' }
    } else if (op === 'mult3') {
        xCount.value *= 3
        constLeft.value *= 3
        constRight.value *= 3
        feedback.value = { type: 'error', text: 'Je hebt alles verdrievoudigd. De balans is er nog, maar we willen juist MINDER x-en hebben, niet meer!' }
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Kies een actie uit de knoppen om toe te passen op BEIDE kanten.' };
    xCount.value = initialXCount;
    constLeft.value = initialConstantLeft;
    constRight.value = initialConstantRight;
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-orange-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-orange-600" />
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
            
            <div class="p-4 mt-6 border border-orange-200 bg-orange-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-orange-900 mb-4">Acties (op beide kanten):</label>
               
               <div class="flex flex-col gap-3">
                   <button @click="performOperation('sub2')" :disabled="isCorrect" class="py-2 px-4 rounded border-2 font-bold transition-all shadow-sm active:scale-95 bg-white border-slate-300 text-slate-600 hover:border-orange-400 hover:text-orange-600 flex items-center justify-center gap-2">
                       - 2 blokjes
                   </button>
                   <button @click="performOperation('add2')" :disabled="isCorrect" class="py-2 px-4 rounded border-2 font-bold transition-all shadow-sm active:scale-95 bg-white border-slate-300 text-slate-600 hover:border-orange-400 hover:text-orange-600 flex items-center justify-center gap-2">
                       + 2 blokjes
                   </button>
                   <button @click="performOperation('div3')" :disabled="isCorrect" class="py-2 px-4 rounded border-2 font-bold transition-all shadow-sm active:scale-95 bg-white border-slate-300 text-slate-600 hover:border-orange-400 hover:text-orange-600 flex items-center justify-center gap-2">
                       ÷ 3 (neem 1/3)
                   </button>
                   <button @click="performOperation('mult3')" :disabled="isCorrect" class="py-2 px-4 rounded border-2 font-bold transition-all shadow-sm active:scale-95 bg-white border-slate-300 text-slate-600 hover:border-orange-400 hover:text-orange-600 flex items-center justify-center gap-2">
                       × 3 (verdrievoudig)
                   </button>
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
              <button v-if="isCorrect" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-4xl flex flex-col items-center">
                  
                  <div class="font-mono font-black text-4xl text-slate-700 bg-white px-8 py-4 rounded-full shadow border-2 border-slate-200 mb-12 flex gap-4 transition-all">
                      <span :class="isCorrect ? 'text-emerald-500' : ''"><span v-if="xCount > 1">{{xCount}}</span>x</span>
                      <span v-if="constLeft > 0" class="text-slate-400">+</span>
                      <span v-if="constLeft > 0">{{ constLeft }}</span>
                      <span class="text-orange-500">=</span>
                      <span>{{ constRight }}</span>
                  </div>

                  <!-- Visual Balance Scale -->
                  <div class="relative w-full max-w-2xl min-h-[300px]">
                      
                      <!-- The Beam -->
                      <div class="absolute bottom-20 left-0 w-full h-4 bg-slate-700 rounded-full shadow-lg z-10 flex justify-between px-16 transition-transform duration-500"
                           :class="!isBalanced ? 'rotate-6' : ''">
                          
                          <!-- Left Pan -->
                          <div class="absolute left-16 bottom-4 w-48 flex flex-col items-center">
                              
                              <div class="flex items-end justify-center gap-2 mb-2 w-full flex-wrap transition-all">
                                  <!-- X Boxes -->
                                  <div v-for="i in xCount" :key="'x'+i" class="w-16 h-16 bg-blue-100 border-4 border-blue-500 rounded-xl flex items-center justify-center shadow-sm animate-fadeIn">
                                      <span class="font-black text-2xl text-blue-600 font-mono">x</span>
                                  </div>
                                  
                                  <!-- 1 Blocks -->
                                  <div v-for="i in constLeft" :key="'cl'+i" class="w-8 h-8 bg-slate-200 border-2 border-slate-400 rounded-lg shadow-sm flex items-center justify-center font-bold text-slate-500 text-xs animate-fadeIn">1</div>
                              </div>
                              
                              <div class="w-full h-2 bg-slate-300 rounded-full border border-slate-400"></div>
                          </div>

                          <!-- Right Pan -->
                          <div class="absolute right-16 bottom-4 w-48 flex flex-col items-center">
                              
                              <div class="flex items-end justify-center gap-1 mb-2 w-full flex-wrap transition-all">
                                  <div v-for="i in constRight" :key="'cr'+i" class="w-8 h-8 bg-slate-200 border-2 border-slate-400 rounded-lg shadow-sm flex items-center justify-center font-bold text-slate-500 text-xs animate-fadeIn">1</div>
                              </div>
                              
                              <div class="w-full h-2 bg-slate-300 rounded-full border border-slate-400"></div>
                          </div>

                      </div>

                      <!-- The Fulcrum -->
                      <div class="absolute left-1/2 bottom-0 -translate-x-1/2 w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[80px] border-b-slate-400 z-0 drop-shadow-md"></div>
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
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5) translateY(-20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>