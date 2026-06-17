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
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function generateLevel() {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  function pickN(n, min, max, exclude) {
    const result = []
    const ex = exclude || []
    while (result.length < n) {
      const r = randInt(min, max)
      if (!result.includes(r) && !ex.includes(r)) result.push(r)
    }
    return result
  }
  // Level 1: Even numbers and Multiples of 3
  const l1Even = pickN(1, 2, 10, []).filter(n => n % 2 === 0)
  const l1EvenExtra = pickN(1, 2, 10, l1Even).filter(n => n % 2 === 0)
  const l1EvenAll = [...new Set([...l1Even, ...l1EvenExtra])].slice(0, 2)
  const l1Mult3Odd = pickN(1, 3, 9, l1EvenAll).filter(n => n % 3 === 0 && n % 2 !== 0)
  const l1Mult3Even = pickN(1, 3, 12, [...l1EvenAll, ...(l1Mult3Odd.length > 0 ? l1Mult3Odd : [])]).filter(n => n % 3 === 0 && n % 2 === 0)
  const l1Outside = pickN(1, 5, 14, [...l1EvenAll, ...l1Mult3Odd, ...l1Mult3Even]).filter(n => n % 3 !== 0 && n % 2 !== 0)
  // Ensure we have enough items; fallback to known values
  const l1A = l1EvenAll.length >= 2 ? l1EvenAll : [4, 8]
  const l1B = l1Mult3Odd.length >= 1 ? l1Mult3Odd : [3]
  const l1I = l1Mult3Even.length >= 1 ? l1Mult3Even : [6]
  const l1O = l1Outside.length >= 1 ? l1Outside : [5]
  const l1Items = [
    { id: 1, value: l1A[0], targetRegion: 'aOnly', currentRegion: 'bank' },
    { id: 2, value: l1A[1], targetRegion: 'aOnly', currentRegion: 'bank' },
    { id: 3, value: l1B[0], targetRegion: 'bOnly', currentRegion: 'bank' },
    { id: 4, value: l1I[0], targetRegion: 'intersection', currentRegion: 'bank' },
    { id: 5, value: l1O[0], targetRegion: 'outside', currentRegion: 'bank' }
  ]

  // Level 2: Prime numbers and Odd numbers
  const primes = [2, 3, 5, 7, 11, 13]
  const l2PrimeEven = 2
  const l2PrimeOddCandidates = primes.filter(p => p !== 2)
  const l2PrimeOdd = l2PrimeOddCandidates.length > 0 ? l2PrimeOddCandidates[0] : 3
  const l2CompEvenCandidates = [4, 6, 8, 10].filter(n => n !== l2PrimeOdd)
  const l2CompEven = l2CompEvenCandidates.length > 0 ? l2CompEvenCandidates[randInt(0, l2CompEvenCandidates.length - 1)] : 4
  const l2CompOddCandidates = [9, 15].filter(n => n !== l2PrimeOdd && n !== l2CompEven)
  const l2CompOdd = l2CompOddCandidates.length > 0 ? l2CompOddCandidates[0] : 9
  const l2Items = [
    { id: 6, value: l2PrimeEven, targetRegion: 'aOnly', currentRegion: 'bank' },
    { id: 7, value: l2PrimeOdd, targetRegion: 'intersection', currentRegion: 'bank' },
    { id: 8, value: l2CompEven, targetRegion: 'outside', currentRegion: 'bank' },
    { id: 9, value: l2CompOdd, targetRegion: 'bOnly', currentRegion: 'bank' }
  ]

  // Level 3: Divisible by 2 and Divisible by 4
  const div2not4Candidates = [2, 6, 10, 14].filter(n => n !== l2Items.some(i => i.value === n))
  const div2not4 = div2not4Candidates.slice(0, 2)
  const div4Candidates = [4, 8, 12, 16].filter(n => !div2not4.includes(n))
  const div4Pick1 = div4Candidates.length > 0 ? div4Candidates[0] : 4
  const div4Pick2 = div4Candidates.length > 1 ? div4Candidates[1] : 8
  const l3Outside = pickN(1, 5, 15, [div2not4[0], div2not4[1], div4Pick1, div4Pick2]).filter(n => n % 2 !== 0)[0]
  const l3DefOutside = l3Outside || 7
  const l3Items = [
    { id: 10, value: div2not4[0], targetRegion: 'aOnly', currentRegion: 'bank' },
    { id: 11, value: div4Pick1, targetRegion: 'intersection', currentRegion: 'bank' },
    { id: 12, value: div2not4[1], targetRegion: 'aOnly', currentRegion: 'bank' },
    { id: 13, value: div4Pick2, targetRegion: 'intersection', currentRegion: 'bank' },
    { id: 14, value: l3DefOutside, targetRegion: 'outside', currentRegion: 'bank' }
  ]

  return [
    {
      goalText: 'Opdracht 1: Even en Veelvoud van 3',
      labelA: 'Even Getallen',
      labelB: 'Veelvouden van 3',
      items: l1Items,
      hints: {
        vague: 'Kijk naar de eigenschappen van elk getal. Is het even? Is het een veelvoud van 3? Of allebei?',
        specific: 'Sommige getallen horen in de overlap (A en B), sommige in slechts een cirkel, sommige buiten beide.'
      }
    },
    {
      goalText: 'Opdracht 2: Priemgetallen en Oneven',
      labelA: 'Priemgetallen',
      labelB: 'Oneven Getallen',
      items: l2Items,
      hints: {
        vague: 'Denk aan de definities. Een priemgetal heeft precies twee delers. Oneven betekent niet deelbaar door 2.',
        specific: 'Let op 2: het is het enige EVEN priemgetal. En 9 is oneven maar geen priemgetal.'
      }
    },
    {
      goalText: 'Opdracht 3: Deelbaar door 2 en Deelbaar door 4',
      labelA: 'Deelbaar door 2',
      labelB: 'Deelbaar door 4',
      items: l3Items,
      hints: {
        vague: 'Alles wat deelbaar is door 4, is ook deelbaar door 2. Kan iets deelbaar zijn door 4 zonder deelbaar te zijn door 2?',
        specific: 'Als een getal deelbaar is door 4, dan hoort het in de overlap (A en B). Zuivere B bestaat niet!'
      }
    }
  ]
}

const levels = ref(generateLevel())
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const items = ref([])
const selectedItemId = ref(null)

const bankItems = computed(() => items.value.filter(i => i.currentRegion === 'bank'))
const aOnlyItems = computed(() => items.value.filter(i => i.currentRegion === 'aOnly'))
const bOnlyItems = computed(() => items.value.filter(i => i.currentRegion === 'bOnly'))
const intersectionItems = computed(() => items.value.filter(i => i.currentRegion === 'intersection'))
const outsideItems = computed(() => items.value.filter(i => i.currentRegion === 'outside'))

function cloneItems(levelItems) {
  return levelItems.map(item => ({ ...item }))
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Selecteer een getal uit de lijst onderaan.' };
    selectedItemId.value = null;
    attemptCount.value = 0;
    levels.value = generateLevel();
    items.value = cloneItems(levels.value[currentInternalLevel.value].items);
}

function selectItem(id) {
    if (isCorrect.value) return;
    const item = items.value.find(i => i.id === id)
    if (item.currentRegion !== 'bank') {
        item.currentRegion = 'bank'
        selectedItemId.value = null
    } else {
        selectedItemId.value = selectedItemId.value === id ? null : id
    }
}

function placeInRegion(region) {
    if (!selectedItemId.value || isCorrect.value) return;
    const item = items.value.find(i => i.id === selectedItemId.value)
    if (item) {
        item.currentRegion = region
        selectedItemId.value = null
        // Auto-correct: check if all placed and correct
        const allPlaced = items.value.every(i => i.currentRegion !== 'bank')
        if (allPlaced) {
          const allCorrect = items.value.every(i => i.currentRegion === i.targetRegion)
          if (allCorrect) {
            isCorrect.value = true
            feedback.value = {
              type: 'success',
              text: 'Perfect geplaatst! Je hebt logisch geredeneerd met beide eigenschappen tegelijk.'
            }
          } else {
            attemptCount.value++
            const wrongItem = items.value.find(i => i.currentRegion !== i.targetRegion)
            if (attemptCount.value === 1) {
              feedback.value = { type: 'error', text: currentLevelData.value.hints.vague }
            } else if (attemptCount.value === 2) {
              feedback.value = { type: 'error', text: currentLevelData.value.hints.specific }
            } else {
              feedback.value = { type: 'error', text: 'Het getal ' + wrongItem.value + ' staat verkeerd. Denk aan de definitie: ' + (wrongItem.currentRegion === 'intersection' ? 'de doorsnede is alleen voor getallen die aan BEIDE eigenschappen voldoen.' : wrongItem.currentRegion === 'aOnly' ? 'cirkel A is alleen voor getallen die ALLEEN aan de eerste eigenschap voldoen.' : 'cirkel B is alleen voor getallen die ALLEEN aan de tweede eigenschap voldoen.') }
            }
          }
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
              <button v-if="!isCorrect" disabled class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-400 cursor-not-allowed opacity-60">Auto-controle actief</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid"
               @click.self="placeInRegion('outside')">

              <div class="relative w-[600px] h-[400px] flex items-center justify-center">

                  <div class="absolute inset-0 border-4 border-dashed border-slate-300 rounded-2xl cursor-pointer transition-colors"
                       :class="selectedItemId ? 'bg-slate-200/40 hover:bg-slate-300/60 border-fuchsia-400/50' : 'hover:bg-slate-200/20'"
                       @click.self="placeInRegion('outside')">
                      <div class="absolute top-4 left-4 text-slate-400 font-bold uppercase tracking-widest text-sm pointer-events-none">Buitengebied (Noch A, noch B)</div>

                      <div class="absolute inset-x-4 bottom-4 flex gap-2 pointer-events-none">
                          <button v-for="item in outsideItems" :key="item.id" @click.stop="selectItem(item.id)" class="w-10 h-10 rounded-full font-bold bg-slate-200 border-2 border-slate-400 text-slate-700 pointer-events-auto shadow-sm hover:scale-110 transition-transform">
                              {{ item.value }}
                          </button>
                      </div>
                  </div>

                  <div class="relative w-[450px] h-[300px] flex">

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