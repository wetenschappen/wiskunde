<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { PhX, PhChatTeardropDots } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  questions: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: 'Vastzetting'
  }
})

const emit = defineEmits(['close', 'complete'])

const selectedIndex = ref(null)
const revealedIndices = ref(new Set())

function handleKeydown(e) {
  if (!props.isOpen) return
  
  // 'S' for Solution/Secret reveal - Toggles visibility
  if (e.key.toLowerCase() === 's' && selectedIndex.value !== null) {
    if (revealedIndices.value.has(selectedIndex.value)) {
      revealedIndices.value.delete(selectedIndex.value)
    } else {
      revealedIndices.value.add(selectedIndex.value)
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function close() {
  selectedIndex.value = null
  revealedIndices.value.clear()
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop open" @click="close">
    <div class="modal-content max-w-xl" @click.stop>
      <!-- Header -->
      <div class="bg-rose-600 px-6 py-5 flex justify-between items-center text-white">
        <div class="flex items-center gap-3">
          <div class="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <PhChatTeardropDots weight="fill" class="text-2xl text-white"/>
          </div>
          <div>
            <h3 class="text-lg font-bold m-0 leading-tight">{{ title }}</h3>
            <p class="text-xs text-rose-100 m-0 opacity-80 uppercase tracking-widest font-medium">Klassikale Begripscheck</p>
          </div>
        </div>
        <button @click="close" class="btn-close-dark">
          <PhX class="text-2xl" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-8 bg-slate-50 min-h-[400px]">
        <div class="space-y-4">
          <div v-for="(q, idx) in questions" :key="idx" 
               @click="selectedIndex = idx"
               :class="[
                 'bg-white p-5 rounded-2xl border transition-all cursor-pointer group relative',
                 selectedIndex === idx 
                   ? 'border-rose-500 shadow-md ring-2 ring-rose-500/20 translate-x-1' 
                   : 'border-slate-200 hover:border-rose-300 shadow-sm'
               ]">
            
            <!-- Selection indicator -->
            <div v-if="selectedIndex === idx" class="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-rose-500 rounded-full"></div>

            <div class="flex gap-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border transition-colors duration-300"
                   :class="selectedIndex === idx ? 'bg-rose-600 text-white border-rose-600' : 'bg-rose-50 text-rose-600 border-rose-100'">
                {{ idx + 1 }}
              </div>
              <div class="flex-1">
                <p class="text-slate-800 font-bold text-lg mb-0 leading-tight" v-html="q.question"></p>
                
                <Transition name="fade">
                  <div v-if="revealedIndices.has(idx)" class="text-rose-700 text-sm font-medium py-2.5 px-4 bg-rose-50 border-l-4 border-rose-400 rounded-r-lg mt-3 animate-in fade-in slide-in-from-top-1">
                     <span class="text-[10px] font-black uppercase tracking-wider block mb-1 opacity-60">Antwoord</span>
                     <span v-html="q.answer"></span>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-10 text-center">
          <button 
            @click="$emit('complete'); close()" 
            class="px-10 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-rose-200 active:scale-95 uppercase tracking-widest text-xs"
          >
            Sessie Afronden
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
