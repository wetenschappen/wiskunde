<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PhPi, PhArrowLeft, PhCaretRight } from '@phosphor-icons/vue'
import { modules } from '../data/modules'

const router = useRouter()
const route = useRoute()

const yearId = computed(() => parseInt(route.params.id))
const classId = computed(() => route.params.classId)
const filteredModules = computed(() => modules.filter(m => m.year === yearId.value))

const goBack = () => {
  router.push('/year/' + yearId.value + '/class')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 relative z-10 font-sans">
    <div class="absolute top-8 left-8">
      <button @click="goBack" class="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-semibold text-[1.2rem]">
        <PhArrowLeft weight="bold" class="mr-2" />
        Terug
      </button>
    </div>

    <div class="mb-12 text-center">
      <div class="w-16 h-16 mx-auto bg-slate-100/80 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm flex items-center justify-center mb-6 transform hover:scale-105 transition-transform duration-500">
        <PhPi weight="duotone" class="text-[2.5rem] text-brand-dark" />
      </div>
      <h1 class="text-[3rem] md:text-[4rem] font-bold text-slate-800 tracking-tight leading-tight mb-2">Wiskunde {{ classId }}</h1>
      <p class="text-[1.2rem] md:text-[1.5rem] text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">Kies een module om te starten.</p>
    </div>

    <div v-if="filteredModules.length === 0" class="text-center py-12">
      <p class="text-[1.5rem] text-slate-400">Nog geen modules beschikbaar.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
      <div v-for="chapter in filteredModules" :key="chapter.id" 
           @click="router.push('/les/' + chapter.id)"
           class="group cursor-pointer bg-white border border-slate-200 p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300 hover:shadow-xl hover:border-amber-500/50 hover:-translate-y-0.5"
           >
        <div class="flex items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center shadow-inner transition-all duration-300"
                 :class="[chapter.bg || 'bg-slate-100', 'group-hover:scale-110']">
              <component :is="chapter.icon" weight="fill" class="text-[1.8rem] transition-colors"
                         :class="chapter.color || 'text-slate-500'" />
            </div>
            <span class="text-[1rem] font-bold text-slate-400 uppercase tracking-widest">{{ chapter.grade }}</span>
          </div>
          <PhCaretRight class="text-slate-300 group-hover:text-amber-500 text-xl transition-all group-hover:translate-x-0.5" />
        </div>
        <h3 class="text-[1.6rem] font-extrabold text-brand-dark leading-tight transition-colors group-hover:text-slate-700">{{ chapter.title }}</h3>
      </div>
    </div>
  </div>
</template>
