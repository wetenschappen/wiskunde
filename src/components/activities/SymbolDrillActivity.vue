<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhXCircle, PhArrowLeft, PhTrophy, PhArrowClockwise, PhLightning } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Elementen & Symbolen Drill'
  },
  elements: {
    type: Array,
    default: () => [
      { sym: 'H', name: 'Waterstof' },
      { sym: 'He', name: 'Helium' },
      { sym: 'Li', name: 'Lithium' },
      { sym: 'Be', name: 'Beryllium' },
      { sym: 'B', name: 'Borium' },
      { sym: 'C', name: 'Koolstof' },
      { sym: 'N', name: 'Stikstof' },
      { sym: 'O', name: 'Zuurstof' },
      { sym: 'F', name: 'Fluor' },
      { sym: 'Ne', name: 'Neon' },
      { sym: 'Na', name: 'Natrium' },
      { sym: 'Mg', name: 'Magnesium' },
      { sym: 'Al', name: 'Aluminium' },
      { sym: 'Si', name: 'Silicium' },
      { sym: 'P', name: 'Fosfor' },
      { sym: 'S', name: 'Zwavel' },
      { sym: 'Cl', name: 'Chloor' },
      { sym: 'Ar', name: 'Argon' },
      { sym: 'K', name: 'Kalium' },
      { sym: 'Ca', name: 'Calcium' },
      { sym: 'Fe', name: 'IJzer' },
      { sym: 'Cu', name: 'Koper' },
      { sym: 'Zn', name: 'Zink' },
      { sym: 'Ag', name: 'Zilver' },
      { sym: 'Au', name: 'Goud' },
      { sym: 'Hg', name: 'Kwik' },
      { sym: 'Pb', name: 'Lood' },
      { sym: 'Pt', name: 'Platina' },
      { sym: 'Ni', name: 'Nikkel' },
      { sym: 'Sn', name: 'Tin' },
      { sym: 'Cr', name: 'Chroom' },
      { sym: 'Mn', name: 'Mangaan' },
      { sym: 'Br', name: 'Broom' },
      { sym: 'I', name: 'Jood' },
      { sym: 'Ba', name: 'Barium' },
      { sym: 'U', name: 'Uraan' },
      { sym: 'W', name: 'Wolfraam' },
      { sym: 'Ra', name: 'Radium' },
      { sym: 'Co', name: 'Kobalt' },
      { sym: 'Ti', name: 'Titaan' }
    ]
  },
  fullscreen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'complete'])

// MODES: 'choose', 'sym-to-name', 'name-to-sym', 'results'
const mode = ref('choose')
const currentList = ref([])
const currentIndex = ref(0)
const userInput = ref('')
const feedback = ref(null) // 'correct' | 'incorrect' | null
const score = ref(0)
const startTime = ref(0)
const endTime = ref(0)
const inputRef = ref(null)

const feedbackMessage = ref('')
const correctMessage = ref('')

const currentQuestion = computed(() => currentList.value[currentIndex.value] || {})

const progressPercent = computed(() => {
  if (currentList.value.length === 0) return 0
  return Math.round((currentIndex.value / currentList.value.length) * 100)
})

const timeDisplay = computed(() => {
  const duration = (endTime.value || Date.now()) - startTime.value
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)
  const tenths = Math.floor((duration % 1000) / 100)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`
})

function startDrill(drillMode) {
  mode.value = drillMode
  currentList.value = [...props.elements].sort(() => Math.random() - 0.5)
  currentIndex.value = 0
  userInput.value = ''
  feedback.value = null
  score.value = 0
  startTime.value = Date.now()
  endTime.value = 0

  nextTick(() => {
    focusInput()
  })
}

function focusInput() {
  if (inputRef.value) inputRef.value.focus()
}

// Watch input for "instant" check
watch(userInput, () => {
    if (userInput.value.length > 0 && feedback.value !== 'correct') {
        const user = userInput.value.trim()
        const isSymToName = mode.value === 'sym-to-name'

        const isMatch = isSymToName
            ? user.toLowerCase() === currentQuestion.value.name.toLowerCase()
            : user === currentQuestion.value.sym

        if (isMatch) {
            feedback.value = 'correct'
            score.value++
            setTimeout(nextQuestion, 400) // Slightly longer for the animation to play
        }
    }
})

function handleEnter() {
    if (feedback.value === 'correct') return;

    const user = userInput.value.trim()
    const isSymToName = mode.value === 'sym-to-name'

    const isMatch = isSymToName
        ? user.toLowerCase() === currentQuestion.value.name.toLowerCase()
        : user === currentQuestion.value.sym

    if (!isMatch) {
        feedback.value = 'incorrect'
        if (isSymToName) {
            feedbackMessage.value = `Tip: de naam van dit element begint met een '${currentQuestion.value.name[0]}'.`;
        } else { // name-to-sym
            if (user.toLowerCase() === currentQuestion.value.sym.toLowerCase()) {
                feedbackMessage.value = 'Bijna! Let op de hoofdletters.';
            } else {
                feedbackMessage.value = `Tip: het symbool heeft ${currentQuestion.value.sym.length} letter${currentQuestion.value.sym.length > 1 ? 's' : ''}.`;
            }
        }
        setTimeout(() => {
            feedback.value = null
            feedbackMessage.value = ''
            // Don't clear input, let user correct it
        }, 1500)
    }
}

function nextQuestion() {
  if (currentIndex.value < currentList.value.length - 1) {
    // Eerst de staat van de vorige vraag opruimen om flikkering te voorkomen
    userInput.value = ''
    feedback.value = null
    correctMessage.value = ''

    // Dan pas doorgaan naar de volgende vraag
    currentIndex.value++
    nextTick(focusInput)
  } else {
    finishDrill()
  }
}

function finishDrill() {
  endTime.value = Date.now()
  mode.value = 'results'
}

function resetActivity() {
  mode.value = 'choose'
  currentList.value = []
  currentIndex.value = 0
  userInput.value = ''
  feedback.value = null
  feedbackMessage.value = ''
  correctMessage.value = ''
}

function close() {
  emit('close')
}

// FULLSCREEN & PULSE
const shouldPulse = ref(false)

watch(() => props.isOpen, (val) => {
    if (!val) {
        if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
        window.removeEventListener('keydown', handleKeydown)
    } else {
        window.addEventListener('keydown', handleKeydown)
        nextTick(() => {
            shouldPulse.value = true
            setTimeout(() => { shouldPulse.value = false }, 3000)
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

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => {})
    }
})
</script><template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-0 font-sans">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="close"></div>
    
    <div class="relative bg-white shadow-2xl overflow-hidden flex flex-col w-screen h-screen rounded-none text-slate-800"
         @click.stop>
      
      <!-- Header -->
      <div class="bg-amber-500 px-6 py-4 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3">
          <div class="bg-white/20 p-2 rounded-lg text-white">
            <PhLightning weight="fill" class="text-xl"/>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white m-0">{{ title }}</h3>
            <p v-if="mode !== 'choose'" class="text-xs text-white/70 font-medium m-0">{{ mode === 'sym-to-name' ? 'Symbool → Naam' : 'Naam → Symbool' }}</p>
          </div>
        </div>
        
        <div v-if="mode !== 'choose' && mode !== 'results'" class="hidden md:flex items-center gap-8 px-6">
            <div class="text-center">
                <p class="text-[10px] uppercase font-bold text-white/70 tracking-wider leading-none mb-1">Voortgang</p>
                <p class="text-lg font-bold font-mono leading-none text-white">{{ currentIndex + 1 }}/{{ currentList.length }}</p>
            </div>
            <div class="text-center">
                <p class="text-[10px] uppercase font-bold text-white/70 tracking-wider leading-none mb-1">Tijd</p>
                <p class="text-lg font-bold font-mono leading-none text-white">{{ timeDisplay }}</p>
            </div>
        </div>

        <button @click="close" 
                class="text-white/70 hover:text-white p-2 rounded-full transition-all">
          <PhX class="text-2xl" />
        </button>
      </div>

      <!-- Main Body -->
      <div class="flex-1 overflow-y-auto relative flex items-center justify-center p-6 bg-slate-50">
        
        <!-- MODE: CHOOSE -->
        <div v-if="mode === 'choose'" class="max-w-4xl w-full p-8 animate-in fade-in zoom-in-sm duration-500">
            <h2 class="text-4xl md:text-5xl font-black text-center mb-4 tracking-tighter text-slate-800">KIES JE <span class="text-indigo-600">DRILL</span></h2>
            <p class="text-slate-500 text-center mb-12 text-lg">Oefen de 40 belangrijkste elementen met maximale snelheid.</p>
            
            <div class="grid md:grid-cols-2 gap-6">
                <button @click="startDrill('sym-to-name')" 
                        class="group relative bg-white border-2 border-slate-200 hover:border-indigo-500/80 p-8 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10 text-left">
                    <div class="text-5xl font-black text-indigo-600 mb-6 group-hover:scale-110 transition-transform origin-left">H → ?</div>
                    <h3 class="text-2xl font-bold mb-2 text-slate-800">Symbool → Naam</h3>
                    <p class="text-slate-500">Typ de volledige naam van het element (bv. Waterstof).</p>
                    <div class="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <PhLightning weight="fill" class="text-3xl text-indigo-500 animate-pulse-fast" />
                    </div>
                </button>
                
                <button @click="startDrill('name-to-sym')" 
                        class="group relative bg-white border-2 border-slate-200 hover:border-emerald-500/80 p-8 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/10 text-left">
                    <div class="text-5xl font-black text-emerald-500 mb-6 group-hover:scale-110 transition-transform origin-left">? ← Waterstof</div>
                    <h3 class="text-2xl font-bold mb-2 text-slate-800">Naam → Symbool</h3>
                    <p class="text-slate-500">Typ enkel het symbool van het element (bv. H of Na).</p>
                     <div class="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <PhLightning weight="fill" class="text-3xl text-emerald-500 animate-pulse-fast" />
                    </div>
                </button>
            </div>

            <div class="mt-12 p-6 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-4">
                <PhLightning weight="bold" class="text-2xl text-indigo-500" />
                <p class="text-sm text-indigo-700"><strong>Instant Feedback:</strong> Zodra je het juiste antwoord typt, vlieg je automatisch door naar de volgende vraag.</p>
            </div>
        </div>

        <!-- MODE: DRILL -->
        <div v-else-if="mode === 'sym-to-name' || mode === 'name-to-sym'" class="w-full max-w-2xl px-6 py-12 flex flex-col items-center gap-8">
            <!-- Progress Circle (Mobile) -->
            <div class="md:hidden flex items-center gap-4 text-slate-500 font-medium">
                 <span>{{ currentIndex + 1 }} / {{ currentList.length }}</span>
                 <span>•</span>
                 <span>{{ timeDisplay }}</span>
            </div>

            <!-- The Big Prompt -->
            <div class="relative w-full aspect-[21/9] bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center p-8 overflow-hidden group shadow-lg">
                 <div class="text-center z-10">
                    <div v-if="mode === 'sym-to-name'" class="text-[10rem] md:text-[12rem] font-black text-slate-800 tracking-tighter leading-none select-none transition-transform group-hover:scale-105 duration-700">
                        {{ currentQuestion.sym }}
                    </div>
                    <div v-else class="text-5xl md:text-7xl font-black text-slate-800 tracking-tight leading-tight select-none px-4">
                        {{ currentQuestion.name }}
                    </div>
                 </div>

                 <!-- Success Indicator -->
                 <div class="absolute inset-0 bg-emerald-400/90 opacity-0 transition-opacity duration-200 flex items-center justify-center pointer-events-none" 
                      :class="{ 'opacity-100': feedback === 'correct' }">
                    <span v-if="feedback === 'correct'" class="text-white text-5xl font-black tracking-tight select-none animate-in fade-in zoom-in-sm duration-200">
                        {{ correctMessage }}
                    </span>
                 </div>
            </div>

            <!-- Input Area -->
            <div class="w-full relative">
                <input 
                    ref="inputRef"
                    v-model="userInput"
                    @keydown.enter="handleEnter"
                    type="text"
                    spellcheck="false"
                    class="w-full bg-white border-2 border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/20 rounded-xl md:rounded-2xl p-6 md:p-8 text-3xl md:text-5xl font-black text-center outline-none transition-all placeholder:text-slate-400"
                    :class="{ 
                        'border-emerald-500 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-500/20': feedback === 'correct',
                        'border-red-500 bg-red-50 text-red-700 animate-shake ring-4 ring-red-500/20': feedback === 'incorrect'
                    }"
                    :placeholder="mode === 'sym-to-name' ? 'Naam...' : 'Symbool...'"
                    autofocus
                    autocomplete="off"
                />
                
                <!-- Feedback Toast -->
                <div v-if="feedback === 'incorrect' && feedbackMessage" class="absolute -bottom-12 left-0 right-0 text-center">
                    <p class="text-red-600 font-medium text-sm bg-white/50 backdrop-blur-sm px-3 py-1 rounded-md inline-block">{{ feedbackMessage }}</p>
                </div>
            </div>

            <!-- Controls -->
            <div class="flex items-center gap-4 mt-4">
                <button @click="resetActivity" class="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-slate-100">
                    <PhArrowLeft weight="bold" /> Stop Drill
                </button>
            </div>
        </div>

        <!-- MODE: RESULTS -->
        <div v-else-if="mode === 'results'" class="max-w-2xl w-full p-8 text-center animate-in fade-in zoom-in-sm duration-500">
            <div class="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/30 animate-in fade-in zoom-in duration-700">
                <PhTrophy weight="fill" class="text-5xl text-white" />
            </div>
            
            <h2 class="text-5xl font-black text-slate-800 mb-2 tracking-tighter">BOEM! VOLTOOID.</h2>
            <p class="text-amber-600 font-bold uppercase tracking-widest mb-12">Nieuw Persoonlijk Record?</p>
            
            <div class="grid grid-cols-2 gap-4 mb-12">
                <div class="bg-slate-100 p-6 rounded-2xl border-2 border-slate-200">
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Totale Tijd</p>
                    <p class="text-4xl font-black font-mono text-slate-700">{{ timeDisplay }}</p>
                </div>
                <div class="bg-slate-100 p-6 rounded-2xl border-2 border-slate-200">
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Aantal</p>
                    <p class="text-4xl font-black font-mono text-slate-700">{{ currentList.length }}</p>
                </div>
            </div>

            <div class="flex flex-col md:flex-row gap-4">
                <button @click="resetActivity" class="flex-1 py-4 bg-slate-200 hover:bg-slate-300/80 rounded-xl font-bold text-lg text-slate-700 transition-colors flex items-center justify-center gap-2">
                    <PhArrowClockwise weight="bold" /> Opnieuw
                </button>
                <button @click="close" class="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg text-white shadow-lg shadow-indigo-500/20 transition-all">
                    Sluiten
                </button>
            </div>
        </div>

      </div>

      <!-- Footer / Mini Progress -->
      <div v-if="mode !== 'choose' && mode !== 'results'" class="h-1 bg-slate-200 shrink-0">
        <div 
          class="h-full bg-indigo-600 transition-all duration-300 ease-out" 
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in { animation-duration: 0.5s; animation-fill-mode: both; }
.fade-in { animation-name: fadeIn; }
.zoom-in-sm { animation-name: zoomInSm; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoomInSm { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
}
.animate-shake {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes pulse-fast {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}
.animate-pulse-fast {
    animation: pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

input::placeholder {
    opacity: 1;
}
</style>