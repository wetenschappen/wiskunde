<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { PhX, PhGridFour, PhPlayCircle, PhInfo, PhWaves, PhLightning, PhAtom } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Metaalbinding: De Elektronenzee' }
})

const emit = defineEmits(['close'])

// --- Fullscreen Management ---
watch(() => props.isOpen, (val) => {
  if (val && !document.fullscreenElement) {
    nextTick(() => document.documentElement.requestFullscreen().catch(() => {}));
  } else if (!val && document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}, { immediate: true })

onUnmounted(() => {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value);
})

// --- App State ---
const animationPhase = ref(0) // 0: Rooster, 1: Delokalisatie, 2: Zee
const selectedMetal = ref('Mg')
const animationFrameId = ref(null)
const step0Ref = ref(null)
const step1Ref = ref(null)
const step2Ref = ref(null)
let lastTime = 0 // For framerate-independent animation

const metals = {
  Na: {
    name: 'Natrium',
    symbol: 'Na',
    valence: 1,
    color: '#fb923c', // Oranje
    charge: '+',
    description: 'Natrium heeft 1 valentie-elektron per atoom. In een metaalrooster laten deze elektronen los, waardoor een zee van elektronen ontstaat rondom de Na+ ionen.'
  },
  Mg: {
    name: 'Magnesium',
    symbol: 'Mg',
    valence: 2,
    color: '#60a5fa', // Blauw
    charge: '2+',
    description: 'Magnesium staat 2 elektronen per atoom af aan de elektronenzee. Dit zorgt voor een sterkere metaalbinding dan bij natrium.'
  },
  Al: {
    name: 'Aluminium',
    symbol: 'Al',
    valence: 3,
    color: '#c084fc', // Paars
    charge: '3+',
    description: 'Aluminium levert maar liefst 3 elektronen per atoom aan de zee. De resulterende Al3+ ionen worden sterk bijeengehouden door deze dichte elektronenwolk.'
  }
}

const currentMetal = computed(() => metals[selectedMetal.value])

// --- Rooster Generatie ---
const gridCols = 3
const gridRows = 3
const spacing = 80
const startX = 200 - spacing // 120
const startY = 200 - spacing // 120

const atoms = computed(() => {
  const arr = []
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      arr.push({
        id: `atom-${row}-${col}`,
        x: startX + col * spacing,
        y: startY + row * spacing
      })
    }
  }
  return arr
})

const freeElectrons = ref([])

const initElectrons = () => {
  const eList = []
  const metal = metals[selectedMetal.value]
  
  atoms.value.forEach(atom => {
    for (let i = 0; i < metal.valence; i++) {
      const angle = (Math.PI * 2 / metal.valence) * i;
      const offset = 20;
      eList.push({
        id: `e-${atom.id}-${i}`,
        baseX: atom.x + Math.cos(angle) * offset,
        baseY: atom.y + Math.sin(angle) * offset,
        x: atom.x + Math.cos(angle) * offset,
        y: atom.y + Math.sin(angle) * offset,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3
      })
    }
  })
  freeElectrons.value = eList
}

watch(selectedMetal, () => {
  animationPhase.value = 0
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value)
  lastTime = 0; // Reset timer for new animation
  initElectrons()
}, { immediate: true })

// Auto-scroll to active step
watch(animationPhase, (phase) => {
  nextTick(() => {
    const stepRefs = [step0Ref.value, step1Ref.value, step2Ref.value]
    if (stepRefs[phase]) {
      stepRefs[phase].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
})

const animateElectrons = () => {
  const minX = 60, maxX = 340;
  const minY = 60, maxY = 340;

  const animate = (timestamp) => {
    if (lastTime === 0) {
        lastTime = timestamp;
    }
    const deltaTime = (timestamp - lastTime) / 16; // Normalize to 60fps
    lastTime = timestamp;

    if (deltaTime > 0) {
        freeElectrons.value.forEach(e => {
            e.x += e.vx * deltaTime;
            e.y += e.vy * deltaTime;

            // Improved bouncing logic with clamping
            if (e.x <= minX) { e.x = minX; e.vx *= -1; }
            else if (e.x >= maxX) { e.x = maxX; e.vx *= -1; }

            if (e.y <= minY) { e.y = minY; e.vy *= -1; }
            else if (e.y >= maxY) { e.y = maxY; e.vy *= -1; }
        });
    }
    animationFrameId.value = requestAnimationFrame(animate);
  }
  animationFrameId.value = requestAnimationFrame(animate);
}

const playAnimation = () => {
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value)
  lastTime = 0; // Reset timer for new animation
  initElectrons()
  animationPhase.value = 0
  
  setTimeout(() => { animationPhase.value = 1 }, 1000)
  
  setTimeout(() => {
    animationPhase.value = 2
    animateElectrons()
  }, 2500)
}

</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      <div class="h-16 bg-slate-900 border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/30">
            <PhGridFour class="text-xl text-white" weight="bold" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-white">{{ title }}</h1>
            <p class="text-sm text-slate-300">Ontdek hoe metalen atoomkernen en valentie-elektronen zich gedragen</p>
          </div>
        </div>
        <button @click="emit('close')" class="p-2 text-slate-400 hover:text-rose-500 transition-colors">
          <PhX weight="bold" class="text-xl" />
        </button>
      </div>

      <div class="flex-1 flex overflow-hidden">
        
        <div class="w-96 bg-white border-r border-slate-200 flex flex-col z-10">
          <div class="p-6 flex-1 flex flex-col gap-4 overflow-hidden">
            
            <button @click="playAnimation" class="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center gap-2 active:scale-95">
              <PhPlayCircle weight="fill" class="text-2xl" /> 
              Start Rooster Animatie
            </button>
            
            <div class="flex gap-2">
              <button 
                v-for="metal in Object.keys(metals)" :key="metal"
                @click="selectedMetal = metal"
                class="flex-1 py-3 rounded-lg font-bold transition-all border"
                :class="selectedMetal === metal ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'"
              >{{ metal }}</button>
            </div>
            
            <div class="flex flex-col gap-4 flex-1 overflow-y-auto pr-1 -mr-1 min-h-0">
              
              <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 class="text-xl font-bold text-slate-900 mb-2">{{ currentMetal.name }} ({{ currentMetal.symbol }})</h3>
                <p class="text-slate-600 text-sm leading-relaxed">{{ currentMetal.description }}</p>
              </div>

              <div class="space-y-3">
                <div ref="step0Ref" class="bg-white border rounded-xl p-4 relative overflow-hidden transition-all duration-500 shadow-sm"
                     :class="animationPhase === 0 ? 'ring-2 ring-sky-500/50 border-sky-300' : 'border-slate-200'">
                  <div class="absolute left-0 top-0 bottom-0 w-1" :class="animationPhase === 0 ? 'bg-sky-500' : 'bg-slate-200'"></div>
                  <h4 class="font-bold text-slate-900 flex items-center gap-2 mb-2"><PhAtom class="text-sky-500"/> Het Stabiele Rooster</h4>
                  <p class="text-sm text-slate-600">In een vast metaal vormen de atomen een strak, geordend rooster. De valentie-elektronen zijn nog dicht bij hun 'eigen' atoomkern.</p>
                </div>

                <div ref="step1Ref" class="bg-white border rounded-xl p-4 relative overflow-hidden transition-all duration-500 shadow-sm"
                     :class="animationPhase === 1 ? 'ring-2 ring-sky-500/50 border-sky-300' : 'border-slate-200'">
                  <div class="absolute left-0 top-0 bottom-0 w-1" :class="animationPhase === 1 ? 'bg-sky-500' : 'bg-slate-200'"></div>
                  <h4 class="font-bold text-sky-600 flex items-center gap-2 mb-2"><PhWaves /> Delokalisatie</h4>
                  <p class="text-sm text-slate-600">De atomen laten hun valentie-elektronen los. Hierdoor worden de atomen positieve ionen en kunnen de elektronen zich voorbereiden om vrij te bewegen.</p>
                </div>

                <div ref="step2Ref" class="bg-white border rounded-xl p-4 relative overflow-hidden transition-all duration-500 shadow-sm"
                     :class="animationPhase >= 2 ? 'ring-2 ring-emerald-500/50 border-emerald-300' : 'border-slate-200'">
                  <div class="absolute left-0 top-0 bottom-0 w-1" :class="animationPhase >= 2 ? 'bg-emerald-500' : 'bg-slate-200'"></div>
                  <h4 class="font-bold text-emerald-600 flex items-center gap-2 mb-2"><PhLightning /> De Elektronenzee</h4>
                  <p class="text-sm text-slate-600">De losgelaten elektronen bewegen nu kriskras door het rooster als een 'zee'. Deze beweging houdt de positieve ionen bijeen en verklaart waarom metalen stroom geleiden.</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        <div class="flex-1 relative bg-gradient-to-br from-slate-100 via-white to-slate-100 flex items-center justify-center">
            <div class="relative w-[500px] h-[500px]">
                <svg viewBox="0 0 400 400" class="w-full h-full drop-shadow-2xl">
                    <defs>
                        <radialGradient id="sea-glow">
                            <stop offset="20%" :stop-color="currentMetal.color" stop-opacity="0.2" />
                            <stop offset="100%" :stop-color="currentMetal.color" stop-opacity="0" />
                        </radialGradient>
                        <filter id="glow-metal" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                        </filter>
                    </defs>
                    
                    <circle v-if="animationPhase >= 1" cx="200" cy="200" r="180" fill="url(#sea-glow)" class="transition-opacity duration-1000 animate-fade-in" />

                    <g v-for="atom in atoms" :key="atom.id">
                        <circle :cx="atom.x" :cy="atom.y" r="22" :fill="currentMetal.color" class="transition-all duration-500" />
                        
                        <text v-if="animationPhase === 0" :x="atom.x" :y="atom.y" text-anchor="middle" dominant-baseline="central" fill="#fff" font-weight="bold" font-size="16" font-family="sans-serif">
                            {{ currentMetal.symbol }}
                        </text>
                        
                        <text v-else :x="atom.x" :y="atom.y" text-anchor="middle" dominant-baseline="central" fill="#fff" font-weight="bold" font-size="16" font-family="sans-serif" class="animate-fade-in">
                            {{ currentMetal.symbol }}<tspan baseline-shift="super" font-size="10">{{ currentMetal.charge }}</tspan>
                        </text>
                    </g>

                    <g v-for="e in freeElectrons" :key="e.id">
                        <circle 
                            :cx="animationPhase === 0 ? e.baseX : e.x" 
                            :cy="animationPhase === 0 ? e.baseY : e.y" 
                            r="4" 
                            :fill="animationPhase === 0 ? '#475569' : '#eab308'"
                            filter="url(#glow-metal)"
                            class="transition-colors duration-500"
                            :class="{ 'transition-all duration-1000 ease-in-out': animationPhase === 1 }"
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
.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>