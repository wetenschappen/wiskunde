<script setup>
import { ref } from 'vue'
import {
    PhWrench, PhX, PhFilePdf, PhEnvelope, PhCheck,
    PhLink, PhMathOperations, PhFunction, PhGraph,
    PhLockKey
} from '@phosphor-icons/vue'

const props = defineProps({
    subject: { type: String, default: 'math' },
    extraTools: { type: Array, default: () => [] }
})

const isOpen = ref(false)
const toggle = () => isOpen.value = !isOpen.value
const close  = () => isOpen.value = false

const emit = defineEmits(['open-tool', 'open-pdf'])

// ── Teacher email ──────────────────────────────────────
const teacherEmail = 'albert.shalaj@gmail.com'
const copied = ref(false)
function copyEmail() {
    navigator.clipboard.writeText(teacherEmail)
    copied.value = true
    setTimeout(() => { copied.value = false; close() }, 2000)
}

// ── External links ─────────────────────────────────────
const formulariumUrl  = 'https://albertshalaj.github.io/lesmateriaal/formularium-wiskunde.pdf'

const mathTools = [
    {
        label: 'Desmos Calculator',
        subtitle: 'Wetenschappelijke rekenmachine',
        url: 'https://www.desmos.com/scientific',
        icon: PhMathOperations,
        color: 'bg-emerald-100 text-emerald-700'
    },
    {
        label: 'Desmos Grafieken',
        subtitle: 'Interactieve grafiekenplotter',
        url: 'https://www.desmos.com/calculator',
        icon: PhGraph,
        color: 'bg-indigo-100 text-indigo-700'
    },
    {
        label: 'GeoGebra',
        subtitle: 'Meetkunde & algebra',
        url: 'https://www.geogebra.org/calculator',
        icon: PhFunction,
        color: 'bg-violet-100 text-violet-700'
    }
]

// Extra tools icon map (from lesson config)
const iconMap = { PhFilePdf, PhLink, PhMathOperations, PhGraph, PhFunction, PhLockKey }

function openLink(url) {
    window.open(url, '_blank')
    close()
}

function openTool(tool) {
    emit('open-tool', tool)
    close()
}

function openPdf() {
    emit('open-pdf')
    close()
}
</script>

<template>
  <div>
    <!-- ── FAB BUTTON ──────────────────────────────────── -->
    <button
        @click="toggle"
        class="fab-btn"
        :class="{ 'bg-amber-500 text-slate-900 hover:bg-amber-400': isOpen }"
        title="Werkbalk"
    >
        <PhWrench v-if="!isOpen" weight="bold" />
        <PhX v-else weight="bold" />
    </button>

    <!-- ── PANEL ──────────────────────────────────────── -->
    <!-- Backdrop (mobile) -->
    <div
        v-if="isOpen"
        class="fixed inset-0 z-30 sm:hidden"
        @click="close"
    ></div>

    <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-2"
    >
        <div
            v-if="isOpen"
            class="fixed bottom-24 right-6 z-40 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden origin-bottom-right"
        >
            <!-- Panel header -->
            <div class="bg-slate-900 px-4 py-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <PhWrench weight="bold" class="text-amber-500 text-base" />
                    <span class="text-xs font-black text-white uppercase tracking-widest">Werkbalk</span>
                </div>
                <button @click="close" class="btn-close-dark !p-1">
                    <PhX weight="bold" class="text-sm" />
                </button>
            </div>

            <div class="max-h-[70vh] overflow-y-auto">

                <!-- ── SECTION: Les ─────────────────────────────── -->
                <div class="px-3 pt-3 pb-1">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] px-2 mb-1.5">Les</p>

                    <!-- Correctiesleutel — top of list -->
                    <button @click="openTool('solutions')" class="tool-item w-full">
                        <div class="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                            <PhLockKey weight="bold" class="text-base" />
                        </div>
                        <div class="flex-1 text-left">
                            <div class="text-sm font-semibold text-slate-800 leading-tight">Correctiesleutel</div>
                            <div class="text-[10px] text-slate-400">Beveiligd met wachtwoord</div>
                        </div>
                        <span class="text-[9px] font-black bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0">Slot</span>
                    </button>

                    <!-- Cursus PDF -->
                    <button @click="openPdf()" class="tool-item w-full">
                        <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                            <PhFilePdf weight="bold" class="text-base" />
                        </div>
                        <div class="flex-1 text-left">
                            <div class="text-sm font-semibold text-slate-800 leading-tight">Lege Cursus</div>
                            <div class="text-[10px] text-slate-400">Open cursus als PDF</div>
                        </div>
                    </button>

                    <!-- Formularium -->
                    <button @click="openLink(formulariumUrl)" class="tool-item w-full">
                        <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                            <PhMathOperations weight="bold" class="text-base" />
                        </div>
                        <div class="flex-1 text-left">
                            <div class="text-sm font-semibold text-slate-800 leading-tight">Formularium</div>
                            <div class="text-[10px] text-slate-400">Wiskundige formules PDF</div>
                        </div>
                    </button>

                    <!-- Dynamic Extra Tools from lesson config -->
                    <button
                        v-for="(tool, idx) in extraTools"
                        :key="idx"
                        @click="openLink(tool.url)"
                        class="tool-item w-full"
                    >
                        <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                            <component :is="iconMap[tool.icon] || PhLink" weight="bold" class="text-base" :class="tool.color || 'text-slate-500'" />
                        </div>
                        <div class="flex-1 text-left">
                            <div class="text-sm font-semibold text-slate-800 leading-tight">{{ tool.label }}</div>
                        </div>
                    </button>
                </div>

                <div class="mx-3 border-t border-slate-100 my-1"></div>

                <!-- ── SECTION: Rekenmachines ────────────────────── -->
                <div class="px-3 pb-1">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] px-2 mb-1.5 pt-2">Rekenmachines</p>

                    <button
                        v-for="tool in mathTools"
                        :key="tool.label"
                        @click="openLink(tool.url)"
                        class="tool-item w-full"
                    >
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :class="tool.color">
                            <component :is="tool.icon" weight="bold" class="text-base" />
                        </div>
                        <div class="flex-1 text-left">
                            <div class="text-sm font-semibold text-slate-800 leading-tight">{{ tool.label }}</div>
                            <div class="text-[10px] text-slate-400">{{ tool.subtitle }}</div>
                        </div>
                    </button>
                </div>

                <div class="mx-3 border-t border-slate-100 my-1"></div>

                <!-- ── SECTION: Hulp ─────────────────────────────── -->
                <div class="px-3 pb-3">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] px-2 mb-1.5 pt-2">Contact</p>

                    <!-- Email copy button -->
                    <button
                        @click="copyEmail"
                        class="tool-item w-full"
                        :class="copied ? 'bg-emerald-50' : ''"
                    >
                        <template v-if="copied">
                            <div class="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                                <PhCheck weight="bold" class="text-base" />
                            </div>
                            <div class="flex-1 text-left">
                                <div class="text-sm font-semibold text-emerald-700 leading-tight">Gekopieerd!</div>
                                <div class="text-[10px] text-emerald-600/70">Klaar om te plakken</div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                <PhEnvelope weight="bold" class="text-base" />
                            </div>
                            <div class="flex-1 text-left">
                                <div class="text-sm font-semibold text-slate-800 leading-tight">Mail de leerkracht</div>
                                <div class="text-[10px] text-slate-400">Klik om e-mailadres te kopiëren</div>
                            </div>
                        </template>
                    </button>
                </div>
            </div>
        </div>
    </Transition>
  </div>
</template>
