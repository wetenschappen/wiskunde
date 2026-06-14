<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { PhEye, PhNavigationArrow, PhCheckCircle, PhWarningCircle, PhPlayCircle, PhArrowRight, PhTrash, PhX, PhCube, PhCircle, PhArrowDown, PhArrowUp } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: String,
  instruction: String,
  fullscreen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'complete'])

const selectedObject = ref('doos')
const objectOptions = [
  { id: 'doos', label: 'Doos', icon: PhCube, dy: 0, size: 70 },
  { id: 'auto', label: 'Auto', emoji: '🚗', dy: 20, size: 70 },
  { id: 'mens', label: 'Persoon', emoji: '🧍', dy: 22, size: 70 },
  { id: 'hond', label: 'Hond', emoji: '🐕', dy: 20, size: 70 },
  { id: 'appel', label: 'Appel', emoji: '🍎', dy: 22, size: 60 }
]

const objectLabel = computed(() => {
  const obj = objectOptions.find(o => o.id === selectedObject.value);
  if (!obj) return 'doos';
  
  if (obj.id === 'auto') return 'een auto';
  if (obj.id === 'mens') return 'een persoon';
  if (obj.id === 'hond') return 'een hond';
  if (obj.id === 'appel') return 'een appel';
  return 'een doos';
})

const scenarios = [
  {
    id: 1,
    title: 'Scenario 1: Vlakke Grond',
    desc: '{object} staat stil op de grond.',
    angle: 0,
    hasSupport: true,
    expectedFz: { origin: 'center', direction: 'down', sender: 'aarde', receiver: selectedObject.value },
    expectedFg: { origin: 'surface', direction: 'down', sender: selectedObject.value, receiver: 'steun' },
    expectedFn: { origin: 'surface', direction: 'perp', sender: 'steun', receiver: selectedObject.value }, 
    explanation: 'Perfect! De zwaartekracht (Fz) is de aantrekking van de aarde op {object}. Het gewicht (Fg) is de kracht van {object} op de steun. De normaalkracht (Fn) is de reactiekracht van de steun op {object}!'
  },
  {
    id: 2,
    title: 'Scenario 2: Helling',
    desc: '{object} ligt nu op een helling.',
    angle: 25,
    hasSupport: true,
    expectedFz: { origin: 'center', direction: 'down', sender: 'aarde', receiver: selectedObject.value },
    expectedFg: { origin: 'surface', direction: 'perp', sender: selectedObject.value, receiver: 'steun' },
    expectedFn: { origin: 'surface', direction: 'perp', sender: 'steun', receiver: selectedObject.value },
    explanation: 'Uitstekend! Zwaartekracht (Fz) trekt altijd verticaal naar beneden. Het gewicht (Fg) op een helling is de loodrechte druk van {object} op het steunvlak. Deze is exact even lang als de normaalkracht en ligt perfect in elkaars verlengde!'
  },
  {
    id: 3,
    title: 'Scenario 3: Vrije Val',
    desc: '{object} valt uit een vliegtuig. Welke krachten zijn er NU over?',
    angle: 0,
    hasSupport: false,
    expectedFz: { origin: 'center', direction: 'down', sender: 'aarde', receiver: selectedObject.value },
    expectedFg: { origin: 'none', direction: 'none', sender: '', receiver: '' },
    expectedFn: { origin: 'none', direction: 'none', sender: '', receiver: '' },
    explanation: 'Helemaal juist! Zonder steunvlak ben je in vrije val. Geen steun = geen normaalkracht (Fn) en dus ook geen gewicht (Fg). Enkel de zwaartekracht van de aarde trekt aan {object}.'
  },
  {
    id: 4,
    title: 'Scenario 4: Ophangpunt (Veer)',
    desc: '{object} hangt stil aan een veer.',
    angle: 0,
    hasSupport: true,
    isHanging: true,
    isSpring: true,
    expectedFz: { origin: 'center', direction: 'down', sender: 'aarde', receiver: selectedObject.value },
    expectedFg: { origin: 'surface', direction: 'down', sender: selectedObject.value, receiver: 'steun' },
    expectedFv: { origin: 'surface', direction: 'up', sender: 'steun', receiver: selectedObject.value },
    explanation: 'Geweldig! Omdat {object} stil hangt, is er evenwicht. {object} trekt de veer omlaag (gewichtsvector Fg) en de veer trekt omhoog met een veerkracht (Fv). Beide krachten grijpen perfect aan op het ophangpunt (contactpunt met de veer)!'
  }
]

const currentStep = ref(0)
const scenario = computed(() => scenarios[currentStep.value])

// Toggle for view mode: 'object', 'point', 'combined'
const viewMode = ref('object'); // 'object', 'point', 'combined'
const hoveredPoint = ref(null); // Voor instant tooltips
const drawAsPoint = computed(() => viewMode.value === 'point')
const drawAsCombined = computed(() => viewMode.value === 'combined')

// Fg is disabled in point mass mode (forces ON the object only - Fg is exerted BY the object)const isFgDisabledByMode = computed(() => viewMode.value === 'point')

const inputs = ref({
  fz: { origin: 'none', direction: 'none', sender: '', receiver: '' },
  fg: { origin: 'none', direction: 'none', sender: '', receiver: '' },
  fn: { origin: 'none', direction: 'none', sender: '', receiver: '' },
  fv: { origin: 'none', direction: 'none', sender: '', receiver: '' }
})

let prePointOrigins = null;

watch(viewMode, (newMode, oldMode) => {
    // We no longer forcefully clear or alter the vectors.
    // The visual representation just adapts (e.g. Fg disappears in point mass).
})

const feedback = ref(null)
const isCorrect = ref(false)

function checkScenario() {
  const current = scenario.value
  let correct = true
  let msg = ''

  const checkTextOnly = (key, expected) => {
      const input = inputs.value[key]
      if (expected.origin === 'none') return true
      const expectedReceiver = expected.receiver === 'doos' ? selectedObject.value : expected.receiver;
      const expectedSender = expected.sender === 'doos' ? selectedObject.value : expected.sender;
      return input.sender === expectedSender && input.receiver === expectedReceiver
  }

  const checkVisualOnly = (key, expected) => {
      const input = inputs.value[key]
      if (expected.origin === 'none') return input.origin === 'none'
      let dirMatch = input.direction === expected.direction
      if (current.angle === 0) {
          if (expected.direction === 'up' && input.direction === 'perp') dirMatch = true
          if (expected.direction === 'perp' && input.direction === 'up') dirMatch = true
          // NIEUW: accepteer 'down' en 'perp' als hetzelfde op een plat vlak
          if (expected.direction === 'down' && input.direction === 'perp') dirMatch = true
          if (expected.direction === 'perp' && input.direction === 'down') dirMatch = true
      }
      
      let expOrigin = expected.origin;
      if ((viewMode.value === 'combined' || viewMode.value === 'point') && key !== 'fg') {
          expOrigin = 'center';
      }
      
      return input.origin === expOrigin && dirMatch
  }

  const fzVisValid = checkVisualOnly('fz', current.expectedFz)
  const fgVisValid = checkVisualOnly('fg', current.expectedFg)
  const fnVisValid = current.expectedFn ? checkVisualOnly('fn', current.expectedFn) : true
  const fvVisValid = current.expectedFv ? checkVisualOnly('fv', current.expectedFv) : true

  const fzTxtValid = checkTextOnly('fz', current.expectedFz)
  const fgTxtValid = checkTextOnly('fg', current.expectedFg)
  const fnTxtValid = current.expectedFn ? checkTextOnly('fn', current.expectedFn) : true
  const fvTxtValid = current.expectedFv ? checkTextOnly('fv', current.expectedFv) : true

  if (!fzVisValid) {
    correct = false
    msg = 'Kijk nog eens naar de krachtenvector van de zwaartekracht (Fz). Waar begint deze en naar waar trekt hij?'
  } else if (!fzTxtValid) {
    correct = false
    msg = 'De zin van je tekstuele omschrijving (Zwaartekracht) klopt niet helemaal. Wie oefent de kracht juist uit op wie?'
  } else if (!fgVisValid) {
    correct = false
    if (!current.hasSupport && inputs.value.fg.origin !== 'none') {
        msg = `Een lichaam in vrije val... heeft dat wel een gewicht om te tekenen?`
    } else if (current.angle > 0) {
        msg = `Let op! Het gewicht (Fg) is de drukkracht IN het steunvlak. Op een helling staat deze loodrecht (⟂) op het oppervlak, in het verlengde van de normaalkracht.`
    } else {
        msg = `Kijk nog eens naar de gewichtsvector (Fg). Waar en in welke richting weegt ${objectLabel.value} door?`
    }
  } else if (!fgTxtValid) {
    correct = false
    msg = 'De zin van je tekstuele omschrijving (Gewicht) klopt niet helemaal. Wie oefent een kracht uit op het steunvlak?'
  } else if (!fnVisValid) {
    correct = false
    if (!current.hasSupport && inputs.value.fn.origin !== 'none') {
        msg = 'Pas op! Is er wel een normaalkracht in vrije val zonder iets om op te rusten?'
    } else {
        msg = 'Verifieer de normaalkracht (Fn). Waar bevindt zich het steunpunt en hoe reageert het vlak hierop?'
    }
  } else if (!fnTxtValid) {
     correct = false
     msg = 'Lees de tekst bij de Normaalkracht (Fn) nog eens goed, is het niet net andersom?'
  } else if (!fvVisValid) {
     correct = false
     msg = 'Verifieer de veerkracht (Fv). Waar bevindt zich het aangrijpingspunt en in welke richting trekt de veer?'
  } else if (!fvTxtValid) {
     correct = false
     msg = 'Lees de tekst bij de Veerkracht (Fv) nog eens goed, wie trekt aan wie?'
  }

  if (correct) {
    isCorrect.value = true
    
    // Capitalize objectLabel if it's the start of the sentence (e.g., 'Een doos')
    let finalDesc = current.explanation.replace(/\{object\}/g, objectLabel.value);
    
    // Quick fix for capitalization of "Een doos" at start of sentences
    finalDesc = finalDesc.replace(/(?:\.|!|\?|^)\s(een [a-z]+)/gi, (match) => {
        return match.charAt(0) + match.charAt(1) + match.charAt(2).toUpperCase() + match.slice(3);
    });

    feedback.value = { type: 'success', text: finalDesc }
  } else {
    isCorrect.value = false
    feedback.value = { type: 'error', text: msg }
  }
}

const shouldPulse = ref(false)

watch(() => props.isOpen, (val) => {
    if (!val) {
        if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
        window.removeEventListener('keydown', handleKeydown)
        shouldPulse.value = false
    } else {
        window.addEventListener('keydown', handleKeydown)
        
        // Trigger pulse with nextTick to ensure DOM is ready
        nextTick(() => {
            shouldPulse.value = true
            setTimeout(() => { shouldPulse.value = false }, 3000)
        })

        if (props.fullscreen) {
            nextTick(() => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(e => {
                        console.log('Fullscreen request denied:', e)
                    })
                }
            })
        }
    }
}, { immediate: true })


function handleKeydown(e) {
    if (e.key === 'Escape' && props.isOpen) {
        emit('close')
    }
}

const handleFullscreenChange = () => {
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
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => {})
    }
})

function nextScenario() {
  if (currentStep.value < scenarios.length - 1) {
    currentStep.value++
    inputs.value = { 
        fz: { origin: 'none', direction: 'none', sender: '', receiver: '' }, 
        fg: { origin: 'none', direction: 'none', sender: '', receiver: '' }, 
        fn: { origin: 'none', direction: 'none', sender: '', receiver: '' },
        fv: { origin: 'none', direction: 'none', sender: '', receiver: '' }
    }
    feedback.value = null
    isCorrect.value = false
  } else {
    emit('complete')
  }
}

const isDone = computed(() => isCorrect.value && currentStep.value === scenarios.length - 1)

function goToScenario(idx) {
    currentStep.value = idx;
    
    // Safety check: prevent hanging morbid objects
    if (scenario.value.isHanging && (selectedObject.value === 'mens' || selectedObject.value === 'hond')) {
        selectedObject.value = 'doos';
    }
    
    inputs.value = {
        fz: { origin: 'none', direction: 'none', sender: '', receiver: '' }, 
        fg: { origin: 'none', direction: 'none', sender: '', receiver: '' }, 
        fn: { origin: 'none', direction: 'none', sender: '', receiver: '' },
        fv: { origin: 'none', direction: 'none', sender: '', receiver: '' }
    }
    feedback.value = null
    isCorrect.value = false
}

function getBoxTransform() {
    if (!scenario.value.hasSupport) {
        return `translate(150, 120)`
    }
    return `translate(150, 160) rotate(${scenario.value.angle})`
}

const contactPointX = computed(() => {
    if (scenario.value.isHanging) return 0;
    if (scenario.value.angle > 0) return 0;
    return 10;
});

const contactPointY = computed(() => {
    return scenario.value.isHanging ? -30 : 30;
});

function getForceOffsetX(forceId, originStr) {
    if (originStr !== 'surface') return 0;
    if (scenario.value.isHanging && forceId === 'fg') return 8;
    if (scenario.value.isHanging && forceId === 'fv') return -8;
    return contactPointX.value;
}

const displayOrigins = computed(() => {
    return {
        fz: getDisplayOrigin('fz'),
        fg: getDisplayOrigin('fg'),
        fn: getDisplayOrigin('fn'),
        fv: getDisplayOrigin('fv')
    }
});

function getDisplayOrigin(forceId) {
    if (viewMode.value === 'combined') {
        return inputs.value[forceId].origin;
    }
    
    if (viewMode.value === 'point') {
        if (forceId === 'fg') return 'none';
        return inputs.value[forceId].origin !== 'none' ? 'center' : 'none';
    }

    if (viewMode.value === 'object') {
        if (inputs.value[forceId].origin === 'none') return 'none';
        if (forceId === 'fz') return 'center';
        if (scenario.value.hasSupport) {
            return (forceId === 'fn' || forceId === 'fg' || forceId === 'fv') ? 'surface' : 'center';
        } else {
            return 'center';
        }
    }
    return inputs.value[forceId].origin;
}

// Whether to show the box shape (object mode or combined mode)
const showBoxShape = computed(() => viewMode.value === 'object' || viewMode.value === 'combined')
// Whether all forces originate from center (point or combined mode)
const forceFromCenter = computed(() => viewMode.value === 'point' || viewMode.value === 'combined')

const vProps = computed(() => {
    const base = 70;
    const fzLen = base;
    let otherLen = base;
    
    if (scenario.value.angle > 0 && scenario.value.hasSupport && !scenario.value.isHanging) {
        otherLen = base * Math.cos(scenario.value.angle * Math.PI / 180);
    }
    
    const getM = (len) => ({
        len,
        dTxt: len + 8,
        dArr: len - 5,
        uTxt: -(len + 5),
        uArr: -(len + 18)
    });
    
    return {
        fz: getM(fzLen),
        fg: getM(otherLen),
        fn: getM(otherLen),
        fv: getM(otherLen)
    };
});

const vectorConfig = computed(() => {
  const base = [
    { id: 'fz', label: 'Zwaartekracht (Fz)', colorClass: 'text-sky-700 bg-sky-50 border-sky-300', iconColor: 'text-sky-500' },
    { id: 'fg', label: 'Gewicht (Fg)', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300', iconColor: 'text-emerald-500' }
  ];
  if (scenario.value.isSpring) {
    base.push({ id: 'fv', label: 'Veerkracht (Fv)', colorClass: 'text-amber-700 bg-amber-50 border-amber-300', iconColor: 'text-amber-500' });
  } else {
    base.push({ id: 'fn', label: 'Normaalkracht (Fn)', colorClass: 'text-rose-700 bg-rose-50 border-rose-300', iconColor: 'text-rose-500' });
  }
  return base;
});

const actors = computed(() => {
    let specificLabel = objectLabel.value;
    if (specificLabel.startsWith('een ')) {
        // Change 'een doos' to 'de doos' for the actor list
        let noun = specificLabel.substring(4);
        specificLabel = `de ${noun}`;
    }
    
    let supportLabel = 'de steun';
    if (!scenario.value.hasSupport) {
        supportLabel = 'de lucht (geen steun)';
    } else if (scenario.value.isSpring) {
        supportLabel = 'de veer';
    } else if (scenario.value.isHanging) {
        supportLabel = 'het touw';
    } else if (scenario.value.angle > 0) {
        supportLabel = 'de helling';
    } else {
        supportLabel = 'de vloer';
    }

    return [
        { id: 'aarde', label: 'de aarde' },
        { id: selectedObject.value, label: specificLabel },
        { id: 'steun', label: supportLabel }
    ];
})

function handleOriginClick(forceId, originStr) {
    // Block if Fg is disabled in point mode
    if (forceId === 'fg' && isFgDisabledByMode.value) return
    
    inputs.value[forceId].origin = originStr;
    
    if (originStr === 'none') {
        inputs.value[forceId].direction = 'none';
        inputs.value[forceId].sender = '';
        inputs.value[forceId].receiver = '';
    } else {
        if (inputs.value[forceId].direction === 'none') {
            inputs.value[forceId].direction = 'down'; 
        }
    }
}


</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-0">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <div class="relative bg-slate-100 shadow-2xl overflow-hidden flex flex-col w-screen h-screen rounded-none">
        <!-- HEADER -->
        <div class="p-2 md:p-3 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm z-10 relative shrink-0">
            <div class="flex items-center gap-4">
                <h2 class="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight">{{ title || 'Interactief Krachtenlab' }}</h2>
                
                <!-- Object Selector -->
                <div class="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                        v-for="obj in objectOptions" 
                        :key="obj.id"
                        @click="selectedObject = obj.id"
                        :disabled="scenario.isHanging && (obj.id === 'mens' || obj.id === 'hond')"
                        class="p-1.5 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                        :class="selectedObject === obj.id ? 'bg-white shadow-sm ring-1 ring-slate-200/50 scale-105 z-10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 grayscale opacity-70'"
                        :title="(scenario.isHanging && (obj.id === 'mens' || obj.id === 'hond')) ? 'Niet toegestaan in Ophanging' : obj.label"
                    >
                        <component v-if="obj.icon" :is="obj.icon" weight="fill" class="w-5 h-5 text-indigo-500" />
                        <span v-else class="text-[1.15rem] leading-none select-none filter drop-shadow-sm">{{ obj.emoji }}</span>
                    </button>
                </div>
            </div>
            <button @click="$emit('close')" 
                    class="p-2 md:p-3 bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-all shadow-inner relative"
                    :class="{ 'ring-pulse-red': shouldPulse }">
                <PhX class="text-xl font-bold" />
            </button>
        </div>

        <!-- PROGRESS REMOVED -->

        <!-- MAIN CONTENT AREA -->
        <div class="flex-1 overflow-hidden p-3 md:p-5 flex flex-col md:flex-row gap-5 md:gap-6 bg-slate-50 min-h-0">
            
            <!-- LEFT: LAB CANVAS (Fixed in view) -->
            <div class="md:w-[45%] xl:w-[42%] flex flex-col gap-3 min-h-0 shrink-0">
                <div class="bg-white rounded-3xl shadow-xl border-4 border-slate-200 relative w-full flex items-center justify-center overflow-hidden flex-1 min-h-[300px]">
                    <!-- View Toggle: 3 modes -->
                    <div class="absolute top-4 left-4 z-10">
                        <div class="inline-flex bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm border border-slate-200/60 pointer-events-auto">
                            <button @click="viewMode = 'object'" 
                                    class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300"
                                    :class="viewMode === 'object' ? 'bg-slate-800 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-100'">
                                <PhCube weight="fill" size="16" /> Star Lichaam
                            </button>
                            <button @click="viewMode = 'point'" 
                                    class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300"
                                    :class="viewMode === 'point' ? 'bg-slate-800 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-100'">
                                <PhCircle weight="fill" size="16" /> Puntmassa
                            </button>
                            <button @click="viewMode = 'combined'" 
                                    class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300"
                                    :class="viewMode === 'combined' ? 'bg-slate-800 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-100'">
                                Gecombineerd
                            </button>
                        </div>
                    </div>
                
                     <svg viewBox="0 0 300 300" class="w-full h-full drop-shadow-md">
                         <defs>
                             <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                 <path d="M 20 0 L 0 0 0 20" fill="none" class="stroke-slate-100" stroke-width="1"/>
                             </pattern>
                             <marker id="arrowFz" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                                 <path d="M 0 0 L 10 5 L 0 10 z" class="fill-sky-500" />
                             </marker>
                             <marker id="arrowFg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                                 <path d="M 0 0 L 10 5 L 0 10 z" class="fill-emerald-500" />
                             </marker>
                             <marker id="arrowFn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                                 <path d="M 0 0 L 10 5 L 0 10 z" class="fill-rose-500" />
                             </marker>
                             <marker id="arrowFv" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                                 <path d="M 0 0 L 10 5 L 0 10 z" class="fill-amber-500" />
                             </marker>
                             
                             <marker id="tinyArrowFz" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
                                 <path d="M 0 0 L 10 5 L 0 10 z" class="fill-sky-600" />
                             </marker>
                             <marker id="tinyArrowFg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
                                 <path d="M 0 0 L 10 5 L 0 10 z" class="fill-emerald-600" />
                             </marker>
                             <marker id="tinyArrowFn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
                                 <path d="M 0 0 L 10 5 L 0 10 z" class="fill-rose-600" />
                             </marker>
                             <marker id="tinyArrowFv" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
                                 <path d="M 0 0 L 10 5 L 0 10 z" class="fill-amber-600" />
                             </marker>
                         </defs>
                         <rect width="100%" height="100%" fill="url(#grid)" />

                         <!-- Physics group -->
                         <g :transform="getBoxTransform()" class="transition-transform duration-700 ease-out">
                             <!-- Planes -->
                             <!-- If hanging, let's draw a nice vertical rope if it's the center -->
                             <line v-if="scenario.isHanging && !scenario.isSpring" x1="0" y1="-30" x2="0" y2="-100" class="stroke-amber-900/40" stroke-width="4" stroke-dasharray="3 2" />
                             
                             <!-- Spring visualization -->
                             <path v-if="scenario.isSpring" d="M 0,-100 L 0,-85 L -8,-80 L 8,-70 L -8,-60 L 8,-50 L -8,-40 L 0,-35 L 0,-26" fill="none" class="stroke-slate-400" stroke-width="3" stroke-linejoin="round" />

                             <line v-if="scenario.hasSupport && !scenario.isHanging && viewMode === 'object'" x1="-200" y1="30" x2="200" y2="30" class="stroke-slate-300" stroke-width="8" stroke-linecap="round" />
                             <line v-if="scenario.hasSupport && !scenario.isHanging && viewMode === 'point'" x1="-200" y1="12" x2="200" y2="12" class="stroke-slate-300" stroke-width="14" stroke-linecap="round" />
                             <line v-if="scenario.hasSupport && !scenario.isHanging && viewMode === 'combined'" x1="-200" y1="30" x2="200" y2="30" class="stroke-slate-200" stroke-width="8" stroke-linecap="round" />
                             
                              <!-- The Box (object mode: solid, combined mode: translucent) -->
                             <g v-if="viewMode === 'object'">
                                <rect v-if="selectedObject === 'doos'" x="-30" y="-30" width="60" height="60" rx="6" class="fill-amber-100 stroke-amber-500 shadow-xl" stroke-width="4" />
                                <text v-else-if="selectedObject !== 'doos'" x="0" y="0" :dy="objectOptions.find(o => o.id === selectedObject).dy" :font-size="objectOptions.find(o => o.id === selectedObject).size || 70" text-anchor="middle" class="select-none pointer-events-none drop-shadow-xl">{{ objectOptions.find(o => o.id === selectedObject).emoji }}</text>
                             </g>
                             <g v-if="viewMode === 'combined'">
                                <rect v-if="selectedObject === 'doos'" x="-30" y="-30" width="60" height="60" rx="6" fill="rgb(251 191 36 / 0.15)" stroke="rgb(245 158 11 / 0.4)" stroke-width="2.5" stroke-dasharray="6 3" />
                                <text v-else-if="selectedObject !== 'doos'" x="0" y="0" :dy="objectOptions.find(o => o.id === selectedObject).dy" :font-size="objectOptions.find(o => o.id === selectedObject).size || 70" text-anchor="middle" class="select-none pointer-events-none opacity-30">{{ objectOptions.find(o => o.id === selectedObject).emoji }}</text>
                             </g>
                             
                             <!-- Center Point (Interaction Point: Zwaartepunt/Massamiddelpunt) -->
                             <g @mouseenter="hoveredPoint = 'center'" @mouseleave="hoveredPoint = null">
                                <circle cx="0" cy="0" r="8" 
                                        class="fill-slate-800 stroke-white hover-point pointer-events-auto cursor-help transition-all duration-300"
                                        stroke-width="2" />
                                <g v-if="hoveredPoint === 'center'" class="animate-fadeIn">
                                    <rect x="-90" y="-35" width="180" height="20" rx="4" class="fill-slate-900/95" />
                                    <text x="0" y="-21" text-anchor="middle" class="fill-white text-[10px] font-bold pointer-events-none tracking-tight">Zwaartepunt/Massamiddelpunt</text>
                                </g>
                             </g>
 
                             <!-- Contact Point / Surface stip (Interaction Point: Green for Fg) -->
                             <g v-if="scenario.hasSupport && viewMode !== 'point'" 
                                @mouseenter="hoveredPoint = 'surface'" @mouseleave="hoveredPoint = null">
                                <circle :cx="contactPointX" :cy="contactPointY" r="6" 
                                        class="fill-emerald-600 stroke-white hover-point pointer-events-auto cursor-help transition-all duration-300"
                                        stroke-width="2" />
                                 <g v-if="hoveredPoint === 'surface'" class="animate-fadeIn">
                                     <rect :x="contactPointX - 75" :y="scenario.isHanging ? contactPointY - 16 : contactPointY + 10" width="150" height="20" rx="4" class="fill-emerald-900/95" />
                                     <text :x="contactPointX" :y="scenario.isHanging ? contactPointY - 2 : contactPointY + 24" text-anchor="middle" class="fill-white text-[10px] font-bold pointer-events-none tracking-tight">{{ scenario.isSpring ? 'Aangrijpingspunt op veer' : 'Aangrijpingspunt op steunvlak' }}</text>
                                 </g>
                             </g>

                             <!-- Fz Vector (Force ON object -> Coincides) -->
                             <g v-if="displayOrigins.fz !== 'none' && inputs.fz.direction !== 'none'" 
                                :transform="`translate(${getForceOffsetX('fz', displayOrigins.fz)}, ${displayOrigins.fz === 'surface' ? contactPointY : 0})`">
                                <line v-if="inputs.fz.direction === 'perp'" x1="0" y1="0" x2="0" :y2="-vProps.fz.len" class="stroke-sky-500 transition-all" stroke-width="3.5" marker-end="url(#arrowFz)" />
                                <line v-if="inputs.fz.direction === 'down'" :transform="`rotate(${-scenario.angle})`" x1="0" y1="0" x2="0" :y2="vProps.fz.len" class="stroke-sky-500 transition-all" stroke-width="3.5" marker-end="url(#arrowFz)" />
                                <line v-if="inputs.fz.direction === 'up'" :transform="`rotate(${-scenario.angle})`" x1="0" y1="0" x2="0" :y2="-vProps.fz.len" class="stroke-sky-500 transition-all" stroke-width="3.5" marker-end="url(#arrowFz)" />
                                <!-- Vector Label: Now on the LEFT for Fz, and closer -->
                                <g v-if="inputs.fz.direction === 'down'" :transform="`rotate(${-scenario.angle})`">
                                    <text :x="scenario.angle > 0 ? 16 : -12" :y="vProps.fz.dTxt" class="vector-label fill-sky-600" font-size="12" font-weight="900" :text-anchor="scenario.angle > 0 ? 'start' : 'end'">
                                        <tspan>F</tspan><tspan font-size="8" dy="2.5">z</tspan>
                                    </text>
                                    <line :x1="scenario.angle > 0 ? 14 : -24" :y1="vProps.fz.dArr" :x2="scenario.angle > 0 ? 26 : -12" :y2="vProps.fz.dArr" class="stroke-sky-600" stroke-width="1.2" marker-end="url(#tinyArrowFz)"/>
                                </g>
                                <g v-else-if="inputs.fz.direction === 'up' || inputs.fz.direction === 'perp'" :transform="`rotate(${-scenario.angle})`">
                                    <text x="-12" :y="vProps.fz.uTxt" class="vector-label fill-sky-600" font-size="12" font-weight="900" text-anchor="end">
                                        <tspan>F</tspan><tspan font-size="8" dy="2.5">z</tspan>
                                    </text>
                                    <line x1="-24" :y1="vProps.fz.uArr" x2="-12" :y2="vProps.fz.uArr" class="stroke-sky-600" stroke-width="1.2" marker-end="url(#tinyArrowFz)"/>
                                </g>
                             </g>

                             <!-- Fg Vector (Force BY object -> Stays on surface) -->
                             <g v-if="displayOrigins.fg !== 'none' && inputs.fg.direction !== 'none' && !isFgDisabledByMode" 
                                :transform="`translate(${getForceOffsetX('fg', displayOrigins.fg)}, ${displayOrigins.fg === 'surface' ? contactPointY : 0})`">
                                
                                <line v-if="inputs.fg.direction === 'perp'" x1="0" y1="0" x2="0" :y2="vProps.fg.len" class="stroke-emerald-500 transition-all" stroke-width="3.5" marker-end="url(#arrowFg)" />
                                <line v-if="inputs.fg.direction === 'down'" :transform="`rotate(${-scenario.angle})`" x1="0" y1="0" x2="0" :y2="vProps.fg.len" class="stroke-emerald-500 transition-all" stroke-width="3.5" marker-end="url(#arrowFg)" />
                                <line v-if="inputs.fg.direction === 'up'" :transform="`rotate(${-scenario.angle})`" x1="0" y1="0" x2="0" :y2="-vProps.fg.len" class="stroke-emerald-500 transition-all" stroke-width="3.5" marker-end="url(#arrowFg)" />
                                
                                <g v-if="inputs.fg.direction === 'down'" :transform="`rotate(${-scenario.angle})`">
                                    <text x="12" :y="vProps.fg.dTxt" class="vector-label fill-emerald-600" font-size="12" font-weight="900">
                                        <tspan>F</tspan><tspan font-size="8" dy="2.5">g</tspan>
                                    </text>
                                    <line x1="10" :y1="vProps.fg.dArr" x2="22" :y2="vProps.fg.dArr" class="stroke-emerald-600" stroke-width="1.2" marker-end="url(#tinyArrowFg)"/>
                                </g>
                                <g v-else-if="inputs.fg.direction === 'perp'">
                                    <g :transform="`translate(0, ${vProps.fg.len}) rotate(${-scenario.angle})`">
                                        <text x="12" y="14" class="vector-label fill-emerald-600" font-size="12" font-weight="900" text-anchor="start">
                                            <tspan>F</tspan><tspan font-size="8" dy="2.5">g</tspan>
                                        </text>
                                        <line x1="10" y1="-1" x2="22" y2="-1" class="stroke-emerald-600" stroke-width="1.2" marker-end="url(#tinyArrowFg)"/>
                                    </g>
                                </g>
                                <g v-else-if="inputs.fg.direction === 'up'" :transform="`rotate(${-scenario.angle})`">
                                    <text x="12" :y="vProps.fg.uTxt" class="vector-label fill-emerald-600" font-size="12" font-weight="900">
                                        <tspan>F</tspan><tspan font-size="8" dy="2.5">g</tspan>
                                    </text>
                                    <line x1="10" :y1="vProps.fg.uArr" x2="22" :y2="vProps.fg.uArr" class="stroke-emerald-600" stroke-width="1.2" marker-end="url(#tinyArrowFg)"/>
                                </g>
                             </g>

                             <!-- Fn Vector (Force ON object -> Coincides with Fz) -->
                             <g v-if="displayOrigins.fn !== 'none' && inputs.fn.direction !== 'none'" 
                                :transform="`translate(${getForceOffsetX('fn', displayOrigins.fn)}, ${displayOrigins.fn === 'surface' ? contactPointY : 0})`">
                                <line v-if="inputs.fn.direction === 'perp'" x1="0" y1="0" x2="0" :y2="-vProps.fn.len" class="stroke-rose-500 transition-all" stroke-width="3.5" marker-end="url(#arrowFn)" />
                                <line v-if="inputs.fn.direction === 'down'" :transform="`rotate(${-scenario.angle})`" x1="0" y1="0" x2="0" :y2="vProps.fn.len" class="stroke-rose-500 transition-all" stroke-width="3.5" marker-end="url(#arrowFn)" />
                                <line v-if="inputs.fn.direction === 'up'" :transform="`rotate(${-scenario.angle})`" x1="0" y1="0" x2="0" :y2="-vProps.fn.len" class="stroke-rose-500 transition-all" stroke-width="3.5" marker-end="url(#arrowFn)" />
                                <!-- Vector Label: Near tip, on the LEFT -->
                                  <g v-if="inputs.fn.direction === 'perp' || inputs.fn.direction === 'up'" :transform="`rotate(${-scenario.angle})`">
                                      <text :x="scenario.isHanging ? -12 : 12" :y="vProps.fn.uTxt" class="vector-label fill-rose-600" font-size="12" font-weight="900" :text-anchor="scenario.isHanging ? 'end' : 'start'">
                                          <tspan>F</tspan><tspan font-size="8" dy="2.5">N</tspan>
                                      </text>
                                      <line :x1="scenario.isHanging ? -24 : 10" :y1="vProps.fn.uArr" :x2="scenario.isHanging ? -12 : 22" :y2="vProps.fn.uArr" class="stroke-rose-600" stroke-width="1.2" marker-end="url(#tinyArrowFn)"/>
                                  </g>
                                  <g v-else-if="inputs.fn.direction === 'down'" :transform="`rotate(${-scenario.angle})`">
                                      <text x="12" :y="vProps.fn.dTxt" class="vector-label fill-rose-600" font-size="12" font-weight="900">
                                          <tspan>F</tspan><tspan font-size="8" dy="2.5">N</tspan>
                                      </text>
                                      <line x1="10" :y1="vProps.fn.dArr" x2="22" :y2="vProps.fn.dArr" class="stroke-rose-600" stroke-width="1.2" marker-end="url(#tinyArrowFn)"/>
                                  </g>
                             </g>

                             <!-- Fv Vector (Force ON object -> Coincides with Fz) -->
                             <g v-if="displayOrigins.fv && displayOrigins.fv !== 'none' && inputs.fv.direction !== 'none'" 
                                :transform="`translate(${getForceOffsetX('fv', displayOrigins.fv)}, ${displayOrigins.fv === 'surface' ? contactPointY : 0})`">
                                <line v-if="inputs.fv.direction === 'perp'" x1="0" y1="0" x2="0" :y2="-vProps.fv.len" class="stroke-amber-500 transition-all" stroke-width="3.5" marker-end="url(#arrowFv)" />
                                <line v-if="inputs.fv.direction === 'down'" :transform="`rotate(${-scenario.angle})`" x1="0" y1="0" x2="0" :y2="vProps.fv.len" class="stroke-amber-500 transition-all" stroke-width="3.5" marker-end="url(#arrowFv)" />
                                <line v-if="inputs.fv.direction === 'up'" :transform="`rotate(${-scenario.angle})`" x1="0" y1="0" x2="0" :y2="-vProps.fv.len" class="stroke-amber-500 transition-all" stroke-width="3.5" marker-end="url(#arrowFv)" />
                                <!-- Vector Label: Near tip, on the LEFT -->
                                  <g v-if="inputs.fv.direction === 'perp' || inputs.fv.direction === 'up'" :transform="`rotate(${-scenario.angle})`">
                                      <text :x="scenario.isHanging ? -12 : 12" :y="vProps.fv.uTxt" class="vector-label fill-amber-600" font-size="12" font-weight="900" :text-anchor="scenario.isHanging ? 'end' : 'start'">
                                          <tspan>F</tspan><tspan font-size="8" dy="2.5">v</tspan>
                                      </text>
                                      <line :x1="scenario.isHanging ? -24 : 10" :y1="vProps.fv.uArr" :x2="scenario.isHanging ? -12 : 22" :y2="vProps.fv.uArr" class="stroke-amber-600" stroke-width="1.2" marker-end="url(#tinyArrowFv)"/>
                                  </g>
                                  <g v-else-if="inputs.fv.direction === 'down'" :transform="`rotate(${-scenario.angle})`">
                                      <text x="12" :y="vProps.fv.dTxt" class="vector-label fill-amber-600" font-size="12" font-weight="900">
                                          <tspan>F</tspan><tspan font-size="8" dy="2.5">v</tspan>
                                      </text>
                                      <line x1="10" :y1="vProps.fv.dArr" x2="22" :y2="vProps.fv.dArr" class="stroke-amber-600" stroke-width="1.2" marker-end="url(#tinyArrowFv)"/>
                                  </g>
                             </g>
                         </g>
                     </svg>
                     <!-- Legend -->
                     <div class="absolute bottom-4 left-4 flex flex-col gap-2 text-[10px] md:text-xs font-bold tracking-wider opacity-90">
                         <div class="flex items-center gap-2"><div class="w-4 h-1 bg-emerald-500 rounded"></div> <span class="bg-white/80 px-2 rounded py-1 border border-slate-200">Gewicht (Fg)</span></div>
                         <div class="flex items-center gap-2"><div class="w-4 h-1 bg-sky-500 rounded"></div> <span class="bg-white/80 px-2 rounded py-1 border border-slate-200">Zwaartekracht (Fz)</span></div>
                         <div v-if="!scenario.isSpring" class="flex items-center gap-2"><div class="w-4 h-1 bg-rose-500 rounded"></div> <span class="bg-white/80 px-2 rounded py-1 border border-slate-200">Normaalkracht (Fn)</span></div>
                         <div v-if="scenario.isSpring" class="flex items-center gap-2"><div class="w-4 h-1 bg-amber-500 rounded"></div> <span class="bg-white/80 px-2 rounded py-1 border border-slate-200">Veerkracht (Fv)</span></div>
                     </div>
                </div>
            </div>

            <!-- RIGHT: CONTROLS (Independently scrollable) -->
            <div class="md:w-[55%] xl:w-[58%] flex flex-col min-h-0 min-w-0">
                <div class="mb-3 bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 shrink-0 relative overflow-hidden">
                    <div class="flex flex-col gap-1.5 relative z-10">
                        <div class="flex flex-col md:flex-row justify-between md:items-center gap-3">
                            <select :value="currentStep" @change="goToScenario(parseInt($event.target.value))"
                                    class="appearance-none bg-slate-900 text-white font-extrabold text-base md:text-lg py-2.5 px-4 pr-10 rounded-xl outline-none hover:bg-slate-800 focus:ring-4 focus:ring-indigo-500/30 cursor-pointer transition-all shadow-md tracking-tight w-full md:max-w-xs relative bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[length:16px_16px]">
                                <option v-for="(scen, idx) in scenarios" :key="idx" :value="idx" class="font-bold text-slate-100 bg-slate-800">{{ scen.title }}</option>
                            </select>
                            <p class="text-sm font-medium text-slate-600 leading-tight flex-1 md:text-right">{{ scenario.desc.replace(/\{object\}/g, objectLabel).replace(/^(.)/, c => c.toUpperCase()) }}</p>
                        </div>

                        <!-- Dynamic Mode-Specific Subtitle (Amber for all, replacing scenario.desc) -->
                        <div class="mt-1 pt-2 border-t border-slate-100 animate-fadeIn">
                             <div v-if="viewMode === 'object'" class="flex items-center gap-2 text-amber-600">
                                 <PhCube weight="fill" size="14" class="shrink-0" />
                                 <p class="text-xs md:text-[13px] font-bold leading-tight">
                                     <span class="uppercase tracking-wide">Star Lichaam:</span> Krachten op hetzelfde voorwerp hebben niet noodzakelijk hetzelfde aangrijpingspunt.
                                 </p>
                             </div>
                             <div v-else-if="viewMode === 'point'" class="flex items-center gap-2 text-amber-600">
                                 <PhCircle weight="fill" size="14" class="shrink-0" />
                                 <p class="text-xs md:text-[13px] font-bold leading-tight">
                                     <span class="uppercase tracking-wide">Puntmassa:</span> Alle aangrijpingspunten vallen samen. Teken enkel krachten ÓP {{ objectLabel }}.
                                 </p>
                             </div>
                             <div v-else-if="viewMode === 'combined'" class="flex items-center gap-2 text-amber-600">
                                 <p class="text-xs md:text-[13px] font-bold leading-tight">
                                     <span class="uppercase tracking-wide">Gecombineerd:</span> {{ objectLabel.replace(/^(.)/, c => c.toUpperCase()) }} is een schets, maar alle krachten ÓP {{ objectLabel }} vertrekken vanuit het zwaartepunt.
                                 </p>
                             </div>
                        </div>
                    </div>
                </div>

                 <!-- Forms Area (SCROLLABLE) -->
                 <div class="flex-1 overflow-y-auto pr-2 pb-4 min-h-0 custom-scrollbar relative" :class="viewMode === 'combined' ? 'space-y-4' : ''">
                     
                     <div v-if="viewMode !== 'combined'" class="h-full flex flex-col items-center justify-center p-6 bg-slate-100/80 rounded-2xl border-2 border-dashed border-slate-300 min-h-[400px]">
                         <div class="bg-white border text-center shadow-lg rounded-2xl p-6 max-w-sm mx-auto">
                             <div class="bg-indigo-50 text-indigo-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-indigo-50/50">
                                 <PhEye weight="fill" size="28" />
                             </div>
                             <h4 class="font-extrabold text-slate-800 text-xl mb-2">Dit is een voorbeeldweergave</h4>
                             <p class="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
                                 Hier zie je hoe de krachten zich vormen naar het theoretische <span class="text-slate-700 font-bold">{{ viewMode === 'object' ? 'Star Lichaam' : 'Puntmassa' }}</span> diagram.
                             </p>
                             <button @click="viewMode = 'combined'" class="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 px-6 rounded-xl shadow-md transition-all text-sm w-full block">
                                 Ga naar Gecombineerd om aan te passen
                             </button>
                         </div>
                     </div>
                 
                     <template v-else>
                         <div v-for="force in vectorConfig" :key="force.id" 
                              class="bg-white rounded-2xl border-2 shadow-sm transition-all duration-300 overflow-hidden"
                              :class="[
                                 force.colorClass, 
                                 inputs[force.id].origin === 'none' ? 'opacity-[0.85]' : ''
                              ]">
                              
                             <div class="px-4 py-3 border-b flex items-center justify-between" :class="'border-'+force.colorClass.split('border-')[1]">
                                 <div class="flex items-center gap-3">
                                     <PhNavigationArrow class="text-xl md:text-2xl" :class="force.iconColor" weight="fill" />
                                     <h4 class="font-extrabold text-base md:text-lg">{{ force.label }}</h4>
                                 </div>
                                 <button @click="handleOriginClick(force.id, 'none')" 
                                         class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100" 
                                         title="Kracht Wissen">
                                     <PhTrash weight="fill" size="18" />
                                 </button>
                             </div>

                             <div class="p-3 md:p-4 pb-5 space-y-4 transition-all" :class="{'bg-slate-50/50': inputs[force.id].origin === 'none'}">
                                 <!-- ROW 1: Omschrijving -->
                                 <div class="bg-indigo-50/50 -mx-3 -mt-3 mb-2 p-3 border-b border-indigo-50/10 transition-all">
                                     <p class="text-[9px] font-bold uppercase tracking-widest text-indigo-800 mb-2 flex items-center gap-1"><PhNavigationArrow size="12" /> 1. Formuleer in een zin</p>
                                     <div class="flex flex-wrap items-center gap-2 text-sm text-slate-700 w-full justify-center lg:justify-start">
                                         <span class="font-medium">De kracht uitgeoefend door</span>
                                         <select v-model="inputs[force.id].sender" class="bg-white border-2 border-indigo-200 rounded-lg px-2 py-1 font-bold text-indigo-900 focus:outline-none focus:border-indigo-500 hover:border-indigo-400 cursor-pointer min-w-[120px] shadow-sm appearance-none text-center transition-colors text-xs">
                                             <option value="" disabled selected>Kies...</option>
                                             <option v-for="actor in actors" :key="'s'+actor.id" :value="actor.id">{{ actor.label }}</option>
                                         </select>
                                         <span class="font-medium">op</span>
                                         <select v-model="inputs[force.id].receiver" class="bg-white border-2 border-indigo-200 rounded-lg px-2 py-1 font-bold text-indigo-900 focus:outline-none focus:border-indigo-500 hover:border-indigo-400 cursor-pointer min-w-[120px] shadow-sm appearance-none text-center transition-colors text-xs">
                                             <option value="" disabled selected>Kies...</option>
                                             <option v-for="actor in actors" :key="'r'+actor.id" :value="actor.id">{{ actor.label }}</option>
                                         </select>
                                     </div>
                                 </div>

                                 <!-- ROW 2: Vectors -->
                                 <div class="grid md:grid-cols-2 gap-4 pb-1">
                                     <!-- ORIGIN -->
                                     <div class="w-full">
                                         <p class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">2. Startpunt (Aangrijpingspunt)</p>
                                         
                                         <div class="relative">
                                             <select 
                                                 :value="inputs[force.id].origin"
                                                 @change="handleOriginClick(force.id, $event.target.value)"
                                                 class="w-full bg-white border-2 rounded-lg px-3 py-1.5 font-bold focus:outline-none shadow-sm transition-all cursor-pointer appearance-none text-xs md:text-[13px]"
                                                 :class="[
                                                     inputs[force.id].origin === 'none' ? 'border-slate-200 text-slate-400' : '',
                                                     inputs[force.id].origin === 'center' ? 'border-amber-400 bg-amber-50/30 text-amber-900' : '',
                                                     inputs[force.id].origin === 'surface' ? 'border-emerald-500 text-emerald-600' : '',
                                                     (viewMode !== 'object' && force.id !== 'fg') ? 'border-amber-200' : ''
                                                 ]"
                                             >
                                                 <option value="none">Niet getekend / Geen</option>
                                                 
                                                 <!-- Always show all options to force critical thinking -->
                                                 <option value="center">⚫ Zwaartepunt/Massamiddelpunt</option>
                                                 <option v-if="scenario.hasSupport" value="surface">🟢 {{ scenario.isSpring ? 'Aangrijpingspunt op veer' : 'Aangrijpingspunt op steunvlak' }}</option>
                                             </select>
                                         </div>
                                     </div>

                                     <!-- DIRECTION -->
                                     <div :class="{'opacity-30 pointer-events-none grayscale': inputs[force.id].origin === 'none'}" class="transition-all">
                                         <p class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">3. Richting & Zin</p>
                                         <div class="flex gap-2">
                                             <button @click="inputs[force.id].direction = 'down'" 
                                                     class="flex-1 py-1 px-1 text-xs md:text-sm font-bold rounded-xl border-2 transition-all flex justify-center gap-1 min-h-[46px] items-center" 
                                                     :class="inputs[force.id].direction === 'down' ? 'border-slate-800 bg-slate-800 text-white shadow-md' : 'border-slate-300 text-slate-500 bg-white hover:border-slate-400 hover:text-slate-800'">
                                                 <PhArrowDown weight="bold" size="20" />
                                             </button>
                                             <button v-if="scenario.isSpring" @click="inputs[force.id].direction = 'up'" 
                                                     class="flex-1 py-1 px-1 text-xs md:text-sm font-bold rounded-xl border-2 transition-all flex justify-center gap-1 min-h-[46px] items-center" 
                                                     :class="inputs[force.id].direction === 'up' ? 'border-slate-800 bg-slate-800 text-white shadow-md' : 'border-slate-300 text-slate-500 bg-white hover:border-slate-400 hover:text-slate-800'">
                                                 <PhArrowUp weight="bold" size="20" />
                                             </button>
                                             <button v-if="!scenario.isSpring" @click="inputs[force.id].direction = 'perp'" 
                                                     class="flex-1 py-1 px-1 text-xs md:text-sm font-bold rounded-xl border-2 transition-all flex justify-center gap-1 min-h-[46px] items-center" 
                                                     :class="inputs[force.id].direction === 'perp' ? 'border-slate-800 bg-slate-800 text-white shadow-md' : 'border-slate-300 text-slate-500 bg-white hover:border-slate-400 hover:text-slate-800'">
                                                 <span class="text-xl md:text-2xl leading-none font-sans">⟂</span>
                                             </button>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         <!-- Feedback & Actions (Inside scrollable) -->
                         <div class="mt-2 pt-2 border-t border-slate-200">
                             <div v-if="feedback" class="p-3 md:p-4 rounded-xl mb-4 flex gap-3 items-start shadow-sm" :class="feedback.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-50 text-red-900 border border-red-200'">
                                 <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="text-xl md:text-2xl shrink-0 mt-0.5" />
                                 <p class="font-semibold text-xs md:text-sm leading-snug">{{ feedback.text }}</p>
                             </div>

                             <div class="flex gap-4">
                                 <button 
                                     v-if="!isCorrect"
                                     @click="checkScenario" 
                                     class="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 text-xs md:text-sm"
                                 >
                                     <PhPlayCircle class="text-lg md:text-xl" weight="fill" /> Controleer Labo
                                 </button>
                                 <button 
                                     v-else
                                     @click="nextScenario" 
                                     class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-2.5 rounded-xl shadow-md shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm md:text-base cursor-pointer"
                                 >
                                     {{ isDone ? 'Labo Afronden' : 'Nieuwe Situatie' }} <PhArrowRight class="text-lg md:text-xl" weight="bold" />
                                 </button>
                             </div>
                         </div>
                     </template>
                 </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.ring-pulse-red {
    animation: ring-pulse 0.8s cubic-bezier(0.24, 1, 0.32, 1) 3;
    z-index: 50;
}

@keyframes ring-pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 1);
        background-color: rgba(239, 68, 68, 0.3);
        transform: scale(1);
    }
    50% {
        box-shadow: 0 0 0 20px rgba(239, 68, 68, 0.8);
        background-color: rgba(239, 68, 68, 0.6);
        transform: scale(1.1);
    }
    100% {
        box-shadow: 0 0 0 40px rgba(239, 68, 68, 0);
        background-color: transparent;
        transform: scale(1);
    }
}
</style>
