<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhColumns, PhTrophy, PhArrowClockwise, PhCheckCircle, PhXCircle } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Categorieën Ordenen'
  },
  instruction: {
    type: String,
    default: 'Sleep de woorden naar de juiste kolom'
  },
  // Columns: [{ id: 'c1', label: 'Kolom 1' }, ...]
  columns: {
    type: Array,
    required: true
  },
  // Items: [{ id: 'i1', text: 'Item 1', columnId: 'c1' }, ...]
  items: {
    type: Array,
    required: true
  },
  fullscreen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'complete'])

// STATE
const draggedItem = ref(null)
const placements = ref({}) // { itemId: columnId }
const isChecked = ref(false)
const isComplete = ref(false)

// Shuffle items for the "bank"
const itemBank = ref([...props.items].sort(() => Math.random() - 0.5))

function onDragStart(item, e) {
  draggedItem.value = item
  e.dataTransfer.effectAllowed = 'move'
}

function onDrop(columnId) {
  if (!draggedItem.value) return
  placements.value[draggedItem.value.id] = columnId
  draggedItem.value = null
  isChecked.value = false
}

function removeFromColumn(itemId) {
  delete placements.value[itemId]
  isChecked.value = false
}

function checkAnswers() {
  isChecked.value = true
  const allPlaced = Object.keys(placements.value).length === props.items.length
  const allCorrect = props.items.every(item => placements.value[item.id] === item.columnId)
  
  if (allPlaced && allCorrect) {
    isComplete.value = true
  }
}

function resetActivity() {
  placements.value = {}
  isChecked.value = false
  isComplete.value = false
  itemBank.value = [...props.items].sort(() => Math.random() - 0.5)
}

function getItemsInColumn(columnId) {
  return props.items.filter(item => placements.value[item.id] === columnId)
}

function isCorrect(item) {
  return placements.value[item.id] === item.columnId
}

const progressPercent = computed(() => {
  const correctCount = props.items.filter(item => placements.value[item.id] === item.columnId).length
  return Math.round((correctCount / props.items.length) * 100)
})

function close() {
  emit('close')
}

// FULLSCREEN & PULSE
const shouldPulse = ref(false)

watch(() => props.isOpen, (val) => {
    if (!val) {
        if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
        window.removeEventListener('keydown', handleKeydown)
        shouldPulse.value = false
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
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-0">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="close"></div>
    <div class="relative bg-white shadow-2xl overflow-hidden flex flex-col w-screen h-screen rounded-none"
         @click.stop>
      
      <!-- Header -->
      <div class="bg-amber-500 px-6 py-5 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3">
          <div class="bg-white/20 p-2 rounded-lg text-white">
            <PhColumns weight="bold" class="text-xl"/>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white m-0">{{ title }}</h3>
            <p class="text-xs text-white/70 m-0">Sorteren</p>
          </div>
        </div>
        <button @click="close" 
                class="text-white/70 hover:text-white p-2 rounded-full transition-all relative"
                :class="{ 'ring-pulse-white': shouldPulse }">
          <PhX class="text-2xl" />
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="h-1 bg-slate-200 shrink-0">
        <div 
          class="h-full bg-emerald-500 transition-all duration-500 ease-out" 
          :style="{ width: (isChecked ? progressPercent : 0) + '%' }"
        ></div>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1">
        
        <!-- Instruction -->
        <p class="text-slate-600 text-center mb-6">{{ instruction }}</p>

        <!-- Completion State -->
        <div v-if="isComplete" class="text-center py-8">
          <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounce_0.6s_ease-out]">
            <PhTrophy weight="fill" class="text-4xl text-emerald-500"/>
          </div>
          <h4 class="text-2xl font-bold text-slate-900 mb-2">Perfect Sorteerwerk!</h4>
          <p class="text-slate-500 mb-1">Alle begrippen staan in de juiste kolom.</p>
          
          <div class="flex justify-center gap-3 mt-6">
            <button @click="resetActivity" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <PhArrowClockwise weight="bold"/>
              Opnieuw
            </button>
            <button @click="close" class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors">
              Sluiten
            </button>
          </div>
        </div>

        <div v-else>
          <!-- Item Bank -->
          <div class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 mb-8">
            <h4 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 text-center">Woordenlijst</h4>
            <div class="flex flex-wrap justify-center gap-2">
              <div 
                v-for="item in itemBank.filter(i => !placements[i.id])" 
                :key="item.id"
                draggable="true"
                @dragstart="onDragStart(item, $event)"
                class="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-700 cursor-grab active:cursor-grabbing hover:border-amber-400 hover:shadow-sm transition-all select-none"
                v-html="item.text"
              ></div>
              <div v-if="itemBank.filter(i => !placements[i.id]).length === 0" class="text-slate-400 text-sm italic py-2">
                Alle woorden zijn geplaatst!
              </div>
            </div>
          </div>

          <!-- Columns Grid -->
          <div class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }">
            <div 
              v-for="col in columns" 
              :key="col.id"
              @dragover.prevent
              @drop="onDrop(col.id)"
              class="bg-white border-2 rounded-2xl flex flex-col min-h-[250px] transition-colors"
              :class="draggedItem ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100 bg-slate-50/50'"
            >
              <!-- Column Header -->
              <div class="p-3 border-b-2 border-slate-100 text-center">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-tighter">{{ col.label }}</span>
              </div>

              <!-- Column Content -->
              <div class="p-3 space-y-2 flex-1">
                <div 
                  v-for="item in getItemsInColumn(col.id)" 
                  :key="item.id"
                  class="p-3 rounded-lg border-2 flex items-center justify-between group animate-in fade-in zoom-in duration-200"
                  :class="[
                    !isChecked ? 'bg-white border-slate-200' : 
                    isCorrect(item) ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'
                  ]"
                >
                  <span class="text-sm font-bold" v-html="item.text"></span>
                  
                  <div class="flex items-center">
                    <PhCheckCircle v-if="isChecked && isCorrect(item)" weight="fill" class="text-emerald-500"/>
                    <PhXCircle v-else-if="isChecked && !isCorrect(item)" weight="fill" class="text-red-500"/>
                    <button 
                      v-if="!isChecked"
                      @click="removeFromColumn(item.id)" 
                      class="text-slate-300 hover:text-red-500 transition-colors ml-2"
                    >
                      <PhX weight="bold" class="text-xs"/>
                    </button>
                  </div>
                </div>
                
                <!-- Empty Placeholder -->
                <div v-if="getItemsInColumn(col.id).length === 0" class="h-full flex items-center justify-center text-slate-300 text-[10px] italic py-8">
                  Sleep hierheen...
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="mt-8 flex justify-between items-center">
             <button @click="resetActivity" class="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1 transition-colors">
                <PhArrowClockwise class="text-xs"/>
                Reset alles
             </button>

             <button 
              @click="checkAnswers"
              :disabled="Object.keys(placements).length === 0"
              class="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-30 disabled:shadow-none transition-all"
            >
              {{ isChecked ? 'Verbeteren' : 'Controleer Antwoorden' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.ring-pulse-white {
    animation: ring-pulse-white 0.8s cubic-bezier(0.24, 1, 0.32, 1) 3;
    z-index: 50;
}

@keyframes ring-pulse-white {
    0% {
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 1);
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(1);
    }
    50% {
        box-shadow: 0 0 0 20px rgba(255, 255, 255, 0.8);
        background-color: rgba(255, 255, 255, 0.6);
        transform: scale(1.1);
    }
    100% {
        box-shadow: 0 0 0 40px rgba(255, 255, 255, 0);
        background-color: transparent;
        transform: scale(1);
    }
}
</style>
