<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { renderMath } from "../../composables/useMathRenderer";
import TheoryQuestScene from "./TheoryQuestScene.vue";
import {
    PhX,
    PhCheckCircle,
    PhWarningCircle,
    PhArrowRight,
    PhArrowLeft,
    PhBookOpen,
    PhCompass,
    PhTarget,
    PhGraph,
    PhWaves,
    PhCornersOut,
    PhStudent,
    PhLightbulb,
} from "@phosphor-icons/vue";

const props = defineProps({
    isOpen: Boolean,
    title: { type: String, default: "Archimedes' Princiepe" },
});
const emit = defineEmits(["close", "complete"]);

const modalRoot = ref(null);

// ─── FULLSCREEN & ESC LOGIC ──────────────────────────────────
const requestFullscreen = async () => {
    if (modalRoot.value && !document.fullscreenElement) {
        try {
            await modalRoot.value.requestFullscreen();
        } catch (err) {
            console.warn("Fullscreen request blocked");
        }
    }
};

const closeActivity = async () => {
    if (document.fullscreenElement) {
        try {
            await document.exitFullscreen();
        } catch (err) {
            console.warn("Fullscreen exit blocked");
        }
    }
    emit("close");
};

const handleKeydown = (e) => {
    if (e.key === "Escape" && props.isOpen) {
        emit("close");
    }
};

const handleFullscreenChange = () => {
    if (props.isOpen && !document.fullscreenElement) {
        emit("close");
    }
};

watch(() => props.isOpen, (val) => {
    if (val) {
        window.addEventListener("keydown", handleKeydown);
        nextTick(() => requestFullscreen());
    } else {
        window.removeEventListener("keydown", handleKeydown);
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
});

onMounted(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
});

// ─── STATE ───────────────────────────────────────────────────
const view = ref("hub"); // 'hub' | 'lesson'
const activeLessonId = ref(null);
const lessonStep = ref("discover"); // 'discover' | 'check' | 'transfer'
const completedLessons = ref(new Set());

// Interactive Variables
const rho = ref(1000);
const rhoObject = ref(500);
const vol = ref(100);
const depth = ref(50);
const pressureVectorMode = ref("surface"); // 'surface' | 'point'
const choice = ref("");
const feedback = ref("");
const feedbackType = ref("");

const sliderFillStyle = (value, min, max) => {
    const progress = ((value - min) / (max - min)) * 100;
    return {
        background: `linear-gradient(90deg, #f59e0b 0%, #f59e0b ${progress}%, #e2e8f0 ${progress}%, #e2e8f0 100%)`
    };
};

// ─── DIDACTIC CONTENT (KHAN & SINGAPORE STYLE) ───────────────
const lessons = [
    {
        id: "intro",
        title: "1. De Opwaartse Kracht",
        short: "Wat maakt een object lichter in water?",
        icon: PhCompass,
        scene: "formula",
        hasSliders: ["rho", "vol"],
        discovery: "Stel je voor dat je een zware steen onder water probeert te tillen. Het voelt makkelijker dan in de lucht. Waarom? Omdat de vloeistof 'terugduwt'. Deze kracht noemen we de <strong>Archimedeskracht (\\(F_A\\))</strong> of <strong>opwaartse kracht</strong>. <br><br> Experimenteer met de schuifregelaars: merk op dat de kracht groter wordt als de vloeistof dichter (zwaarder) is of als het object meer ruimte inneemt (volume).",
        question: "Je dompelt een blokje goud en een blokje piepschuim van exact hetzelfde volume onder in water. Welke bewering over de Archimedeskracht klopt?",
        options: [
            { v: "goud", t: "De kracht op het goud is groter omdat het zwaarder is." },
            { v: "same", t: "De kracht is op beide objecten exact even groot." },
            { v: "piep", t: "De kracht op het piepschuim is groter omdat het wil drijven." }
        ],
        answer: "same",
        explanation: "Correct! Archimedes ontdekte dat de kracht enkel afhangt van de *vloeistof* die je omhoog duwt, niet van waar het object zelf van gemaakt is.",
        transfer: "Open je cursus op **pagina 4**. Noteer de Wet van Archimedes: de opwaartse kracht is gelijk aan het **gewicht van de verplaatste vloeistof**. Maak daarna oefening 1 en 2 op p. 16."
    },
    {
        id: "cause",
        title: "2. Druk en Diepte",
        short: "De oorzaak van de opwaartse kracht",
        icon: PhWaves,
        scene: "pressure",
        hasSliders: ["depth"],
        discovery: "In een vloeistof neemt de druk toe met de diepte (\\(p = \\rho \\cdot g \\cdot h\\)). Kijk naar het blokje: de onderkant bevindt zich altijd dieper dan de bovenkant. <br><br> Dit betekent dat de vloeistof onderaan harder omhoog duwt dan de vloeistof bovenaan omlaag duwt. Het resultaat? Een netto duw omhoog. Dat is precies wat we de Archimedeskracht noemen.",
        question: "Wat gebeurt er met de Archimedeskracht als we het object nog dieper onder water duwen?",
        options: [
            { v: "more", t: "De kracht wordt groter omdat de druk onderaan stijgt." },
            { v: "same", t: "De kracht blijft gelijk omdat het <em>drukverschil</em> constant blijft." },
            { v: "less", t: "De kracht wordt kleiner door de enorme waterdruk." }
        ],
        answer: "same",
        explanation: "Scherp opgemerkt! Hoewel de absolute druk stijgt, blijft het *verschil* tussen boven- en onderkant gelijk zolang het volume van het object niet verandert.",
        transfer: "Bestudeer de theoretische afleiding op **pagina 5 en 6**. Vul nu opdracht 3 en 4 in op p. 16-17."
    },
    {
        id: "states",
        title: "3. Krachten in Balans",
        short: "Zinken, zweven of stijgen",
        icon: PhTarget,
        scene: "states",
        hasSliders: ["rho", "rhoObject"],
        discovery: "Of een voorwerp beweegt, hangt af van de balans tussen twee krachten: de zwaartekracht (\\(F_z\\)) omlaag en de archimedeskracht (\\(F_A\\)) omhoog. <br><br> Experimenteer met de dichtheid van de vloeistof en het voorwerp. Is de dichtheid van het voorwerp groter dan die van de vloeistof, dan zinkt het. Is ze kleiner, dan stijgt het.",
        question: "Een voorwerp 'zweeft' midden in een tank. Wat kun je zeggen over de dichtheid van dit voorwerp?",
        options: [
            { v: "high", t: "De dichtheid is veel hoger dan die van de vloeistof." },
            { v: "zero", t: "Het voorwerp is gewichtloos geworden." },
            { v: "equal", t: "De dichtheid is exact gelijk aan die van de vloeistof." }
        ],
        answer: "equal",
        explanation: "Precies! Bij zweven zijn de zwaartekracht en de archimedeskracht even groot (\\(F_z = F_A\\)).",
        transfer: "Lees de verschillende toestanden op **pagina 8 t.e.m. 12**. Los daarna opdracht 5, 6 en 13 op (p. 18-21)."
    },
    {
        id: "iceberg",
        title: "4. De Wet van Drijven",
        short: "Hoeveel steekt er boven water?",
        icon: PhGraph,
        scene: "iceberg",
        hasSliders: ["rho", "rhoObject"],
        discovery: "Wanneer een voorwerp drijft, zijn de zwaartekracht en de archimedeskracht even groot (\\(F_z = F_A\\)). <br><br> Alleen het ondergedompelde volume bepaalt de archimedeskracht. Pas de dichtheid van het object aan en kijk hoe diep het in het water ligt. Hoe dichter bij de dichtheid van water, hoe minder er bovenuit steekt.",
        question: "Waarom drijft een enorme stalen tanker, terwijl een klein stalen spijkertje zinkt?",
        options: [
            { v: "air", t: "De tanker bevat veel lucht, waardoor zijn *gemiddelde* dichtheid lager is dan water." },
            { v: "size", t: "Grote objecten worden door de natuur anders behandeld dan kleine." },
            { v: "engine", t: "De motoren van de tanker duwen hem constant omhoog." }
        ],
        answer: "air",
        explanation: "Inderdaad. Het gaat om het *totale* volume en de *totale* massa. Door de holle vorm verplaatst een schip enorm veel water.",
        transfer: "Ga naar **pagina 13 en 14**. Leer over de drijfformule en maak opdracht 17, 18 en 19 (p. 22)."
    }
];

const activeLesson = computed(() => lessons.find(l => l.id === activeLessonId.value));
const progressPercent = computed(() => (completedLessons.value.size / lessons.length) * 100);

// ─── ACTIONS ─────────────────────────────────────────────────
const openLesson = (id) => {
    activeLessonId.value = id;
    lessonStep.value = "discover";
    view.value = "lesson";
    choice.value = "";
    feedback.value = "";
    rho.value = 1000; rhoObject.value = 500; vol.value = 100; depth.value = 50;
    pressureVectorMode.value = "surface";
};

const checkAnswer = () => {
    if (choice.value === activeLesson.value.answer) {
        feedbackType.value = "success";
        feedback.value = activeLesson.value.explanation;
    } else {
        feedbackType.value = "error";
        feedback.value = "Nog niet helemaal. Gebruik de simulator links om het effect te observeren.";
    }
};

const nextStep = () => {
    lessonStep.value = "transfer";
    feedback.value = "";
    feedbackType.value = "";
};

const completeLesson = () => {
    completedLessons.value.add(activeLessonId.value);
    view.value = "hub";
};
</script>

<template>
    <div 
        v-if="isOpen" 
        ref="modalRoot" 
        class="fixed inset-0 z-[100] flex items-center justify-center font-sans bg-white"
    >
        <!-- Inner Container (Fixed max-width for better reading but fills screen on mobile) -->
        <div class="relative w-full h-full flex flex-col bg-white overflow-hidden">
            
            <!-- ACADEMIC HEADER -->
            <header class="h-20 border-b border-slate-100 flex items-center justify-between px-10 shrink-0 bg-white z-10">
                <div class="flex items-center gap-5">
                    <div class="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                        <PhStudent weight="fill" class="text-white text-2xl" />
                    </div>
                    <div>
                        <h2 class="text-slate-900 font-black text-xl tracking-tight leading-none mb-1">Interactieve Theorieverkenner</h2>
                        <div class="flex items-center gap-3">
                            <div class="h-1.5 w-40 bg-slate-100 rounded-full overflow-hidden">
                                <div class="h-full bg-amber-500 transition-all duration-1000 ease-out" :style="{ width: progressPercent + '%' }"></div>
                            </div>
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ completedLessons.size }} / {{ lessons.length }} onderdelen</span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <button 
                        @click="closeActivity" 
                        class="group flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-100 hover:border-slate-900 transition-all text-slate-400 hover:text-slate-900"
                    >
                        <span class="text-xs font-black uppercase tracking-widest">Sluiten</span>
                        <PhX weight="bold" class="text-lg" />
                    </button>
                </div>
            </header>

            <main class="flex-1 overflow-hidden relative flex">
                <Transition name="fade-slide" mode="out-in">
                    
                    <!-- ════ HUB VIEW: Selection ════ -->
                    <div v-if="view === 'hub'" class="flex-1 overflow-y-auto p-12 md:p-16 bg-white custom-scrollbar">
                        <div class="max-w-6xl mx-auto space-y-12 text-center">
                            <div class="space-y-4 max-w-2xl mx-auto">
                                <h1 class="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                                    Interactieve <span class="text-amber-600">Theorie</span>verkenner.
                                </h1>
                                <p class="text-slate-500 text-lg leading-relaxed">
                                    Herhaal de kernconcepten van de Archimedeskracht stap voor stap.
                                </p>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <button 
                                    v-for="l in lessons" :key="l.id"
                                    @click="openLesson(l.id)"
                                    class="group p-6 rounded-3xl border-2 text-left transition-all duration-300 flex flex-col justify-between h-56 shadow-sm hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                                    :class="completedLessons.has(l.id) 
                                        ? 'border-emerald-100 bg-emerald-50/30' 
                                        : 'border-slate-50 bg-white hover:border-amber-400'"
                                >
                                    <div class="flex justify-between items-start">
                                        <div :class="['p-3 rounded-2xl transition-colors duration-300', completedLessons.has(l.id) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600']">
                                            <component :is="l.icon" weight="fill" class="text-2xl" />
                                        </div>
                                        <div v-if="completedLessons.has(l.id)" class="bg-emerald-500 text-white rounded-full p-1 shadow-lg shadow-emerald-200">
                                            <PhCheckCircle weight="fill" class="text-lg" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 class="text-slate-900 font-black text-lg tracking-tight mb-1 group-hover:text-amber-600 transition-colors">{{ l.title }}</h3>
                                        <p class="text-slate-500 text-xs font-medium leading-relaxed">{{ l.short }}</p>
                                    </div>
                                </button>
                            </div>

                            <div v-if="completedLessons.size === lessons.length" class="p-8 bg-slate-900 rounded-[32px] text-center space-y-6 shadow-2xl">
                                <PhLightbulb weight="fill" class="text-5xl text-amber-400 mx-auto" />
                                <div class="space-y-2">
                                    <h3 class="text-white font-black text-2xl tracking-tight">Theorie Beheerst</h3>
                                    <p class="text-slate-400 text-base">Je hebt de basisconcepten van de Archimedeskracht herhaald. Klaar voor de volgende stap?</p>
                                </div>
                                <button @click="emit('complete')" class="px-10 py-4 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 transition-all text-lg shadow-xl shadow-amber-500/20">
                                    Activiteit Afronden
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- ════ LESSON VIEW: Discovery Flow ════ -->
                    <div v-else class="flex-1 flex flex-col md:flex-row">
                        
                        <!-- Visualization (Fixed Left) -->
                        <div class="w-full md:w-[55%] bg-slate-50 border-r border-slate-100 p-8 lg:p-10 flex flex-col">
                            <button @click="view = 'hub'" class="group flex items-center gap-3 text-xs font-black text-slate-400 hover:text-slate-900 transition-all mb-8 uppercase tracking-widest">
                                <PhArrowLeft weight="bold" class="group-hover:-translate-x-1 transition-transform" /> Opdrachtenoverzicht
                            </button>
                            
                            <div class="flex-1 min-h-0 relative">
                                <TheoryQuestScene
                                    :scene="activeLesson.scene"
                                    :rho="rho"
                                    :rho-object="rhoObject"
                                    :vol="vol"
                                    :depth="depth"
                                    :pressureVectorMode="pressureVectorMode"
                                />
                            </div>

                            <!-- Academic Controls -->
                            <div v-if="activeLesson.hasSliders" class="mt-4 p-6 bg-white rounded-[32px] border border-slate-200 shadow-sm relative overflow-visible">
                                <div class="absolute top-0 left-0 w-1.5 h-full bg-amber-500 rounded-l-[32px]"></div>
                                
                                <div class="grid gap-x-10 gap-y-5" :class="activeLesson.hasSliders.length > 1 ? 'grid-cols-2' : 'grid-cols-1'">
                                    
                                    <div v-if="activeLesson.hasSliders.includes('rho')" class="space-y-1">
                                        <div class="flex justify-between items-baseline text-[10px] font-black tracking-widest">
                                            <div class="text-slate-400 uppercase">Dichtheid Fluïdum <span class="normal-case font-medium ml-1" v-html="renderMath('\\(\\rho_{vl}\\)')"></span></div>
                                            <span class="text-slate-900 font-mono text-xs lowercase">{{ rho }} kg/m³</span>
                                        </div>
                                        <input
                                            type="range"
                                            v-model.number="rho"
                                            min="500"
                                            max="2000"
                                            step="50"
                                            class="premium-slider"
                                            :style="sliderFillStyle(rho, 500, 2000)"
                                        />
                                    </div>

                                    <div v-if="activeLesson.hasSliders.includes('rhoObject')" class="space-y-1">
                                        <div class="flex justify-between items-baseline text-[10px] font-black tracking-widest">
                                            <div class="text-slate-400 uppercase">Dichtheid Voorwerp <span class="normal-case font-medium ml-1" v-html="renderMath('\\(\\rho_{vwp}\\)')"></span></div>
                                            <span class="text-slate-900 font-mono text-xs lowercase">{{ rhoObject }} kg/m³</span>
                                        </div>
                                        <input
                                            type="range"
                                            v-model.number="rhoObject"
                                            min="200"
                                            max="2500"
                                            step="50"
                                            class="premium-slider"
                                            :style="sliderFillStyle(rhoObject, 200, 2500)"
                                        />
                                    </div>

                                    <div v-if="activeLesson.hasSliders.includes('vol')" class="space-y-1">
                                        <div class="flex justify-between items-baseline text-[10px] font-black tracking-widest">
                                            <div class="text-slate-400 uppercase">Volume voorwerp <span class="normal-case font-medium ml-1" v-html="renderMath('\\(V\\)')"></span></div>
                                            <span class="text-slate-900 font-mono text-xs lowercase">{{ vol }} cm³</span>
                                        </div>
                                        <input
                                            type="range"
                                            v-model.number="vol"
                                            min="40"
                                            max="160"
                                            step="5"
                                            class="premium-slider"
                                            :style="sliderFillStyle(vol, 40, 160)"
                                        />
                                    </div>

                                    <div v-if="activeLesson.hasSliders.includes('depth')" class="space-y-1">
                                        <div class="flex justify-between items-baseline text-[10px] font-black tracking-widest">
                                            <div class="text-slate-400 uppercase">Diepte <span class="normal-case font-medium ml-1" v-html="renderMath('\\(h\\)')"></span></div>
                                            <span class="text-slate-900 font-mono text-xs lowercase">{{ depth }} cm</span>
                                        </div>
                                        <input
                                            type="range"
                                            v-model.number="depth"
                                            min="10"
                                            max="180"
                                            step="2"
                                            class="premium-slider"
                                            :style="sliderFillStyle(depth, 10, 180)"
                                        />
                                    </div>

                                </div>

                                <div v-if="activeLesson.scene === 'pressure' || activeLesson.scene === 'sandbox'" class="mt-5 pt-4 border-t border-slate-100">
                                    <div class="flex items-center justify-between mb-2 px-1">
                                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visualisatie Model</span>
                                    </div>
                                    <div class="inline-flex w-full rounded-xl bg-slate-100 p-1">
                                        <button
                                            type="button"
                                            @click="pressureVectorMode = 'surface'"
                                            class="flex-1 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                            :class="pressureVectorMode === 'surface' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
                                        >
                                            <div class="w-1.5 h-1.5 rounded-full" :class="pressureVectorMode === 'surface' ? 'bg-amber-500' : 'bg-slate-300'"></div>
                                            Vlakken
                                        </button>
                                        <button
                                            type="button"
                                            @click="pressureVectorMode = 'point'"
                                            class="flex-1 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                            :class="pressureVectorMode === 'point' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
                                        >
                                            <div class="w-1.5 h-1.5 rounded-full" :class="pressureVectorMode === 'point' ? 'bg-amber-500' : 'bg-slate-300'"></div>
                                            Puntmassa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Content (Right) -->
                        <div class="w-full md:w-[45%] p-16 overflow-y-auto custom-scrollbar flex flex-col bg-white">
                            <Transition name="fade-slide" mode="out-in">
                                
                                <!-- PHASE 1: DISCOVER (Observation) -->
                                <div v-if="lessonStep === 'discover'" :key="'d'" class="space-y-10 flex-1 flex flex-col justify-center max-w-md mx-auto">
                                    <div class="inline-flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-full">
                                        <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                        <span class="text-xs font-black text-amber-700 uppercase tracking-widest">Fase 1: Observeren</span>
                                    </div>
                                    <h2 class="text-4xl font-black text-slate-900 leading-tight tracking-tight">{{ activeLesson.title }}</h2>
                                    <p class="text-slate-600 text-xl leading-relaxed font-medium" v-html="renderMath(activeLesson.discovery)"></p>
                                    <div class="pt-8">
                                        <button @click="lessonStep = 'check'" class="px-7 py-3.5 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all flex items-center gap-3 text-base shadow-lg shadow-slate-200">
                                            Ik begrijp dit concept <PhArrowRight weight="bold" />
                                        </button>
                                    </div>
                                </div>

                                <!-- PHASE 2: CHECK (Concept Check) -->
                                <div v-else-if="lessonStep === 'check'" :key="'c'" class="space-y-10 flex-1 flex flex-col justify-center max-w-md mx-auto">
                                    <div class="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 rounded-full">
                                        <PhTarget weight="bold" class="text-indigo-600" />
                                        <span class="text-xs font-black text-indigo-700 uppercase tracking-widest">Fase 2: Inzicht Test</span>
                                    </div>
                                    <h2 class="text-2xl font-bold text-slate-900 leading-snug" v-html="renderMath(activeLesson.question)"></h2>
                                    <div class="space-y-4">
                                        <button 
                                            v-for="opt in activeLesson.options" :key="opt.v"
                                            @click="choice = opt.v; feedback = '';"
                                            :disabled="feedbackType === 'success'"
                                            class="w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-start gap-4 group"
                                            :class="choice === opt.v ? 'border-slate-900 bg-slate-50' : 'border-slate-50 bg-white hover:border-slate-200 disabled:opacity-50'"
                                        >
                                            <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300"
                                                :class="choice === opt.v ? 'bg-slate-900 border-slate-900' : 'border-slate-300 group-hover:border-slate-400'">
                                                <div v-if="choice === opt.v" class="w-2.5 h-2.5 rounded-full bg-white"></div>
                                            </div>
                                            <span class="text-base font-bold text-slate-600 leading-snug group-hover:text-slate-900 transition-colors" v-html="renderMath(opt.t)"></span>
                                        </button>
                                    </div>
                                    
                                    <Transition name="fade-slide">
                                        <div v-if="feedback" :class="['p-6 rounded-2xl border-2 flex gap-5 shadow-sm', 
                                            feedbackType === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800 shadow-emerald-100/50' : 'bg-rose-50 border-rose-100 text-rose-800 shadow-rose-100/50']">
                                            <component :is="feedbackType === 'success' ? PhCheckCircle : PhWarningCircle" weight="fill" class="text-3xl shrink-0" />
                                            <p class="font-bold text-base leading-snug" v-html="renderMath(feedback)"></p>
                                        </div>
                                    </Transition>

                                    <div class="pt-6">
                                        <button 
                                            v-if="feedbackType !== 'success'"
                                            @click="checkAnswer" 
                                            :disabled="!choice" 
                                            class="w-full py-3.5 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 disabled:opacity-20 transition-all text-base shadow-lg shadow-amber-500/20"
                                        >
                                            Bevestig Antwoord
                                        </button>
                                        <button 
                                            v-else
                                            @click="nextStep"
                                            class="w-full py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-slate-200"
                                        >
                                            Doorgaan <PhArrowRight weight="bold" />
                                        </button>
                                    </div>
                                </div>

                                <!-- PHASE 3: TRANSFER (Textbook) -->
                                <div v-else-if="lessonStep === 'transfer'" :key="'t'" class="space-y-12 flex-1 flex flex-col justify-center text-center max-w-md mx-auto">
                                    <div class="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto shadow-xl shadow-emerald-50">
                                        <PhBookOpen weight="fill" class="text-5xl" />
                                    </div>
                                    <div class="space-y-4">
                                        <h2 class="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Actie in Cursus</h2>
                                        <p class="text-slate-400 text-xs font-black tracking-widest uppercase italic">Theorie verankeren</p>
                                    </div>
                                    <div class="bg-slate-50 p-10 rounded-[40px] border border-slate-100 relative">
                                        <div class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">Instructie</div>
                                        <p class="text-slate-800 text-xl leading-relaxed font-medium" v-html="renderMath(activeLesson.transfer)"></p>
                                    </div>
                                    <div class="pt-8">
                                        <button @click="completeLesson" class="w-full py-4 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-emerald-200">
                                            Opdracht Voltooid <PhCheckCircle weight="bold" />
                                        </button>
                                    </div>
                                </div>

                            </Transition>
                        </div>
                    </div>

                </Transition>
            </main>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #f1f5f9; border-radius: 20px; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-slide-enter-from { opacity: 0; transform: translateY(20px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-20px); }

.premium-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 12px;
  border-radius: 9999px;
  cursor: pointer;
  outline: none;
  display: block;
}

.premium-slider:focus-visible {
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
}

.premium-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 5px;
  border-radius: 9999px;
  background: transparent;
}

.premium-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 18px;
  width: 18px;
  border-radius: 9999px;
  background: linear-gradient(180deg, #1e293b, #0f172a);
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 4px 8px rgba(15, 23, 42, 0.2);
  margin-top: -6.5px;
}

.premium-slider::-moz-range-track {
  width: 100%;
  height: 5px;
  border-radius: 9999px;
  background: transparent;
}

.premium-slider::-moz-range-thumb {
  height: 18px;
  width: 18px;
  border-radius: 9999px;
  background: linear-gradient(180deg, #1e293b, #0f172a);
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 4px 8px rgba(15, 23, 42, 0.2);
}
</style>
