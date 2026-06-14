<script setup>
import { PhX } from '@phosphor-icons/vue'
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

// PERFORMANCE: Only load iframe once, then keep it alive
const hasLoaded = ref(false)

// Draggable Logic
const modalRef = ref(null)
const headerRef = ref(null)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

function startDrag(e) {
    isDragging.value = true
    const clientX = e.clientX || e.touches[0].clientX
    const clientY = e.clientY || e.touches[0].clientY
    dragOffset.value = {
        x: clientX - position.value.x,
        y: clientY - position.value.y
    }
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
    document.addEventListener('touchmove', onDrag)
    document.addEventListener('touchend', stopDrag)
}

function onDrag(e) {
    if (!isDragging.value) return
    const clientX = e.clientX || e.touches[0].clientX
    const clientY = e.clientY || e.touches[0].clientY
    position.value = {
        x: clientX - dragOffset.value.x,
        y: clientY - dragOffset.value.y
    }
}

function stopDrag() {
    isDragging.value = false
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('touchmove', onDrag)
    document.removeEventListener('touchend', stopDrag)
}

// Initial Center + Lazy Load trigger
watch(() => props.isOpen, (val) => {
    if (val) {
         // Mark as loaded on first open (iframe will persist after this)
         if (!hasLoaded.value) {
             hasLoaded.value = true
         }
         // Simple centering reset or keep last position
         if(position.value.x === 0 && position.value.y === 0) {
             position.value = { x: window.innerWidth/2 - 250, y: window.innerHeight/2 - 300 }
         }
    }
})
</script>

<template>
  <!-- PERFORMANCE: v-show keeps widget in DOM after first load for instant re-opens -->
  <div 
    v-show="isOpen"
    v-if="hasLoaded" 
    ref="modalRef"
    class="fixed bg-white rounded-2xl shadow-xl border border-slate-200 w-[500px] h-[600px] z-[90] overflow-hidden flex flex-col animate-[fadeIn_0.3s_ease-out]"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
  >
      <!-- Header -->
      <div 
        ref="headerRef"
        @mousedown="startDrag"
        @touchstart="startDrag"
        class="bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center cursor-move select-none"
      >
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Desmos Calculator</span>
          <button @click="emit('close')" class="text-slate-400 hover:text-red-500 transition-colors"><PhX weight="bold"/></button>
      </div>

      <!-- Embed -->
      <div class="flex-1 bg-white relative">
          <!-- Pointer events none while dragging to avoid iframe stealing focus -->
          <div v-if="isDragging" class="absolute inset-0 z-50 bg-transparent"></div>
          <iframe 
            src="https://www.desmos.com/scientific" 
            class="absolute inset-0 w-full h-full border-0" 
            title="Scientific Calculator"
          ></iframe>
      </div>
  </div>
</template>
