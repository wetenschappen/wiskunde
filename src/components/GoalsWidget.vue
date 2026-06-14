<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { PhPlanet, PhFlask, PhMicroscope, PhX, PhCheck, PhPi } from '@phosphor-icons/vue'

const props = defineProps({
  goals: {
    type: Array,
    required: true
  },
  subject: {
    type: String,
    default: 'math'
  },
  lessonId: {
    type: String,
    required: true
  }
})

const iconComponent = computed(() => {
    if (props.subject === 'math') return PhPi
    if (props.subject === 'physics') return PhPlanet
    if (props.subject === 'science') return PhMicroscope
    return PhFlask
})

const isOpen = ref(false)
const hasInteracted = ref(false)
const completedGoals = ref([])

const storageKey = computed(() => `planner-goals-${props.lessonId}`)

onMounted(() => {
    const stored = localStorage.getItem(storageKey.value)
    if (stored) {
        completedGoals.value = JSON.parse(stored)
        // If user has completed goals or interacted before, we can assume they've seen the pulse
        if (completedGoals.value.length > 0) {
             hasInteracted.value = true
        }
    }
})

const toggle = () => {
    isOpen.value = !isOpen.value
    if (!hasInteracted.value) hasInteracted.value = true
}

watch(isOpen, (val) => {
    if (val) {
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
    }
})

watch(completedGoals, (val) => {
    localStorage.setItem(storageKey.value, JSON.stringify(val))
}, { deep: true })


const toggleGoal = (index) => {
    if (completedGoals.value.includes(index)) {
        completedGoals.value = completedGoals.value.filter(i => i !== index)
    } else {
        completedGoals.value.push(index)
    }
}
</script>

<template>
  <div>
    <!-- FAB Button Area -->
    <div class="fixed bottom-6 left-6 z-40 group">
        
        <!-- Dramatic Radar Ping Effect -->
        <div v-if="!hasInteracted" class="absolute inset-0 rounded-full bg-amber-500 opacity-75 animate-ping z-30"></div>
        <div v-if="!hasInteracted" class="absolute inset-0 rounded-full bg-amber-500/30 animate-pulse z-30"></div>

        <!-- "START HIER" Badge (Tactical Style) -->
        <div v-if="!hasInteracted" class="absolute -top-8 -right-12 bg-amber-500 text-slate-900 border-2 border-slate-900 text-[11px] font-black px-3 py-1 rounded shadow-[0_4px_0_rgba(0,0,0,0.3)] animate-bounce z-50 whitespace-nowrap uppercase tracking-widest transform rotate-3">
            LEES DIT EERST!
        </div>

        <button 
            @click="toggle" 
            class="w-16 h-16 bg-slate-900 text-amber-500 border-4 border-slate-800 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center text-3xl hover:bg-slate-800 hover:border-amber-500/50 transition-all duration-200 hover:scale-110 relative z-40"
            :class="{'rotate-180 bg-slate-800 border-slate-700': isOpen}"
            title="Doelstellingen"
        >
            <component :is="iconComponent" v-if="!isOpen" weight="fill" class="drop-shadow-lg" />
            <PhX v-else weight="bold" class="text-slate-400" />
            
            <!-- Notification Dot -->
            <div v-if="!hasInteracted" class="absolute top-0 right-0 w-5 h-5 bg-red-600 border-2 border-slate-900 rounded-full animate-pulse"></div>
        </button>
    </div>

    <!-- Centered Modal Overlay -->
    <div 
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="toggle"></div>

        <!-- Mission Dossier Modal - SCALABLE -->
        <div 
            class="relative bg-slate-50 w-full sm:w-fit min-w-[320px] max-w-3xl max-h-[90vh] rounded-xl shadow-2xl border-2 border-slate-800 flex flex-col font-mono transform transition-all duration-300 scale-100"
        >
            <!-- Header -->
            <div class="bg-slate-800 text-white p-4 flex items-center justify-between shadow-lg relative z-10 shrink-0">
                <div class="flex items-center gap-3">
                     <div class="p-2 bg-slate-700 rounded-lg border border-slate-600 shadow-inner">
                        <component :is="iconComponent" weight="fill" class="text-2xl text-amber-500" />
                    </div>
                    <div>
                        <h3 class="font-bold text-base tracking-widest uppercase text-amber-500">Doelstellingen</h3>
                        <div class="text-[10px] text-slate-400 tracking-wider">{{ completedGoals.length }} / {{ goals.length }} Voltooid</div>
                    </div>
                </div>
                <!-- Close Button -->
                <button 
                    @click="toggle"
                    class="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Sluiten"
                >
                    <PhX weight="bold" class="text-xl" />
                </button>
            </div>

            <!-- Body - SCROLLABLE AREA -->
            <div class="p-6 relative bg-slate-50 overflow-y-auto">
                <!-- Watermark -->
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none transform -rotate-12 select-none">
                     <component :is="iconComponent" weight="fill" class="text-[20rem] text-slate-900" />
                </div>

                <div class="relative z-10 space-y-6">
                    
                    <!-- Doelstellingen -->
                    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                        
                        <!-- Content -->
                        <ul class="p-5 space-y-3">
                            <li 
                                v-for="(goal, i) in goals" 
                                :key="i" 
                                @click="toggleGoal(i)"
                                class="flex items-start gap-3 p-2 -mx-2 rounded-lg cursor-pointer transition-all duration-200 group"
                                :class="completedGoals.includes(i) ? 'bg-amber-50' : 'hover:bg-slate-50'"
                            >
                                <!-- Checkbox -->
                                <div 
                                    class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 mt-0.5"
                                    :class="completedGoals.includes(i) 
                                        ? 'bg-amber-500 border-amber-500 text-white' 
                                        : 'bg-white border-slate-300 text-transparent group-hover:border-amber-500'"
                                >
                                    <PhCheck weight="bold" class="text-xs" />
                                </div>
                                
                                <span 
                                    class="text-sm text-slate-700 leading-snug"
                                    :class="completedGoals.includes(i) ? 'text-amber-700 line-through opacity-70' : ''"
                                >
                                    {{ goal }}
                                </span>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
            
            <!-- Footer / Status Bar -->
            <div class="bg-slate-100 px-5 py-3 text-[11px] text-slate-500 flex justify-center items-center border-t border-slate-200 font-medium italic">
                <span>Vink de doelen af die je bereikt hebt!</span>
            </div>
        </div>
    </div>
  </div>
</template>


