<script setup>
import { computed, ref, onMounted, watch, nextTick } from "vue";
import { useActivityModal } from "../../composables/useActivityModal";
import { renderMath } from "../../composables/useMathRenderer";
import {
    PhX,
    PhCheckCircle,
    PhWarningCircle,
    PhArrowRight,
    PhMathOperations,
    PhGraph,
    PhSelection,
    PhCalculator,
    PhCheck,
    PhCornersOut,
    PhArrowCounterClockwise,
} from "@phosphor-icons/vue";

const props = defineProps({
    isOpen: Boolean,
    title: { type: String, default: "Afleidingbouwer Archimedeskracht" },
    fullscreen: { type: Boolean, default: true },
});

const emit = defineEmits(["close", "complete"]);

const stage = ref(0);
const selections = ref({ topPressure: "", bottomPressure: "", netForce: "" });
const feedback = ref("");
const feedbackType = ref("");
const done = ref(false);

// Stage 2 sub-step machine
const sub2 = ref(0);
const sub2Choice = ref("");
const sub2Steps = [
    {
        svg: "faces",
        commentary:
            "Stap 1: Substitutie \\( F \\rightarrow p \\cdot A \\): Elke kracht op een vlak is gelijk aan de druk maal het oppervlak (\\( F = p \\cdot A \\)). We vervangen \\( F_{onder} \\) door \\( p_{onder} \\cdot A \\) en \\( F_{boven} \\) door \\( p_{boven} \\cdot A \\).",
        q: "Welk verband gebruiken we om \\( F \\) om te schrijven naar druk?",
        opts: [
            { v: "ok", t: "\\( F = p \\cdot A \\)" },
            { v: "no", t: "\\( F = p / A \\)" },
        ],
        ok: "ok",
        shows: "\\( F_A = p_{onder} \\cdot A - p_{boven} \\cdot A \\)",
        note: "Correct! \\( F_{onder} = p_{onder} \\cdot A \\) en \\( F_{boven} = p_{boven} \\cdot A \\).",
    },

    {
        svg: "area",
        commentary:
            "Stap 2: Factor \\( A \\) uitfactoren: Beide termen bevatten exact hetzelfde oppervlak \\( A \\). We halen \\( A \\) als gemeenschappelijke factor voor de haakjes (vergelijk dit met \\( a \\cdot b - a \\cdot c = a \\cdot (b-c) \\)).",
        q: "Wat krijgen we na het uitfactoren van \\( A \\)?",
        opts: [
            { v: "ok", t: "\\( (p_{onder} - p_{boven}) \\cdot A \\)" },
            { v: "no", t: "\\( p_{onder} \\cdot p_{boven} + A \\)" },
        ],
        ok: "ok",
        shows: "\\( F_A = (p_{onder} - p_{boven}) \\cdot A \\)",
        note: "Goed! A is de gemeenschappelijke factor → vóór de haakjes.",
    },

    {
        svg: "depths",
        commentary:
            "Stap 3: Hydrostatische druk invoeren: Druk in een vloeistof neemt toe met de diepte: \\( p = \\rho_{vl} \\cdot g \\cdot \\text{diepte} \\). Let op de dieptes in de tekening: het bovenvlak zit op diepte \\( h \\), het ondervlak op diepte \\( h+z \\).",
        q: "Hoe schrijf je hydrostatische druk als formule?",
        opts: [
            {
                v: "ok",
                t: "\\( p = \\rho_{vl} \\cdot g \\cdot \\text{diepte} \\)",
            },
            { v: "no", t: "\\( p = \\rho_{vl} \\cdot g / \\text{diepte} \\)" },
        ],
        ok: "ok",
        shows: "\\( p_{onder} = \\rho_{vl} \\cdot g \\cdot (h+z) \\quad p_{boven} = \\rho_{vl} \\cdot g \\cdot h \\)",
        note: "Klopt! \\( p = \\rho \\cdot g \\cdot \\text{diepte} \\): hoe dieper, hoe groter de druk.",
    },

    {
        svg: "sub",
        commentary:
            "Stap 4: Substitutie \\( p_{onder} \\) en \\( p_{boven} \\): We nemen de uitdrukkingen van stap 3 en vullen ze in de formule van stap 2. \\( p_{onder} \\) wordt \\( \\rho \\cdot g \\cdot (h+z) \\) en \\( p_{boven} \\) wordt \\( \\rho \\cdot g \\cdot h \\).",
        q: "Herken je deze substitutie?",
        opts: [
            {
                v: "ok",
                t: "Ja: \\( p_{onder} \\) en \\( p_{boven} \\) zijn vervangen door \\( \\rho \\cdot g \\cdot \\text{diepte} \\)",
            },
            { v: "no", t: "Nee, ik snap dit niet" },
        ],
        ok: "ok",
        shows: "\\( F_A = [\\rho_{vl} \\cdot g \\cdot (h+z) - \\rho_{vl} \\cdot g \\cdot h] \\cdot A \\)",
        note: "Inderdaad! Substitutie van p in de haakjes.",
    },

    {
        svg: "factor",
        commentary:
            "Stap 5: Factor \\( \\rho_{vl} \\cdot g \\) uitfactoren: Elke term in de rechte haakjes bevat de factor \\( \\rho_{vl} \\cdot g \\). Net zoals we \\( A \\) uitfactoreerden in stap 2, halen we nu \\( \\rho_{vl} \\cdot g \\) voor de haakjes.",
        q: "Waarom mogen we \\( \\rho_{vl} \\cdot g \\) voor de haakjes halen?",
        opts: [
            {
                v: "ok",
                t: "\\( \\rho \\cdot g \\) staat als factor in BEIDE termen",
            },
            { v: "no", t: "Omdat \\( \\rho \\) en \\( g \\) constanten zijn" },
        ],
        ok: "ok",
        shows: "\\( F_A = \\rho_{vl} \\cdot g \\cdot [(h+z) - h] \\cdot A \\)",
        note: "Goed! \\( \\rho_{vl} \\cdot g \\) is the gemeenschappelijke factor: eruit halen.",
    },

    {
        svg: "z",
        commentary:
            "Stap 6: Haakjes vereenvoudigen: In de haakjes staat \\( (h+z) - h \\). De twee \\( h \\)-termen heffen elkaar precies op. Enkel de hoogte \\( z \\) van het voorwerp blijft over. Zie de \\( z \\)-pijl in de tekening!",
        q: "\\( (h + z) - h = ? \\)",
        opts: [
            { v: "ok", t: "z" },
            { v: "no", t: "h" },
        ],
        ok: "ok",
        shows: "\\( F_A = \\rho_{vl} \\cdot g \\cdot z \\cdot A \\)",
        note: "Correct! \\( h \\) valt weg → enkel hoogte \\( z \\) blijft over.",
    },

    {
        svg: "vol",
        commentary:
            "Stap 7: Laatste substitutie \\( A \\cdot z \\rightarrow V \\): In de tekening is \\( A \\) het grondvlak en \\( z \\) de hoogte van de kubus. Grondvlak × hoogte = volume! Dit is de definitie van het volume van een balk.",
        q: "\\( A \\cdot z \\) is het grondvlak × hoogte van de kubus. Dat is...",
        opts: [
            { v: "ok", t: "Het volume V van het voorwerp" },
            { v: "no", t: "De oppervlakte van een zijvlak" },
        ],
        ok: "ok",
        shows: "\\( \\boxed{F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp}} \\)",
        note: "Geweldig! \\( A \\cdot z = V \\) → de wet van Archimedes is afgeleid!",
    },
];

const svgHighlight = computed(() => {
    if (stage.value === 1) return "forces";
    if (stage.value === 2)
        return sub2Steps[Math.min(sub2.value, sub2Steps.length - 1)].svg;
    return "none";
});

const { shouldPulse, modalRoot } = useActivityModal(props, emit);
const titleId = `activity-title-${Math.random().toString(36).slice(2)}`;
const scrollContainer = ref(null);

watch(stage, () => {
    clearFeedback();
});

function scrollToFeedback() {
    nextTick(() => {
        if (scrollContainer.value) {
            scrollContainer.value.scrollTo({
                top: scrollContainer.value.scrollHeight,
                behavior: "smooth",
            });
        }
    });
}

const stages = [
    { label: "Druk", icon: PhCalculator },
    { label: "Netto Kracht", icon: PhSelection },
    { label: "Eindformule", icon: PhCheck },
];

const scenarioDescription = computed(() => {
    return "Stel een kubus volledig ondergedompeld in water. Het bovenvlak bevindt zich op diepte h, het ondervlak op diepte h + z.";
});

function clearFeedback() {
    feedback.value = "";
    feedbackType.value = "";
}

function checkCurrent() {
    clearFeedback();

    if (stage.value === 0) {
        const ok =
            selections.value.topPressure === "rho-g-h" &&
            selections.value.bottomPressure === "rho-g-hplusz";
        if (!ok) {
            feedbackType.value = "error";
            feedback.value =
                "Bijna! Let op de diepte: het bovenvlak zit op h, het ondervlak zit dieper op h + z.";
            return;
        }
        feedbackType.value = "success";
        feedback.value =
            "Correct! De hydrostatische druk is recht evenredig met de diepte.";
        scrollToFeedback();
        setTimeout(() => {
            stage.value = 1;
        }, 1500);
        return;
    }

    if (stage.value === 1) {
        if (selections.value.netForce !== "fonder-min-fboven") {
            feedbackType.value = "error";
            feedback.value =
                "De opwaartse kracht ontstaat omdat de druk onderaan groter is dan bovenaan. Het verschil is dus F_onder - F_boven.";
            scrollToFeedback();
            return;
        }
        feedbackType.value = "success";
        feedback.value =
            "Inderdaad! De resulterende kracht wijst omhoog omdat de druk onderaan groter is.";
        scrollToFeedback();
        setTimeout(() => {
            stage.value = 2;
        }, 1500);
        return;
    }

    // Stage 2: sub-step machine
    if (sub2.value < sub2Steps.length) {
        const step = sub2Steps[sub2.value];
        if (sub2Choice.value !== step.ok) {
            feedbackType.value = "error";
            feedback.value = "Niet helemaal: probeer opnieuw!";
            scrollToFeedback();
            return;
        }
        feedbackType.value = "success";
        feedback.value = step.note;
        scrollToFeedback();
        setTimeout(() => {
            sub2.value++;
            sub2Choice.value = "";
            clearFeedback();
            if (sub2.value >= sub2Steps.length) done.value = true;
        }, 1100);
        return;
    }
}

function reset() {
    stage.value = 0;
    sub2.value = 0;
    sub2Choice.value = "";
    selections.value = { topPressure: "", bottomPressure: "", netForce: "" };
    clearFeedback();
    done.value = false;
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
}

function close() {
    emit("close");
}

function complete() {
    emit("complete");
}

function mathLabelPressure(expr) {
    return renderMath(expr);
}
</script>

<template>
    <div
        v-if="isOpen"
        ref="modalRoot"
        class="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
    >
        <!-- Backdrop -->
        <div
            class="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            @click="close"
        ></div>

        <!-- Modal Container (Full Screen) -->
        <div
            class="relative w-screen h-screen bg-slate-50 overflow-hidden flex flex-col md:flex-row shadow-2xl"
        >
            <!-- Left side: Interactive Logic -->
            <div
                class="flex-1 flex flex-col min-w-0 bg-white shadow-xl relative z-10"
            >
                <!-- Header -->
                <div
                    class="bg-indigo-950 text-white px-8 py-5 flex items-center justify-between shrink-0"
                >
                    <div class="flex items-center gap-4">
                        <div
                            class="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20"
                        >
                            <PhMathOperations
                                class="text-2xl text-white"
                                weight="bold"
                            />
                        </div>
                        <div>
                            <h3
                                :id="titleId"
                                class="font-bold text-lg leading-tight"
                            >
                                {{ title }}
                            </h3>
                            <p class="text-xs text-indigo-300/70 font-medium">
                                Conceptuele Afleiding • Les 2
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <button
                            class="p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-bold"
                            title="Toggle Volledig Scherm"
                            @click="toggleFullscreen"
                        >
                            <PhCornersOut class="text-xl" weight="bold" />
                            <span class="hidden sm:inline">Fullscreen</span>
                        </button>
                        <button
                            class="p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                            @click="close"
                        >
                            <PhX class="text-xl" weight="bold" />
                        </button>
                    </div>
                </div>

                <!-- Progress Steps -->
                <div
                    class="px-8 py-6 bg-slate-50 border-b border-slate-100 shrink-0 uppercase tracking-widest text-[10px] font-black pointer-events-none"
                >
                    <div
                        class="flex items-center justify-between max-w-md mx-auto"
                    >
                        <template v-for="(s, idx) in stages" :key="idx">
                            <div
                                class="flex flex-col items-center gap-2 flex-1 relative"
                            >
                                <div
                                    class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10"
                                    :class="
                                        idx === stage
                                            ? 'bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/30 text-white'
                                            : idx < stage
                                              ? 'bg-emerald-500 border-emerald-500 text-white'
                                              : 'bg-white border-slate-200 text-slate-400'
                                    "
                                >
                                    <component
                                        :is="idx < stage ? PhCheck : s.icon"
                                        weight="bold"
                                    />
                                </div>
                                <span
                                    :class="
                                        idx === stage
                                            ? 'text-amber-600'
                                            : idx < stage
                                              ? 'text-emerald-600'
                                              : 'text-slate-400'
                                    "
                                    >{{ s.label }}</span
                                >
                                <div
                                    v-if="idx < stages.length - 1"
                                    class="absolute left-1/2 top-5 w-full h-0.5 bg-slate-200 -z-0"
                                >
                                    <div
                                        class="h-full bg-emerald-500 transition-all duration-700"
                                        :style="{
                                            width: idx < stage ? '100%' : '0%',
                                        }"
                                    ></div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Scrollable content -->
                <div
                    ref="scrollContainer"
                    class="flex-1 overflow-y-auto p-8 custom-scrollbar"
                >
                    <Transition name="fade-slide" mode="out-in">
                        <!-- Stage 0: Drukkrachten -->
                        <div v-if="stage === 0" key="stage0" class="space-y-6">
                            <div
                                class="inline-block px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest mb-2"
                            >
                                Stap 1: Hydrostatische Drukkracht
                            </div>
                            <h4
                                class="text-3xl font-black text-slate-800 leading-tight"
                            >
                                Druk op het voorwerp
                            </h4>
                            <p
                                class="text-lg text-slate-600 leading-relaxed italic border-l-4 border-amber-400 pl-4 py-2 bg-amber-50/30 rounded-r-xl mb-6"
                            >
                                "Hydrostatische druk plant zich voort en werkt
                                loodrecht op elk oppervlak."
                            </p>

                            <div class="space-y-6">
                                <div
                                    class="p-6 rounded-2xl border-2 transition-all"
                                    :class="
                                        selections.topPressure
                                            ? 'border-amber-200 bg-amber-50/20'
                                            : 'border-slate-100 bg-slate-50/50'
                                    "
                                >
                                    <div
                                        class="font-bold text-slate-800 mb-4 flex items-center gap-2"
                                    >
                                        <div
                                            class="w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-amber-600 text-[10px] font-bold"
                                        >
                                            1
                                        </div>
                                        Welke druk werkt op het bovenvlak
                                        (diepte h)?
                                    </div>
                                    <div class="grid grid-cols-1 gap-3">
                                        <label
                                            v-for="(latex, val) in {
                                                'rho-g-h':
                                                    '\\( p_{boven} = \\rho_{vl} \\cdot g \\cdot h \\)',
                                                'rho-g-hplusz':
                                                    '\\( p_{boven} = \\rho_{vl} \\cdot g \\cdot (h + z) \\)',
                                            }"
                                            :key="val"
                                            class="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-95"
                                            :class="
                                                selections.topPressure === val
                                                    ? 'border-amber-500 bg-white ring-4 ring-amber-50 shadow-sm'
                                                    : 'border-slate-50 bg-white hover:border-amber-200'
                                            "
                                        >
                                            <input
                                                v-model="selections.topPressure"
                                                type="radio"
                                                :value="val"
                                                class="hidden"
                                            />
                                            <div
                                                class="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center"
                                                :class="{
                                                    'bg-amber-500 border-amber-500':
                                                        selections.topPressure ===
                                                        val,
                                                }"
                                            >
                                                <div
                                                    v-if="
                                                        selections.topPressure ===
                                                        val
                                                    "
                                                    class="w-1.5 h-1.5 rounded-full bg-white"
                                                ></div>
                                            </div>
                                            <span
                                                class="font-mono text-sm font-bold text-slate-700"
                                                v-html="
                                                    mathLabelPressure(latex)
                                                "
                                            ></span>
                                        </label>
                                    </div>
                                </div>

                                <div
                                    class="p-6 rounded-2xl border-2 transition-all"
                                    :class="
                                        selections.bottomPressure
                                            ? 'border-amber-200 bg-amber-50/20'
                                            : 'border-slate-100 bg-slate-50/50'
                                    "
                                >
                                    <div
                                        class="font-bold text-slate-800 mb-4 flex items-center gap-2"
                                    >
                                        <div
                                            class="w-6 h-6 rounded bg-amber-100 flex items-center justify-center text-amber-600 text-[10px] font-bold"
                                        >
                                            2
                                        </div>
                                        Welke druk werkt op het ondervlak
                                        (diepte h + z)?
                                    </div>
                                    <div class="grid grid-cols-1 gap-3">
                                        <label
                                            v-for="(latex, val) in {
                                                'rho-g-h':
                                                    '\\( p_{onder} = \\rho_{vl} \\cdot g \\cdot h \\)',
                                                'rho-g-hplusz':
                                                    '\\( p_{onder} = \\rho_{vl} \\cdot g \\cdot (h + z) \\)',
                                            }"
                                            :key="val"
                                            class="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-95"
                                            :class="
                                                selections.bottomPressure ===
                                                val
                                                    ? 'border-amber-500 bg-white ring-4 ring-amber-50 shadow-sm'
                                                    : 'border-slate-50 bg-white hover:border-amber-200'
                                            "
                                        >
                                            <input
                                                v-model="
                                                    selections.bottomPressure
                                                "
                                                type="radio"
                                                :value="val"
                                                class="hidden"
                                            />
                                            <div
                                                class="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center"
                                                :class="{
                                                    'bg-amber-500 border-amber-500':
                                                        selections.bottomPressure ===
                                                        val,
                                                }"
                                            >
                                                <div
                                                    v-if="
                                                        selections.bottomPressure ===
                                                        val
                                                    "
                                                    class="w-1.5 h-1.5 rounded-full bg-white"
                                                ></div>
                                            </div>
                                            <span
                                                class="font-mono text-sm font-bold text-slate-700"
                                                v-html="
                                                    mathLabelPressure(latex)
                                                "
                                            ></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Stage 1: Verschildruk -->
                        <div
                            v-else-if="stage === 1"
                            key="stage1"
                            class="space-y-6"
                        >
                            <div
                                class="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-2"
                            >
                                Stap 2: Resulterende Kracht
                            </div>
                            <h4
                                class="text-3xl font-black text-slate-800 leading-tight"
                            >
                                De netto opwaartse kracht
                            </h4>
                            <p
                                class="text-lg text-slate-600 leading-relaxed mb-6"
                            >
                                De kracht onderaan is groter dan bovenaan. Hoe
                                berekenen we de resulterende archimedeskracht?
                            </p>

                            <div class="grid grid-cols-1 gap-3">
                                <button
                                    v-for="(latex, val) in {
                                        'fonder-min-fboven':
                                            '\\( F_A = F_{onder} - F_{boven} \\)',
                                        'fboven-min-fonder':
                                            '\\( F_A = F_{boven} - F_{onder} \\)',
                                    }"
                                    :key="val"
                                    @click="selections.netForce = val"
                                    class="p-6 rounded-2xl border-2 text-left transition-all active:scale-95"
                                    :class="
                                        selections.netForce === val
                                            ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50'
                                            : 'border-slate-100 hover:border-indigo-200 shadow-sm'
                                    "
                                >
                                    <div class="flex items-center gap-4">
                                        <div
                                            class="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center transition-colors"
                                            :class="{
                                                'bg-indigo-600 border-indigo-600':
                                                    selections.netForce === val,
                                            }"
                                        >
                                            <div
                                                v-if="
                                                    selections.netForce === val
                                                "
                                                class="w-2 h-2 rounded-full bg-white"
                                            ></div>
                                        </div>
                                        <span
                                            class="font-black text-xl text-slate-800"
                                            v-html="mathLabelPressure(latex)"
                                        ></span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Stage 2: Interactive sub-step derivation -->
                        <div v-else key="stage2" class="space-y-5">
                            <div
                                class="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest"
                            >
                                Stap 3: Volledige Afleiding
                            </div>
                            <h4
                                class="text-2xl font-black text-slate-800 leading-tight"
                            >
                                Naar de wet van Archimedes
                            </h4>

                            <!-- Accumulated steps so far -->
                            <div
                                v-if="sub2 > 0"
                                class="rounded-2xl border border-slate-200 overflow-hidden"
                            >
                                <p
                                    class="text-[9px] uppercase font-black text-slate-400 px-4 pt-3 pb-1 bg-slate-50 border-b border-slate-100"
                                >
                                    Afleiding tot nu toe
                                </p>
                                <div class="divide-y divide-slate-100">
                                    <div
                                        class="flex items-start gap-3 px-4 py-2 text-slate-500 text-sm"
                                    >
                                        <span
                                            class="w-20 shrink-0 text-[9px] font-black uppercase text-slate-400 pt-1"
                                            >Start</span
                                        >
                                        <span
                                            v-html="
                                                renderMath(
                                                    '\\( F_A = F_{onder} - F_{boven} \\)',
                                                )
                                            "
                                        ></span>
                                    </div>
                                    <div
                                        v-for="i in sub2"
                                        :key="i"
                                        class="flex items-start gap-3 px-4 py-2 text-sm"
                                        :class="
                                            i === sub2
                                                ? 'bg-emerald-50/60 font-semibold text-slate-800'
                                                : 'text-slate-500'
                                        "
                                    >
                                        <span
                                            class="w-20 shrink-0 text-[9px] font-black uppercase pt-1"
                                            :class="
                                                i === sub2
                                                    ? 'text-emerald-600'
                                                    : 'text-slate-400'
                                            "
                                            >Stap {{ i }}</span
                                        >
                                        <span
                                            v-html="
                                                renderMath(
                                                    sub2Steps[i - 1].shows,
                                                )
                                            "
                                        ></span>
                                    </div>
                                </div>
                            </div>

                            <!-- Current substep card -->
                            <div
                                v-if="!done"
                                class="rounded-2xl border-2 border-indigo-200 bg-white shadow overflow-hidden"
                            >
                                <div class="px-5 py-4 bg-indigo-950 text-white">
                                    <p
                                        class="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1"
                                    >
                                        Substap {{ sub2 + 1 }} /
                                        {{ sub2Steps.length }}
                                    </p>
                                    <p
                                        class="text-base font-semibold leading-snug"
                                        v-html="
                                            renderMath(
                                                sub2Steps[sub2].commentary,
                                            )
                                        "
                                    ></p>
                                </div>
                                <div class="px-5 pt-4 pb-4">
                                    <p
                                        class="text-sm font-black text-slate-700 mb-3"
                                        v-html="renderMath(sub2Steps[sub2].q)"
                                    ></p>
                                    <div class="space-y-2">
                                        <label
                                            v-for="opt in sub2Steps[sub2].opts"
                                            :key="opt.v"
                                            class="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98]"
                                            :class="
                                                sub2Choice === opt.v
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-slate-100 hover:border-indigo-200'
                                            "
                                        >
                                            <input
                                                type="radio"
                                                v-model="sub2Choice"
                                                :value="opt.v"
                                                class="hidden"
                                            />
                                            <div
                                                class="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
                                                :class="
                                                    sub2Choice === opt.v
                                                        ? 'bg-indigo-600 border-indigo-600'
                                                        : 'border-slate-300'
                                                "
                                            >
                                                <div
                                                    v-if="sub2Choice === opt.v"
                                                    class="w-1.5 h-1.5 rounded-full bg-white"
                                                ></div>
                                            </div>
                                            <span
                                                class="text-sm font-semibold text-slate-700"
                                                v-html="
                                                    mathLabelPressure(opt.t)
                                                "
                                            ></span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Completion -->
                            <div
                                v-if="done"
                                class="p-6 rounded-2xl bg-emerald-950 text-white text-center space-y-3"
                            >
                                <div class="text-4xl">🎉</div>
                                <p class="font-black text-xl">
                                    Wet van Archimedes volledig afgeleid!
                                </p>
                                <div
                                    class="text-emerald-300"
                                    v-html="
                                        renderMath(
                                            '\\( F_A = \\rho_{vl} \\cdot g \\cdot V_{vwp} \\)',
                                        )
                                    "
                                ></div>
                            </div>
                        </div>
                    </Transition>

                    <!-- Feedback Toast -->
                    <Transition name="fade-bounce">
                        <div
                            v-if="feedback"
                            class="mt-8 p-6 rounded-2xl border-2 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2"
                            :class="
                                feedbackType === 'success'
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-900'
                                    : 'bg-rose-50 border-rose-100 text-rose-900'
                            "
                        >
                            <div
                                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                :class="
                                    feedbackType === 'success'
                                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20'
                                        : 'bg-rose-500 shadow-lg shadow-rose-500/20'
                                "
                            >
                                <component
                                    :is="
                                        feedbackType === 'success'
                                            ? PhCheckCircle
                                            : PhWarningCircle
                                    "
                                    class="text-2xl text-white"
                                    weight="fill"
                                />
                            </div>
                            <div>
                                <p
                                    class="font-black text-[10px] uppercase tracking-widest mb-1"
                                >
                                    {{
                                        feedbackType === "success"
                                            ? "Goed zo"
                                            : "Bijna"
                                    }}
                                </p>
                                <p
                                    class="font-bold text-lg leading-snug"
                                    v-html="renderMath(feedback)"
                                ></p>
                            </div>
                        </div>
                    </Transition>
                </div>

                <!-- Footer -->
                <div
                    class="px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-between shrink-0"
                >
                    <div class="flex items-center gap-3 text-slate-400">
                        <PhCalculator class="text-xl" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Wiskundige Afleiding</span
                        >
                    </div>
                    <div class="flex items-center gap-3">
                        <button
                            v-if="!done"
                            class="group px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white font-bold flex items-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-slate-900/10 disabled:opacity-50 disabled:pointer-events-none"
                            :disabled="
                                (stage === 0 &&
                                    (!selections.topPressure ||
                                        !selections.bottomPressure)) ||
                                (stage === 1 && !selections.netForce) ||
                                (stage === 2 && !sub2Choice)
                            "
                            @click="checkCurrent"
                        >
                            <span>Controleer Stap</span>
                            <PhArrowRight
                                class="text-xl group-hover:translate-x-1 transition-transform"
                                weight="bold"
                            />
                        </button>
                        <div v-else class="flex items-center gap-3">
                            <button
                                class="px-6 py-3.5 rounded-2xl border-2 border-emerald-100 text-emerald-600 font-bold hover:bg-emerald-50 transition-all transform active:scale-95 flex items-center gap-2"
                                @click="reset"
                            >
                                <PhArrowCounterClockwise
                                    class="text-xl"
                                    weight="bold"
                                />
                                <span>Opnieuw</span>
                            </button>
                            <button
                                class="px-10 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg transition-all transform active:scale-95 shadow-xl shadow-emerald-600/20"
                                @click="complete"
                            >
                                Afleveren
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Side: Simulation Area -->
            <div
                class="hidden md:flex w-[40%] bg-indigo-950 flex-col relative border-l border-white/10 shadow-inner"
            >
                <div
                    class="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 z-0"
                ></div>
                <div
                    class="absolute inset-x-0 bottom-0 top-1/2 bg-[radial-gradient(circle_at_50%_100%,rgba(99,102,241,0.2),transparent_70%)] opacity-30"
                ></div>

                <div class="relative z-10 h-full flex flex-col p-8">
                    <div class="flex items-center justify-between mb-8">
                        <span
                            class="px-3 py-1 bg-white/10 rounded-lg text-indigo-300 text-[10px] font-black tracking-widest uppercase border border-white/10"
                            >Geometrisch Model</span
                        >
                        <PhGraph
                            class="text-indigo-400 opacity-50"
                            weight="bold"
                        />
                    </div>

                    <div class="flex-1 flex items-center justify-center">
                        <svg
                            viewBox="0 0 300 430"
                            class="w-full h-full max-h-[430px] drop-shadow-2xl"
                        >
                            <!-- Tank & Water -->
                            <rect
                                x="40"
                                y="40"
                                width="220"
                                height="320"
                                rx="4"
                                fill="rgba(255,255,255,0.05)"
                                stroke="rgba(255,255,255,0.15)"
                                stroke-width="2"
                            />
                            <rect
                                x="42"
                                y="80"
                                width="216"
                                height="278"
                                rx="2"
                                fill="rgba(56,189,248,0.15)"
                            />
                            <path
                                d="M 42 80 L 258 80 L 258 100 Q 150 70, 42 100 Z"
                                fill="rgba(56,189,248,0.2)"
                            />

                            <!-- Dynamic Cube -->
                            <g class="transition-all duration-1000">
                                <!-- Bottom Face (Visible through transparency) -->
                                <path
                                    d="M 100 250 L 120 230 L 220 230 L 200 250 Z"
                                    fill="url(#hatch-green)"
                                    stroke="rgba(74,222,128,0.2)"
                                    stroke-width="1"
                                />

                                <!-- Right Face -->
                                <path
                                    d="M 200 150 L 220 130 L 220 230 L 200 250 Z"
                                    fill="rgba(255,255,255,0.03)"
                                    stroke="rgba(255,255,255,0.1)"
                                    stroke-width="1"
                                />

                                <!-- Top Face (Active Surface) -->
                                <path
                                    d="M 100 150 L 120 130 L 220 130 L 200 150 Z"
                                    fill="url(#hatch-red)"
                                    stroke="rgba(248,113,113,0.3)"
                                    stroke-width="1"
                                />

                                <!-- Front Face (Transparent) -->
                                <rect
                                    x="100"
                                    y="150"
                                    width="100"
                                    height="100"
                                    rx="4"
                                    fill="rgba(255,255,255,0.05)"
                                    stroke="rgba(255,255,255,0.3)"
                                    stroke-width="1.5"
                                />
                                <rect
                                    x="102"
                                    y="152"
                                    width="96"
                                    height="96"
                                    rx="2"
                                    fill="url(#cubeGrad)"
                                    fill-opacity="0.15"
                                />

                                <!-- Depth Marker Helpers -->
                                <line
                                    x1="100"
                                    y1="150"
                                    x2="60"
                                    y2="150"
                                    stroke="#fbbf24"
                                    stroke-width="1"
                                    stroke-dasharray="4"
                                    opacity="0.5"
                                />
                                <line
                                    x1="100"
                                    y1="250"
                                    x2="60"
                                    y2="250"
                                    stroke="#fbbf24"
                                    stroke-width="1"
                                    stroke-dasharray="4"
                                    opacity="0.5"
                                />

                                <!-- Top Marker (Depth h) -->
                                <g v-if="stage >= 0">
                                    <line
                                        x1="70"
                                        y1="80"
                                        x2="70"
                                        y2="150"
                                        stroke="#fbbf24"
                                        stroke-width="2"
                                        marker-end="url(#tip-amber)"
                                        marker-start="url(#tip-amber)"
                                    />
                                    <text
                                        x="75"
                                        y="120"
                                        class="fill-amber-400 font-mono text-[14px]"
                                    >
                                        h
                                    </text>
                                </g>

                                <!-- Bottom Marker (Depth h + z) -->
                                <g v-if="stage >= 0">
                                    <line
                                        x1="70"
                                        y1="150"
                                        x2="70"
                                        y2="250"
                                        stroke="#fbbf24"
                                        stroke-width="2"
                                        marker-end="url(#tip-amber)"
                                        marker-start="url(#tip-amber)"
                                    />
                                    <text
                                        x="75"
                                        y="205"
                                        class="fill-amber-400 font-mono text-[14px]"
                                    >
                                        z
                                    </text>
                                </g>

                                <!-- Surface Label -->
                                <text
                                    x="150"
                                    y="205"
                                    text-anchor="middle"
                                    class="fill-white/30 font-black text-[20px]"
                                >
                                    A
                                </text>

                                <!-- Dynamic SVG highlights based on svgHighlight -->

                                <!-- FACES highlight: top & bottom face pulse red/green -->
                                <rect
                                    v-if="
                                        ['faces', 'area', 'vol'].includes(
                                            svgHighlight,
                                        )
                                    "
                                    x="100"
                                    y="150"
                                    width="100"
                                    height="100"
                                    rx="4"
                                    fill="rgba(251,191,36,0.12)"
                                    class="svg-pulse-vol"
                                />
                                <rect
                                    v-if="
                                        svgHighlight === 'faces' ||
                                        svgHighlight === 'area'
                                    "
                                    x="100"
                                    y="150"
                                    width="100"
                                    height="4"
                                    fill="rgba(248,113,113,0.6)"
                                    class="svg-pulse-face"
                                />
                                <rect
                                    v-if="
                                        svgHighlight === 'faces' ||
                                        svgHighlight === 'area'
                                    "
                                    x="100"
                                    y="246"
                                    width="100"
                                    height="4"
                                    fill="rgba(74,222,128,0.6)"
                                    class="svg-pulse-face"
                                />

                                <!-- DEPTHS highlight: h and z dimension lines glow -->
                                <rect
                                    v-if="
                                        [
                                            'depths',
                                            'sub',
                                            'factor',
                                            'z',
                                        ].includes(svgHighlight)
                                    "
                                    x="58"
                                    y="78"
                                    width="18"
                                    height="174"
                                    rx="3"
                                    fill="rgba(251,191,36,0.15)"
                                    class="svg-pulse-depth"
                                />

                                <!-- Z highlight: only the z span -->
                                <rect
                                    v-if="svgHighlight === 'z'"
                                    x="58"
                                    y="148"
                                    width="18"
                                    height="104"
                                    rx="3"
                                    fill="rgba(251,191,36,0.35)"
                                    class="svg-pulse-z"
                                />

                                <!-- VOL highlight: whole cube glows -->
                                <rect
                                    v-if="svgHighlight === 'vol'"
                                    x="98"
                                    y="148"
                                    width="104"
                                    height="104"
                                    rx="5"
                                    fill="none"
                                    stroke="#fbbf24"
                                    stroke-width="2.5"
                                    class="svg-pulse-vol"
                                />

                                <!-- Force vectors: stage >= 1 -->
                                <g v-if="stage >= 1">
                                    <line
                                        x1="150"
                                        y1="108"
                                        x2="150"
                                        y2="148"
                                        stroke="#d97706"
                                        stroke-width="4"
                                        marker-end="url(#tip-orange)"
                                        class="svg-vec"
                                    />
                                    <text
                                        x="162"
                                        y="125"
                                        fill="#d97706"
                                        font-family="sans-serif"
                                        font-size="11"
                                        font-weight="900"
                                    >
                                        F<tspan dy="3" font-size="8">boven</tspan>
                                    </text>
                                </g>
                                <g v-if="stage >= 1">
                                    <line
                                        x1="150"
                                        y1="350"
                                        x2="150"
                                        y2="252"
                                        stroke="#0369a1"
                                        stroke-width="4"
                                        marker-end="url(#tip-blue)"
                                        class="svg-vec"
                                    />
                                    <text
                                        x="162"
                                        y="310"
                                        fill="#0369a1"
                                        font-family="sans-serif"
                                        font-size="11"
                                        font-weight="900"
                                    >
                                        F<tspan dy="3" font-size="8">onder</tspan>
                                    </text>
                                </g>

                                <!-- Net F_A arrow: right side of cube, centered vertically -->
                                <!-- Difference is (350-252=98) - (148-108=40) = 58 units -->
                                <g v-if="stage >= 2">
                                    <line x1="200" y1="200" x2="220" y2="200" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3" />
                                    <line
                                        x1="225"
                                        y1="200"
                                        x2="225"
                                        y2="142"
                                        stroke="#059669"
                                        stroke-width="5"
                                        marker-end="url(#tip-green)"
                                        class="svg-vec"
                                    />
                                    <text
                                        x="234"
                                        y="180"
                                        fill="#059669"
                                        font-family="sans-serif"
                                        font-size="16"
                                        font-weight="900"
                                    >
                                        F<tspan dy="4" font-size="11">A</tspan>
                                    </text>
                                </g>
                            </g>

                            <!-- Defs -->
                            <defs>
                                <pattern
                                    id="hatch-red"
                                    patternUnits="userSpaceOnUse"
                                    width="8"
                                    height="8"
                                    patternTransform="rotate(45)"
                                >
                                    <line
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="8"
                                        stroke="rgba(217,119,6,0.4)"
                                        stroke-width="1.5"
                                    />
                                </pattern>
                                <pattern
                                    id="hatch-green"
                                    patternUnits="userSpaceOnUse"
                                    width="8"
                                    height="8"
                                    patternTransform="rotate(45)"
                                >
                                    <line
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="8"
                                        stroke="rgba(3,105,161,0.4)"
                                        stroke-width="1.5"
                                    />
                                </pattern>
                                <linearGradient
                                    id="cubeGrad"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="0%" stop-color="#fff" />
                                    <stop
                                        offset="100%"
                                        stop-color="#fff"
                                        stop-opacity="0"
                                    />
                                </linearGradient>
                                <marker id="tip-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#0369a1" />
                                </marker>
                                <marker id="tip-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" />
                                </marker>
                                <marker id="tip-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
                                </marker>
                            </defs>
                        </svg>
                    </div>

                    <!-- Meta info container -->
                    <div
                        class="mt-8 bg-black/30 border border-white/5 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-4"
                    >
                        <div class="flex items-center justify-between group">
                            <span
                                class="text-indigo-300/40 text-[10px] font-black uppercase tracking-widest"
                                >Diepte Bovenvlak</span
                            >
                            <span class="text-white font-mono text-xs">h</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span
                                class="text-indigo-300/40 text-[10px] font-black uppercase tracking-widest"
                                >Diepte Ondervlak</span
                            >
                            <span class="text-white font-mono text-xs"
                                >h + z</span
                            >
                        </div>
                        <div
                            class="pt-4 border-t border-white/5 flex items-center justify-between"
                        >
                            <span
                                class="text-indigo-100 text-[10px] font-black uppercase tracking-widest"
                                >Volume (V)</span
                            >
                            <span
                                class="text-amber-400 font-mono text-xs"
                                v-html="renderMath('\\( A \\cdot z \\)')"
                            ></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #f1f5f9;
    border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #e2e8f0;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(10px);
}
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.fade-bounce-enter-active {
    animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-bounce-leave-active {
    animation: bounce-in 0.4s reverse;
}
@keyframes bounce-in {
    0% {
        transform: scale(0.9);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* SVG pulsing highlights */
.svg-pulse-face {
    animation: pulse-face 1.2s ease-in-out infinite;
}
.svg-pulse-depth {
    animation: pulse-depth 1.4s ease-in-out infinite;
}
.svg-pulse-z {
    animation: pulse-z 0.9s ease-in-out infinite;
}
.svg-pulse-vol {
    animation: pulse-vol 1.5s ease-in-out infinite;
}
.svg-vec {
    animation: vec-glow 1.3s ease-in-out infinite;
}

@keyframes pulse-face {
    0%,
    100% {
        opacity: 0.4;
    }
    50% {
        opacity: 1;
    }
}
@keyframes pulse-depth {
    0%,
    100% {
        opacity: 0.3;
    }
    50% {
        opacity: 0.8;
    }
}
@keyframes pulse-z {
    0%,
    100% {
        opacity: 0.5;
    }
    50% {
        opacity: 1;
    }
}
@keyframes pulse-vol {
    0%,
    100% {
        opacity: 0.3;
    }
    50% {
        opacity: 0.9;
    }
}
@keyframes vec-glow {
    0%,
    100% {
        opacity: 0.7;
    }
    50% {
        opacity: 1;
    }
}
</style>
