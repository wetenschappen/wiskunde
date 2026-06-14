<script setup>
import { computed } from 'vue'
import { PhCheck, PhClock } from '@phosphor-icons/vue'

const props = defineProps({
  step: String, // 'A', 'B', etc
  title: String,
  subtitle: String,
  time: String,
  isLast: Boolean,
  status: {
    type: String,
    default: 'pending' // 'pending', 'active', 'done'
  }
})

const isDone = computed(() => props.status === 'done')
const isActive = computed(() => props.status === 'active' || isDone.value)
</script>

<template>
  <div :class="['timeline-line', { 'active': isActive, 'pb-12': !isLast, 'pb-0': isLast }]">
    <div :class="['timeline-icon absolute -left-[23px] top-0', { 'active': isActive }]">
       <PhCheck v-if="isDone" weight="bold" class="text-xl" />
       <span v-else>{{ step }}</span>
    </div>

    <div class="mb-6 pt-1">
      <h2 class="text-2xl font-bold text-slate-800">{{ title }}</h2>
      <div class="flex items-center gap-3 text-sm mt-1">
        <button 
          @click="$emit('start-timer', time)" 
          class="text-slate-400 flex items-center gap-1 hover:text-amber-600 hover:bg-amber-50 px-1.5 py-0.5 rounded transition-colors cursor-pointer" 
          title="Start Timer"
        >
          <PhClock /> {{ time }}
        </button>
      </div>
    </div>

    <slot></slot>
  </div>
</template>
