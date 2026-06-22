<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhTriangle,
  PhArrowClockwise,
  PhLightbulb,
  PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Gelijkvormigheidskenmerken'
  },
  instruction: {
    type: String,
    default: 'Bewijs dat deze driehoeken gelijkvormig zijn. Welk kenmerk rechtvaardigt dit? Sleep de juiste stempel naar de driehoeken.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhTriangle }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showPrediction = ref(true)
const showReflection = ref(false)
const reflectAns = ref('')
const reflectDone = ref(false)
const showWhy = ref(false)
const predictionChoice = ref(null)
const predictionReason = ref('')
const predictionWrongCount = ref(0)
const stampReady = ref(false)

// Stamps
const droppedStamp = ref(null)

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

// --- Level generation ---
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)]
}

const TRIANGLE_WIDTH = 180
const TRIANGLE_HEIGHT = 140
// Vertex positions for triangle SVG
// A (top), B (bottom-left), C (bottom-right)
const V = {
  A: { x: 90, y: 18 },
  B: { x: 12, y: 138 },
  C: { x: 168, y: 138 }
}

// Edge midpoints for label placement
function midpoint(p1, p2) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
}

const edges = {
  // side1 (AB): left sloping
  AB: { from: 'A', to: 'B' },
  // side2 (BC): base
  BC: { from: 'B', to: 'C' },
  // side3 (AC): right sloping
  AC: { from: 'A', to: 'C' }
}

// Side label offsets (dx, dy) — push outward from triangle
const edgeLabelOffsets = {
  AB: { dx: -22, dy: 0 },
  BC: { dx: 0, dy: 16 },
  AC: { dx: 22, dy: 0 }
}

// Angle label positions — just inside the vertex
const angleLabelPos = {
  A: { x: V.A.x + 10, y: V.A.y + 18 },
  B: { x: V.B.x + 22, y: V.B.y - 8 },
  C: { x: V.C.x - 22, y: V.C.y - 8 }
}

function generateLevelData(level) {
  if (level === 0) {
    // ZZZ: all 3 sides
    const s1 = randInt(2, 6)
    const s2 = randInt(s1 + 1, s1 + 4)
    const s3 = randInt(s2 + 1, s2 + 5)
    const k = randInt(2, 4)
    return {
      level: 1,
      title: 'ZZZ — Zijde-Zijde-Zijde',
      targetStamp: 'ZZZ',
      t1: { side1: s1, side2: s2, side3: s3, angle1: null, angle2: null, angle3: null },
      t2: { side1: s1 * k, side2: s2 * k, side3: s3 * k, angle1: null, angle2: null, angle3: null },
      scale: k,
      predictionQ: 'Welk kenmerk gebruiken we als ALLE drie de zijden van beide driehoeken gegeven zijn?',
      predictionOpts: ['ZZZ', 'ZHZ', 'HH'],
      predictionCorrect: 0,
      whyText: `<strong>Waarom ZZZ?</strong><br>
        <span class="text-sm">Omdat alle drie de paren overeenkomstige zijden dezelfde verhouding hebben (×${k}).<br>
        Bij ZZZ moet je ALLE drie de zijden controleren — twee is niet genoeg!<br>
        Als alle verhoudingen gelijk zijn, zijn de driehoeken gegarandeerd gelijkvormig.</span>`,
      successText: `Juist! Alle zijden zijn evenredig (×${k}). Dat is ZZZ.`,
      reflectQ: 'Waarom moeten bij ZZZ ALLE drie de zijden gecontroleerd worden? Waarom volstaan er geen twee?',
    }
  } else if (level === 1) {
    // ZHZ: 2 sides + included angle
    const s1 = randInt(3, 7)
    const s2 = randInt(3, 7)
    const angle = pick([30, 45, 50, 60, 70])
    const k = randInt(2, 3)
    // third side is unknown
    return {
      level: 2,
      title: 'ZHZ — Zijde-Hoek-Zijde',
      targetStamp: 'ZHZ',
      t1: { side1: s1, side2: s2, side3: '?', angle1: null, angle2: angle, angle3: null },
      t2: { side1: s1 * k, side2: s2 * k, side3: '?', angle1: null, angle2: angle, angle3: null },
      scale: k,
      knownAngleIdx: 1, // B (middle angle)
      predictionQ: 'We kennen twee zijden en de INGESLOTEN hoek. Welk kenmerk past?',
      predictionOpts: ['ZZZ', 'ZHZ', 'HH'],
      predictionCorrect: 1,
      whyText: `<strong>Waarom ZHZ?</strong><br>
        <span class="text-sm">Omdat de twee bekende zijden (×${k}) de ingesloten hoek van ${angle}° delen.<br>
        ZHZ vereist dat de hoek TUSSEN de twee evenredige zijden ligt.<br>
        Als de hoek NIET ingesloten was (ZHH), hebben we een andere situatie.</span>`,
      successText: `Perfect! De zijden zijn evenredig (×${k}) en de ingesloten hoek (${angle}°) is gelijk. ZHZ!`,
      reflectQ: 'Waarom is het belangrijk dat de hoek bij ZHZ de INGESLOTEN hoek is? Wat als de hoek niet tussen de twee zijden ligt?',
    }
  } else {
    // HH: 2 angles
    const a1 = pick([30, 40, 50, 60])
    const a2 = pick([50, 60, 70, 80].filter(a => a !== a1 && (180 - a1 - a) > 15))
    const a3 = 180 - a1 - a2
    return {
      level: 3,
      title: 'HH — Hoek-Hoek',
      targetStamp: 'HH',
      t1: { side1: '?', side2: '?', side3: '?', angle1: a1, angle2: a2, angle3: a3 },
      t2: { side1: '?', side2: '?', side3: '?', angle1: a1, angle2: a3, angle3: a2 },
      scale: null,
      predictionQ: 'We kennen TWEE hoeken van elke driehoek. Welk kenmerk past?',
      predictionOpts: ['ZZZ', 'ZHZ', 'HH'],
      predictionCorrect: 2,
      whyText: `<strong>Waarom HH?</strong><br>
        <span class="text-sm">Als twee hoeken van de ene driehoek gelijk zijn aan twee hoeken van de andere,<br>
        dan is de derde hoek automatisch ook gelijk (som = 180°).<br>
        HH is het krachtigste kenmerk: je hebt geen enkele zijde nodig!</span>`,
      successText: `Uitstekend! Twee gelijke hoeken volstaan — de derde volgt (180° − ${a1}° − ${a2}° = ${a3}°). HH!`,
      reflectQ: 'Waarom volstaan 2 hoeken (HH) om gelijkvormigheid te bewijzen? Waarom is er geen enkele zijde nodig?',
    }
  }
}

const levelData = ref(generateLevelData(0))
const currentLevelData = computed(() => levelData.value)

// Triangle vertex computations
function edgeMid(e) {
  const p1 = V[e.from]
  const p2 = V[e.to]
  return midpoint(p1, p2)
}

// Side label positions for a triangle given its data
function getSideLabels(tri) {
  const ab = edgeMid(edges.AB)
  const bc = edgeMid(edges.BC)
  const ac = edgeMid(edges.AC)
  return [
    { ...ab, dx: edgeLabelOffsets.AB.dx, dy: edgeLabelOffsets.AB.dy, label: '' + tri.side1 },
    { ...bc, dx: edgeLabelOffsets.BC.dx, dy: edgeLabelOffsets.BC.dy, label: '' + tri.side2 },
    { ...ac, dx: edgeLabelOffsets.AC.dx, dy: edgeLabelOffsets.AC.dy, label: '' + tri.side3 },
  ]
}

function getAngleLabels(tri) {
  const result = []
  if (tri.angle1 !== null && tri.angle1 !== undefined && tri.angle1 !== '?') {
    result.push({ ...angleLabelPos.A, label: tri.angle1 + '°' })
  }
  if (tri.angle2 !== null && tri.angle2 !== undefined && tri.angle2 !== '?') {
    result.push({ ...angleLabelPos.B, label: tri.angle2 + '°' })
  }
  if (tri.angle3 !== null && tri.angle3 !== undefined && tri.angle3 !== '?') {
    result.push({ ...angleLabelPos.C, label: tri.angle3 + '°' })
  }
  return result
}

const t1Sides = computed(() => getSideLabels(currentLevelData.value.t1))
const t2Sides = computed(() => getSideLabels(currentLevelData.value.t2))
const t1Angles = computed(() => getAngleLabels(currentLevelData.value.t1))
const t2Angles = computed(() => getAngleLabels(currentLevelData.value.t2))

// --- Stamp interaction ---
const stamps = ['ZZZ', 'ZHZ', 'HH']
let draggedStamp = null

function onDragStart(stamp) {
  if (isCorrect.value || !stampReady.value) return
  draggedStamp = stamp
}

function onDrop() {
  if (isCorrect.value || !stampReady.value) return
  if (!draggedStamp) return
  droppedStamp.value = draggedStamp
  draggedStamp = null

  if (droppedStamp.value === currentLevelData.value.targetStamp) {
    isCorrect.value = true
    showWhy.value = true
    showReflection.value = true
    feedback.value = {
      type: 'success',
      text: currentLevelData.value.successText
    }
  } else {
    attemptCount.value++
    const t = currentLevelData.value
    if (t.targetStamp === 'ZZZ') {
      feedback.value = {
        type: 'error',
        text: `<strong>Let op!</strong> We hebben ALLE drie de zijden (geen hoeken).<br>ZZZ is het enige kenmerk dat alleen zijden gebruikt — ${droppedStamp.value} past niet bij deze gegevens.`
      }
    } else if (t.targetStamp === 'ZHZ') {
      feedback.value = {
        type: 'error',
        text: `<strong>Let op!</strong> We hebben twee zijden EN de ingesloten hoek.<br>ZHZ past omdat de hoek tussen de twee bekende zijden ligt. ${droppedStamp.value} vereist ${droppedStamp.value === 'ZZZ' ? 'drie zijden' : 'geen zijden maar twee hoeken'}.`
      }
    } else {
      feedback.value = {
        type: 'error',
        text: `<strong>Let op!</strong> We hebben alleen hoeken, geen zijden.<br>HH is het enige kenmerk dat zonder zijden werkt. ${droppedStamp.value} heeft ook ${droppedStamp.value === 'ZZZ' ? 'zijden' : 'zijden'} nodig.`
      }
    }
  }
}

function removeStamp() {
  if (isCorrect.value) return
  droppedStamp.value = null
}

// --- Hint system ---
function getHintText(count, t) {
  if (count <= 1) {
    return `<strong>Hint 1:</strong> Kijk naar de GEGEVENS. Wat zie je?<br>
      ${t.targetStamp === 'ZZZ' ? 'We zien ALLE drie de zijden, geen hoeken. Welk kenmerk gebruikt alleen zijden?' :
        t.targetStamp === 'ZHZ' ? 'We zien TWEE zijden en een hoek. Ligt die hoek tussen de twee zijden?' :
        'We zien alleen HOEKEN, geen zijden. Welk kenmerk werkt zonder zijden?'}`
  } else if (count <= 3) {
    return `<strong>Hint 2:</strong> Voorbeeld —
      ${t.targetStamp === 'ZZZ' ? '△PQR (2, 3, 4) en △STU (6, 9, 12). Verhoudingen: 6/2 = 3, 9/3 = 3, 12/4 = 3. Allemaal ×3! Dat is ZZZ.' :
        t.targetStamp === 'ZHZ' ? '△PQR: zijden 3 en 5, ingesloten hoek 60°. △STU: zijden 6 en 10, hoek 60°. Verhouding ×2. Dat is ZHZ.' :
        '△PQR: hoeken 40°, 70°. △STU: hoeken 40°, 70°. Derde hoek: 180 − 40 − 70 = 70° voor beide. Dat is HH.'}<br>
      <span class="text-xs text-slate-500">Pas dit toe op jouw driehoeken.</span>`
  } else {
    return `<strong>Hint 3:</strong> Vul de ontbrekende stap in:<br>
      ${t.targetStamp === 'ZZZ' ? `Verhouding z1 = ${t.t2.side1}/${t.t1.side1} = ___. Verhouding z2 = ${t.t2.side2}/${t.t1.side2} = ___.<br>Dus criterium = ___` :
        t.targetStamp === 'ZHZ' ? `Verhouding z1 = ${t.t2.side1}/${t.t1.side1} = ___. Hoek = ${t.t1.angle2}°.<br>Dus criterium = ___` :
        'Hoek 1 = ' + t.t1.angle1 + '° en ' + t.t2.angle1 + '° (gelijk). Hoek 2 = ' + t.t1.angle2 + '° en ' + t.t2.angle2 + '° (gelijk).<br>Dus criterium = ___'}`
  }
}

// --- Prediction ---
function submitPrediction() {
  if (predictionChoice.value === null) return
  const t = currentLevelData.value
  if (predictionChoice.value === t.predictionCorrect) {
    // Correct prediction
    showPrediction.value = false
    stampReady.value = true
    feedback.value = {
      type: 'info',
      text: '<strong>Juist voorspeld!</strong> Sleep nu de stempel "' + t.targetStamp + '" naar het vak ter bevestiging.'
    }
  } else {
    predictionWrongCount.value++
    const chosen = t.predictionOpts[predictionChoice.value]
    hintCount.value++
    const hintText = getHintText(hintCount.value, t)
    feedback.value = {
      type: 'error',
      text: `<strong>Niet helemaal.</strong> "${chosen}" past niet bij deze gegevens.<br>${hintText}`
    }
  }
}

function submitReflection() {
  if (reflectAns.value.trim().length > 0) {
    reflectDone.value = true
  }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  attemptCount.value = 0
  hintCount.value = 0
  feedback.value = { type: 'info', text: '' }
  droppedStamp.value = null
  stampReady.value = false
  showPrediction.value = true
  showReflection.value = false
  reflectAns.value = ''
  reflectDone.value = false
  showWhy.value = false
  predictionChoice.value = null
  predictionReason.value = ''
  predictionWrongCount.value = 0
  levelData.value = generateLevelData(currentInternalLevel.value)
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1)
    } else {
        emit('complete')
    }
  }
}

// Lifecycle
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
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }} — {{ currentLevelData.title }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />

            <!-- PREDICTION GATE -->
            <div v-if="showPrediction" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Voorspel het kenmerk!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                {{ currentLevelData.predictionQ }}
              </p>
              <div class="flex gap-2 mb-3">
                <button v-for="(opt, idx) in currentLevelData.predictionOpts" :key="idx"
                        @click="predictionChoice = idx"
                        class="flex-1 py-2 px-2 text-xs font-bold rounded-lg border-2 transition-all"
                        :class="predictionChoice === idx
                          ? 'border-amber-500 bg-amber-100 text-amber-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'">
                  {{ opt }}
                </button>
              </div>
              <textarea v-model="predictionReason" rows="2" placeholder="Waarom denk je dat?"
                        class="w-full p-2 mb-3 text-xs border border-amber-200 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"></textarea>
              <button @click="submitPrediction" :disabled="predictionChoice === null"
                      class="px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <!-- WORKED EXAMPLE (shown after prediction) -->
            <div v-if="!showPrediction" class="p-4 border border-amber-200 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                <span class="font-bold text-amber-700 text-sm">Voorbeeld</span>
              </div>
              <p class="text-xs text-amber-700 leading-relaxed">
                <template v-if="currentLevelData.level === 1">
                  <strong>△ABC (3, 4, 5)</strong> en <strong>△DEF (6, 8, 10)</strong><br>
                  6/3 = 2, 8/4 = 2, 10/5 = 2 &#8594; alle verhoudingen = 2<br>
                  Alle drie de paren zijden zijn evenredig &#8594; <strong>ZZZ</strong>
                </template>
                <template v-else-if="currentLevelData.level === 2">
                  <strong>△ABC:</strong> AB = 3, BC = 5, &#x2220;B = 45&deg;<br>
                  <strong>△DEF:</strong> DE = 6, EF = 10, &#x2220;E = 45&deg;<br>
                  Verhouding 2, ingesloten hoek gelijk &#8594; <strong>ZHZ</strong>
                </template>
                <template v-else>
                  <strong>△ABC:</strong> &#x2220;A = 40&deg;, &#x2220;B = 60&deg;<br>
                  <strong>△DEF:</strong> &#x2220;D = 40&deg;, &#x2220;E = 60&deg;<br>
                  Derde hoek automatisch gelijk (180&deg;&minus;som) &#8594; <strong>HH</strong>
                </template>
              </p>
            </div>

            <!-- WHY EXPLANATION (shown after correct) -->
            <div v-if="showWhy" class="p-4 border border-amber-200 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhCheckCircle weight="fill" class="w-5 h-5 text-amber-500" />
                <span class="font-bold text-amber-700 text-sm">Waarom dit kenmerk?</span>
              </div>
              <MathText :content="currentLevelData.whyText" class="text-sm text-amber-700 leading-relaxed" />
            </div>

            <!-- STAMPS (shown after prediction) -->
            <div v-if="!showPrediction && !isCorrect" class="mt-4 space-y-4">
              <p class="font-bold text-slate-800 uppercase tracking-wider text-xs">Sleep de juiste stempel</p>
              <div class="flex flex-col gap-3">
                <div v-for="stamp in stamps" :key="stamp"
                     draggable="true"
                     @dragstart="onDragStart(stamp)"
                     class="p-3 border-2 border-slate-300 bg-white rounded-xl text-center font-bold text-xl font-mono text-slate-700 cursor-grab active:cursor-grabbing hover:border-amber-500 hover:text-amber-600 transition-colors shadow-sm"
                     :class="{ 'opacity-30 pointer-events-none': droppedStamp === stamp || !stampReady }">
                  {{ stamp }}
                </div>
              </div>
            </div>

            <!-- DROP ZONE (shown after prediction) -->
            <div v-if="!showPrediction" class="mt-4">
              <div @dragover.prevent.stop
                   @drop.prevent.stop="onDrop"
                   class="w-full h-24 border-4 border-dashed rounded-xl flex flex-col items-center justify-center bg-white/80 backdrop-blur transition-all shadow-sm"
                   :class="droppedStamp
                     ? (isCorrect ? 'border-amber-500 bg-amber-50' : 'border-red-400 bg-red-50')
                     : 'border-slate-300 hover:border-amber-400'">

                 <p v-if="!droppedStamp" class="text-amber-600 font-bold uppercase tracking-widest text-sm text-center">Sleep Stempel Hier</p>

                 <div v-else class="relative animate-fadeIn text-3xl font-mono font-black" :class="isCorrect ? 'text-amber-600' : 'text-slate-800'">
                   {{ droppedStamp }}
                   <button v-if="!isCorrect" @click="removeStamp" class="absolute -top-5 -right-8 w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-200 hover:text-red-700 shadow-md border-2 border-white active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                      <PhX class="w-3.5 h-3.5" weight="bold" />
                   </button>
                 </div>
              </div>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection && !reflectDone" class="mt-6 p-5 border-2 border-amber-300 bg-amber-50 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Reflecteer</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                {{ currentLevelData.reflectQ }}
              </p>
              <textarea v-model="reflectAns" rows="3"
                        class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                        placeholder="Typ je antwoord..."></textarea>
              <button @click="submitReflection" :disabled="reflectAns.trim().length === 0"
                      class="mt-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig
              </button>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{
                   'bg-amber-100 text-amber-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-amber-50 text-amber-700': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                 <PhArrowClockwise />
              </button>

              <button v-if="isCorrect && reflectDone" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>

              <div v-if="!isCorrect && stampReady" class="flex-1 py-4 text-sm text-slate-400 text-center">
                Sleep een stempel
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL: Triangle Visuals -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden gap-16">

              <div class="flex flex-col md:flex-row items-center justify-center gap-20 w-full">

                <!-- Triangle 1 -->
                <div class="flex flex-col items-center">
                  <p class="text-xs font-bold text-slate-400 mb-1 uppercase">Driehoek ABC</p>
                  <svg :width="TRIANGLE_WIDTH" :height="TRIANGLE_HEIGHT" class="overflow-visible">
                    <!-- Triangle shape -->
                    <polygon :points="`${V.A.x},${V.A.y} ${V.B.x},${V.B.y} ${V.C.x},${V.C.y}`"
                             fill="none" stroke="#475569" stroke-width="2.5" />

                    <!-- Vertex labels -->
                    <text :x="V.A.x" :y="V.A.y - 10" text-anchor="middle" class="text-xs font-bold fill-slate-600">A</text>
                    <text :x="V.B.x - 8" :y="V.B.y + 16" text-anchor="middle" class="text-xs font-bold fill-slate-600">B</text>
                    <text :x="V.C.x + 8" :y="V.C.y + 16" text-anchor="middle" class="text-xs font-bold fill-slate-600">C</text>

                    <!-- Side labels -->
                    <text v-for="(s, i) in t1Sides" :key="'s'+i"
                          :x="s.x + s.dx" :y="s.y + s.dy"
                          text-anchor="middle" class="text-sm font-bold fill-amber-600"
                          :class="{ 'opacity-0': s.label === '?' }">
                      {{ s.label }}
                    </text>

                    <!-- Angle labels -->
                    <text v-for="(a, i) in t1Angles" :key="'a'+i"
                          :x="a.x" :y="a.y"
                          text-anchor="middle" class="text-xs font-bold fill-slate-500">
                      {{ a.label }}
                    </text>
                  </svg>
                </div>

                <div class="text-3xl font-bold text-slate-300">~</div>

                <!-- Triangle 2 -->
                <div class="flex flex-col items-center">
                  <p class="text-xs font-bold text-slate-400 mb-1 uppercase">Driehoek DEF</p>
                  <svg :width="TRIANGLE_WIDTH" :height="TRIANGLE_HEIGHT" class="overflow-visible">
                    <!-- Triangle shape -->
                    <polygon :points="`${V.A.x},${V.A.y} ${V.B.x},${V.B.y} ${V.C.x},${V.C.y}`"
                             fill="none" stroke="#475569" stroke-width="2.5" />

                    <!-- Vertex labels -->
                    <text :x="V.A.x" :y="V.A.y - 10" text-anchor="middle" class="text-xs font-bold fill-slate-600">D</text>
                    <text :x="V.B.x - 8" :y="V.B.y + 16" text-anchor="middle" class="text-xs font-bold fill-slate-600">E</text>
                    <text :x="V.C.x + 8" :y="V.C.y + 16" text-anchor="middle" class="text-xs font-bold fill-slate-600">F</text>

                    <!-- Side labels -->
                    <text v-for="(s, i) in t2Sides" :key="'s'+i"
                          :x="s.x + s.dx" :y="s.y + s.dy"
                          text-anchor="middle" class="text-sm font-bold fill-amber-600"
                          :class="{ 'opacity-0': s.label === '?' }">
                      {{ s.label }}
                    </text>

                    <!-- Angle labels -->
                    <text v-for="(a, i) in t2Angles" :key="'a'+i"
                          :x="a.x" :y="a.y"
                          text-anchor="middle" class="text-xs font-bold fill-slate-500">
                      {{ a.label }}
                    </text>
                  </svg>
                </div>

              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
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
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
