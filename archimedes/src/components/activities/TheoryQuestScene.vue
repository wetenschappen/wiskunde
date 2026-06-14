<script setup>
import { computed } from 'vue';
import { PhLightbulb } from "@phosphor-icons/vue";
import { renderMath } from "../../composables/useMathRenderer";

const props = defineProps({
    scene: { type: String, required: true },
    rho: { type: Number, default: 1000 },
    rhoObject: { type: Number, default: 500 },
    vol: { type: Number, default: 100 },
    depth: { type: Number, default: 50 },
    pressureVectorMode: { type: String, default: 'surface' }, // 'surface' | 'point'
});

// Didactische berekeningen voor visuele impact
const faLength = computed(() => {
    const scale = (props.rho / 1000) * (props.vol / 100);
    return 30 + scale * 45;
});

const pTop = computed(() => (props.rho / 1000) * props.depth * 0.5); 
const pBottom = computed(() => pTop.value + (props.rho / 1000) * 60);
const objectSize = computed(() => Math.sqrt(props.vol) * 8); 

// Scene 3: States Logic
const isFloating = computed(() => props.rhoObject < props.rho);
const stateY = computed(() => {
    if (isFloating.value) {
        const fraction = props.rhoObject / props.rho;
        return 80 - (1 - fraction) * 60 + 30;
    }
    if (props.rhoObject === props.rho) return 230; 
    return 350; 
});

const fzLengthStates = computed(() => {
    const scale = (props.rhoObject / 1000) * (props.vol / 100);
    return Math.min(80, 25 + scale * 25); 
});

const faLengthStates = computed(() => {
    if (isFloating.value) {
        return fzLengthStates.value;
    }
    const scale = (props.rho / 1000) * (props.vol / 100);
    return Math.min(80, 25 + scale * 25);
});

// Scene 4: Iceberg Logic
const submergedFraction = computed(() => Math.min(1, props.rhoObject / props.rho));
const isSinkingIceberg = computed(() => props.rhoObject > props.rho);
const icebergY = computed(() => {
    if (isSinkingIceberg.value) return 79; // Bottom of path (296) + 79 = 375 (Tank floor)
    // Precise physics: submerged fraction * height + water_level - bottom_y
    // height = 296 - 179 = 117. water_level = 180. bottom_y = 296.
    return submergedFraction.value * 117 + 180 - 296;
});
</script>

<template>
    <div class="w-full h-full flex items-center justify-center bg-white rounded-3xl border border-slate-100 relative overflow-hidden shadow-inner shadow-slate-200/50">
        <svg viewBox="0 0 400 400" class="w-full h-full overflow-visible font-sans select-none">
            <defs>
                <marker id="tqArrowBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#0369a1" />
                </marker>
                <marker id="tqArrowRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#b91c1c" />
                </marker>
                <marker id="tqArrowOrange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" />
                </marker>
                <marker id="tqArrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
                </marker>
                <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
                </linearGradient>
            </defs>

            <!-- SCENE 1: FA -->
            <g v-if="scene === 'formula'">
                <rect x="20" y="60" width="360" height="320" rx="4" fill="url(#waterGrad)" stroke="#bae6fd" stroke-width="2" />
                <path d="M 20 60 Q 110 50 200 60 T 380 60" fill="none" stroke="#bae6fd" stroke-width="2" />
                <rect :x="200 - (objectSize/2)" :y="260 - (objectSize/2)" :width="objectSize" :height="objectSize" fill="white" stroke="#0c4a6e" stroke-width="2" class="ease-out shadow-lg" />
                <g class="ease-out">
                    <line x1="200" y1="260" x2="200" :y2="260 - faLength" stroke="#0369a1" stroke-width="4" marker-end="url(#tqArrowBlue)" />
                    <circle cx="200" cy="260" r="4" fill="#0f172a" />
                    <text x="216" :y="260 - faLength/2" fill="#0369a1" font-weight="900" font-size="20" dominant-baseline="middle" style="text-shadow: 2px 2px 0px white;">F<tspan font-size="14" dy="6">A</tspan></text>
                </g>
            </g>

            <!-- SCENE 2: Pressure -->
            <g v-if="scene === 'pressure'">
                <rect x="50" y="20" width="300" height="360" rx="4" fill="url(#waterGrad)" stroke="#bae6fd" />
                <rect x="140" :y="20 + depth" width="120" height="120" fill="white" stroke="#0c4a6e" stroke-width="1.5" class="ease-out" />
                <g class="ease-out">
                    <line x1="60" y1="20" x2="60" :y2="20+depth" stroke="#0369a1" stroke-width="1" stroke-dasharray="3" />
                    <line x1="57" y1="20" x2="63" y2="20" stroke="#0369a1" stroke-width="1" />
                    <line x1="57" :y1="20+depth" x2="63" :y2="20+depth" stroke="#0369a1" stroke-width="1" />
                    <text x="54" :y="20 + depth/2" text-anchor="end" fill="#0369a1" font-size="11" font-style="italic" dominant-baseline="middle">h₁</text>
                    <line x1="60" :y1="20+depth" x2="60" :y2="20+depth+120" stroke="#0369a1" stroke-width="1.5" />
                    <line x1="57" :y1="20+depth" x2="63" :y2="20+depth" stroke="#0369a1" stroke-width="1.5" />
                    <line x1="57" :y1="20+depth+120" x2="63" :y2="20+depth+120" stroke="#0369a1" stroke-width="1.5" />
                    <text x="54" :y="20 + depth + 60" text-anchor="end" fill="#0369a1" font-size="11" font-style="italic" dominant-baseline="middle">z</text>
                </g>
                <g class="ease-out">
                    <line :x1="100" :y1="20 + depth + 60" :x2="135" :y2="20 + depth + 60" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="2" />
                    <line :x1="115" :y1="20 + depth + 60" :x2="115" :y2="20 + depth + 60 - (pBottom * 0.6 - pTop * 0.6)" stroke="#059669" stroke-width="4" marker-end="url(#tqArrowGreen)" />
                    <text :x="115" :y="20 + depth + 60 - (pBottom * 0.6 - pTop * 0.6) - 15" text-anchor="middle" fill="#059669" font-weight="900" font-size="14" style="text-shadow: 1px 1px 0px white;">F<tspan baseline-shift="sub" font-size="10">A</tspan></text>
                </g>
                <g class="ease-out">
                    <template v-if="pressureVectorMode === 'surface'">
                        <line x1="200" :y1="20 + depth - (10 + pTop * 0.6)" :x2="200" :y2="20 + depth - 2" stroke="#d97706" stroke-width="4" marker-end="url(#tqArrowOrange)" />
                        <text x="216" :y="20 + depth - 12" fill="#d97706" font-weight="bold" font-size="11">F<tspan baseline-shift="sub" font-size="8">boven</tspan></text>
                        <line x1="200" :y1="20 + depth + 120 + (10 + pBottom * 0.6)" :x2="200" :y2="20 + depth + 120 + 2" stroke="#0369a1" stroke-width="4" marker-end="url(#tqArrowBlue)" />
                        <text x="216" :y="20 + depth + 120 + 22" fill="#0369a1" font-weight="900" font-size="11">F<tspan baseline-shift="sub" font-size="8">onder</tspan></text>
                    </template>
                    <template v-else>
                        <circle cx="200" :cy="20 + depth + 60" r="4" fill="#0f172a" />
                        <line x1="200" :y1="20 + depth + 60" :x2="200" :y2="20 + depth + 60 - (10 + pBottom * 0.6)" stroke="#0369a1" stroke-width="4" marker-end="url(#tqArrowBlue)" />
                        <line x1="200" :y1="20 + depth + 60" :x2="200" :y2="20 + depth + 60 + (10 + pTop * 0.6)" stroke="#d97706" stroke-width="4" marker-end="url(#tqArrowOrange)" />
                        <text x="214" :y="20 + depth + 34" fill="#0369a1" font-weight="900" font-size="11">F<tspan baseline-shift="sub" font-size="8">onder</tspan></text>
                        <text x="214" :y="20 + depth + 86" fill="#d97706" font-weight="bold" font-size="11">F<tspan baseline-shift="sub" font-size="8">boven</tspan></text>
                    </template>
                </g>
            </g>

            <!-- SCENE 3: States -->
            <g v-if="scene === 'states'">
                <path d="M 35 60 L 35 385 L 245 385 L 245 60" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.2" />
                <path d="M 40 380 L 240 380 L 240 80 Q 140 78 40 80 Z" fill="url(#waterGrad)" stroke="#bae6fd" stroke-width="1" />
                <path d="M 40 80 Q 140 78 240 80" fill="none" stroke="#bae6fd" stroke-width="2.5" stroke-linecap="round" />
                <g class="ease-out" :style="{ transform: `translateY(${stateY - 200}px)` }">
                    <rect x="110" y="170" width="60" height="60" fill="white" stroke="#0c4a6e" stroke-width="2" rx="4" />
                    <circle cx="140" cy="200" r="4" fill="#0f172a" />
                    <line x1="140" y1="200" x2="140" :y2="200 - faLengthStates" stroke="#0369a1" stroke-width="4" marker-end="url(#tqArrowBlue)" />
                    <line x1="140" y1="200" x2="140" :y2="200 + fzLengthStates" stroke="#b91c1c" stroke-width="4" marker-end="url(#tqArrowRed)" />
                    <text x="155" :y="200 - faLengthStates/2" fill="#0369a1" font-size="14" font-weight="900">F<tspan baseline-shift="sub" font-size="10">A</tspan></text>
                    <text x="155" :y="200 + fzLengthStates/2" fill="#b91c1c" font-size="14" font-weight="900">F<tspan baseline-shift="sub" font-size="10">z</tspan></text>
                </g>

                <g transform="translate(260, 90)">
                    <g v-if="isFloating" class="ease-out">
                        <!-- Top box: Drijven -->
                        <g transform="translate(0, 0)">
                            <rect x="0" y="0" width="130" height="100" rx="16" fill="#f0f9ff" stroke="#bae6fd" stroke-width="2" class="shadow-sm" />
                            <text text-anchor="middle" x="65" y="24" fill="#0369a1" font-size="16" font-weight="900">Drijven</text>
                            
                            <text text-anchor="middle" x="65" y="44" fill="#0369a1" font-size="11" font-weight="bold">V<tspan baseline-shift="sub" font-size="8.5">onder</tspan> neemt af,</text>
                            <text text-anchor="middle" x="65" y="58" fill="#0369a1" font-size="11" font-weight="bold">dus F<tspan baseline-shift="sub" font-size="8.5">A</tspan> neemt af</text>
                            
                            <rect x="15" y="68" width="100" height="24" rx="8" fill="white" stroke="#e0f2fe" stroke-width="1.5" />
                            <text text-anchor="middle" x="65" y="84" fill="#0369a1" font-size="12" font-weight="black">tot F<tspan baseline-shift="sub" font-size="9">A</tspan> = F<tspan baseline-shift="sub" font-size="9">z</tspan></text>
                        </g>

                        <!-- Transition Arrow -->
                        <line x1="65" y1="145" x2="65" y2="105" stroke="#bae6fd" stroke-width="2.5" stroke-dasharray="5" marker-end="url(#tqArrowBlue)" />

                        <!-- Bottom box: Stijgen -->
                        <g transform="translate(15, 150)">
                            <rect x="0" y="0" width="100" height="65" rx="16" fill="white" fill-opacity="0.98" stroke="#e2e8f0" stroke-width="2" class="shadow-sm" />
                            <text text-anchor="middle" x="50" y="28" fill="#0f172a" font-size="16" font-weight="900">Stijgen</text>
                            <rect x="15" y="36" width="70" height="22" rx="8" fill="#f8fafc" stroke="#f1f5f9" stroke-width="1.5" />
                            <text text-anchor="middle" x="50" y="51" fill="#0369a1" font-size="13" font-weight="black">F<tspan baseline-shift="sub" font-size="9">A</tspan> > F<tspan baseline-shift="sub" font-size="9">z</tspan></text>
                        </g>
                    </g>
                    <g v-else class="ease-out" transform="translate(10, 80)">
                        <rect x="0" y="0" width="110" height="80" rx="16" fill="white" fill-opacity="0.98" stroke="#e2e8f0" stroke-width="2" class="shadow-md" />
                        <text text-anchor="middle" x="55" y="32" fill="#0f172a" font-size="18" font-weight="900">{{ rhoObject === rho ? 'Zweven' : 'Zinken' }}</text>
                        <rect x="15" y="44" width="80" height="24" rx="8" :fill="rhoObject > rho ? '#fef2f2' : '#f8fafc'" :stroke="rhoObject > rho ? '#fee2e2' : '#f1f5f9'" stroke-width="1.5" />
                        <text text-anchor="middle" x="55" y="60" :fill="rhoObject > rho ? '#b91c1c' : '#64748b'" font-size="13" font-weight="black">
                            F<tspan baseline-shift="sub" font-size="9">A</tspan> {{ rhoObject === rho ? '=' : '<' }} F<tspan baseline-shift="sub" font-size="9">z</tspan>
                        </text>
                    </g>
                </g>
            </g>

            <!-- SCENE 4: Iceberg -->
            <g v-if="scene === 'iceberg'">
                <!-- Tank Walls (Shifted to use full width) -->
                <path d="M 215 40 L 215 385 L 385 385 L 385 40" fill="none" stroke="#64748b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.15" />
                <path d="M 220 380 L 380 380 L 380 180 Q 300 178 220 180 Z" fill="#e0f2fe" stroke="#bae6fd" stroke-width="1.5" />
                <path d="M 220 180 Q 300 178 380 180" fill="none" stroke="#bae6fd" stroke-width="3" stroke-linecap="round" />
                
                <g class="ease-out" :style="{ transform: `translateY(${ icebergY }px)` }">
                    <!-- Iceberg Shape (Scaled and centered to prevent clipping) -->
                    <path d="M 264 215 L 255 197 L 282 179 L 309 202 L 323 215 L 341 278 L 291 296 L 246 260 Z" fill="white" stroke="#0c4a6e" stroke-width="3" stroke-linejoin="round" />
                    <text x="296" y="235" text-anchor="middle" fill="#0c4a6e" font-weight="900" font-size="14">Ijsberg</text>
                </g>

                <!-- State Label (Large and clear on the left) -->
                <g transform="translate(10, 80)">
                    <rect x="0" y="-20" width="195" height="75" rx="15" fill="white" fill-opacity="0.98" stroke="#e2e8f0" stroke-width="2" class="shadow-sm" />
                    <text text-anchor="middle" x="97.5" y="15" :fill="isSinkingIceberg ? '#b91c1c' : '#0f172a'" font-size="22" font-weight="900">{{ isSinkingIceberg ? 'Zinken' : 'Drijven' }}</text>
                    <text text-anchor="middle" x="97.5" y="42" :fill="isSinkingIceberg ? '#ef4444' : '#d97706'" font-size="16" font-weight="black">
                        {{ isSinkingIceberg ? 'TE ZWAAR!' : (submergedFraction * 100).toFixed(0) + '% onder water' }}
                    </text>
                </g>

                <!-- Big Formula Box (Dominant on the left side) -->
                <g transform="translate(10, 175)">
                    <rect x="0" y="-15" width="195" height="195" rx="20" fill="#f8fafc" fill-opacity="0.98" stroke="#bae6fd" stroke-width="2.5" />
                    <text text-anchor="middle" x="97.5" y="15" fill="#0369a1" font-size="12" font-weight="black" tracking-widest uppercase>Drijfformule</text>
                    
                    <!-- Formula Variables (Large) -->
                    <text text-anchor="middle" x="55" y="50" fill="#0c4a6e" font-size="18" font-weight="bold">V<tspan baseline-shift="sub" font-size="12">onder</tspan></text>
                    <line x1="25" y1="66" x2="85" y2="66" stroke="#0c4a6e" stroke-width="2.5" stroke-linecap="round" />
                    <text text-anchor="middle" x="55" y="86" fill="#0c4a6e" font-size="18" font-weight="bold">V<tspan baseline-shift="sub" font-size="12">vwp</tspan></text>
                    
                    <text text-anchor="middle" x="97.5" y="74" fill="#64748b" font-size="24" font-weight="black">=</text>
                    
                    <text text-anchor="middle" x="140" y="50" fill="#d97706" font-size="18" font-weight="bold">ρ<tspan baseline-shift="sub" font-size="12">vwp</tspan></text>
                    <line x1="110" y1="66" x2="170" y2="66" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" />
                    <text text-anchor="middle" x="140" y="86" fill="#d97706" font-size="18" font-weight="bold">ρ<tspan baseline-shift="sub" font-size="12">vl</tspan></text>
                    
                    <!-- Dynamic Values (Very Large) -->
                    <g transform="translate(0, 55)">
                        <rect x="15" y="60" width="165" height="55" rx="12" fill="white" stroke="#e2e8f0" stroke-width="1.5" />
                        <text text-anchor="middle" x="97.5" y="83" fill="#0f172a" font-size="15" font-weight="black">
                            {{ rhoObject }} <tspan font-size="10" fill="#64748b">kg/m³</tspan> / {{ rho }} <tspan font-size="10" fill="#64748b">kg/m³</tspan>
                        </text>
                        <text text-anchor="middle" x="97.5" y="105" fill="#d97706" font-size="16" font-weight="900">
                             = {{ submergedFraction.toFixed(3) }}
                        </text>
                    </g>
                </g>
            </g>

            <!-- SCENE 5: Sandbox -->
            <g v-if="scene === 'sandbox'">
                <rect x="20" y="40" width="360" height="340" rx="8" fill="url(#waterGrad)" stroke="#bae6fd" />
                <g class="ease-out" :style="{ transform: `translateY(${(rhoObject > rho ? depth + 100 : (rhoObject === rho ? depth : -50)) }px)` }">
                    <rect :x="200 - (objectSize/2)" :y="40 + depth" :width="objectSize" :height="objectSize" fill="white" stroke="#0c4a6e" stroke-width="2" />
                    <circle cx="200" :cy="40 + depth + objectSize/2" r="4" fill="#0f172a" />
                    <template v-if="pressureVectorMode === 'surface'">
                        <line x1="200" :y1="40 + depth - (5 + pTop/3)" :x2="200" :y2="40 + depth - 2" stroke="#d97706" stroke-width="3" marker-end="url(#tqArrowOrange)" />
                        <line x1="200" :y1="40 + depth + objectSize + (5 + pBottom/3)" :x2="200" :y2="40 + depth + objectSize + 2" stroke="#0369a1" stroke-width="3" marker-end="url(#tqArrowBlue)" />
                    </template>
                    <template v-else>
                        <line x1="200" :y1="40 + depth + objectSize/2" :x2="200" :y2="40 + depth + objectSize/2 - faLength" stroke="#0369a1" stroke-width="4" marker-end="url(#tqArrowBlue)" />
                        <line x1="200" :y1="40 + depth + objectSize/2" :x2="200" :y2="40 + depth + objectSize/2 + fzLengthStates" stroke="#b91c1c" stroke-width="4" marker-end="url(#tqArrowRed)" />
                    </template>
                </g>
                <text x="200" y="30" text-anchor="middle" fill="#0c4a6e" font-size="14" font-weight="900">Sandbox Modus</text>
            </g>
        </svg>
    </div>
</template>

<style scoped>
.ease-out { transition: transform 0.5s cubic-bezier(0, 0, 0.2, 1); }
</style>
