<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import {
    PhX,
    PhArrowRight,
    PhArrowLeft,
    PhCheckCircle,
    PhLightbulb,
    PhQuestion,
    PhTarget,
    PhFunction,
    PhListNumbers,
    PhBooks,
    PhStar,
    PhLock,
    PhCaretDown,
} from "@phosphor-icons/vue";
import katex from "katex";
import "katex/dist/katex.min.css";
import { PROBLEMS } from "./strategyProblems.js";

const props = defineProps({
    isOpen: Boolean,
    title: { type: String, default: "Strategie-assistent" },
    fullscreen: { type: Boolean, default: true },
});

const emit = defineEmits(["close", "complete"]);

// ===================== MATH HELPER =====================
function k(text) {
    if (!text) return "";
    return String(text).replace(/\\\((.+?)\\\)/gs, (_, formula) => {
        try {
            return katex.renderToString(formula.trim(), {
                throwOnError: false,
                displayMode: false,
            });
        } catch {
            return text;
        }
    });
}

// ===================== DECISION TREE =====================
const nodes = {
    start: {
        question: "Wat weet je over het voorwerp?",
        hint: "Lees het probleem goed. Kijk naar welke situatie beschreven wordt.",
        options: [
            {
                label: "Het voorwerp drijft (gedeeltelijk boven het oppervlak)",
                next: "floating",
            },
            {
                label: "Het voorwerp is volledig ondergedompeld (zinkt, zweeft of stijgt)",
                next: "submerged",
            },
            {
                label: "Er wordt een dynamometer (krachtmeter) gebruikt",
                next: "dynamometer",
            },
        ],
    },
    floating: {
        question: "Wat wordt er gevraagd bij dit drijfprobleem?",
        hint: "Bij drijven geldt altijd: \\( F_z = F_A \\) en het voorwerp steekt gedeeltelijk boven het oppervlak.",
        options: [
            {
                label: "Het percentage of fractie onder/boven water",
                next: "float_percent",
            },
            {
                label: "Een kracht (F_A of F_z) of een volume",
                next: "float_force",
            },
            {
                label: "De massa of dichtheid van het voorwerp",
                next: "float_mass",
            },
        ],
    },
    float_percent: {
        result: true,
        strategy: "Drijven: percentage berekenen",
        formula:
            "\\( \\frac{V_{onder}}{V_{vwp}} = \\frac{\\rho_{vwp}}{\\rho_{vl}} \\)",
        explanation:
            "Bij drijven is er evenwicht: \\( F_z = F_A \\). Dit geeft de dichtheidsverhouding. Het percentage onder water is gelijk aan de verhouding van de dichtheden.",
        steps: [
            "Noteer de dichtheden: \\( \\rho_{vwp} \\) en \\( \\rho_{vl} \\).",
            "Pas de formule toe: \\( V_{onder}/V_{vwp} = \\rho_{vwp}/\\rho_{vl} \\).",
            "Vermenigvuldig met 100 voor het percentage.",
            "Het percentage boven water = 100% − percentage onder water.",
        ],
        problems: [1],
    },
    float_force: {
        result: true,
        strategy: "Drijven: kracht of volume berekenen",
        formula:
            "\\( \\rho_{vwp} \\cdot V_{vwp} = \\rho_{vl} \\cdot V_{onder} \\)",
        explanation:
            "Bij drijven geldt \\( F_z = F_A \\), dus \\( m \\cdot g = \\rho_{vl} \\cdot V_{onder} \\cdot g \\). De \\( g \\) valt weg. Gebruik de dichtheidsrelatie om het onbekende volume of de kracht te vinden.",
        steps: [
            "Noteer gegeven waarden: dichtheden, volumes.",
            "Stel het evenwicht op: \\( \\rho_{vwp} \\cdot V_{vwp} = \\rho_{vl} \\cdot V_{onder} \\).",
            "Los de onbekende op door te herschikken.",
            "Bereken eventueel \\( F_A = \\rho_{vl} \\cdot V_{onder} \\cdot g \\).",
        ],
        problems: [2, 6],
    },
    float_mass: {
        result: true,
        strategy: "Drijven: massa of dichtheid bepalen",
        formula:
            "\\( m = \\rho_{vwp} \\cdot V_{vwp} = \\rho_{vl} \\cdot V_{onder} \\)",
        explanation:
            "Gebruik het drijfevenwicht. Als je \\( V_{boven} \\) kent, dan \\( V_{onder} = V_{vwp} - V_{boven} \\). Met twee vergelijkingen en twee onbekenden kun je \\( V_{vwp} \\) en daarna \\( m \\) berekenen.",
        steps: [
            "Schrijf \\( V_{vwp} = V_{onder} + V_{boven} \\).",
            "Gebruik \\( \\rho_{vwp} \\cdot V_{vwp} = \\rho_{vl} \\cdot V_{onder} \\).",
            "Substitueer en los op naar \\( V_{vwp} \\).",
            "Bereken \\( m = \\rho_{vwp} \\cdot V_{vwp} \\).",
        ],
        problems: [9],
    },
    submerged: {
        question: "Wat wordt er gevraagd?",
        hint: "Bij volledige onderdompeling: \\( V_{onder} = V_{vwp} \\). De archimedeskracht is dan \\( F_A = \\rho_{vl} \\cdot V_{vwp} \\cdot g \\).",
        options: [
            {
                label: "De archimedeskracht of zwaartekracht berekenen",
                next: "sub_force",
            },
            {
                label: "Hoeveel kracht nodig om het voorwerp onder water te houden/duwen",
                next: "sub_push",
            },
            {
                label: "Hoeveel massa/personen kan een boot dragen",
                next: "sub_boat",
            },
        ],
    },
    sub_force: {
        result: true,
        strategy: "Volledig ondergedompeld: krachten berekenen",
        formula: "\\( F_A = \\rho_{vl} \\cdot V_{vwp} \\cdot g \\)",
        explanation:
            "Bereken eerst \\( F_z = m \\cdot g \\) en \\( F_A = \\rho_{vl} \\cdot V_{vwp} \\cdot g \\). Vergelijk beide krachten om de bewegingstoestand te bepalen.",
        steps: [
            "Bereken \\( F_z = m \\cdot g \\).",
            "Bereken \\( F_A = \\rho_{vl} \\cdot V_{vwp} \\cdot g \\).",
            "Vergelijk: \\( F_z > F_A \\)? → zinkt. \\( F_z = F_A \\)? → zweeft. \\( F_z < F_A \\)? → stijgt.",
        ],
        problems: [3],
    },
    sub_push: {
        result: true,
        strategy: "Kracht om volledig onder te duwen",
        formula: "\\( F_{extra} = F_A^{volledig} - F_z \\)",
        explanation:
            "Als een voorwerp drijft en je wilt het volledig onder water duwen, moet je de extra kracht leveren die het verschil maakt. Bereken \\( F_A \\) bij volledige onderdompeling en trek \\( F_z \\) af.",
        steps: [
            "Bepaal eerst de dichtheid of het volume van het voorwerp (via drijfgegevens).",
            "Bereken \\( F_A^{volledig} = \\rho_{vl} \\cdot V_{vwp} \\cdot g \\) (volledig ondergedompeld).",
            "Je weet dat \\( F_z = m \\cdot g \\) (gegeven of berekend).",
            "De extra kracht: \\( F_{extra} = F_A^{volledig} - F_z \\).",
        ],
        problems: [4],
    },
    sub_boat: {
        result: true,
        strategy: "Maximale belasting (boot/schip)",
        formula:
            "\\( F_z^{max} = F_A^{max} = \\rho_{vl} \\cdot V_{boot} \\cdot g \\)",
        explanation:
            "Een boot zinkt niet zolang \\( F_z \\leq F_A \\). De maximale \\( F_A \\) is wanneer de boot volledig ondergedompeld is. De totale massa mag niet groter zijn dan \\( F_A^{max} / g \\).",
        steps: [
            "Bereken \\( F_A^{max} = \\rho_{vl} \\cdot V_{boot} \\cdot g \\).",
            "De boot zinkt niet als \\( F_z \\leq F_A^{max} \\).",
            "Stel op: \\( (m_{boot} + n \\cdot m_{persoon}) \\cdot g \\leq F_A^{max} \\).",
            "Los op naar \\( n \\) (afronden naar beneden).",
        ],
        problems: [5],
    },
    dynamometer: {
        question: "Hoe wordt de dynamometer gebruikt?",
        hint: 'Een dynamometer meet de "schijnbare" zwaartekracht. Het verschil met de echte zwaartekracht is de archimedeskracht.',
        options: [
            {
                label: "Eén meting: dynamometer in één vloeistof",
                next: "dyno_single",
            },
            {
                label: "Twee metingen: dynamometer in twee verschillende vloeistoffen",
                next: "dyno_double",
            },
        ],
    },
    dyno_single: {
        result: true,
        strategy: "Dynamometer: één vloeistof",
        formula: "\\( F_A = F_z - F_{dynamometer} \\)",
        explanation:
            "De dynamometer leest de schijnbare kracht af. Het verschil met de zwaartekracht (\\( F_z = m \\cdot g \\)) geeft de archimedeskracht. Vanuit \\( F_A \\) kun je het volume berekenen, en dan de dichtheid.",
        steps: [
            "Bereken \\( F_z = m \\cdot g \\).",
            "Bereken \\( F_A = F_z - F_{dynamometer} \\).",
            "Gebruik \\( F_A = \\rho_{vl} \\cdot V \\cdot g \\) om \\( V \\) te vinden.",
            "Bereken \\( \\rho = m / V \\) als dichtheid gevraagd is.",
        ],
        problems: [3, 7],
    },
    dyno_double: {
        result: true,
        strategy: "Dynamometer: twee vloeistoffen vergelijken",
        formula: "\\( \\rho_2 = \\frac{F_{A,2}}{F_{A,1}} \\cdot \\rho_1 \\)",
        explanation:
            "Als je hetzelfde voorwerp in twee vloeistoffen meet, is het volume gelijk. Dus \\( F_{A,1} = \\rho_1 \\cdot V \\cdot g \\) en \\( F_{A,2} = \\rho_2 \\cdot V \\cdot g \\). Door de verhouding te nemen valt \\( V \\cdot g \\) weg.",
        steps: [
            "Bereken \\( F_{A,1} = F_z - F_{dyno,1} \\) (in vloeistof 1).",
            "Bereken \\( F_{A,2} = F_z - F_{dyno,2} \\) (in vloeistof 2).",
            "Gebruik het volume: \\( V = F_{A,1} / (\\rho_1 \\cdot g) \\).",
            "Bereken \\( \\rho_2 = F_{A,2} / (V \\cdot g) \\).",
        ],
        problems: [8],
    },
};

// ===================== STATE =====================
const history = ref(["start"]);
const currentNodeId = computed(() => history.value[history.value.length - 1]);
const currentNode = computed(() => nodes[currentNodeId.value]);
const completedStrategies = ref(new Set());
const showAllStrategies = ref(false);

// ---- Problem mode ----
const activeTab = ref("tree"); // 'tree' | 'problems'
const selectedProblem = ref(null);
const revealedHints = ref(0);
const completedProblems = ref(new Set());

const problemProgress = computed(() => ({
    done: completedProblems.value.size,
    total: PROBLEMS.length,
    pct: Math.round((completedProblems.value.size / PROBLEMS.length) * 100),
}));

function openProblem(p) {
    selectedProblem.value = p;
    revealedHints.value = 0;
}
function revealNextHint() {
    if (revealedHints.value < selectedProblem.value.hints.length)
        revealedHints.value++;
}
function markProblemDone() {
    completedProblems.value.add(selectedProblem.value.id);
    completedProblems.value = new Set(completedProblems.value); // trigger reactivity
    selectedProblem.value = null;
    revealedHints.value = 0;
}
function closeProblem() {
    selectedProblem.value = null;
    revealedHints.value = 0;
}

function selectOption(opt) {
    history.value.push(opt.next);
}

function goBack() {
    if (history.value.length > 1) {
        history.value.pop();
    }
}

function restart() {
    history.value = ["start"];
}

function markStrategyDone() {
    completedStrategies.value.add(currentNodeId.value);
    restart();
}

const allStrategies = computed(() => {
    return Object.entries(nodes)
        .filter(([, node]) => node.result)
        .map(([id, node]) => ({
            id,
            strategy: node.strategy,
            formula: node.formula,
            explanation: node.explanation,
            steps: node.steps,
            problems: node.problems,
            done: completedStrategies.value.has(id),
        }));
});

const progress = computed(() => {
    const total = allStrategies.value.length;
    const done = completedStrategies.value.size;
    return { done, total, pct: Math.round((done / total) * 100) };
});

// ===================== FULLSCREEN =====================
watch(
    () => props.isOpen,
    (val) => {
        if (!val) {
            if (document.fullscreenElement)
                document.exitFullscreen().catch(() => {});
            window.removeEventListener("keydown", handleKeydown);
        } else {
            window.addEventListener("keydown", handleKeydown);
            if (props.fullscreen) {
                nextTick(() => {
                    if (!document.fullscreenElement) {
                        document.documentElement
                            .requestFullscreen()
                            .catch(() => {});
                    }
                });
            }
        }
    },
    { immediate: true },
);

function handleKeydown(e) {
    if (e.key === "Escape" && props.isOpen) emit("close");
}

const handleFullscreenChange = () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement)
        emit("close");
};

onMounted(() =>
    document.addEventListener("fullscreenchange", handleFullscreenChange),
);
onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
});
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
    >
        <div
            class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            @click="$emit('close')"
        ></div>

        <div
            class="relative bg-slate-50 shadow-2xl overflow-hidden flex flex-col w-screen h-screen"
        >
            <!-- HEADER -->
            <div
                class="border-b border-slate-200 bg-white shadow-sm z-10 shrink-0"
            >
                <div class="px-4 py-2 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center"
                        >
                            <PhTarget
                                weight="fill"
                                class="text-lg text-white"
                            />
                        </div>
                        <div>
                            <h2
                                class="text-base font-extrabold text-slate-800 tracking-tight"
                            >
                                {{ title }}
                            </h2>
                            <p class="text-xs text-slate-400">
                                Jouw persoonlijke assistent voor
                                archimedeskracht
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button
                            @click="$emit('close')"
                            class="p-2 bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-all"
                        >
                            <PhX class="text-lg" />
                        </button>
                    </div>
                </div>
                <!-- TABS -->
                <div class="flex border-t border-slate-100">
                    <button
                        @click="
                            activeTab = 'tree';
                            showAllStrategies = false;
                        "
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold transition-all border-b-2"
                        :class="
                            activeTab === 'tree'
                                ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        "
                    >
                        <PhFunction class="text-base" weight="bold" /> Strategie
                        kiezen
                    </button>
                    <button
                        @click="
                            activeTab = 'problems';
                            closeProblem();
                        "
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold transition-all border-b-2"
                        :class="
                            activeTab === 'problems'
                                ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        "
                    >
                        <PhBooks class="text-base" weight="bold" /> Hulp bij
                        oefening
                    </button>
                </div>
            </div>

            <!-- MAIN -->
            <div class="flex-1 overflow-hidden flex">
                <!-- =================== PROBLEMS TAB =================== -->
                <div
                    v-if="activeTab === 'problems'"
                    class="flex-1 overflow-y-auto p-6"
                >
                    <!-- Problem list -->
                    <div v-if="!selectedProblem">
                        <p class="text-sm text-slate-500 mb-4 text-center">
                            Kies de oefening waar je mee bezig bent. Ik help je
                            stap voor stap.
                        </p>
                        <div class="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
                            <button
                                v-for="p in PROBLEMS"
                                :key="p.id"
                                @click="openProblem(p)"
                                class="relative text-left p-4 rounded-xl border-2 transition-all hover:shadow-md group"
                                :class="
                                    completedProblems.has(p.id)
                                        ? 'border-emerald-300 bg-emerald-50'
                                        : 'border-slate-200 bg-white hover:border-emerald-400'
                                "
                            >
                                <PhCheckCircle
                                    v-if="completedProblems.has(p.id)"
                                    weight="fill"
                                    class="absolute top-2 right-2 text-emerald-500 text-lg"
                                />
                                <span
                                    class="block text-xs font-bold text-slate-400 mb-1"
                                    >Oef {{ p.id }} · p.{{ p.page }}</span
                                >
                                <span
                                    class="block text-sm font-bold"
                                    :class="
                                        completedProblems.has(p.id)
                                            ? 'text-emerald-700'
                                            : 'text-slate-700 group-hover:text-emerald-700'
                                    "
                                    >{{ p.title }}</span
                                >
                            </button>
                        </div>
                    </div>

                    <!-- Problem walkthrough -->
                    <div v-else class="max-w-2xl mx-auto">
                        <button
                            @click="closeProblem()"
                            class="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 mb-4 transition-colors"
                        >
                            <PhArrowLeft class="text-base" /> Terug naar
                            overzicht
                        </button>

                        <!-- Problem header -->
                        <div
                            class="bg-white rounded-2xl border-2 border-slate-200 shadow overflow-hidden mb-4"
                        >
                            <div class="bg-emerald-600 px-5 py-4">
                                <p
                                    class="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-1"
                                >
                                    Oef {{ selectedProblem.id }} · p.{{
                                        selectedProblem.page
                                    }}
                                </p>
                                <h3 class="text-xl font-bold text-white">
                                    {{ selectedProblem.title }}
                                </h3>
                            </div>
                            <!-- Given -->
                            <div
                                class="px-5 py-3 bg-slate-50 border-b border-slate-200"
                            >
                                <p
                                    class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                                >
                                    Gegeven
                                </p>
                                <ul class="space-y-1">
                                    <li
                                        v-for="(g, i) in selectedProblem.given"
                                        :key="i"
                                        class="text-sm text-slate-700"
                                        v-html="k(g)"
                                    ></li>
                                </ul>
                            </div>
                            <!-- Asked -->
                            <div class="px-5 py-3">
                                <p
                                    class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
                                >
                                    Gevraagd
                                </p>
                                <p
                                    class="text-sm font-semibold text-slate-800"
                                    v-html="k(selectedProblem.asked)"
                                ></p>
                            </div>
                        </div>

                        <!-- Hints -->
                        <div class="space-y-3 mb-4">
                            <div
                                v-for="(hint, i) in selectedProblem.hints"
                                :key="i"
                                v-show="i < revealedHints"
                                class="bg-white rounded-xl border-l-4 border-emerald-400 border border-slate-200 shadow-sm overflow-hidden"
                            >
                                <div
                                    class="px-4 py-2 bg-emerald-50 border-b border-emerald-100"
                                >
                                    <p
                                        class="text-xs font-bold text-emerald-700 uppercase tracking-wide"
                                    >
                                        Hint {{ i + 1 }}: {{ hint.label }}
                                    </p>
                                </div>
                                <div
                                    class="px-4 py-3 text-sm text-slate-700"
                                    v-html="k(hint.text)"
                                ></div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex flex-col items-center gap-3">
                            <button
                                v-if="
                                    revealedHints < selectedProblem.hints.length
                                "
                                @click="revealNextHint"
                                class="w-full max-w-sm px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <PhCaretDown weight="bold" /> Ik ben
                                vastgelopen, toon een hint ({{
                                    revealedHints
                                }}/{{ selectedProblem.hints.length }})
                            </button>
                            <div
                                v-if="
                                    revealedHints >=
                                        selectedProblem.hints.length &&
                                    !completedProblems.has(selectedProblem.id)
                                "
                                class="w-full max-w-sm"
                            >
                                <p
                                    class="text-center text-sm text-slate-500 mb-3"
                                >
                                    Alle hints getoond. Lukt het nu?
                                </p>
                                <button
                                    @click="markProblemDone"
                                    class="w-full px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <PhCheckCircle weight="fill" /> Ja, ik heb
                                    het! Markeer als klaar
                                </button>
                            </div>
                            <div
                                v-if="completedProblems.has(selectedProblem.id)"
                                class="flex items-center gap-2 text-emerald-600 font-bold text-sm"
                            >
                                <PhCheckCircle weight="fill" /> Super! Deze
                                oefening heb je al gedaan.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- =================== TREE TAB =================== -->
                <div
                    v-else
                    class="flex-1 flex flex-col overflow-y-auto px-6 py-4"
                >
                    <!-- STRATEGY OVERVIEW (toggle) -->
                    <div
                        v-if="showAllStrategies"
                        class="w-full max-w-3xl space-y-3 pb-8"
                    >
                        <h3
                            class="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"
                        >
                            <PhFunction weight="fill" class="text-indigo-500" />
                            Alle strategieën
                        </h3>
                        <div
                            v-for="strat in allStrategies"
                            :key="strat.id"
                            class="bg-white rounded-xl border-2 p-4 transition-all"
                            :class="
                                strat.done
                                    ? 'border-emerald-300 bg-emerald-50/50'
                                    : 'border-slate-200'
                            "
                        >
                            <div class="flex items-center justify-between mb-2">
                                <h4
                                    class="font-bold text-sm"
                                    :class="
                                        strat.done
                                            ? 'text-emerald-700'
                                            : 'text-slate-700'
                                    "
                                >
                                    {{ strat.strategy }}
                                </h4>
                                <PhCheckCircle
                                    v-if="strat.done"
                                    weight="fill"
                                    class="text-emerald-500 text-lg"
                                />
                            </div>
                            <div
                                class="text-xs text-slate-500 mb-2 formula-display"
                                v-html="k(strat.formula)"
                            ></div>
                            <div class="text-xs text-slate-400">
                                Problemen: {{ strat.problems.join(", ") }}
                            </div>
                        </div>
                        <button
                            @click="showAllStrategies = false"
                            class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                        >
                            ← Terug naar de vragen
                        </button>
                    </div>

                    <!-- QUESTION NODE -->
                    <div v-else-if="!currentNode.result" class="w-full">
                        <!-- Breadcrumb -->
                        <div class="flex items-center gap-2 mb-6 flex-wrap">
                            <button
                                v-for="(nodeId, idx) in history"
                                :key="idx"
                                @click="history = history.slice(0, idx + 1)"
                                class="text-xs font-bold px-2 py-1 rounded-md transition-all"
                                :class="
                                    idx === history.length - 1
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-200 text-slate-500 hover:bg-slate-300 cursor-pointer'
                                "
                            >
                                {{ idx + 1 }}
                            </button>
                        </div>

                        <!-- Question Card -->
                        <div
                            class="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
                        >
                            <div class="bg-indigo-600 p-5">
                                <div class="flex items-center gap-3">
                                    <PhQuestion
                                        weight="fill"
                                        class="text-2xl text-white/80"
                                    />
                                    <h3
                                        class="text-xl font-bold text-white"
                                        v-html="k(currentNode.question)"
                                    ></h3>
                                </div>
                            </div>

                            <!-- Hint -->
                            <div
                                v-if="currentNode.hint"
                                class="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-start gap-2"
                            >
                                <PhLightbulb
                                    weight="fill"
                                    class="text-amber-500 text-lg mt-0.5 shrink-0"
                                />
                                <p
                                    class="text-sm text-amber-700"
                                    v-html="k(currentNode.hint)"
                                ></p>
                            </div>

                            <!-- Options -->
                            <div class="p-5 space-y-3">
                                <button
                                    v-for="(opt, idx) in currentNode.options"
                                    :key="idx"
                                    @click="selectOption(opt)"
                                    class="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all flex items-center gap-4 group"
                                >
                                    <div
                                        class="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 font-bold text-lg shrink-0 transition-colors"
                                    >
                                        {{ String.fromCharCode(65 + idx) }}
                                    </div>
                                    <span
                                        class="text-sm font-medium text-slate-700 group-hover:text-indigo-700"
                                        v-html="k(opt.label)"
                                    ></span>
                                    <PhArrowRight
                                        class="ml-auto text-slate-300 group-hover:text-indigo-500 transition-colors"
                                    />
                                </button>
                            </div>
                        </div>

                        <!-- Back button -->
                        <button
                            v-if="history.length > 1"
                            @click="goBack"
                            class="mt-4 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <PhArrowLeft class="text-base" /> Vorige vraag
                        </button>
                    </div>

                    <!-- RESULT NODE -->
                    <div v-else class="w-full">
                        <div
                            class="bg-white rounded-2xl border-2 border-emerald-300 shadow-lg overflow-hidden"
                        >
                            <!-- Strategy Header -->
                            <div class="bg-emerald-600 p-5">
                                <div class="flex items-center gap-3">
                                    <PhCheckCircle
                                        weight="fill"
                                        class="text-2xl text-white/80"
                                    />
                                    <div>
                                        <p
                                            class="text-xs font-bold text-emerald-200 uppercase tracking-wider"
                                        >
                                            Jouw strategie
                                        </p>
                                        <h3
                                            class="text-xl font-bold text-white"
                                            v-html="k(currentNode.strategy)"
                                        ></h3>
                                    </div>
                                </div>
                            </div>

                            <!-- Formula -->
                            <div class="px-5 py-4 bg-slate-900 text-center">
                                <div
                                    class="text-lg text-white font-mono formula-display"
                                    v-html="k(currentNode.formula)"
                                ></div>
                            </div>

                            <!-- Explanation -->
                            <div
                                class="px-5 py-4 border-b border-slate-200 bg-slate-50"
                            >
                                <p
                                    class="text-sm text-slate-600 leading-relaxed"
                                    v-html="k(currentNode.explanation)"
                                ></p>
                            </div>

                            <!-- Steps -->
                            <div class="p-5">
                                <h4
                                    class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3"
                                >
                                    Stappenplan
                                </h4>
                                <div class="space-y-2">
                                    <div
                                        v-for="(step, idx) in currentNode.steps"
                                        :key="idx"
                                        class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                                    >
                                        <div
                                            class="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
                                        >
                                            {{ idx + 1 }}
                                        </div>
                                        <p
                                            class="text-sm text-slate-700"
                                            v-html="k(step)"
                                        ></p>
                                    </div>
                                </div>
                            </div>

                            <!-- Problem references -->
                            <div class="px-5 pb-4">
                                <p class="text-xs text-slate-400">
                                    <strong>Gebruik bij problemen:</strong>
                                    {{ currentNode.problems.join(", ") }}
                                </p>
                            </div>

                            <!-- Actions -->
                            <div
                                class="p-5 bg-slate-50 border-t border-slate-200 flex items-center gap-3 flex-wrap"
                            >
                                <button
                                    @click="markStrategyDone"
                                    class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                >
                                    <PhCheckCircle weight="fill" /> Begrepen!
                                    Volgende probleem
                                </button>
                                <button
                                    @click="restart"
                                    class="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Opnieuw beginnen
                                </button>
                            </div>
                        </div>

                        <!-- Back button -->
                        <button
                            @click="goBack"
                            class="mt-4 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <PhArrowLeft class="text-base" /> Vorige vraag
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.formula-display :deep(.katex) {
    font-size: 1.2em;
}
</style>
