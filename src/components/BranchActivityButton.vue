<script setup>
import { PhCaretRight, PhCheckCircle } from '@phosphor-icons/vue'

defineProps({
  title: String,
  category: String,
  icon: Object, // The Phosphor icon component
  isDone: Boolean
})

defineEmits(['click'])
</script>

<template>
  <button 
    @click="$emit('click')"
    class="w-full p-3.5 bg-white/80 hover:bg-white rounded-xl border border-amber-200/60 hover:border-amber-400 flex items-center justify-between transition-all group shadow-sm hover:shadow-md mb-2 last:mb-0"
  >
    <div class="flex items-center gap-3">
      <!-- Icon Container -->
      <div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
        <component :is="icon" weight="bold" class="text-xl" />
      </div>

      <!-- Text Content -->
      <div class="text-left">
        <div class="text-[9px] font-black text-amber-600 uppercase tracking-widest">{{ category }}</div>
        <div class="text-slate-800 font-bold text-sm leading-tight">{{ title }}</div>
      </div>
    </div>

    <!-- Status Area -->
    <div class="flex items-center gap-2 pl-4 border-l border-slate-100">
      <PhCheckCircle v-if="isDone" weight="fill" class="text-emerald-500 text-xl" />
      <PhCaretRight v-else class="text-slate-300 group-hover:text-amber-500 text-xl transition-transform group-hover:translate-x-0.5" />
    </div>
  </button>
</template>
