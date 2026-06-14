<script setup>
import { shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import LessonContent from './LessonContent.vue'
import { PhSpinner } from '@phosphor-icons/vue'

const route = useRoute()
const lessonData = shallowRef(null)
const error = shallowRef(null)

watch(() => route.params.id, async (id) => {
  if (id) {
    lessonData.value = null
    error.value = null
    try {
      // Dynamic import
      const module = await import(`../lessons/${id}.js`)
      lessonData.value = module.default
    } catch(e) {
      console.error(e)
      error.value = "Kon de les niet laden."
    }
  }
}, { immediate: true })
</script>

<template>
  <LessonContent v-if="lessonData" :lessonData="lessonData" :key="route.params.id" />
  
  <div v-else-if="error" class="min-h-screen flex items-center justify-center relative z-10">
    <div class="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl text-center border border-red-200">
      <h2 class="text-2xl font-bold text-slate-800 mb-2">Fout</h2>
      <p class="text-slate-600">{{ error }}</p>
    </div>
  </div>
  
  <div v-else class="min-h-screen flex items-center justify-center relative z-10">
    <div class="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white flex flex-col items-center">
      <PhSpinner class="animate-spin text-brand-orange text-4xl mb-4" />
      <span class="text-slate-600 font-medium">Les wordt geladen...</span>
    </div>
  </div>
</template>

