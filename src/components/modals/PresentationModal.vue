<script setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted, nextTick, h } from 'vue'

import { provide } from 'vue'
import SlideDiscipline from '../presentation/SlideDiscipline.vue'
import SlideTitle from '../presentation/SlideTitle.vue'
import SlideHero from '../presentation/SlideHero.vue'
import SlideStandard from '../presentation/SlideStandard.vue'
import SlideSteps from '../presentation/SlideSteps.vue'
import SlideExercise from '../presentation/SlideExercise.vue'
import SlideEquation from '../presentation/SlideEquation.vue'
import SlideComparison from '../presentation/SlideComparison.vue'
import SlideSplit from '../presentation/SlideSplit.vue'
import SlideMathGraph from '../presentation/SlideMathGraph.vue'
import SlideImageGrid from '../presentation/SlideImageGrid.vue'
import SlideBig from '../presentation/SlideBig.vue'
import SlideMultichoice from '../presentation/SlideMultichoice.vue'
import SlidePredict from '../presentation/SlidePredict.vue'
import SlideRealworld from '../presentation/SlideRealworld.vue'
import SlideRecap from '../presentation/SlideRecap.vue'
import SlideSummary from '../presentation/SlideSummary.vue'
import SlideImageHero from '../presentation/SlideImageHero.vue'
import SlideCelebration from '../presentation/SlideCelebration.vue'
import SlideDefinition from '../presentation/SlideDefinition.vue'
import SlideWorkedExample from '../presentation/SlideWorkedExample.vue'
import SlideValueTable from '../presentation/SlideValueTable.vue'
import SlideProperties from '../presentation/SlideProperties.vue'
import SlideEquationSolver from '../presentation/SlideEquationSolver.vue'
import SlideTheoremProof from '../presentation/SlideTheoremProof.vue'

const layoutComponentMap = {
    'discipline': SlideDiscipline,
    'title': SlideTitle,
    'hero': SlideHero,
    'standard': SlideStandard,
    'steps': SlideSteps,
    'exercise': SlideExercise,
    'equation': SlideEquation,
    'comparison': SlideComparison,
    'split': SlideSplit,
    'math-graph': SlideMathGraph,
    'image-grid': SlideImageGrid,
    'big': SlideBig,
    'multichoice': SlideMultichoice,
    'predict': SlidePredict,
    'realworld': SlideRealworld,
    'recap': SlideRecap,
    'summary': SlideSummary,
    'image-hero': SlideImageHero,
    'celebration': SlideCelebration,
    'definition': SlideDefinition,
    'worked-example': SlideWorkedExample,
    'value-table': SlideValueTable,
    'properties': SlideProperties,
    'equation-solver': SlideEquationSolver,
    'theorem-proof': SlideTheoremProof
}

import {
  PhX, PhCaretLeft, PhCaretRight,
  PhCheckCircle, PhPlayCircle, PhQuestion,
  PhArrowsOutSimple,
  PhSpeakerHigh, PhSpeakerSlash,
  PhFinnTheHuman,
  PhWarning, PhLightbulb, PhStar, PhConfetti, PhXCircle,
  PhFlag, PhArrowsClockwise, PhGlobeHemisphereWest, PhTrophy, PhFunction, PhTriangle, PhMedal,
  PhUsers, PhBrain, PhTarget, PhChartLineUp, PhWrench, PhArrowDown, PhTrendDown, PhArrowFatDown, PhArrowLineDown, PhUploadSimple,
  PhBookOpen, PhHandPointing, PhHourglassLow, PhUserFocus,
  PhLink, PhCopy, PhCheck, PhDesktop, PhInfo, PhNotePencil, PhCircle,
  PhBookOpenText, PhChalkboardTeacher, PhTable, PhListChecks, PhGraph, PhCalculator, PhInfinity
} from '@phosphor-icons/vue'
import MathGraphSvg from '../activities/MathGraphSvg.vue'

const props = defineProps({
  isOpen: Boolean,
  slides: {
    type: Array,
    required: true
  },
  config: {
    type: Object,
    default: () => ({})
  },
  showDisciplineSlide: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'complete'])

const currentSlide = ref(0)
const answerRevealed = ref(false)
const revealedSteps = ref(0)
const selectedAnswer = ref(null)
const showConfetti = ref(false)
const transitionName = ref('slide')
const linkCopied = ref(false)

// SCALING LOGIC
const scale = ref(1)
const stageRef = ref(null)
const containerRef = ref(null)
const exerciseScrollRef = ref(null)

function updateScale() {
  if (!containerRef.value) return
  const parentW = containerRef.value.clientWidth
  const parentH = containerRef.value.clientHeight
  
  // Fit to screen by choosing the smallest scale factor
  const scaleH = parentH / 1080
  const scaleW = parentW / 1920
  scale.value = Math.min(scaleH, scaleW)
}

// --- HELPERS ---
function cleanUrl(url) {
    if (!url) return ''
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

async function copyLink(url) {
    if (!url) return
    try {
        await navigator.clipboard.writeText(url)
        linkCopied.value = true
        setTimeout(() => linkCopied.value = false, 2000)
    } catch {
        window.open(url, '_blank')
    }
}

// --- DISCIPLINE SLIDE (auto-generated, matches reference design) ---
const disciplineSlide = computed(() => ({
    layout: 'discipline',
    cursusLink: props.config?.cursusLink || '',
    rules: props.config?.disciplineRules || [
        { icon: 'speaker-slash', text: 'In <span class="text-math-orange">stilte</span> binnenkomen en plaatsnemen.' },
        { icon: 'book-open', text: '<span class="text-math-orange">Jassen uit</span>, cursus op de bank klaarleggen.' },
        { icon: 'hand-pointing', text: '<span class="text-math-orange">Rust</span> bewaren: praten enkel na hand opsteken en toestemming.' },
        { icon: 'hourglass', text: 'Samen werken van de eerste tot de <span class="text-math-orange">laatste minuut</span>.' }
    ]
}))

// --- SLIDES (with conditionally injected discipline slide) ---
const parsedCursusLink = computed(() => {
    const link = props.config?.cursusLink || 'albertshalaj.github.io/3nw'
    try {
        const u = new URL(link.startsWith('http') ? link : 'https://' + link)
        return { domain: u.hostname, path: u.pathname !== '/' ? u.pathname : '' }
    } catch {
        const parts = link.split('/')
        if (parts.length > 1) return { domain: parts[0], path: '/' + parts.slice(1).join('/') }
        return { domain: 'albertshalaj.github.io', path: link.startsWith('/') ? link : '/' + link }
    }
})

const slidesCopy = computed(() => {
    if (!props.slides) return []
    const processedSlides = props.slides.map(slide => {
        if (slide.layout === 'recap' && slide.questions) {
            return {
                ...slide,
                questions: slide.questions.map(q => ({ ...q, revealed: false }))
            }
        }
        return slide
    })
    // Only prepend discipline slide for first/default deck
    if (props.showDisciplineSlide && props.config) {
        return [disciplineSlide.value, ...processedSlides]
    }
    return processedSlides
})

const slides = computed(() => slidesCopy.value)
const totalSlides = computed(() => slides.value.length)
const progressPercentage = computed(() => ((currentSlide.value + 1) / totalSlides.value) * 100)

const currentMathConfigForAnalysis = computed(() => {
    const slide = slides.value[currentSlide.value];
    if (!slide || slide.layout !== 'math-graph') return null;
    return slide.steps?.[revealedSteps.value]?.mathConfig || slide.mathConfig || null;
});

function nextSlide() {
  if (currentSlide.value < totalSlides.value - 1) {
    transitionName.value = 'slide'
    currentSlide.value++
    answerRevealed.value = false
    revealedSteps.value = 0
    selectedAnswer.value = null
  }
}

function advancePresentation() {
    const slide = slides.value[currentSlide.value]
    if (slide && slide.layout === 'math-graph' && slide.steps && revealedSteps.value < slide.steps.length - 1) {
        revealNextStep(slide.steps.length - 1)
    } else if (slide && (slide.layout === 'steps' || slide.layout === 'recap' || slide.layout === 'worked-example')) {
        const maxSteps = slide.steps ? slide.steps.length : (slide.questions ? slide.questions.length : 0)
        if (maxSteps && revealedSteps.value < maxSteps) {
            revealNextStep(maxSteps)
        } else {
            nextSlide()
        }
    } else if (slide && slide.layout === 'predict' && slide.revealText && !answerRevealed.value) {
        answerRevealed.value = true
    } else {
        nextSlide()
    }
}

function prevSlide() {
    const slide = slides.value[currentSlide.value]
    const hasSteps = slide && (
        (slide.layout === 'math-graph' && slide.steps) ||
        (slide.layout === 'steps' && slide.steps) ||
        (slide.layout === 'recap' && slide.questions) ||
        (slide.layout === 'worked-example' && slide.steps)
    )
    if (revealedSteps.value > 0 && hasSteps) {
        reverseStep()
    } else if (currentSlide.value > 0) {
        transitionName.value = 'slide-back'
        currentSlide.value--
        answerRevealed.value = false
        revealedSteps.value = 0
        selectedAnswer.value = null
    }
}

function revealNextStep(maxSteps) {
    if (revealedSteps.value < maxSteps) {
        revealedSteps.value++
        nextTick(() => {
            if (exerciseScrollRef.value) {
                const items = exerciseScrollRef.value.querySelectorAll('.exercise-step')
                if (items[revealedSteps.value - 1]) {
                    items[revealedSteps.value - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }
            }
        })
    }
}

function reverseStep() {
    if (revealedSteps.value > 0) {
        revealedSteps.value--
        nextTick(() => {
            if (exerciseScrollRef.value) {
                const items = exerciseScrollRef.value.querySelectorAll('.exercise-step')
                if (items[revealedSteps.value - 1]) {
                    items[revealedSteps.value - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }
            }
        })
    }
}

function selectAnswer(option) {
    selectedAnswer.value = option.id
    if (option.correct) {
        showConfetti.value = true
        setTimeout(() => showConfetti.value = false, 2000)
    }
}

function finish() {
    emit('complete')
    emit('close')
}

watch(() => props.isOpen, (val) => {
    if (!val) {
        if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
        setTimeout(() => {
            currentSlide.value = 0
            answerRevealed.value = false
            revealedSteps.value = 0
            selectedAnswer.value = null
            linkCopied.value = false
        }, 500)
        window.removeEventListener('resize', updateScale)
        window.removeEventListener('keydown', handleKeydown)
    } else {
        window.addEventListener('keydown', handleKeydown)
        window.addEventListener('resize', updateScale)
        nextTick(() => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(e => {
                    console.log('Fullscreen request denied:', e)
                })
            }
            updateScale()
        })
    }
})

// Keyboard navigation
function handleKeydown(e) {
    if (!props.isOpen) return
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

    if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        const slide = slides.value[currentSlide.value]
        if (!slide) return
        
        const isStepsLayout = (slide.layout === 'steps' || slide.layout === 'exercise' || slide.layout === 'worked-example' || slide.layout === 'recap')
        const maxSteps = slide.steps ? slide.steps.length : (slide.questions ? slide.questions.length : 0)

        if (isStepsLayout && maxSteps && revealedSteps.value < maxSteps) {
            if (localStorage.getItem('teacher_unlocked') !== 'true') {
                const correctPwd = props.config?.groenAntwoord || '1234'
                const pwd = window.prompt('Leerkracht-beveiliging:\nVoer het wachtwoord in om antwoorden te onthullen:')
                if (pwd && pwd.trim().toLowerCase() === correctPwd.toLowerCase()) {
                    localStorage.setItem('teacher_unlocked', 'true')
                    revealNextStep(maxSteps)
                } else if (pwd !== null) {
                    alert('Ongeldig wachtwoord.')
                }
            } else {
                revealNextStep(maxSteps)
            }
        }
        return
    }

    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        advancePresentation()
    }
    if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevSlide()
    }
}

const handleFullscreenChange = () => {
    if (props.isOpen && !document.fullscreenElement) {
        emit('close')
    }
}

onMounted(() => {
    window.addEventListener('resize', updateScale)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('resize', updateScale)
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

const iconMap = {
    lightbulb: PhLightbulb, star: PhStar,
    check: PhCheckCircle, x: PhXCircle,
    function: PhFunction, triangle: PhTriangle, users: PhUsers,
    brain: PhBrain, target: PhTarget, 'presentation-chart': PhChartLineUp,
    wrench: PhWrench, globe: PhGlobeHemisphereWest,
    'arrow-down': PhArrowDown, 'trend-down': PhTrendDown,
    'arrow-fat-down': PhArrowFatDown, 'arrow-line-down': PhArrowLineDown,
    'arrow-from-surface': (props) => h(PhUploadSimple, { ...props, style: 'transform: scaleY(-1)' }),
    'upload-simple': PhUploadSimple, 'book-open': PhBookOpen,
    'hand-pointing': PhHandPointing, 'hourglass': PhHourglassLow,
    'user-focus': PhUserFocus, 'speaker-slash': PhSpeakerSlash,
    info: PhInfo,
    'definition': PhBookOpenText,
    'worked-example': PhChalkboardTeacher,
    'value-table': PhTable,
    'properties': PhListChecks,
    'graph': PhGraph,
    'calculator': PhCalculator,
    'infinity': PhInfinity,
    'exercise': PhNotePencil,
    'comparison': PhChartLineUp,
    'steps': PhListChecks,
    'formula': PhFunction,
    'chart': PhChartLineUp,
    'ruler': PhArrowLineDown,
    'compass': PhTriangle,
    'pi': PhFunction
}


provide('resolveImageUrl', resolveImageUrl)
provide('iconMap', iconMap)

function resolveImageUrl(url) {
    if (!url) return ''
    if (url.startsWith('http') || url.startsWith('data:')) return url
    const baseUrl = import.meta.env.BASE_URL || '/'
    let normalizedUrl = url
    if (normalizedUrl.startsWith('./')) normalizedUrl = normalizedUrl.substring(2)
    if (normalizedUrl.startsWith('/')) normalizedUrl = normalizedUrl.substring(1)
    return baseUrl.endsWith('/') ? baseUrl + normalizedUrl : baseUrl + '/' + normalizedUrl
}
</script>

<template>
<Teleport to="body">
    <Transition name="fade">
        <div v-if="isOpen" class="fixed inset-0 z-[9999] bg-surface-200 text-ink flex flex-col font-sans overflow-hidden w-screen h-screen">
            


            <!-- Success Popup - Simplified -->
            <div v-if="showConfetti" class="fixed inset-0 z-[150] pointer-events-none flex items-center justify-center bg-black/30">
                <div class="bg-white px-12 py-8 rounded-2xl shadow-2xl flex items-center gap-6 animate-[fadeInUp_0.3s_ease-out]">
                    <div class="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                        <PhCheck weight="bold" class="text-4xl text-white" />
                    </div>
                    <span class="text-4xl font-bold text-ink-dark">Correct!</span>
                </div>
            </div>
            
                <div ref="containerRef" class="slide-viewport">
                <div ref="stageRef" class="ppt-stage" :style="{ transform: `scale(${scale})` }">
                    
                    <Transition :name="transitionName">
                        <div :key="currentSlide" class="absolute inset-0 w-full h-full">
                            
                            <div class="w-full h-full relative">
                                
                                
                                <component 
                                    v-if="layoutComponentMap[slides[currentSlide].layout]"
                                    :is="layoutComponentMap[slides[currentSlide].layout]" 
                                    :slide="slides[currentSlide]"
                                    :revealedSteps="revealedSteps"
                                    :parsedCursusLink="parsedCursusLink"
                                    :currentMathConfigForAnalysis="currentMathConfigForAnalysis"
                                    @revealNext="revealNextStep"
                                    @selectAnswer="selectAnswer"
                                    @copyLink="copyLink"
                                    @showConfetti="() => { showConfetti = true; setTimeout(() => showConfetti = false, 2000) }"
                                />
                                <div v-else class="flex items-center justify-center w-full h-full bg-white text-3xl text-red-500">
                                    Unknown Slide Layout: {{ slides[currentSlide].layout }}
                                </div>


                            </div>
                        </div>
                    </Transition>
                </div>

                <!-- Footer Navigation -->
                <div class="absolute bottom-0 left-0 right-0 h-11 bg-chrome-dark border-t border-chrome-border z-[80] flex items-center justify-between px-6">
                    <!-- Left: Slide counter -->
                    <div class="flex items-center gap-2">
                        <span class="text-white/60 text-[1.2rem] font-mono">
                            {{ currentSlide + 1 }} <span class="opacity-40">/ {{ totalSlides }}</span>
                        </span>
                    </div>
                    
                    <!-- Center: Navigation arrows -->
                    <div class="flex items-center gap-2">
                        <button @click.stop="prevSlide" 
                                class="text-white/60 hover:text-white hover:bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
                                :disabled="currentSlide === 0">
                            <PhCaretLeft weight="bold" class="text-[1.4rem]" />
                        </button>
                        
                        <button @click.stop="advancePresentation" 
                                class="text-white/60 hover:text-white hover:bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
                                :disabled="currentSlide === totalSlides - 1 && (!slides[currentSlide]?.steps || slides[currentSlide].layout === 'exercise' || revealedSteps === slides[currentSlide].steps.length) && (!slides[currentSlide]?.revealText || answerRevealed)">
                            <PhCaretRight weight="bold" class="text-[1.4rem]" />
                        </button>
                    </div>
                    
                    <!-- Right: Progress bar -->
                    <div class="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div class="h-full bg-amber-500 transition-all duration-300" :style="{ width: progressPercentage + '%' }"></div>
                    </div>
                </div>            
            </div>
        </div>
    </Transition>
</Teleport>
</template>

<style scoped>
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
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
</style>
