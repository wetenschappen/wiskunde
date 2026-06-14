<script setup>
import { computed } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true,
    default: () => ({
      domain: [-10, 10],
      range: [-10, 10],
      functions: [],
      points: [],
      labels: [],
      showGrid: true
    })
  }
})

const emit = defineEmits(['graph-click'])

const svgWidth = 800
const svgHeight = 600

const domainX = computed(() => props.config.domain || [-10, 10])
const rangeY = computed(() => props.config.range || [-10, 10])
const viewBoxWidth = computed(() => domainX.value[1] - domainX.value[0])
const viewBoxHeight = computed(() => rangeY.value[1] - rangeY.value[0])

const xTicks = computed(() => {
  const ticks = []
  const [minX, maxX] = domainX.value
  const width = maxX - minX
  let step = 1
  if (width > 20) step = 5
  else if (width > 10) step = 2
  
  const start = Math.ceil(minX / step) * step
  for (let x = start; x <= maxX; x += step) {
    if (x === 0) continue
    ticks.push({
      val: x,
      x: toSvgX(x),
      y: toSvgY(0)
    })
  }
  return ticks
})

const yTicks = computed(() => {
  const ticks = []
  const [minY, maxY] = rangeY.value
  const height = maxY - minY
  let step = 1
  if (height > 20) step = 5
  else if (height > 10) step = 2
  
  const start = Math.ceil(minY / step) * step
  for (let y = start; y <= maxY; y += step) {
    if (y === 0) continue
    ticks.push({
      val: y,
      x: toSvgX(0),
      y: toSvgY(y)
    })
  }
  return ticks
})

function toSvgX(x) {
  return ((x - domainX.value[0]) / viewBoxWidth.value) * svgWidth
}

function toSvgY(y) {
  return svgHeight - ((y - rangeY.value[0]) / viewBoxHeight.value) * svgHeight
}

function fromSvgX(svgX) {
  return domainX.value[0] + (svgX / svgWidth) * viewBoxWidth.value
}

function fromSvgY(svgY) {
  return rangeY.value[0] + ((svgHeight - svgY) / svgHeight) * viewBoxHeight.value
}

function onClick(e) {
  const rect = e.target.closest('svg').getBoundingClientRect()
  const svgX = ((e.clientX - rect.left) / rect.width) * svgWidth
  const svgY = ((e.clientY - rect.top) / rect.height) * svgHeight
  
  const mathX = fromSvgX(svgX)
  const mathY = fromSvgY(svgY)
  
  emit('graph-click', { x: mathX, y: mathY })
}

function generateFunctionPath(funcDef) {
  let path = ''
  // Evaluate the function across the domain
  const step = viewBoxWidth.value / 1000 // 1000 points for smoothness
  for (let x = domainX.value[0]; x <= domainX.value[1]; x += step) {
    try {
      const y = funcDef.fn(x)
      // Check if y is within sensible bounds to prevent SVG explosion
      if (y === null || isNaN(y) || !isFinite(y)) {
        path += '' // break the path visually if undefined? SVG path M could be used.
        continue;
      }
      
      const svgX = toSvgX(x)
      const svgY = toSvgY(y)
      if (path === '' || isNaN(svgY)) {
        if (!isNaN(svgY)) path += `M ${svgX} ${svgY}`
      } else {
        path += ` L ${svgX} ${svgY}`
      }
    } catch(e) {
        // Skip points where function is undefined
    }
  }
  return path
}

const renderData = computed(() => {
  const elements = []
  
  // Axes
  elements.push({ type: 'axis', x1: toSvgX(domainX.value[0]), y1: toSvgY(0), x2: toSvgX(domainX.value[1]), y2: toSvgY(0) })
  elements.push({ type: 'axis', x1: toSvgX(0), y1: toSvgY(rangeY.value[0]), x2: toSvgX(0), y2: toSvgY(rangeY.value[1]) })

  // Functions
  if (props.config.functions) {
    props.config.functions.forEach(f => {
       elements.push({
         type: 'function',
         id: f.id || Math.random().toString(),
         path: generateFunctionPath(f),
         color: f.color || '#ea580c',
         width: f.width || 3.5
       })
    })
  }

  // Points
  if (props.config.points) {
    props.config.points.forEach(p => {
       elements.push({
         type: 'point',
         id: p.id || Math.random().toString(),
         cx: toSvgX(p.x),
         cy: toSvgY(p.y),
         color: p.color || '#0f172a',
         label: p.label
       })
    })
  }

  return elements
})
</script>

<template>
  <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-full font-sans select-none" preserveAspectRatio="xMidYMid meet" @click="onClick">
    <!-- Grid -->
    <g v-if="config.showGrid !== false">
        <line v-for="i in Math.floor(viewBoxWidth)" :key="'gx'+i"
              :x1="toSvgX(domainX[0] + i)" :y1="0" :x2="toSvgX(domainX[0] + i)" :y2="svgHeight"
              stroke="#e2e8f0" stroke-width="1" />
        <line v-for="i in Math.floor(viewBoxHeight)" :key="'gy'+i"
              :x1="0" :y1="toSvgY(rangeY[0] + i)" :x2="svgWidth" :y2="toSvgY(rangeY[0] + i)"
              stroke="#e2e8f0" stroke-width="1" />
    </g>

    <!-- Axes -->
    <line v-for="(el, i) in renderData.filter(e => e.type === 'axis')" :key="'a'+i"
          :x1="el.x1" :y1="el.y1" :x2="el.x2" :y2="el.y2"
          stroke="#475569" stroke-width="2.5" stroke-linecap="round" />
          
    <!-- Ticks & Labels (Desmos Style) -->
    <!-- X Axis Ticks & Labels -->
    <g v-for="tick in xTicks" :key="'xt-'+tick.val">
        <line :x1="tick.x" :y1="tick.y - 5" :x2="tick.x" :y2="tick.y + 5" stroke="#475569" stroke-width="1.5" />
        <text :x="tick.x" :y="tick.y + 22" text-anchor="middle" font-size="13" font-weight="600" fill="#64748b">{{ tick.val }}</text>
    </g>

    <!-- Y Axis Ticks & Labels -->
    <g v-for="tick in yTicks" :key="'yt-'+tick.val">
        <line :x1="tick.x - 5" :y1="tick.y" :x2="tick.x + 5" :y2="tick.y" stroke="#475569" stroke-width="1.5" />
        <text :x="tick.x - 12" :y="tick.y + 4.5" text-anchor="end" font-size="13" font-weight="600" fill="#64748b">{{ tick.val }}</text>
    </g>

    <!-- Origin marker -->
    <text :x="toSvgX(0) - 12" :y="toSvgY(0) + 20" font-size="13" font-weight="600" fill="#64748b">0</text>
    
    <!-- Axis End Labels -->
    <text :x="toSvgX(domainX[1]) - 18" :y="toSvgY(0) - 10" font-size="14" font-weight="bold" fill="#475569">x</text>
    <text :x="toSvgX(0) + 12" :y="toSvgY(rangeY[1]) + 18" font-size="14" font-weight="bold" fill="#475569">y</text>

    <!-- Functions -->
    <path v-for="el in renderData.filter(e => e.type === 'function')" :key="'f'+el.id"
          :d="el.path" fill="none" :stroke="el.color" :stroke-width="el.width" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Custom Segments / Projections -->
    <g v-if="config.segments">
        <line v-for="(seg, idx) in config.segments" :key="'seg-'+idx"
              :x1="toSvgX(seg.x1)" :y1="toSvgY(seg.y1)" :x2="toSvgX(seg.x2)" :y2="toSvgY(seg.y2)"
              :stroke="seg.color || '#94a3b8'"
              :stroke-width="seg.width || 2"
              :stroke-dasharray="seg.dashed ? '5,5' : 'none'"
              stroke-linecap="round" />
    </g>

    <!-- Points -->
    <g v-for="el in renderData.filter(e => e.type === 'point')" :key="'p'+el.id">
        <circle :cx="el.cx" :cy="el.cy" r="6" :fill="el.color" />
        <text v-if="el.label" :x="el.cx + 10" :y="el.cy - 10" font-size="14" font-weight="bold" :fill="el.color">{{ el.label }}</text>
    </g>

    <!-- Outer Framing Border -->
    <rect x="0" y="0" :width="svgWidth" :height="svgHeight" fill="none" stroke="#cbd5e1" stroke-width="1.5" />
  </svg>
</template>
