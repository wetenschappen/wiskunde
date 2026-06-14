An updated version of the Vue component is below.

I have improved the user experience by:
-      **Adding smooth animations** for tab transitions, feedback messages (like a 'shake' for incorrect answers and a 'tada' for correct ones), and making UI elements more responsive to interaction.
-      **Enhancing visual feedback** with styled focus states, animated value changes, and clearer visual cues for interactive elements.
-      **Refining the layout and styling** using Tailwind CSS to create a more modern and cohesive look, including gradients, shadows, and improved interactive states for buttons and inputs.
-      **Improving the "Rico Help" animation**, making the animated character move smoothly across the graph for a more polished and intuitive explanation.


<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Scatter } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  ScatterController,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { PhX, PhFlask, PhCaretRight, PhSlidersHorizontal, PhTable, PhMathOperations, PhPencilSimple, PhCheckCircle, PhXCircle, PhQuestion, PhGraph, PhArrowClockwise } from '@phosphor-icons/vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  ScatterController,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Veerkracht & Uitrekking'
  },
  fullscreen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'complete'])

// ──────────────────────────────────────
// TABS STATE
// ──────────────────────────────────────
const activeTab = ref(0) // 0: Metingen, 1: Afleiding, 2: Verken k, 3: Oefening

// ──────────────────────────────────────
// DATA STATE (Editable)
// ──────────────────────────────────────
const generateEmptySpring = (defaultRatio) => {
  return [
    { id: 1, force: 1.0, extension: 1.0 / defaultRatio },
    { id: 2, force: 2.0, extension: 2.0 / defaultRatio },
    { id: 3, force: 3.0, extension: 3.0 / defaultRatio },
    { id: 4, force: 4.0, extension: 4.0 / defaultRatio }
  ]
}

const spring1Data = ref(generateEmptySpring(10))
const spring2Data = ref(generateEmptySpring(20))

// Helper to convert to number safely
const parseVal = (val) => {
  if (val === null || val === '') return NaN
  let str = String(val).replace(',', '.')
  return parseFloat(str)
}

const calcRatio = (f, e) => {
  const force = parseVal(f)
  const ext = parseVal(e)
  if (!isNaN(force) && !isNaN(ext) && ext !== 0) {
    return (force / ext).toFixed(0)
  }
  return '-'
}

const getAverageK = (data) => {
  let sum = 0
  let count = 0
  data.forEach(d => {
    const f = parseVal(d.force)
    const e = parseVal(d.extension)
    if (!isNaN(f) && !isNaN(e) && e > 0) {
      sum += (f / e)
      count++
    }
  })
  return count > 0 ? sum / count : 0
}

const k1 = computed(() => getAverageK(spring1Data.value))
const k2 = computed(() => getAverageK(spring2Data.value))

// Animation for K value change
const k1Display = ref(null)
const k2Display = ref(null)
watch(k1, () => {
    if(k1Display.value) {
        k1Display.value.classList.add('flash-bg')
        setTimeout(() => k1Display.value.classList.remove('flash-bg'), 700)
    }
})
watch(k2, () => {
    if(k2Display.value) {
        k2Display.value.classList.add('flash-bg')
        setTimeout(() => k2Display.value.classList.remove('flash-bg'), 700)
    }
})


// ──────────────────────────────────────
// STEPPER STATE (Tab 2)
// ──────────────────────────────────────
const currentStep = ref(0)
const totalSteps = 5

const steps = [
  {
    title: 'Algemeen lineair verband',
    formula: 'y = a · x + b',
    explanation: 'Elk lineair verband kan beschreven worden met de vergelijking y = ax + b, met a de richtingscoëfficiënt en b het snijpunt met de y-as.'
  },
  {
    title: 'Door de oorsprong',
    formula: 'b = 0  →  y = a · x',
    explanation: 'De grafiek gaat door de oorsprong. Dit betekent dat b = 0. Er is logischerwijs geen uitrekking als er geen kracht op de veer is.'
  },
  {
    title: 'Variabelen invullen',
    formula: 'Fᵥ = a · Δℓ',
    explanation: 'Vervang y door de veerkracht Fᵥ (in N) en x door de uitrekking Δℓ (in m). De richtingscoëfficiënt a is de toename van de kracht per meter uitrekking.'
  },
  {
    title: 'De veerconstante k',
    formula: 'Fᵥ = k · Δℓ',
    explanation: 'De richtingscoëfficiënt a noemen we de veerconstante k. Dit staat gekend als de Wet van Hooke. Hoe groter k, hoe stugger de veer.'
  },
  {
    title: 'Waarden aflezen',
    formula: 'Fᵥ / Δℓ = k',
    explanation: `Kijken we naar de tabellen, dan zien we dat Fᵥ/Δℓ constant is. Voor onze data is k₁ ≈ ${Math.round(k1.value)} N/m en k₂ ≈ ${Math.round(k2.value)} N/m.`
  }
]

const derivationComplete = computed(() => currentStep.value >= totalSteps)

function nextStep() {
  if (currentStep.value < totalSteps) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

// ──────────────────────────────────────
// SLIDER STATE (Tab 3)
// ──────────────────────────────────────
const selectedSpringForSlider = ref(1) // 1 of 2
const sliderK1 = ref(10)
const sliderK2 = ref(20)

// Sliders are independent. 
// k1 and k2 from the table are used for Tab 1/2.
// sliderK's are used for Tab 3.
// exK's are used for Tab 4.

// ──────────────────────────────────────
// OEFENING STATE (Tab 4)
// ──────────────────────────────────────
const possibleKValues = [10, 12, 15, 20, 24, 25, 30, 40, 50]
const getRandomNiceK = () => possibleKValues[Math.floor(Math.random() * possibleKValues.length)]

const exK1 = ref(10)
const exK2 = ref(25)
const guess1 = ref('')
const guess2 = ref('')
const showFeedback = ref(false)
const feedbackState = ref('') // '', 'correct', 'incorrect'


const guess1Correct = computed(() => parseInt(guess1.value) === exK1.value)
const guess2Correct = computed(() => parseInt(guess2.value) === exK2.value)
const isCorrect = computed(() => guess1Correct.value && guess2Correct.value)

const feedbackAnimationClass = computed(() => {
    if (!showFeedback.value) return ''
    return isCorrect.value ? 'animate-tada' : 'animate-shake'
})

const guess1InputClass = computed(() => {
    if (!showFeedback.value) return 'border-slate-300'
    return guess1Correct.value ? 'border-emerald-500 ring-emerald-200' : 'border-red-500 ring-red-200'
})
const guess2InputClass = computed(() => {
    if (!showFeedback.value) return 'border-slate-300'
    return guess2Correct.value ? 'border-emerald-500 ring-emerald-200' : 'border-red-500 ring-red-200'
})

function checkAnswers() {
    showFeedback.value = true
}

function newExercise() {
    let newK1 = getRandomNiceK()
    let newK2 = getRandomNiceK()
    while (newK1 === newK2) {
      newK2 = getRandomNiceK()
    }
    // Always make K2 the steeper one to avoid crossing lines mostly
    exK1.value = Math.min(newK1, newK2)
    exK2.value = Math.max(newK1, newK2)
    
    guess1.value = ''
    guess2.value = ''
    showFeedback.value = false
}

// Generate once on mount
onMounted(() => {
    newExercise()
})

// ──────────────────────────────────────
// CHART DATA
// ──────────────────────────────────────
const chartData = computed(() => {
  const maxExtension = 0.45

  // In Tab 3, we use slider K values. In Tab 4 (index 3), we use random K values.
  const currentK1 = activeTab.value === 2 ? sliderK1.value : (activeTab.value === 3 ? exK1.value : k1.value)
  const currentK2 = activeTab.value === 2 ? sliderK2.value : (activeTab.value === 3 ? exK2.value : k2.value)

  let scatter1, scatter2;
  if (activeTab.value === 2) {
    // Standard set of forces for comparison (mirroring the exercise tab's logic)
    const forces = [2, 4, 6, 8, 10]
    scatter1 = forces.map(y => ({ x: y / currentK1, y }))
    scatter2 = forces.map(y => ({ x: y / currentK2, y }))
  } else if (activeTab.value === 3) {
    // Voor de oefening willen we meetpunten die 'mooi' vallen op het rooster.
    // De grafiek heeft ticks om de 1 N op de Y-as en 0.05 m op de X-as.
    // We zoeken krachten (y) waarbij x = y/k een veelvoud is van 0.01 of 0.05.
    const findNicePoints = (k) => {
        // Om altijd gegarandeerd minstens één perfect afleesbaar rasterpunt te hebben,
        // gebruiken we vaste, mooi verdeelde x-coördinaten afhankelijk van de veerconstante.
        let xs;
        if (k === 12 || k === 24) {
            // k=12 en k=24 hebben hun eerste en énige perfecte Y-hele getal op x = 0.25m
            xs = [0.05, 0.15, 0.25, 0.35];
        } else {
            // Alle overige k-waarden (10, 15, 20, 25, 30, 40, 50) vallen 
            // perfect op de hele getallen bij één of meerdere van deze x-punten.
            xs = [0.10, 0.20, 0.30, 0.40];
        }
        
        // Exporteer ze als punten zolang ze binnen de grafiekhoogte vallen
        return xs.map(x => ({ x, y: x * k })).filter(p => p.y <= currentYMax.value * 0.98);
    };

    scatter1 = findNicePoints(currentK1);
    scatter2 = findNicePoints(currentK2);
  } else {
    scatter1 = spring1Data.value.map(d => ({ x: parseVal(d.extension), y: parseVal(d.force) })).filter(p => !isNaN(p.x) && !isNaN(p.y))
    scatter2 = spring2Data.value.map(d => ({ x: parseVal(d.extension), y: parseVal(d.force) })).filter(p => !isNaN(p.x) && !isNaN(p.y))
  }

  const line1 = [
    { x: 0, y: 0 },
    { x: maxExtension, y: currentK1 * maxExtension }
  ]
  const line2 = [
    { x: 0, y: 0 },
    { x: maxExtension, y: currentK2 * maxExtension }
  ]

  const datasets = [
    {
      label: 'Veer 1 - punten',
      data: scatter1,
      backgroundColor: '#3B82F6', // Blue
      borderColor: '#2563EB',
      pointRadius: 6,
      pointHoverRadius: 8,
      showLine: false
    },
    {
      label: activeTab.value === 3 ? 'Veer 1' : `Veer 1 (k ≈ ${Math.round(currentK1)} N/m)`,
      data: line1,
      type: 'line',
      borderColor: '#3B82F6',
      backgroundColor: 'transparent',
      borderWidth: 3,
      pointRadius: 0,
      tension: 0,
      borderDash: activeTab.value === 2 && selectedSpringForSlider.value === 1 ? [8, 4] : []
    },
    {
      label: 'Veer 2 - punten',
      data: scatter2,
      backgroundColor: '#EC4899', // Pink
      borderColor: '#DB2777',
      pointRadius: 6,
      pointHoverRadius: 8,
      showLine: false
    },
    {
      label: activeTab.value === 3 ? 'Veer 2' : `Veer 2 (k ≈ ${Math.round(currentK2)} N/m)`,
      data: line2,
      type: 'line',
      borderColor: '#EC4899',
      backgroundColor: 'transparent',
      borderWidth: 3,
      pointRadius: 0,
      tension: 0,
      borderDash: activeTab.value === 2 && selectedSpringForSlider.value === 2 ? [8, 4] : []
    }
  ]
  
  return { datasets }
})

// ──────────────────────────────────────
// CHART SCALING LOGIC
// ──────────────────────────────────────
const currentYMax = computed(() => {
    if (activeTab.value === 3) {
        // Oefening: Schaal dynamisch zodat de hele lijn (tot 0.45m) zichtbaar is.
        const maxY = Math.max(exK1.value * 0.45, exK2.value * 0.45)
        let val = Math.ceil(maxY / 2) * 2
        return Math.max(val, 12)
    } else if (activeTab.value === 2) {
        // Lab: Vast op 12N
        return 12 
    } else {
        // Tab 1 & 2: Schaal op basis van invoergegevens
        const forces1 = spring1Data.value.map(d => parseVal(d.force)).filter(f => !isNaN(f))
        const forces2 = spring2Data.value.map(d => parseVal(d.force)).filter(f => !isNaN(f))
        const allForces = [...forces1, ...forces2]
        const maxInputF = allForces.length > 0 ? Math.max(...allForces) : 4.5
        return Math.max(maxInputF, 4.5)
    }
})

// CHART OPTIONS
const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500, easing: 'easeOutQuart' },
    plugins: {
        legend: {
          display: false // We will use a custom legend if needed
        },
        tooltip: {
          
          backgroundColor: '#1E293B',
          titleFont: { weight: 'bold', family: 'inherit' },
          bodyFont: { family: 'inherit' },
          padding: 12,
          cornerRadius: 8,
          boxPadding: 4,
          callbacks: {
              label: (ctx) => ` Fᵥ: ${ctx.parsed.y.toFixed(1)} N, Δℓ: ${ctx.parsed.x.toFixed(2)} m`
          }
        }
    },
    scales: {
        x: {
            title: { display: true, text: 'Δℓ (m)', font: { weight: 'bold', size: 13, family: 'inherit' }, color: '#475569' },
            beginAtZero: true,
            max: 0.45,
            ticks: { stepSize: 0.05, font: { family: 'inherit' } },
            grid: { color: '#E2E8F0' }
        },
        y: {
            title: { display: true, text: 'Fᵥ (N)', font: { weight: 'bold', size: 13, family: 'inherit' }, color: '#475569' },
            beginAtZero: true,
            max: currentYMax.value,
            ticks: { stepSize: currentYMax.value > 15 ? 2 : 1, font: { family: 'inherit' } },
            grid: { color: '#E2E8F0' }
        }
    }
  }
})

// ──────────────────────────────────────
// HANDLERS
// ──────────────────────────────────────
function handleClose() { emit('close') }
function handleComplete() { emit('complete') }

// ──────────────────────────────────────
// RICO HELP ANIMATION
// ──────────────────────────────────────
const showRicoHelp = ref(false)
const ricoStep    = ref(0)
const ricoSpring  = ref(1)   // 1 = blauw, 2 = roze

// SVG layout constants (viewBox 310 x 218)
const ORIG_X  = 50
const ORIG_Y  = 190
const SCALE_X = 566.6   // px per meter  (255px / 0.45m)
const SCALE_Y = computed(() => 175 / currentYMax.value)

// Hulplijnen op de Y-as voor de Help SVG
const ricoYTicks = computed(() => {
  const max = currentYMax.value
  const step = max > 18 ? 4 : 2
  const ticks = []
  for (let i = step; i <= max; i += step) ticks.push(i)
  return ticks
})

// Kies een mooi afleesbaar punt voor veerconstante k
function getNicePoint(k) {
  // We zoeken een punt y/k dat op een veelvoud van 0.05m ligt
  const searchMax = Math.floor(currentYMax.value * 0.85)
  const candidates = [4, 6, 8, 3, 10, 12, 16, 2, 5].filter(c => c <= searchMax)
  for (const y of candidates) {
    const x       = y / k
    const rounded = Math.round(x * 20) / 20
    if (Math.abs(rounded - x) < 0.0002 && rounded >= 0.05 && rounded <= 0.40) {
      return { x: rounded, y }
    }
  }
  return { x: +(2 / k).toFixed(2), y: 2 } 
}

const ricoPoint  = computed(() => getNicePoint(ricoSpring.value === 1 ? exK1.value : exK2.value))
const ricoK      = computed(() => ricoSpring.value === 1 ? exK1.value : exK2.value)
const ricoColor  = computed(() => ricoSpring.value === 1 ? '#3B82F6' : '#EC4899')
const ricoLabel  = computed(() => ricoSpring.value === 1 ? 'Veer 1 (blauw)' : 'Veer 2 (roze)')
const ricoHdrCls = computed(() => 'from-amber-500 to-amber-600')

// SVG-coördinaten van het doelpunt
const tgtSvgX = computed(() => ORIG_X + ricoPoint.value.x * SCALE_X)
const tgtSvgY = computed(() => ORIG_Y - ricoPoint.value.y * SCALE_Y.value)

// Emoji positie: stap 0 → oorsprong, stap 1 → omhoog (rise), stap 2 → rechts (run)
const emojiX = computed(() => ricoStep.value >= 2 ? tgtSvgX.value : ORIG_X)
const emojiY = computed(() => ricoStep.value >= 1 ? tgtSvgY.value : ORIG_Y)

let ricoTimers = []
function openRicoHelp(spring) {
  ricoSpring.value = spring
  showRicoHelp.value = true
  replayRico(true)
}
function replayRico(isOpening = false) {
  ricoStep.value = 0
  ricoTimers.forEach(clearTimeout)
  ricoTimers = []
  const timings = isOpening 
    ? [700, 2100, 3800, 5200, 6400] 
    : [300, 1700, 3400, 4800, 6000]
  
  timings.forEach((ms, i) => {
    ricoTimers.push(setTimeout(() => { ricoStep.value = i + 1 }, ms))
  })
}
function closeRicoHelp() {
  showRicoHelp.value = false
  ricoStep.value = 0
  ricoTimers.forEach(clearTimeout)
  ricoTimers = []
}

const showPulse = ref(false)

// FULLSCREEN LOGIC
watch(() => props.isOpen, (val) => {
    if (!val) {
        if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
        window.removeEventListener('keydown', handleKeydown)
        showPulse.value = false
    } else {
        window.addEventListener('keydown', handleKeydown)
        
        nextTick(() => {
            showPulse.value = true
            setTimeout(() => { showPulse.value = false }, 2000)
        })

        if (props.fullscreen) {
            nextTick(() => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(e => {})
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
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-0 font-sans">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="handleClose"></div>
    <div class="relative bg-white shadow-2xl overflow-hidden flex flex-col w-screen h-screen rounded-none"
         @click.stop>

      <!-- HEADER WITH TABS -->
      <div class="bg-gradient-to-r from-amber-600 to-amber-700 shrink-0 shadow-lg z-10">
        <!-- Top row: Title and close -->
        <div class="px-6 py-3 flex justify-between items-center">
            <div class="flex items-center gap-3">
            <div class="bg-white/20 p-2.5 rounded-lg text-white">
                <PhFlask weight="fill" class="text-xl"/>
            </div>
            <div>
                <h3 class="text-lg font-bold text-white m-0">{{ title }}</h3>
                <p class="text-xs text-amber-100 m-0">Wet van Hooke - Verband tussen kracht en uitrekking</p>
            </div>
            </div>
            <button @click="handleClose" 
                    class="text-white/70 hover:text-white p-2 rounded-full transition-all relative group">
                <span v-if="showPulse" class="animate-pulse-once absolute inset-0 rounded-full bg-white/25"></span>
                <PhX class="text-2xl relative" />
            </button>
        </div>
        
        <!-- Tabs Row -->
        <div class="flex px-6 items-end">
            <button 
                v-for="(tab, index) in ['Metingen & Grafiek', 'Afleiding', 'Verken veerkracht', 'Oefening']"
                :key="index"
                @click="activeTab = index" 
                class="flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-4 transition-all duration-300 rounded-t-lg transform"
                :class="activeTab === index 
                    ? 'bg-slate-50 border-amber-500 text-amber-600' 
                    : 'border-transparent text-amber-100 hover:bg-white/10 hover:-translate-y-0.5'"
            >
                <component :is="[PhTable, PhMathOperations, PhSlidersHorizontal, PhPencilSimple][index]" class="text-lg" />
                {{ index + 1 }}. {{ tab }}
            </button>
        </div>
      </div>

      <!-- BODY -->
      <div class="flex-1 overflow-hidden flex flex-col lg:flex-row">

        <!-- LEFT PANEL: Dynamic Content based on activeTab -->
        <div class="w-full lg:w-5/12 border-r border-slate-200 flex flex-col bg-slate-50 overflow-hidden">
            <Transition name="fade-slide" mode="out-in">
                <div :key="activeTab" class="h-full w-full overflow-y-auto overflow-x-hidden p-5">
                    
                    <!-- TAB 1: DATA TABLES -->
                    <div v-if="activeTab === 0" class="space-y-5">
                        <p class="text-sm text-slate-600 mb-2">Vul gegevens in of wijzig de bestaande waarden. De grafiek update automatisch.</p>
                        
                        <div class="grid grid-cols-1 gap-4">
                        <!-- Veer 1 Table -->
                        <div class="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden">
                            <div class="px-4 py-2.5 bg-blue-50 border-b border-blue-200 flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                            <h4 class="font-bold text-blue-800 text-sm m-0">Veer 1</h4>
                            <span ref="k1Display" class="ml-auto text-xs font-mono text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full transition-all">
                                k ≈ {{ Math.round(k1) }} N/m
                            </span>
                            </div>
                            <table class="w-full text-sm text-center">
                            <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                <th class="px-3 py-2 font-semibold">Fᵥ (N)</th>
                                <th class="px-3 py-2 font-semibold">Δℓ (m)</th>
                                <th class="px-3 py-2 font-semibold">Fᵥ/Δℓ <span class="text-[10px] normal-case text-slate-400">(N/m)</span></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="row in spring1Data" :key="row.id" class="hover:bg-blue-50/50">
                                <td class="p-1.5 w-1/3">
                                    <input v-model="row.force" type="text" class="w-full text-center py-1.5 rounded border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300/50 outline-none font-mono transition-all" />
                                </td>
                                <td class="p-1.5 w-1/3">
                                    <input v-model="row.extension" type="text" class="w-full text-center py-1.5 rounded border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300/50 outline-none font-mono transition-all" />
                                </td>
                                <td class="p-1.5 w-1/3 font-mono font-bold text-blue-600 bg-blue-50/50">
                                    {{ calcRatio(row.force, row.extension) }}
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </div>

                        <!-- Veer 2 Table -->
                        <div class="bg-white rounded-xl shadow-sm border border-pink-200 overflow-hidden">
                            <div class="px-4 py-2.5 bg-pink-50 border-b border-pink-200 flex items-center gap-2">
                                <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                                <h4 class="font-bold text-pink-800 text-sm m-0">Veer 2</h4>
                                <span ref="k2Display" class="ml-auto text-xs font-mono text-pink-600 bg-pink-100 px-2.5 py-1 rounded-full transition-all">
                                k ≈ {{ Math.round(k2) }} N/m
                                </span>
                            </div>
                            <table class="w-full text-sm text-center">
                                <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th class="px-3 py-2 font-semibold">Fᵥ (N)</th>
                                    <th class="px-3 py-2 font-semibold">Δℓ (m)</th>
                                    <th class="px-3 py-2 font-semibold">Fᵥ/Δℓ <span class="text-[10px] normal-case text-slate-400">(N/m)</span></th>
                                </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    <tr v-for="row in spring2Data" :key="row.id" class="hover:bg-pink-50/50">
                                    <td class="p-1.5 w-1/3">
                                        <input v-model="row.force" type="text" class="w-full text-center py-1.5 rounded border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-300/50 outline-none font-mono transition-all" />
                                    </td>
                                    <td class="p-1.5 w-1/3">
                                        <input v-model="row.extension" type="text" class="w-full text-center py-1.5 rounded border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-300/50 outline-none font-mono transition-all" />
                                    </td>
                                    <td class="p-1.5 w-1/3 font-mono font-bold text-pink-600 bg-pink-50/50">
                                        {{ calcRatio(row.force, row.extension) }}
                                    </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </div>

                    <!-- TAB 2: STEPPER -->
                    <div v-else-if="activeTab === 1" class="flex flex-col h-full">
                        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
                        <div class="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                            <h4 class="font-bold text-amber-900 text-sm m-0">Recht evenredig verband</h4>
                            <p class="text-xs font-bold text-amber-600 m-0 bg-amber-200/50 px-2 py-0.5 rounded-full">Stap {{ Math.min(currentStep, totalSteps) }} / {{ totalSteps }}</p>
                        </div>

                        <div class="p-4 flex-1 overflow-y-auto space-y-3">
                            <TransitionGroup name="step-fade">
                            <div
                                v-for="(step, i) in steps.slice(0, currentStep)"
                                :key="'step-' + i"
                                class="rounded-lg p-3 transition-all duration-500"
                                :class="i === currentStep - 1 ? 'bg-amber-50 border-2 border-amber-200 scale-[1.02] shadow-md' : 'bg-slate-50 border border-slate-100'"
                            >
                                <div class="flex items-start gap-2">
                                <span
                                    class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                                    :class="i === currentStep - 1 ? 'bg-amber-500 text-white' : 'bg-slate-300 text-white'"
                                >{{ i + 1 }}</span>
                                <div class="flex-1 min-w-0">
                                    <p class="font-bold text-sm text-slate-800 m-0">{{ step.title }}</p>
                                    <div class="my-1.5 bg-white rounded-md px-3 py-2 border border-slate-200 text-center shadow-inner">
                                    <span class="font-mono text-lg font-bold text-amber-600" v-html="step.formula"></span>
                                    </div>
                                    <p class="text-xs text-slate-600 m-0 leading-relaxed">{{ step.explanation }}</p>
                                </div>
                                </div>
                            </div>
                            </TransitionGroup>

                            <div v-if="currentStep === 0" class="flex flex-col items-center justify-center py-10 text-slate-400">
                            <p class="text-sm italic">Hoe komen we tot de formule Fᵥ = k · Δℓ?</p>
                            </div>

                            <div v-if="derivationComplete" class="text-center py-2 animate-tada">
                            <span class="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold px-4 py-2 rounded-full shadow-sm">
                                <PhCheckCircle weight="fill"/> Je hebt de Wet van Hooke ontdekt!
                            </span>
                            </div>
                        </div>
                        
                        <div class="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                            <button
                                @click="prevStep"
                                :disabled="currentStep === 0"
                                class="text-xs font-bold px-3 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 hover:bg-slate-200"
                            >← Vorige</button>
                            <button
                                v-if="!derivationComplete"
                                @click="nextStep"
                                class="flex items-center gap-1 text-sm font-bold px-5 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-400 transition-all shadow-sm transform hover:scale-105"
                            >
                                Volgende
                                <PhCaretRight class="text-lg" />
                            </button>
                            <button
                                v-else
                                @click="activeTab = 2"
                                class="flex items-center gap-1 text-sm font-bold px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-sm transform hover:scale-105"
                            >
                                Verken de grafieken →
                            </button>
                        </div>
                        </div>
                    </div>

                    <!-- TAB 3: SLIDER -->
                    <div v-else-if="activeTab === 2" class="space-y-6">
                        <div class="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
                            <div class="p-5 border-b border-amber-50 bg-amber-50/30">
                                <h4 class="font-bold text-amber-900 text-sm m-0 mb-4 flex items-center gap-2">
                                    <PhSlidersHorizontal class="text-amber-600 text-lg" /> 
                                    Verander de stijfheid van de veren
                                </h4>
                                
                                <div class="grid grid-cols-2 gap-2 mb-6">
                                    <button 
                                        @click="selectedSpringForSlider = 1" 
                                        class="py-2.5 text-sm font-bold rounded-lg border-2 transition-all"
                                        :class="selectedSpringForSlider === 1 ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50/50'"
                                    >
                                        Pas Veer 1 aan
                                    </button>
                                    <button 
                                        @click="selectedSpringForSlider = 2" 
                                        class="py-2.5 text-sm font-bold rounded-lg border-2 transition-all"
                                        :class="selectedSpringForSlider === 2 ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:border-pink-300 hover:bg-pink-50/50'"
                                    >
                                        Pas Veer 2 aan
                                    </button>
                                </div>

                                <Transition name="fade-slide" mode="out-in">
                                <div :key="selectedSpringForSlider" class="space-y-4">
                                    <div v-if="selectedSpringForSlider === 1">
                                        <div class="flex justify-between items-center text-xs font-bold text-blue-600">
                                            <span>Minder stug</span>
                                            <span>Stugger</span>
                                        </div>
                                        <input
                                            type="range" v-model.number="sliderK1" min="10" max="100" step="5"
                                            class="slider-k w-full h-2 rounded-full appearance-none cursor-pointer bg-blue-200 my-2"
                                        />
                                        <div class="text-center">
                                            <Transition name="pop" mode="out-in">
                                            <span :key="sliderK1" class="inline-block bg-blue-600 text-white font-mono font-bold text-lg px-4 py-2 rounded-lg shadow-sm">
                                            k₁ = {{ sliderK1 }} N/m
                                            </span>
                                            </Transition>
                                        </div>
                                    </div>

                                    <div v-else>
                                        <div class="flex justify-between items-center text-xs font-bold text-pink-600">
                                            <span>Minder stug</span>
                                            <span>Stugger</span>
                                        </div>
                                        <input
                                            type="range" v-model.number="sliderK2" min="10" max="100" step="5"
                                            class="slider-p w-full h-2 rounded-full appearance-none cursor-pointer bg-pink-200 my-2"
                                        />
                                        <div class="text-center">
                                             <Transition name="pop" mode="out-in">
                                            <span :key="sliderK2" class="inline-block bg-pink-600 text-white font-mono font-bold text-lg px-4 py-2 rounded-lg shadow-sm">
                                            k₂ = {{ sliderK2 }} N/m
                                            </span>
                                             </Transition>
                                        </div>
                                    </div>
                                </div>
                                </Transition>
                            </div>
                            <div class="bg-amber-50 p-4 text-xs text-amber-800 text-center">
                                💡 Tip: Verschuif de slider en kijk hoe de streeplijn in de grafiek verschuift. Een hogere veerconstante (k) betekent een steilere grafiek.
                            </div>
                        </div>
                    </div>

                    <!-- TAB 4: OEFENING -->
                    <div v-else-if="activeTab === 3" class="space-y-6">
                        <div class="bg-white rounded-xl shadow-sm border border-amber-200">
                            <div class="p-5 border-b border-amber-50 bg-amber-50/30">
                                <h4 class="font-bold text-amber-900 text-sm m-0 mb-2 flex items-center gap-2">
                                    <PhPencilSimple class="text-amber-600 text-lg" /> 
                                    Oefening: Bepaal de veerconstante
                                </h4>
                                <p class="text-xs text-amber-800 m-0 leading-relaxed">
                                    Lees de grafiek af en bepaal de veerconstante (k) voor beide veren. De stippellijnen tonen de meetpunten.
                                </p>
                            </div>
                            
                            <div class="p-5 space-y-5">
                                <div class="space-y-4">
                                    <div class="flex items-center gap-3">
                                        <span class="w-16 font-bold text-blue-600 text-sm">Veer 1:</span>
                                        <input v-model.number="guess1" type="number" class="w-28 text-center py-1.5 rounded-lg border focus:ring-2 focus:ring-offset-1 outline-none font-mono transition-all" :class="guess1InputClass" placeholder="k₁">
                                        <span class="text-sm text-slate-600 font-bold">N/m</span>
                                        <button @click="openRicoHelp(1)" title="Hoe lees ik de rico af?" class="ml-auto flex items-center gap-1 pl-2 pr-3 py-1.5 bg-blue-100 hover:bg-blue-200 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg transition-all transform hover:scale-105">
                                            <PhQuestion weight="bold" class="text-sm"/> Hulp
                                        </button>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <span class="w-16 font-bold text-pink-600 text-sm">Veer 2:</span>
                                        <input v-model.number="guess2" type="number" class="w-28 text-center py-1.5 rounded-lg border focus:ring-2 focus:ring-offset-1 outline-none font-mono transition-all" :class="guess2InputClass" placeholder="k₂">
                                        <span class="text-sm text-slate-600 font-bold">N/m</span>
                                        <button @click="openRicoHelp(2)" title="Hoe lees ik de rico af?" class="ml-auto flex items-center gap-1 pl-2 pr-3 py-1.5 bg-pink-100 hover:bg-pink-200 border border-pink-200 text-pink-700 text-xs font-bold rounded-lg transition-all transform hover:scale-105">
                                            <PhQuestion weight="bold" class="text-sm"/> Hulp
                                        </button>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3 pt-2">
                                    <button @click="checkAnswers" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                                        Controleren
                                    </button>
                                </div>
                                
                                <Transition name="pop-feedback">
                                <div v-if="showFeedback" :class="feedbackAnimationClass" class="p-4 rounded-lg flex items-start gap-3 shadow-inner">
                                    <template v-if="isCorrect">
                                        <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 w-full p-4 rounded-lg flex items-start gap-3">
                                            <PhCheckCircle class="text-2xl text-emerald-600 shrink-0" weight="fill" />
                                            <div class="flex-1">
                                                <p class="font-bold text-sm m-0 mb-1">Fantastisch! Beide waarden kloppen.</p>
                                                <p class="text-xs">Goed gedaan! Je hebt de veerconstanten correct afgelezen.</p>
                                            </div>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="bg-red-50 border border-red-200 text-red-800 w-full p-4 rounded-lg flex items-start gap-3">
                                            <PhXCircle class="text-2xl text-red-600 shrink-0" weight="fill" />
                                            <div class="flex-1">
                                                <p class="font-bold text-sm m-0">Nog niet helemaal correct.</p>
                                                <p class="text-xs mt-1">Controleer je aflezing en probeer het opnieuw. Gebruik de 'Hulp' knop als je vastzit.</p>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                                </Transition>

                                <div class="pt-2 border-t border-slate-100 flex justify-center">
                                    <button @click="newExercise" class="text-xs font-bold text-slate-500 hover:text-slate-800 underline px-3 py-1 rounded-md hover:bg-slate-200 transition-colors">Nieuwe oefening genereren</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-center mt-auto">
                            <button
                                @click="handleComplete"
                                class="px-8 py-3 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition-all"
                            >
                                Activiteit voltooien
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>

        <!-- RIGHT: CHART -->
        <div class="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
          <div class="flex-1 p-6 pb-2 relative min-h-[400px]">
              <Scatter :data="chartData" :options="chartOptions" />
          </div>
           <div class="px-6 pb-4 flex justify-center gap-6 text-xs text-slate-600">
                <div class="flex items-center gap-2">
                    <div class="w-10 h-1 rounded-full bg-blue-500"></div>
                    <span>Veer 1</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-10 h-1 rounded-full bg-pink-500"></div>
                    <span>Veer 2</span>
                </div>
            </div>
        </div>
      </div>

    </div>
  </div>

  <!-- RICO HELP OVERLAY -->
  <Teleport to="body">
    <Transition name="rico-modal">
      <div v-if="showRicoHelp"
           class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
           style="background: rgba(15,23,42,0.70); backdrop-filter: blur(6px)"
           @click.self="closeRicoHelp">

        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col pointer-events-auto">

          <div class="p-4 sm:px-6 sm:py-4 flex items-center justify-between bg-gradient-to-r" :class="ricoSpring === 1 ? 'from-blue-600 to-blue-700' : 'from-pink-600 to-pink-700'">
            <div class="flex items-center gap-3 text-white">
              <div class="bg-white/20 p-2 rounded-lg">
                <PhGraph weight="bold" class="text-xl"/>
              </div>
              <div>
                <p class="font-bold text-base m-0 leading-tight">Hoe lees ik de rico (k) af?</p>
                <p class="text-sm opacity-80 m-0">{{ ricoLabel }}</p>
              </div>
            </div>
            <button @click="closeRicoHelp" class="text-white/60 hover:text-white transition-colors p-2 rounded-full">
              <PhX weight="bold" class="text-2xl" />
            </button>
          </div>

          <div class="flex flex-col lg:flex-row items-stretch">
            
            <div class="p-4 bg-slate-50 flex-1 border-b lg:border-b-0 lg:border-r border-slate-200 flex items-center justify-center">
              <svg viewBox="0 0 310 215" class="w-full rounded-xl bg-white border border-slate-200 shadow-sm" style="max-height:280px">
                <defs>
                  <clipPath id="rico-clip"><rect x="50" y="10" width="257" height="182"/></clipPath>
                </defs>

                <!-- Rasterlijnen Y -->
                <line v-for="yn in ricoYTicks" :key="'gy'+yn" x1="50" :y1="190 - yn*SCALE_Y" x2="307" :y2="190 - yn*SCALE_Y" stroke="#F1F5F9" stroke-width="1.5"/>
                <line v-for="xn in [1,2,3,4]" :key="'gx'+xn" :x1="50 + xn*56.7" y1="10" :x2="50 + xn*56.7" y2="190" stroke="#F1F5F9" stroke-width="1.5"/>
                
                <line x1="48" y1="190" x2="308" y2="190" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="50" y1="192" x2="50" y2="9"  stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round"/>
                
                <text v-for="yn in ricoYTicks" :key="'ty'+yn" x="43" :y="190 - yn*SCALE_Y + 3.5" font-size="9" fill="#94A3B8" text-anchor="end">{{yn}}</text>
                <text v-for="xn in [1,2,3,4]" :key="'tx'+xn" :x="50 + xn*56.7" y="203" font-size="9" fill="#94A3B8" text-anchor="middle">0.{{xn}}0</text>
                <text x="178" y="215" font-size="10" fill="#64748B" text-anchor="middle" font-style="italic">Δℓ (m)</text>
                <text x="14" y="102" font-size="10" fill="#64748B" text-anchor="middle" font-style="italic" transform="rotate(-90,14,102)">Fᵥ (N)</text>

                <line x1="50" y1="190" :x2="307" :y2="190 - ricoK * 0.45 * SCALE_Y" :stroke="ricoColor" stroke-width="2.5" opacity="0.2" clip-path="url(#rico-clip)"/>

                <g :class="{'opacity-100': ricoStep >= 1, 'opacity-0': ricoStep < 1}" style="transition: opacity 0.5s ease 0.3s">
                    <line x1="50" y1="190" x2="50" :y2="tgtSvgY" stroke="#10B981" stroke-width="2.5" stroke-dasharray="6,4"/>
                    <text font-size="12" fill="#10B981" font-weight="bold" text-anchor="middle" x="35" :y="(190 + tgtSvgY) / 2 + 5">{{ricoPoint.y}} N</text>
                </g>

                <g :class="{'opacity-100': ricoStep >= 2, 'opacity-0': ricoStep < 2}" style="transition: opacity 0.5s ease 0.3s">
                    <line x1="50" :y1="tgtSvgY" :x2="tgtSvgX" :y2="tgtSvgY" stroke="#F59E0B" stroke-width="2.5" stroke-dasharray="6,4"/>
                    <text font-size="12" fill="#F59E0B" font-weight="bold" text-anchor="middle" :x="(50 + tgtSvgX) / 2" :y="tgtSvgY - 8">{{ricoPoint.x}} m</text>
                </g>

                <circle v-if="ricoStep >= 2" :cx="tgtSvgX" :cy="tgtSvgY" r="8" :fill="ricoColor" opacity="0.25"/>
                <circle v-if="ricoStep >= 2" :cx="tgtSvgX" :cy="tgtSvgY" r="4.5" :fill="ricoColor" stroke="white" stroke-width="1.5"/>

                <g class="rico-runner" :transform="`translate(${emojiX}, ${emojiY})`">
                  <text font-size="24" text-anchor="middle" dy="-2">🏃</text>
                </g>
              </svg>
            </div>

            <div class="p-5 flex flex-col justify-center bg-white w-full lg:w-80 shrink-0">
                <div class="bg-slate-900 rounded-xl p-6 flex flex-col items-center justify-center font-mono shadow-inner mb-4 flex-1">
                    <div class="flex items-center gap-4">
                        <span class="text-lg text-slate-400">k =</span>
                        <div class="flex flex-col items-center min-w-[70px]">
                            <div class="text-xl transition-all duration-500 font-bold" :class="ricoStep >= 1 ? 'text-emerald-400' : 'text-slate-600'">
                                {{ ricoStep >= 1 ? ricoPoint.y + ' N' : 'rise' }}
                            </div>
                            <div class="w-full h-0.5 bg-slate-600 my-1.5 rounded-full"></div>
                            <div class="text-xl transition-all duration-500 font-bold" :class="ricoStep >= 2 ? 'text-amber-400' : 'text-slate-600'">
                                {{ ricoStep >= 2 ? ricoPoint.x + ' m' : 'run' }}
                            </div>
                        </div>

                        <div class="flex items-center transition-all duration-700" :class="ricoStep >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'">
                            <span class="text-3xl font-black text-white px-2">=</span>
                            <div class="flex items-baseline gap-1">
                                <span class="text-4xl font-black text-white leading-none">{{ ricoK }}</span>
                                <span class="text-sm font-bold text-slate-300">N/m</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 w-full transition-all duration-500" :class="ricoStep >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'">
                        <div class="flex items-center justify-center gap-2 bg-emerald-500 text-white px-3 py-2 rounded-lg text-base font-bold shadow-lg shadow-emerald-500/20 w-full text-center">
                        ✓ De veerconstante (k) is {{ ricoK }} N/m
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button @click="replayRico(false)"
                            class="py-2.5 text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
                    <PhArrowClockwise weight="bold" class="text-sm"/> Opnieuw
                    </button>
                    <button v-if="ricoSpring === 1"
                            @click="openRicoHelp(2)"
                            class="py-2 text-sm font-bold bg-pink-100 hover:bg-pink-200 text-pink-700 border border-pink-200 rounded-lg transition-colors shadow-sm">
                    Veer 2 bekijken →
                    </button>
                    <button v-else
                            @click="closeRicoHelp"
                            class="py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md rounded-lg transition-colors">
                    Begrepen! ✓
                    </button>
                </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* ─── FONT ────────────────────────────────────────────────── */
.font-sans {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}

/* ─── ANIMATIONS ──────────────────────────────────────────── */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes tada {
  from { transform: scale3d(1, 1, 1); }
  10%, 20% { transform: scale3d(.95, .95, .95) rotate3d(0, 0, 1, -3deg); }
  30%, 50%, 70%, 90% { transform: scale3d(1.05, 1.05, 1.05) rotate3d(0, 0, 1, 3deg); }
  40%, 60%, 80% { transform: scale3d(1.05, 1.05, 1.05) rotate3d(0, 0, 1, -3deg); }
  to { transform: scale3d(1, 1, 1); }
}

@keyframes shake {
  from, to { transform: translate3d(0, 0, 0); }
  10%, 30%, 50%, 70%, 90% { transform: translate3d(-10px, 0, 0); }
  20%, 40%, 60%, 80% { transform: translate3d(10px, 0, 0); }
}

@keyframes pulse-once-white {
    0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
    50% { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}

@keyframes flash-bg-anim {
  50% { background-color: rgba(255, 255, 0, 0.5); }
}

.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
.animate-tada { animation: tada 1s ease; }
.animate-shake { animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both; }
.animate-pulse-once { animation: pulse-once-white 1.5s ease-out; }
.flash-bg { animation: flash-bg-anim 0.7s ease-out; }

/* ─── TRANSITIONS ─────────────────────────────────────────── */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-out;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.step-fade-enter-active {
  transition: all 0.4s 0.1s ease-out;
}
.step-fade-enter-from {
  opacity: 0;
  transform: translateY(-15px);
}

.pop-enter-active, .pop-leave-active { transition: all 0.2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.7); }

.pop-feedback-enter-active { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-feedback-leave-active { transition: all 0.3s ease; }
.pop-feedback-enter-from, .pop-feedback-leave-to { opacity: 0; transform: scale(0.8) translateY(10px); }

/* ─── SLIDERS ─────────────────────────────────────────────── */
.slider-k::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 24px; height: 24px; border-radius: 50%;
  background: #2563EB; cursor: pointer;
  border: 4px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: all 0.15s ease;
}
.slider-k::-webkit-slider-thumb:hover { transform: scale(1.15); box-shadow: 0 3px 8px rgba(0,0,0,0.25); }

.slider-p::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 24px; height: 24px; border-radius: 50%;
  background: #DB2777; cursor: pointer;
  border: 4px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: all 0.15s ease;
}
.slider-p::-webkit-slider-thumb:hover { transform: scale(1.15); box-shadow: 0 3px 8px rgba(0,0,0,0.25); }

/* Hide number input spinners */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none; margin: 0;
}

/* ── Rico Help Overlay ───────────────────────────────────── */
.rico-modal-enter-active, .rico-modal-leave-active { transition: opacity 0.3s ease; }
.rico-modal-enter-from, .rico-modal-leave-to { opacity: 0; }

.rico-modal-enter-active > div,
.rico-modal-leave-active > div {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.rico-modal-enter-from > div,
.rico-modal-leave-to > div {
  transform: scale(0.95) translateY(10px);
  opacity: 0.5;
}

g.rico-runner {
  transition: transform 0.8s cubic-bezier(0.6, -0.55, 0.25, 1.55);
}
</style>