<script setup>
defineProps({
  badge: String,
  title: String,
  description: String,
  goals: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <header class="mb-16 text-center">
    <div v-if="badge" class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-4 border border-slate-200">
      {{ badge }}
    </div>
    <h1 class="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">{{ title }}</h1>
    <p class="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
      {{ description }}
    </p>


  </header>
</template>
