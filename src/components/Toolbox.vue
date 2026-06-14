<script setup>
import { ref } from 'vue'
import { PhWrench, PhCalculator, PhAtom, PhX, PhFilePdf, PhEnvelope, PhCheckCircle, PhCheck, PhLink, PhMathOperations, PhGraph } from '@phosphor-icons/vue'

const props = defineProps({
    extraTools: {
        type: Array,
        default: () => []
    }
})

const isOpen = ref(false)
const toggle = () => isOpen.value = !isOpen.value

const emit = defineEmits(['open-tool', 'open-pdf'])

const teacherEmail = 'albert.shalaj@student.odisee.be'
const formulariumUrl = 'https://albertshalaj.github.io/lesmateriaal/formularium-wiskunde.pdf'
const desmosUrl = 'https://www.desmos.com/calculator'

const copied = ref(false)
function copyEmail() {
    navigator.clipboard.writeText(teacherEmail)
    copied.value = true
    setTimeout(() => {
        copied.value = false
        toggle()
    }, 2000)
}

function openToolLink(url) {
    window.open(url, '_blank')
    toggle()
}

// Map strings to Phosphor icons
const iconMap = {
    PhAtom,
    PhFilePdf,
    PhLink,
    PhCalculator,
    PhMathOperations
}
</script>

<template>
  <div>
    <button @click="toggle" class="fab-btn" :class="{'rotate-45': isOpen}">
        <PhWrench v-if="!isOpen"/>
        <PhX v-else />
    </button>

    <div :class="['toolbox-menu', { 'open': isOpen }]">
        <div class="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Tools</div>

        <button @click="emit('open-tool', 'calc'); toggle()" class="tool-item">
            <PhCalculator class="text-emerald-600 text-lg" weight="bold" /> Rekenmachine
        </button>

        <button @click="emit('open-pdf'); toggle()" class="tool-item">
            <PhFilePdf class="text-slate-600 text-lg" weight="bold" /> Lege Cursus
        </button>

        <button @click="openToolLink('https://wetenschappen.github.io/verbeteren/4nw.pdf'); toggle()" class="tool-item group flex flex-col items-start gap-1">
            <div class="flex items-center gap-2">
                <PhCheckCircle class="text-indigo-600 text-lg" weight="bold" /> Correctiesleutel
            </div>
            <div class="text-[10px] text-indigo-400/80 font-bold ml-6 uppercase tracking-wider"></div>
        </button>

        <!-- Math Tools -->
        <button @click="openToolLink(formulariumUrl)" class="tool-item">
            <PhMathOperations class="text-purple-600 text-lg" weight="bold" /> Formularium
        </button>
        <button @click="openToolLink(desmosUrl)" class="tool-item">
            <PhGraph class="text-green-600 text-lg" weight="bold" /> Desmos Grafieken
        </button>

        <!-- Dynamic Extra Tools -->
        <button v-for="(tool, idx) in extraTools" :key="idx" @click="openToolLink(tool.url)" class="tool-item">
            <component :is="iconMap[tool.icon] || PhLink" :class="tool.color || 'text-slate-600'" class="text-lg" weight="bold" />
            {{ tool.label }}
        </button>

        <!-- Divider -->
        <div class="border-t border-slate-100 my-2"></div>

        <div class="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Hulp Nodig?</div>

        <!-- Contact (Copy Email) -->
        <button 
            @click="copyEmail" 
            class="tool-item group/mail relative overflow-hidden"
            :class="copied ? 'bg-emerald-50' : ''"
        >
            <template v-if="copied">
                <div class="flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]">
                    <div class="bg-emerald-500 text-white p-1.5 rounded-lg shadow-sm">
                        <PhCheck weight="bold" class="text-sm" />
                    </div>
                    <div>
                        <span class="text-emerald-700 font-bold text-xs block leading-tight">Gekopieerd!</span>
                        <span class="text-[10px] text-emerald-600/70 block uppercase font-black tracking-wider">Klaar om te plakken</span>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="flex items-center gap-3 group-hover/mail:translate-x-1 transition-transform">
                    <div class="bg-amber-100 text-amber-600 p-2 rounded-lg group-hover/mail:bg-amber-500 group-hover/mail:text-white transition-colors">
                        <PhEnvelope weight="bold" class="text-lg" />
                    </div>
                    <div class="flex flex-col">
                        <span class="text-slate-700 font-bold text-xs leading-tight">Mail de leerkracht</span>
                        <span class="text-[10px] text-slate-400 font-medium mt-0.5">Klik om e-mailadres te kopiëren</span>
                    </div>
                </div>
            </template>
        </button>
    </div>
  </div>
</template>
