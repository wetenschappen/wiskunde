<script setup>
/**
 * CircuitsActivity.vue
 * Educational activity for analyzing series, parallel, and mixed DC circuits.
 * Contextualized for educational goal III-NatS-d K1.
 */
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhLightning,
  PhArrowClockwise,
  PhCaretLeft,
  PhCaretRight
} from '@phosphor-icons/vue'

// --- Props & Emits ---
const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Elektrische Schakelingen'
  },
  instruction: {
    type: String,
    default: 'Analyseer de schakelingen en bereken de gevraagde waarden. Rond af op twee decimalen.'
  },
  currentStep: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhLightning }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

// --- UI STATE ---
const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const userInput = ref({})
const fieldValidation = ref({})
const currentDirection = ref('conventional') // 'conventional' | 'electron'
const currentVoltage = ref(12) // For animated speed toggle in step 1

// Internal Step State to fix 'Volgende' bug
const localStep = ref(props.currentStep || 1)

// --- CONTEXTUAL DOMAIN LOGIC ---
const circuits = ref([
  {
    title: 'Lichaamsweerstand',
    type: 'Experiment',
    description: 'Wat is het gevaar van elektriciteit? Bereken de stroom (I) die door een menselijk lichaam (R = 2000 Ω) vloeit bij aanraking van een 12V accu versus de netspanning (230V). Vanaf 30 mA is er levensgevaar!',
    V: '12 / 230',
    resistors: [
      { id: 'R1', value: 2000, label: 'Lichaam', broken: false }
    ],
    questions: ['I_12V_mA', 'I_230V_mA'],
    solutions: {
      I_12V_mA: 6,
      I_230V_mA: 115
    },
    hint: 'De wet van Ohm (I = U / R) dicteert dat bij een gelijke weerstand een hogere spanning leidt tot een grotere stroom. Daarom is 230V in huis veel gevaarlijker dan een 12V batterij.'
  },
  {
    title: 'Kerstverlichting',
    type: 'Serie',
    description: 'Oude kerstverlichting stond vaak in serie. Verbreek de verbinding in één van de lampjes (klik op een lamp in het diagram) en kijk wat er gebeurt. Bereken de stroom in de intacte schakeling.',
    V: 230,
    resistors: [
      { id: 'R1', value: 1150, label: 'Lamp 1', broken: false },
      { id: 'R2', value: 1150, label: 'Lamp 2', broken: false }
    ],
    questions: ['Rt', 'I'],
    solutions: {
      Rt: 2300,
      I: 0.10
    },
    hint: 'In serie is de stroom (I) overal gelijk en is er maar één pad. Als dit pad ergens wordt onderbroken, stopt de stroom overal. De hele kerstboom wordt donker!'
  },
  {
    title: 'Huisinstallatie',
    type: 'Parallel',
    description: 'In huis staan apparaten parallel. Verbreek één verbinding. Wat gebeurt er met het andere apparaat? Bereken de equivalente weerstand (Rt) en totale stroom in intacte staat.',
    V: 230,
    resistors: [
      { id: 'R1', value: 2300, label: 'Lamp 1', broken: false },
      { id: 'R2', value: 2300, label: 'Lamp 2', broken: false }
    ],
    questions: ['Rt', 'I_totaal'],
    solutions: {
      Rt: 1150,
      I_totaal: 0.20
    },
    hint: 'Dit is de kracht van een parallelschakeling (III-NatS-d K1): elk apparaat heeft zijn eigen circuit en krijgt de volle 230V. Een kapotte lamp beïnvloedt de andere apparaten niet!'
  },
  {
    title: 'Serie (3 Lampen)',
    type: 'Serie',
    description: 'Een serieschakeling met drie identieke lampen. Bereken de vervangingsweerstand en de totale stroom. Wat gebeurt er als je één lamp loskoppelt?',
    V: 230,
    resistors: [
      { id: 'R1', value: 100, label: 'Lamp 1', broken: false },
      { id: 'R2', value: 100, label: 'Lamp 2', broken: false },
      { id: 'R3', value: 100, label: 'Lamp 3', broken: false }
    ],
    questions: ['Rt', 'I'],
    solutions: {
      Rt: 300,
      I: 0.77
    },
    hint: 'In een serieschakeling tel je de weerstanden bij elkaar op. De stroom is overal gelijk, dus als het pad onderbroken wordt, gaat alles uit.'
  },
  {
    title: 'Parallel (3 Lampen)',
    type: 'Parallel',
    description: 'Een parallelschakeling met drie identieke lampen. De spanning is overal gelijk. Wat gebeurt er met de totale stroom?',
    V: 230,
    resistors: [
      { id: 'R1', value: 1150, label: 'Lamp 1', broken: false },
      { id: 'R2', value: 1150, label: 'Lamp 2', broken: false },
      { id: 'R3', value: 1150, label: 'Lamp 3', broken: false }
    ],
    questions: ['Rt', 'I_totaal'],
    solutions: {
      Rt: 383.33,
      I_totaal: 0.60
    },
    hint: 'Bij elke extra parallelle tak neemt de totale weerstand af, waardoor de totale stroom van de bron toeneemt. De spanning over elke lamp blijft echter 230V.'
  },
  {
    title: 'Gemengde Schakeling',
    type: 'Gemengd',
    description: 'Een gemengde schakeling met R1 in serie en een parallelle vertakking (R2 en R3). Analyseer de stroom en spanning.',
    V: 230,
    resistors: [
      { id: 'R1', value: 100, label: 'Lamp 1', broken: false },
      { id: 'R2', value: 200, label: 'Lamp 2', broken: false },
      { id: 'R3', value: 200, label: 'Lamp 3', broken: false }
    ],
    questions: ['Rt', 'I_totaal'],
    solutions: {
      Rt: 200,
      I_totaal: 1.15
    },
    hint: 'Los eerst de parallelle vertakking op om de vervangingsweerstand daarvan te vinden. Tel deze vervolgens op bij de serieweerstand om de totale weerstand te krijgen.'
  }
])

const totalStepsLocal = computed(() => circuits.value.length)
const currentCircuit = computed(() => circuits.value[localStep.value - 1])

// --- PHYSICS SIMULATION COMPUTED PROPERTIES ---

const isDangerousCurrent = computed(() => {
    // In Exp1, R=2000 Ohm. Danger at I > 30mA (0.03A).
    // V_danger = I_danger * R = 0.030 * 2000 = 60V.
    // So 230V is dangerous, 12V is not.
    return localStep.value === 1 && currentVoltage.value > 60;
});

const animationClass = computed(() => {
  return currentDirection.value === 'conventional'
    ? 'current-flow-conventional'
    : 'current-flow-electron';
});

const animationStyle = computed(() => {
  const color = currentDirection.value === 'conventional' ? '#f59e0b' : '#3b82f6';
  
  let mainDuration = 1.5;
  let branch1Duration = 1.5;
  let branch2Duration = 1.5;
  let branch3Duration = 1.5;

  if (localStep.value === 1) {
    mainDuration = Math.max(0.3, 2.5 - currentVoltage.value / 100);
    branch1Duration = mainDuration;
    branch2Duration = mainDuration;
  } else if (localStep.value === 3) {
    const lamp1on = !currentCircuit.value.resistors[0].broken;
    const lamp2on = !currentCircuit.value.resistors[1].broken;
    const constantDuration = 1.5; // Base duration for the main path

    mainDuration = constantDuration;
    branch1Duration = lamp2on ? constantDuration * 2 : constantDuration;
    branch2Duration = lamp1on ? constantDuration * 2 : constantDuration;
  } else if (localStep.value === 5) {
    const lampsOn = [
        !currentCircuit.value.resistors[0].broken,
        !currentCircuit.value.resistors[1].broken,
        !currentCircuit.value.resistors[2].broken
    ];
    const onCount = lampsOn.filter(Boolean).length;
    const constantDuration = 1.5;

    mainDuration = constantDuration;

    if (onCount > 1) {
        branch1Duration = lampsOn[0] ? constantDuration * onCount : 0;
        branch2Duration = lampsOn[1] ? constantDuration * onCount : 0;
        branch3Duration = lampsOn[2] ? constantDuration * onCount : 0;
    } else {
        branch1Duration = constantDuration;
        branch2Duration = constantDuration;
        branch3Duration = constantDuration;
    }
  } else if (localStep.value === 6) {
    const lamp1on = !currentCircuit.value.resistors[0].broken;
    const lamp2on = !currentCircuit.value.resistors[1].broken;
    const lamp3on = !currentCircuit.value.resistors[2].broken;
    const constantDuration = 1.5;

    mainDuration = constantDuration;

    if (!lamp1on) {
      // No flow if the main series resistor is broken
    } else {
      // If both parallel branches are on, current splits
      if (lamp2on && lamp3on) { 
        branch1Duration = constantDuration * 2;
        branch2Duration = constantDuration * 2;
      } else { // Otherwise, it's a simple series circuit for whichever branch is on
        branch1Duration = constantDuration;
        branch2Duration = constantDuration;
      }
    }
    branch3Duration = 0; // Not used in this circuit
  }

  return {
    '--main-duration': `${mainDuration}s`,
    '--branch1-duration': `${branch1Duration}s`,
    '--branch2-duration': `${branch2Duration}s`,
    '--branch3-duration': `${branch3Duration}s`,
    '--flow-color': color
  };
});

const getLampBrightness = (index) => {
  if (!currentCircuit.value) return { opacity: 0 };
  
  if (localStep.value === 2 || localStep.value === 4) { // Series
    const isBroken = currentCircuit.value.resistors.some(r => r.broken);
    const opacity = isBroken ? 0 : 0.4;
    const scale = isBroken ? 1 : 1.1;
    return { opacity, transform: `scale(${scale})` };
  }
  
  if (localStep.value === 3 || localStep.value === 5) { // Parallel
    if (currentCircuit.value.resistors[index].broken) {
      return { opacity: 0, transform: 'scale(1)' };
    }
    // In a parallel circuit, brightness is independent of other lamps
    return { opacity: 0.7, transform: 'scale(1.2)' };
  } else if (localStep.value === 6) { // Mixed
    const isSeriesBroken = currentCircuit.value.resistors[0].broken;
    if (isSeriesBroken) return { opacity: 0, transform: 'scale(1)' };

    // For the series lamp itself
    if (index === 0) {
        const anyParallelOn = !currentCircuit.value.resistors[1].broken || !currentCircuit.value.resistors[2].broken;
        return anyParallelOn ? { opacity: 0.7, transform: 'scale(1.2)' } : { opacity: 0, transform: 'scale(1)' };
    }
    
    // For parallel lamps
    if (currentCircuit.value.resistors[index].broken) {
        return { opacity: 0, transform: 'scale(1)' };
    }
    return { opacity: 0.5, transform: 'scale(1.1)' };
  }

  return { opacity: 0 }; // Default off
};


function toggleBreak(index) {
  if (currentCircuit.value && currentCircuit.value.resistors[index]) {
    currentCircuit.value.resistors[index].broken = !currentCircuit.value.resistors[index].broken;
  }
}

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  fieldValidation.value = {};
  const initialInput = {}
  if (currentCircuit.value) {
    currentCircuit.value.questions.forEach(q => initialInput[q] = '')
    userInput.value = initialInput
    currentCircuit.value.resistors.forEach(r => r.broken = false)
  }
}

function checkAnswer() {
  isChecked.value = true;
  const tolerance = 0.02; // 2% tolerance
  const validation = {};

  currentCircuit.value.questions.forEach(key => {
    const userValue = parseFloat(String(userInput.value[key] || '').replace(',', '.'));
    const correctValue = currentCircuit.value.solutions[key];
    if (!isNaN(userValue) && Math.abs(userValue - correctValue) <= correctValue * tolerance) {
      validation[key] = 'correct';
    } else {
      validation[key] = 'incorrect';
    }
  });

  fieldValidation.value = validation;

  const allCorrect = Object.values(validation).every(status => status === 'correct');

  if (allCorrect) {
    isCorrect.value = true;
    feedback.value = { 
      type: 'success', 
      text: 'Uitstekend! De waarden zijn correct. Ga door naar de volgende stap.' 
    };
  } else {
    isCorrect.value = false;
    feedback.value = { 
      type: 'error', 
      text: 'Eén of meer waarden zijn onjuist of ontbreken. Controleer je berekeningen en probeer het opnieuw.'
    };
  }
}

function goToNextStep() {
  if (localStep.value < totalStepsLocal.value) {
    localStep.value++;
    emit('update:currentStep', localStep.value);
  } else {
    emit('complete');
  }
}

function navigateStep(direction) {
  let next = localStep.value + direction;
  if (next > totalStepsLocal.value) {
    next = 1;
  }
  if (next < 1) {
    next = totalStepsLocal.value;
  }
  localStep.value = next;
  emit('update:currentStep', localStep.value);
}

// --- Lifecycle & Events ---
watch(() => props.currentStep, (newVal) => {
  if (newVal) localStep.value = newVal;
}, { immediate: true })

watch(localStep, (newStep) => {
  resetActivityState();
  if (newStep === 1) {
    currentVoltage.value = 12; // Start op 12V bij Experiment 1
  } else {
    currentVoltage.value = 230; // Vaste spanning voor andere experimenten
  }
}, { immediate: true })

watch(() => props.isOpen, (val) => {
  if (val) {
    // Reset activity state when opening
    localStep.value = props.currentStep || 1;
    resetActivityState();
    
    // Set up fullscreen and keyboard listeners
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) {
      nextTick(() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => console.error("Fullscreen request failed:", e))
        }
      })
    }
    
    // Hint to the user how to close
    nextTick(() => {
        shouldPulse.value = true
        setTimeout(() => { shouldPulse.value = false }, 3000)
    })
  } else {
    // Cleanup when closing
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

const handleFullscreenChange = () => {
  // Auto-close if the user exits fullscreen manually
  if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  // Ensure fullscreen is exited on component unmount
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(e => {})
  }
})

const getLabel = (q) => {
  const labels = {
    I_12V_mA: 'Stroom bij 12V in mA (I<sub>12V</sub>)',
    I_230V_mA: 'Stroom bij 230V in mA (I<sub>230V</sub>)',
    Rt: 'Vervangingsweerstand (R<sub>t</sub>) in Ω',
    I: 'Totale stroom (I) in A',
    I_totaal: 'Totale stroom (I<sub>tot</sub>) in A',
  }
  return labels[q] || q;
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-0">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="emit('close')"></div>
    
    <div v-if="currentCircuit" class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white rounded-none">
      
      <!-- Header -->
      <header class="flex items-center justify-between px-6 py-5 bg-indigo-600 shrink-0 shadow-md z-20">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2.5 rounded-xl bg-white/20 text-white shadow-sm backdrop-blur-md">
            <component :is="props.icon" weight="fill" class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white m-0 leading-tight flex items-center gap-2">
              {{ title }} <span class="text-indigo-300 font-normal">|</span> <span class="font-medium text-white/90">{{ currentCircuit.title }}</span>
            </h2>
            <p v-if="totalStepsLocal > 1" class="text-xs font-bold text-indigo-200 uppercase tracking-widest m-0 mt-0.5 flex items-center gap-2">
              <button @click="navigateStep(-1)" class="p-1 rounded-md transition-colors hover:bg-white/20 text-indigo-300 hover:text-white"><PhCaretLeft weight="bold"/></button>
              Experiment {{ localStep }} van {{ totalStepsLocal }}
              <button @click="navigateStep(1)" class="p-1 rounded-md transition-colors hover:bg-white/20 text-indigo-300 hover:text-white"><PhCaretRight weight="bold"/></button>
            </p>
          </div>
        </div>
        <button @click="emit('close')" 
                class="relative p-2.5 text-white/70 transition-all rounded-full hover:bg-white/10 hover:text-white group"
                :class="{ 'ring-pulse-white': shouldPulse }">
          <PhX class="w-6 h-6 group-hover:scale-110 transition-transform" weight="bold" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <!-- Sidebar -->
        <div class="flex-col hidden w-full max-w-[420px] bg-slate-50 border-r border-slate-200 shadow-[2px_0_15px_-3px_rgba(0,0,0,0.05)] md:flex z-10 flex-shrink-0 relative">
          <div class="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            
            <!-- Situatie -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 transition-all hover:shadow-md">
              <h3 class="mb-3 text-xs font-black tracking-widest text-indigo-500 uppercase flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Situatie
              </h3>
              <p class="mb-4 text-sm font-medium italic text-slate-500 border-l-4 border-indigo-200 pl-3 py-1 bg-indigo-50/30 rounded-r-lg" v-html="instruction"></p>
              <div class="text-sm font-medium text-slate-700 leading-relaxed">{{ currentCircuit.description }}</div>
            </div>
            
            <!-- Gegevens -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 transition-all hover:shadow-md">
              <h3 class="mb-4 text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Gegevens
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:border-amber-200">
                  <span class="text-sm font-bold text-slate-600">Spanningsbron</span>
                  <span class="font-black text-amber-600 text-lg bg-amber-100 px-3 py-1 rounded-lg">{{ currentCircuit.V }} V</span>
                </div>
                <div v-for="(r, index) in currentCircuit.resistors" :key="index" 
                     class="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:border-slate-300">
                  <span class="text-sm font-bold text-slate-600">{{ r.label }} <span class="text-slate-400 text-xs ml-1">(R{{ index + 1 }})</span></span>
                  <span class="font-black text-slate-800 text-lg bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{{ r.value }} Ω</span>
                </div>
              </div>
            </div>

            <!-- Wetenschappelijke Wenk -->
            <div v-if="currentCircuit.hint" class="mb-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-sm relative overflow-hidden group">
              <div class="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
                <PhLightning weight="fill" class="w-32 h-32 text-amber-600" />
              </div>
              <div class="relative z-10">
                <div class="flex items-center gap-2 mb-3">
                  <div class="bg-amber-100 p-1.5 rounded-lg">
                    <PhLightning class="text-amber-600 w-4 h-4" weight="bold" />
                  </div>
                  <h4 class="text-xs font-black tracking-widest text-amber-800 uppercase">Wetenschappelijke Wenk</h4>
                </div>
                <p class="text-sm text-amber-900 leading-relaxed font-medium">{{ currentCircuit.hint }}</p>
              </div>
            </div>

            <!-- Bereken -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-2">
              <h3 class="mb-4 text-xs font-black tracking-widest text-indigo-500 uppercase flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Bereken
              </h3>
              <div class="space-y-4">
                <div v-for="q in currentCircuit.questions" :key="q" class="relative">
                  <label :for="q" class="block text-sm font-bold text-slate-700 mb-2" v-html="getLabel(q)"></label>
                  <input type="text" :id="q" v-model="userInput[q]"
                         @keydown.enter="checkAnswer"
                         class="block w-full px-4 py-3 border-2 rounded-xl outline-none focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all font-bold placeholder:font-normal placeholder:text-slate-400"
                         :class="{
                           'bg-slate-50 border-slate-200 text-slate-800': !fieldValidation[q],
                           'border-emerald-500 bg-emerald-50 text-emerald-900': fieldValidation[q] === 'correct',
                           'border-rose-500 bg-rose-50 text-rose-900': fieldValidation[q] === 'incorrect'
                         }"
                         placeholder="Typ je antwoord...">
                </div>
              </div>
            </div>
          </div>

          <!-- Controls Footer -->
          <div class="p-6 bg-white border-t border-slate-200 shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] relative z-20">
            <div v-if="feedback.text" 
                 class="flex items-start gap-3 p-4 mb-5 text-sm font-medium rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm border"
                 :class="{
                   'bg-emerald-50 text-emerald-800 border-emerald-200': feedback.type === 'success',
                   'bg-rose-50 text-rose-800 border-rose-200': feedback.type === 'error',
                   'bg-slate-50 text-slate-800 border-slate-200': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed" v-html="feedback.text"></span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" title="Reset" 
                      class="p-3.5 text-lg font-bold transition-all rounded-xl text-slate-500 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 shadow-sm group">
                 <PhArrowClockwise class="group-hover:-rotate-90 transition-transform duration-300" weight="bold" />
              </button>
              
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect" 
                      class="flex-1 py-3.5 px-6 font-black text-white transition-all rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/30 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.98]">
                Controleer
              </button>
              
              <button v-else @click="goToNextStep" 
                      class="flex items-center justify-center flex-1 gap-2 py-3.5 px-6 font-black text-white transition-all rounded-xl shadow-lg bg-emerald-500 hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.98] group">
                <span>{{ localStep < totalStepsLocal ? 'Volgende Experiment' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" class="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <!-- Main Workspace -->
        <div class="flex flex-col flex-1 overflow-hidden relative bg-slate-100">
          <div class="absolute inset-0 pattern-grid opacity-60 pointer-events-none"></div>
          
          <div class="flex flex-col items-center justify-center flex-1 p-8 overflow-y-auto z-10">
             
             <!-- Werkruimte Controls -->
             <div class="flex flex-wrap items-center justify-center gap-4 mb-8 z-20 relative">
                 
                 <!-- Stroomrichting Toggle -->
                 <div class="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex items-center">
                    <button @click="currentDirection = 'conventional'"
                            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                            :class="currentDirection === 'conventional' ? 'bg-amber-100 text-amber-700 shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
                       <div class="w-2.5 h-2.5 rounded-full transition-colors" :class="currentDirection === 'conventional' ? 'bg-amber-500' : 'bg-slate-300'"></div>
                       Conventioneel <span class="hidden sm:inline">(+ naar -)</span>
                    </button>
                    <button @click="currentDirection = 'electron'"
                            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                            :class="currentDirection === 'electron' ? 'bg-sky-100 text-sky-700 shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
                       <div class="w-2.5 h-2.5 rounded-full transition-colors" :class="currentDirection === 'electron' ? 'bg-sky-500' : 'bg-slate-300'"></div>
                       Elektronen <span class="hidden sm:inline">(- naar +)</span>
                    </button>
                 </div>

                 <!-- Spanning Toggle (Alleen in Experiment 1 om snelheid te ervaren) -->
                 <div v-if="localStep === 1" class="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex items-center">
                    <button @click="currentVoltage = 12"
                            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                            :class="currentVoltage === 12 ? 'bg-indigo-100 text-indigo-700 shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
                       <PhLightning weight="fill" :class="currentVoltage === 12 ? 'text-indigo-500' : 'text-slate-400'" />
                       12V
                    </button>
                    <button @click="currentVoltage = 230"
                            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                            :class="currentVoltage === 230 ? 'bg-rose-100 text-rose-700 shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
                       <PhLightning weight="fill" :class="currentVoltage === 230 ? 'text-rose-500' : 'text-slate-400'" />
                       230V
                    </button>
                 </div>

             </div>

             <!-- Diagram Container -->
             <div class="bg-white p-10 rounded-3xl shadow-2xl border-4 border-slate-200 min-h-[450px] w-full max-w-3xl flex items-center justify-center relative transition-all hover:border-indigo-100 hover:shadow-indigo-500/10">
                <svg viewBox="0 0 400 220" class="w-full h-full circuit-svg overflow-visible">
                    <defs>
                        <g id="resistor-symbol" class="circuit-component transition-all">
                            <rect x="0" y="-12" width="50" height="24" stroke-width="2.5" fill="white" class="drop-shadow-sm"/>
                        </g>
                        <g id="resistor-broken" class="circuit-component transition-all">
                            <rect x="0" y="-12" width="50" height="24" stroke-width="2.5" fill="#fef2f2" stroke="#ef4444" class="drop-shadow-sm"/>
                            <line x1="14" y1="-14" x2="36" y2="14" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
                            <line x1="36" y1="-14" x2="14" y2="14" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
                        </g>
                        <g id="battery-symbol" class="circuit-component">
                            <line x1="-15" y1="-5" x2="15" y2="-5" stroke-width="2.5" stroke-linecap="round"/>
                            <line x1="-8" y1="5" x2="8" y2="5" stroke-width="4.5" stroke-linecap="round"/>
                        </g>
                        <!-- Lamp symbol - glowing bulb -->
                        <g id="lamp-on">
                            <circle cx="0" cy="0" r="14" fill="#fef3c7" stroke="#f59e0b" stroke-width="2.5" class="lamp-glow"/>
                            <circle cx="0" cy="0" r="14" fill="url(#lamp-gradient)" stroke="#f59e0b" stroke-width="2.5"/>
                            <!-- Filament cross -->
                            <line x1="-6" y1="-6" x2="6" y2="6" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
                            <line x1="6" y1="-6" x2="-6" y2="6" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
                        </g>
                        <g id="lamp-off">
                            <circle cx="0" cy="0" r="14" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2.5"/>
                            <!-- Broken filament -->
                            <line x1="-6" y1="-6" x2="-1" y2="-1" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
                            <line x1="6" y1="6" x2="1" y2="1" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
                            <line x1="6" y1="-6" x2="1" y2="-1" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
                            <line x1="-6" y1="6" x2="-1" y2="1" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
                        </g>
                        <!-- Gradient for lamp glow effect -->
                        <radialGradient id="lamp-gradient" cx="30%" cy="30%">
                            <stop offset="0%" stop-color="#fef9c3"/>
                            <stop offset="50%" stop-color="#fde047"/>
                            <stop offset="100%" stop-color="#fbbf24"/>
                        </radialGradient>
                        <!-- Filter for lamp glow -->
                        <filter id="lamp-blur" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="3"/>
                        </filter>
                        
                        <symbol id="arrow-circle-clockwise" viewBox="-20 -20 40 40">
                          <path d="M 0 -15 A 15 15 0 1 1 -10.6 -10.6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                          <path d="M -15.6 -10.6 L -10.6 -10.6 L -10.6 -15.6" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none" stroke-width="3"/>
                        </symbol>
                        <symbol id="arrow-circle-counter-clockwise" viewBox="-20 -20 40 40">
                            <path d="M 0 15 A 15 15 0 1 1 10.6 -10.6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                            <path d="M 15.6 -10.6 L 10.6 -10.6 L 10.6 -15.6" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none" stroke-width="3"/>
                        </symbol>
                    </defs>

                    <!-- Step 1: Lichaamsweerstand (Enkelvoudig) -->
                    <g v-if="localStep === 1" class="animate-fadeIn">
                        <!-- Animated current flow -->
                        <path v-if="!currentCircuit.resistors[0].broken"
                              class="current-flow"
                              :class="animationClass"
                              :style="animationStyle"
                              d="M 60 105 V 50 H 200" />
                        <path v-if="!currentCircuit.resistors[0].broken"
                              class="current-flow"
                              :class="animationClass"
                              :style="animationStyle"
                              d="M 250 50 H 340 V 170 H 60 V 115" />

                        <!-- Wire tube (background - the physical wire) -->
                        <path class="wire-tube" 
                              :class="{ 'wire-tube-active': !currentCircuit.resistors[0].broken }"
                              d="M 60 105 V 50 H 200 M 250 50 H 340 V 170 H 60 V 115"/>
                        
                        <g transform="translate(60, 110)">
                            <use href="#battery-symbol" />
                            <text x="-5" y="-12" text-anchor="end" class="circuit-label-small">+</text>
                            <text x="-5" y="18" text-anchor="end" class="circuit-label-small">-</text>
                            <text x="-35" y="0" text-anchor="end" dominant-baseline="middle" class="circuit-label-large">{{ currentVoltage }}V</text>
                        </g>

                        <g transform="translate(200, 50)" @click="toggleBreak(0)" class="clickable-component group">
                            <rect x="-10" y="-20" width="70" height="40" fill="transparent" class="cursor-pointer"/>
                            <use :href="currentCircuit.resistors[0].broken ? '#resistor-broken' : '#resistor-symbol'"/>
                             <g v-if="isDangerousCurrent" class="danger-overlay">
                                <rect x="0" y="-12" width="50" height="24" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="2"/>
                                <text x="25" y="32" text-anchor="middle" class="danger-label">GEVAAR!</text>
                            </g>
                            <text x="25" y="-18" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[0].label }}</text>
                        </g>
                    </g>

                    <!-- Step 2: Kerstverlichting (Serie) -->
                    <g v-if="localStep === 2" class="animate-fadeIn">
                        <!-- Animated current flow -->
                        <path v-if="!currentCircuit.resistors.some(r => r.broken)"
                              class="current-flow"
                              :class="animationClass"
                              :style="animationStyle"
                              d="M 60 105 V 50 H 151" />
                        <path v-if="!currentCircuit.resistors.some(r => r.broken)"
                              class="current-flow"
                              :class="animationClass"
                              :style="animationStyle"
                              d="M 179 50 H 251" />
                        <path v-if="!currentCircuit.resistors.some(r => r.broken)"
                              class="current-flow"
                              :class="animationClass"
                              :style="animationStyle"
                              d="M 279 50 H 340 V 170 H 60 V 115" />
                        
                        <!-- Wire tube (background - the physical wire) -->
                        <path class="wire-tube" 
                              :class="{ 'wire-tube-active': !currentCircuit.resistors.some(r => r.broken) }"
                              d="M 60 105 V 50 H 151 M 179 50 H 251 M 279 50 H 340 V 170 H 60 V 115"/>
                        
                        <g transform="translate(60, 110)">
                            <use href="#battery-symbol" />
                            <text x="-5" y="-12" text-anchor="end" class="circuit-label-small">+</text>
                            <text x="-5" y="18" text-anchor="end" class="circuit-label-small">-</text>
                            <text x="-35" y="0" text-anchor="end" dominant-baseline="middle" class="circuit-label-large">{{ currentCircuit.V }}V</text>
                        </g>
                        
                        <g transform="translate(165, 50)" @click="toggleBreak(0)" class="clickable-component group">
                            <rect x="-25" y="-25" width="50" height="50" fill="transparent"/>
                            <circle v-if="!currentCircuit.resistors.some(r => r.broken)" cx="0" cy="0" r="20" fill="#fde047" class="lamp-pulse" :style="getLampBrightness(0)"/>
                            <use :href="currentCircuit.resistors.some(r => r.broken) ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[0].label }}</text>
                            <text x="0" y="42" text-anchor="middle" class="circuit-label-large" fill="#4f46e5">{{ currentCircuit.resistors[0].broken ? '230V' : (currentCircuit.resistors[1].broken ? '0V' : '115V') }}</text>
                        </g>

                        <g transform="translate(265, 50)" @click="toggleBreak(1)" class="clickable-component group">
                             <rect x="-25" y="-25" width="50" height="50" fill="transparent"/>
                            <circle v-if="!currentCircuit.resistors.some(r => r.broken)" cx="0" cy="0" r="20" fill="#fde047" class="lamp-pulse" :style="getLampBrightness(1)"/>
                            <use :href="currentCircuit.resistors.some(r => r.broken) ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[1].label }}</text>
                            <text x="0" y="42" text-anchor="middle" class="circuit-label-large" fill="#4f46e5">{{ currentCircuit.resistors[1].broken ? '230V' : (currentCircuit.resistors[0].broken ? '0V' : '115V') }}</text>
                        </g>
                    </g>

                    <!-- Step 3: Huisinstallatie (Parallel) -->
                    <g v-if="localStep === 3" class="animate-fadeIn">
                        <!-- Animated current flows -->
                        <!-- Main loop -->
                        <path v-if="!currentCircuit.resistors[0].broken || !currentCircuit.resistors[1].broken" class="current-flow main-flow" :class="animationClass" :style="animationStyle" d="M 80 95 V 50 H 200" />
                        <path v-if="!currentCircuit.resistors[0].broken || !currentCircuit.resistors[1].broken" class="current-flow main-flow" :class="animationClass" :style="animationStyle" d="M 200 170 H 80 V 125" />
                        <!-- Lamp 1 branch -->
                        <path v-if="!currentCircuit.resistors[0].broken" class="current-flow branch1-flow" :class="animationClass" :style="animationStyle" d="M 200 50 V 96" />
                        <path v-if="!currentCircuit.resistors[0].broken" class="current-flow branch1-flow" :class="animationClass" :style="animationStyle" d="M 200 124 V 170" />
                        <!-- Lamp 2 branch -->
                        <path v-if="!currentCircuit.resistors[1].broken" class="current-flow branch2-flow" :class="animationClass" :style="animationStyle" d="M 200 50 H 320 V 96" />
                        <path v-if="!currentCircuit.resistors[1].broken" class="current-flow branch2-flow" :class="animationClass" :style="animationStyle" d="M 320 124 V 170 H 200" />

                        <!-- Wires -->
                        <path class="wire-tube" 
                              :class="{ 'wire-tube-active': !currentCircuit.resistors[0].broken || !currentCircuit.resistors[1].broken }"
                              d="M 80 95 V 50 H 200 M 200 170 H 80 V 125"/>
                        <path class="wire-tube" 
                              :class="{ 'wire-tube-active': !currentCircuit.resistors[0].broken }"
                              d="M 200 50 V 96 M 200 124 V 170"/>
                        <path class="wire-tube" 
                              :class="{ 'wire-tube-active': !currentCircuit.resistors[1].broken }"
                              d="M 200 50 H 320 V 96 M 320 124 V 170 H 200"/>
                        
                        <!-- Battery Symbol -->
                        <g transform="translate(80, 110)">
                             <use href="#battery-symbol" />
                             <text x="-8" y="-12" text-anchor="end" class="circuit-label-small">+</text>
                             <text x="-8" y="18" text-anchor="end" class="circuit-label-small">-</text>
                             <text x="-40" y="0" text-anchor="end" dominant-baseline="middle" class="circuit-label-large">{{ currentCircuit.V }}V</text>
                        </g>
                        
                        <!-- Lamp 1 (middle vertical) with glow effect -->
                        <g transform="translate(200, 110)" @click="toggleBreak(0)" class="clickable-component">
                            <rect x="-25" y="-25" width="50" height="50" fill="transparent" class="cursor-pointer"/>
                            <!-- Glow effect behind lamp when on -->
                            <circle v-if="!currentCircuit.resistors[0].broken" cx="0" cy="0" r="20" fill="#fde047" filter="url(#lamp-blur)" class="lamp-pulse" :style="getLampBrightness(0)"/>
                            <use :href="currentCircuit.resistors[0].broken ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[0].label }}</text>
                        </g>
                        
                        <!-- Lamp 2 branch -->
                        <path v-if="!currentCircuit.resistors[1].broken" class="current-flow branch2-flow" :class="animationClass" :style="animationStyle" d="M 200 50 H 320 V 95" />
                        <path v-if="!currentCircuit.resistors[1].broken" class="current-flow branch2-flow" :class="animationClass" :style="animationStyle" d="M 320 125 V 170 H 200" />

                        <!-- Wires -->
                        <path class="wire-tube" 
                              :class="{ 'wire-tube-active': !currentCircuit.resistors[0].broken || !currentCircuit.resistors[1].broken }"
                              d="M 80 95 V 50 H 200 M 200 170 H 80 V 125"/>
                        <path class="wire-tube" 
                              :class="{ 'wire-tube-active': !currentCircuit.resistors[0].broken }"
                              d="M 200 50 V 95 M 200 125 V 170"/>
                        <path class="wire-tube" 
                              :class="{ 'wire-tube-active': !currentCircuit.resistors[1].broken }"
                              d="M 200 50 H 320 V 95 M 320 125 V 170 H 200"/>
                        
                        <!-- Battery Symbol -->
                        <g transform="translate(80, 110)">
                             <use href="#battery-symbol" />
                             <text x="-8" y="-12" text-anchor="end" class="circuit-label-small">+</text>
                             <text x="-8" y="18" text-anchor="end" class="circuit-label-small">-</text>
                             <text x="-40" y="0" text-anchor="end" dominant-baseline="middle" class="circuit-label-large">{{ currentCircuit.V }}V</text>
                        </g>
                        
                        <!-- Lamp 1 (middle vertical) with glow effect -->
                        <g transform="translate(200, 110)" @click="toggleBreak(0)" class="clickable-component">
                            <rect x="-25" y="-25" width="50" height="50" fill="transparent" class="cursor-pointer"/>
                            <!-- Glow effect behind lamp when on -->
                            <circle v-if="!currentCircuit.resistors[0].broken" cx="0" cy="0" r="20" fill="#fde047" filter="url(#lamp-blur)" class="lamp-pulse" :style="getLampBrightness(0)"/>
                            <use :href="currentCircuit.resistors[0].broken ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[0].label }}</text>
                        </g>
                        
                        <!-- Lamp 2 (right vertical) with glow effect -->
                        <g transform="translate(320, 110)" @click="toggleBreak(1)" class="clickable-component">
                            <rect x="-25" y="-25" width="50" height="50" fill="transparent" class="cursor-pointer"/>
                            <!-- Glow effect behind lamp when on -->
                            <circle v-if="!currentCircuit.resistors[1].broken" cx="0" cy="0" r="20" fill="#fde047" filter="url(#lamp-blur)" class="lamp-pulse" :style="getLampBrightness(1)"/>
                            <use :href="currentCircuit.resistors[1].broken ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[1].label }}</text>
                        </g>
                    </g>

                    <!-- Step 4: Serie (3 Lampen) -->
                    <g v-if="localStep === 4" class="animate-fadeIn">
                        <!-- Animated current flow -->
                        <path v-if="!currentCircuit.resistors.some(r => r.broken)" class="current-flow" :class="animationClass" :style="animationStyle" d="M 60 105 V 50 H 116" />
                        <path v-if="!currentCircuit.resistors.some(r => r.broken)" class="current-flow" :class="animationClass" :style="animationStyle" d="M 144 50 H 206" />
                        <path v-if="!currentCircuit.resistors.some(r => r.broken)" class="current-flow" :class="animationClass" :style="animationStyle" d="M 234 50 H 296" />
                        <path v-if="!currentCircuit.resistors.some(r => r.broken)" class="current-flow" :class="animationClass" :style="animationStyle" d="M 324 50 H 360 V 170 H 60 V 115" />
                        
                        <!-- Wire tube (background - the physical wire) -->
                        <path class="wire-tube" 
                              :class="{ 'wire-tube-active': !currentCircuit.resistors.some(r => r.broken) }"
                              d="M 60 105 V 50 H 116 M 144 50 H 206 M 234 50 H 296 M 324 50 H 360 V 170 H 60 V 115"/>
                        
                        <g transform="translate(60, 110)">
                            <use href="#battery-symbol" />
                            <text x="-5" y="-12" text-anchor="end" class="circuit-label-small">+</text>
                            <text x="-5" y="18" text-anchor="end" class="circuit-label-small">-</text>
                            <text x="-35" y="0" text-anchor="end" dominant-baseline="middle" class="circuit-label-large">{{ currentCircuit.V }}V</text>
                        </g>
                        
                        <g transform="translate(130, 50)" @click="toggleBreak(0)" class="clickable-component group">
                            <rect x="-25" y="-25" width="50" height="50" fill="transparent"/>
                            <circle v-if="!currentCircuit.resistors.some(r => r.broken)" cx="0" cy="0" r="20" fill="#fde047" class="lamp-pulse" :style="getLampBrightness(0)"/>
                            <use :href="currentCircuit.resistors.some(r => r.broken) ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[0].label }}</text>
                        </g>

                        <g transform="translate(220, 50)" @click="toggleBreak(1)" class="clickable-component group">
                             <rect x="-25" y="-25" width="50" height="50" fill="transparent"/>
                            <circle v-if="!currentCircuit.resistors.some(r => r.broken)" cx="0" cy="0" r="20" fill="#fde047" class="lamp-pulse" :style="getLampBrightness(1)"/>
                            <use :href="currentCircuit.resistors.some(r => r.broken) ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[1].label }}</text>
                        </g>

                        <g transform="translate(310, 50)" @click="toggleBreak(2)" class="clickable-component group">
                             <rect x="-25" y="-25" width="50" height="50" fill="transparent"/>
                            <circle v-if="!currentCircuit.resistors.some(r => r.broken)" cx="0" cy="0" r="20" fill="#fde047" class="lamp-pulse" :style="getLampBrightness(2)"/>
                            <use :href="currentCircuit.resistors.some(r => r.broken) ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[2].label }}</text>
                        </g>
                    </g>

                    <!-- Step 5: Parallel (3 Lampen) -->
                    <g v-if="localStep === 5" class="animate-fadeIn">
                        <!-- Animated current flows -->
                        <path v-if="currentCircuit.resistors.some(r => !r.broken)" class="current-flow main-flow" :class="animationClass" :style="animationStyle" d="M 80 95 V 50 H 160" />
                        <path v-if="currentCircuit.resistors.some(r => !r.broken)" class="current-flow main-flow" :class="animationClass" :style="animationStyle" d="M 160 170 H 80 V 125" />
                        
                        <path v-if="!currentCircuit.resistors[0].broken" class="current-flow branch1-flow" :class="animationClass" :style="animationStyle" d="M 160 50 V 96" />
                        <path v-if="!currentCircuit.resistors[0].broken" class="current-flow branch1-flow" :class="animationClass" :style="animationStyle" d="M 160 124 V 170" />

                        <path v-if="!currentCircuit.resistors[1].broken" class="current-flow branch2-flow" :class="animationClass" :style="animationStyle" d="M 160 50 H 250 V 96" />
                        <path v-if="!currentCircuit.resistors[1].broken" class="current-flow branch2-flow" :class="animationClass" :style="animationStyle" d="M 250 124 V 170 H 160" />

                        <path v-if="!currentCircuit.resistors[2].broken" class="current-flow branch3-flow" :class="animationClass" :style="animationStyle" d="M 160 50 H 340 V 96" />
                        <path v-if="!currentCircuit.resistors[2].broken" class="current-flow branch3-flow" :class="animationClass" :style="animationStyle" d="M 340 124 V 170 H 160" />

                        <!-- Wires -->
                        <path class="wire-tube" :class="{ 'wire-tube-active': currentCircuit.resistors.some(r => !r.broken) }" d="M 80 95 V 50 H 160 M 160 170 H 80 V 125"/>
                        <path class="wire-tube" :class="{ 'wire-tube-active': !currentCircuit.resistors[0].broken }" d="M 160 50 V 96 M 160 124 V 170"/>
                        <path class="wire-tube" :class="{ 'wire-tube-active': !currentCircuit.resistors[1].broken }" d="M 160 50 H 250 V 96 M 250 124 V 170 H 160"/>
                        <path class="wire-tube" :class="{ 'wire-tube-active': !currentCircuit.resistors[2].broken }" d="M 160 50 H 340 V 96 M 340 124 V 170 H 160"/>
                        
                        <!-- Battery Symbol -->
                        <g transform="translate(80, 110)">
                             <use href="#battery-symbol" />
                             <text x="-8" y="-12" text-anchor="end" class="circuit-label-small">+</text>
                             <text x="-8" y="18" text-anchor="end" class="circuit-label-small">-</text>
                             <text x="-40" y="0" text-anchor="end" dominant-baseline="middle" class="circuit-label-large">{{ currentCircuit.V }}V</text>
                        </g>
                        
                        <g transform="translate(160, 110)" @click="toggleBreak(0)" class="clickable-component">
                            <circle v-if="!currentCircuit.resistors[0].broken" cx="0" cy="0" r="20" fill="#fde047" filter="url(#lamp-blur)" class="lamp-pulse" :style="getLampBrightness(0)"/>
                            <use :href="currentCircuit.resistors[0].broken ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[0].label }}</text>
                        </g>
                        
                        <g transform="translate(250, 110)" @click="toggleBreak(1)" class="clickable-component">
                            <circle v-if="!currentCircuit.resistors[1].broken" cx="0" cy="0" r="20" fill="#fde047" filter="url(#lamp-blur)" class="lamp-pulse" :style="getLampBrightness(1)"/>
                            <use :href="currentCircuit.resistors[1].broken ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[1].label }}</text>
                        </g>

                        <g transform="translate(340, 110)" @click="toggleBreak(2)" class="clickable-component">
                            <circle v-if="!currentCircuit.resistors[2].broken" cx="0" cy="0" r="20" fill="#fde047" filter="url(#lamp-blur)" class="lamp-pulse" :style="getLampBrightness(2)"/>
                            <use :href="currentCircuit.resistors[2].broken ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[2].label }}</text>
                        </g>
                    </g>
                    
                    <!-- Step 6: Gemengde Schakeling -->
                    <g v-if="localStep === 6" class="animate-fadeIn">
                        <!-- Animated current flow -->
                        <!-- Hoofdstroom (batterij -> R1 -> splitsing) -->
                        <path v-if="!currentCircuit.resistors[0].broken" class="current-flow main-flow" :class="animationClass" :style="animationStyle" d="M 60 105 V 50 H 191"/>
                        <path v-if="!currentCircuit.resistors[0].broken && ( !currentCircuit.resistors[1].broken || !currentCircuit.resistors[2].broken )" class="current-flow main-flow" :class="animationClass" :style="animationStyle" d="M 219 50 H 280"/>
                        <!-- Terugweg (samenkomst -> batterij) -->
                        <path v-if="!currentCircuit.resistors[0].broken && ( !currentCircuit.resistors[1].broken || !currentCircuit.resistors[2].broken )" class="current-flow main-flow" :class="animationClass" :style="animationStyle" d="M 280 170 H 60 V 115"/>
                        
                        <!-- Tak 1 (R2) -->
                        <path v-if="!currentCircuit.resistors[0].broken && !currentCircuit.resistors[1].broken" class="current-flow branch1-flow" :class="animationClass" :style="animationStyle" d="M 280 50 V 95 M 280 125 V 170" />
                        <!-- Tak 2 (R3) -->
                        <path v-if="!currentCircuit.resistors[0].broken && !currentCircuit.resistors[2].broken" class="current-flow branch2-flow" :class="animationClass" :style="animationStyle" d="M 280 50 H 340 V 170 H 280" />

                        <!-- Wires -->
                        <path class="wire-tube" :class="{'wire-tube-active': !currentCircuit.resistors[0].broken }" d="M 60 105 V 50 H 191" />
                        <path class="wire-tube" :class="{'wire-tube-active': !currentCircuit.resistors[0].broken && ( !currentCircuit.resistors[1].broken || !currentCircuit.resistors[2].broken ) }" d="M 219 50 H 280 M 280 170 H 60 V 115" />
                        <path class="wire-tube" :class="{'wire-tube-active': !currentCircuit.resistors[0].broken && !currentCircuit.resistors[1].broken }" d="M 280 50 V 95 M 280 125 V 170" />
                        <path class="wire-tube" :class="{'wire-tube-active': !currentCircuit.resistors[0].broken && !currentCircuit.resistors[2].broken }" d="M 280 50 H 340 V 170 H 280" />
                        
                        <!-- Components -->
                        <g transform="translate(60, 110)">
                             <use href="#battery-symbol" />
                             <text x="-8" y="-12" text-anchor="end" class="circuit-label-small">+</text>
                             <text x="-8" y="18" text-anchor="end" class="circuit-label-small">-</text>
                             <text x="-40" y="0" text-anchor="end" dominant-baseline="middle" class="circuit-label-large">{{ currentCircuit.V }}V</text>
                        </g>
                        <g transform="translate(205, 50)" @click="toggleBreak(0)" class="clickable-component">
                            <circle v-if="!currentCircuit.resistors[0].broken && (!currentCircuit.resistors[1].broken || !currentCircuit.resistors[2].broken)" cx="0" cy="0" r="20" fill="#fde047" filter="url(#lamp-blur)" class="lamp-pulse" :style="getLampBrightness(0)"/>
                            <use :href="currentCircuit.resistors[0].broken ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[0].label }}</text>
                        </g>
                        <g transform="translate(280, 110)" @click="toggleBreak(1)" class="clickable-component">
                            <circle v-if="!currentCircuit.resistors[0].broken && !currentCircuit.resistors[1].broken" cx="0" cy="0" r="20" fill="#fde047" filter="url(#lamp-blur)" class="lamp-pulse" :style="getLampBrightness(1)"/>
                            <use :href="currentCircuit.resistors[1].broken ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[1].label }}</text>
                        </g>
                        <g transform="translate(340, 110)" @click="toggleBreak(2)" class="clickable-component">
                            <circle v-if="!currentCircuit.resistors[0].broken && !currentCircuit.resistors[2].broken" cx="0" cy="0" r="20" fill="#fde047" filter="url(#lamp-blur)" class="lamp-pulse" :style="getLampBrightness(2)"/>
                            <use :href="currentCircuit.resistors[2].broken ? '#lamp-off' : '#lamp-on'"/>
                            <text x="0" y="-26" text-anchor="middle" class="circuit-label">{{ currentCircuit.resistors[2].label }}</text>
                        </g>
                    </g>
                </svg>
             </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');
:root { font-family: 'Inter', sans-serif; }

.pattern-grid {
    background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
    background-size: 24px 24px;
}

.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

.ring-pulse-white {
    animation: ring-pulse-white 1.2s cubic-bezier(0.24, 1, 0.32, 1) 3;
    z-index: 50;
}
@keyframes ring-pulse-white {
    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8); background-color: rgba(255, 255, 255, 0.2); transform: scale(1); }
    50% { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0); background-color: rgba(255, 255, 255, 0.1); transform: scale(1.05); }
    100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); background-color: transparent; transform: scale(1); }
}

.animate-in { animation-duration: 0.4s; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
.fade-in { animation-name: fadeInOpac; }
.slide-in-from-bottom-2 { animation-name: slideInBottom; }
@keyframes fadeInOpac { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideInBottom { from { transform: translateY(0.5rem); } to { transform: translateY(0); } }

/* SVG Circuit Styles */
.circuit-svg { font-family: 'Inter', sans-serif; overflow: visible; }
.circuit-component { stroke: #334155; stroke-linecap: round; stroke-linejoin: round; }

.clickable-component { cursor: pointer; transition: filter 0.2s ease, opacity 0.2s ease; }
.clickable-component:hover { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15)); opacity: 0.9; }
.clickable-component:active { filter: drop-shadow(0 2px 3px rgba(0,0,0,0.1)); opacity: 1; }

/* Wire styling - PhET-style thin wires */
.wire-tube {
    fill: none;
    stroke: #cbd5e1;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: all 0.4s ease;
}

/* Active wire - slightly brighter */
.wire-tube-active {
    stroke: #0f172a;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
}

.circuit-label { font-size: 14px; font-weight: 700; fill: #475569; user-select: none; transition: fill 0.2s; }
.circuit-label-large { font-size: 16px; font-weight: 800; fill: #1e293b; user-select: none; }
.circuit-label-small { font-size: 18px; font-weight: 900; fill: #64748b; user-select: none; }
.clickable-component:hover .circuit-label { fill: #4f46e5; }

/* Lamp glow animation */
.lamp-glow { animation: lamp-flicker 2s ease-in-out infinite; }
.lamp-pulse { animation: hue-glow 2.5s ease-in-out infinite; transition: opacity 0.3s ease; }

.danger-overlay {
    animation: pulse-red 1s infinite;
    pointer-events: none;
}
.danger-label {
    font-size: 10px;
    font-weight: 900;
    fill: #dc2626;
    text-transform: uppercase;
}
@keyframes pulse-red {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@keyframes lamp-flicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
}

@keyframes hue-glow {
    0%, 100% { filter: hue-rotate(0deg) drop-shadow(0 0 5px #fde047); }
    50% { filter: hue-rotate(-15deg) drop-shadow(0 0 10px #fef08a); }
}

/* Animated Current Flow */
.current-flow {
  fill: none;
  stroke: var(--flow-color);
  stroke-width: 6;
  stroke-dasharray: 0 15;
  stroke-linecap: round;
  opacity: 0.9;
  filter: drop-shadow(0 0 4px var(--flow-color));
  
  animation-duration: var(--main-duration);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
.current-flow.main-flow {
  animation-duration: var(--main-duration);
}
.current-flow.branch1-flow {
  animation-duration: var(--branch1-duration);
}
.current-flow.branch2-flow {
  animation-duration: var(--branch2-duration);
}
.current-flow.branch3-flow {
  animation-duration: var(--branch3-duration);
}
.current-flow-conventional {
  animation-name: move-forward;
}
.current-flow-electron {
  animation-name: move-backward;
}

@keyframes move-forward {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -15; }
}
@keyframes move-backward {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: 15; }
}
</style>