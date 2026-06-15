<script setup>
import { PhBookOpen, PhX, PhCheckCircle } from '@phosphor-icons/vue'

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

const placeholderExercises = [
    { nr: 'Oef 1', title: 'Oefening over breuken',  page: 'p19' },
    { nr: 'Oef 2', title: 'Vermenigvuldiging',       page: 'p21' },
    { nr: 'Oef 3', title: 'Deling met rest',         page: 'p23' },
]

const exercises = (props.workbook?.exercises?.length) ? props.workbook.exercises : null
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop open" @click="close">
    <div class="modal-content max-w-md" @click.stop>

      <!-- Header -->
      <div class="px-6 pt-5 pb-4 flex justify-between items-start border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="bg-emerald-100 text-emerald-700 p-2 rounded-lg flex-shrink-0">
            <PhBookOpen weight="fill" class="text-lg" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 leading-tight">{{ workbook.title || 'Werkboek' }}</h3>
            <p v-if="workbook.subtitle" class="text-xs text-slate-500 mt-0.5">{{ workbook.subtitle }}</p>
          </div>
        </div>
        <button @click="close" class="btn-close -mr-1 -mt-1">
          <PhX class="text-lg" />
        </button>
      </div>

      <!-- Exercise list -->
      <div class="px-6 py-5">

        <!-- Column labels -->
        <div class="grid grid-cols-[3rem_1fr_4rem] gap-4 pb-2 border-b-2 border-slate-300">
          <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">#</span>
          <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Oefening</span>
          <span class="text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Pagina</span>
        </div>

        <!-- Real exercises -->
        <template v-if="exercises">
          <div
            v-for="(ex, idx) in exercises"
            :key="idx"
            class="grid grid-cols-[3rem_1fr_4rem] gap-4 py-3.5 border-b border-slate-100 last:border-0 items-baseline"
          >
            <span class="text-sm font-bold text-emerald-700 tabular-nums">{{ ex.nr }}</span>
            <span class="text-sm font-semibold text-slate-900">{{ ex.title }}</span>
            <span class="text-sm font-bold text-slate-700 text-right tabular-nums">{{ ex.page }}</span>
          </div>
        </template>

        <!-- Placeholder rows -->
        <template v-else>
          <div
            v-for="(ex, idx) in placeholderExercises"
            :key="idx"
            class="grid grid-cols-[3rem_1fr_4rem] gap-4 py-3.5 border-b border-slate-100 last:border-0 items-baseline"
          >
            <span class="text-sm font-bold text-emerald-600 tabular-nums">{{ ex.nr }}</span>
            <span class="text-sm font-medium text-slate-500">{{ ex.title }}</span>
            <span class="text-sm font-semibold text-slate-400 text-right tabular-nums">{{ ex.page }}</span>
          </div>
        </template>

        <!-- Done button -->
        <div class="mt-6 flex justify-center">
          <button
            @click="completeAndClose"
            class="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-lg py-3 px-14 rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2.5"
          >
            <PhCheckCircle weight="bold" class="text-xl" />
            Sluiten
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
