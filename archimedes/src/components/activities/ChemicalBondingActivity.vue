<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { PhX, PhAtom, PhLink, PhPlayCircle, PhInfo } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Covalente Bindingen' }
})

const emit = defineEmits(['close', 'complete'])

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
const currentMolecule = ref('H2') // 'H2' of 'H2O'
const animationPhase = ref(0) // 0: Los, 1: Naderen, 2: Overlap/Delen, 3: Compleet
const step0Ref = ref(null)
const step1Ref = ref(null)
const step2Ref = ref(null)

// --- Data ---
const molecules = {
  H2: {
    id: 'H2',
    name: 'Waterstofgas (H₂)',
    description: 'Twee waterstofatomen hebben elk 1 elektron. Ze hebben er allebei 2 nodig voor een volle schil.',
    color: '#38bdf8'
  },
  H2O: {
    id: 'H2O',
    name: 'Water (H₂O)',
    description: 'Zuurstof komt 2 elektronen tekort in zijn buitenste schil. Het moet dus met twee waterstofatomen delen.',
    color: '#ef4444'
  }
}

// Speel de animatie af
const playAnimation = () => {
  animationPhase.value = 0
  setTimeout(() => { animationPhase.value = 1 }, 500)
  setTimeout(() => { animationPhase.value = 2 }, 2000)
  setTimeout(() => { animationPhase.value = 3 }, 3500)
}

watch(currentMolecule, () => {
  animationPhase.value = 0
})

// Auto-scroll to active step
watch(animationPhase, (phase) => {
  nextTick(() => {
    const stepRefs = [step0Ref.value, step1Ref.value, step2Ref.value]
    if (phase < 3 && stepRefs[phase]) {
      stepRefs[phase].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
})

// --- SVG Coördinaten & Transities ---
// We gebruiken vaste SVG viewBox van 400x400. Midden is 200,200.
const getLayout = () => {
  const phase = animationPhase.value
  const isH2 = currentMolecule.value === 'H2'
  
  if (isH2) {
    // H2 Layout
    const distance = phase === 0 ? 80 : (phase === 1 ? 40 : 25) // Afstand vanaf centrum
    return {
      atoms: [
        { id: 'H1', symbol: 'H', z: 1, x: 200 - distance, y: 200, color: '#38bdf8', r: 30 },
        { id: 'H2', symbol: 'H', z: 1, x: 200 + distance, y: 200, color: '#38bdf8', r: 30 }
      ],
      electrons: [
        // H1 elektron (links)
        { x: phase >= 2 ? 200 : 200 - distance + 30, y: phase >= 2 ? 185 : 200, color: '#38bdf8' },
        // H2 elektron (rechts)
        { x: phase >= 2 ? 200 : 200 + distance - 30, y: phase >= 2 ? 215 : 200, color: '#38bdf8' }
      ]
    }
  } else {
    // H2O Layout
    const o_cx = 200, o_cy = 200;
    const o_outer_shell_r = 55;
    const h_radius = 25;
    
    const h_dist_initial = 120;
    const h_dist_approach = 80;
    const h_dist_final = phase >= 2 ? 70 : o_outer_shell_r; // Move H further out in bonded state to avoid overlap with electron pairs
    
    const h1_x_pos = o_cx - (phase === 0 ? h_dist_initial : (phase === 1 ? h_dist_approach : h_dist_final));
    const h2_y_pos = o_cy + (phase === 0 ? h_dist_initial : (phase === 1 ? h_dist_approach : h_dist_final));

    // Aanpassing 1: Verberg de H-schil na de binding
    const h_shell_radius = phase >= 2 ? 0 : h_radius;

    const atoms = [
        { id: 'O1', symbol: 'O', z: 8, x: o_cx, y: o_cy, color: '#ef4444', shells: [25, o_outer_shell_r] },
        { id: 'H1', symbol: 'H', z: 1, x: h1_x_pos, y: o_cy, color: '#38bdf8', r: h_shell_radius },
        { id: 'H2', symbol: 'H', z: 1, x: o_cx, y: h2_y_pos, color: '#38bdf8', r: h_shell_radius }
    ];

    // Aanpassing 2: Stabiele elektronen-array voor correcte animatie
    const o_inner_e = [
        { x: o_cx, y: o_cy - 25, color: '#ef4444' }, 
        { x: o_cx, y: o_cy + 25, color: '#ef4444' }
    ];

    const o_lone_pairs = [
        { x: o_cx - 5, y: o_cy - o_outer_shell_r, color: '#ef4444' }, // Noord
        { x: o_cx + 5, y: o_cy - o_outer_shell_r, color: '#ef4444' },
        { x: o_cx + o_outer_shell_r, y: o_cy - 5, color: '#ef4444' }, // Oost
        { x: o_cx + o_outer_shell_r, y: o_cy + 5, color: '#ef4444' }
    ];

    let o_h1_bond_e, h1_bond_e, o_h2_bond_e, h2_bond_e;

    if (phase < 2) {
        // Fase 0 & 1: Pre-bonding state
        o_h1_bond_e = { x: o_cx - o_outer_shell_r, y: o_cy, color: '#ef4444' }; // O's West electron
        o_h2_bond_e = { x: o_cx, y: o_cy + o_outer_shell_r, color: '#ef4444' }; // O's South electron
        
        const h1_e_x = o_cx - (phase === 0 ? h_dist_initial : h_dist_approach) + h_radius;
        h1_bond_e = { x: h1_e_x, y: o_cy, color: '#38bdf8' }; // H1's electron
        
        const h2_e_y = o_cy + (phase === 0 ? h_dist_initial : h_dist_approach) - h_radius;
        h2_bond_e = { x: o_cx, y: h2_e_y, color: '#38bdf8' }; // H2's electron
    } else {
        // Fase 2 & 3: Bonded state
        // O-H1 pair (West)
        o_h1_bond_e = { x: o_cx - o_outer_shell_r, y: o_cy - 3, color: '#ef4444' };
        h1_bond_e   = { x: o_cx - o_outer_shell_r, y: o_cy + 3, color: '#38bdf8' };
        
        // O-H2 pair (South)
        o_h2_bond_e = { x: o_cx - 3, y: o_cy + o_outer_shell_r, color: '#ef4444' };
        h2_bond_e   = { x: o_cx + 3, y: o_cy + o_outer_shell_r, color: '#38bdf8' };
    }
    
    // Assembleer de elektronen in een VASTE VOLGORDE
    const electrons = [
        ...o_inner_e,
        ...o_lone_pairs,
        o_h1_bond_e, // O's West elektron
        h1_bond_e,   // H1's elektron
        o_h2_bond_e, // O's Zuid elektron
        h2_bond_e    // H2's elektron
    ];
    
    return { atoms, electrons };
  }
}

const layout = computed(() => getLayout())

</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-900 font-sans">
      <div class="h-16 bg-slate-900 border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/30">
            <PhLink class="text-xl text-white" weight="bold" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-white">{{ title }}</h1>
            <p class="text-sm text-slate-300">Ontdek hoe niet-metalen elektronen delen</p>
          </div>
        </div>
        <button @click="emit('close')" class="p-2 text-slate-400 hover:text-rose-500 transition-colors">
          <PhX weight="bold" class="text-xl" />
        </button>
      </div>

      <div class="flex-1 flex overflow-hidden">
        
        <div class="w-96 bg-white border-r border-slate-200 flex flex-col z-10">
          
          <div class="p-6 flex-1 flex flex-col gap-4 overflow-hidden">
            
            <!-- START ANIMATION BUTTON - AT TOP -->
            <button 
              @click="playAnimation" 
              class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <PhPlayCircle weight="fill" class="text-2xl" /> 
              Start Binding Animatie
            </button>
            
            <!-- MOLECULE SELECTOR -->
            <div class="flex gap-2">
              <button 
                @click="currentMolecule = 'H2'"
                class="flex-1 py-3 rounded-lg font-bold transition-all border"
                :class="currentMolecule === 'H2' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'"
              >H₂</button>
              <button 
                @click="currentMolecule = 'H2O'"
                class="flex-1 py-3 rounded-lg font-bold transition-all border"
                :class="currentMolecule === 'H2O' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'"
              >H₂O</button>
            </div>
            
            <!-- SCROLLABLE CONTENT AREA -->
            <div class="flex flex-col gap-4 flex-1 overflow-y-auto pr-1 -mr-1 min-h-0">
              
              <!-- DESCRIPTION -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 class="text-xl font-bold text-slate-900 mb-2">{{ molecules[currentMolecule].name }}</h3>
                <p class="text-slate-600 text-sm leading-relaxed">{{ molecules[currentMolecule].description }}</p>
              </div>

              <!-- STEP-BY-STEP PANELS -->
              <div class="space-y-3">
                <div ref="step0Ref" class="bg-white border rounded-xl p-4 relative overflow-hidden transition-all duration-500 shadow-sm"
                     :class="animationPhase === 0 ? 'ring-2 ring-amber-500/50 border-amber-300' : 'border-slate-200'">
                  <div class="absolute left-0 top-0 bottom-0 w-1" :class="animationPhase === 0 ? 'bg-amber-500' : 'bg-slate-200'"></div>
                  <h4 class="font-bold text-slate-900 flex items-center gap-2 mb-2"><PhInfo class="text-amber-500"/> Het Probleem</h4>
                  <p class="text-sm text-slate-600">Kijk naar de buitenste schillen. Ze zijn niet vol! Geen van beide atomen wil elektronen afgeven.</p>
                </div>

                <div ref="step1Ref" class="bg-white border rounded-xl p-4 relative overflow-hidden transition-all duration-500 shadow-sm"
                     :class="animationPhase === 1 ? 'ring-2 ring-amber-500/50 border-amber-300' : 'border-slate-200'">
                  <div class="absolute left-0 top-0 bottom-0 w-1" :class="animationPhase === 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
                  <h4 class="font-bold text-amber-600 flex items-center gap-2 mb-2"><PhInfo /> Naderen...</h4>
                  <p class="text-sm text-slate-600">Omdat ze niet willen afgeven, moeten ze een compromis sluiten. Ze komen dichter naar elkaar toe.</p>
                </div>

                <div ref="step2Ref" class="bg-white border rounded-xl p-4 relative overflow-hidden transition-all duration-500 shadow-sm"
                     :class="animationPhase >= 2 ? 'ring-2 ring-emerald-500/50 border-emerald-300' : 'border-slate-200'">
                  <div class="absolute left-0 top-0 bottom-0 w-1" :class="animationPhase >= 2 ? 'bg-emerald-500' : 'bg-slate-200'"></div>
                  <h4 class="font-bold text-emerald-600 flex items-center gap-2 mb-2"><PhInfo /> De Oplossing: Overlap!</h4>
                  <p class="text-sm text-slate-600">De buitenste schillen <strong>overlappen</strong>. De elektronen in dit gedeelde gebied tellen nu mee voor <em>beide</em> atomen. Iedereen heeft een volle schil!</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        <div class="flex-1 relative bg-gradient-to-br from-slate-100 via-white to-slate-100 flex flex-col items-center justify-center">
          
          <div class="relative w-[500px] h-[500px]">
            <svg viewBox="0 0 400 400" class="w-full h-full drop-shadow-2xl">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <g class="transition-all duration-1000">
                <g v-for="atom in layout.atoms" :key="'shell-'+atom.id">
                  <circle v-if="atom.r" :cx="atom.x" :cy="atom.y" :r="atom.r" fill="none" stroke="rgba(15, 23, 42, 0.15)" stroke-width="1.5" class="transition-all duration-1000 ease-in-out" />
                  <g v-if="atom.shells">
                    <circle v-for="r in atom.shells" :key="r" :cx="atom.x" :cy="atom.y" :r="r" fill="none" stroke="rgba(15, 23, 42, 0.15)" stroke-width="1.5" class="transition-all duration-1000 ease-in-out" />
                  </g>
                </g>

                <g v-for="atom in layout.atoms" :key="'nuc-'+atom.id">
                  <circle :cx="atom.x" :cy="atom.y" r="14" :fill="atom.color" class="transition-all duration-1000 ease-in-out" />
                  <text :x="atom.x" :y="atom.y + 4" text-anchor="middle" fill="#fff" font-weight="bold" font-size="12" font-family="sans-serif" class="transition-all duration-1000">{{ atom.symbol }}</text>
                </g>

                <g v-for="(elec, idx) in layout.electrons" :key="'e-'+idx">
                  <circle 
                    :cx="elec.x" 
                    :cy="elec.y" 
                    r="4" 
                    :fill="elec.color" 
                    filter="url(#glow)"
                    class="transition-all duration-1000 ease-in-out"
                  />
                </g>
                
                <g v-if="animationPhase >= 2" class="animate-fade-in pointer-events-none">
                  <circle v-if="currentMolecule === 'H2'" cx="200" cy="200" r="22" fill="rgba(251, 191, 36, 0.15)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="4,4" />
                  
                  <g v-if="currentMolecule === 'H2O'">
                     <!-- Gedeelde regio indicatoren bij de bindingselectronen, niet bij de H-atoom kernen -->
                    <circle :cx="200 - 55" :cy="200" r="22" fill="rgba(251, 191, 36, 0.15)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="4,4" />
                    <circle :cx="200" :cy="200 + 55" r="22" fill="rgba(251, 191, 36, 0.15)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="4,4" />
                  </g>
                </g>
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
