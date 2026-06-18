<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhHandPointing, PhInfo } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Weefsels Verkennen' },
  instruction: { type: String, default: 'Klik op de hotspots (+) om de verschillende weefsels in het blad te ontdekken.' },
  image: { type: String, required: true },
  hotspots: {
    type: Array,
    default: () => []
  },
  fullscreen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'complete'])
const selectedHotspot = ref(null)
const visitedHotspots = ref(new Set())

function selectHotspot(index) {
    selectedHotspot.value = index
    visitedHotspots.value.add(index)
    
    // Check completion
    if (visitedHotspots.value.size === props.hotspots.length) {
        emit('complete')
    }
}

function resolveImageUrl(url) {
    if (!url) return ''
    if (url.startsWith('http') || url.startsWith('data:')) return url
    const baseUrl = import.meta.env.BASE_URL || '/'
    let normalizedUrl = url
    if (normalizedUrl.startsWith('./')) normalizedUrl = normalizedUrl.substring(2)
    if (normalizedUrl.startsWith('/')) normalizedUrl = normalizedUrl.substring(1)
    return baseUrl.endsWith('/') ? baseUrl + normalizedUrl : baseUrl + '/' + normalizedUrl
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
      <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <PhHandPointing class="text-2xl text-indigo-600" weight="fill" />
            </div>
            <div>
                <h2 class="text-2xl font-bold text-slate-800">{{ title }}</h2>
                <p class="text-sm text-slate-500">{{ instruction }}</p>
            </div>
        </div>
        
        <div class="flex items-center gap-6">
            <div class="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                Verkend: <span class="text-indigo-600 font-bold">{{ visitedHotspots.size }}</span> / {{ hotspots.length }}
            </div>
            <button @click="close" 
                    class="bg-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-300 p-2 rounded-full transition-all relative"
                    :class="{ 'ring-pulse-red': shouldPulse }">
                <PhX class="text-xl font-bold"/>
            </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden flex relative bg-slate-800">
          
          <!-- Image with Hotspots -->
          <div class="flex-1 relative overflow-hidden flex items-center justify-center p-12 bg-slate-800">
              <!-- Wrapper div perfectly hugs the image size -->
              <div class="relative flex max-w-full max-h-full">
                  <img :src="resolveImageUrl(image)" class="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl ring-4 ring-white/10" />
                  
                  <!-- Hotspot Markers -->
                  <button 
                      v-for="(spot, idx) in hotspots" 
                      :key="idx"
                      @click="selectHotspot(idx)"
                      class="absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center transition-all transform hover:scale-125 z-10 shadow-lg border-2"
                      :style="{ left: spot.x + '%', top: spot.y + '%' }"
                      :class="[
                          selectedHotspot === idx 
                              ? 'bg-indigo-500 border-white text-white scale-110 z-20' 
                              : visitedHotspots.has(idx)
                                  ? 'bg-slate-400/80 border-white text-white'
                                  : 'bg-brand-orange border-white text-white animate-pulse'
                      ]"
                  >
                      <PhInfo v-if="visitedHotspots.has(idx) && selectedHotspot !== idx" weight="bold" class="text-xl" />
                      <span v-else class="text-2xl font-black leading-none pb-1">+</span>
                  </button>
              </div>
          </div>

          <!-- Info Panel -->
          <div class="w-96 bg-white border-l border-slate-100 flex flex-col transition-all duration-300 shrink-0 transform"
               :class="selectedHotspot !== null ? 'translate-x-0' : 'translate-x-full absolute right-0 h-full'">
              <div v-if="selectedHotspot !== null" class="p-8 flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                  <div class="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center mb-6 shadow-inner"
                       :class="'bg-' + (hotspots[selectedHotspot].color || 'indigo') + '-100 text-' + (hotspots[selectedHotspot].color || 'indigo') + '-600'">
                      <PhInfo weight="fill" class="text-3xl" />
                  </div>
                  
                  <h3 class="text-3xl font-black text-slate-800 mb-4 tracking-tight leading-tight">
                      {{ hotspots[selectedHotspot].title }}
                  </h3>
                  
                  <div class="prose prose-lg text-slate-600">
                      <p v-html="hotspots[selectedHotspot].content"></p>
                  </div>
                  
                  <div class="mt-auto pt-8 border-t border-slate-100">
                      <p class="text-sm font-medium text-slate-400 uppercase tracking-widest text-center">
                          Weefsel {{ selectedHotspot + 1 }} van {{ hotspots.length }}
                      </p>
                  </div>
              </div>
          </div>
          
      </div>

    </div>
  </div>
</template>

<style scoped>
.ring-pulse-red {
    animation: ring-pulse 0.8s cubic-bezier(0.24, 1, 0.32, 1) 3;
    z-index: 50;
}

@keyframes ring-pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 1);
        background-color: rgba(239, 68, 68, 0.3);
        transform: scale(1);
    }
    50% {
        box-shadow: 0 0 0 20px rgba(239, 68, 68, 0.8);
        background-color: rgba(239, 68, 68, 0.6);
        transform: scale(1.1);
    }
    100% {
        box-shadow: 0 0 0 40px rgba(239, 68, 68, 0);
        background-color: transparent;
        transform: scale(1);
    }
}
</style>
