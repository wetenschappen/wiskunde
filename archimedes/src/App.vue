<script setup>
import {
    ref,
    reactive,
    onMounted,
    onUnmounted,
    watch,
    defineAsyncComponent,
    computed,
} from "vue";
import {
    PhPresentationChart,
    PhInfo,
    PhGameController,
    PhFlask,
    PhPlanet,
    PhTextAa,
    PhArrowsDownUp,
    PhThumbsUp,
    PhListBullets,
    PhDiamondsFour,
    PhTrophy,
    PhTarget,
    PhAtom,
    PhWrench,
    PhFilePdf,
    PhUsers,
    PhLightbulb,
    PhScales,
    PhChartLine,
    PhMathOperations,
    PhMicroscope,
    PhWaves,
} from "@phosphor-icons/vue";
import { studentLists } from "./data/students.js";

// --- COMPOSABLES ---
import { useProgress } from "./composables/useProgress.js";
import { useActivitySystem } from "./composables/useActivitySystem.js";
import { useLesson } from "./composables/useLesson.js";

import lesson3Data from "./lessons/archimedes-les-3.js";
import lesson4Data from "./lessons/archimedes-les-4.js";

const allLessons = [lesson3Data, lesson4Data];

function combineLessons(lessons) {
    const combinedTimeline = {};
    const lessonHeaders = [];
    const allActivities = {};

    let lessonCounter = 0;
    lessons.forEach((lesson, lessonIndex) => {
        const isTask = !!lesson.isTask;
        if (!isTask) lessonCounter++;

        const currentLessonNumber = isTask ? null : lessonCounter;

        lessonHeaders.push({
            id: lesson.id,
            title: lesson.title,
            date: lesson.date || "",
            index: lessonIndex,
            isTask: isTask,
            lessonNumber: currentLessonNumber,
        });

        Object.entries(lesson.timeline).forEach(([stepKey, step]) => {
            const newStepKey = `lesson${lessonIndex + 1}_${stepKey}`;
            combinedTimeline[newStepKey] = {
                ...step,
                id: `${lesson.id}-${step.step}`,
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                lessonIndex: lessonIndex,
                isTask: isTask,
                lessonNumber: currentLessonNumber,
                cards: step.cards.map((card) => ({
                    ...card,
                    id: `${lesson.id}-${card.id}`,
                    lessonId: lesson.id,
                })),
            };
        });

        Object.assign(allActivities, lesson.activities);
    });

    return { combinedTimeline, lessonHeaders, allActivities };
}

const { combinedTimeline, lessonHeaders, allActivities } =
    combineLessons(allLessons);
// --- COMPONENTS ---
import LessonHeader from "./components/LessonHeader.vue";
import TimelineItem from "./components/TimelineItem.vue";
import ActivityCard from "./components/ActivityCard.vue";
import BranchActivityButton from "./components/BranchActivityButton.vue";
import Toolbox from "./components/Toolbox.vue";
import GoalsWidget from "./components/GoalsWidget.vue";
// TheBackground is intentionally NOT imported as we are using inline implementation

// Lazy loaded modals
const PresentationModal = defineAsyncComponent(
    () => import("./components/modals/PresentationModal.vue"),
);
const WorkbookModal = defineAsyncComponent(
    () => import("./components/modals/WorkbookModal.vue"),
);
const ExitTicketModal = defineAsyncComponent(
    () => import("./components/modals/ExitTicketModal.vue"),
);
const SpotCheckModal = defineAsyncComponent(
    () => import("./components/modals/SpotCheckModal.vue"),
);
const ExtraChallengeBranch = defineAsyncComponent(
    () => import("./components/ExtraChallengeBranch.vue"),
);

const SolutionsModal = defineAsyncComponent(
    () => import("./components/modals/SolutionsModal.vue"),
);

import TimerWidget from "./components/widgets/TimerWidget.vue";
const CalculatorWidget = defineAsyncComponent(
    () => import("./components/widgets/CalculatorWidget.vue"),
);
const NamePickerOverlay = defineAsyncComponent(
    () => import("./components/NamePickerOverlay.vue"),
);

// ============================================
// INITIALIZE COMPOSABLES
// ============================================

// 1. Progress (for combined lessons)
const progress = useProgress("combined-archimedes");

// 2. Combined Lesson Logic
const lesson = useLesson({
    id: "combined-archimedes",
    subject: allLessons[0].subject,
    className: allLessons[0].className,
    title: "De archimedeskracht",
    description: "ISAAC Module 6",
    config: allLessons[0].config,
    goals: allLessons.flatMap((l) => l.goals),
    workbook: allLessons[0].workbook,
    timeline: combinedTimeline,
    activities: allActivities,
    slides: allLessons.flatMap((l) => l.slides || []),
    exitTicket: null,
    lessonHeaders: lessonHeaders,
});

// 3. Activity System (combined)
const activitySystem = useActivitySystem(
    {
        ...allLessons[0],
        activities: allActivities,
    },
    progress.markAsDone,
);

// ============================================
// LOCAL COMPONENT STATE
// ============================================
const showPres = ref(false);
const currentSlides = ref(lesson.slides);
const showWork = ref(false);
const showExit = ref(false);
const currentExitTicket = ref(null);
const showSpotCheck = ref(false);

const showTimer = ref(true);
const showCalculator = ref(false);
const showNamePicker = ref(false);
const showWatermark = ref(
    localStorage.getItem("planner-show-watermark") !== "false",
);

const showSolutions = ref(false);
const showDiscipline = ref(false);
const currentCardId = ref(null); // Track which card opend a modal

const currentWorkbookExercises = computed(() => {
    if (!currentCardId.value) return "";
    for (const step of lesson.timeline.value) {
        if (step.cards) {
            const card = step.cards.find((c) => c.id === currentCardId.value);
            if (card && card.exercises) return card.exercises;
        }
    }
    return "";
});

// Dynamic Branch States
const branchStates = reactive({});

// Timer Logic
const timerStartDuration = ref(0);
function handleStartTimer(timeStr) {
    const match = timeStr.match(/(\d+)/);
    if (match) {
        timerStartDuration.value = parseInt(match[1]);
        setTimeout(() => (timerStartDuration.value = 0), 500);
    }
}

// ============================================
// LIFECYCLE & EVENTS
// ============================================
// ============================================
// LIFECYCLE & EVENTS
// ============================================
onMounted(() => {
    progress.restoreProgress();
    window.addEventListener("keydown", handleGlobalKeydown);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleGlobalKeydown);
});

function handleGlobalKeydown(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        showNamePicker.value = !showNamePicker.value;
    }
    if (e.key === "r" || e.key === "R")
        progress.resetProgress("combined-archimedes");
    if (e.key === "c" || e.key === "C") {
        showWatermark.value = !showWatermark.value;
        localStorage.setItem("planner-show-watermark", showWatermark.value);
    }
}

// Watchers for Scroll Lock
watch(
    [
        showPres,
        showWork,
        showExit,
        showNamePicker,
        showSpotCheck,
        showSolutions,
        activitySystem.activeActivity,
    ],
    (values) => {
        document.body.style.overflow = values.some((v) => v) ? "hidden" : "";
    },
);

// ============================================
// HELPERS
// ============================================

const iconMap = {
    PhPresentationChart,
    PhInfo,
    PhGameController,
    PhFlask,
    PhPlanet,
    PhAtom,
    PhTextAa,
    PhArrowsDownUp,
    PhThumbsUp,
    PhListBullets,
    PhDiamondsFour,
    PhTrophy,
    PhTarget,
    PhWrench,
    PhFilePdf,
    PhUsers,
    PhLightbulb,
    PhScales,
    PhChartLine,
    PhMathOperations,
    PhWaves,
};

function handleCardAction(card) {
    currentCardId.value = card.id;

    // Find which lesson this card belongs to
    const lessonData = allLessons.find((l) => card.id.startsWith(l.id));

    if (card.action === "presentation") {
        const key = card.slidesKey || "slides";
        currentSlides.value = (lessonData && lessonData[key]) || lesson.slides;

        // Auto-detect if this is the very first presentation card in the entire planner
        const steps = lesson.timeline.value;
        const firstPresCardId = steps
            .find((s) => s.cards?.some((c) => c.action === "presentation"))
            ?.cards.find((c) => c.action === "presentation")?.id;

        showDiscipline.value =
            card.id === firstPresCardId || !!card.showDiscipline;
        showPres.value = true;
    } else if (card.action === "workbook") showWork.value = true;
    else if (card.action === "exit-ticket") {
        const lessonData = allLessons.find((l) => card.id.startsWith(l.id));
        const exitTicket = lessonData?.exitTicket || allLessons[0].exitTicket;
        currentExitTicket.value = exitTicket?.questions || exitTicket;
        showExit.value = true;
    } else if (card.action === "external-link" && card.url) {
        window.open(card.url, "_blank");
        progress.markAsDone(card.id);
    } else if (
        card.action === "activity" &&
        (card.activityId || card.activityType)
    )
        activitySystem.handleOpenActivity(
            card.activityId || card.activityType,
            card.id,
        );
    else if (card.action === "custom") progress.markAsDone(card.id);
}

function isStepDone(step) {
    if (!step.cards) return false;
    return step.cards.every((card) => progress.isDone(card.id));
}

function getStepStatus(step, index) {
    if (isStepDone(step)) return "done";

    // Active if previous is done OR it's the first step OR previous step is from different lesson
    if (index === 0) return "active";

    const prevStep = lesson.timeline.value[index - 1];

    // If previous step is from a different lesson, always activate
    if (prevStep?.lessonId !== step.lessonId) return "active";

    if (prevStep && isStepDone(prevStep)) return "active";

    return "pending";
}

function getBranchLabel(step) {
    if (step.isDefaultRoute) return "Extra Ondersteuning";
    if (step.isAdvancedRoute) return "Extra Uitdaging";
    return "Extra Materiaal";
}

function getCardMeta(card) {
    if (card.meta) return card.meta;

    // Auto-generate if missing
    if (card.type === "class") return "Klassikaal";
    if (card.type === "digital") return "Digitaal";
    if (card.type === "paper") return "Werkboek";
    if (card.type === "check") return "Check";
    return "Activiteit";
}

function getActionText(card) {
    if (card.actionText) return card.actionText;
    if (card.action === "presentation") return "Start Theorie";
    if (card.action === "workbook") return "Open Werkboek";
    if (card.action === "exit-ticket") return "Start Exit Ticket";
    if (card.action === "activity") return "Start Activiteit";
    return "Start";
}

const studentName = ref("");
const partnerName = ref("");

// Validation Logic
const isTimelineComplete = computed(() => {
    // Check all cards except exit ticket
    let allDone = true;
    lesson.timeline.value.forEach((step) => {
        if (step.cards) {
            step.cards.forEach((card) => {
                if (card.action === "exit-ticket") return;
                if (!progress.isDone(card.id)) allDone = false;
            });
        }
    });
    return allDone;
});

// Callbacks

// Track which lesson the current step belongs to
function getLessonContext(step) {
    if (!step.lessonId) return null;
    const lessonIndex = lesson.lessonHeaders?.findIndex(
        (h) => h.id === step.lessonId,
    );
    return {
        lessonIndex,
        lessonTitle: step.lessonTitle,
        showHeader: lessonIndex !== undefined && lessonIndex >= 0,
    };
}
</script>

<template>
    <div class="relative min-h-screen overflow-x-hidden">
        <!-- BACKGROUND -->
        <div
            v-show="showWatermark"
            class="fixed top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.1] pointer-events-none transform -rotate-12 select-none z-0"
        >
            <component
                :is="
                    lesson.config.subject === 'physics'
                        ? PhPlanet
                        : lesson.config.subject === 'science'
                          ? PhMicroscope
                          : PhFlask
                "
                weight="fill"
                class="text-amber-500"
                :size="600"
            />
        </div>

        <!-- HEADER -->
        <nav
            class="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg"
        >
            <div
                class="max-w-3xl mx-auto px-4 h-11 flex items-center justify-between"
            >
                <div class="flex items-center gap-3 select-none">
                    <span
                        class="font-mono font-bold tracking-widest text-xl uppercase text-amber-500"
                    >
                        {{
                            lesson.config.subject === "physics"
                                ? "Fysica"
                                : lesson.config.subject === "science"
                                  ? "NW"
                                  : "Chemie"
                        }}
                    </span>
                    <span class="text-slate-700 text-xl font-bold">|</span>

                    <div
                        class="flex items-center gap-2 font-mono font-bold tracking-widest text-xl text-slate-200"
                    >
                        {{ lesson.config.className }}
                    </div>
                </div>
                <TimerWidget
                    :isOpen="showTimer"
                    :start-duration="timerStartDuration"
                    @close="showTimer = false"
                />
            </div>
        </nav>

        <main class="max-w-3xl mx-auto px-6 pt-12 pb-32 relative z-10">
            <LessonHeader
                :title="lesson.config.title"
                :description="lesson.config.description"
            />

            <!-- DYNAMIC TIMELINE LOOP -->
            <template
                v-for="(step, index) in lesson.timeline.value"
                :key="step.id"
            >
                <!-- LESSON SECTION HEADER -->
                <div
                    v-if="
                        index === 0 ||
                        lesson.timeline.value[index - 1]?.lessonId !==
                            step.lessonId
                    "
                    class="mt-8 mb-4 px-4 py-3 bg-amber-50/50 rounded-lg border border-amber-200"
                >
                    <div class="flex justify-between items-center">
                        <h3 class="font-bold text-amber-700 text-lg">
                            {{ step.lessonTitle }}
                        </h3>
                        <span class="text-sm text-amber-500 font-mono">{{
                            lesson.lessonHeaders?.find(
                                (h) => h.id === step.lessonId,
                            )?.date
                        }}</span>
                    </div>
                </div>

                <!-- STANDARD TIMELINE STEP -->
                <TimelineItem
                    :step="step.step"
                    :title="step.title"
                    :time="step.time"
                    :status="getStepStatus(step, index)"
                    :isLast="index === lesson.timeline.value.length - 1"
                    @start-timer="handleStartTimer"
                >
                    <!-- ACTIVITY CARDS -->
                    <ActivityCard
                        v-for="card in step.cards"
                        :key="card.id"
                        :type="card.type"
                        :meta="getCardMeta(card)"
                        :title="card.title"
                        :description="card.description"
                        :actionText="getActionText(card)"
                        :icon="iconMap[card.icon] || PhInfo"
                        :isDone="progress.isDone(card.id)"
                        @click="handleCardAction(card)"
                    />

                    <!-- EXTRA BRANCH -->
                    <ExtraChallengeBranch
                        v-if="step.extraActivities"
                        v-model:isOpen="branchStates[step.id]"
                        :label="getBranchLabel(step)"
                    >
                        <div class="p-3">
                            <BranchActivityButton
                                v-for="act in step.extraActivities"
                                :key="act.id"
                                :title="act.title"
                                :category="act.category"
                                :icon="iconMap[act.icon]"
                                :isDone="
                                    progress.isDone(
                                        'card-' + act.id.toLowerCase(),
                                    )
                                "
                                @click="
                                    activitySystem.handleOpenActivity(
                                        act.id.toLowerCase(),
                                    )
                                "
                            />
                        </div>
                    </ExtraChallengeBranch>
                </TimelineItem>
            </template>
        </main>

        <!-- WORKSPACE TOOLS -->
        <Toolbox
            @open-tool="
                (t) => {
                    if (t === 'calc') showCalculator = true;
                    if (t === 'names') showNamePicker = true;
                    if (t === 'solutions') showSolutions = true;
                }
            "
            @open-pdf="window.open(lesson.config.cursusLink, '_blank')"
            :subject="lesson.config.subject"
            :extra-tools="lesson.config.extraTools"
        />

        <!-- MODALS -->
        <PresentationModal
            :isOpen="showPres"
            :slides="currentSlides"
            :config="lesson.config"
            :showDisciplineSlide="showDiscipline"
            @close="showPres = false"
            @complete="progress.markAsDone(currentCardId || 'card-pres')"
        />

        <WorkbookModal
            :isOpen="showWork"
            :workbook="lesson.workbook"
            :exercises="currentWorkbookExercises"
            @close="showWork = false"
            @complete="progress.markAsDone(currentCardId || 'card-workbook')"
        />

        <SolutionsModal
            :isOpen="showSolutions"
            :config="lesson.config"
            :workbook="lesson.workbook"
            @close="showSolutions = false"
        />

        <ExitTicketModal
            v-if="currentExitTicket"
            :isOpen="showExit"
            :questions="currentExitTicket"
            :goals="lesson.goals"
            :guardrails="{ rubric: false, timeline: false }"
            @close="showExit = false"
            @complete="progress.markAsDone(currentCardId)"
        />

        <SpotCheckModal
            :isOpen="showSpotCheck"
            :questions="lesson.spotCheck"
            title="Check-up"
            @close="showSpotCheck = false"
            @complete="progress.markAsDone('card-spotcheck')"
        />

        <!-- DYNAMIC ACTIVITY -->
        <component
            v-if="activitySystem.activeActivity.value"
            :is="activitySystem.activeActivity.value.component"
            :isOpen="true"
            v-bind="activitySystem.activeActivity.value.props"
            @close="activitySystem.closeActivity"
            @complete="activitySystem.completeActivity"
        />

        <!-- WIDGETS -->
        <CalculatorWidget
            :isOpen="showCalculator"
            @close="showCalculator = false"
        />
        <NamePickerOverlay
            :isOpen="showNamePicker"
            :names="
                studentLists[lesson.config.classId] || studentLists['3NW'] || []
            "
            @close="showNamePicker = false"
        />

        <GoalsWidget
            :goals="lesson.goals"
            :prerequisites="lesson.config.prerequisites"
            :equipment="lesson.config.equipment"
            :textbook="lesson.config.textbook"
            :subject="lesson.config.subject"
        />
    </div>
</template>
