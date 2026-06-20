<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { PhX, PhHandPointing, PhInfo, PhMapPin } from '@phosphor-icons/vue'
import MathGraphSvg from './MathGraphSvg.vue'

// ─── Props ────────────────────────────────────────────────────────────────────
const props = defineProps({
  isOpen:      { type: Boolean },
  title:       { type: String, default: 'Verkennen' },
  instruction: { type: String, default: 'Klik op de hotspots om meer te ontdekken.' },

  /**
   * IMAGE MODE  — provide an image URL + hotspots with x/y as percentages (0–100).
   * { image: 'https://...', hotspots: [{ x: 25, y: 40, title, content, color? }] }
   */
  image: { type: String, default: null },

  /**
   * GRAPH MODE — provide a math graph config + hotspots with x/y in math coordinates.
   * { graphConfig: { functions, domain, range, points },
   *   hotspots: [{ x: 2, y: 5, title, content, color? }] }
   *
   * Hotspot positions are converted from math → SVG viewBox (800×600) → percentage.
   */
  graphConfig: { type: Object, default: null },

  hotspots: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'complete'])

// ─── Mode detection ───────────────────────────────────────────────────────────
const mode = computed(() => props.graphConfig ? 'graph' : 'image')

// ─── State ────────────────────────────────────────────────────────────────────
const selectedHotspot = ref(null)
const visited         = ref(new Set())

function selectHotspot(index) {
  selectedHotspot.value = index
  visited.value = new Set([...visited.value, index])
  if (visited.value.size === props.hotspots.length) emit('complete')
}

function resetActivity() {
  selectedHotspot.value = null
  visited.value         = new Set()
}

// ─── Image URL resolver ───────────────────────────────────────────────────────
function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  const base = import.meta.env.BASE_URL || '/'
  let u = url.replace(/^\.\//, '').replace(/^\//, '')
  return base.endsWith('/') ? base + u : base + '/' + u
}

// ─── Graph hotspot coordinate conversion ─────────────────────────────────────
// MathGraphSvg has a fixed viewBox of 800×600.
// We replicate its toSvgX/toSvgY to get percentage positions for CSS overlay.
const SVG_W = 800
const SVG_H = 600

function hotspotStyle(spot) {
  if (mode.value === 'image') {
    return { left: spot.x + '%', top: spot.y + '%' }
  }
  // graph mode: convert math coords → SVG viewBox coords → percentage
  const domain = props.graphConfig?.domain ?? [-10, 10]
  const range  = props.graphConfig?.range  ?? [-10, 10]
  const svgX   = ((spot.x - domain[0]) / (domain[1] - domain[0])) * SVG_W
  const svgY   = SVG_H - ((spot.y - range[0]) / (range[1] - range[0])) * SVG_H
  return {
    left: (svgX / SVG_W * 100).toFixed(2) + '%',
    top:  (svgY / SVG_H * 100).toFixed(2) + '%',
  }
}

// ─── Keyboard ─────────────────────────────────────────────────────────────────
watch(() => props.isOpen, val => { if (val) resetActivity() })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
}
onMounted(()  => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center font-sans">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="emit('close')"></div>
    <div class="relative bg-white shadow-2xl overflow-hidden flex flex-col w-screen h-screen" @click.stop>

      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <header class="shrink-0 px-8 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <PhHandPointing class="text-xl text-amber-600" weight="fill" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-800 m-0 leading-tight">{{ title }}</h2>
            <p class="text-sm text-slate-500 m-0" v-html="instruction"></p>
          </div>
        </div>
        <div class="flex items-center gap-5">
          <!-- Progress pill -->
          <div class="text-sm font-semibold text-slate-500 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-200">
            <span class="text-amber-600 font-black">{{ visited.size }}</span>
            <span class="text-slate-400"> / {{ hotspots.length }}</span>
            <span class="text-slate-400 ml-1 text-xs uppercase tracking-widest"> verkend</span>
          </div>
          <button @click="emit('close')" class="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-all">
            <PhX class="text-xl" />
          </button>
        </div>
      </header>

      <!-- ── Canvas + Info panel ─────────────────────────────────────────── -->
      <div class="flex-1 overflow-hidden flex bg-slate-900">

        <!-- Canvas -->
        <div class="flex-1 relative flex items-center justify-center p-8 overflow-hidden">

          <!-- IMAGE mode -->
          <template v-if="mode === 'image' && image">
            <div class="relative inline-block max-w-full max-h-full">
              <img :src="resolveImageUrl(image)"
                   class="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl ring-4 ring-white/10 block" />

              <!-- Hotspot markers — percentage positioned over image -->
              <button
                v-for="(spot, idx) in hotspots"
                :key="idx"
                @click="selectHotspot(idx)"
                :style="hotspotStyle(spot)"
                class="absolute w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-all hover:scale-125 z-10"
                :class="
                  selectedHotspot === idx
                    ? 'bg-amber-500 scale-110 z-20'
                    : visited.has(idx)
                      ? 'bg-slate-400/80'
                      : 'bg-brand-orange animate-pulse'
                "
              >
                <PhInfo v-if="visited.has(idx) && selectedHotspot !== idx" weight="bold" class="text-white text-base" />
                <span v-else class="text-white font-black text-xl leading-none">+</span>
              </button>
            </div>
          </template>

          <!-- GRAPH mode -->
          <template v-else-if="mode === 'graph' && graphConfig">
            <!-- Fixed aspect-ratio wrapper matching SVG viewBox 800×600 -->
            <div class="relative bg-white rounded-2xl shadow-2xl ring-4 ring-white/10 overflow-hidden"
                 style="aspect-ratio: 800/600; max-height: 75vh; max-width: 100%;">
              <MathGraphSvg :config="graphConfig" class="w-full h-full" />

              <!-- Hotspot markers — positioned using math → % conversion -->
              <button
                v-for="(spot, idx) in hotspots"
                :key="idx"
                @click="selectHotspot(idx)"
                :style="hotspotStyle(spot)"
                class="absolute w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-all hover:scale-125 z-10"
                :class="
                  selectedHotspot === idx
                    ? 'bg-amber-500 scale-110 z-20'
                    : visited.has(idx)
                      ? 'bg-slate-500/80'
                      : 'bg-brand-dark animate-pulse'
                "
              >
                <PhInfo v-if="visited.has(idx) && selectedHotspot !== idx" weight="bold" class="text-white text-base" />
                <span v-else class="text-white font-black text-xl leading-none">+</span>
              </button>
            </div>
          </template>

          <!-- Fallback -->
          <div v-else class="text-slate-400 text-center">
            <PhMapPin weight="duotone" class="text-6xl mb-4 mx-auto opacity-30" />
            <p class="text-sm">Geen afbeelding of grafiek geconfigureerd.</p>
          </div>

        </div>

        <!-- ── Info panel (slides in from right) ────────────────────────── -->
        <transition
          enter-active-class="transition-transform duration-300 ease-out"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition-transform duration-200 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <aside v-if="selectedHotspot !== null"
                 class="w-80 shrink-0 bg-white border-l border-slate-100 flex flex-col overflow-y-auto">

            <div class="p-8 flex flex-col h-full">
              <!-- Icon -->
              <div class="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center shadow-inner"
                   :class="`bg-${hotspots[selectedHotspot].color ?? 'amber'}-100`">
                <PhInfo weight="fill" class="text-2xl"
                        :class="`text-${hotspots[selectedHotspot].color ?? 'amber'}-600`" />
              </div>

              <!-- Title -->
              <h3 class="text-2xl font-black text-slate-800 mb-4 leading-tight">
                {{ hotspots[selectedHotspot].title }}
              </h3>

              <!-- Content -->
              <div class="text-slate-600 leading-relaxed text-base prose max-w-none flex-1"
                   v-html="hotspots[selectedHotspot].content"></div>

              <!-- Footer -->
              <div class="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {{ selectedHotspot + 1 }} / {{ hotspots.length }}
                </span>
                <button
                  v-if="selectedHotspot < hotspots.length - 1"
                  @click="selectHotspot(selectedHotspot + 1)"
                  class="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  Volgende →
                </button>
              </div>
            </div>
          </aside>
        </transition>

      </div>
    </div>
  </div>
</template>
