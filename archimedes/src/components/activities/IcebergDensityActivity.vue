<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { PhX, PhCheckCircle, PhWarningCircle } from "@phosphor-icons/vue";
import { renderMath } from "../../composables/useMathRenderer";

const props = defineProps({
    isOpen: Boolean,
    title: { type: String, default: "IJsberg Oefenlab" },
    fullscreen: { type: Boolean, default: true },
});

const emit = defineEmits(["close", "complete"]);
const modalRoot = ref(null);

const step = ref(1);
const selected = ref("");
const feedback = ref("");
const feedbackType = ref("");
const solved = ref(false);
const hasInteracted = ref(false);
const readyForNext = ref(false);

const stepOneOptions = [
    { id: "fa-greater", text: "\\(F_A > F_z\\)" },
    { id: "equal", text: "\\(F_A = F_z\\)" },
    { id: "fa-smaller", text: "\\(F_A < F_z\\)" },
];

const stepTwoOptions = [
    { id: "fz-mg", text: "\\(F_z = m \\cdot g\\)" },
    { id: "fz-rho-g-v", text: "\\(F_z = \\rho_{vl} \\cdot g \\cdot V_{onder}\\)" },
    { id: "fz-v-over-rho", text: "\\(F_z = \\dfrac{V}{\\rho}\\)" },
];

const stepThreeOptions = [
    { id: "fa-rho-g-vonder", text: "\\(F_A = \\rho_{vl} \\cdot g \\cdot V_{onder}\\)" },
    { id: "fa-rho-g-vtot", text: "\\(F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp}\\)" },
    { id: "fa-mg", text: "\\(F_A = m \\cdot g\\)" },
];

const stepFourOptions = [
    { id: "eq-mg-rho", text: "\\(m \\cdot g = \\rho_{vl} \\cdot g \\cdot V_{onder}\\)" },
    { id: "eq-m-rho", text: "\\(m = \\rho_{vl} \\cdot g \\cdot V_{onder}\\)" },
    { id: "eq-rho-v", text: "\\(m \\cdot g = \\rho_{vl} \\cdot V_{onder}\\)" },
];

const stepFiveOptions = [
    { id: "cancel-g", text: "\\(m = \\rho_{vl} \\cdot V_{onder}\\)" },
    { id: "divide-rho", text: "\\(m = \\dfrac{V_{onder}}{\\rho_{vl}}\\)" },
    { id: "keep-g", text: "\\(m = \\rho_{vl} \\cdot g \\cdot V_{onder}\\)" },
];

const stepSixOptions = [
    { id: "m-iceberg-rho-v", text: "\\(m_{ijsberg} = \\rho_{vwp} \\cdot V_{vwp}\\)" },
    { id: "m-iceberg-v-rho", text: "\\(m_{ijsberg} = \\dfrac{V_{vwp}}{\\rho_{vwp}}\\)" },
    { id: "m-iceberg-rho-vonder", text: "\\(m_{ijsberg} = \\rho_{vwp} \\cdot V_{onder}\\)" },
];

const stepSevenOptions = [
    { id: "fraction-correct", text: "\\(\\dfrac{V_{onder}}{V_{vwp}} = \\dfrac{\\rho_{vwp}}{\\rho_{vl}}\\)" },
    { id: "fraction-flipped", text: "\\(\\dfrac{V_{onder}}{V_{vwp}} = \\dfrac{\\rho_{vl}}{\\rho_{vwp}}\\)" },
    { id: "fraction-minus", text: "\\(\\dfrac{V_{onder}}{V_{vwp}} = 1 - \\dfrac{\\rho_{vwp}}{\\rho_{vl}}\\)" },
];

const stepTitle = computed(() => {
    if (step.value === 1) return "GEGEVEN: Wat weten we?";
    if (step.value === 2) return "GEVRAAGD: Wat zoeken we?";
    if (step.value === 3) return "OPLOSSING - Stap 1: De krachten";
    if (step.value === 4) return "OPLOSSING - Stap 2: Vervang Fz";
    if (step.value === 5) return "OPLOSSING - Stap 3: Vervang Fa";
    if (step.value === 6) return "OPLOSSING - Stap 4: Stel de vergelijking op";
    if (step.value === 7) return "OPLOSSING - Stap 5: Vereenvoudig";
    if (step.value === 8) return "OPLOSSING - Stap 6: Vervang de ijsbergmassa";
    return "OPLOSSING - Stap 7: De verhouding";
});

const stepPrompt = computed(() => {
    if (step.value === 1) return "De dichtheid van ijs is \\(\\rho_{ijs} = 0{,}917 \\text{ g/cm}^3\\) en van zeewater \\(\\rho_{zeewater} = 1{,}026 \\text{ g/cm}^3\\).";
    if (step.value === 2) return "We zoeken de verhouding van het volume onder water ten opzichte van het totale volume: \\(\\dfrac{V_{onder}}{V_{vwp}}\\).";
    if (step.value === 3) return "De ijsberg drijft rustig op het water. Wat kun je dan zeggen over \\(F_z\\) en \\(F_A\\)?";
    if (step.value === 4) return "Kies de juiste formule voor de zwaartekracht van de ijsberg.";
    if (step.value === 5) return "Kies de juiste formule voor de Archimedeskracht in vloeistof.";
    if (step.value === 6) return "Gebruik \\(F_z = F_A\\). Welke vergelijking krijg je na substitutie?";
    if (step.value === 7) return "Vereenvoudig de vergelijking door de gemeenschappelijke factor \\(g\\) weg te delen.";
    if (step.value === 8) return "Je hebt nu \\(m = \\rho_{vl}V_{onder}\\). Waarmee kun je \\(m_{ijsberg}\\) vervangen?";
    return "Laatste stap: vorm de juiste volumeverhouding. Let op de volgorde van de dichtheden.";
});

const stepHint = computed(() => {
    if (step.value !== 8) return "";
    return "Hint: gebruik de dichtheid van het voorwerp zelf en zijn totale volume \\(V_{vwp}\\).";
});

const currentOptions = computed(() => {
    if (step.value === 1 || step.value === 2) return [];
    if (step.value === 3) return stepOneOptions;
    if (step.value === 4) return stepTwoOptions;
    if (step.value === 5) return stepThreeOptions;
    if (step.value === 6) return stepFourOptions;
    if (step.value === 7) return stepFiveOptions;
    if (step.value === 8) return stepSixOptions;
    return stepSevenOptions;
});

const equationStage = computed(() => {
    if (solved.value) return 10;
    if (readyForNext.value) return step.value + 1;
    return step.value;
});

const equationMath = computed(() => {
    if (equationStage.value === 1) return "\\(\\rho_{ijs} = 0{,}917 \\text{ | } \\rho_{vl} = 1{,}026\\)";
    if (equationStage.value === 2) return "\\(\\dfrac{V_{onder}}{V_{vwp}} = ?\\)";
    if (equationStage.value <= 4) return "\\(F_z = F_A\\)";
    if (equationStage.value === 5) return "\\(m \\cdot g = F_A\\)";
    if (equationStage.value <= 7) return "\\(m \\cdot g = \\rho_{vl} \\cdot g \\cdot V_{onder}\\)";
    if (equationStage.value === 8) return "\\(m = \\rho_{vl} \\cdot V_{onder}\\)";
    if (equationStage.value === 9) return "\\(\\rho_{vwp} \\cdot V_{vwp} = \\rho_{vl} \\cdot V_{onder}\\)";
    return "\\(\\dfrac{V_{onder}}{V_{vwp}} = \\dfrac{\\rho_{vwp}}{\\rho_{vl}}\\)";
});

const defaultSubFraction = 0.893;
const sceneScale = 1.04;

const waterlineY = 220;
const icebergShapeTopY = 120;
const icebergShapeBottomY = 352;
const icebergShapeHeight = icebergShapeBottomY - icebergShapeTopY;
const icebergMaxBottomY = 356;
const icebergPathD = "M 120 202 L 102 168 L 158 124 L 214 162 L 244 194 L 268 246 L 278 296 L 248 342 L 186 352 L 118 332 L 104 286 L 122 238 Z";
const vectorAnchorX = 188;
const vectorAnchorY = 244;
const baseVectorLen = 58;
const vectorAnchorYLive = computed(() => vectorAnchorY + icebergShiftY.value);

const forceRatio = computed(() => {
    if (step.value === 3) {
        if (selected.value === "fa-greater") return 1.2;
        if (selected.value === "fa-smaller") return 0.8;
        return 1;
    }

    return 1;
});

const fzVectorLen = computed(() => baseVectorLen);
const faVectorLen = computed(() => Math.round(baseVectorLen * forceRatio.value));

const chooseOption = (id) => {
    selected.value = id;
    hasInteracted.value = true;
    readyForNext.value = false;
    feedback.value = "";
    feedbackType.value = "";
};

const icebergShiftY = computed(() => {
    const top = Math.max(90, waterlineY - (1 - defaultSubFraction) * icebergShapeHeight);
    const rawShift = top - icebergShapeTopY;
    return Math.min(rawShift, icebergMaxBottomY - icebergShapeBottomY);
});

const checkCurrentStep = () => {
    const correctByStep = {
        3: "equal",
        4: "fz-mg",
        5: "fa-rho-g-vonder",
        6: "eq-mg-rho",
        7: "cancel-g",
        8: "m-iceberg-rho-v",
        9: "fraction-correct",
    };

    const ok = selected.value === correctByStep[step.value];
    if (ok) {
        feedbackType.value = "success";
        if (step.value === 9) {
            feedback.value = "Perfect. De verhouding is \\(\\dfrac{V_{onder}}{V_{vwp}} = \\dfrac{\\rho_{vwp}}{\\rho_{vl}}\\). Zo voorkom je de veelgemaakte omwisseling van de dichtheden.";
            solved.value = true;
            readyForNext.value = false;
            return;
        }

        const successByStep = {
            3: "Juist. Bij drijven is er evenwicht: \\(F_A = F_z\\).",
            4: "Correct. We schrijven de zwaartekracht als \\(F_z = m \\cdot g\\).",
            5: "Correct. Alleen het ondergedompelde volume bepaalt \\(F_A\\): \\(F_A = \\rho_{vl}gV_{onder}\\).",
            6: "Goed. Na gelijkstellen krijg je \\(m \\cdot g = \\rho_{vl} \\cdot g \\cdot V_{onder}\\).",
            7: "Mooi. \\(g\\) staat in beide leden en valt dus weg.",
            8: "Top. Nu kun je \\(m_{ijsberg}\\) vervangen door \\(\\rho_{vwp}V_{vwp}\\).",
        };
        feedback.value = successByStep[step.value];
        readyForNext.value = true;
        return;
    }

    readyForNext.value = false;
    feedbackType.value = "error";
    const errorByStep = {
        3: "Kijk naar de situatie: de ijsberg drijft en versnelt niet, dus de krachten moeten in evenwicht zijn.",
        4: "Nog niet. Dit is specifiek de formule van de zwaartekracht op een massa.",
        5: "Bijna. Gebruik bij \\(F_A\\) de dichtheid van de vloeistof en het ondergedompelde volume.",
        6: "Controleer beide vervangingen nog eens: links \\(F_z\\), rechts \\(F_A\\).",
        7: "Bij vereenvoudigen mag \\(g\\) weg, omdat die factor links en rechts voorkomt.",
        8: "Bijna. Hint: denk aan dichtheid van de ijsberg en zijn totale volume \\(V_{vwp}\\).",
        9: "Let op de volgorde: leerlingen draaien vaak \\(\\rho_{vl}\\) en \\(\\rho_{vwp}\\) om. Los eerst op naar \\(V_{onder}/V_{vwp}\\).",
    };
    feedback.value = errorByStep[step.value];
};

const actionDisabled = computed(() => {
    if (step.value === 1 || step.value === 2) return false;
    if (solved.value) return false;
    if (readyForNext.value) return false;
    return !selected.value;
});
const actionLabel = computed(() => {
    if (step.value === 1) return "Naar Gevraagd";
    if (step.value === 2) return "Start Oplossing";
    if (solved.value) return "Activiteit afronden";
    if (readyForNext.value) return "Volgende stap";
    return "Controleer stap";
});

const handleAction = () => {
    if (step.value === 1 || step.value === 2) {
        step.value += 1;
        return;
    }

    if (solved.value) {
        emit("complete");
        return;
    }

    if (readyForNext.value) {
        step.value += 1;
        return;
    }

    checkCurrentStep();
};

const closeActivity = async () => {
    if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
    }
    emit("close");
};

const requestFullscreen = async () => {
    if (props.fullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(() => {});
    }
};

const handleKeydown = (e) => {
    if (e.key === "Escape" && props.isOpen) emit("close");
};

const handleFullscreenChange = () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit("close");
};

watch(() => props.isOpen, (val) => {
    if (val) {
        step.value = 1;
        selected.value = "";
        feedback.value = "";
        feedbackType.value = "";
        solved.value = false;
        hasInteracted.value = false;
        readyForNext.value = false;
        window.addEventListener("keydown", handleKeydown);
        nextTick(() => requestFullscreen());
    } else {
        window.removeEventListener("keydown", handleKeydown);
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
});

watch(step, (val) => {
    selected.value = "";
    feedback.value = "";
    feedbackType.value = "";
    readyForNext.value = false;
});

onMounted(() => document.addEventListener("fullscreenchange", handleFullscreenChange));
onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
});
</script>

<template>
    <div v-if="isOpen" ref="modalRoot" class="fixed inset-0 z-[100] bg-white font-sans">
        <header class="h-20 border-b border-slate-100 flex items-center justify-between px-10 bg-white">
            <div>
                <h2 class="text-slate-900 font-black text-xl tracking-tight leading-none">IJsberg Oefenlab</h2>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Oefening 1: stap voor stap</p>
            </div>
            <button @click="closeActivity" class="group flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-100 hover:border-slate-900 transition-all text-slate-400 hover:text-slate-900">
                <span class="text-xs font-black uppercase tracking-widest">Sluiten</span>
                <PhX weight="bold" class="text-lg" />
            </button>
        </header>

        <main class="h-[calc(100vh-5rem)] flex flex-col md:flex-row">
            <section class="w-full md:w-[52%] bg-slate-50 border-r border-slate-100 p-8 flex flex-col">
                <div class="bg-white rounded-3xl border border-slate-200 p-4 md:p-6 h-full shadow-sm">
                    <svg viewBox="0 0 400 400" class="w-full h-full">
                        <defs>
                            <pattern id="iceberg-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="1" />
                            </pattern>
                            <marker id="arrowFa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                            </marker>
                            <marker id="arrowFz" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0ea5e9" />
                            </marker>
                        </defs>

                        <g :transform="`translate(200 182) scale(${sceneScale}) translate(-200 -200)`">
                            <rect x="20" y="30" width="360" height="340" rx="14" fill="#f8fafc" stroke="#e2e8f0" />
                            <rect x="20" y="30" width="360" height="340" rx="14" fill="url(#iceberg-grid)" opacity="0.75" />
                            <rect x="20" :y="waterlineY" width="360" :height="370 - waterlineY" fill="#dbeafe" />
                            <path :d="`M 20 ${waterlineY} Q 110 ${waterlineY - 6} 200 ${waterlineY} T 380 ${waterlineY}`" fill="none" stroke="#93c5fd" stroke-width="3" />

                            <g :transform="`translate(0 ${icebergShiftY})`">
                                <path :d="icebergPathD" fill="white" stroke="#0c4a6e" stroke-width="3" stroke-linejoin="round" />
                            </g>
                        </g>

                        <g class="transition-opacity duration-300" :class="hasInteracted ? 'opacity-100' : 'opacity-0'">
                            <line
                                :x1="vectorAnchorX"
                                :y1="vectorAnchorYLive"
                                :x2="vectorAnchorX"
                                :y2="vectorAnchorYLive - faVectorLen"
                                stroke="#10b981"
                                stroke-width="3.5"
                                marker-end="url(#arrowFa)"
                            />
                            <line
                                :x1="vectorAnchorX"
                                :y1="vectorAnchorYLive"
                                :x2="vectorAnchorX"
                                :y2="vectorAnchorYLive + fzVectorLen"
                                stroke="#0ea5e9"
                                stroke-width="3.5"
                                marker-end="url(#arrowFz)"
                            />
                            <circle :cx="vectorAnchorX" :cy="vectorAnchorYLive" r="4.5" fill="#0f172a" stroke="#ffffff" stroke-width="1.5" />
                            <text :x="vectorAnchorX + 12" :y="vectorAnchorYLive - faVectorLen + 2" fill="#047857" font-size="12" font-weight="900">F<tspan baseline-shift="sub" font-size="9">A</tspan></text>
                            <text :x="vectorAnchorX + 12" :y="vectorAnchorYLive + fzVectorLen + 6" fill="#0369a1" font-size="12" font-weight="900">F<tspan baseline-shift="sub" font-size="9">z</tspan></text>
                        </g>

                        <g class="transition-opacity duration-300" :class="hasInteracted ? 'opacity-100' : 'opacity-0'">
                            <foreignObject x="34" y="40" width="332" height="54">
                                <div xmlns="http://www.w3.org/1999/xhtml" class="w-full h-full flex items-center rounded-xl border border-slate-200 bg-white/90 px-4 text-[14px] font-black text-slate-900">
                                    <span v-html="renderMath(equationMath)"></span>
                                </div>
                            </foreignObject>
                        </g>
                    </svg>
                </div>
            </section>

            <section class="w-full md:w-[48%] p-10 overflow-y-auto custom-scrollbar bg-white space-y-6">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span class="text-xs font-black text-amber-700 uppercase tracking-widest">Stap {{ step }} / 7</span>
                </div>

                <div class="space-y-5">
                    <h3 class="text-3xl font-black text-slate-900" v-html="renderMath(stepTitle)"></h3>
                    <p class="text-slate-600 text-lg leading-relaxed" v-html="renderMath(stepPrompt)"></p>
                    <p v-if="stepHint" class="text-sm text-amber-700 font-semibold" v-html="renderMath(stepHint)"></p>
                    <div class="space-y-3">
                        <button
                            v-for="opt in currentOptions"
                            :key="opt.id"
                            @click="chooseOption(opt.id)"
                            class="w-full text-left p-4 rounded-xl border-2 font-bold"
                            :class="selected === opt.id ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-300'"
                            v-html="renderMath(opt.text)"
                        ></button>
                    </div>
                </div>

                <div v-if="feedback" class="p-4 rounded-xl border flex gap-3 items-start" :class="feedbackType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'">
                    <component :is="feedbackType === 'success' ? PhCheckCircle : PhWarningCircle" weight="fill" class="text-2xl shrink-0 mt-0.5" />
                    <p class="font-semibold" v-html="renderMath(feedback)"></p>
                </div>

                <button @click="handleAction" :disabled="actionDisabled" class="w-full py-3.5 rounded-xl font-black text-white transition-all" :class="actionDisabled ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'">
                    {{ actionLabel }}
                </button>
            </section>
        </main>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }

.premium-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 10px;
  border-radius: 9999px;
  background: #e2e8f0;
}
.premium-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: #0f172a;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.25);
}
.premium-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: #0f172a;
  border: 2px solid #fff;
}
</style>
