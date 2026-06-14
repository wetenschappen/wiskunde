<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import {
  PhCheckCircle,
  PhCube,
  PhX
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: { type: Boolean, default: true },
  title: { type: String, default: 'Roosters & Eigenschappen' }
})

const emit = defineEmits(['close', 'complete'])

watch(
  () => props.isOpen,
  (val) => {
    if (val && !document.fullscreenElement) {
      nextTick(() => document.documentElement.requestFullscreen().catch(() => {}))
    } else if (!val && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
  }
})

const completionEmitted = ref(false)

const latticeTypes = [
  {
    id: 'ion',
    name: 'Ionrooster',
    chip: 'bg-violet-100 text-violet-700',
    active: 'border-violet-400 bg-violet-50 ring-2 ring-violet-200',
    particles: 'Positieve en negatieve ionen',
    bond: 'Ionbinding',
    examples: 'NaCl, CaO',
    properties: [
      { label: 'Aggregatietoestand', value: 'Vast bij kamertemperatuur (zeer hoge smeltpunten)' },
      { label: 'Geleidbaarheid', value: 'Geleidt niet als vaste stof, wél in vloeibare/opgeloste toestand' },
      { label: 'Vervormbaarheid', value: 'Bros: breekt of splijt bij het uitoefenen van een kracht' }
    ]
  },
  {
    id: 'molecuul',
    name: 'Molecuulrooster',
    chip: 'bg-emerald-100 text-emerald-700',
    active: 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200',
    particles: 'Afzonderlijke moleculen',
    bond: 'Zwakke intermoleculaire krachten',
    examples: 'I₂, H₂O (ijs)',
    properties: [
      { label: 'Aggregatietoestand', value: 'Vast, vloeibaar of gas (lage smelt- en kookpunten)' },
      { label: 'Geleidbaarheid', value: 'Geleidt geen elektrische stroom' },
      { label: 'Dichtheid', value: 'Over het algemeen laag (veel lege ruimte tussen de moleculen)' }
    ]
  },
  {
    id: 'atoom',
    name: 'Atoomrooster',
    chip: 'bg-sky-100 text-sky-700',
    active: 'border-sky-400 bg-sky-50 ring-2 ring-sky-200',
    particles: 'Atomen in een 2D of 3D netwerk',
    bond: 'Atoombinding (covalent netwerk)',
    examples: 'Diamant, grafiet',
    properties: [
      { label: 'Aggregatietoestand', value: 'Vast bij kamertemperatuur (extreem hoge smeltpunten)' },
      { label: 'Hardheid', value: 'Zeer hard (zoals diamant)' },
      { label: 'Inertheid', value: 'Zeer inert, reageren traag (weinig reactief)' }
    ]
  },
  {
    id: 'metaal',
    name: 'Metaalrooster',
    chip: 'bg-amber-100 text-amber-700',
    active: 'border-amber-400 bg-amber-50 ring-2 ring-amber-200',
    particles: 'Positieve metaalionen in een zee van vrije elektronen',
    bond: 'Metaalbinding',
    examples: 'Fe, Cu, Al, brons',
    properties: [
      { label: 'Aggregatietoestand', value: 'Vast bij kamertemperatuur (behalve kwik)' },
      { label: 'Geleidbaarheid', value: 'Geleidt zeer goed elektriciteit en warmte' },
      { label: 'Vervormbaarheid', value: 'Plooibaar/smeedbaar: lagen metaalionen kunnen over elkaar schuiven' }
    ]
  }
]

const latticeById = Object.fromEntries(latticeTypes.map((lattice) => [lattice.id, lattice]))

const selectedLatticeId = ref('ion')
const viewedLattices = ref(new Set(['ion']))

const ionPoints = []
for (let row = 0; row < 3; row += 1) {
  for (let col = 0; col < 4; col += 1) {
    const isPositive = (row + col) % 2 === 0
    ionPoints.push({
      id: `ion-${row}-${col}`,
      row,
      col,
      x: 45 + col * 58,
      y: 40 + row * 58,
      positive: isPositive,
      radius: isPositive ? 14 : 20
    })
  }
}

const metalPoints = []
for (let row = 0; row < 3; row += 1) {
  for (let col = 0; col < 4; col += 1) {
    const xOffset = row % 2 === 0 ? 0 : 29
    metalPoints.push({
      id: `metal-${row}-${col}`,
      row,
      x: 30 + col * 58 + xOffset,
      y: 42 + row * 50
    })
  }
}

const electronPoints = [
  { id: 'e-1', x: 24, y: 22, cxValues: '24;88;162;238;190;112;24', cyValues: '22;38;86;58;142;128;22', duration: '5.6s', delay: '0s' },
  { id: 'e-2', x: 72, y: 18, cxValues: '72;34;120;198;248;176;72', cyValues: '18;94;44;30;96;150;18', duration: '6.1s', delay: '0.3s' },
  { id: 'e-3', x: 132, y: 24, cxValues: '132;214;246;170;96;44;132', cyValues: '24;40;116;152;138;74;24', duration: '5.2s', delay: '0.6s' },
  { id: 'e-4', x: 186, y: 28, cxValues: '186;120;52;32;94;164;186', cyValues: '28;22;56;132;156;112;28', duration: '5.9s', delay: '0.2s' },
  { id: 'e-5', x: 238, y: 24, cxValues: '238;170;88;46;124;210;238', cyValues: '24;74;52;118;160;122;24', duration: '6.4s', delay: '0.8s' },
  { id: 'e-6', x: 40, y: 82, cxValues: '40;96;178;230;158;70;40', cyValues: '82;28;42;106;156;146;82', duration: '5.4s', delay: '1.1s' },
  { id: 'e-7', x: 96, y: 92, cxValues: '96;170;232;204;122;54;96', cyValues: '92;44;24;118;162;132;92', duration: '6.7s', delay: '1.4s' },
  { id: 'e-8', x: 152, y: 88, cxValues: '152;62;34;108;196;248;152', cyValues: '88;40;126;160;142;74;88', duration: '5.8s', delay: '0.9s' },
  { id: 'e-9', x: 210, y: 88, cxValues: '210;246;178;94;28;82;210', cyValues: '88;38;154;162;108;48;88', duration: '6.2s', delay: '1.6s' },
  { id: 'e-10', x: 30, y: 142, cxValues: '30;118;214;248;168;74;30', cyValues: '142;108;136;66;24;52;142', duration: '5.1s', delay: '1.9s' },
  { id: 'e-11', x: 86, y: 150, cxValues: '86;38;68;154;238;192;86', cyValues: '150;84;26;42;118;164;150', duration: '6s', delay: '2.1s' },
  { id: 'e-12', x: 156, y: 154, cxValues: '156;236;250;176;90;44;156', cyValues: '154;126;44;22;70;146;154', duration: '5.5s', delay: '2.4s' },
  { id: 'e-13', x: 222, y: 142, cxValues: '222;136;52;24;106;198;222', cyValues: '142;162;132;52;24;72;142', duration: '6.8s', delay: '2.7s' }
]

const moleculeCenters = [
  { id: 'm-1', x: 50, y: 50, angle: 30 },
  { id: 'm-2', x: 130, y: 40, angle: -20 },
  { id: 'm-3', x: 210, y: 50, angle: 10 },
  { id: 'm-4', x: 70, y: 120, angle: -10 },
  { id: 'm-5', x: 150, y: 130, angle: 25 },
  { id: 'm-6', x: 230, y: 110, angle: -5 }
]

const moleculeLinks = [
  // Bestaande horizontale en verticale links
  { id: 'ml-1', x1: 50, y1: 50, x2: 130, y2: 40 },
  { id: 'ml-2', x1: 130, y1: 40, x2: 210, y2: 50 },
  { id: 'ml-3', x1: 50, y1: 50, x2: 70, y2: 120 },
  { id: 'ml-4', x1: 130, y1: 40, x2: 150, y2: 130 },
  { id: 'ml-5', x1: 210, y1: 50, x2: 230, y2: 110 },
  { id: 'ml-6', x1: 70, y1: 120, x2: 150, y2: 130 },
  { id: 'ml-7', x1: 150, y1: 130, x2: 230, y2: 110 },
  // Extra diagonale links voor 3D netwerk weefsel (vanderwaalskrachten)
  { id: 'ml-8', x1: 50, y1: 50, x2: 150, y2: 130 },
  { id: 'ml-9', x1: 130, y1: 40, x2: 70, y2: 120 },
  { id: 'ml-10', x1: 130, y1: 40, x2: 230, y2: 110 },
  { id: 'ml-11', x1: 210, y1: 50, x2: 150, y2: 130 }
]

const atomicPoints = []
const atomicBonds = []

// Procedureel wiskundig perfect honingraat/grafiet-rooster genereren
const hexR = 22 // ribbelengte van hexagon
const hexW = Math.sqrt(3) * hexR
const hexH = 2 * hexR
const startX = 25
const startY = 10

// Simpeler algoritme: array van hexagon centra, dan 6 hoekpunten per centrum toevoegen met ontdubbeling
const hexCenters = [
  { cx: startX + hexW, cy: startY + hexH * 0.75 },
  { cx: startX + hexW * 2, cy: startY + hexH * 0.75 },
  { cx: startX + hexW * 3, cy: startY + hexH * 0.75 },

  { cx: startX + hexW * 0.5, cy: startY + hexH * 1.5 },
  { cx: startX + hexW * 1.5, cy: startY + hexH * 1.5 },
  { cx: startX + hexW * 2.5, cy: startY + hexH * 1.5 },
  { cx: startX + hexW * 3.5, cy: startY + hexH * 1.5 },

  { cx: startX + hexW, cy: startY + hexH * 2.25 },
  { cx: startX + hexW * 2, cy: startY + hexH * 2.25 },
  { cx: startX + hexW * 3, cy: startY + hexH * 2.25 }
]

const pointMap = new Map()

hexCenters.forEach(({ cx, cy }, index) => {
  const hexCorners = []
  for (let i = 0; i < 6; i++) {
    // hoekpunten voor een hex met hoekpunt bovenaan (-90 graden start)
    const angle_deg = 60 * i - 30
    const angle_rad = Math.PI / 180 * angle_deg
    // Afronden om drijvende komma fouten bij ontdubbeling te voorkomen
    const px = Math.round(cx + hexR * Math.cos(angle_rad))
    const py = Math.round(cy + hexR * Math.sin(angle_rad))

    const key = `${px},${py}`
    if (!pointMap.has(key)) {
      const newPt = { id: `a-${px}-${py}`, x: px, y: py }
      pointMap.set(key, newPt)
      atomicPoints.push(newPt)
    }
    hexCorners.push(pointMap.get(key))
  }

  // Maak bindingen voor deze hexagon
  for (let i = 0; i < 6; i++) {
    const p1 = hexCorners[i]
    const p2 = hexCorners[(i + 1) % 6]
    // Maak een unieke bond ID ongeacht volgorde
    const bId = [p1.id, p2.id].sort().join('-')
    if (!atomicBonds.find(b => b.id === bId)) {
      atomicBonds.push({ id: bId, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
    }
  }
})

const selectedLattice = computed(() => latticeById[selectedLatticeId.value])
const allViewed = computed(() => viewedLattices.value.size === latticeTypes.length)

function emitCompleteOnce() {
  if (!completionEmitted.value) {
    completionEmitted.value = true
    emit('complete')
  }
}

function closeActivity() {
  emitCompleteOnce()
  emit('close')
}

function finishActivity() {
  emitCompleteOnce()
  emit('close')
}

function selectLattice(latticeId) {
  selectedLatticeId.value = latticeId
  viewedLattices.value.add(latticeId)
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-100 text-slate-800">
      <header class="h-16 shrink-0 border-b border-slate-200 bg-white px-6 shadow-sm">
        <div class="mx-auto flex h-full w-full items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-lg shadow-sky-500/30">
              <PhCube class="text-xl" weight="bold" />
            </div>
            <div>
              <h1 class="text-lg font-bold text-slate-900">{{ title }}</h1>
              <p class="text-sm text-slate-500">Verken de 4 chemische roosters</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div
              v-if="allViewed"
              class="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700"
            >
              <PhCheckCircle weight="fill" />
              Alle roosters bekeken
            </div>
            <button
              class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-500"
              @click="closeActivity"
            >
              <PhX class="text-xl" weight="bold" />
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <div class="mx-auto w-full h-full flex flex-col">
          <div class="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <button
              v-for="lattice in latticeTypes"
              :key="lattice.id"
              class="rounded-2xl border-2 p-4 text-left transition-all hover:shadow-md"
              :class="selectedLatticeId === lattice.id ? lattice.active : 'border-slate-200 bg-white hover:border-slate-300'"
              @click="selectLattice(lattice.id)"
            >
              <div class="mb-2 flex items-center justify-between">
                <span class="rounded-full px-2.5 py-1 text-sm font-bold" :class="lattice.chip">{{ lattice.name }}</span>
                <PhCheckCircle
                  v-if="viewedLattices.has(lattice.id)"
                  class="text-emerald-500 text-lg"
                  weight="fill"
                />
              </div>
              <p class="text-sm font-medium text-slate-600 mt-3 line-clamp-2 h-10">{{ lattice.particles }}</p>
            </button>
          </div>

          <div class="flex-1 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-center">
            <div class="grid gap-8 lg:grid-cols-5">
              <!-- SVG Visual -->
              <div class="lg:col-span-3">
                <div v-if="selectedLattice.id === 'ion'" class="rounded-2xl border border-violet-200 bg-violet-50/30 p-4">
                  <svg viewBox="0 0 280 200" class="h-64 w-full">
                    <rect x="20" y="15" width="115" height="115" rx="8" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="5 5" />
                    <text x="24" y="142" fill="#6d28d9" font-size="11" font-weight="700">formule-eenheid herhaalt zich</text>
                    <g v-for="point in ionPoints" :key="point.id">
                      <circle :cx="point.x" :cy="point.y" :r="point.radius" :fill="point.positive ? '#fb923c' : '#60a5fa'" />
                      <text
                        :x="point.x"
                        :y="point.y + 4"
                        text-anchor="middle"
                        fill="white"
                        font-size="14"
                        font-weight="700"
                      >
                        {{ point.positive ? '+' : '-' }}
                      </text>
                    </g>
                  </svg>
                </div>

                <div v-else-if="selectedLattice.id === 'molecuul'" class="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4">
                  <svg viewBox="0 0 280 200" class="h-64 w-full">
                    <g v-for="link in moleculeLinks" :key="link.id">
                      <line
                        :x1="link.x1"
                        :y1="link.y1"
                        :x2="link.x2"
                        :y2="link.y2"
                        stroke="#10b981"
                        stroke-width="2"
                        stroke-dasharray="4 5"
                        opacity="0.7"
                      />
                    </g>
                    <g
                      v-for="molecule in moleculeCenters"
                      :key="molecule.id"
                      :transform="`translate(${molecule.x},${molecule.y}) rotate(${molecule.angle})`"
                    >
                      <line x1="-13" y1="0" x2="13" y2="0" stroke="#047857" stroke-width="2.4" stroke-linecap="round" />
                      <circle cx="-13" cy="0" r="9.5" fill="#10b981" stroke="#047857" stroke-width="1.2" />
                      <circle cx="13" cy="0" r="9.5" fill="#10b981" stroke="#047857" stroke-width="1.2" />
                    </g>
                    <text x="14" y="176" fill="#047857" font-size="10" font-weight="700">
                      volle lijn = covalente I-I-binding
                    </text>
                    <text x="14" y="190" fill="#047857" font-size="10" font-weight="700">
                      stippellijn = zwakke vanderwaalskrachten tussen I<tspan baseline-shift="sub" font-size="8">2</tspan>-moleculen
                    </text>
                  </svg>
                </div>

                <div v-else-if="selectedLattice.id === 'atoom'" class="rounded-2xl border border-sky-200 bg-sky-50/30 p-4">
                  <svg viewBox="0 0 280 200" class="h-64 w-full">
                    <g v-for="bond in atomicBonds" :key="bond.id">
                      <line
                        :x1="bond.x1"
                        :y1="bond.y1"
                        :x2="bond.x2"
                        :y2="bond.y2"
                        stroke="#334155"
                        stroke-width="2.5"
                      />
                    </g>
                    <g v-for="point in atomicPoints" :key="point.id">
                      <circle :cx="point.x" :cy="point.y" r="8" fill="#0f172a" />
                    </g>
                    <text x="12" y="188" fill="#334155" font-size="11" font-weight="700">
                      doorlopend netwerk in 2D (grafietlaag) of 3D (diamant)
                    </text>
                  </svg>
                </div>

                <div v-else class="rounded-2xl border border-amber-200 bg-amber-50/30 p-4">
                  <svg viewBox="0 0 280 200" class="h-64 w-full">
                    <g v-for="point in metalPoints" :key="point.id">
                      <circle :cx="point.x" :cy="point.y" r="17" fill="#f59e0b" />
                      <text
                        :x="point.x"
                        :y="point.y + 4"
                        text-anchor="middle"
                        fill="white"
                        font-size="13"
                        font-weight="700"
                      >+
                      </text>
                    </g>
                    <g v-for="electron in electronPoints" :key="electron.id">
                      <circle
                        :cx="electron.x"
                        :cy="electron.y"
                        r="4"
                        fill="#0ea5e9"
                      >
                        <animate
                          attributeName="cx"
                          :values="electron.cxValues"
                          :dur="electron.duration"
                          :begin="electron.delay"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="cy"
                          :values="electron.cyValues"
                          :dur="electron.duration"
                          :begin="electron.delay"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                    <text x="14" y="188" fill="#b45309" font-size="11" font-weight="700">
                      vrije elektronen bewegen tussen positieve metaalionen
                    </text>
                  </svg>
                </div>
              </div>

              <!-- Content Summary -->
              <div class="space-y-4 lg:col-span-2">
                <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div class="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Deeltjes</div>
                  <p class="text-base font-medium text-slate-800">{{ selectedLattice.particles }}</p>
                </div>
                <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div class="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Binding</div>
                  <p class="text-base font-medium text-slate-800">{{ selectedLattice.bond }}</p>
                </div>
                <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div class="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Voorbeelden</div>
                  <p class="font-mono text-base font-medium text-slate-800">{{ selectedLattice.examples }}</p>
                </div>

                <div class="mt-6">
                  <h3 class="mb-3 text-sm font-bold text-slate-900">Eigenschappen</h3>
                  <div class="space-y-3">
                    <div v-for="(prop, index) in selectedLattice.properties" :key="index" class="border-l-2 pl-3" :class="selectedLattice.id === 'ion' ? 'border-violet-300' : selectedLattice.id === 'molecuul' ? 'border-emerald-300' : selectedLattice.id === 'atoom' ? 'border-sky-300' : 'border-amber-300'">
                      <p class="text-xs font-semibold text-slate-600">{{ prop.label }}</p>
                      <p class="text-sm font-medium text-slate-800">{{ prop.value }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-end">
            <button
              class="flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold transition-colors shadow-sm"
              :class="
                allViewed
                  ? 'bg-sky-600 text-white hover:bg-sky-700 hover:shadow-md'
                  : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
              "
              @click="finishActivity"
            >
              <PhCheckCircle weight="fill" />
              Activiteit afronden
            </button>
          </div>
        </div>
      </main>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
