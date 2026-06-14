<script setup>
import { inject, computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'definition' }, // definition, formula, solution, property, concept
  title:   { type: String, default: '' },
  icon:    { type: String, default: '' },
})

const iconMap = inject('iconMap', {})
const resolvedIcon = computed(() => iconMap[props.icon])

const themeClasses = computed(() => {
  // Revert back to Navy and Amber colors for consistency and lower cognitive load
  switch (props.variant) {
    case 'formula':
    case 'property':
      return {
        container: 'bg-white border-amber-200',
        iconBg: 'bg-amber-100 text-amber-700',
        title: 'text-amber-900'
      }
    case 'definition':
    case 'solution':
    case 'concept':
    default:
      return {
        container: 'bg-white border-slate-200',
        iconBg: 'bg-slate-100 text-slate-700',
        title: 'text-slate-900'
      }
  }
})
</script>

<template>
  <div class="rounded-xl p-8 border shadow-sm transition-all duration-300" :class="themeClasses.container">
    <!-- Header Inside Card -->
    <div v-if="title" class="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
      <div v-if="resolvedIcon" 
           class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
           :class="themeClasses.iconBg">
        <component
          :is="resolvedIcon"
          weight="fill"
          class="text-[1.6rem]"
        />
      </div>
      <h4 class="text-[1.8rem] font-bold tracking-tight" :class="themeClasses.title" v-html="title" />
    </div>
    
    <!-- Content Area -->
    <div class="text-[1.6rem] text-slate-700 leading-relaxed">
      <slot />
    </div>
  </div>
</template>

<style scoped>
h4, div {
  font-family: 'Open Sans', sans-serif;
}
</style>
