<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhEye,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Misleidende Grafieken en Statistieken'
  },
  instruction: {
    type: String,
    default: 'Leer de trucs herkennen waarmee data misleidend wordt gepresenteerd.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhEye }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionChecked = ref(false)
const showPrediction = ref(true)
const predictedIsMisleading = ref(null)
const showData = ref(false)
const showWorkedExample = ref(true)

const currentInternalLevel = ref(0)
const totalInternalLevels = 6

const hintLevels = [
  'Let op de schaal van de assen, wat er wordt weggelaten, en hoe percentages worden vergeleken.',
  'Voorbeeld: Een grafiek van een stijging van 2% naar 3% lijkt spectaculair als de y-as van 0 tot 5 gaat in plaats van 0 tot 100.',
  'Vraag jezelf af: Wordt de data eerlijk weergegeven? Worden alle gegevens getoond? Kloppen de verhoudingen?'
]

const levels = [
  {
    id: 1,
    name: 'Y-as Manipulatie',
    context: 'Een bedrijf beweert dat de winst "explosief is gestegen" van EUR 100 naar EUR 110.',
    predictionPrompt: 'Is deze bewering misleidend als de grafiek een y-as van 100 tot 110 toont?',
    data: 'Jaar 1: EUR 100, Jaar 2: EUR 110\nToename = 10%',
    correctAnswer: true,
    whyExplanation: 'De bewering "explosief gestegen" is overdreven. 10% stijging is goed, maar "explosief" suggereert veel meer. Door de y-as te beperken tot 100-110 lijkt de stijging enorm. Een eerlijke grafiek begint bij 0 of vermeldt het percentage. Beginnende y-assen zijn niet altijd fout, maar worden vaak gebruikt om kleine veranderingen groter te laten lijken.',
    errorAnalysis: 'Een startpunt ≠ 0 is niet altijd misleidend, maar het kan wel een kleine verandering overdrijven. Kijk altijd naar de schaal.',
    workedExample: {
      scenario: 'Energierekening: EUR 200 in 2023, EUR 210 in 2024 (stijging van 5%).',
      misleading: 'Y-as van 200 tot 210 -> stijging lijkt 50% van de schaal.',
      honest: 'Y-as van 0 tot 250 -> stijging is maar 4% van de totale schaal.',
      lesson: 'Let altijd op waar de y-as begint!'
    }
  },
  {
    id: 2,
    name: 'Selectief Weglaten van Data',
    context: 'Een krant toont de temperatuur van 4 dagen in juli: dag 1 = 22 graden, dag 2 = 30 graden, dag 3 = 35 graden, dag 4 = 38 graden.',
    predictionPrompt: 'Zou deze grafiek misleidend kunnen zijn als de krant zegt "temperaturen deze week exploderen"?',
    data: 'Ma: 22 graden | Di: 30 graden | Wo: 35 graden | Do: 38 graden',
    correctAnswer: true,
    whyExplanation: 'De krant toont alleen de stijgende dagen! Ze hebben waarschijnlijk de koudere dagen (of het weekend met lagere temperaturen) weggelaten. Dit heet "cherry-picking": selectief data tonen die jouw verhaal ondersteunt. Een eerlijke grafiek toont alle meetmomenten.',
    errorAnalysis: 'Als de krant de temperatuur van een volledige week toont, kijk dan of er dagen ontbreken. Het weglaten van data is een veelgebruikte truc.',
    workedExample: {
      scenario: 'Een medicijnbedrijf zegt "90% van de patienten verbeterde in week 1."',
      misleading: 'Ze tonen alleen week 1, maar in week 2 zakte 40% terug.',
      lesson: 'Vraag altijd naar de volledige data, niet alleen het beste deel.'
    }
  },
  {
    id: 3,
    name: 'Vergelijkingsbasis Manipulatie',
    context: 'School A zegt "50% van onze leerlingen haalt een 8 of hoger!" School B zegt "70% van onze leerlingen haalt een voldoende!"',
    predictionPrompt: 'Kun je scholen A en B eerlijk vergelijken op basis van deze cijfers?',
    data: 'School A: 50% scoort ≥ 8/10\nSchool B: 70% scoort ≥ 5.5/10 (voldoende)',
    correctAnswer: true,
    whyExplanation: 'De scholen gebruiken een andere basis om te vergelijken! School A meet "8 of hoger", School B meet "voldoende (5.5)". Je kunt ze niet direct vergelijken. Dit heet "verschillende noemers" — een klassieke truc om de ene groep beter te laten lijken. Altijd checken: wordt hetzelfde gemeten?',
    errorAnalysis: 'Verschillende meeteenheden of normen maken vergelijkingen onmogelijk. Vraag altijd: "Wat wordt precies gemeten?"',
    workedExample: {
      lesson: 'Als de A-weg 95% van de reizigers veilig vervoert en de B-weg 99%, moet je weten of hetzelfde geteld wordt (doden? gewonden? ongevallen?).'
    }
  },
  {
    id: 4,
    name: 'Verschillende Steekproeven (Biased Samples)',
    context: 'Een enquete op een sportdag zegt: "90% van de jongeren vindt sporten belangrijk."',
    predictionPrompt: 'Is dit resultaat representatief voor alle jongeren?',
    data: 'Enquete afgenomen op een sportdag bij 200 sportieve jongeren.',
    correctAnswer: true,
    whyExplanation: 'De steekproef is biased (vertekend)! Als je een enquete afneemt op een sportdag, vraag je aan mensen die al sporten of ze sporten belangrijk vinden. Natuurlijk zeggen zij "ja". Een eerlijke enquete moet een representatieve groep bevragen, niet een groep die al een bepaalde mening heeft.',
    errorAnalysis: 'Altijd vragen: wie is er bevraagd? Is dat een eerlijke afspiegeling van de hele groep?',
    workedExample: {
      lesson: 'Een school zegt "onze leerlingen zijn zeer tevreden" — enquete afgenomen tijdens de les. Maar wat met leerlingen die spijbelen of thuis zijn?'
    }
  },
  {
    id: 5,
    name: 'Oppervlaktebedrog',
    context: 'Een infographic toont twee cirkels: Cirkel A stelt EUR 10.000 voor, cirkel B stelt EUR 20.000 voor (dubbel zoveel).',
    predictionPrompt: 'Als cirkel B een diameter heeft die dubbel zo groot is (de hoogte van B is het dubbele van A), is de visuele voorstelling dan correct?',
    data: 'Cirkel A: waarde = 10.000 (diameter = 2 cm)\nCirkel B: waarde = 20.000 (diameter = 4 cm)',
    correctAnswer: true,
    whyExplanation: 'Als de diameter verdubbelt, wordt de oppervlakte 4x zo groot! (A = pi x r^2). De lezer ziet de oppervlakte, niet de diameter. Een verdubbeling van de waarde mag alleen de hoogte verdubbelen, niet ook de breedte. Dit is een veelvoorkomende truc in infographics: de verhoudingen kloppen niet.',
    errorAnalysis: 'Bij 3D-grafieken en infographics: let op of alleen de hoogte verandert of ook de breedte/diepte.',
    workedExample: {
      scenario: 'Een munt van EUR 1 is 23mm, een munt van EUR 2 is 26mm (slechts 13% groter, maar waarde is dubbel).',
      lesson: 'Grootte is geen goede maat voor waarde in visuele voorstellingen.'
    }
  },
  {
    id: 6,
    name: 'Gemiddelde vs Mediaan',
    context: 'In een bedrijf verdienen 9 werknemers tussen EUR 2.000 en EUR 3.000 per maand. De CEO verdient EUR 50.000.',
    predictionPrompt: 'Het bedrijf zegt: "Het gemiddelde salaris is EUR 7.000." Is dit misleidend?',
    data: '9 werknemers: 2000, 2200, 2400, 2500, 2600, 2700, 2800, 2900, 3000\nCEO: 50.000\nGemiddelde = (23.300 + 50.000) / 10 = 7.330',
    correctAnswer: true,
    whyExplanation: 'Het gemiddelde (EUR 7.330) is misleidend omdat de CEO een uitschieter is. De mediaan (EUR 2.650) geeft een beter beeld van wat een "typische" werknemer verdient. Door het gemiddelde te gebruiken, lijkt het alsof werknemers veel verdienen, terwijl 9 van de 10 onder EUR 3.000 zitten.',
    errorAnalysis: 'Als een klein aantal extreme waarden het gemiddelde sterk beinvloedt, is de mediaan vaak een betere maat. Kijk altijd naar beide.',
    workedExample: {
      lesson: 'Vastgoedmakelaars gebruiken vaak het gemiddelde van huizenprijzen, terwijl de mediaan beter toont wat een normaal huis kost.'
    }
  }
]

const currentLevel = computed(() => levels[currentInternalLevel.value])

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  feedback.value = { type: 'info', text: '' }
  attemptCount.value = 0
  hintCount.value = 0
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionChecked.value = false
  showPrediction.value = true
  predictedIsMisleading.value = null
  showData.value = false
  showWorkedExample.value = true
}

function commitPrediction() {
  if (predictedIsMisleading.value === null) return
  showPrediction.value = false
  showData.value = true
  const pred = predictedIsMisleading.value ? 'Ja, misleidend' : 'Nee, niet misleidend'
  feedback.value = { type: 'info', text: `Jouw oordeel: ${pred}. Bekijk de data en controleer.` }
}

function selectAnswer(answer) {
  if (isCorrect.value || showPrediction.value) return
  attemptCount.value++
  
  if (answer === currentLevel.value.correctAnswer) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Correct! ${currentLevel.value.whyExplanation}`
    }
    showReflection.value = true
  } else {
    if (attemptCount.value < 3) {
      feedback.value = { type: 'error', text: currentLevel.value.errorAnalysis || 'Kijk nog eens goed naar de data. Wat probeert de afzender te verbergen?' }
    } else {
      feedback.value = { type: 'error', text: `Het antwoord is: Ja, dit is misleidend. ${currentLevel.value.whyExplanation.substring(0, 100)}...` }
    }
    hintCount.value++
  }
}

function checkReflection() {
  reflectionChecked.value = true
  if (reflectionAnswer.value.trim().length < 5) {
    feedback.value = { type: 'error', text: 'Probeer wat uitgebreider te antwoorden. Waarom zou iemand bewust een misleidende grafiek maken?' }
    reflectionChecked.value = false
    return
  }
  feedback.value = { type: 'success', text: 'Sterke reflectie! Kritisch naar data kijken is een belangrijke vaardigheid.' }
}

function handleNext() {
  if (showReflection.value && !reflectionChecked.value) {
    feedback.value = { type: 'error', text: 'Beantwoord eerst de reflectievraag.' }
    return
  }
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    isCorrect.value = false
    celebrationDone.value = false
    feedback.value = { type: 'info', text: '' }
    attemptCount.value = 0
    hintCount.value = 0
    showReflection.value = false
    reflectionAnswer.value = ''
    reflectionChecked.value = false
    showPrediction.value = true
    predictedIsMisleading.value = null
    showData.value = false
    showWorkedExample.value = true
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) {
      emit('update:currentStep', props.currentStep + 1)
    } else {
      emit('complete')
    }
  }
}

function showHint() {
  if (isCorrect.value || !currentLevel.value) return
  const idx = Math.min(hintCount.value, hintLevels.length - 1)
  hintCount.value++
  if (idx >= 0 && idx < hintLevels.length) {
    feedback.value = { type: 'info', text: hintLevels[idx] }
  }
}

function resetLevel() {
  isCorrect.value = false
  celebrationDone.value = false
  feedback.value = { type: 'info', text: '' }
  attemptCount.value = 0
  hintCount.value = 0
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionChecked.value = false
  showPrediction.value = true
  predictedIsMisleading.value = null
  showData.value = false
  nextTick(() => mainArea.value?.focus())
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
}

onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-slate-500">Tactiek {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
            <div class="flex gap-1">
              <div v-for="i in totalInternalLevels" :key="i"
                   class="w-2 h-2 rounded-full"
                   :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
            </div>
          </div>
        </div>
      </div>
      <button @click="emit('close')"
              class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98]">
        <PhX class="w-6 h-6" />
      </button>
    </header>

    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">{{ currentLevel.name }}</h3>

          <!-- Worked Example -->
          <div v-if="showWorkedExample && currentInternalLevel === 0" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p class="font-bold text-amber-800 text-sm mb-2">Voorbeeld: Y-as Manipulatie</p>
            <p class="text-xs text-amber-700 mb-1">Een energierekening steeg van EUR 200 naar EUR 210 (5% stijging).</p>
            <p class="text-xs text-amber-700"><strong>Misleidend:</strong> Y-as van 200 tot 210 -> stijging lijkt 50% van de schaal.</p>
            <p class="text-xs text-amber-700"><strong>Eerlijk:</strong> Y-as van 0 tot 250 -> stijging is maar 4% van de schaal.</p>
            <p class="text-xs text-amber-700 font-bold mt-1">Les: Let altijd op waar de y-as begint!</p>
          </div>

          <!-- Prediction Gate -->
          <div v-if="showPrediction" class="p-6 border border-amber-200 bg-amber-50 rounded-xl shadow-inner">
            <p class="font-bold text-amber-800 mb-3">Voorspel eerst!</p>
            <p class="text-sm text-amber-700 mb-4">{{ currentLevel.predictionPrompt }}</p>
            <div class="flex gap-2">
              <button @click="predictedIsMisleading = true"
                      class="flex-1 p-4 rounded-lg font-bold transition-all border-2"
                      :class="predictedIsMisleading === true ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'">
                Ja, misleidend
              </button>
              <button @click="predictedIsMisleading = false"
                      class="flex-1 p-4 rounded-lg font-bold transition-all border-2"
                      :class="predictedIsMisleading === false ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'">
                Nee, correct
              </button>
            </div>
            <button @click="commitPrediction"
                    :disabled="predictedIsMisleading === null"
                    class="mt-3 w-full py-3 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 disabled:opacity-50 active:scale-[0.98]">
              Bevestig Oordeel
            </button>
          </div>

          <!-- Data + Answer -->
          <div v-if="showData" class="space-y-4">
            <div class="bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <p class="font-bold text-slate-700 mb-2">Context:</p>
              <p class="text-sm text-slate-600 mb-3">{{ currentLevel.context }}</p>
              <div class="bg-white p-3 border border-slate-200 rounded-lg">
                <p class="font-mono text-sm whitespace-pre-line text-slate-700">{{ currentLevel.data }}</p>
              </div>
              <div class="mt-2 p-2 bg-amber-50 rounded-lg">
                <p class="text-xs text-amber-700">Jouw oordeel: <strong>{{ predictedIsMisleading ? 'Misleidend' : 'Correct' }}</strong></p>
              </div>
            </div>

            <div>
              <p class="font-bold text-slate-700 mb-2">Eindoordeel:</p>
              <div class="flex gap-2">
                <button @click="selectAnswer(true)"
                        :disabled="isCorrect"
                        class="flex-1 p-4 border-2 rounded-lg font-bold transition-all active:scale-[0.98]"
                        :class="isCorrect && currentLevel.correctAnswer === true ? 'border-amber-500 bg-amber-100 text-amber-800' : (!isCorrect ? 'border-slate-200 hover:border-slate-300 bg-white text-slate-700' : 'border-slate-200 bg-slate-50 text-slate-400')">
                  Misleidend
                </button>
                <button @click="selectAnswer(false)"
                        :disabled="isCorrect"
                        class="flex-1 p-4 border-2 rounded-lg font-bold transition-all active:scale-[0.98]"
                        :class="isCorrect && currentLevel.correctAnswer === false ? 'border-amber-500 bg-amber-100 text-amber-800' : (!isCorrect ? 'border-slate-200 hover:border-slate-300 bg-white text-slate-700' : 'border-slate-200 bg-slate-50 text-slate-400')">
                  Eerlijk
                </button>
              </div>
            </div>

            <!-- Why Explanation -->
            <div v-if="isCorrect" class="p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fadeIn">
              <p class="font-bold text-amber-800 text-sm mb-1">Waarom?</p>
              <p class="text-sm text-amber-700">{{ currentLevel.whyExplanation }}</p>
            </div>

            <!-- Reflection -->
            <div v-if="showReflection" class="p-4 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
              <p class="font-bold text-slate-700 mb-2">Reflecteer:</p>
              <p class="text-sm text-slate-600 mb-3">Waarom zou iemand bewust een misleidende grafiek of statistiek maken? Geef een voorbeeld.</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionChecked"
                        class="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:border-amber-500 outline-none resize-none"
                        rows="2" placeholder="Typ je antwoord..."></textarea>
              <button v-if="!reflectionChecked" @click="checkReflection"
                      class="mt-2 w-full py-2 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 active:scale-[0.98]">
                Bevestig Reflectie
              </button>
            </div>
          </div>
        </div>

        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text"
               class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
               role="status" aria-live="polite" aria-atomic="true"
               :class="{
                 'bg-amber-100 text-amber-800': feedback.type === 'success',
                 'bg-red-100 text-red-800': feedback.type === 'error',
                 'bg-slate-100 text-slate-800': feedback.type === 'info',
               }">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span class="leading-relaxed">{{ feedback.text }}</span>
          </div>

          <div class="flex items-center gap-4">
            <button @click="resetLevel" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98]">
              <PhArrowClockwise />
            </button>

            <button v-if="!isCorrect && showData"
                    @click="showHint"
                    class="px-4 py-4 text-sm font-bold text-slate-600 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-100 active:scale-[0.98]">
              Hint nodig?
            </button>

            <button v-if="isCorrect" @click="handleNext"
                    class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgende Tactiek' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto">
          <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">
            <div class="text-center">
              <div class="text-6xl font-bold text-slate-300 mb-4">?</div>
              <p class="text-lg font-bold text-slate-400 mb-2">Misleidende Data</p>
              <p class="text-sm text-slate-400">Tactiek {{ currentInternalLevel + 1 }}: {{ currentLevel.name }}</p>
              <div class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-md text-left">
                <p class="text-sm font-bold text-amber-800 mb-1">Tip om te onthouden:</p>
                <p class="text-xs text-amber-700">{{ currentLevel.correctAnswer
                  ? 'Dit is misleidend. Vertrouw niet blindelings op grafieken en cijfers.'
                  : 'Dit is eerlijk weergegeven. Maar blijf altijd kritisch!' }}</p>
              </div>
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
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
