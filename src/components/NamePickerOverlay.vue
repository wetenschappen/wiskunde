<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { PhUserCircle, PhX } from '@phosphor-icons/vue'

const props = defineProps({
    isOpen: Boolean,
    names: {
        type: Array,
        default: () => ['Geen Namen']
    }
})

const emit = defineEmits(['close'])

const selectedName = ref('')
const lastPickedName = ref('')
const isSpinning = ref(false)
const displayName = ref('')

function pickRandomName() {
    if (isSpinning.value) return
    if (!props.names || props.names.length === 0) return
    
    // Get available names (excluding last picked)
    let availableNames = props.names.filter(name => name !== lastPickedName.value)
    
    // If only one name, allow it
    if (availableNames.length === 0) {
        availableNames = props.names
    }
    
    // Start spinning animation
    isSpinning.value = true
    
    // Rapid cycling through names for dramatic effect
    let cycles = 0
    const maxCycles = 20
    const baseInterval = 50
    
    const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * props.names.length)
        displayName.value = props.names[randomIndex]
        cycles++
        
        if (cycles >= maxCycles) {
            clearInterval(interval)
            
            // Final selection
            const finalIndex = Math.floor(Math.random() * availableNames.length)
            selectedName.value = availableNames[finalIndex]
            displayName.value = selectedName.value
            lastPickedName.value = selectedName.value
            isSpinning.value = false
        }
    }, baseInterval + (cycles * 5)) // Gradually slow down
}

function close() {
    emit('close')
}

// Auto-pick when opened
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        selectedName.value = ''
        displayName.value = ''
        // Small delay then start picking
        setTimeout(() => {
            pickRandomName()
        }, 300)
    }
})

// Handle keyboard
function handleKeydown(e) {
    if (!props.isOpen) return
    
    if (e.key === 'Escape') {
        e.preventDefault()
        e.stopImmediatePropagation()
        close()
    } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        pickRandomName()
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="isOpen" class="fixed inset-0 z-[10020] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
                
                <!-- Close button -->
                <button @click="close" class="absolute top-6 right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <PhX class="text-2xl" />
                </button>

                <!-- Main content -->
                <div class="text-center px-8">
                    
                    <!-- Icon -->
                    <div :class="[
                        'w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-300',
                        isSpinning ? 'bg-amber-500 animate-pulse' : 'bg-amber-600'
                    ]">
                        <PhUserCircle class="text-7xl text-white" weight="fill" />
                    </div>

                    <!-- Label -->
                    <p class="text-2xl text-white/60 mb-4 font-medium">Wie mag antwoorden?</p>

                    <!-- Name display -->
                    <div class="min-h-[120px] flex items-center justify-center">
                        <h1 :class="[
                            'font-bold text-white transition-all duration-200',
                            isSpinning ? 'text-6xl text-white/70' : 'text-8xl md:text-9xl'
                        ]">
                            {{ displayName || '...' }}
                        </h1>
                    </div>

                    <!-- Actions -->
                    <div class="mt-10 flex flex-col items-center gap-3">
                        <button
                            @click="pickRandomName"
                            :disabled="isSpinning"
                            class="px-8 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-900 font-black rounded-xl text-base uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30"
                        >
                            {{ isSpinning ? 'Kiezen...' : 'Opnieuw' }}
                        </button>
                        <p class="text-white/30 text-xs font-medium tracking-wider uppercase">Spatie of Enter om opnieuw te kiezen &nbsp;&bull;&nbsp; Esc om te sluiten</p>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
