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
  <div class="w-full h-full flex flex-col items-center justify-center p-20 bg-white relative">
    <div class="w-full max-w-7xl flex flex-col h-full">
      <!-- Planner Academic Header -->
      <div v-if="title" class="flex items-center gap-8 mb-16 shrink-0">
          <div class="h-24 w-2 bg-amber-500 shrink-0"></div>
          <h3 class="text-7xl font-bold text-slate-900 tracking-tight" v-html="title"></h3>
          
          <!-- Badge -->
          <div v-if="badge" class="ml-auto flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
             <component :is="resolvedIcon" weight="duotone" class="text-3xl text-amber-500" />
             <span class="text-xl font-bold uppercase tracking-widest text-slate-500">{{ badge }}</span>
          </div>
      </div>
      
      <!-- Scrollable Content Area -->
      <div class="flex-1 w-full exercise-scroll overflow-y-auto relative z-10" :class="padding">
        <slot />
        <div class="h-20 w-full shrink-0"></div> <!-- Bottom spacer -->
      </div>
    </div>
  </div>
</template>

<style scoped>
h2, span {
  font-family: 'Open Sans', sans-serif;
}
</style>
