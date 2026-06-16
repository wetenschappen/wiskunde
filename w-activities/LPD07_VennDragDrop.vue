<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCirclesThree, PhArrowClockwise, PhHandGrabbing
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Verzamelingen: Het Venndiagram' },
  instruction: { 
    type: String, 
    default: 'Test je wiskundige logica met het Venndiagram.<br/><br/><strong>Opdracht:</strong> Selecteer een getal en klik daarna op de juiste zone in het Venndiagram om het te plaatsen. Plaats alle getallen correct om het level te voltooien.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCirclesThree }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Selecteer een getal uit de bank onderaan.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Even en Veelvoud van 3',
    labelA: 'Even Getallen',
    labelB: 'Veelvouden van 3',
    items: [
      { id: 2, value: 2, targetRegion: 'aOnly', currentRegion: 'bank' },
      { id: 3, value: 3, targetRegion: 'bOnly', currentRegion: 'bank' },
      { id: 4, value: 4, targetRegion: 'aOnly', currentRegion: 'bank' },
      { id: 6, value: 6, targetRegion: 'intersection', currentRegion: 'bank' },
      { id: 7, value: 7, targetRegion: 'outside', currentRegion: 'bank' }
    ],
    hintCheck: (wrongItem) => {
        if (wrongItem.value === 6 && wrongItem.currentRegion !== 'intersection') return 'Kijk eens naar het getal 6. Is dat even? Ja. Is het een veelvoud van 3? Ja. Waar moet het dan staan?'
        if (wrongItem.value === 7 && wrongItem.currentRegion !== 'outside') return 'Kijk naar het getal 7. Het is niet even, en geen veelvoud van 3. Het hoort dus in géén van beide cirkels!'
        if ((wrongItem.value === 2 || wrongItem.value === 4) && wrongItem.currentRegion === 'intersection') return `Het getal ${wrongItem.value} is wel even, maar GEEN veelvoud van 3. Het mag dus niet in de doorsnede staan.`
        if (wrongItem.value === 3 && wrongItem.currentRegion === 'intersection') return `Het getal ${wrongItem.value} is een veelvoud van 3, maar is het ook even? Nee. Dus niet in de doorsnede.`
        return `Het getal ${wrongItem.value} staat in de verkeerde zone.`
    }
  },
  {
    goalText: 'Opdracht 2: Priemgetallen en Oneven',
    labelA: 'Priemgetallen',
    labelB: 'Oneven Getallen',
    items: [
      { id: 2, value: 2, targetRegion: 'aOnly', currentRegion: 'bank' }, // Prime, Even
      { id: 3, value: 3, targetRegion: 'intersection', currentRegion: 'bank' }, // Prime, Odd
      { id: 4, value: 4, targetRegion: 'outside', currentRegion: 'bank' }, // Not Prime, Even
      { id: 9, value: 9, targetRegion: 'bOnly', currentRegion: 'bank' }, // Not Prime, Odd
    ],
    hintCheck: (wrongItem) => {
        if (wrongItem.value === 2 && wrongItem.currentRegion !== 'aOnly') return 'Denk aan 2! Het is het enige EVEN priemgetal. Het is dus wél priem (A), maar niet oneven (B).'
        if (wrongItem.value === 9 && wrongItem.currentRegion !== 'bOnly') return '9 is oneven, maar is het priem? Nee, 9 is deelbaar door 3. Waar hoort het dan?'
        return `Het getal ${wrongItem.value} is fout geplaatst. Controleer de definities.`
    }
  },
  {
    goalText: 'Opdracht 3: Deelbaar door 2 en Deelbaar door 4',
    labelA: 'Deelbaar door 2',
    labelB: 'Deelbaar door 4',
    items: [
      { id: 4, value: 4, targetRegion: 'intersection', currentRegion: 'bank' }, // Div by 2 and 4
      { id: 6, value: 6, targetRegion: 'aOnly', currentRegion: 'bank' }, // Div by 2, not 4
      { id: 8, value: 8, targetRegion: 'intersection', currentRegion: 'bank' }, // Div by 2 and 4
      { id: 10, value: 10, targetRegion: 'aOnly', currentRegion: 'bank' }, // Div by 2, not 4
      { id: 7, value: 7, targetRegion: 'outside', currentRegion: 'bank' } // Neither
    ],
    hintCheck: (wrongItem) => {
        // Special case: anything div by 4 is ALWAYS div by 2. So bOnly should always be empty.
        if (wrongItem.currentRegion === 'bOnly') return 'Denk goed na: kan een getal deelbaar zijn door 4 ZONDER dat het deelbaar is door 2? Dat is onmogelijk! Cirkel B (zonder de doorsnede) blijft altijd leeg.'
        return `Het getal ${wrongItem.value} is fout. Is het deelbaar door 2? Is het deelbaar door 4?`
    }
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])
const items = ref(JSON.parse(JSON.stringify(levels[0].items)))
const selectedItemId = ref(null)

const bankItems = computed(() => items.value.filter(i => i.currentRegion === 'bank'))
const aOnlyItems = computed(() => items.value.filter(i => i.currentRegion === 'aOnly'))
const bOnlyItems = computed(() => items.value.filter(i => i.currentRegion === 'bOnly'))
const intersectionItems = computed(() => items.value.filter(i => i.currentRegion === 'intersection'))
const outsideItems = computed(() => items.value.filter(i => i.currentRegion === 'outside'))

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Selecteer een getal uit de lijst onderaan.' };
    selectedItemId.value = null;
    items.value = JSON.parse(JSON.stringify(levels[currentInternalLevel.value].items));
}

function selectItem(id) {
    if (isCorrect.value) return;
    // If clicking an already placed item, move it back to bank
    const item = items.value.find(i => i.id === id)
    if (item.currentRegion !== 'bank') {
        item.currentRegion = 'bank'
        selectedItemId.value = null
        isChecked.value = false;
    } else {
        selectedItemId.value = selectedItemId.value === id ? null : id;
    }
}

function placeInRegion(region) {
    if (!selectedItemId.value || isCorrect.value) return;
    const item = items.value.find(i => i.id === selectedItemId.value)
    if (item) {
        item.currentRegion = region
        selectedItemId.value = null
        isChecked.value = false;
    }
}

function checkAnswer() {
  isChecked.value = true;
  
  const anyInBank = items.value.some(i => i.currentRegion === 'bank')
  if (anyInBank) {
      isCorrect.value = false
      feedback.value = { type: 'error', text: 'Plaats eerst alle getallen in het diagram voordat je controleert.'}
      return
  }

  const allCorrect = items.value.every(i => i.currentRegion === i.targetRegion)

  if (allCorrect) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Perfect geplaatst! Je hebt logisch geredeneerd met beide eigenschappen tegelijk.' 
    }
  } else {
    isCorrect.value = false
    // Find a specific error to give didactic feedback using the level's hint function
    const wrongItem = items.value.find(i => i.currentRegion !== i.targetRegion)
    feedback.value = { type: 'error', text: currentLevelData.value.hintCheck(wrongItem) }
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-fuchsia-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-fuchsia-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-fuchsia-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-fuchsia-50 p-4 border border-fuchsia-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-fuchsia-800">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner relative overflow-visible">
               <h4 class="font-bold text-slate-700 mb-2">Getallenbank</h4>
               <p class="text-xs text-slate-500 mb-4">Klik om te selecteren, klik in diagram om te plaatsen.</p>
               
               <div class="flex flex-wrap gap-2 min-h-[60px]">
                   <button v-for="item in bankItems" :key="item.id" 
                           @click="selectItem(item.id)"
                           class="w-12 h-12 rounded-full font-bold text-xl flex items-center justify-center transition-all shadow-sm border-2"
                           :class="selectedItemId === item.id ? 'bg-fuchsia-500 border-fuchsia-600 text-white scale-110 shadow-lg' : 'bg-white border-slate-300 text-slate-700 hover:border-fuchsia-300 hover:bg-fuchsia-50'">
                       {{ item.value }}
                   </button>
               </div>
               
               <div v-if="selectedItemId" class="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
                   <PhHandGrabbing weight="fill" /> Klik nu in de juiste zone
                   <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
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
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Diagram</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid"
               @click.self="placeInRegion('outside')"> <!-- Clicking outside the circles places it 'outside' -->
              
              <div class="relative w-[600px] h-[400px] flex items-center justify-center">
                  
                  <!-- OUTSIDE Region Indicator -->
                  <div class="absolute inset-0 border-4 border-dashed border-slate-300 rounded-2xl cursor-pointer transition-colors"
                       :class="selectedItemId ? 'bg-slate-200/40 hover:bg-slate-300/60 border-fuchsia-400/50' : 'hover:bg-slate-200/20'"
                       @click.self="placeInRegion('outside')">
                      <div class="absolute top-4 left-4 text-slate-400 font-bold uppercase tracking-widest text-sm pointer-events-none">Buitengebied (Noch A, noch B)</div>
                      
                      <!-- Render items in outside region -->
                      <div class="absolute inset-x-4 bottom-4 flex gap-2 pointer-events-none">
                          <button v-for="item in outsideItems" :key="item.id" @click.stop="selectItem(item.id)" class="w-10 h-10 rounded-full font-bold bg-slate-200 border-2 border-slate-400 text-slate-700 pointer-events-auto shadow-sm hover:scale-110 transition-transform">
                              {{ item.value }}
                          </button>
                      </div>
                  </div>

                  <!-- VENN DIAGRAM CONTAINER -->
                  <div class="relative w-[450px] h-[300px] flex">
                      
                      <!-- CIRCLE A (Left) -->
                      <div class="absolute left-0 w-[300px] h-[300px] rounded-full border-[6px] border-blue-500 bg-blue-500/20 flex items-center justify-start p-8 cursor-pointer transition-all"
                           :class="selectedItemId ? 'ring-4 ring-fuchsia-400/50 ring-offset-4 ring-offset-slate-100 hover:bg-blue-500/40' : 'hover:bg-blue-500/30'"
                           @click="placeInRegion('aOnly')">
                           <span class="absolute top-8 left-12 font-black text-2xl text-blue-700 pointer-events-none">A</span>
                           <span class="absolute top-16 left-12 font-bold text-sm text-blue-800 pointer-events-none">{{ currentLevelData.labelA }}</span>
                           
                           <div class="flex flex-wrap gap-2 w-32 pointer-events-none">
                               <button v-for="item in aOnlyItems" :key="item.id" @click.stop="selectItem(item.id)" class="w-10 h-10 rounded-full font-bold bg-white border-2 border-blue-500 text-blue-700 pointer-events-auto shadow-sm hover:scale-110 transition-transform">
                                  {{ item.value }}
                               </button>
                           </div>
                      </div>

                      <!-- CIRCLE B (Right) -->
                      <div class="absolute right-0 w-[300px] h-[300px] rounded-full border-[6px] border-amber-500 bg-amber-500/20 flex items-center justify-end p-8 cursor-pointer transition-all"
                           :class="selectedItemId ? 'ring-4 ring-fuchsia-400/50 ring-offset-4 ring-offset-slate-100 hover:bg-amber-500/40' : 'hover:bg-amber-500/30'"
                           @click="placeInRegion('bOnly')">
                           <span class="absolute top-8 right-12 font-black text-2xl text-amber-700 pointer-events-none">B</span>
                           <span class="absolute top-16 right-6 font-bold text-sm text-amber-800 pointer-events-none">{{ currentLevelData.labelB }}</span>
                           
                           <div class="flex flex-wrap gap-2 justify-end w-32 pointer-events-none">
                               <button v-for="item in bOnlyItems" :key="item.id" @click.stop="selectItem(item.id)" class="w-10 h-10 rounded-full font-bold bg-white border-2 border-amber-500 text-amber-700 pointer-events-auto shadow-sm hover:scale-110 transition-transform">
                                  {{ item.value }}
                               </button>
                           </div>
                      </div>

                      <!-- INTERSECTION (Center Overlay) -->
                      <!-- Placed explicitly over the overlapping area to catch clicks -->
                      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[200px] rounded-[100%] cursor-pointer z-10 flex flex-col items-center justify-center hover:bg-fuchsia-500/20 transition-all"
                           :class="selectedItemId ? 'ring-4 ring-fuchsia-400/50 hover:bg-fuchsia-500/40 bg-fuchsia-500/10' : ''"
                           @click.stop="placeInRegion('intersection')">
                           <span class="text-[10px] font-bold text-fuchsia-800 uppercase tracking-widest pointer-events-none mb-1">A ∩ B</span>
                           <div class="flex flex-wrap gap-2 justify-center pointer-events-none max-w-[80px]">
                               <button v-for="item in intersectionItems" :key="item.id" @click.stop="selectItem(item.id)" class="w-10 h-10 rounded-full font-bold bg-white border-2 border-fuchsia-500 text-fuchsia-700 pointer-events-auto shadow-sm hover:scale-110 transition-transform">
                                  {{ item.value }}
                               </button>
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
</style>