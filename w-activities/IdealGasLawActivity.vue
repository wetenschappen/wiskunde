<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm text-white" @keydown.escape="handleClose">
    <div class="w-screen h-screen flex flex-col bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden">
      <!-- Header -->
      <header class="flex-shrink-0 bg-slate-950/70 border-b border-white/10 px-4 py-2 flex items-center justify-between text-lg z-10 backdrop-blur-sm">
        <div class="flex items-center gap-4">
          <div class="p-2 bg-cyan-900/50 rounded-lg ring-1 ring-cyan-400/30">
            <PhFlask class="text-cyan-300 animate-pulse-slow" :size="28" weight="duotone" />
          </div>
          <span class="font-bold tracking-tight text-slate-100">De Gaswetten</span>
        </div>
        <div class="font-mono text-base bg-black/20 text-amber-300 flex items-center gap-3 px-3 py-1.5 rounded-md ring-1 ring-white/5">
           <span>{{ constantLabel }} = {{ kValue.toFixed(2) }}</span>
           <span class="text-slate-500 text-sm font-sans">{{ constantUnit }}</span>
        </div>
        <button @click="handleClose" class="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400 focus-visible:ring-offset-slate-900">
          <PhX :size="24" weight="bold" />
        </button>
      </header>

      <!-- Tabs -->
      <nav class="relative flex-shrink-0 bg-slate-900 flex justify-center border-b border-slate-800 shadow-md">
        <button
          v-for="law in Object.values(laws)"
          :key="law.id"
          @click="setActiveLaw(law.id)"
          :class="[
            'px-6 py-3 font-semibold text-base transition-colors duration-300 relative',
            activeLaw === law.id
              ? 'text-amber-300'
              : 'text-slate-400 hover:text-white'
          ]"
        >
          <span class="relative z-10">{{ law.name }}</span>
          <span v-if="activeLaw === law.id" class="absolute inset-x-0 bottom-0 h-1 bg-amber-400 rounded-t-full shadow-lg shadow-amber-400/50" :style="{ viewTransitionName: 'active-tab' }"></span>
        </button>
      </nav>

      <!-- Main Content: Simulation + Data -->
      <main class="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-0 min-h-0">
        <!-- Simulation Panel (Left) -->
        <div class="lg:col-span-3 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 gap-0 min-h-0">
          <div class="w-full flex-1 min-h-0 relative">
            <svg ref="simSvg" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-full">
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                 <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur"/>
                  <feOffset in="blur" dx="2" dy="4" result="offsetBlur"/>
                  <feFlood flood-color="#000" flood-opacity="0.3" result="flood"/>
                  <feComposite in="flood" in2="offsetBlur" operator="in" result="shadow"/>
                  <feMerge>
                    <feMergeNode in="shadow"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>

                <radialGradient id="particleGradient">
                  <stop offset="0%" stop-color="rgba(255,255,255,0.8)" />
                  <stop offset="100%" stop-color="rgba(255,255,255,0)" />
                </radialGradient>
                <radialGradient id="cylinderInterior">
                    <stop offset="0%" stop-color="#475569" />
                    <stop offset="100%" stop-color="#1e293b" />
                </radialGradient>
                <linearGradient id="pistonFaceGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#e2e8f0"/>
                    <stop offset="50%" stop-color="#94a3b8"/>
                    <stop offset="100%" stop-color="#64748b"/>
                </linearGradient>
                <linearGradient id="pistonLockedGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#fca5a5"/>
                    <stop offset="50%" stop-color="#ef4444"/>
                    <stop offset="100%" stop-color="#b91c1c"/>
                </linearGradient>
                <linearGradient id="pistonDraggableGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#86efac"/>
                    <stop offset="50%" stop-color="#22c55e"/>
                    <stop offset="100%" stop-color="#166534"/>
                </linearGradient>
                <linearGradient id="pistonSteelGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#94a3b8"/>
                    <stop offset="50%" stop-color="#e2e8f0"/>
                    <stop offset="100%" stop-color="#64748b"/>
                </linearGradient>
                <linearGradient id="heatGlow" x1="0.5" x2="0.5" y1="1" y2="0">
                  <stop offset="0%" stop-color="rgba(255, 193, 7, 0.8)"/>
                  <stop offset="100%" stop-color="rgba(239, 68, 68, 0)"/>
                </linearGradient>
                <linearGradient id="coolGlow" x1="0.5" x2="0.5" y1="1" y2="0">
                  <stop offset="0%" stop-color="rgba(59, 130, 246, 0.8)"/>
                  <stop offset="100%" stop-color="rgba(59, 130, 246, 0)"/>
                </linearGradient>
                <path id="gasTubePath" d="M 0,300 C 40,300 50,350 80,350" fill="none"/>
              </defs>

              <rect :x="wallLeft" :y="pistonY" :width="wallRight - wallLeft" :height="floorY - pistonY"
                    fill="url(#cylinderInterior)"/>

              <rect :x="wallLeft" :y="floorY - 50" :width="wallRight - wallLeft" height="50"
                    :fill="heatingPower > 0 ? 'url(#heatGlow)' : heatingPower < 0 ? 'url(#coolGlow)' : 'transparent'"
                    :opacity="Math.abs(heatingPower) > 0 ? 0.7 : 0" class="transition-opacity duration-200" filter="url(#glow)"/>

              <rect :x="wallLeft - 10" :y="floorY" :width="wallRight - wallLeft + 20" height="15" rx="3"
                    :fill="heatingPower > 0 ? '#dc2626' : heatingPower < 0 ? '#2563eb' : '#64748b'"
                    class="transition-colors duration-300" :style="{ filter: Math.abs(heatingPower) > 0 ? 'brightness(1.5)' : 'brightness(1)' }"/>

              <rect :x="wallLeft-4" :y="minPistonY" :width="4" :height="floorY - minPistonY" fill="#94a3b8" />
              <rect :x="wallRight" :y="minPistonY" :width="4" :height="floorY - minPistonY" fill="#94a3b8" />
              <line :x1="wallLeft" :x2="wallRight" :y1="floorY" :y2="floorY" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>

              <g>
                <circle
                  v-for="p in sortedParticles"
                  :key="p.id"
                  :cx="p.x"
                  :cy="p.y"
                  :r="p.r"
                  :fill="p.color"
                  :fill-opacity="p.opacity"
                />
                <circle
                  v-for="p in sortedParticles"
                  :key="p.id + '-highlight'"
                  :cx="p.x - p.r * 0.2"
                  :cy="p.y - p.r * 0.2"
                  :r="p.r * 0.8"
                  fill="url(#particleGradient)"
                  :fill-opacity="p.opacity * 0.8"
                />
              </g>

              <circle v-for="h in wallHits" :key="h.id" :cx="h.x" :cy="h.y"
                      :r="6 * h.opacity" fill="white" :opacity="h.opacity" style="filter: blur(1px)"/>
              
              <g
                @mousedown.prevent="startDrag"
                @touchstart.prevent="startDrag"
                :class="{ 'cursor-ns-resize': pistonState === 'draggable', 'cursor-not-allowed': pistonState === 'locked', 'cursor-default': pistonState === 'free' }"
                :transform="`translate(0, ${pistonY})`"
                style="transition: transform 0.1s linear;"
                filter="url(#dropShadow)"
              >
                <rect :x="(wallLeft + wallRight)/2 - 12" :y="-pistonHandleHeight" width="24" :height="pistonHandleHeight" fill="url(#pistonSteelGradient)" rx="4"/>
                <rect :x="wallLeft" :y="0" :width="wallRight - wallLeft" :height="pistonThickness"
                      :fill="isDragging ? '#f1f5f9' : pistonState === 'locked' ? 'url(#pistonLockedGradient)' : pistonState === 'draggable' ? 'url(#pistonDraggableGradient)' : 'url(#pistonFaceGradient)'"
                      stroke="#1e293b" stroke-width="1" class="transition-all duration-300"/>
                <line v-for="i in 4" :key="'grip'+i"
                    :x1="(wallLeft + wallRight)/2 - 15 + i*10" :x2="(wallLeft + wallRight)/2 - 15 + i*10"
                    :y1="pistonThickness * 0.25" :y2="pistonThickness * 0.75"
                    :stroke="pistonState === 'locked' ? '#fca5a5' : pistonState === 'draggable' ? '#dcfce7' : '#94a3b8'" stroke-width="1.5" stroke-opacity="0.8"/>
              </g>

              <g v-if="pistonState === 'locked'" class="lock-brackets transition-opacity duration-300">
                <g class="text-red-500" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round">
                  <path :d="`M ${wallLeft - 12} ${pistonY - 5} L ${wallLeft - 12} ${pistonY + pistonThickness + 5}`"/>
                  <line :x1="wallLeft - 12" :x2="wallLeft - 4" :y1="pistonY - 5" :y2="pistonY - 5"/>
                  <line :x1="wallLeft - 12" :x2="wallLeft - 4" :y1="pistonY + pistonThickness + 5" :y2="pistonY + pistonThickness + 5"/>
                  <path :d="`M ${wallRight + 12} ${pistonY - 5} L ${wallRight + 12} ${pistonY + pistonThickness + 5}`" />
                  <line :x1="wallRight + 12" :x2="wallRight + 4" :y1="pistonY - 5" :y2="pistonY - 5"/>
                  <line :x1="wallRight + 12" :x2="wallRight + 4" :y1="pistonY + pistonThickness + 5" :y2="pistonY + pistonThickness + 5"/>
                </g>
                <g :transform="`translate(${(wallLeft + wallRight) / 2 - 12}, ${pistonY - pistonHandleHeight - 35}) scale(1.2)`">
                  <rect x="2" y="10" width="16" height="12" rx="2" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
                  <path d="M 6 10 L 6 6 C 6 2 14 2 14 6 L 14 10" fill="none" stroke="#991b1b" stroke-width="2.5" stroke-linecap="round"/>
                  <circle cx="10" cy="16" r="1.5" fill="#fecaca"/>
                </g>
              </g>

              <g :transform="`translate(${wallRight + 20}, ${pistonY + pistonThickness / 2})`" class="transition-transform duration-200">
                <text x="0" :y="0" dominant-baseline="middle" :fill="pistonState === 'locked' ? '#fca5a5' : pistonState === 'draggable' ? '#bbf7d0' : '#94a3b8'" font-size="12" font-weight="600" class="drop-shadow-sm">
                  {{ pistonState === 'locked' ? '🔒 V-vast' : pistonState === 'draggable' ? '↕ Sleep' : '⚡ Vrij' }}
                </text>
              </g>



              <g v-if="activeLaw === 'avogadro'">
                <path d="M 0,350 C 40,350 50,400 80,400" fill="none" stroke="#475569" stroke-width="12" stroke-linecap="round"/>
                <path d="M 0,350 C 40,350 50,400 80,400" fill="none" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
                <g v-if="isAddingGas || isRemovingGas">
                  <circle r="4.5" :fill="isAddingGas ? '#34d399' : '#f87171'" class="transition-colors" filter="url(#glow)">
                      <animateMotion dur="0.8s" repeatCount="indefinite" :path="isRemovingGas ? 'M 80,400 C 50,400 40,350 0,350' : 'M 0,350 C 40,350 50,400 80,400' "/>
                  </circle>
                  <circle r="4.5" :fill="isAddingGas ? '#34d399' : '#f87171'" class="transition-colors" filter="url(#glow)">
                      <animateMotion dur="0.8s" begin="0.4s" repeatCount="indefinite" :path="isRemovingGas ? 'M 80,400 C 50,400 40,350 0,350' : 'M 0,350 C 40,350 50,400 80,400' "/>
                  </circle>
                </g>
              </g>
            </svg>
            <div v-if="activeLaw === 'avogadro'" class="absolute left-0 top-1/2 flex flex-col gap-2 p-2 bg-slate-700/30 backdrop-blur-sm rounded-2xl ring-1 ring-white/10" style="top: 375px; transform: translateY(-50%)">
                <button @mousedown="startAddMoles" @mouseup="stopMoleChange" @mouseleave="stopMoleChange" class="p-2 bg-emerald-600/50 rounded-full text-emerald-200 hover:bg-emerald-600/70 hover:scale-110 active:scale-100 transition-all duration-200"><PhPlus weight="bold" /></button>
                <PhAtom :size="24" class="text-slate-400 mx-auto my-2" weight="duotone"/>
                <button @mousedown="startRemoveMoles" @mouseup="stopMoleChange" @mouseleave="stopMoleChange" class="p-2 bg-red-600/50 rounded-full text-red-200 hover:bg-red-600/70 hover:scale-110 active:scale-100 transition-all duration-200"><PhMinus weight="bold"/></button>
            </div>
          </div>
          <div class="flex items-center justify-center gap-2 py-2 -mt-4 w-full max-w-sm self-center">
              <button @mousedown="startHeating" @mouseup="stopHeating" @mouseleave="stopHeating"
                      :disabled="lawConfig.isTConstant"
                      class="p-4 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                      :class="heatingPower > 0 ? 'bg-red-600 shadow-xl shadow-red-500/50 scale-110' : 'bg-white/5 hover:bg-red-900/50'"
              >
                  <PhFire :size="28" weight="fill" class="transition-colors" :class="heatingPower > 0 ? 'text-yellow-300' : 'text-red-400'" />
              </button>
              <div class="font-mono text-2xl w-32 text-center text-white tabular-nums">{{ temperature.toFixed(0) }} K</div>
              <button @mousedown="startCooling" @mouseup="stopCooling" @mouseleave="stopCooling"
                      :disabled="lawConfig.isTConstant"
                      class="p-4 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                      :class="heatingPower < 0 ? 'bg-blue-600 shadow-xl shadow-blue-500/50 scale-110' : 'bg-white/5 hover:bg-blue-900/50'"
              >
                  <PhSnowflake :size="28" weight="fill" class="transition-colors" :class="heatingPower < 0 ? 'text-cyan-200' : 'text-blue-400'" />
              </button>
          </div>
        </div>

        <!-- Data Panel (Right) -->
        <div class="lg:col-span-2 bg-slate-800/70 p-4 flex flex-col gap-4 overflow-y-auto border-l border-white/10">
          <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <div v-for="meter in meters" :key="meter.id" class="flex flex-col items-center justify-between gap-2 bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-3 rounded-2xl ring-1 ring-white/5">
              <span class="font-bold text-slate-300 text-sm tracking-wide">{{ meter.label }}</span>
              <div class="h-20 w-full flex items-center justify-center">
                  <svg v-if="meter.id==='pressure'" viewBox="0 0 100 65" class="w-full h-full">
                      <defs><linearGradient id="pressureGradient"><stop offset="0%" stop-color="#34d399"/><stop offset="50%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f87171"/></linearGradient></defs>
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#475569" stroke-width="10" stroke-linecap="round"/>
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#pressureGradient)" stroke-width="10" stroke-linecap="round" :stroke-dasharray="pressureGaugeCircumference" :stroke-dashoffset="pressureGaugeOffset" class="transition-all duration-500"/>
                      <text x="10" y="62" font-size="10" fill="#94a3b8" text-anchor="middle">0</text><text x="90" y="62" font-size="10" fill="#94a3b8" text-anchor="middle">300</text><text x="50" y="62" font-size="10" fill="#94a3b8" text-anchor="middle">150</text>
                      <g :style="{ transform: `rotate(${pressureNeedleAngle}deg)`, transformOrigin: '50px 50px', transition: 'transform 0.5s ease-out' }"><line x1="50" y1="50" x2="50" y2="15" stroke="#e2e8f0" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="50" r="2" fill="white"/></g>
                      <circle cx="50" cy="50" r="6" fill="#334155" stroke="#1e293b" stroke-width="2" />
                  </svg>
                  <svg v-if="meter.id==='temperature'" viewBox="0 0 50 100" class="h-full w-auto">
                      <defs><linearGradient id="tempGradient" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#3b82f6"/><stop offset="50%" stop-color="#facc15"/><stop offset="100%" stop-color="#ef4444"/></linearGradient></defs>
                      <g v-for="i in 7" :key="'t'+i"><line :x1="i % 2 === 1 ? 5: 10" x2="18" :y1="10 + (i-1)*12.5" :y2="10 + (i-1)*12.5" stroke="#64748b" stroke-width="1"/><text v-if="i % 2 === 1" x="2" :y="13 + (i-1)*12.5" font-size="8" fill="#94a3b8">{{ (600 - (i-1)*100) }}</text></g>
                      <rect x="18" y="10" width="14" height="75" rx="7" fill="#334155"/><rect :x="18" :y="thermometerY" width="14" :height="thermometerHeight" rx="7" fill="url(#tempGradient)" class="transition-all duration-500"/><circle cx="25" cy="85" r="12" fill="url(#tempGradient)"/><circle cx="25" cy="85" r="8" fill="#334155" fill-opacity="0.3"/>
                  </svg>
                   <svg v-if="meter.id==='volume'" viewBox="0 0 50 100" class="h-full w-auto">
                      <defs><linearGradient id="volumeLiquidGradient"><stop stop-color="#38bdf8" offset="0%"/><stop stop-color="#38bdf8" stop-opacity="0.6" offset="100%"/></linearGradient></defs>
                      <rect x="15" y="10" width="30" height="80" rx="5" fill="#334155" />
                      <rect x="15" :y="volumeIndicatorY" width="30" :height="volumeIndicatorHeight" fill="url(#volumeLiquidGradient)" class="transition-all duration-500" style="transform-origin: bottom;" />
                      <g v-for="i in 5" :key="'v'+i"><line :x1="8" x2="15" :y1="10 + (i-1)*20" :y2="10 + (i-1)*20" stroke="#64748b" stroke-width="1"/><text x="2" :y="13+(i-1)*20" font-size="8" fill="#94a3b8" text-anchor="start">{{ (25 - (i-1)*5).toFixed(0) }}</text></g>
                  </svg>
              <div v-if="meter.id === 'collisions'" class="text-center">
                    <span class="font-mono text-4xl text-amber-300 tabular-nums">{{ collisionsPerSecond }}</span>
                    <span class="text-xs text-slate-400 block -mt-1">botsingen/s</span>
                  </div>
              </div>
              <span class="font-mono text-base whitespace-nowrap tabular-nums tracking-tight">{{ meter.value }}</span>
            </div>
          </div>
          
          <div class="flex-1 flex flex-col bg-slate-900/50 p-4 rounded-2xl min-h-[300px] ring-1 ring-white/5">
             <!-- Graph header -->
             <div class="flex items-center justify-between gap-2 mb-3">
               <div class="flex items-center gap-2">
                 <PhChartLine :size="18" class="text-amber-400"/>
                 <h3 class="font-semibold text-slate-200 text-sm tracking-wide">
                   <span class="text-amber-300">{{ lawConfig.graph.y.label }}</span>
                   <span class="text-slate-500 mx-1">vs.</span>
                   <span class="text-sky-300">{{ lawConfig.graph.x.label }}</span>
                 </h3>
               </div>
             </div>

             <!-- Axis labels row -->
             <div class="flex items-center justify-between px-1 mb-1">
               <span class="text-xs font-mono text-slate-500 rotate-0"
                     style="writing-mode: vertical-rl; transform: rotate(180deg); line-height:1;">{{ lawConfig.graph.y.label }} ({{ lawConfig.graph.y.unit }})</span>
               <div class="flex-1 relative"
                  @mouseenter="isGraphHovered = true"
                  @mouseleave="isGraphHovered = false"
                  @mousemove="updateGraphHover"
               >
                  <svg ref="graphSvg" :viewBox="`0 0 ${GRAPH_W} ${GRAPH_H}`" class="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.25"/>
                          <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
                        </linearGradient>
                        <linearGradient id="graphLineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stop-color="#f59e0b"/>
                          <stop offset="100%" stop-color="#fde68a"/>
                        </linearGradient>
                        <filter id="graphGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="2" result="blur"/>
                          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                        <clipPath id="graphClip"><rect :x="GRAPH_PAD_L" :y="GRAPH_PAD_T" :width="GRAPH_W - GRAPH_PAD_L - GRAPH_PAD_R" :height="GRAPH_H - GRAPH_PAD_T - GRAPH_PAD_B"></rect></clipPath>
                      </defs>

                      <!-- Grid & Axes -->
                      <g class="axes-grid">
                        <!-- Y axis -->
                        <line :x1="GRAPH_PAD_L" :x2="GRAPH_PAD_L" :y1="GRAPH_PAD_T" :y2="GRAPH_H - GRAPH_PAD_B" stroke="#475569" stroke-width="1"/>
                        <!-- X axis -->
                        <line :x1="GRAPH_PAD_L" :x2="GRAPH_W - GRAPH_PAD_R" :y1="GRAPH_H - GRAPH_PAD_B" :y2="GRAPH_H - GRAPH_PAD_B" stroke="#475569" stroke-width="1"/>
                        
                        <!-- Y ticks -->
                        <g v-for="tick in graphTicks.y" :key="'gy'+tick.val">
                          <line :x1="GRAPH_PAD_L - 4" :x2="GRAPH_W - GRAPH_PAD_R" :y1="tick.pos" :y2="tick.pos"
                                stroke="#334155" stroke-width="1" stroke-dasharray="3,4"/>
                          <text :x="GRAPH_PAD_L - 7" :y="tick.pos + 3.5"
                                text-anchor="end" fill="#64748b" font-size="8" font-family="monospace">{{ formatTickLabel(tick.val) }}</text>
                        </g>
                        <!-- X ticks -->
                        <g v-for="tick in graphTicks.x" :key="'gx'+tick.val">
                          <line :x1="tick.pos" :x2="tick.pos" :y1="GRAPH_PAD_T" :y2="GRAPH_H - GRAPH_PAD_B + 4"
                                stroke="#334155" stroke-width="1" stroke-dasharray="3,4"/>
                          <text :x="tick.pos" :y="GRAPH_H - GRAPH_PAD_B + 13"
                                text-anchor="middle" fill="#64748b" font-size="8" font-family="monospace">{{ formatTickLabel(tick.val) }}</text>
                        </g>
                      </g>

                      <!-- Data -->
                      <g clip-path="url(#graphClip)">
                        <!-- Straight line graph (faint ghost trail) -->
                        <path :d="graphAreaString" fill="url(#graphGradient)" opacity="0.15"/>
                        <polyline :points="graphPointsString" fill="none" stroke="url(#graphLineGradient)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4" filter="url(#graphGlow)"/>

                        <!-- Live current-state dot -->
                        <g v-if="liveDot" class="pointer-events-none">
                          <circle :cx="liveDot.x" :cy="liveDot.y" r="10" fill="#34d399" fill-opacity="0" stroke="#34d399" stroke-width="1.5" class="graph-pulse-ring"/>
                          <circle :cx="liveDot.x" :cy="liveDot.y" r="5" fill="#0f172a" stroke="#34d399" stroke-width="2" filter="url(#graphGlow)"/>
                          <circle :cx="liveDot.x" :cy="liveDot.y" r="2.5" fill="#34d399"/>
                        </g>
                        <!-- Hover crosshair -->
                        <g v-if="isGraphHovered && hoveredGraphPoint.point" class="pointer-events-none">
                          <line :x1="hoveredGraphPoint.pos.x" :x2="hoveredGraphPoint.pos.x"
                                :y1="GRAPH_PAD_T" :y2="GRAPH_H - GRAPH_PAD_B"
                                stroke="#fef08a" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>
                          <line :x1="GRAPH_PAD_L" :x2="GRAPH_W - GRAPH_PAD_R"
                                :y1="hoveredGraphPoint.pos.y" :y2="hoveredGraphPoint.pos.y"
                                stroke="#fef08a" stroke-width="1" stroke-dasharray="3,3" opacity="0.4"/>
                          <circle :cx="hoveredGraphPoint.pos.x" :cy="hoveredGraphPoint.pos.y"
                                  r="5" fill="#fef08a" stroke="#0f172a" stroke-width="2"
                                  filter="url(#graphGlow)"/>
                        </g>
                      </g>
                  </svg>

                  <!-- Hover tooltip -->
                  <transition name="fade-in">
                    <div v-if="isGraphHovered && hoveredGraphPoint.point"
                         class="pointer-events-none absolute top-2 right-2 bg-slate-950/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl text-xs font-mono text-amber-200 ring-1 ring-white/10 shadow-xl">
                      <div class="text-sky-300">{{ lawConfig.graph.x.label }}: <span class="text-white">{{ formatTooltip(hoveredGraphPoint.point.x, lawConfig.graph.x) }}</span></div>
                      <div class="text-amber-300">{{ lawConfig.graph.y.label }}: <span class="text-white">{{ formatTooltip(hoveredGraphPoint.point.y, lawConfig.graph.y) }}</span></div>
                    </div>
                  </transition>
               </div>
             </div>
             <!-- X-axis label -->
             <div class="text-center text-xs font-mono text-slate-500 mt-1">{{ lawConfig.graph.x.label }} ({{ lawConfig.graph.x.unit }})</div>
          </div>

        </div>
      </main>

      <footer class="flex-shrink-0 bg-black/20 border-t border-slate-800 px-6 py-3 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <PhInfo weight="duotone" class="text-sky-400 flex-shrink-0" />
        <span>{{ lawConfig.explanation }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, watchEffect, onMounted, onUnmounted, nextTick } from 'vue';
import { PhX, PhFlask, PhFire, PhSnowflake, PhAtom, PhChartLine, PhHandGrabbing, PhPlus, PhMinus, PhInfo, PhTrash } from '@phosphor-icons/vue';

const props = defineProps({
  isOpen: Boolean,
});
const emit = defineEmits(['close']);

// --- Constants & Config ---
const R = 8.314; // J/(mol·K)
const PARTICLES_PER_MOL = 15;
const BASE_RADIUS = 3;
const MIN_VOLUME = 0.005; // 5L
const MAX_VOLUME = 0.025; // 25L

// Vertical Cylinder Config
const svgWidth = 400, svgHeight = 500;
const wallLeft = 80, wallRight = 320;
const floorY = 460;
const minPistonY = 60, maxPistonY = 380;
const pistonThickness = 15, pistonHandleHeight = 40;

const laws = {
  gayLussac: { id: 'gayLussac', name: 'Gay-Lussac', isPConstant: false, isVConstant: true, isTConstant: false, isNConstant: true, canDragPiston: false, explanation: "Relatie tussen Druk en Temperatuur bij constant Volume. P/T = k", graph: { x: { key: 'temperature', label: 'T', unit: 'K' }, y: { key: 'pressure', label: 'P', unit: 'kPa' } } },
  boyle: { id: 'boyle', name: 'Boyle', isPConstant: false, isVConstant: false, isTConstant: true, isNConstant: true, canDragPiston: true, explanation: "Relatie tussen Druk en Volume bij constante Temperatuur. P·V = k", graph: { x: { key: 'volume', label: 'V', unit: 'm³' }, y: { key: 'pressure', label: 'P', unit: 'kPa' } } },
  charles: { id: 'charles', name: 'Charles', isPConstant: true, isVConstant: false, isTConstant: false, isNConstant: true, canDragPiston: false, explanation: "Relatie tussen Volume en Temperatuur bij constante Druk. V/T = k", graph: { x: { key: 'temperature', label: 'T', unit: 'K' }, y: { key: 'volume', label: 'V', unit: 'm³' } } },
  avogadro: { id: 'avogadro', name: 'Avogadro', isPConstant: true, isVConstant: false, isTConstant: true, isNConstant: false, canDragPiston: false, explanation: "Relatie tussen Volume en Aantal mol bij constante Druk en Temperatuur. V/n = k", graph: { x: { key: 'moles', label: 'n', unit: 'mol' }, y: { key: 'volume', label: 'V', unit: 'm³' } } },
};

// --- Core State ---
const activeLaw = ref('gayLussac');
const temperature = ref(300); // K
const volume = ref(0.01); // m^3 (10L)
const pressure = ref((1 * R * 300) / 0.01); // Pa
const moles = ref(1); // mol

const lawConfig = computed(() => laws[activeLaw.value]);

const pistonState = computed(() => {
    if (lawConfig.value.isVConstant) return 'locked';
    if (lawConfig.value.canDragPiston) return 'draggable';
    return 'free';
});

// --- Simulation State ---
const particles = ref([]);
const wallHits = ref([]);
let animationFrameId = null;
const isDragging = ref(false);
const simSvg = ref(null);
const pistonY = ref(200);
const collisionCount = ref(0);
const collisionsPerSecond = ref(0);
let collisionInterval = null;

const handleClose = () => emit('close');

watch(() => props.isOpen, (isOpen) => {
    if (isOpen) nextTick(() => {
        setActiveLaw(activeLaw.value);
        initializeParticles();
        startAnimation();
    });
    else stopAnimation();
}, { immediate: true });

onUnmounted(() => {
    stopAnimation();
    if (collisionInterval) clearInterval(collisionInterval);
});

// --- Law Switching ---
function setActiveLaw(lawId) {
    activeLaw.value = lawId;
    const config = laws[lawId];
    moles.value = 1;
    temperature.value = config.isTConstant ? 300 : 200;
    volume.value = config.isVConstant ? 0.01 : 0.015;
    if (config.isPConstant) pressure.value = 101325;
    physicsUpdate();
    initializeParticles();
}

// --- Physics Engine ---
function physicsUpdate() {
    const config = lawConfig.value;
    if (config.id === 'gayLussac' || config.id === 'boyle') {
        pressure.value = (moles.value * R * temperature.value) / volume.value;
    } else if (config.id === 'charles' || config.id === 'avogadro') {
        let newVolume = (moles.value * R * temperature.value) / pressure.value;
        volume.value = Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, newVolume));
    }
}

watchEffect(() => {
    const t = (volume.value - MIN_VOLUME) / (MAX_VOLUME - MIN_VOLUME);
    pistonY.value = maxPistonY - Math.max(0, Math.min(1, t)) * (maxPistonY - minPistonY);
});

// --- Particle Animation ---
function initializeParticles() {
  const numParticles = Math.round(moles.value * PARTICLES_PER_MOL);
  const currentParticles = particles.value.length;
  if (numParticles > currentParticles) {
    for (let i = 0; i < numParticles - currentParticles; i++) {
        const speed = Math.sqrt(temperature.value) * 0.1;
        const angle = Math.random() * 2 * Math.PI;
        particles.value.push({
            id: Math.random(),
            x: wallLeft + BASE_RADIUS + Math.random() * (wallRight - wallLeft - 2 * BASE_RADIUS),
            y: pistonY.value + BASE_RADIUS + Math.random() * (floorY - pistonY.value - 2 * BASE_RADIUS),
            z: Math.random(),
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: BASE_RADIUS * (0.7 + Math.random() * 0.6),
        });
    }
  } else if (numParticles < currentParticles) {
     particles.value.splice(0, currentParticles - numParticles);
  }
}

function animateParticles() {
  const speedFactor = Math.sqrt(temperature.value) * 0.1;
  const pY = pistonY.value;
  wallHits.value.forEach(h => h.opacity = Math.max(0, 1 - (Date.now() - h.time) / 300));
  wallHits.value = wallHits.value.filter(h => h.opacity > 0.01);

  particles.value.forEach(p => {
    p.y = Math.max(pY + pistonThickness + p.r, Math.min(floorY - p.r, p.y));
    p.x = Math.max(wallLeft + p.r, Math.min(wallRight - p.r, p.x));
    p.x += p.vx; p.y += p.vy;

    const hit = (x, y) => { wallHits.value.push({ x, y, time: Date.now(), id: Math.random(), opacity: 1 }); collisionCount.value++; };
    if (p.x <= wallLeft + p.r) { p.x = wallLeft + p.r; p.vx *= -1; hit(wallLeft, p.y); }
    if (p.x >= wallRight - p.r) { p.x = wallRight - p.r; p.vx *= -1; hit(wallRight, p.y); }
    if (p.y <= pY + pistonThickness + p.r) { p.y = pY + pistonThickness + p.r; p.vy *= -1; hit(p.x, pY + pistonThickness); }
    if (p.y >= floorY - p.r) { p.y = floorY - p.r; p.vy *= -1; hit(p.x, floorY); }

    const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const targetSpeed = speedFactor * (0.8 + Math.random() * 0.4);
    if (currentSpeed > 0.01) { const ratio = 1 + (targetSpeed / currentSpeed - 1) * 0.05; p.vx *= ratio; p.vy *= ratio; }
  });

  animationFrameId = requestAnimationFrame(animateParticles);
}

function startAnimation() {
    if (!animationFrameId) animateParticles();
    if (!collisionInterval) {
      let lastTime = Date.now();
      collisionInterval = setInterval(() => {
        const elapsed = (Date.now() - lastTime) / 1000;
        if (elapsed > 0) collisionsPerSecond.value = Math.round(collisionCount.value / elapsed);
        collisionCount.value = 0; lastTime = Date.now();
      }, 1000);
    }
}
function stopAnimation() {
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
    if (collisionInterval) { clearInterval(collisionInterval); collisionInterval = null; }
}

watch(moles, initializeParticles);

const sortedParticles = computed(() => {
  return [...particles.value].sort((a, b) => a.z - b.z).map(p => {
    const tempFactor = Math.min(1, Math.max(0, (temperature.value - 150) / 400));
    return { ...p, color: `rgb(${Math.round(255 * tempFactor)}, ${Math.round(80 * tempFactor * (1 - tempFactor) * 4)}, ${Math.round(255 * (1 - tempFactor))})`, opacity: 0.4 + p.z * 0.6 };
  });
});

// --- Interactivity (Piston, Heat, Moles) ---
function startDrag(e) { if (lawConfig.value.canDragPiston) isDragging.value = true; }
function doDrag(e) {
  if (!isDragging.value || !simSvg.value) return; e.preventDefault();
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const svgRect = simSvg.value.getBoundingClientRect();
  const svgY = ((clientY - svgRect.top) / svgRect.height) * svgHeight;
  const t = (maxPistonY - Math.max(minPistonY, Math.min(maxPistonY, svgY))) / (maxPistonY - minPistonY);
  volume.value = MIN_VOLUME + (MAX_VOLUME - MIN_VOLUME) * t;
  physicsUpdate();
}
function endDrag() { isDragging.value = false; }

const heatingPower = ref(0); let heatInterval = null;
const startHeating = () => setHeating(1); const stopHeating = () => setHeating(0);
const startCooling = () => setHeating(-1); const stopCooling = () => setHeating(0);
function setHeating(power) {
  if (lawConfig.value.isTConstant || heatingPower.value === power) return;
  if(heatInterval) clearInterval(heatInterval); heatInterval = null;
  heatingPower.value = power;
  if (power !== 0) {
    heatInterval = setInterval(() => {
      if ((power > 0 && volume.value >= MAX_VOLUME) || (power < 0 && volume.value <= MIN_VOLUME) && (activeLaw.value === 'charles' || activeLaw.value === 'avogadro')) { setHeating(0); return; }
      temperature.value = Math.max(1, Math.min(600, temperature.value + 5 * power));
      physicsUpdate();
    }, 100);
  }
}

const isAddingGas = ref(false), isRemovingGas = ref(false); let moleInterval = null;
const startAddMoles = () => setMoleChange(0.1); const startRemoveMoles = () => setMoleChange(-0.1);
const stopMoleChange = () => setMoleChange(0);
function setMoleChange(delta) {
    if (moleInterval) clearInterval(moleInterval); moleInterval = null;
    isAddingGas.value = delta > 0; isRemovingGas.value = delta < 0;
    if (delta !== 0) {
        moleInterval = setInterval(() => {
            if ((delta > 0 && volume.value >= MAX_VOLUME) || (delta < 0 && moles.value <= 0.2)) { stopMoleChange(); return; }
            moles.value = Math.max(0.2, Math.min(5, moles.value + delta));
            physicsUpdate();
        }, 100);
    }
}

onMounted(() => {
    window.addEventListener('mousemove', doDrag, { passive: false }); window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchmove', doDrag, { passive: false }); window.addEventListener('touchend', endDrag);
});
onUnmounted(() => {
    window.removeEventListener('mousemove', doDrag); window.removeEventListener('mouseup', endDrag);
    window.removeEventListener('touchmove', doDrag); window.removeEventListener('touchend', endDrag);
});

// --- Data Visualization & Meters ---
const kValue = computed(() => {
    const { id } = lawConfig.value;
    if (id === 'gayLussac') return (pressure.value / 1000) / temperature.value;
    if (id === 'boyle') return (pressure.value / 1000) * volume.value;
    if (id === 'charles') return volume.value / temperature.value;
    if (id === 'avogadro') return volume.value / moles.value;
    return 0;
});
const constantLabel = computed(() => lawConfig.value.id === 'gayLussac' ? 'P/T' : lawConfig.value.id === 'boyle' ? 'P·V' : lawConfig.value.id === 'charles' ? 'V/T' : 'V/n');
const constantUnit = computed(() => lawConfig.value.id === 'gayLussac' ? 'kPa/K' : lawConfig.value.id === 'boyle' ? 'kPa·m³' : lawConfig.value.id === 'charles' ? 'm³/K' : 'm³/mol');

const meters = computed(() => [
  { id: 'pressure', label: 'Druk', value: `${(pressure.value / 1000).toFixed(1)} kPa` },
  { id: 'temperature', label: 'Temp.', value: `${temperature.value.toFixed(0)} K` },
  { id: 'volume', label: 'Volume', value: `${volume.value.toFixed(3)} m³ (${(volume.value * 1000).toFixed(1)} L)` },
  { id: 'collisions', label: 'Botsingen', value: `${collisionsPerSecond.value}/s` }
]);

const pressureNeedleAngle = computed(() => (Math.min(pressure.value, 300000) / 300000) * 180 - 90);
const pressureGaugeCircumference = 40 * Math.PI;
const pressureGaugeOffset = computed(() => pressureGaugeCircumference * (1 - Math.min(pressure.value, 300000) / 300000));

const thermometerHeight = computed(() => 75 * (Math.max(0, temperature.value) / 600));
const thermometerY = computed(() => 10 + 75 * (1 - (Math.max(0, temperature.value) / 600)));

const volumeIndicatorHeight = computed(() => 80 * (Math.min(Math.max(volume.value, MIN_VOLUME), MAX_VOLUME) - MIN_VOLUME) / (MAX_VOLUME - MIN_VOLUME));
const volumeIndicatorY = computed(() => 10 + (80 - volumeIndicatorHeight.value));

// --- Graph Logic ---
const graphSvg = ref(null);
const GRAPH_W = 300, GRAPH_H = 200;
const GRAPH_PAD_T = 12, GRAPH_PAD_R = 12, GRAPH_PAD_B = 22, GRAPH_PAD_L = 38;
const isGraphHovered = ref(false);
const hoveredGraphPoint = ref({ point: null, pos: {x:0, y:0}});

function formatTickLabel(val) {
    if (val === 0) return '0';
    if (Math.abs(val) >= 1000) return (val / 1000).toFixed(1) + 'k';
    if (Math.abs(val) >= 10) return val.toFixed(0);
    if (Math.abs(val) >= 1) return val.toFixed(1);
    return val.toFixed(3); // Allows 0.025 for m3
}

function formatTooltip(val, config) {
    if (config.key === 'volume') {
        return `${val.toFixed(3)} m³ (${(val * 1000).toFixed(1)} L)`;
    }
    return `${val.toFixed(2)} ${config.unit}`;
}

const graphExtrema = computed(() => {
    const { id } = lawConfig.value;
    const k = kValue.value || 1;
    
    let maxX = 100;
    let maxY = 100;

    if (id === 'gayLussac') {
        maxX = 600; 
        maxY = k * maxX; 
    } else if (id === 'boyle') {
        maxX = 0.025;  
        maxY = 500; 
    } else if (id === 'charles') {
        maxX = 400; 
        maxY = k * maxX; 
    } else if (id === 'avogadro') {
        maxX = 1.5;   
        maxY = k * maxX; 
    }

    return {
        minX: 0,
        maxX,
        minY: 0,
        maxY
    };
});

const theoreticalGraphPoints = computed(() => {
    const { id } = lawConfig.value;
    const k = kValue.value || 1;
    const pts = [];
    const { minX, maxX, maxY } = graphExtrema.value;
    
    const steps = 60;
    for(let i = 0; i <= steps; i++) {
        const xVal = minX + (maxX - minX) * (i / steps);
        let yVal = 0;
        
        if (id === 'gayLussac' || id === 'charles' || id === 'avogadro') {
            yVal = k * xVal;
        } else if (id === 'boyle') {
            yVal = xVal > 0.002 ? k / xVal : maxY * 2;
        }
        
        pts.push({ x: xVal, y: Math.min(yVal, maxY * 1.5) });
    }
    return pts;
});

function mapToGraph(dataX, dataY) {
    const { minX, maxX, minY, maxY } = graphExtrema.value;
    return {
        x: GRAPH_PAD_L + ((dataX - minX) / (maxX - minX || 1)) * (GRAPH_W - GRAPH_PAD_L - GRAPH_PAD_R),
        y: (GRAPH_H - GRAPH_PAD_B) - ((dataY - minY) / (maxY - minY || 1)) * (GRAPH_H - GRAPH_PAD_T - GRAPH_PAD_B)
    };
}
function mapFromGraph(graphX) {
    const { minX, maxX } = graphExtrema.value;
    return minX + ((graphX - GRAPH_PAD_L) / (GRAPH_W - GRAPH_PAD_L - GRAPH_PAD_R)) * (maxX - minX || 1);
}

const mappedGraphPoints = computed(() => theoreticalGraphPoints.value.map(p => mapToGraph(p.x, p.y)));
const graphPointsString = computed(() => mappedGraphPoints.value.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' '));

const graphAreaString = computed(() => {
  const pts = mappedGraphPoints.value;
  if (pts.length < 1) return '';
  const first = pts[0]; const last = pts[pts.length - 1];
  return `M ${first.x.toFixed(2)},${GRAPH_H - GRAPH_PAD_B} L ${graphPointsString.value} L ${last.x.toFixed(2)},${GRAPH_H - GRAPH_PAD_B} Z`;
});

// Live dot: always reflects current gas state, always visible along the theoretical graph
const liveDot = computed(() => {
  const { x, y } = lawConfig.value.graph;
  const dataX = x.key === 'volume' ? volume.value : (x.key === 'moles' ? moles.value : temperature.value);
  const dataY = y.key === 'pressure' ? pressure.value / 1000 : (y.key === 'volume' ? volume.value : 0);
  return mapToGraph(dataX, dataY);
});

// Removed milestoneDots logic for simplicity as per user request

const graphTicks = computed(() => {
    const { minX, maxX, minY, maxY } = graphExtrema.value;
    const x = [], y = []; const numTicks = 3;
    for (let i = 0; i <= numTicks; i++) {
        x.push({ val: minX + (maxX - minX) * (i / numTicks), pos: GRAPH_PAD_L + (GRAPH_W - GRAPH_PAD_L - GRAPH_PAD_R) * (i / numTicks) });
        y.push({ val: minY + (maxY - minY) * (i / numTicks), pos: (GRAPH_H - GRAPH_PAD_B) - (GRAPH_H - GRAPH_PAD_T - GRAPH_PAD_B) * (i / numTicks) });
    }
    return { x, y };
});



function updateGraphHover(e) {
    if (!graphSvg.value || theoreticalGraphPoints.value.length < 2) return;
    const svgRect = graphSvg.value.getBoundingClientRect();
    const svgX = ((e.clientX - svgRect.left) / svgRect.width) * GRAPH_W;
    const dataX = mapFromGraph(svgX);
    
    let closestPoint = theoreticalGraphPoints.value.reduce((closest, current) => 
        Math.abs(current.x - dataX) < Math.abs(closest.x - dataX) ? current : closest);

    hoveredGraphPoint.value = { point: closestPoint, pos: mapToGraph(closestPoint.x, closestPoint.y) };
}
</script>

<style scoped>
.text-xs { font-size: 10px; }
.fade-in-enter-active, .fade-in-leave-active { transition: opacity 0.3s ease; }
.fade-in-enter-from, .fade-in-leave-to { opacity: 0; }

.graph-pulse-ring {
  animation: graph-pulse 1.5s ease-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes graph-pulse {
  0%   { r: 5;  stroke-opacity: 0.9; }
  100% { r: 14; stroke-opacity: 0; }
}
</style>