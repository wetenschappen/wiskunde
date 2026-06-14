<script setup>
import { ref } from 'vue'
import { PhBookOpen, PhX, PhLightbulb, PhLockKey, PhWarning, PhQuestion, PhListNumbers, PhMathOperations, PhCheckSquare, PhCaretDown, PhCaretUp, PhCheckCircle, PhArrowsClockwise } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  workbook: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'complete'])

function completeAndClose() {
    emit('complete')
    emit('close')
}

function close() {
    emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop open" @click="close">
    <div class="modal-content" @click.stop>
       <!-- Header -->
       <div class="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center z-10">
            <div class="flex items-center gap-3">
                <div class="bg-emerald-100 text-emerald-700 p-2 rounded-lg"><PhBookOpen weight="fill" class="text-xl"/></div>
                <div>
                    <h3 class="text-lg font-bold text-slate-900 m-0">{{ workbook.title || 'Werkboek' }}</h3>
                    <p class="text-xs text-slate-500 m-0">{{ workbook.subtitle || '' }}</p>
                </div>
            </div>
            <button @click="close" class="text-slate-400 hover:text-slate-700 p-2 rounded-full">
                <PhX class="text-2xl" />
            </button>
       </div>

       <div class="p-8 prose max-w-none overflow-y-auto">
            
            <!-- MAIN INSTRUCTION: What to do -->
            <div class="bg-white border-2 border-emerald-200 rounded-xl p-6 mb-6">
                <div class="flex items-start gap-4">
                    <div class="bg-emerald-100 text-emerald-600 p-3 rounded-xl flex-shrink-0">
                        <PhBookOpen weight="fill" class="text-2xl"/>
                    </div>
                    <div>
                        <h4 class="text-slate-900 font-bold text-lg mt-0 mb-2">Opdracht</h4>
                        <p class="text-slate-700 text-base m-0" v-html="workbook.instruction || 'Maak de oefeningen in je werkboek.'">
                        </p>
                        <p v-if="workbook.formulaHint" class="text-slate-500 text-sm mt-2 mb-0">
                            {{ workbook.formulaHint }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Completion Action -->
            <div class="mt-8 flex justify-center">
                 <button @click="completeAndClose" class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-all flex items-center gap-3">
                    <PhCheckCircle weight="bold" class="text-xl"/>
                    Ik ben klaar met de opdrachten
                 </button>
            </div>
       </div>
    </div>
  </div>
</template>
