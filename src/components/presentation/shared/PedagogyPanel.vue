<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'theory' }, // theory, formula, exercise, example
  title: { type: String, default: '' },
  icon: { type: String, default: '' }
})

const iconMap = inject('iconMap', {})
const resolvedIcon = computed(() => {
    if (props.icon && iconMap[props.icon]) return iconMap[props.icon]
    // Smart defaults based on variant
    switch(props.variant) {
        case 'theory': return iconMap['definition'] || iconMap['info']
        case 'formula': return iconMap['formula'] || iconMap['function']
        case 'exercise': return iconMap['exercise'] || iconMap['note-pencil']
        case 'example': return iconMap['worked-example'] || iconMap['chalkboard-teacher']
        default: return iconMap['info']
    }
})

const themeColors = computed(() => {
  // Revert back to clean Navy and Amber color scheme (reduces cognitive load)
  switch(props.variant) {
    case 'formula':
    case 'exercise':
      return { 
        accent: 'bg-amber-500 text-slate-900', 
        text: 'text-amber-900', 
        border: 'border-amber-200 bg-amber-50/10' 
      }
    case 'theory':
    case 'example':
    default:
      return { 
        accent: 'bg-slate-900 text-white', 
        text: 'text-slate-800', 
        border: 'border-slate-200 bg-white' 
      }
  }
})
</script>

<template>
  <div class="border rounded-xl p-8 mb-6 shadow-sm" :class="themeColors.border">
    <!-- Clean Header Inside Panel -->
    <div v-if="title" class="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
      <div class="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm shrink-0" :class="themeColors.accent">
        <component :is="resolvedIcon" weight="bold" class="text-[1.3rem]" />
      </div>
      <span class="text-[1.4rem] font-bold tracking-wider uppercase text-slate-800" v-html="title"></span>
    </div>

    <!-- Panel Content -->
    <div class="text-[1.6rem] text-slate-700 leading-relaxed">
      <slot />
    </div>
  </div>
</template>

<style scoped>
span, div {
  font-family: 'Open Sans', sans-serif;
}
</style>
