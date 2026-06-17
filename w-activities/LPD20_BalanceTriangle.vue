<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCrosshair, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

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
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kies de juiste merkwaardige lijnen voor dit probleem.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)
const levels = ref([])

function generateLevel() {
  const pool = [
    {
      goalText: 'Missie 1: Balanceren',
      problemDesc: 'Je wilt een zware driehoekige houten plaat perfect laten balanceren op één vinger. Je zoekt het exacte evenwichtspunt.',
      targetLine: 'zwaarte',
      correctMsg: 'Briljant! De zwaartelijnen snijden elkaar in het zwaartepunt. De driehoek balanceert nu perfect op je vinger!',
      errorHoogte: 'Hoogtelijnen meten enkel hoe hoog het is. Je plaat valt onmiddellijk van je vinger!',
      errorMiddel: 'Middelloodlijnen bepalen het middelpunt van de omgeschreven cirkel, niet het gewicht. Plof! Daar gaat je driehoek.',
      errorBissec: 'Bissectrices halveren hoeken, maar zeggen weinig over de massaverdeling. Je plaat valt!',
      context: 'finger',
      hint1: 'Het gaat om het evenwicht of balans van de driehoek.',
      hint2: 'Het snijpunt van de juiste lijnen is het zwaartepunt.',
      hint3: 'Het antwoord is Zwaartelijnen.'
    },
    {
      goalText: 'Missie 2: De Spinkhaan',
      problemDesc: 'Een spin wil een web weven binnenin een driehoekig raamkozijn. Het web moet precies raken aan alle drie de randen (ingeschreven cirkel).',
      targetLine: 'bissec',
      correctMsg: 'Perfect! Bissectrices (deellijnen) snijden elkaar in het middelpunt van de ingeschreven cirkel. De spin is blij!',
      errorHoogte: 'Hoogtelijnen geven geen cirkel die precies past. Het web gaat scheef hangen.',
      errorZwaarte: 'Zwaartelijnen geven het zwaartepunt, niet het geometrisch midden voor randen.',
      errorMiddel: 'Middelloodlijnen bepalen de cirkel RONDOM de driehoek, niet er ín. De spin weeft zijn web buiten het raam!',
      context: 'spider',
      hint1: 'Welke lijnen hebben te maken met het gelijk verdelen van hoeken?',
      hint2: 'Deellijnen (bissectrices) delen elke hoek in twee gelijke helften.',
      hint3: 'Het antwoord is Bissectrices (Deellijnen).'
    },
    {
      goalText: 'Missie 3: Het Brandweerstation',
      problemDesc: 'Drie dorpen willen samen één brandweerstation bouwen. Het station moet van alle drie de dorpen EXACT even ver weg liggen (omgeschreven cirkel).',
      targetLine: 'middel',
      correctMsg: 'Geweldig! De middelloodlijnen snijden elkaar in een punt dat van alle drie de hoekpunten exact even ver ligt. Een eerlijke keuze!',
      errorHoogte: 'Hoogtelijnen helpen niet bij het zoeken van afstanden tot hoekpunten.',
      errorZwaarte: 'Het zwaartepunt ligt wel in het midden, maar niet exact even ver van elk dorp.',
      errorBissec: 'Bissectrices zoeken het punt dat even ver van de WEGEN ligt, niet van de dorpen (hoekpunten) zelf.',
      context: 'map',
      hint1: 'Het gaat om een punt dat exact even ver ligt van de drie hoekpunten.',
      hint2: 'Middelloodlijnen snijden elkaar in het middelpunt van de omgeschreven cirkel.',
      hint3: 'Het antwoord is Middelloodlijnen.'
    },
    {
      goalText: 'Missie 4: Hoogtemeting',
      problemDesc: 'Je wilt weten hoe hoog een driehoekige bergtop is. Je meet de loodrechte afstand van de top tot de basis.',
      targetLine: 'hoogte',
      correctMsg: 'Juist! De hoogtelijn geeft de loodrechte afstand van een hoekpunt tot de overstaande zijde. Perfect voor hoogtemetingen!',
      errorZwaarte: 'Zwaartelijnen gaan naar het midden, niet loodrecht naar beneden.',
      errorMiddel: 'Middelloodlijnen gaan niet door een hoekpunt.',
      errorBissec: 'Bissectrices halveren hoeken, ze meten geen hoogte.',
      context: 'default',
      hint1: 'Welke lijn staat loodrecht op de basis en gaat door de top?',
      hint2: 'Hoogtelijnen zijn altijd loodrecht op de overstaande zijde.',
      hint3: 'Het antwoord is Hoogtelijnen.'
    },
    {
      goalText: 'Missie 5: Cirkel rondom',
      problemDesc: 'Een satelliet moet een signaal sturen naar drie gelijkwaardige grondstations. Het signaal moet overal even sterk aankomen.',
      targetLine: 'middel',
      correctMsg: 'Correct! De middelloodlijnen geven het middelpunt van de omgeschreven cirkel, waar de afstand tot elk station gelijk is.',
      errorHoogte: 'Hoogtelijnen geven geen gelijke afstanden tot de stations.',
      errorZwaarte: 'Zwaartelijnen geven wel het midden, maar niet per se gelijke afstanden.',
      errorBissec: 'Bissectrices meten de afstand tot de zijden, niet tot de hoekpunten.',
      context: 'default',
      hint1: 'Het gaat om een punt dat even ver ligt van alle hoekpunten.',
      hint2: 'Middelloodlijnen snijden elkaar in het middelpunt van de omgeschreven cirkel.',
      hint3: 'Het antwoord is Middelloodlijnen.'
    },
    {
      goalText: 'Missie 6: De Snoepjesverdeler',
      problemDesc: 'Je wilt een machine bouwen die elk snoepje exact in de helft van de hoek laat vallen. De machine moet snoepjes gelijk verdelen over de ruimte tussen twee muren.',
      targetLine: 'bissec',
      correctMsg: 'Precies! Een bissectrice (deellijn) verdeelt elke hoek in twee gelijke delen. De perfecte snoepjesverdeler!',
      errorHoogte: 'Hoogtelijnen meten loodrecht, ze verdelen geen hoeken.',
      errorZwaarte: 'Zwaartelijnen verdelen de massa, niet de hoeken.',
      errorMiddel: 'Middelloodlijnen verdelen zijden, niet hoeken.',
      context: 'default',
      hint1: 'Welke lijn heeft te maken met het halveren van een hoek?',
      hint2: 'Bissectrices (deellijnen) delen een hoek in twee gelijke delen.',
      hint3: 'Het antwoord is Bissectrices (Deellijnen).'
    },
    {
      goalText: 'Missie 7: Het Zwaartepunt',
      problemDesc: 'Een driehoekige pizzadeeg moet perfect in het midden worden opgetild, zodat hij niet scheurt. Waar ligt het ophangpunt?',
      targetLine: 'zwaarte',
      correctMsg: 'Top! De zwaartelijnen geven het zwaartepunt. De pizzadeeg hangt perfect in balans!',
      errorHoogte: 'Hoogtelijnen geven alleen de hoogte, niet het evenwichtspunt.',
      errorMiddel: 'Middelloodlijnen bepalen de omgeschreven cirkel, niet het ophangpunt.',
      errorBissec: 'Bissectrices halveren hoeken, niet de massaverdeling.',
      context: 'default',
      hint1: 'Het ophangpunt is het zwaartepunt van de driehoek.',
      hint2: 'Het snijpunt van de juiste lijnen is het zwaartepunt.',
      hint3: 'Het antwoord is Zwaartelijnen.'
    },
    {
      goalText: 'Missie 8: De Tuinslang',
      problemDesc: 'Je hebt een driehoekig gazon en wilt een sproeier plaatsen die precies alle drie de randen van het gazon kan bereiken.',
      targetLine: 'bissec',
      correctMsg: 'Uitstekend! De bissectrices geven het middelpunt van de ingeschreven cirkel. De sproeier bereikt alle randen!',
      errorHoogte: 'Hoogtelijnen helpen niet bij het vinden van een cirkel die de randen raakt.',
      errorZwaarte: 'Zwaartelijnen geven het zwaartepunt, niet het middelpunt voor de randen.',
      errorMiddel: 'Middelloodlijnen geven de cirkel rondom, niet erin.',
      context: 'default',
      hint1: 'Welk type lijn geeft een cirkel die precies binnen de driehoek past?',
      hint2: 'De ingeschreven cirkel wordt bepaald door de bissectrices.',
      hint3: 'Het antwoord is Bissectrices (Deellijnen).'
    },
    {
      goalText: 'Missie 9: De Vlaggenmast',
      problemDesc: 'Je plaatst een vlaggenmast op een driehoekig plein. De mast moet exact even ver staan van de drie hoeken van het plein.',
      targetLine: 'middel',
      correctMsg: 'Juist! De middelloodlijnen bepalen het middelpunt van de omgeschreven cirkel. De vlaggenmast staat perfect centraal!',
      errorHoogte: 'Hoogtelijnen meten de hoogte, geen afstanden tot hoeken.',
      errorZwaarte: 'Het zwaartepunt is niet per se even ver van alle hoeken.',
      errorBissec: 'Bissectrices meten afstand tot de zijden, niet tot de hoeken.',
      context: 'default',
      hint1: 'Welke lijnen geven een punt dat even ver is van alle hoekpunten?',
      hint2: 'Middelloodlijnen snijden elkaar in het middelpunt van de omgeschreven cirkel.',
      hint3: 'Het antwoord is Middelloodlijnen.'
    }
  ]

  // Shuffle and pick 3
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const activeLines = ref('') // 'hoogte', 'zwaarte', 'middel', 'bissec'

function getHint(data) {
  if (attemptCount.value >= 3) return data.hint3
  if (attemptCount.value >= 2) return data.hint2
  return data.hint1
}

function setLines(type) {
    if (isCorrect.value) return;
    activeLines.value = type;
    isChecked.value = true;

    const data = currentLevelData.value;

    if (type === data.targetLine) {
        isCorrect.value = true
        attemptCount.value = 0
        feedback.value = { type: 'success', text: data.correctMsg }
    } else {
        isCorrect.value = false
        attemptCount.value++
        let msg
        if (type === 'hoogte') msg = data.errorHoogte
        else if (type === 'zwaarte') msg = data.errorZwaarte
        else if (type === 'middel') msg = data.errorMiddel
        else if (type === 'bissec') msg = data.errorBissec
        // Append progressive hint
        const hint = getHint(data)
        feedback.value = { type: 'error', text: msg + ' ' + hint }
    }
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Kies de juiste merkwaardige lijnen voor dit probleem.' };
    activeLines.value = '';
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels.value - 1) {
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
    levels.value = generateLevel();
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
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

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
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
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
                       :class="currentInternalLevel >= 0 && activeLines && !isCorrect ? 'rotate-12 translate-y-12' : ''">

                      <!-- Contextual backdrop -->
                      <div v-if="currentLevelData.context === 'finger'" class="absolute w-12 h-32 bg-[#fcd34d] border-4 border-[#d97706] rounded-t-full shadow-2xl z-20 flex flex-col items-center pt-2 transition-all duration-700"
                           :class="!activeLines ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'"
                           style="left: calc(183.3px - 24px); top: 250px;">
                           <div class="w-6 h-4 bg-white/40 rounded-full mb-1"></div>
                      </div>

                      <div v-if="currentLevelData.context === 'map'" class="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

                      <!-- The Triangle -->
                      <svg width="500" height="400" viewBox="0 0 500 400" class="absolute inset-0 z-30 drop-shadow-2xl">

                          <polygon points="100,50 50,350 400,350"
                                   :fill="currentLevelData.context === 'finger' ? '#b45309' : (currentLevelData.context === 'spider' ? 'rgba(0,0,0,0.05)' : (currentLevelData.context === 'map' ? '#4ade80' : '#94a3b8'))"
                                   :stroke="currentLevelData.context === 'finger' ? '#78350f' : (currentLevelData.context === 'spider' ? '#94a3b8' : (currentLevelData.context === 'map' ? '#166534' : '#64748b'))"
                                   :stroke-width="currentLevelData.context === 'spider' ? 2 : 6" stroke-linejoin="round" />

                          <!-- Villages on map context -->
                          <g v-if="currentLevelData.context === 'map'">
                              <circle cx="100" cy="50" r="15" fill="#ef4444" />
                              <circle cx="50" cy="350" r="15" fill="#ef4444" />
                              <circle cx="400" cy="350" r="15" fill="#ef4444" />
                          </g>

                          <!-- The Lines based on state -->
                          <g v-if="activeLines === 'zwaarte'" stroke="#facc15" stroke-width="3" stroke-dasharray="8 4" class="animate-fadeIn">
                              <line x1="100" y1="50" x2="225" y2="350" />
                              <line x1="50" y1="350" x2="250" y2="200" />
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
                              <circle cx="225" cy="210" r="8" fill="#10b981" />
                              <circle v-if="isCorrect && currentLevelData.targetLine === 'middel' && currentLevelData.context !== 'default'" cx="225" cy="210" r="185" fill="none" stroke="#10b981" stroke-width="4" stroke-dasharray="0" class="animate-fadeIn" />
                              <text v-if="isCorrect && currentLevelData.targetLine === 'middel' && currentLevelData.context === 'map'" x="225" y="215" text-anchor="middle" font-weight="900" font-size="24" fill="white">🚒</text>
                          </g>

                          <g v-if="activeLines === 'bissec'" stroke="#a855f7" stroke-width="3" stroke-dasharray="8 4" class="animate-fadeIn">
                              <line x1="100" y1="50" x2="190" y2="350" />
                              <line x1="50" y1="350" x2="350" y2="150" />
                              <circle cx="170" cy="245" r="8" fill="#a855f7" />
                              <circle v-if="isCorrect && currentLevelData.targetLine === 'bissec' && currentLevelData.context !== 'default'" cx="170" cy="245" r="105" fill="rgba(255,255,255,0.8)" stroke="#a855f7" stroke-width="4" stroke-dasharray="0" class="animate-fadeIn" />
                              <text v-if="isCorrect && currentLevelData.targetLine === 'bissec' && currentLevelData.context === 'spider'" x="170" y="255" text-anchor="middle" font-weight="900" font-size="40">🕷️</text>
                          </g>

                      </svg>
                  </div>

              </div>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
</style>
