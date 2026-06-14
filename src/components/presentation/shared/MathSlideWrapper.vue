<script setup>
import { inject, computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  badge: { type: String, default: '' },
  padding: { type: String, default: 'px-16 pb-6' }
})

const iconMap = inject('iconMap', {})

const resolvedIcon = computed(() => {
  const b = (props.badge || '').toUpperCase()
  let iconName = 'info'
  
  if (b.includes('THEORIE') || b.includes('DEFINITIE')) {
    iconName = 'definition'
  } else if (b.includes('OEFENING') || b.includes('QUIZ')) {
    iconName = 'exercise'
  } else if (b.includes('VOORBEELD') || b.includes('UITWERKING') || b.includes('OPLOSSEN')) {
    iconName = 'worked-example'
  } else if (b.includes('FORMULE') || b.includes('REGEL')) {
    iconName = 'formula'
  } else if (b.includes('GRAFIEK')) {
    iconName = 'graph'
  } else if (b.includes('STAPPENPLAN')) {
    iconName = 'steps'
  } else if (b.includes('WAARDETABEL')) {
    iconName = 'value-table'
  } else if (b.includes('EIGENSCHAPPEN')) {
    iconName = 'properties'
  } else if (b.includes('SAMENVATTING')) {
    iconName = 'check'
  } else if (b.includes('TOEPASSING')) {
    iconName = 'globe'
  } else if (b.includes('VOORKENNIS') || b.includes('DENKVRAAG')) {
    iconName = 'lightbulb'
  } else if (b.includes('BEWIJS') || b.includes('STELLING')) {
    iconName = 'triangle'
  }
  
  return iconMap[iconName] || iconMap['info']
})
</script>

<template>
  <div class="w-full h-full flex flex-col bg-white relative">
    <!-- Thinner, High-Contrast Navy Header Bar with Amber Icon Badge -->
    <div class="h-[80px] shrink-0 flex items-center px-16 bg-slate-900 border-b-4 border-amber-500 text-white relative z-10">
      <div class="flex items-center gap-4">
        <!-- Premium Icon Badge -->
        <div v-if="badge" class="w-10 h-10 rounded-lg bg-amber-500 text-slate-900 border border-amber-400 flex items-center justify-center shrink-0 shadow-sm">
          <component :is="resolvedIcon" weight="bold" class="text-[1.6rem]" />
        </div>
        <h2 v-if="title" class="text-[2.4rem] font-bold text-white tracking-tight" v-html="title"></h2>
      </div>
    </div>
    
    <!-- Scrollable Content Area -->
    <div class="flex-1 overflow-y-auto relative z-10 exercise-scroll bg-white" :class="padding">
      <div class="h-6 w-full shrink-0"></div> <!-- Top spacing -->
      <slot />
      <div class="h-20 w-full shrink-0"></div> <!-- Bottom spacer to avoid overlap with navigation footer -->
    </div>
  </div>
</template>

<style scoped>
h2, span {
  font-family: 'Open Sans', sans-serif;
}
</style>
