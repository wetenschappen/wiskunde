<script setup>
import { computed } from 'vue'
import { PhCheckCircle, PhCaretRight } from '@phosphor-icons/vue'

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

defineEmits(['click'])

// ---- Card border & left-stripe class (from style.css)
const typeClasses = computed(() => ({
  'class':   'card-class',
  'paper':   'card-paper',
  'digital': 'card-digital',
  'check':   'card-check'
}[props.type]))

// ---- Badge label
const badgeText = computed(() => ({
  'class':   'Klassikaal',
  'paper':   'Werkboek',
  'digital': 'Digitaal',
  'check':   'Vastzetting'
}[props.type]))

// ---- Badge colors (all types now have consistent hover)
const badgeClasses = computed(() => ({
  'class':   'badge-class   group-hover:bg-rose-100',
  'paper':   'badge-paper   group-hover:bg-emerald-100',
  'digital': 'badge-digital group-hover:bg-indigo-100',
  'check':   'badge-check   group-hover:bg-rose-100'
}[props.type]))

// ---- Action text + caret color — unified per type
const actionClass = computed(() => ({
  'class':   'text-rose-600',
  'paper':   'text-emerald-600',
  'digital': 'text-indigo-600',
  'check':   'text-rose-600'
}[props.type]))

// ---- Subtle body background tint per type (shows on hover of the card)
const bodyTintClass = computed(() => ({
  'class':   'group-hover:bg-rose-50/40',
  'paper':   'group-hover:bg-emerald-50/40',
  'digital': 'group-hover:bg-indigo-50/40',
  'check':   'group-hover:bg-rose-50/40'
}[props.type]))
</script>

<template>
  <button
    @click="!locked && $emit('click')"
    :class="['card group text-left', typeClasses, { 'card-interactive': !locked, 'card-locked': locked, 'card-done': isDone }]"
  >
    <!-- Done checkmark -->
    <div class="status-icon absolute bottom-4 right-4 text-emerald-500 opacity-0 transform scale-50 transition-all duration-300">
      <PhCheckCircle weight="fill" class="text-2xl" />
    </div>

    <!-- Subtle background tint layer (sits behind text content) -->
    <div :class="['absolute inset-0 rounded-[inherit] transition-colors duration-300 pointer-events-none', bodyTintClass]"></div>

    <!-- Content (above tint layer) -->
    <div class="relative">
      <!-- Badge -->
      <div class="mb-3">
        <span :class="['badge transition-colors', badgeClasses]">{{ badgeText }}</span>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-bold text-slate-900 mb-2">{{ title }}</h3>

      <!-- Description -->
      <p class="text-sm mb-4 leading-relaxed text-slate-500">{{ description }}</p>

      <!-- Action row -->
      <div :class="['flex items-center gap-1 text-sm font-bold transition-transform group-hover:translate-x-0.5', actionClass]">
        <slot name="action"></slot>
        <PhCaretRight weight="bold" class="text-xs opacity-70" />
      </div>
    </div>
  </button>
</template>
