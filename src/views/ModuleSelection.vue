<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PhPi, PhArrowLeft } from '@phosphor-icons/vue'
import { modules } from '../data/modules'

const router = useRouter()
const route = useRoute()

const yearId = computed(() => parseInt(route.params.id))
const filteredModules = computed(() => modules.filter(m => m.year === yearId.value))

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen pt-20 px-6 max-w-5xl mx-auto relative z-10 font-sans">
    <div class="mb-12">
      <button @click="goBack" class="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-semibold text-[1.4rem]">
        <PhArrowLeft weight="bold" class="mr-2" />
        Terug naar Jaar Keuze
      </button>
    </div>

    <div class="mb-16 text-center">
      <div class="w-24 h-24 mx-auto bg-white/70 backdrop-blur-md rounded-[24px_8px_24px_8px] border border-white/50 shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex items-center justify-center mb-8 transform hover:scale-105 transition-transform duration-500">
        <PhPi weight="duotone" class="text-[4rem] text-brand-dark" />
      </div>
      <h1 class="text-[4.5rem] font-bold text-slate-800 tracking-tight leading-tight mb-4">{{ yearId }}de Jaar Wiskunde</h1>
      <p class="text-[1.8rem] text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">Kies een module om aan de slag te gaan met interactieve theorie en oefeningen.</p>
    </div>

    <div v-if="filteredModules.length === 0" class="text-center py-20">
      <p class="text-[2rem] text-slate-400">Nog geen modules beschikbaar voor dit jaar.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="chapter in filteredModules" :key="chapter.id" 
           @click="router.push('/les/' + chapter.id)"
           class="group cursor-pointer bg-white/70 backdrop-blur-md border border-white/60 p-8 rounded-[24px_8px_24px_8px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2"
           :class="[yearId === 3 ? 'hover:shadow-[0_20px_40px_rgb(234,88,12,0.15)]' : 'hover:shadow-[0_20px_40px_rgb(16,185,129,0.15)]']">
        <div class="flex items-center gap-4 mb-8">
          <div :class="['w-16 h-16 rounded-[14px_6px_14px_6px] flex items-center justify-center shadow-sm', chapter.bg]">
            <component :is="chapter.icon" weight="fill" :class="['text-[2.2rem]', chapter.color]" />
          </div>
          <span class="text-[1.2rem] font-bold text-slate-400 uppercase tracking-widest">{{ chapter.grade }}</span>
        </div>
        <h3 :class="['text-[2.2rem] font-bold text-slate-800 leading-tight transition-colors', yearId === 3 ? 'group-hover:text-brand-orange' : 'group-hover:text-emerald-500']">{{ chapter.title }}</h3>
        
        <div :class="['mt-8 flex items-center font-bold text-[1.4rem] opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300', yearId === 3 ? 'text-brand-orange' : 'text-emerald-500']">
          <span>Start Les</span>
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </div>
      </div>
    </div>
  </div>
</template>
