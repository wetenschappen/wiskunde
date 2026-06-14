<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, PhFunction, PhGraph, PhArrowRight, PhArrowLeft, PhChartLineUp,
  PhEraser, PhCheckCircle
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
})

const emit = defineEmits(['close', 'complete'])

// ==================== DATA & STATE ====================
const MATH_FUNCTIONS = [
  // User provided
  { id: 'f1', expr: 'f(x) = x^4 - 2x^2', func: (x) => (x**4) - 2*(x**2), roots: [{x: -1.41, y: 0}, {x: 0, y: 0}, {x: 1.41, y: 0}], asymptotes: { horizontal: 'Geen', vertical: 'Geen' }, criticalPoints: [{x: -1, y: -1}, {x: 0, y: 0}, {x: 1, y: -1}], inflectionPoints: [{x: -0.58, y: -0.56}, {x: 0.58, y: -0.56}] },
  { id: 'f2', expr: 'f(x) = 2x / (x^2 - 1)', func: (x) => (2*x) / (x**2 - 1), roots: [{x: 0, y: 0}], asymptotes: { horizontal: 'y = 0', vertical: 'x = 1, x = -1' }, criticalPoints: [], inflectionPoints: [{x: 0, y: 0}] },
  { id: 'f3', expr: 'f(x) = 2sin(x) - sin^2(x)', func: (x) => 2*Math.sin(x) - (Math.sin(x))**2, roots: [{x: 0, y: 0}, {x: 3.14, y: 0}], asymptotes: { horizontal: 'Geen', vertical: 'Geen' }, criticalPoints: [{x: 1.57, y: 1}], inflectionPoints: [] },
  { id: 'f4', expr: 'f(x) = -x^3 + 7x^2 - 8x', func: (x) => -(x**3) + 7*(x**2) - 8*x, roots: [{x: 0, y: 0}, {x: 1.44, y: 0}, {x: 5.56, y: 0}], asymptotes: { horizontal: 'Geen', vertical: 'Geen' }, criticalPoints: [{x: 0.67, y: -2.52}, {x: 4, y: 16}], inflectionPoints: [{x: 2.33, y: 6.74}] },
  { id: 'f5', expr: 'f(x) = (x^2+6x+8)/(x^2+6x+5)', func: (x) => (x**2+6*x+8)/(x**2+6*x+5), roots: [{x: -4, y: 0}, {x: -2, y: 0}], asymptotes: { horizontal: 'y = 1', vertical: 'x = -1, x = -5' }, criticalPoints: [{x: -3, y: 0.25}], inflectionPoints: [] },
  { id: 'f6', expr: 'f(x) = sin(x) + cos(x)', func: (x) => Math.sin(x) + Math.cos(x), roots: [{x: 2.36, y: 0}, {x: -0.79, y: 0}], asymptotes: { horizontal: 'Geen', vertical: 'Geen' }, criticalPoints: [{x: 0.79, y: 1.41}, {x: 3.93, y: -1.41}], inflectionPoints: [{x: 2.36, y: 0}] },
]

const selectedFunc = ref(MATH_FUNCTIONS[0])
const currentStep = ref(0)
const showSolution = ref(false)

// Student inputs ("Kapstok")
const userRootsStr = ref('') // x-intercepts
const userYInterceptStr = ref('')
const userVAsymptotesStr = ref('')
const userHAsymptotesStr = ref('')
const userCriticalPointsStr = ref('')
const userInflectionPointsStr = ref('')
const calculatedPoints = ref([]) // For step 6: [{ x: Number, yStr: ref('') }]

const analysisSteps = [
  { id: 'intercepten', title: 'Stap 1: Intercepten', description: 'Vind de snijpunten met de x-as (nulpunten) en de y-as.' },
  { id: 'asymptoten', title: 'Stap 2: Asymptoten', description: 'Vind de verticale en horizontale asymptoten.' },
  { id: 'eersteAfgeleide', title: 'Stap 3: Eerste Afgeleide', description: 'Vind de x-waarden van de kritieke punten (waar f\'(x) = 0 of niet bestaat).' },
  { id: 'tweedeAfgeleide', title: 'Stap 4: Tweede Afgeleide', description: 'Vind de x-waarden van de mogelijke buigpunten (waar f\'\'(x) = 0 of niet bestaat).' },
  { id: 'tekenschema', title: 'Stap 5: Tekenschema', description: 'Combineer alle x-waarden en analyseer het teken van f\' en f\'\'.' },
  { id: 'puntenBerekenen', title: 'Stap 6: Punten Berekenen', description: 'Bereken de exacte (x, y) coördinaten voor de kritieke punten en buigpunten.' },
  { id: 'schets', title: 'Stap 7: Schets & Controle', description: 'Teken de grafiek en controleer je werk.' }
]

// Canvas state
const sketchpadCanvas = ref(null)
let ctx = null
const isDrawing = ref(false)


// ==================== PARSED USER INPUT ====================
const parseStringToNumArray = (str) => {
  if (!str) return []
  return str.split(/[,;\s]+/).map(s => parseFloat(s.replace(',', '.'))).filter(n => !isNaN(n))
}

const parsedUserRoots = computed(() => parseStringToNumArray(userRootsStr.value))
const parsedUserYIntercept = computed(() => parseFloat(userYInterceptStr.value.replace(',', '.')))
const parsedUserVAsymptotes = computed(() => parseStringToNumArray(userVAsymptotesStr.value))
const parsedUserHAsymptotes = computed(() => parseStringToNumArray(userHAsymptotesStr.value))
const parsedUserCriticalPoints = computed(() => parseStringToNumArray(userCriticalPointsStr.value))
const parsedUserInflectionPoints = computed(() => parseStringToNumArray(userInflectionPointsStr.value))

// Get x-values that have a y-coordinate entered (for hiding preview circles)
const xValuesWithYEntered = computed(() => {
  return calculatedPoints.value
    .filter(p => p.yStr && p.yStr.trim() !== '' && !isNaN(parseFloat(p.yStr.replace(',', '.'))))
    .map(p => p.x)
})

// Critical points that don't yet have y-coordinates (show preview circles)
const criticalPointsWithoutY = computed(() => {
  return parsedUserCriticalPoints.value.filter(x => !xValuesWithYEntered.value.includes(x))
})

// Inflection points that don't yet have y-coordinates (show preview circles)
const inflectionPointsWithoutY = computed(() => {
  return parsedUserInflectionPoints.value.filter(x => !xValuesWithYEntered.value.includes(x))
})


// ==================== SIGN CHART ====================
// Sorted critical points for f'(x) row
const sortedCriticalPoints = computed(() => {
  return [...parsedUserCriticalPoints.value].sort((a, b) => a - b)
})

// Sorted inflection points for f''(x) row
const sortedInflectionPoints = computed(() => {
  return [...parsedUserInflectionPoints.value].sort((a, b) => a - b)
})

// Sorted vertical asymptotes (affect both rows)
const sortedAsymptotes = computed(() => {
  return [...parsedUserVAsymptotes.value].sort((a, b) => a - b)
})

// Merged points for f'(x): critical points + asymptotes, deduplicated with combined types
const fPrimeAllPoints = computed(() => {
  const allX = [...new Set([...sortedCriticalPoints.value, ...sortedAsymptotes.value])].sort((a, b) => a - b)
  return allX.map(x => {
    const isCritical = sortedCriticalPoints.value.includes(x)
    const isAsymptote = sortedAsymptotes.value.includes(x)
    if (isCritical && isAsymptote) return { x, type: 'critical-asymptote' }
    if (isAsymptote) return { x, type: 'asymptote' }
    return { x, type: 'critical' }
  })
})

// Merged points for f''(x): inflection points + asymptotes, deduplicated with combined types
const fDoublePrimeAllPoints = computed(() => {
  const allX = [...new Set([...sortedInflectionPoints.value, ...sortedAsymptotes.value])].sort((a, b) => a - b)
  return allX.map(x => {
    const isInflection = sortedInflectionPoints.value.includes(x)
    const isAsymptote = sortedAsymptotes.value.includes(x)
    if (isInflection && isAsymptote) return { x, type: 'inflection-asymptote' }
    if (isAsymptote) return { x, type: 'asymptote' }
    return { x, type: 'inflection' }
  })
})

// Check if current step is tekenschema or schets for dynamic width
const isTekenschemaStep = computed(() => {
  const stepId = analysisSteps[currentStep.value]?.id;
  return stepId === 'tekenschema' || stepId === 'schets';
})

// Calculate flex values for f''(x) intervals based on where f''(x) points fall among f'(x) points
// f'(x) uses: critical points + asymptotes (fPrimeAllPoints)
// f''(x) uses: inflection points + asymptotes (fDoublePrimeAllPoints)
const fDoublePrimeFlexValues = computed(() => {
  const fPrimePts = fPrimeAllPoints.value.map(p => p.x)
  const fDoublePrimePts = fDoublePrimeAllPoints.value.map(p => p.x)
  
  if (fDoublePrimePts.length === 0) return [1]
  if (fPrimePts.length === 0) {
    // No f'(x) reference points, just use equal spacing
    return Array(fDoublePrimePts.length + 1).fill(1)
  }
  
  // f'(x) points are equally spaced at positions: 1/(n+1), 2/(n+1), ..., n/(n+1)
  // Find the actual position of each f''(x) point among f'(x) points
  const fDoublePrimePositions = fDoublePrimePts.map(pt => {
    const indexInFPrime = fPrimePts.indexOf(pt)
    if (indexInFPrime !== -1) {
      // Point exists in f'(x) - use same position
      return (indexInFPrime + 1) / (fPrimePts.length + 1)
    }
    // Point not in f'(x) - place it in the middle of the segment it falls into
    let segmentIndex = 0
    for (let i = 0; i < fPrimePts.length; i++) {
      if (pt > fPrimePts[i]) segmentIndex = i + 1
    }
    return (segmentIndex + 0.5) / (fPrimePts.length + 1)
  })
  
  // Convert positions to flex values (width of each interval)
  const flexValues = []
  let prevPos = 0
  for (const pos of fDoublePrimePositions) {
    flexValues.push(pos - prevPos)
    prevPos = pos
  }
  flexValues.push(1 - prevPos)
  
  return flexValues
})

// f'(x) signs and behavior (based on fPrimeAllPoints)
const signChartFPrime = ref([])
const signChartBehavior = ref([])

// f''(x) signs and concavity (based on fDoublePrimeAllPoints)
const signChartFDoublePrime = ref([])
const signChartConcavity = ref([])

// Calculate asymptote position as percentage on the number line
// Based on where it falls among f'(x) points (equal spacing)
function getAsymptotePosition(asymX) {
  const allPts = fPrimeAllPoints.value.map(p => p.x)
  const idx = allPts.indexOf(asymX)
  if (idx === -1) return 50 // fallback
  // Position is at (idx + 1) / (allPts.length + 1) * 100
  return ((idx + 1) / (allPts.length + 1)) * 100
}

// Watch f'(x) merged points for f'(x) arrays
watch(fPrimeAllPoints, (newValues) => {
  const numIntervals = newValues.length + 1
  signChartFPrime.value = Array.from({ length: numIntervals }, (_, i) => signChartFPrime.value[i] || '+')
  signChartBehavior.value = Array.from({ length: numIntervals }, (_, i) => signChartBehavior.value[i] || '↗')
}, { deep: true, immediate: true })

// Watch f''(x) merged points for f''(x) arrays
watch(fDoublePrimeAllPoints, (newValues) => {
  const numIntervals = newValues.length + 1
  signChartFDoublePrime.value = Array.from({ length: numIntervals }, (_, i) => signChartFDoublePrime.value[i] || '+')
  signChartConcavity.value = Array.from({ length: numIntervals }, (_, i) => signChartConcavity.value[i] || '∪')
}, { deep: true, immediate: true })


// ==================== SVG GRAPHICS ENGINE ====================
const svgWidth = 600
const svgHeight = 600
const viewBoxX = -6
const viewBoxY = -6
const viewBoxWidth = 12
const viewBoxHeight = 12

function toSvgX(x) {
  if (x === Infinity || x === -Infinity) return -9999;
  return ((x - viewBoxX) / viewBoxWidth) * svgWidth
}

function toSvgY(y) {
  if (y === Infinity || y === -Infinity) return -9999;
  return svgHeight - ((y - viewBoxY) / viewBoxHeight) * svgHeight
}

const functionPaths = computed(() => {
  const f = selectedFunc.value.func
  const poles = parsedUserVAsymptotes.value
  const paths = []
  let currentPath = ''
  
  const step = 0.05
  const yLimit = 15
  
  for (let x = viewBoxX; x <= viewBoxX + viewBoxWidth; x += step) {
    const nearPole = poles.some(pole => Math.abs(x - pole) < step * 1.5)
    
    if (nearPole) {
      if (currentPath !== '') paths.push(currentPath)
      currentPath = ''
      continue
    }

    const y = f(x)
    
    if (Math.abs(y) > yLimit || isNaN(y)) {
      if (currentPath !== '') paths.push(currentPath)
      currentPath = ''
      continue
    }

    const svgX = toSvgX(x).toFixed(2)
    const svgY = toSvgY(y).toFixed(2)

    if (currentPath === '') {
      currentPath = `M ${svgX} ${svgY}`
    } else {
      currentPath += ` L ${svgX} ${svgY}`
    }
  }
  
  if (currentPath !== '') paths.push(currentPath)
  return paths
})

const svgCalculatedPoints = computed(() => {
    return calculatedPoints.value
        .map(p => {
            const y = parseFloat(p.yStr.replace(',', '.'));
            let color = '#16a34a';
            const isCrit = parsedUserCriticalPoints.value.includes(p.x);
            const isInfl = parsedUserInflectionPoints.value.includes(p.x);
            if (isCrit) color = '#f59e0b';
            else if (isInfl) color = '#8b5cf6';
            return { x: p.x, y, color };
        })
        .filter(p => !isNaN(p.y));
});


// ==================== STEP 6: CALCULATE POINTS ====================
watch([parsedUserCriticalPoints, parsedUserInflectionPoints], ([crit, infl]) => {
  const allPoints = [...new Set([...crit, ...infl])].sort((a,b) => a-b);
  
  // Preserve existing user input
  const newCalculatedPoints = allPoints.map(x => {
    const existing = calculatedPoints.value.find(p => p.x === x);
    return {
      x: x,
      yStr: existing ? existing.yStr : ''
    };
  });
  calculatedPoints.value = newCalculatedPoints;
}, { deep: true });

// ==================== CANVAS DRAWING ====================
function setupCanvas() {
  const canvas = sketchpadCanvas.value
  if (!canvas) return
  
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr

  ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#1e293b' // slate-800
}

function getCoords(event) {
    const canvas = sketchpadCanvas.value;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (event.touches && event.touches.length > 0) {
        return {
            x: event.touches[0].clientX - rect.left,
            y: event.touches[0].clientY - rect.top
        };
    }
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}


function startDrawing(event) {
  event.preventDefault();
  isDrawing.value = true
  const { x, y } = getCoords(event)
  if (ctx) {
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
}

function draw(event) {
  event.preventDefault();
  if (!isDrawing.value || !ctx) return
  const { x, y } = getCoords(event)
  ctx.lineTo(x, y)
  ctx.stroke()
}

function stopDrawing() {
  isDrawing.value = false
  if (ctx) ctx.closePath()
}

function clearCanvas() {
    const canvas = sketchpadCanvas.value;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ==================== NAVIGATION & LIFECYCLE ====================
function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

function resetAllInputs() {
    showSolution.value = false;
    userRootsStr.value = '';
    userYInterceptStr.value = '';
    userVAsymptotesStr.value = '';
    userHAsymptotesStr.value = '';
    userCriticalPointsStr.value = '';
    userInflectionPointsStr.value = '';
    calculatedPoints.value = [];
    
    // Reset sign charts
    signChartFPrime.value = [];
    signChartFDoublePrime.value = [];
    signChartBehavior.value = [];
    signChartConcavity.value = [];

    nextTick(() => {
       if (sketchpadCanvas.value) clearCanvas();
    });
}

watch(currentStep, (newStep) => {
  if (analysisSteps[newStep].id === 'schets') {
    setTimeout(setupCanvas, 350)
  }
})

watch(selectedFunc, () => {
    currentStep.value = 0;
    resetAllInputs();
})

watch(() => props.isOpen, (val) => {
  if (val) {
    nextTick(() => document.documentElement.requestFullscreen().catch(() => {}))
  } else if (!val && document.fullscreenElement) {
    document.exitFullscreen()
  }
}, { immediate: true })

onUnmounted(() => {
  if (document.fullscreenElement) document.exitFullscreen()
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans">
      
      <div class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <PhChartLineUp class="text-xl text-white" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Functie-analyse</h1>
            <p class="text-sm text-slate-500">Krommen schetsen met de "Kapstok"-methode</p>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <select v-model="selectedFunc" class="bg-slate-100 border-none rounded-lg px-4 py-2 text-sm font-mono text-slate-700 cursor-pointer focus:ring-2 focus:ring-indigo-500">
            <option v-for="f in MATH_FUNCTIONS" :key="f.id" :value="f">{{ f.expr }}</option>
          </select>
          <button @click="emit('close')" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <PhX weight="bold" class="text-xl" />
          </button>
        </div>
      </div>

      <div class="flex-1 flex overflow-hidden">
        
        <div :class="['bg-white border-r border-slate-200 flex flex-col overflow-y-auto transition-all duration-300', isTekenschemaStep ? 'w-[520px]' : 'w-[420px]']">
          
          <div class="p-4 border-b border-slate-200">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Stap {{ currentStep + 1 }} van {{ analysisSteps.length }}</span>
              <div class="flex gap-1">
                <button @click="prevStep" :disabled="currentStep === 0" class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <PhArrowLeft class="text-lg" />
                </button>
                <button @click="nextStep" :disabled="currentStep === analysisSteps.length - 1" class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <PhArrowRight class="text-lg" />
                </button>
              </div>
            </div>
            <h2 class="text-lg font-bold text-slate-800 mb-1">{{ analysisSteps[currentStep].title }}</h2>
            <p class="text-sm text-slate-600">{{ analysisSteps[currentStep].description }}</p>
          </div>

          <div class="p-6 flex-1">
            <!-- Step 1 -->
            <div v-if="analysisSteps[currentStep].id === 'intercepten'" class="space-y-4">
              <label class="block">
                <span class="text-sm font-medium text-slate-700">X-intercepten (nulpunten)</span>
                <input type="text" v-model="userRootsStr" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="-2, 0, 2">
              </label>
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Y-intercept (y=...)</span>
                <input type="text" v-model="userYInterceptStr" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="0">
              </label>
            </div>
            <!-- Step 2 -->
            <div v-else-if="analysisSteps[currentStep].id === 'asymptoten'" class="space-y-4">
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Verticale asymptoten (x=...)</span>
                <input type="text" v-model="userVAsymptotesStr" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="-1, 1">
              </label>
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Horizontale asymptoten (y=...)</span>
                <input type="text" v-model="userHAsymptotesStr" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="0">
              </label>
            </div>
            <!-- Step 3 -->
            <div v-else-if="analysisSteps[currentStep].id === 'eersteAfgeleide'" class="space-y-4">
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Kritieke punten (x-waarden)</span>
                <input type="text" v-model="userCriticalPointsStr" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="-1.73, 1.73">
              </label>
            </div>
            <!-- Step 4 -->
            <div v-else-if="analysisSteps[currentStep].id === 'tweedeAfgeleide'" class="space-y-4">
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Mogelijke buigpunten (x-waarden)</span>
                <input type="text" v-model="userInflectionPointsStr" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="0">
              </label>
            </div>
            <!-- Step 5 & 7: Tekenschema & Schets -->
            <div v-else-if="analysisSteps[currentStep].id === 'tekenschema' || analysisSteps[currentStep].id === 'schets'">
              
              <div v-if="analysisSteps[currentStep].id === 'schets'" class="space-y-4 mb-6">
                 <p class="text-sm text-slate-500">Gebruik de "kapstok"-elementen op de grafiek en je tekenschema om de vorm van de curve te schetsen.</p>
                 <button @click="clearCanvas" class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg">
                    <PhEraser /> Wis schets
                 </button>
                 <button @click="showSolution = !showSolution" class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">
                     <PhCheckCircle /> {{ showSolution ? 'Verberg correcte grafiek' : 'Toon correcte grafiek' }}
                 </button>
                 <h3 class="text-sm font-bold text-slate-700 mt-6 border-t border-slate-200 pt-4">Jouw Tekenschema:</h3>
              </div>

              <div v-if="fPrimeAllPoints.length === 0 && fDoublePrimeAllPoints.length === 0" class="text-sm text-slate-500 p-4 bg-slate-100 rounded-lg">
                Vul eerst kritieke punten (stap 3), buigpunten (stap 4), of verticale asymptoten (stap 2) in.
              </div>
              
              <div v-else class="sign-table" :class="{'pointer-events-none opacity-90': analysisSteps[currentStep].id === 'schets'}">
                <!-- ===== F'(X) SECTION ===== -->
                <div v-if="fPrimeAllPoints.length > 0" class="derivative-section">
                  <!-- Critical points badges only (TOP) - show critical and critical-asymptote -->
                  <div class="points-row">
                    <div class="row-label"></div>
                    <div class="points-track">
                      <div class="point-spacer"></div>
                      <template v-for="(pt, i) in fPrimeAllPoints" :key="`fp-badge-${i}`">
                        <div class="point-marker">
                          <span v-if="pt.type === 'critical' || pt.type === 'critical-asymptote'" class="x-badge x-critical">x={{ pt.x }}</span>
                          <span v-else class="x-badge x-badge-placeholder"></span>
                        </div>
                        <div class="point-spacer"></div>
                      </template>
                    </div>
                  </div>
                  
                  <!-- f'(x) data row -->
                  <div class="data-row">
                    <div class="row-label">f'(x)</div>
                    <div class="cells-track">
                      <template v-for="(_, i) in signChartFPrime" :key="`fp-${i}`">
                        <div class="interval-cell interval-cell-fp">
                          <select v-model="signChartFPrime[i]" class="sel-sign">
                            <option>+</option><option>-</option><option>0</option><option>DNE</option>
                          </select>
                          <select v-model="signChartBehavior[i]" class="sel-behavior">
                            <option value="↗">↗</option>
                            <option value="↘">↘</option>
                          </select>
                        </div>
                        <div v-if="i < fPrimeAllPoints.length" 
                             :class="['divider', fPrimeAllPoints[i].type === 'asymptote' || fPrimeAllPoints[i].type === 'critical-asymptote' ? 'divider-asymptote' : '']"></div>
                      </template>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-row">Geen kritieke punten of asymptoten ingevoerd</div>
                
                <!-- ===== NUMBER LINE WITH ASYMPTOTE BADGES ===== -->
                <div class="number-line">
                  <div class="row-label"></div>
                  <div class="line-bar">
                    <span class="arrow-left">◀</span>
                    <span class="arrow-right">▶</span>
                    <!-- Asymptote badges on the number line -->
                    <template v-if="sortedAsymptotes.length > 0 && fPrimeAllPoints.length > 0">
                      <span v-for="(asym, i) in sortedAsymptotes" :key="`asym-badge-${i}`"
                            class="asymptote-badge-wrapper"
                            :style="{ left: getAsymptotePosition(asym) + '%' }">
                        <span class="x-badge x-asymptote">x={{ asym }}</span>
                      </span>
                    </template>
                  </div>
                </div>

                <!-- ===== F''(X) SECTION ===== -->
                <div v-if="fDoublePrimeAllPoints.length > 0" class="derivative-section">
                  <!-- f''(x) data row - flex-sized cells with inline dividers -->
                  <div class="data-row">
                    <div class="row-label">f''(x)</div>
                    <div class="cells-track">
                      <template v-for="(_, i) in signChartFDoublePrime" :key="`fpp-${i}`">
                        <div class="interval-cell interval-cell-fpp" :style="{ flex: fDoublePrimeFlexValues[i] }">
                          <select v-model="signChartFDoublePrime[i]" class="sel-sign">
                            <option>+</option><option>-</option><option>0</option><option>DNE</option>
                          </select>
                          <select v-model="signChartConcavity[i]" class="sel-behavior">
                            <option value="∪">∪</option>
                            <option value="∩">∩</option>
                          </select>
                        </div>
                        <div v-if="i < fDoublePrimeAllPoints.length" 
                             :class="['divider', fDoublePrimeAllPoints[i].type === 'asymptote' || fDoublePrimeAllPoints[i].type === 'inflection-asymptote' ? 'divider-asymptote' : '']"></div>
                      </template>
                    </div>
                  </div>
                  
                  <!-- Inflection points badges only (BOTTOM) - show inflection and inflection-asymptote -->
                  <div class="points-row">
                    <div class="row-label"></div>
                    <div class="points-track">
                      <template v-for="(flexVal, i) in fDoublePrimeFlexValues" :key="`fpp-spacer-${i}`">
                        <div class="point-spacer" :style="{ flex: flexVal }"></div>
                        <template v-if="i < fDoublePrimeAllPoints.length">
                          <div class="point-marker">
                            <span v-if="fDoublePrimeAllPoints[i].type === 'inflection' || fDoublePrimeAllPoints[i].type === 'inflection-asymptote'" class="x-badge x-inflection">x={{ fDoublePrimeAllPoints[i].x }}</span>
                            <span v-else class="x-badge x-badge-placeholder"></span>
                          </div>
                        </template>
                      </template>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-row">Geen buigpunten of asymptoten ingevoerd</div>
              </div>
            </div>
            <!-- Step 6 -->
            <div v-else-if="analysisSteps[currentStep].id === 'puntenBerekenen'" class="space-y-4">
              <div v-if="calculatedPoints.length === 0" class="text-sm text-slate-500 p-4 bg-slate-100 rounded-lg">
                Vul eerst kritieke punten of buigpunten in bij stap 3 en 4.
              </div>
              <div v-else class="space-y-3">
                 <div v-for="(point, index) in calculatedPoints" :key="`calc-point-${index}`" class="flex items-center gap-2">
                    <span class="font-mono text-slate-800 font-medium">( {{ point.x }} ,</span>
                    <input type="text" v-model="point.yStr" class="block w-24 rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-center font-mono" placeholder="y">
                    <span class="font-mono text-slate-800 font-medium">)</span>
                 </div>
              </div>
            </div>
            <!-- Step 7 removed (combined with Step 5) -->
          </div>
        </div>

        <div class="flex-1 bg-slate-100 p-6 flex flex-col relative">
          <!-- Legend overlay -->
          <div class="absolute top-10 right-10 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-slate-200 text-xs flex flex-col gap-2 z-10 pointer-events-none">
            <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-[#3b82f6]"></div><span class="text-slate-700 font-medium">Intercepten</span></div>
            <div class="flex items-center gap-2">
              <div class="flex gap-1">
                <div class="w-3 h-3 border-2 border-[#f59e0b] rounded-full"></div>
                <div class="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
              </div>
              <span class="text-slate-700 font-medium">Kritiek punt (geschat/exact)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex gap-1">
                <div class="w-3 h-3 border-2 border-[#8b5cf6] border-dashed rounded-full"></div>
                <div class="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
              </div>
              <span class="text-slate-700 font-medium">Buigpunt (geschat/exact)</span>
            </div>
            <div class="flex items-center gap-2"><div class="w-4 h-0 border-b-2 border-dashed border-[#3b82f6]"></div><span class="text-slate-700 font-medium">Asymptoten</span></div>
            <div class="flex items-center gap-2"><div class="w-4 h-0 border-b-2 border-[#10B981]"></div><span class="text-slate-700 font-medium">Oplossing grafiek</span></div>
          </div>

          <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-full absolute inset-0" preserveAspectRatio="xMidYMid slice">
              <!-- Minor Grid (every 0.2 units) -->
              <g stroke="#f1f5f9" stroke-width="1">
                <line v-for="i in 61" :key="`minor-v${i}`" :x1="toSvgX(viewBoxX + (i-1)*0.2)" y1="0" :x2="toSvgX(viewBoxX + (i-1)*0.2)" :y2="svgHeight" />
                <line v-for="i in 61" :key="`minor-h${i}`" x1="0" :y1="toSvgY(viewBoxY + (i-1)*0.2)" :x2="svgWidth" :y2="toSvgY(viewBoxY + (i-1)*0.2)" />
              </g>
              <!-- Major Grid (every 1 unit) -->
              <g stroke="#cbd5e1" stroke-width="1">
                <line v-for="i in 13" :key="`major-v${i}`" :x1="toSvgX(viewBoxX + (i-1))" y1="0" :x2="toSvgX(viewBoxX + (i-1))" :y2="svgHeight" />
                <line v-for="i in 13" :key="`major-h${i}`" x1="0" :y1="toSvgY(viewBoxY + (i-1))" :x2="svgWidth" :y2="toSvgY(viewBoxY + (i-1))" />
              </g>
              <!-- Axes -->
              <line :x1="toSvgX(0)" y1="0" :x2="toSvgX(0)" :y2="svgHeight" stroke="#64748B" stroke-width="2" />
              <line x1="0" :y1="toSvgY(0)" :x2="svgWidth" :y2="toSvgY(0)" stroke="#64748B" stroke-width="2" />
              
              <!-- Axes Numbers -->
              <g fill="#64748B" font-size="12" class="font-sans font-medium pointer-events-none select-none">
                <!-- X axis numbers -->
                <template v-for="i in 13" :key="`label-x-${i}`">
                  <text v-if="(viewBoxX + i - 1) !== 0" :x="toSvgX(viewBoxX + i - 1)" :y="toSvgY(0) + 16" text-anchor="middle">
                    {{ viewBoxX + i - 1 }}
                  </text>
                </template>
                <!-- Y axis numbers -->
                <template v-for="i in 13" :key="`label-y-${i}`">
                  <text v-if="(viewBoxY + i - 1) !== 0" :x="toSvgX(0) + 6" :y="toSvgY(viewBoxY + i - 1)" dominant-baseline="central">
                    {{ viewBoxY + i - 1 }}
                  </text>
                </template>
                <!-- Origin -->
                <text :x="toSvgX(0) - 6" :y="toSvgY(0) + 14" text-anchor="end">0</text>
              </g>

              <!-- User-provided asymptotes ("Kapstok") -->
              <line v-for="v in parsedUserVAsymptotes" :key="`user-v-asy-${v}`"
                    :x1="toSvgX(v)" y1="0" :x2="toSvgX(v)" :y2="svgHeight"
                    stroke="#3b82f6" stroke-width="2" stroke-dasharray="6,4" />
              <line v-for="h in parsedUserHAsymptotes" :key="`user-h-asy-${h}`"
                    x1="0" :y1="toSvgY(h)" :x2="svgWidth" :y2="toSvgY(h)"
                    stroke="#3b82f6" stroke-width="2" stroke-dasharray="6,4" />

              <!-- User-provided intercepts ("Kapstok") -->
              <circle v-for="r in parsedUserRoots" :key="`user-root-${r}`"
                      :cx="toSvgX(r)" :cy="toSvgY(0)" r="6" fill="#3b82f6" />
              <circle v-if="!isNaN(parsedUserYIntercept)" :cx="toSvgX(0)" :cy="toSvgY(parsedUserYIntercept)" r="6" fill="#3b82f6" />

              <!-- User-provided critical points (preview markers - hide when y-coordinate entered or solution shown) -->
              <template v-if="!showSolution">
                <circle v-for="c in criticalPointsWithoutY" :key="`user-crit-${c}`"
                        :cx="toSvgX(c)" :cy="toSvgY(0)" r="8" fill="none" stroke="#f59e0b" stroke-width="2" />
              </template>
                      
              <!-- User-provided inflection points (preview markers - hide when y-coordinate entered or solution shown) -->
              <template v-if="!showSolution">
                <circle v-for="i in inflectionPointsWithoutY" :key="`user-infl-${i}`"
                        :cx="toSvgX(i)" :cy="toSvgY(0)" r="8" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="3,3" />
              </template>

              <!-- User-calculated points -->
               <circle v-for="(p, index) in svgCalculatedPoints" :key="`user-calc-${index}`"
                      :cx="toSvgX(p.x)" :cy="toSvgY(p.y)" r="6" :fill="p.color" />


              <!-- Solution Graph (conditionally rendered) -->
              <g v-if="showSolution">
                <path v-for="(pathStr, index) in functionPaths" :key="`path-${index}`"
                  :d="pathStr" fill="none" stroke="#10B981" stroke-width="3"
                  stroke-linecap="round" stroke-linejoin="round"
                />
              </g>
            </svg>
            
            <canvas v-if="analysisSteps[currentStep].id === 'schets'" 
              ref="sketchpadCanvas" 
              class="w-full h-full absolute inset-0 canvas-cursor"
              @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing"
              @touchstart.prevent="startDrawing" @touchmove.prevent="draw" @touchend="stopDrawing" @touchcancel="stopDrawing"
            ></canvas>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.canvas-cursor {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M11 2h2v20h-2zM2 11h20v2H2z" fill="black"/></svg>') 12 12, crosshair;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
select {
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  text-align: center;
}

/* ===== Sign Table - Clean Rewrite ===== */
.sign-table {
  background: white;
  border: 2px solid #1f2937;
  border-radius: 8px;
  padding: 16px;
  font-family: ui-monospace, monospace;
}

.derivative-section {
  display: flex;
  flex-direction: column;
}

/* Row label (f'(x), f''(x)) */
.row-label {
  width: 50px;
  flex-shrink: 0;
  font-weight: bold;
  font-size: 14px;
  color: #1f2937;
  text-align: right;
  padding-right: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* ===== Points Row (badges) ===== */
.points-row {
  display: flex;
}

.points-track {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.point-spacer {
  flex: 1;
}

.point-marker {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* X-value badges */
.x-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.x-badge-placeholder {
  visibility: hidden;
  padding: 3px 8px;
}

.x-critical {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #f59e0b;
}

.x-inflection {
  background: #ede9fe;
  color: #6d28d9;
  border: 1px solid #8b5cf6;
}

.x-asymptote {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #ef4444;
}

/* ===== Data Row (dropdowns) ===== */
.data-row {
  display: flex;
  align-items: stretch;
}

.cells-track {
  flex: 1;
  display: flex;
  align-items: stretch;
}

/* For f''(x): relative container for absolute positioning */
.cells-track-relative {
  flex: 1;
  position: relative;
}

.cells-flex {
  display: flex;
  align-items: stretch;
  height: 100%;
}

.points-track-relative {
  flex: 1;
  position: relative;
  height: 24px;
}

.badge-absolute {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
}

.divider-absolute {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #1f2937;
  transform: translateX(-50%);
}

.interval-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 6px;
}

/* f'(x) cells: align edge cells toward their divider */
.interval-cell-fp:first-child {
  align-items: flex-end; /* push right toward divider */
}

.interval-cell-fp:last-child {
  align-items: flex-start; /* push left toward divider */
}

/* f''(x) cells: align content toward the divider */
.interval-cell-fpp:first-child {
  align-items: flex-end; /* push right toward divider */
}

.interval-cell-fpp:last-child {
  align-items: flex-start; /* push left toward divider */
}

.divider {
  width: 2px;
  background: #1f2937;
  flex-shrink: 0;
}

.divider-asymptote {
  background: #ef4444;
  border-left: 1px dashed #ef4444;
  border-right: 1px dashed #ef4444;
  width: 3px;
}

/* ===== Number Line ===== */
.number-line {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.line-bar {
  flex: 1;
  height: 3px;
  background: #1f2937;
  position: relative;
}

.asymptote-badge-wrapper {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}

.arrow-left, .arrow-right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #1f2937;
}

.arrow-left {
  left: -2px;
}

.arrow-right {
  right: -2px;
}

/* ===== Select Inputs ===== */
.sel-sign {
  width: 48px;
  padding: 4px;
  font-size: 16px;
  font-weight: bold;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.sel-behavior {
  width: 44px;
  padding: 4px;
  font-size: 18px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #f9fafb;
  cursor: pointer;
  color: #4b5563;
}

/* ===== Empty State ===== */
.empty-row {
  text-align: center;
  padding: 12px;
  color: #9ca3af;
  font-size: 13px;
  font-style: italic;
}
</style>