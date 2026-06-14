<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { PhX, PhAtom, PhLink, PhPlayCircle, PhInfo, PhArrowsDownUp, PhCheckCircle } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
})

const emit = defineEmits(['close'])

// --- Fullscreen Management ---
watch(() => props.isOpen, (val) => {
  if (val && !document.fullscreenElement) {
    nextTick(() => document.documentElement.requestFullscreen().catch(() => {}))
  } else if (!val && document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
  }
}, { immediate: true })

onUnmounted(() => {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
})

// --- App State ---
const animationPhase = ref(0) // 0: Start, 1: Transfer, 2: Compleet
const selectedMolecule = ref('NaCl')
const electronProgress = ref(0) // 0-1 for electron animation progress
const animationFrameId = ref(null)
const step0Ref = ref(null)
const step1Ref = ref(null)
const step2Ref = ref(null)

const moleculeData = {
  NaCl: {
    name: 'Natriumchloride',
    formula: 'NaCl',
    description: 'Natrium is een metaal met 1 los valentie-elektron. Chloor is een niet-metaal dat 1 elektron tekortkomt voor een volle schil. De overdracht zorgt ervoor dat beide atomen stabiel worden.',
    atoms: [
      { id: 'Na1', symbol: 'Na', color: '#fb923c', finalCharge: '+' },
      { id: 'Cl1', symbol: 'Cl', color: '#4ade80', finalCharge: '-', openSide: 'left' }
    ]
  },
  MgCl2: {
    name: 'Magnesiumchloride',
    formula: 'MgCl₂',
    description: 'Magnesium is een aardalkalimetaal met 2 valentie-elektronen. Het staat deze af aan twee Chlooratomen om de edelgasconfiguratie te bereiken.',
    atoms: [
      { id: 'Mg1', symbol: 'Mg', color: '#60a5fa', finalCharge: '2+' },
      { id: 'Cl1', symbol: 'Cl', color: '#4ade80', finalCharge: '-', openSide: 'right' },
      { id: 'Cl2', symbol: 'Cl', color: '#4ade80', finalCharge: '-', openSide: 'left' }
    ]
  },
  AlCl3: {
    name: 'Aluminiumchloride',
    formula: 'AlCl₃',
    description: 'Aluminium is een metaal met 3 valentie-elektronen. Het doneert elk elektron aan een apart Chloor-atoom, wat resulteert in een stabiele structuur.',
    atoms: [
      { id: 'Al1', symbol: 'Al', color: '#c084fc', finalCharge: '3+' },
      { id: 'Cl1', symbol: 'Cl', color: '#4ade80', finalCharge: '-', openSide: 'right' },
      { id: 'Cl2', symbol: 'Cl', color: '#4ade80', finalCharge: '-', openSide: 'left' },
      { id: 'Cl3', symbol: 'Cl', color: '#4ade80', finalCharge: '-', openSide: 'top' }
    ]
  }
}

const currentMoleculeInfo = computed(() => moleculeData[selectedMolecule.value])

// --- Animation Control ---
const animateElectrons = (duration = 2000) => {
  const startTime = performance.now()
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Ease-in-out curve for smooth movement
    const eased = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    
    electronProgress.value = eased
    
    if (progress < 1) {
      animationFrameId.value = requestAnimationFrame(animate)
    } else {
      // Animation complete, move to phase 2
      animationPhase.value = 2
      electronProgress.value = 0
    }
  }
  
  animationFrameId.value = requestAnimationFrame(animate)
}

const playAnimation = () => {
  // Cancel any ongoing animation
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  
  animationPhase.value = 0
  electronProgress.value = 0
  
  // Phase 0: Show initial state (1 second)
  setTimeout(() => {
    animationPhase.value = 1
    // Start electron transfer animation
    animateElectrons(2500) // 2.5 seconds for electron movement
  }, 1500)
  
  // Phase 2 complete will be set by animateElectrons when done
}

function selectMolecule(molecule) {
  selectedMolecule.value = molecule
  animationPhase.value = 0
  electronProgress.value = 0
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})

// Auto-scroll to active step
watch(animationPhase, (phase) => {
  nextTick(() => {
    const stepRefs = [step0Ref.value, step1Ref.value, step2Ref.value]
    if (stepRefs[phase]) {
      stepRefs[phase].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
})

// --- SVG Layout Calculation ---
const layout = computed(() => {
  const phase = animationPhase.value
  const moleculeKey = selectedMolecule.value
  const data = moleculeData[moleculeKey]
  const centerX = 200, centerY = 200

  const atoms = []
  const movingElectrons = []

  if (moleculeKey === 'NaCl') {
    const na = { ...data.atoms[0], x: 150, y: centerY }
    const cl = { ...data.atoms[1], x: 250, y: centerY }
    atoms.push(na, cl)

    const startX = na.x + 35
    const startY = na.y
    const targetX = cl.x - 35
    const targetY = cl.y + 10
    const arc = -30

    movingElectrons.push({
      id: 'e1', color: na.color,
      startX, startY, targetX, targetY, arc,
      x: phase === 1 
        ? startX + (targetX - startX) * electronProgress.value
        : (phase >= 2 ? targetX : startX),
      y: phase === 1
        ? startY + (targetY - startY) * electronProgress.value + Math.sin(electronProgress.value * Math.PI) * arc
        : (phase >= 2 ? targetY : startY)
    })

  } else if (moleculeKey === 'MgCl2') {
    const mgX = centerX
    const cl1X = 110
    const cl2X = 290

    const mg = { ...data.atoms[0], x: mgX, y: centerY }
    const cl1 = { ...data.atoms[1], x: cl1X, y: centerY }
    const cl2 = { ...data.atoms[2], x: cl2X, y: centerY }
    atoms.push(mg, cl1, cl2)

    const e1_startX = mg.x
    const e1_startY = mg.y - 35
    const e1_targetX = cl1.x + 35
    const e1_targetY = cl1.y + 10
    const e1_arc = -40
    
    movingElectrons.push({
      id: 'e1', color: mg.color,
      startX: e1_startX, startY: e1_startY, targetX: e1_targetX, targetY: e1_targetY, arc: e1_arc,
      x: phase === 1 ? e1_startX + (e1_targetX - e1_startX) * electronProgress.value : (phase >= 2 ? e1_targetX : e1_startX),
      y: phase === 1 ? e1_startY + (e1_targetY - e1_startY) * electronProgress.value + Math.sin(electronProgress.value * Math.PI) * e1_arc : (phase >= 2 ? e1_targetY : e1_startY)
    })

    const e2_startX = mg.x
    const e2_startY = mg.y + 35
    const e2_targetX = cl2.x - 35
    const e2_targetY = cl2.y + 10
    const e2_arc = 40

    movingElectrons.push({
      id: 'e2', color: mg.color,
      startX: e2_startX, startY: e2_startY, targetX: e2_targetX, targetY: e2_targetY, arc: e2_arc,
      x: phase === 1 ? e2_startX + (e2_targetX - e2_startX) * electronProgress.value : (phase >= 2 ? e2_targetX : e2_startX),
      y: phase === 1 ? e2_startY + (e2_targetY - e2_startY) * electronProgress.value + Math.sin(electronProgress.value * Math.PI) * e2_arc : (phase >= 2 ? e2_targetY : e2_startY)
    })

  } else if (moleculeKey === 'AlCl3') {
    const al = { ...data.atoms[0], x: centerX, y: centerY }
    const dist = 130

    const cl1 = { ...data.atoms[1], x: centerX - dist, y: centerY }
    const cl2 = { ...data.atoms[2], x: centerX + dist, y: centerY }
    const cl3 = { ...data.atoms[3], x: centerX, y: centerY + dist }
    atoms.push(al, cl1, cl2, cl3)

    const e1_startX = al.x - 35
    const e1_startY = al.y
    const e1_targetX = cl1.x + 35
    const e1_targetY = cl1.y + 10
    const e1_arc = -25

    movingElectrons.push({
      id: 'e1', color: al.color,
      startX: e1_startX, startY: e1_startY, targetX: e1_targetX, targetY: e1_targetY, arc: e1_arc,
      x: phase === 1 ? e1_startX + (e1_targetX - e1_startX) * electronProgress.value : (phase >= 2 ? e1_targetX : e1_startX),
      y: phase === 1 ? e1_startY + (e1_targetY - e1_startY) * electronProgress.value + Math.sin(electronProgress.value * Math.PI) * e1_arc : (phase >= 2 ? e1_targetY : e1_startY)
    })
    
    const e2_startX = al.x + 35
    const e2_startY = al.y
    const e2_targetX = cl2.x - 35
    const e2_targetY = cl2.y + 10
    const e2_arc = 25

    movingElectrons.push({
      id: 'e2', color: al.color,
      startX: e2_startX, startY: e2_startY, targetX: e2_targetX, targetY: e2_targetY, arc: e2_arc,
      x: phase === 1 ? e2_startX + (e2_targetX - e2_startX) * electronProgress.value : (phase >= 2 ? e2_targetX : e2_startX),
      y: phase === 1 ? e2_startY + (e2_targetY - e2_startY) * electronProgress.value + Math.sin(electronProgress.value * Math.PI) * e2_arc : (phase >= 2 ? e2_targetY : e2_startY)
    })

    const e3_startX = al.x
    const e3_startY = al.y + 35
    const e3_targetX = cl3.x + 10
    const e3_targetY = cl3.y - 35
    const e3_arc = 0

    movingElectrons.push({
      id: 'e3', color: al.color,
      startX: e3_startX, startY: e3_startY, targetX: e3_targetX, targetY: e3_targetY, arc: e3_arc,
      x: phase === 1 ? e3_startX + (e3_targetX - e3_startX) * electronProgress.value : (phase >= 2 ? e3_targetX : e3_startX),
      y: phase === 1 ? e3_startY + (e3_targetY - e3_startY) * electronProgress.value + Math.sin(electronProgress.value * Math.PI) * e3_arc : (phase >= 2 ? e3_targetY : e3_startY)
    })
  }
  
  return { atoms, movingElectrons }
})

// Generate trail positions for moving electrons
const electronTrails = computed(() => {
  if (animationPhase.value !== 1) return []
  
  const trails = []
  const progress = electronProgress.value
  
  layout.value.movingElectrons.forEach((electron) => {
    const trailLength = 8
    for (let i = 1; i <= trailLength; i++) {
      const trailProgress = Math.max(0, progress - (i * 0.05))
      if (trailProgress > 0) {
        const eased = trailProgress < 0.5 
          ? 2 * trailProgress * trailProgress 
          : 1 - Math.pow(-2 * trailProgress + 2, 2) / 2
        
        const x = electron.startX + (electron.targetX - electron.startX) * eased
        const y = electron.startY + (electron.targetY - electron.startY) * eased + 
                  Math.sin(eased * Math.PI) * electron.arc;
        
        trails.push({
          id: `${electron.id}-trail-${i}`,
          x, y,
          opacity: (trailLength - i) / trailLength * 0.5,
          color: electron.color
        })
      }
    }
  })
  
  return trails
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-900 font-sans">
      <!-- HEADER -->
      <div class="h-16 bg-slate-900 border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/30">
            <PhAtom class="text-xl text-white" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-white">Ionbinding Bouwer</h1>
            <p class="text-sm text-slate-300">Elektronen-overdracht van metaal naar niet-metaal</p>
          </div>
        </div>
        <button @click="emit('close')" class="p-2 text-slate-400 hover:text-rose-500 transition-colors">
          <PhX weight="bold" class="text-xl" />
        </button>
      </div>

      <div class="flex-1 flex overflow-hidden">
        <!-- LEFT PANEL -->
        <div class="w-96 bg-white border-r border-slate-200 flex flex-col z-10">
          <div class="p-6 flex-1 flex flex-col gap-4 overflow-hidden">
            
            <!-- START ANIMATION BUTTON - AT TOP -->
            <button 
              @click="playAnimation" 
              class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              :disabled="animationPhase === 1"
              :class="animationPhase === 1 ? 'opacity-50 cursor-not-allowed' : ''"
            >
              <PhPlayCircle weight="fill" class="text-2xl" /> 
              {{ animationPhase === 1 ? 'Animatie bezig...' : 'Start Overdracht' }}
            </button>
            
            <!-- MOLECULE SELECTOR -->
            <div class="grid grid-cols-3 gap-2">
              <button v-for="(_, key) in moleculeData" :key="key" @click="selectMolecule(key)"
                class="px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 border"
                :class="selectedMolecule === key ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'">
                {{ moleculeData[key].formula }}
              </button>
            </div>

            <!-- SCROLLABLE CONTENT AREA -->
            <div class="flex flex-col gap-4 flex-1 overflow-y-auto pr-1 -mr-1 min-h-0">
              <!-- DESCRIPTION -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 class="text-xl font-bold text-slate-900 mb-2">{{ currentMoleculeInfo.name }} ({{ currentMoleculeInfo.formula }})</h3>
                <p class="text-slate-600 text-sm leading-relaxed">{{ currentMoleculeInfo.description }}</p>
              </div>

              <!-- STEP-BY-STEP PANELS -->
              <div class="space-y-3">
                <div ref="step0Ref" class="bg-white border rounded-xl p-4 relative overflow-hidden transition-all duration-500 shadow-sm"
                     :class="animationPhase === 0 ? 'ring-2 ring-amber-500/50 border-amber-300' : 'border-slate-200'">
                  <div class="absolute left-0 top-0 bottom-0 w-1" :class="animationPhase === 0 ? 'bg-amber-500' : 'bg-slate-200'"></div>
                  <h4 class="font-bold text-slate-900 flex items-center gap-2 mb-2"><PhInfo class="text-amber-500"/> Stap 1: Het Begin</h4>
                  <p class="text-sm text-slate-600">De atomen zijn in hun neutrale grondtoestand, met hun valentie-elektronen.</p>
                </div>
                
                <div ref="step1Ref" class="bg-white border rounded-xl p-4 relative overflow-hidden transition-all duration-500 shadow-sm"
                     :class="animationPhase === 1 ? 'ring-2 ring-rose-500/50 border-rose-300' : 'border-slate-200'">
                  <div class="absolute left-0 top-0 bottom-0 w-1" :class="animationPhase === 1 ? 'bg-rose-500' : 'bg-slate-200'"></div>
                  <h4 class="font-bold text-rose-600 flex items-center gap-2 mb-2"><PhArrowsDownUp /> Stap 2: Transfer</h4>
                  <p class="text-sm text-slate-600">Het metaal geeft zijn valentie-elektron(en) af aan het niet-metaal. Kijk hoe de elektronen bewegen!</p>
                </div>

                <div ref="step2Ref" class="bg-white border rounded-xl p-4 relative overflow-hidden transition-all duration-500 shadow-sm"
                     :class="animationPhase === 2 ? 'ring-2 ring-emerald-500/50 border-emerald-300' : 'border-slate-200'">
                  <div class="absolute left-0 top-0 bottom-0 w-1" :class="animationPhase === 2 ? 'bg-emerald-500' : 'bg-slate-200'"></div>
                  <h4 class="font-bold text-emerald-600 flex items-center gap-2 mb-2"><PhCheckCircle /> Stap 3: Ionen gevormd</h4>
                  <p class="text-sm text-slate-600">Er zijn nu ionen gevormd. De positieve en negatieve ladingen trekken elkaar sterk aan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SVG CANVAS -->
        <div class="flex-1 relative bg-gradient-to-br from-slate-100 via-white to-slate-100 flex items-center justify-center">
          <div class="relative w-[500px] h-[500px]">
            <svg viewBox="0 0 400 400" class="w-full h-full drop-shadow-2xl overflow-visible">
              
              <!-- ATOMS -->
              <g v-for="atom in layout.atoms" :key="atom.id">
                <!-- Atom symbol -->
                <text :x="atom.x" :y="atom.y" text-anchor="middle" dominant-baseline="central" :fill="atom.color" font-weight="bold" font-size="32" font-family="monospace">{{ atom.symbol }}</text>
                
                <!-- VALENCE ELECTRONS for metals (shown in phase 0) - FIXED -->
                <g v-if="atom.symbol !== 'Cl' && animationPhase === 0" :fill="atom.color">
                  <!-- Na: 1 electron on the right side (toward Cl) -->
                  <circle v-if="atom.symbol === 'Na'" :cx="atom.x + 35" :cy="atom.y" r="4.5" />
                  
                  <!-- Mg: 2 electrons, top and bottom -->
                  <circle v-if="atom.symbol === 'Mg'" :cx="atom.x" :cy="atom.y - 35" r="4.5" />
                  <circle v-if="atom.symbol === 'Mg'" :cx="atom.x" :cy="atom.y + 35" r="4.5" />
                  
                  <!-- Al: 3 electrons, left, right, and bottom -->
                  <circle v-if="atom.symbol === 'Al'" :cx="atom.x - 35" :cy="atom.y" r="4.5" />
                  <circle v-if="atom.symbol === 'Al'" :cx="atom.x + 35" :cy="atom.y" r="4.5" />
                  <circle v-if="atom.symbol === 'Al'" :cx="atom.x" :cy="atom.y + 35" r="4.5" />
                </g>
                
                <!-- VALENCE ELECTRONS for Cl -->
                <g v-if="atom.symbol === 'Cl'" :fill="atom.color">
                   <!-- Top Pair -->
                   <rect v-if="atom.openSide !== 'top'" :x="atom.x - 12" :y="atom.y - 40" width="24" height="9" rx="4.5" />
                   <!-- Original unpaired electron - always show as circle at openSide -->
                   <circle v-if="atom.openSide === 'top'" :cx="atom.x" :cy="atom.y - 35" r="4.5" />
                   
                   <!-- Bottom Pair -->
                   <rect v-if="atom.openSide !== 'bottom'" :x="atom.x - 12" :y="atom.y + 31" width="24" height="9" rx="4.5" />
                   <circle v-if="atom.openSide === 'bottom'" :cx="atom.x" :cy="atom.y + 35" r="4.5" />
                   
                   <!-- Left Pair -->
                   <rect v-if="atom.openSide !== 'left'" :x="atom.x - 40" :y="atom.y - 12" width="9" height="24" rx="4.5" />
                   <circle v-if="atom.openSide === 'left'" :cx="atom.x - 35" :cy="atom.y" r="4.5" />
                   
                   <!-- Right Pair -->
                   <rect v-if="atom.openSide !== 'right'" :x="atom.x + 31" :y="atom.y - 12" width="9" height="24" rx="4.5" />
                   <circle v-if="atom.openSide === 'right'" :cx="atom.x + 35" :cy="atom.y" r="4.5" />
                </g>
                
                <!-- NEW ELECTRONS (from metal) - shown as circles in phase 2, positioned next to original -->
                <g v-if="atom.symbol === 'Cl' && animationPhase === 2">
                   <g :fill="currentMoleculeInfo.atoms[0].color">
                    <!-- Position new electron NEXT TO the original one -->
                    <circle v-if="atom.openSide === 'top'" :cx="atom.x + 10" :cy="atom.y - 35" r="4.5" />
                    <circle v-if="atom.openSide === 'bottom'" :cx="atom.x - 10" :cy="atom.y + 35" r="4.5" />
                    <circle v-if="atom.openSide === 'left'" :cx="atom.x - 35" :cy="atom.y + 10" r="4.5" />
                    <circle v-if="atom.openSide === 'right'" :cx="atom.x + 35" :cy="atom.y + 10" r="4.5" />
                  </g>
                </g>

                <!-- ION NOTATION -->
                <g v-if="animationPhase >= 2" class="animate-fade-in">
                  <!-- Brackets for metal ions -->
                  <path :d="`M ${atom.x - 20} ${atom.y - 30} H ${atom.x - 28} V ${atom.y + 30} H ${atom.x - 20}`" fill="none" stroke="rgba(15, 23, 42, 0.4)" stroke-width="2" v-if="atom.symbol !== 'Cl'"/>
                  <path :d="`M ${atom.x + 20} ${atom.y - 30} H ${atom.x + 28} V ${atom.y + 30} H ${atom.x + 20}`" fill="none" stroke="rgba(15, 23, 42, 0.4)" stroke-width="2" v-if="atom.symbol !== 'Cl'"/>
                  <!-- Brackets for Cl ions -->
                  <path :d="`M ${atom.x - 40} ${atom.y - 45} H ${atom.x - 50} V ${atom.y + 45} H ${atom.x - 40}`" fill="none" stroke="rgba(15, 23, 42, 0.4)" stroke-width="2" v-if="atom.symbol === 'Cl'"/>
                  <path :d="`M ${atom.x + 40} ${atom.y - 45} H ${atom.x + 50} V ${atom.y + 45} H ${atom.x + 40}`" fill="none" stroke="rgba(15, 23, 42, 0.4)" stroke-width="2" v-if="atom.symbol === 'Cl'"/>
                  
                  <!-- Charge for metal ions -->
                  <circle :cx="atom.x + 28" :cy="atom.y - 35" r="12" :fill="atom.color" v-if="atom.symbol !== 'Cl'" />
                  <text :x="atom.x + 28" :y="atom.y - 34" text-anchor="middle" dominant-baseline="central" fill="#fff" font-weight="bold" font-size="16" font-family="sans-serif" v-if="atom.symbol !== 'Cl'">{{ atom.finalCharge }}</text>
                  
                  <!-- Charge for Cl ions -->
                  <circle :cx="atom.x + 50" :cy="atom.y - 45" r="12" :fill="atom.color" v-if="atom.symbol === 'Cl'"/>
                  <text :x="atom.x + 50" :y="atom.y - 44" text-anchor="middle" dominant-baseline="central" fill="#fff" font-weight="bold" font-size="16" font-family="sans-serif" v-if="atom.symbol === 'Cl'">{{ atom.finalCharge }}</text>
                </g>
              </g>

              <!-- ELECTRON TRAILS (only visible during transfer) -->
              <g v-if="animationPhase === 1">
                <circle v-for="trail in electronTrails" :key="trail.id"
                  :cx="trail.x" :cy="trail.y" r="3"
                  :fill="trail.color"
                  :opacity="trail.opacity"
                />
              </g>
              
              <!-- MOVING ELECTRONS -->
              <g v-if="animationPhase === 1">
                <circle v-for="e in layout.movingElectrons" :key="e.id"
                  :cx="e.x" :cy="e.y" r="5"
                  :fill="e.color"
                />
              </g>

            </svg>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.animate-fade-in { 
  animation: fadeIn 0.6s ease-out forwards; 
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
