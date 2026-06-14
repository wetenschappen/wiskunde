<script setup>
import { computed } from 'vue'
import { PhCheckCircle } from '@phosphor-icons/vue'

const props = defineProps({
  type: {
    type: String,
    default: 'digital' // 'class', 'paper', 'digital', 'check'
  },
  meta: String,
  title: String,
  description: String,
  time: String,
  isDone: Boolean,
  locked: Boolean
})

const emit = defineEmits(['click'])

const typeClasses = computed(() => {
  return {
    'class': 'card-class',
    'paper': 'card-paper',
    'digital': 'card-digital',
    'check': 'card-check'
  }[props.type]
})

// Fixed badge text based on card type
const badgeText = computed(() => {
  return {
    'class': 'Klassikaal',
    'paper': 'Werkboek',
    'digital': 'Digitaal',
    'check': 'Vastzetting'
  }[props.type]
})

const badgeClasses = computed(() => {
   return {
    'class': 'badge-class group-hover:bg-rose-100',
    'paper': 'badge-paper group-hover:bg-emerald-100',
    'digital': 'badge-digital',
    'check': 'badge-check group-hover:bg-violet-100'
   }[props.type]
})

const actionClass = computed(() => {
    return {
        'class': 'text-rose-600',
        'paper': 'text-emerald-600',
        'digital': 'text-indigo-600 group-hover:translate-x-1',
        'check': 'text-rose-600'
    }[props.type]
})
</script>

<template>
  <button 
    @click="!locked && emit('click')"
    :class="['card group text-left', typeClasses, { 'card-interactive': !locked, 'card-locked': locked, 'card-done': isDone }]"
  >
    <div class="status-icon absolute bottom-4 right-4 text-emerald-500 opacity-0 transform scale-50 transition-all duration-300">
         <PhCheckCircle weight="fill" class="text-2xl" />
    </div>

    <div class="mb-3">
        <span :class="['badge transition-colors', badgeClasses]">{{ badgeText }}</span>
    </div>
    <h3 class="text-lg font-bold text-slate-900 mb-2">{{ title }}</h3>
    <p class="text-sm mb-4 leading-relaxed text-slate-500">{{ description }}</p>
    
    <div :class="['flex items-center text-sm font-bold transition-transform', actionClass]">
         <slot name="action"></slot>
    </div>
  </button>
</template>
