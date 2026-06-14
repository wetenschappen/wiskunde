<script setup>
import {
    ref,
    reactive,
    watch,
    computed,
    onMounted,
    onUnmounted,
    nextTick,
    h,
} from "vue";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
    PhX,
    PhCaretLeft,
    PhCaretRight,
    PhFlask,
    PhAtom,
    PhFire,
    PhLightning,
    PhCheckCircle,
    PhPlayCircle,
    PhQuestion,
    PhTestTube,
    PhArrowsOutSimple,
    PhSpeakerHigh,
    PhSpeakerSlash,
    PhScales,
    PhDrop,
    PhFinnTheHuman,
    PhWarning,
    PhLightbulb,
    PhStar,
    PhConfetti,
    PhXCircle,
    PhFlag,
    PhArrowsClockwise,
    PhGlobeHemisphereWest,
    PhTrophy,
    PhFunction,
    PhTriangle,
    PhMedal,
    PhUsers,
    PhBrain,
    PhTarget,
    PhChartLineUp,
    PhWrench,
    PhArrowDown,
    PhTrendDown,
    PhArrowFatDown,
    PhArrowLineDown,
    PhUploadSimple,
    PhBookOpen,
    PhHandPointing,
    PhHourglassLow,
    PhUserFocus,
    PhLink,
    PhCopy,
    PhCheck,
    PhDesktop,
    PhInfo,
    PhNotePencil,
} from "@phosphor-icons/vue";

const props = defineProps({
    isOpen: Boolean,
    slides: {
        type: Array,
        required: true,
    },
    config: {
        type: Object,
        default: () => ({}),
    },
    showDisciplineSlide: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["close", "complete"]);

const currentSlide = ref(0);
const answerRevealed = ref(false);
const revealedSteps = ref(0);
const selectedAnswer = ref(null);
const showConfetti = ref(false);
const transitionName = ref("slide");
const linkCopied = ref(false);

// SCALING LOGIC
const scale = ref(1);
const stageRef = ref(null);
const containerRef = ref(null);
const exerciseScrollRef = ref(null);

function updateScale() {
    if (!containerRef.value) return;
    const parentW = containerRef.value.clientWidth;
    const parentH = containerRef.value.clientHeight;

    // Fit to screen by choosing the smallest scale factor
    const scaleH = parentH / 1080;
    const scaleW = parentW / 1920;
    scale.value = Math.min(scaleH, scaleW);
}

// --- HELPERS ---
function cleanUrl(url) {
    if (!url) return "";
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function getSubjectLabel(subject) {
    const map = {
        physics: "Fysica",
        chemistry: "Chemie",
        science: "Natuurwetenschappen",
    };
    return map[subject] || "Wetenschappen";
}

async function copyLink(url) {
    if (!url) return;
    try {
        await navigator.clipboard.writeText(url);
        linkCopied.value = true;
        setTimeout(() => (linkCopied.value = false), 2000);
    } catch {
        window.open(url, "_blank");
    }
}

// --- DISCIPLINE SLIDE (auto-generated, matches reference design) ---
const disciplineSlide = computed(() => ({
    layout: "discipline",
    cursusLink: props.config?.cursusLink || "",
    rules: props.config?.disciplineRules || [
        {
            icon: "speaker-slash",
            text: 'In <span class="text-brand-orange">stilte</span> binnenkomen en plaatsnemen.',
        },
        {
            icon: "book-open",
            text: '<span class="text-brand-orange">Jassen uit</span>, cursus op de bank, laptop opstarten.',
        },
        {
            icon: "hand-pointing",
            text: '<span class="text-brand-orange">Rust</span> bewaren: praten enkel na hand opsteken en toestemming.',
        },
        {
            icon: "hourglass",
            text: 'Samen werken van de eerste tot de <span class="text-brand-orange">laatste minuut</span>.',
        },
    ],
}));

// --- SLIDES (with conditionally injected discipline slide) ---
const parsedCursusLink = computed(() => {
    const link = props.config?.cursusLink || "albertshalaj.github.io/c3nw";
    try {
        const u = new URL(link.startsWith("http") ? link : "https://" + link);
        return {
            domain: u.hostname,
            path: u.pathname !== "/" ? u.pathname : "",
        };
    } catch {
        const parts = link.split("/");
        if (parts.length > 1)
            return { domain: parts[0], path: "/" + parts.slice(1).join("/") };
        return {
            domain: "albertshalaj.github.io",
            path: link.startsWith("/") ? link : "/" + link,
        };
    }
});

const slidesCopy = computed(() => {
    if (!props.slides) return [];
    const processedSlides = props.slides.map((slide) => {
        if (slide.layout === "recap" && slide.questions) {
            return {
                ...processSlides(slide),
                questions: slide.questions.map((q) =>
                    reactive({ ...processSlides(q), revealed: false }),
                ),
            };
        }
        return processSlides(slide);
    });
    // Only prepend discipline slide for first/default deck
    if (props.showDisciplineSlide && props.config) {
        return [processSlides(disciplineSlide.value), ...processedSlides];
    }
    return processedSlides;
});

const slides = computed(() => slidesCopy.value);
const totalSlides = computed(() => slides.value.length);
const progressPercentage = computed(
    () => ((currentSlide.value + 1) / totalSlides.value) * 100,
);

function nextSlide() {
    if (currentSlide.value < totalSlides.value - 1) {
        transitionName.value = "slide";
        currentSlide.value++;
        answerRevealed.value = false;
        revealedSteps.value = 0;
        selectedAnswer.value = null;
    }
}

function advancePresentation() {
    const slide = slides.value[currentSlide.value];
    if (
        slide &&
        (slide.layout === "steps" ||
            slide.layout === "recap" ||
            slide.layout === "exercise-cycle") &&
        slide.steps &&
        revealedSteps.value < slide.steps.length
    ) {
        revealNextStep(slide.steps.length);
    } else if (
        slide &&
        slide.layout === "predict" &&
        slide.revealText &&
        !answerRevealed.value
    ) {
        answerRevealed.value = true;
    } else {
        nextSlide();
    }
}

function prevSlide() {
    const slide = slides.value[currentSlide.value];
    if (
        revealedSteps.value > 0 &&
        slide &&
        (slide.layout === "steps" ||
            slide.layout === "recap" ||
            slide.layout === "exercise-cycle")
    ) {
        reverseStep();
    } else if (currentSlide.value > 0) {
        transitionName.value = "slide-back";
        currentSlide.value--;
        answerRevealed.value = false;
        revealedSteps.value = 0;
        selectedAnswer.value = null;
    }
}

function revealNextStep(maxSteps) {
    if (revealedSteps.value < maxSteps) {
        revealedSteps.value++;
        nextTick(() => {
            const container = exerciseScrollRef.value;
            if (!container) return;
            // Use scrollTop directly — scrollIntoView fails inside CSS-scaled containers
            const items = container.querySelectorAll(".exercise-step");
            const item = items[revealedSteps.value - 1];
            if (item) {
                // offsetTop is relative to offsetParent; walk up to find offset relative to container
                let offset = 0;
                let el = item;
                while (el && el !== container) {
                    offset += el.offsetTop;
                    el = el.offsetParent;
                }
                const targetTop =
                    offset + item.offsetHeight - container.clientHeight + 24;
                container.scrollTo({
                    top: Math.max(0, targetTop),
                    behavior: "smooth",
                });
            }
        });
    }
}

function reverseStep() {
    if (revealedSteps.value > 0) {
        revealedSteps.value--;
        nextTick(() => {
            const container = exerciseScrollRef.value;
            if (!container) return;
            const items = container.querySelectorAll(".exercise-step");
            const item = items[revealedSteps.value - 1];
            if (item) {
                let offset = 0;
                let el = item;
                while (el && el !== container) {
                    offset += el.offsetTop;
                    el = el.offsetParent;
                }
                container.scrollTo({
                    top: Math.max(0, offset - 16),
                    behavior: "smooth",
                });
            }
        });
    }
}

function selectAnswer(option) {
    selectedAnswer.value = option.id;
    if (option.correct) {
        showConfetti.value = true;
        setTimeout(() => (showConfetti.value = false), 2000);
    }
}

function finish() {
    emit("complete");
    emit("close");
}

watch(
    () => props.isOpen,
    (val) => {
        if (!val) {
            if (document.fullscreenElement)
                document.exitFullscreen().catch((e) => {});
            setTimeout(() => {
                currentSlide.value = 0;
                answerRevealed.value = false;
                revealedSteps.value = 0;
                selectedAnswer.value = null;
                linkCopied.value = false;
            }, 500);
            window.removeEventListener("resize", updateScale);
            window.removeEventListener("keydown", handleKeydown);
        } else {
            window.addEventListener("keydown", handleKeydown);
            window.addEventListener("resize", updateScale);
            nextTick(() => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch((e) => {
                        console.log("Fullscreen request denied:", e);
                    });
                }
                updateScale();
            });
        }
    },
);

// Keyboard navigation
function handleKeydown(e) {
    if (!props.isOpen) return;
    if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

    if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        const slide = slides.value[currentSlide.value];
        if (
            slide &&
            (slide.layout === "steps" ||
                slide.layout === "exercise" ||
                slide.layout === "exercise-cycle") &&
            slide.steps &&
            revealedSteps.value < slide.steps.length
        ) {
            revealNextStep(slide.steps.length);
        }
        return;
    }

    if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        const slide = slides.value[currentSlide.value];
        if (
            slide &&
            (slide.layout === "steps" ||
                slide.layout === "exercise" ||
                slide.layout === "exercise-cycle") &&
            slide.steps &&
            revealedSteps.value > 0
        ) {
            reverseStep();
        }
        return;
    }

    if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        advancePresentation();
    }
    if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
    }
}

const handleFullscreenChange = () => {
    if (props.isOpen && !document.fullscreenElement) {
        emit("close");
    }
};

onMounted(() => {
    window.addEventListener("resize", updateScale);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    window.removeEventListener("resize", updateScale);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
});

const iconMap = {
    fire: PhFire,
    drop: PhDrop,
    atom: PhAtom,
    flask: PhFlask,
    scales: PhScales,
    lightbulb: PhLightbulb,
    star: PhStar,
    check: PhCheckCircle,
    x: PhXCircle,
    lightning: PhLightning,
    function: PhFunction,
    triangle: PhTriangle,
    users: PhUsers,
    brain: PhBrain,
    target: PhTarget,
    "presentation-chart": PhChartLineUp,
    wrench: PhWrench,
    globe: PhGlobeHemisphereWest,
    "arrow-down": PhArrowDown,
    "trend-down": PhTrendDown,
    "arrow-fat-down": PhArrowFatDown,
    "arrow-line-down": PhArrowLineDown,
    "arrow-from-surface": (props) =>
        h(PhUploadSimple, { ...props, style: "transform: scaleY(-1)" }),
    "upload-simple": PhUploadSimple,
    "book-open": PhBookOpen,
    "hand-pointing": PhHandPointing,
    hourglass: PhHourglassLow,
    "user-focus": PhUserFocus,
    "speaker-slash": PhSpeakerSlash,
    info: PhInfo,
};

function resolveImageUrl(url) {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const baseUrl = import.meta.env.BASE_URL || "/";
    let normalizedUrl = url;
    if (normalizedUrl.startsWith("./"))
        normalizedUrl = normalizedUrl.substring(2);
    if (normalizedUrl.startsWith("/"))
        normalizedUrl = normalizedUrl.substring(1);
    return baseUrl.endsWith("/")
        ? baseUrl + normalizedUrl
        : baseUrl + "/" + normalizedUrl;
}

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

function kAll(str) {
    if (typeof str !== "string") return str;
    return k(str);
}

function getPartItems(part) {
    if (part.items) return part.items.map((i) => k(i));
    const items = [];
    if (part.meaning) items.push(k(part.meaning));
    if (part.unit) items.push(k(part.unit));
    return items;
}

function processSlides(obj) {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(processSlides);
    if (typeof obj === "object") {
        const result = {};
        for (const key of Object.keys(obj)) {
            result[key] = processSlides(obj[key]);
        }
        return result;
    }
    if (typeof obj === "string") return k(obj);
    return obj;
}
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div
                v-if="isOpen"
                class="fixed inset-0 z-[9999] bg-slate-900 text-slate-900 flex flex-col font-sans overflow-hidden w-screen h-screen"
            >
                <!-- Success Popup - Simplified -->
                <div
                    v-if="showConfetti"
                    class="fixed inset-0 z-[150] pointer-events-none flex items-center justify-center bg-black/30"
                >
                    <div
                        class="bg-white px-12 py-8 rounded-2xl shadow-2xl flex items-center gap-6 animate-[fadeInUp_0.3s_ease-out]"
                    >
                        <div
                            class="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center"
                        >
                            <PhCheck
                                weight="bold"
                                class="text-4xl text-white"
                            />
                        </div>
                        <span class="text-4xl font-bold text-slate-800"
                            >Correct!</span
                        >
                    </div>
                </div>

                <div
                    ref="containerRef"
                    class="slide-viewport"
                    style="padding-bottom: 48px"
                >
                    <div
                        ref="stageRef"
                        class="ppt-stage"
                        :style="{ transform: `scale(${scale})` }"
                    >
                        <Transition :name="transitionName">
                            <div
                                :key="currentSlide"
                                class="absolute inset-0 w-full h-full"
                            >
                                <div class="w-full h-full relative">
                                    <!-- DISCIPLINE SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'discipline'
                                        "
                                        class="absolute inset-0 bg-white flex flex-col"
                                    >
                                        <!-- Header -->
                                        <div
                                            class="h-[100px] bg-brand-dark flex items-center px-16"
                                        >
                                            <h2
                                                class="text-[3rem] font-bold text-white tracking-tight mt-4"
                                            >
                                                Welkom &amp; Opstart
                                            </h2>
                                        </div>

                                        <!-- Main Content Area -->
                                        <div class="flex-1 flex flex-col">
                                            <!-- Rules Grid - Compact cards in top half -->
                                            <div class="p-12 pb-6">
                                                <div
                                                    class="grid grid-cols-4 gap-6"
                                                >
                                                    <div
                                                        v-for="(
                                                            rule, idx
                                                        ) in slides[
                                                            currentSlide
                                                        ].rules"
                                                        :key="idx"
                                                        class="flex flex-col items-center text-center p-6 h-[260px] border border-slate-200 rounded-2xl bg-slate-50 hover:border-brand-orange hover:shadow-lg transition-all duration-300"
                                                    >
                                                        <div
                                                            class="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center mb-4 shadow-sm"
                                                        >
                                                            <component
                                                                :is="
                                                                    iconMap[
                                                                        rule
                                                                            .icon
                                                                    ]
                                                                "
                                                                class="text-[4rem] text-brand-dark"
                                                                weight="fill"
                                                            />
                                                        </div>
                                                        <p
                                                            class="text-[1.5rem] leading-relaxed font-medium text-slate-700 discipline-rule"
                                                            v-html="rule.text"
                                                        ></p>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Course Link Section - LARGE bottom half for visibility -->
                                            <div
                                                v-if="
                                                    slides[currentSlide]
                                                        .cursusLink
                                                "
                                                class="flex-1 flex flex-col items-center justify-center p-8 bg-slate-100 border-t-4 border-brand-orange"
                                            >
                                                <p
                                                    class="text-[1.8rem] text-slate-500 mb-4 uppercase tracking-widest font-semibold"
                                                >
                                                    Deze les is raadpleegbaar op
                                                </p>
                                                <div
                                                    class="flex items-center gap-6 bg-white px-16 py-8 rounded-2xl shadow-xl border-2 border-slate-200"
                                                >
                                                    <PhDesktop
                                                        weight="duotone"
                                                        class="text-[4rem] text-brand-orange"
                                                    />
                                                    <p
                                                        class="font-mono tracking-wider"
                                                        :style="{
                                                            fontSize:
                                                                Math.max(
                                                                    2.2,
                                                                    4.5 -
                                                                        (parsedCursusLink
                                                                            .domain
                                                                            .length +
                                                                            (parsedCursusLink
                                                                                .path
                                                                                ?.length ||
                                                                                0)) /
                                                                            20,
                                                                ) + 'rem',
                                                        }"
                                                    >
                                                        <span
                                                            class="text-slate-700"
                                                            >{{
                                                                parsedCursusLink.domain
                                                            }}</span
                                                        >
                                                        <span
                                                            v-if="
                                                                parsedCursusLink.path
                                                            "
                                                            class="font-bold text-brand-orange"
                                                            >{{
                                                                parsedCursusLink.path
                                                            }}</span
                                                        >
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- TITLE SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'title'
                                        "
                                        class="absolute inset-0 bg-brand-dark text-white flex flex-col"
                                    >
                                        <!-- Top Bar with Logo/Icon -->
                                        <div
                                            class="h-[100px] flex items-center px-16 border-b border-white/10"
                                        >
                                            <div
                                                class="w-12 h-12 bg-brand-orange rounded-lg flex items-center justify-center mt-4"
                                            >
                                                <PhFlask
                                                    weight="fill"
                                                    class="text-[1.8rem] text-white"
                                                />
                                            </div>
                                        </div>

                                        <!-- Main Content - Left Aligned, with top padding to lower content -->
                                        <div
                                            class="flex-1 flex flex-col justify-start pt-20 px-20"
                                        >
                                            <h2
                                                class="text-[5rem] font-bold mb-8 tracking-tight leading-tight"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h2>
                                            <p
                                                class="text-[2.2rem] text-brand-orange max-w-4xl leading-relaxed font-light mb-12"
                                                v-html="
                                                    slides[currentSlide]
                                                        .subtitle
                                                "
                                            ></p>

                                            <div
                                                v-if="
                                                    slides[currentSlide].badge
                                                "
                                                class="inline-block"
                                            >
                                                <span
                                                    class="px-6 py-3 bg-brand-orange text-white rounded-lg text-[1.4rem] font-bold tracking-wider uppercase"
                                                    >{{
                                                        slides[currentSlide]
                                                            .badge
                                                    }}</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Bottom Accent Line -->
                                        <div class="h-2 bg-brand-orange"></div>
                                    </div>

                                    <!-- HERO SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'hero'
                                        "
                                        class="absolute inset-0 w-full h-full bg-slate-900 flex flex-col"
                                    >
                                        <div class="flex-1 relative">
                                            <img
                                                :src="
                                                    resolveImageUrl(
                                                        slides[currentSlide]
                                                            .image,
                                                    )
                                                "
                                                class="w-full h-full object-cover opacity-60"
                                            />
                                            <div
                                                class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"
                                            ></div>
                                            <div
                                                class="absolute bottom-24 left-16 right-16 text-white"
                                            >
                                                <h2
                                                    class="text-[4rem] leading-tight font-bold mb-6"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .title
                                                    "
                                                ></h2>
                                                <p
                                                    class="text-[2rem] text-brand-orange max-w-4xl leading-relaxed"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .subtitle
                                                    "
                                                ></p>
                                            </div>
                                        </div>
                                        <div
                                            v-if="slides[currentSlide].credit"
                                            class="h-12 bg-slate-900 flex items-center px-6"
                                        >
                                            <span
                                                class="text-white/40 text-[1.2rem]"
                                                >Afbeelding:
                                                {{
                                                    slides[currentSlide].credit
                                                }}</span
                                            >
                                        </div>
                                    </div>

                                    <!-- STANDARD/CONTENT SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'standard'
                                        "
                                        class="w-full h-full flex flex-col bg-white"
                                    >
                                        <!-- Header Bar -->
                                        <div
                                            class="h-[100px] bg-brand-dark flex items-center px-16 border-b-4 border-brand-orange"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhInfo
                                                    class="text-[2rem] text-brand-orange"
                                                    weight="fill"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >Uitleg</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Slide Title -->
                                        <div class="px-16 pt-8 pb-4">
                                            <h2
                                                class="text-[3rem] font-bold text-slate-800 leading-tight"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h2>
                                        </div>

                                        <!-- Content Area -->
                                        <div
                                            class="flex-1 px-16 pb-12 overflow-hidden"
                                        >
                                            <div
                                                class="h-full bg-slate-50 rounded-xl border border-slate-200 p-10 overflow-y-auto exercise-scroll"
                                            >
                                                <div
                                                    class="text-[1.8rem] leading-[1.6] text-slate-700"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .content ||
                                                        slides[currentSlide]
                                                            .text
                                                    "
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- STEPS SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'steps'
                                        "
                                        class="w-full h-full flex flex-col bg-white overflow-hidden"
                                    >
                                        <!-- Header Bar -->
                                        <div
                                            class="h-[100px] bg-brand-dark flex items-center px-16 border-b-4 border-brand-orange"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhBookOpen
                                                    weight="fill"
                                                    class="text-[2rem] text-brand-orange"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >Samenvatting</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Slide Title -->
                                        <div class="px-16 pt-6 pb-4">
                                            <h3
                                                class="text-[2.8rem] font-bold text-slate-800 tracking-tight leading-tight"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h3>
                                        </div>

                                        <!-- Steps Grid -->
                                        <div
                                            class="flex-1 px-16 pb-8 overflow-hidden"
                                        >
                                            <div
                                                class="h-full grid gap-6"
                                                :class="
                                                    slides[currentSlide].steps
                                                        .length > 4
                                                        ? 'grid-cols-3'
                                                        : 'grid-cols-2'
                                                "
                                            >
                                                <div
                                                    v-for="(
                                                        step, idx
                                                    ) in slides[currentSlide]
                                                        .steps"
                                                    :key="idx"
                                                    class="flex items-start gap-5 p-6 border-2 rounded-xl transition-all duration-500"
                                                    :class="
                                                        idx < revealedSteps
                                                            ? 'border-brand-orange bg-orange-50 opacity-100'
                                                            : 'border-slate-200 bg-slate-50 opacity-40'
                                                    "
                                                >
                                                    <!-- Step Icon or Number -->
                                                    <div
                                                        class="w-12 h-12 bg-slate-800 text-white rounded-lg flex items-center justify-center text-[1.8rem] font-bold shrink-0"
                                                    >
                                                        <component
                                                            v-if="step.icon"
                                                            :is="
                                                                iconMap[
                                                                    step.icon
                                                                ] || PhInfo
                                                            "
                                                            weight="fill"
                                                            class="text-[2rem]"
                                                        />
                                                        <span v-else>{{
                                                            idx + 1
                                                        }}</span>
                                                    </div>

                                                    <!-- Step Text -->
                                                    <div>
                                                        <p
                                                            class="text-[1.4rem] font-bold text-slate-800 mb-2"
                                                            v-html="step.title"
                                                        ></p>
                                                        <p
                                                            class="text-[1.4rem] font-medium text-slate-600 leading-relaxed"
                                                            v-html="
                                                                step.content
                                                            "
                                                        ></p>
                                                    </div>
                                                </div>

                                                <!-- Side Image or Custom HTML in empty grid cell -->
                                                <div
                                                    v-if="
                                                        slides[currentSlide]
                                                            .image
                                                    "
                                                    class="rounded-xl overflow-hidden flex items-center justify-center bg-slate-50"
                                                >
                                                    <img
                                                        :src="
                                                            resolveImageUrl(
                                                                slides[
                                                                    currentSlide
                                                                ].image,
                                                            )
                                                        "
                                                        class="max-w-full max-h-full object-contain"
                                                    />
                                                </div>
                                                <div
                                                    v-else-if="
                                                        slides[currentSlide]
                                                            .customHtml
                                                    "
                                                    class="rounded-xl overflow-hidden flex items-center justify-center bg-slate-50 p-4"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .customHtml
                                                    "
                                                ></div>
                                            </div>
                                        </div>

                                        <!-- Progress Indicator -->
                                        <div class="px-16 pb-6">
                                            <div
                                                class="flex items-center gap-3"
                                            >
                                                <div
                                                    v-for="(
                                                        step, idx
                                                    ) in slides[currentSlide]
                                                        .steps"
                                                    :key="idx"
                                                    class="h-2 flex-1 rounded-full transition-colors duration-300"
                                                    :class="
                                                        idx < revealedSteps
                                                            ? 'bg-brand-orange'
                                                            : 'bg-slate-200'
                                                    "
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- EXERCISE SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'exercise'
                                        "
                                        class="w-full h-full flex flex-col bg-white"
                                    >
                                        <!-- Header Bar -->
                                        <div
                                            class="h-[100px] bg-brand-orange flex items-center px-16"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhNotePencil
                                                    weight="fill"
                                                    class="text-[2rem] text-white"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white uppercase tracking-wider"
                                                    >Opdracht</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Title Area -->
                                        <div
                                            class="px-16 pt-6 pb-4 border-b border-slate-200"
                                        >
                                            <h3
                                                class="text-[2.5rem] font-bold text-slate-800 tracking-tight leading-tight"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h3>
                                        </div>

                                        <!-- Context (if exists) -->
                                        <div
                                            v-if="slides[currentSlide].context"
                                            class="px-16 py-4 bg-slate-50 border-b border-slate-200"
                                        >
                                            <p
                                                class="text-[1.6rem] text-slate-600 leading-relaxed"
                                                v-html="
                                                    slides[currentSlide].context
                                                "
                                            ></p>
                                        </div>

                                        <!-- Exercise Steps -->
                                        <div
                                            ref="exerciseScrollRef"
                                            class="flex-1 px-16 py-6 overflow-y-scroll exercise-scroll"
                                        >
                                            <div class="space-y-4">
                                                <div
                                                    v-for="(
                                                        step, idx
                                                    ) in slides[currentSlide]
                                                        .steps"
                                                    :key="idx"
                                                    class="exercise-step rounded-lg border-l-4 bg-white overflow-hidden transition-all duration-300 border border-slate-200"
                                                    :class="
                                                        idx < revealedSteps
                                                            ? 'border-l-brand-orange shadow-md'
                                                            : 'border-l-slate-300 opacity-70'
                                                    "
                                                >
                                                    <!-- Question -->
                                                    <div
                                                        class="px-6 py-4 text-[1.6rem] text-slate-700 font-medium"
                                                        v-html="step.question"
                                                    ></div>

                                                    <!-- Answer (revealed) -->
                                                    <div
                                                        v-if="
                                                            idx < revealedSteps
                                                        "
                                                        class="px-6 py-4 bg-orange-50 border-t border-orange-100 text-[1.6rem] font-semibold text-slate-800 animate-[fadeInUp_0.3s_ease-out]"
                                                    >
                                                        <span
                                                            class="text-brand-orange mr-2"
                                                            >Antwoord:</span
                                                        >
                                                        <span
                                                            v-html="step.answer"
                                                        ></span>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Footer (inside scroll, always reachable) -->
                                            <div
                                                class="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between"
                                            >
                                                <div
                                                    v-if="
                                                        revealedSteps >=
                                                        slides[currentSlide]
                                                            .steps.length
                                                    "
                                                    class="flex items-center gap-2 text-emerald-600 font-bold"
                                                >
                                                    <PhCheckCircle
                                                        weight="fill"
                                                        class="text-xl"
                                                    />
                                                    <span class="text-[1.4rem]"
                                                        >Alle stappen
                                                        onthuld</span
                                                    >
                                                </div>
                                                <div
                                                    v-else
                                                    class="text-slate-400 text-[1.4rem]"
                                                >
                                                    Druk op 'S' om de volgende
                                                    stap te onthullen
                                                </div>
                                                <div
                                                    class="flex items-center gap-2"
                                                >
                                                    <div
                                                        v-for="(
                                                            step, idx
                                                        ) in slides[
                                                            currentSlide
                                                        ].steps"
                                                        :key="idx"
                                                        class="w-3 h-3 rounded-full transition-colors duration-300"
                                                        :class="
                                                            idx < revealedSteps
                                                                ? 'bg-brand-orange'
                                                                : 'bg-slate-300'
                                                        "
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- EQUATION SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'equation'
                                        "
                                        class="w-full h-full flex flex-col bg-white"
                                    >
                                        <!-- Header -->
                                        <div
                                            class="h-[100px] bg-brand-dark flex items-center px-16 border-b-4 border-brand-orange"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhFunction
                                                    weight="fill"
                                                    class="text-[2rem] text-brand-orange"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >Formule</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Title -->
                                        <div class="px-16 pt-6 pb-4">
                                            <h3
                                                class="text-[2rem] font-bold text-slate-500 tracking-wider uppercase"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h3>
                                        </div>

                                        <!-- Equation Box -->
                                        <div class="px-16 pb-6">
                                            <div
                                                class="equation-formula bg-slate-900 rounded-xl p-8 text-center"
                                            >
                                                <p
                                                    class="font-mono font-bold text-white tracking-wider"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .equation
                                                    "
                                                ></p>
                                            </div>
                                        </div>

                                        <!-- Parts Explanation -->
                                        <div
                                            class="px-16 pb-8 grid gap-6 content-start auto-rows-min"
                                            :class="
                                                (
                                                    slides[currentSlide]
                                                        .parts ||
                                                    slides[currentSlide]
                                                        .variables ||
                                                    []
                                                ).length > 2
                                                    ? 'grid-cols-3'
                                                    : 'grid-cols-2'
                                            "
                                        >
                                            <div
                                                v-for="(part, idx) in slides[
                                                    currentSlide
                                                ].parts ||
                                                slides[currentSlide]
                                                    .variables ||
                                                []"
                                                :key="idx"
                                                class="bg-slate-50 rounded-xl border-l-4 p-5 self-start"
                                                :class="
                                                    part.color === 'violet'
                                                        ? 'border-l-slate-800'
                                                        : 'border-l-brand-orange'
                                                "
                                            >
                                                <h4
                                                    class="text-[1.8rem] font-bold mb-4"
                                                    :class="
                                                        part.color === 'violet'
                                                            ? 'text-slate-800'
                                                            : 'text-brand-orange'
                                                    "
                                                    v-html="
                                                        part.symbol ||
                                                        part.label
                                                    "
                                                ></h4>
                                                <ul class="space-y-2">
                                                    <li
                                                        v-for="(
                                                            item, itemIdx
                                                        ) in getPartItems(part)"
                                                        :key="itemIdx"
                                                        class="text-[1.4rem] text-slate-600 flex items-start gap-2"
                                                    >
                                                        <span
                                                            class="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                                                            :class="
                                                                part.color ===
                                                                'violet'
                                                                    ? 'bg-slate-400'
                                                                    : 'bg-brand-orange'
                                                            "
                                                        ></span>
                                                        <span
                                                            v-html="item"
                                                        ></span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- COMPARISON SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'comparison'
                                        "
                                        class="w-full h-full flex flex-col bg-white overflow-hidden"
                                    >
                                        <!-- Header Bar -->
                                        <div
                                            class="h-[100px] shrink-0 bg-brand-dark flex items-center px-16 border-b-4 border-brand-orange"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhScales
                                                    class="text-[2rem] text-brand-orange"
                                                    weight="fill"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >Vergelijking</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Title -->
                                        <div class="px-16 pt-6 pb-4 shrink-0">
                                            <h2
                                                class="text-[2.5rem] font-bold text-slate-800 leading-tight"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h2>
                                        </div>

                                        <!-- Comparison Cards -->
                                        <div
                                            class="flex-1 px-16 pb-8 grid grid-cols-2 gap-8 overflow-hidden"
                                        >
                                            <!-- Left Card -->
                                            <div
                                                class="bg-white border-2 border-slate-200 rounded-xl p-8 flex flex-col overflow-hidden"
                                            >
                                                <div
                                                    class="flex items-center gap-4 mb-6 pb-4 border-b-2 border-slate-100 shrink-0"
                                                >
                                                    <div
                                                        class="w-12 h-12 bg-brand-dark rounded-lg flex items-center justify-center shrink-0"
                                                    >
                                                        <component
                                                            :is="
                                                                iconMap[
                                                                    slides[
                                                                        currentSlide
                                                                    ].left?.icon
                                                                ] || PhInfo
                                                            "
                                                            class="text-[1.8rem] text-white"
                                                            weight="fill"
                                                        />
                                                    </div>
                                                    <h4
                                                        class="text-[1.8rem] font-bold text-slate-800"
                                                        v-html="
                                                            slides[currentSlide]
                                                                .left?.title ||
                                                            slides[currentSlide]
                                                                .leftTitle
                                                        "
                                                    ></h4>
                                                </div>
                                                <p
                                                    class="text-[1.6rem] leading-relaxed text-slate-600 mb-4 flex-shrink-0"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .left?.content ||
                                                        slides[currentSlide]
                                                            .leftContent
                                                    "
                                                ></p>
                                                <div
                                                    v-if="
                                                        slides[currentSlide]
                                                            .left?.example ||
                                                        slides[currentSlide]
                                                            .leftExample
                                                    "
                                                    class="shrink-0"
                                                >
                                                    <p
                                                        class="text-[1.2rem] font-bold text-slate-400 uppercase tracking-wider mb-2"
                                                    >
                                                        Voorbeeld
                                                    </p>
                                                    <div
                                                        class="bg-slate-50 p-4 rounded-lg font-mono text-[1.4rem] text-slate-700"
                                                        v-html="
                                                            slides[currentSlide]
                                                                .left
                                                                ?.example ||
                                                            slides[currentSlide]
                                                                .leftExample
                                                        "
                                                    ></div>
                                                </div>
                                                <div
                                                    v-if="
                                                        slides[currentSlide]
                                                            .left?.image
                                                    "
                                                    class="mt-auto pt-4 shrink-0"
                                                >
                                                    <img
                                                        :src="
                                                            resolveImageUrl(
                                                                slides[
                                                                    currentSlide
                                                                ].left.image,
                                                            )
                                                        "
                                                        class="w-full rounded-lg border border-slate-200 max-h-[180px] object-contain"
                                                    />
                                                </div>
                                                <div
                                                    v-else-if="
                                                        slides[currentSlide]
                                                            .left?.customHtml
                                                    "
                                                    class="mt-auto pt-4 shrink-0"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .left.customHtml
                                                    "
                                                ></div>
                                            </div>

                                            <!-- Right Card -->
                                            <div
                                                class="bg-white border-2 border-brand-orange rounded-xl p-8 flex flex-col overflow-hidden"
                                            >
                                                <div
                                                    class="flex items-center gap-4 mb-6 pb-4 border-b-2 border-orange-100 shrink-0"
                                                >
                                                    <div
                                                        class="w-12 h-12 bg-brand-orange rounded-lg flex items-center justify-center shrink-0"
                                                    >
                                                        <component
                                                            :is="
                                                                iconMap[
                                                                    slides[
                                                                        currentSlide
                                                                    ].right
                                                                        ?.icon
                                                                ] || PhLightning
                                                            "
                                                            class="text-[1.8rem] text-white"
                                                            weight="fill"
                                                        />
                                                    </div>
                                                    <h4
                                                        class="text-[1.8rem] font-bold text-brand-orange"
                                                        v-html="
                                                            slides[currentSlide]
                                                                .right?.title ||
                                                            slides[currentSlide]
                                                                .rightTitle
                                                        "
                                                    ></h4>
                                                </div>
                                                <p
                                                    class="text-[1.6rem] leading-relaxed text-slate-600 mb-4 flex-shrink-0"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .right?.content ||
                                                        slides[currentSlide]
                                                            .rightContent
                                                    "
                                                ></p>
                                                <div
                                                    v-if="
                                                        slides[currentSlide]
                                                            .right?.example ||
                                                        slides[currentSlide]
                                                            .rightExample
                                                    "
                                                    class="shrink-0"
                                                >
                                                    <p
                                                        class="text-[1.2rem] font-bold text-orange-300 uppercase tracking-wider mb-2"
                                                    >
                                                        Voorbeeld
                                                    </p>
                                                    <div
                                                        class="bg-orange-50 p-4 rounded-lg font-mono text-[1.4rem] text-brand-orange"
                                                        v-html="
                                                            slides[currentSlide]
                                                                .right
                                                                ?.example ||
                                                            slides[currentSlide]
                                                                .rightExample
                                                        "
                                                    ></div>
                                                </div>
                                                <div
                                                    v-if="
                                                        slides[currentSlide]
                                                            .right?.image
                                                    "
                                                    class="mt-auto pt-4 shrink-0"
                                                >
                                                    <img
                                                        :src="
                                                            resolveImageUrl(
                                                                slides[
                                                                    currentSlide
                                                                ].right.image,
                                                            )
                                                        "
                                                        class="w-full rounded-lg border border-orange-200 max-h-[180px] object-contain"
                                                    />
                                                </div>
                                                <div
                                                    v-else-if="
                                                        slides[currentSlide]
                                                            .right?.customHtml
                                                    "
                                                    class="mt-auto pt-4 shrink-0"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .right.customHtml
                                                    "
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- SPLIT SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'split'
                                        "
                                        class="w-full h-full flex flex-col bg-white"
                                    >
                                        <!-- Header -->
                                        <div
                                            class="h-[100px] bg-brand-dark flex items-center px-16 border-b-4 border-brand-orange"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhInfo
                                                    weight="fill"
                                                    class="text-[2rem] text-brand-orange"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >Uitleg</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Content Grid -->
                                        <div
                                            class="flex-1 grid grid-cols-2 gap-8 p-8"
                                        >
                                            <!-- Text Side -->
                                            <div class="flex flex-col">
                                                <h3
                                                    class="text-[2.2rem] font-bold text-slate-800 mb-6 leading-tight"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .title
                                                    "
                                                ></h3>
                                                <div
                                                    class="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-6 overflow-y-auto exercise-scroll"
                                                >
                                                    <div
                                                        class="text-[1.6rem] leading-relaxed text-slate-700"
                                                        v-html="
                                                            slides[currentSlide]
                                                                .content ||
                                                            slides[currentSlide]
                                                                .text
                                                        "
                                                    ></div>
                                                </div>
                                            </div>

                                            <!-- Image Side -->
                                            <div
                                                class="relative h-full rounded-xl overflow-hidden border border-slate-200"
                                            >
                                                <img
                                                    :src="
                                                        resolveImageUrl(
                                                            slides[currentSlide]
                                                                .image,
                                                        )
                                                    "
                                                    class="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <!-- IMAGE-GRID SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'image-grid'
                                        "
                                        class="w-full h-full flex flex-col bg-white"
                                    >
                                        <!-- Header -->
                                        <div
                                            class="h-[100px] bg-brand-dark flex items-center px-16 border-b-4 border-brand-orange"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhInfo
                                                    weight="fill"
                                                    class="text-[2rem] text-brand-orange"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >Afbeeldingen</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Title -->
                                        <div class="px-16 pt-6 pb-4">
                                            <h3
                                                class="text-[2.5rem] font-bold text-slate-800 tracking-tight leading-tight"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h3>
                                        </div>

                                        <!-- Image Grid -->
                                        <div
                                            class="flex-1 px-16 pb-8 grid grid-cols-2 gap-8"
                                        >
                                            <div
                                                v-for="(img, idx) in slides[
                                                    currentSlide
                                                ].images"
                                                :key="idx"
                                                class="flex flex-col"
                                            >
                                                <div
                                                    class="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center"
                                                >
                                                    <img
                                                        :src="
                                                            resolveImageUrl(
                                                                img.src,
                                                            )
                                                        "
                                                        class="max-w-full max-h-full object-contain p-4"
                                                    />
                                                </div>
                                                <p
                                                    class="mt-3 text-center text-[1.4rem] text-slate-600 font-medium bg-slate-50 rounded-lg py-2 px-4"
                                                    v-html="img.caption"
                                                ></p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- BIG SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'big'
                                        "
                                        class="absolute inset-0 bg-brand-dark text-white flex flex-col items-center justify-start text-center p-16 pt-32"
                                    >
                                        <h3
                                            class="text-[2rem] font-bold text-white/40 mb-8 tracking-wider uppercase"
                                            v-html="slides[currentSlide].title"
                                        ></h3>
                                        <div
                                            class="font-bold text-white mb-8 tracking-tight leading-tight"
                                            :style="{
                                                fontSize:
                                                    slides[currentSlide].content
                                                        ?.length > 20
                                                        ? '5rem'
                                                        : '8rem',
                                            }"
                                            v-html="
                                                slides[currentSlide].content
                                            "
                                        ></div>
                                        <p
                                            class="text-[2.5rem] text-brand-orange font-semibold"
                                            v-html="
                                                slides[currentSlide].subtext
                                            "
                                        ></p>
                                    </div>

                                    <!-- MULTICHOICE SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'multichoice'
                                        "
                                        class="w-full h-full flex flex-col bg-white"
                                    >
                                        <!-- Header Bar -->
                                        <div
                                            class="h-[100px] bg-brand-dark flex items-center px-16 border-b-4 border-brand-orange"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhQuestion
                                                    weight="fill"
                                                    class="text-[2rem] text-brand-orange"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >Quiz</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Title & Question -->
                                        <div class="px-16 pt-6 pb-4">
                                            <h3
                                                class="text-[2.5rem] font-bold text-slate-800 tracking-tight leading-tight mb-4"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h3>
                                            <p
                                                class="text-[1.8rem] text-slate-600 leading-relaxed"
                                                v-html="
                                                    slides[currentSlide]
                                                        .question
                                                "
                                            ></p>
                                        </div>

                                        <!-- Options Grid -->
                                        <div
                                            class="flex-1 px-16 pb-6 flex flex-col"
                                        >
                                            <div
                                                class="grid grid-cols-2 gap-5 mb-6"
                                            >
                                                <button
                                                    v-for="(
                                                        option, optIdx
                                                    ) in slides[currentSlide]
                                                        .options"
                                                    :key="optIdx"
                                                    @click="
                                                        selectAnswer(
                                                            typeof option ===
                                                                'string'
                                                                ? {
                                                                      id: optIdx,
                                                                      text: option,
                                                                  }
                                                                : option,
                                                        )
                                                    "
                                                    :disabled="
                                                        selectedAnswer !== null
                                                    "
                                                    class="p-6 rounded-xl border-2 text-left transition-all duration-300 flex items-center gap-4"
                                                    :class="[
                                                        selectedAnswer === null
                                                            ? 'bg-white border-slate-200 hover:border-brand-orange hover:bg-orange-50 cursor-pointer'
                                                            : '',
                                                        (selectedAnswer?.id ===
                                                            optIdx ||
                                                            selectedAnswer?.id ===
                                                                option?.id) &&
                                                        (typeof option ===
                                                        'string'
                                                            ? optIdx ===
                                                              slides[
                                                                  currentSlide
                                                              ].correct
                                                            : option?.correct)
                                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                                                            : '',
                                                        (selectedAnswer?.id ===
                                                            optIdx ||
                                                            selectedAnswer?.id ===
                                                                option?.id) &&
                                                        !(typeof option ===
                                                        'string'
                                                            ? optIdx ===
                                                              slides[
                                                                  currentSlide
                                                              ].correct
                                                            : option?.correct)
                                                            ? 'bg-red-50 border-red-500 text-red-900'
                                                            : '',
                                                        selectedAnswer !==
                                                            null &&
                                                        !(typeof option ===
                                                        'string'
                                                            ? optIdx ===
                                                              slides[
                                                                  currentSlide
                                                              ].correct
                                                            : option?.correct) &&
                                                        (typeof option ===
                                                        'string'
                                                            ? slides[
                                                                  currentSlide
                                                              ].correct ===
                                                              optIdx
                                                            : option?.correct)
                                                            ? 'bg-emerald-50 border-emerald-300'
                                                            : '',
                                                        selectedAnswer !==
                                                            null &&
                                                        !(typeof option ===
                                                        'string'
                                                            ? optIdx ===
                                                              slides[
                                                                  currentSlide
                                                              ].correct
                                                            : option?.correct) &&
                                                        !(typeof option ===
                                                        'string'
                                                            ? slides[
                                                                  currentSlide
                                                              ].correct ===
                                                              optIdx
                                                            : option?.correct)
                                                            ? 'opacity-50 bg-slate-50'
                                                            : '',
                                                    ]"
                                                >
                                                    <div
                                                        class="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-[1.4rem] flex-shrink-0"
                                                        :class="
                                                            (selectedAnswer?.id ===
                                                                optIdx ||
                                                                selectedAnswer?.id ===
                                                                    option?.id) &&
                                                            (typeof option ===
                                                            'string'
                                                                ? optIdx ===
                                                                  slides[
                                                                      currentSlide
                                                                  ].correct
                                                                : option?.correct)
                                                                ? 'bg-emerald-500 text-white'
                                                                : 'bg-slate-100 text-slate-600'
                                                        "
                                                    >
                                                        {{
                                                            typeof option ===
                                                            "string"
                                                                ? optIdx + 1
                                                                : option.id
                                                        }}
                                                    </div>
                                                    <span
                                                        class="text-[1.6rem] font-medium"
                                                        v-html="
                                                            typeof option ===
                                                            'string'
                                                                ? option
                                                                : option.text
                                                        "
                                                    ></span>
                                                </button>
                                            </div>

                                            <!-- Explanation -->
                                            <div
                                                v-if="selectedAnswer"
                                                class="mt-auto bg-slate-800 text-white p-6 rounded-xl"
                                            >
                                                <p
                                                    class="text-[1.6rem] leading-relaxed"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .explanation
                                                    "
                                                ></p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- ATTENTION/TASK SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                                'attention' ||
                                            slides[currentSlide].layout ===
                                                'task'
                                        "
                                        class="absolute inset-0 bg-slate-800 flex flex-col"
                                    >
                                        <!-- Header -->
                                        <div
                                            class="h-[100px] bg-brand-orange flex items-center px-16"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhNotePencil
                                                    class="text-[2rem] text-white"
                                                    weight="fill"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white uppercase tracking-wider"
                                                    >Opdracht</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Title -->
                                        <div class="px-16 pt-8 pb-4">
                                            <h2
                                                class="text-[2.5rem] font-bold text-white leading-tight"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h2>
                                        </div>

                                        <!-- Main Content -->
                                        <div
                                            class="flex-1 px-16 pb-6 overflow-hidden"
                                        >
                                            <div
                                                class="h-full bg-white rounded-xl p-10 flex items-start pt-12 justify-center overflow-y-auto"
                                            >
                                                <div
                                                    class="text-[2.2rem] text-slate-700 leading-relaxed text-center"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .content ||
                                                        slides[currentSlide]
                                                            .text
                                                    "
                                                ></div>
                                            </div>
                                        </div>

                                        <!-- Highlight (if exists) -->
                                        <div
                                            v-if="
                                                slides[currentSlide].highlight
                                            "
                                            class="px-16 pb-6"
                                        >
                                            <div
                                                class="bg-slate-700 border-l-4 border-brand-orange rounded-lg p-6 flex items-center gap-4"
                                            >
                                                <PhCheckCircle
                                                    weight="fill"
                                                    class="text-[2rem] text-brand-orange flex-shrink-0"
                                                />
                                                <div>
                                                    <p
                                                        class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider mb-1"
                                                    >
                                                        Kernpunt
                                                    </p>
                                                    <p
                                                        class="text-[1.6rem] text-white leading-relaxed"
                                                        v-html="
                                                            slides[currentSlide]
                                                                .highlight
                                                        "
                                                    ></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- PREDICT SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'predict'
                                        "
                                        class="absolute inset-0 bg-slate-900 text-white flex flex-col"
                                    >
                                        <!-- Header -->
                                        <div
                                            class="h-[100px] bg-brand-orange flex items-center px-16"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhLightbulb
                                                    class="text-[2rem] text-white"
                                                    weight="fill"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white uppercase tracking-wider"
                                                    >Denkvraag</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Title -->
                                        <div class="px-16 pt-8 pb-4">
                                            <h2
                                                class="text-[2.5rem] font-bold text-white leading-tight"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h2>
                                        </div>

                                        <!-- Content Area -->
                                        <div class="flex-1 px-16 pb-4">
                                            <div
                                                class="bg-slate-800 rounded-xl p-10 h-full flex flex-col"
                                            >
                                                <!-- Context -->
                                                <div
                                                    v-if="
                                                        slides[currentSlide]
                                                            .context
                                                    "
                                                    class="mb-6 pb-6 border-b border-slate-700"
                                                >
                                                    <p
                                                        class="text-[1.8rem] text-slate-400 leading-relaxed"
                                                        v-html="
                                                            slides[currentSlide]
                                                                .context
                                                        "
                                                    ></p>
                                                </div>

                                                <!-- Question -->
                                                <div
                                                    class="flex-grow flex items-start pt-4"
                                                >
                                                    <p
                                                        class="text-[2.5rem] font-medium text-white leading-relaxed"
                                                        v-html="
                                                            slides[currentSlide]
                                                                .question
                                                        "
                                                    ></p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Hint / Answer Section -->
                                        <div
                                            class="px-16 pb-16 h-24 flex items-center justify-center"
                                        >
                                            <button
                                                v-if="!answerRevealed"
                                                @click="answerRevealed = true"
                                                class="text-brand-orange hover:text-white text-[1.6rem] font-medium px-8 py-3 bg-brand-orange/10 hover:bg-brand-orange rounded-lg border border-brand-orange/30 hover:border-brand-orange transition-all"
                                                v-html="
                                                    slides[currentSlide].hint
                                                "
                                            ></button>

                                            <div
                                                v-else
                                                class="flex items-center gap-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl px-8 py-4"
                                            >
                                                <PhCheckCircle
                                                    weight="fill"
                                                    class="text-[2rem] text-emerald-400"
                                                />
                                                <p
                                                    class="text-[1.6rem] text-emerald-300"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .revealText
                                                    "
                                                ></p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- REALWORLD SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'realworld'
                                        "
                                        class="w-full h-full flex flex-col bg-white"
                                    >
                                        <!-- Header -->
                                        <div
                                            class="h-[100px] bg-brand-dark flex items-center px-16 border-b-4 border-brand-orange"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhGlobeHemisphereWest
                                                    weight="fill"
                                                    class="text-[2rem] text-brand-orange"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >Praktijk</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Title -->
                                        <div class="px-16 pt-6 pb-4">
                                            <h3
                                                class="text-[2.5rem] font-bold text-slate-800 tracking-tight leading-tight"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h3>
                                        </div>

                                        <!-- Content Grid -->
                                        <div
                                            class="flex-1 px-16 pb-6 grid grid-cols-2 gap-6 overflow-hidden"
                                        >
                                            <!-- Context Card -->
                                            <div
                                                class="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col"
                                            >
                                                <div
                                                    class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200"
                                                >
                                                    <div
                                                        class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center"
                                                    >
                                                        <PhInfo
                                                            weight="fill"
                                                            class="text-[1.5rem] text-white"
                                                        />
                                                    </div>
                                                    <h4
                                                        class="text-[1.4rem] font-bold text-slate-800 uppercase tracking-wider"
                                                    >
                                                        Context
                                                    </h4>
                                                </div>
                                                <p
                                                    class="text-[1.5rem] text-slate-600 leading-relaxed flex-grow"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .context
                                                    "
                                                ></p>
                                            </div>

                                            <!-- Example Card -->
                                            <div
                                                class="bg-orange-50 border border-orange-200 rounded-xl p-6 flex flex-col"
                                            >
                                                <div
                                                    class="flex items-center gap-3 mb-4 pb-3 border-b border-orange-200"
                                                >
                                                    <div
                                                        class="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center"
                                                    >
                                                        <PhTestTube
                                                            weight="fill"
                                                            class="text-[1.5rem] text-white"
                                                        />
                                                    </div>
                                                    <h4
                                                        class="text-[1.4rem] font-bold text-brand-orange uppercase tracking-wider"
                                                    >
                                                        Voorbeeld
                                                    </h4>
                                                </div>
                                                <p
                                                    class="text-[1.5rem] text-slate-700 leading-relaxed italic flex-grow"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .example
                                                    "
                                                ></p>
                                            </div>

                                            <!-- Consequence Card -->
                                            <div
                                                class="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col"
                                            >
                                                <div
                                                    class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200"
                                                >
                                                    <div
                                                        class="w-10 h-10 bg-slate-500 rounded-lg flex items-center justify-center"
                                                    >
                                                        <PhWarning
                                                            weight="fill"
                                                            class="text-[1.5rem] text-white"
                                                        />
                                                    </div>
                                                    <h4
                                                        class="text-[1.4rem] font-bold text-slate-500 uppercase tracking-wider"
                                                    >
                                                        Gevolg
                                                    </h4>
                                                </div>
                                                <p
                                                    class="text-[1.5rem] text-slate-600 leading-relaxed flex-grow"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .consequence
                                                    "
                                                ></p>
                                            </div>

                                            <!-- Takeaway Card -->
                                            <div
                                                class="bg-brand-dark rounded-xl p-6 flex flex-col"
                                            >
                                                <div
                                                    class="flex items-center gap-3 mb-4 pb-3 border-b border-white/20"
                                                >
                                                    <div
                                                        class="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center"
                                                    >
                                                        <PhLightbulb
                                                            weight="fill"
                                                            class="text-[1.5rem] text-white"
                                                        />
                                                    </div>
                                                    <h4
                                                        class="text-[1.4rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >
                                                        Leerpunt
                                                    </h4>
                                                </div>
                                                <p
                                                    class="text-[1.5rem] text-white leading-relaxed flex-grow"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .takeaway
                                                    "
                                                ></p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- RECAP SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'recap'
                                        "
                                        class="w-full h-full flex flex-col bg-white"
                                    >
                                        <!-- Header -->
                                        <div
                                            class="h-[100px] bg-brand-dark flex items-center px-16 border-b-4 border-brand-orange"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhBookOpen
                                                    weight="fill"
                                                    class="text-[2rem] text-brand-orange"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >Herhaling</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Title -->
                                        <div class="px-16 pt-6 pb-4">
                                            <h3
                                                class="text-[2.5rem] font-bold text-slate-800 tracking-tight leading-tight"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h3>
                                        </div>

                                        <!-- Q&A List -->
                                        <div
                                            class="flex-1 px-16 pb-8 overflow-hidden"
                                        >
                                            <div
                                                class="h-full overflow-y-auto exercise-scroll space-y-4"
                                            >
                                                <div
                                                    v-for="(
                                                        item, idx
                                                    ) in slides[currentSlide]
                                                        .questions"
                                                    :key="idx"
                                                    class="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 cursor-pointer hover:border-brand-orange"
                                                    @click="
                                                        item.revealed =
                                                            !item.revealed
                                                    "
                                                >
                                                    <!-- Question -->
                                                    <div
                                                        class="p-5 flex items-center justify-between"
                                                    >
                                                        <p
                                                            class="text-[1.6rem] text-slate-700 font-medium leading-tight"
                                                            v-html="item.q"
                                                        ></p>
                                                        <div
                                                            class="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200 flex-shrink-0 ml-4"
                                                        >
                                                            <PhCaretRight
                                                                class="text-[1.4rem] text-slate-400 transition-transform duration-300"
                                                                :class="
                                                                    item.revealed
                                                                        ? 'rotate-90 text-brand-orange'
                                                                        : ''
                                                                "
                                                                weight="bold"
                                                            />
                                                        </div>
                                                    </div>
                                                    <!-- Answer (expandable) -->
                                                    <div
                                                        v-show="item.revealed"
                                                        class="px-5 pb-5 border-t border-slate-200 bg-orange-50"
                                                    >
                                                        <p
                                                            class="text-[1.5rem] text-slate-800 font-medium pt-4 leading-relaxed"
                                                            v-html="item.a"
                                                        ></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- SUMMARY SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'summary'
                                        "
                                        class="w-full h-full flex flex-col bg-white"
                                    >
                                        <!-- Header -->
                                        <div
                                            class="h-[100px] bg-brand-dark flex items-center px-16 border-b-4 border-brand-orange"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhCheckCircle
                                                    weight="fill"
                                                    class="text-[2rem] text-brand-orange"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >Samenvatting</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Title -->
                                        <div class="px-16 pt-6 pb-4">
                                            <h3
                                                class="text-[2.5rem] font-bold text-slate-800 tracking-tight leading-tight"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h3>
                                        </div>

                                        <!-- Items List -->
                                        <div
                                            class="flex-1 px-16 pb-8 overflow-hidden"
                                        >
                                            <div
                                                class="h-full bg-slate-50 rounded-xl border border-slate-200 p-8 overflow-y-auto exercise-scroll"
                                            >
                                                <ul class="space-y-4">
                                                    <li
                                                        v-for="(
                                                            item, idx
                                                        ) in slides[
                                                            currentSlide
                                                        ].items"
                                                        :key="idx"
                                                        class="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200"
                                                    >
                                                        <span
                                                            class="w-10 h-10 rounded-lg bg-brand-dark text-white flex items-center justify-center font-bold text-[1.4rem] flex-shrink-0"
                                                            >{{ idx + 1 }}</span
                                                        >
                                                        <span
                                                            class="text-[1.6rem] text-slate-700 leading-relaxed pt-1"
                                                            v-html="item"
                                                        ></span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- IMAGE-LEFT SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'image-left'
                                        "
                                        class="w-full h-full flex flex-col bg-white"
                                    >
                                        <!-- Header -->
                                        <div
                                            class="h-[100px] bg-brand-dark flex items-center px-16 border-b-4 border-brand-orange"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhInfo
                                                    weight="fill"
                                                    class="text-[2rem] text-brand-orange"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >Uitleg</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Content -->
                                        <div
                                            class="flex-1 grid grid-cols-2 gap-8 p-8"
                                        >
                                            <!-- Image Side -->
                                            <div class="flex flex-col">
                                                <div
                                                    class="flex-1 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-4"
                                                >
                                                    <img
                                                        v-if="
                                                            slides[currentSlide]
                                                                .image
                                                        "
                                                        :src="
                                                            resolveImageUrl(
                                                                slides[
                                                                    currentSlide
                                                                ].image,
                                                            )
                                                        "
                                                        class="max-w-full max-h-full object-contain"
                                                    />
                                                    <div
                                                        v-else-if="
                                                            slides[currentSlide]
                                                                .customHtml
                                                        "
                                                        class="w-full h-full flex items-center justify-center"
                                                        v-html="
                                                            slides[currentSlide]
                                                                .customHtml
                                                        "
                                                    ></div>
                                                </div>
                                                <div
                                                    v-if="
                                                        slides[currentSlide]
                                                            .imageCaption
                                                    "
                                                    class="mt-3 text-center"
                                                >
                                                    <p
                                                        class="text-[1.4rem] text-slate-500 italic bg-slate-50 rounded-lg py-2 px-4"
                                                        v-html="
                                                            slides[currentSlide]
                                                                .imageCaption
                                                        "
                                                    ></p>
                                                </div>
                                            </div>

                                            <!-- Text Side -->
                                            <div class="flex flex-col">
                                                <h3
                                                    class="text-[2.2rem] font-bold text-slate-800 mb-6 leading-tight"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .title
                                                    "
                                                ></h3>
                                                <div
                                                    class="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-6 overflow-y-auto exercise-scroll mb-4"
                                                >
                                                    <div
                                                        class="text-[1.6rem] leading-relaxed text-slate-700"
                                                        v-html="
                                                            slides[currentSlide]
                                                                .content ||
                                                            slides[currentSlide]
                                                                .text
                                                        "
                                                    ></div>
                                                </div>
                                                <div
                                                    v-if="
                                                        slides[currentSlide]
                                                            .highlight
                                                    "
                                                    class="bg-slate-800 text-white p-5 rounded-xl"
                                                >
                                                    <p
                                                        class="text-[1.5rem] font-medium leading-snug"
                                                        v-html="
                                                            slides[currentSlide]
                                                                .highlight
                                                        "
                                                    ></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- IMAGE-GRID-2 SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'image-grid-2'
                                        "
                                        class="w-full h-full flex flex-col bg-white"
                                    >
                                        <!-- Header -->
                                        <div
                                            class="h-[100px] bg-brand-dark flex items-center px-16 border-b-4 border-brand-orange"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhInfo
                                                    weight="fill"
                                                    class="text-[2rem] text-brand-orange"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >Afbeeldingen</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Title -->
                                        <div class="px-16 pt-6 pb-4">
                                            <h3
                                                class="text-[2.5rem] font-bold text-slate-800 tracking-tight leading-tight"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h3>
                                        </div>

                                        <!-- Image Grid -->
                                        <div
                                            class="flex-1 px-16 pb-8 grid grid-cols-2 gap-8"
                                        >
                                            <div
                                                v-for="(img, idx) in slides[
                                                    currentSlide
                                                ].images"
                                                :key="idx"
                                                class="flex flex-col"
                                            >
                                                <div
                                                    class="flex-1 rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                                                >
                                                    <img
                                                        :src="
                                                            resolveImageUrl(
                                                                img.src,
                                                            )
                                                        "
                                                        class="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div
                                                    v-if="img.caption"
                                                    class="mt-3 bg-slate-50 rounded-lg p-4 border border-slate-200"
                                                >
                                                    <h4
                                                        class="text-[1.6rem] font-bold mb-2"
                                                        :class="
                                                            idx === 0
                                                                ? 'text-slate-800'
                                                                : 'text-brand-orange'
                                                        "
                                                        v-html="
                                                            img.title ||
                                                            `Afbeelding ${idx + 1}`
                                                        "
                                                    ></h4>
                                                    <p
                                                        class="text-[1.4rem] text-slate-600 leading-relaxed"
                                                        v-html="img.caption"
                                                    ></p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Footer -->
                                        <div
                                            v-if="slides[currentSlide].footer"
                                            class="px-16 pb-6 text-center"
                                        >
                                            <p
                                                class="text-[1.6rem] text-slate-500 font-medium tracking-wide"
                                                v-html="
                                                    slides[currentSlide].footer
                                                "
                                            ></p>
                                        </div>
                                    </div>

                                    <!-- IMAGE-HERO SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'image-hero'
                                        "
                                        class="w-full h-full flex flex-col bg-white"
                                    >
                                        <!-- Header -->
                                        <div
                                            class="h-[100px] bg-brand-dark flex items-center px-16 border-b-4 border-brand-orange"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhInfo
                                                    weight="fill"
                                                    class="text-[2rem] text-brand-orange"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white/60 uppercase tracking-wider"
                                                    >Afbeelding</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Image Area -->
                                        <div
                                            class="flex-[2] relative overflow-hidden bg-slate-100"
                                        >
                                            <img
                                                :src="
                                                    resolveImageUrl(
                                                        slides[currentSlide]
                                                            .image,
                                                    )
                                                "
                                                class="w-full h-full object-cover"
                                            />
                                            <div
                                                v-if="
                                                    slides[currentSlide]
                                                        .imageCaption
                                                "
                                                class="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg"
                                            >
                                                <p
                                                    class="text-[1.4rem] font-medium"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .imageCaption
                                                    "
                                                ></p>
                                            </div>
                                        </div>

                                        <!-- Content Area -->
                                        <div
                                            class="flex-1 bg-white p-8 flex flex-col justify-center"
                                        >
                                            <h3
                                                class="text-[2.5rem] font-bold text-slate-800 tracking-tight text-center mb-4"
                                                v-html="
                                                    slides[currentSlide].title
                                                "
                                            ></h3>
                                            <div
                                                v-if="
                                                    slides[currentSlide]
                                                        .content ||
                                                    slides[currentSlide].text
                                                "
                                                class="text-[1.6rem] leading-relaxed text-slate-600 text-center max-w-4xl mx-auto"
                                                v-html="
                                                    slides[currentSlide]
                                                        .content ||
                                                    slides[currentSlide].text
                                                "
                                            ></div>
                                            <div
                                                v-if="
                                                    slides[currentSlide]
                                                        .highlight
                                                "
                                                class="mt-6 pt-6 border-t border-slate-200 text-center"
                                            >
                                                <p
                                                    class="text-[1.8rem] text-brand-orange font-bold"
                                                    v-html="
                                                        slides[currentSlide]
                                                            .highlight
                                                    "
                                                ></p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- CELEBRATION SLIDE - Classic PowerPoint Style -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'celebration'
                                        "
                                        class="absolute inset-0 bg-brand-dark text-white flex flex-col items-center justify-start text-center pt-32"
                                    >
                                        <div class="mb-12">
                                            <div
                                                class="inline-flex items-center justify-center w-32 h-32 bg-brand-orange rounded-full shadow-lg"
                                            >
                                                <PhCheckCircle
                                                    weight="fill"
                                                    class="text-[5rem] text-white"
                                                />
                                            </div>
                                        </div>

                                        <h3
                                            class="text-[4rem] font-bold text-white mb-4"
                                        >
                                            Presentatie voltooid
                                        </h3>
                                        <p
                                            class="text-white/60 text-[1.8rem] mb-12"
                                        >
                                            Je bent klaar voor de oefeningen.
                                        </p>

                                        <button
                                            @click="finish"
                                            class="bg-brand-orange text-white px-12 py-4 rounded-xl text-[1.8rem] font-bold hover:bg-orange-600 transition-colors flex items-center gap-3"
                                        >
                                            <PhCheckCircle
                                                weight="bold"
                                                class="text-[1.8rem]"
                                            />
                                            <span>Voltooi</span>
                                        </button>
                                    </div>

                                    <!-- EXERCISE-CYCLE SLIDE - Image + Multi-step Exercise -->
                                    <div
                                        v-if="
                                            slides[currentSlide].layout ===
                                            'exercise-cycle'
                                        "
                                        class="w-full h-full flex flex-col bg-white overflow-hidden"
                                    >
                                        <!-- Header Bar -->
                                        <div
                                            class="h-[100px] bg-brand-orange flex items-center px-16"
                                        >
                                            <div
                                                class="flex items-center gap-4 mt-4"
                                            >
                                                <PhNotePencil
                                                    weight="fill"
                                                    class="text-[2rem] text-white"
                                                />
                                                <span
                                                    class="text-[1.2rem] font-bold text-white uppercase tracking-wider"
                                                    >Oefening</span
                                                >
                                            </div>
                                        </div>

                                        <!-- Title -->
                                        <div class="px-16 pt-4 pb-2">
                                            <h3
                                                class="text-[2.5rem] font-bold text-slate-800 tracking-tight leading-tight"
                                                v-html="
                                                    slides[currentSlide]
                                                        .imageTitle ||
                                                    slides[currentSlide].title
                                                "
                                            ></h3>
                                        </div>

                                        <!-- Main Content: Image on left, steps on right -->
                                        <div
                                            class="flex-1 grid grid-cols-[400px_1fr] gap-8 px-16 pb-8 overflow-hidden"
                                        >
                                            <!-- Image Side -->
                                            <div
                                                class="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center"
                                            >
                                                <img
                                                    v-if="
                                                        slides[currentSlide]
                                                            .image
                                                    "
                                                    :src="
                                                        resolveImageUrl(
                                                            slides[currentSlide]
                                                                .image,
                                                        )
                                                    "
                                                    class="max-w-full max-h-full object-contain"
                                                />
                                            </div>

                                            <!-- Steps Side (scrollable) -->
                                            <div
                                                ref="exerciseScrollRef"
                                                class="overflow-y-auto exercise-scroll pr-2"
                                            >
                                                <div class="space-y-4">
                                                    <div
                                                        v-for="(
                                                            step, idx
                                                        ) in slides[
                                                            currentSlide
                                                        ].steps"
                                                        :key="idx"
                                                        class="exercise-step rounded-xl border-2 overflow-hidden transition-all duration-500"
                                                        :class="
                                                            idx < revealedSteps
                                                                ? 'border-brand-orange bg-orange-50 shadow-md'
                                                                : 'border-slate-200 bg-slate-50 opacity-60'
                                                        "
                                                    >
                                                        <!-- Step Title -->
                                                        <div
                                                            class="px-6 py-3 bg-slate-800 text-white flex items-center gap-3"
                                                        >
                                                            <div
                                                                class="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center text-[1.2rem] font-bold shrink-0"
                                                            >
                                                                {{ idx + 1 }}
                                                            </div>
                                                            <h4
                                                                class="text-[1.4rem] font-bold tracking-wide"
                                                                v-html="
                                                                    step.title
                                                                "
                                                            ></h4>
                                                        </div>
                                                        <!-- Step Content (revealed) -->
                                                        <div
                                                            v-if="
                                                                idx <
                                                                revealedSteps
                                                            "
                                                            class="px-6 py-5 animate-[fadeInUp_0.3s_ease-out]"
                                                        >
                                                            <div
                                                                class="text-[1.4rem] leading-relaxed text-slate-700"
                                                                v-html="
                                                                    step.content
                                                                "
                                                            ></div>
                                                        </div>
                                                        <div
                                                            v-else
                                                            class="px-6 py-5"
                                                        >
                                                            <p
                                                                class="text-[1.4rem] text-slate-400 italic"
                                                            >
                                                                Druk op → om
                                                                deze stap te
                                                                onthullen
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Footer with Progress -->
                                        <div
                                            class="px-16 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between"
                                        >
                                            <div
                                                v-if="
                                                    revealedSteps >=
                                                    slides[currentSlide].steps
                                                        .length
                                                "
                                                class="flex items-center gap-2 text-emerald-600 font-bold"
                                            >
                                                <PhCheckCircle
                                                    weight="fill"
                                                    class="text-xl"
                                                />
                                                <span class="text-[1.4rem]"
                                                    >Alle stappen onthuld</span
                                                >
                                            </div>
                                            <div
                                                v-else
                                                class="text-slate-400 text-[1.4rem]"
                                            >
                                                Druk op → of 'S' om antwoord te
                                                onthullen
                                            </div>
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <div
                                                    v-for="(
                                                        step, idx
                                                    ) in slides[currentSlide]
                                                        .steps"
                                                    :key="idx"
                                                    class="w-3 h-3 rounded-full transition-colors duration-300"
                                                    :class="
                                                        idx < revealedSteps
                                                            ? 'bg-brand-orange'
                                                            : 'bg-slate-300'
                                                    "
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </div>

                    <!-- Footer Navigation - Classic PowerPoint Style -->
                    <div
                        class="absolute bottom-0 left-0 right-0 h-12 bg-brand-dark z-[80] flex items-center justify-between px-6"
                    >
                        <!-- Left: Slide counter -->
                        <div class="flex items-center gap-2">
                            <span class="text-white/60 text-[1.2rem] font-mono">
                                {{ currentSlide + 1 }}
                                <span class="opacity-40"
                                    >/ {{ totalSlides }}</span
                                >
                            </span>
                        </div>

                        <!-- Center: Navigation arrows -->
                        <div class="flex items-center gap-2">
                            <button
                                @click.stop="prevSlide"
                                class="text-white/60 hover:text-white hover:bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                :disabled="currentSlide === 0"
                            >
                                <PhCaretLeft
                                    weight="bold"
                                    class="text-[1.4rem]"
                                />
                            </button>

                            <button
                                @click.stop="advancePresentation"
                                class="text-white/60 hover:text-white hover:bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                :disabled="
                                    currentSlide === totalSlides - 1 &&
                                    (!slides[currentSlide]?.steps ||
                                        slides[currentSlide].layout ===
                                            'exercise' ||
                                        revealedSteps ===
                                            slides[currentSlide].steps
                                                .length) &&
                                    (!slides[currentSlide]?.revealText ||
                                        answerRevealed)
                                "
                            >
                                <PhCaretRight
                                    weight="bold"
                                    class="text-[1.4rem]"
                                />
                            </button>
                        </div>

                        <!-- Right: Progress bar -->
                        <div
                            class="w-32 h-2 bg-white/10 rounded-full overflow-hidden"
                        >
                            <div
                                class="h-full bg-brand-orange transition-all duration-300"
                                :style="{ width: progressPercentage + '%' }"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.exercise-scroll::-webkit-scrollbar {
    width: 8px;
}
.exercise-scroll::-webkit-scrollbar-track {
    background: transparent;
}
.exercise-scroll::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
}
.exercise-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.25);
}
.equation-formula :deep(.katex) {
    font-size: 2.8rem;
    line-height: 1.1;
}
</style>
