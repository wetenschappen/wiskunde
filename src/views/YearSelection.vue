<script setup>
import { useRouter } from 'vue-router'
import { PhPi } from '@phosphor-icons/vue'

const router = useRouter()

const years = [
  {
    id: 1,
    title: '1ste Jaar',
    accentColor: 'text-amber-500',
    hoverBorder: 'hover:border-amber-500/50'
  },
  {
    id: 2,
    title: '2de Jaar',
    accentColor: 'text-amber-500',
    hoverBorder: 'hover:border-amber-500/50'
  },
  {
    id: 3,
    title: '3de Jaar',
    accentColor: 'text-slate-900',
    hoverBorder: 'hover:border-amber-500/50'
  },
  {
    id: 4,
    title: '4de Jaar',
    accentColor: 'text-slate-900',
    hoverBorder: 'hover:border-amber-500/50'
  }
]
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 relative z-10 font-sans">
    <div class="mb-12 text-center">
      <div class="w-16 h-16 mx-auto bg-slate-100/80 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm flex items-center justify-center mb-6 transform hover:scale-105 transition-transform duration-500">
        <PhPi weight="duotone" class="text-[2.5rem] text-brand-dark" />
      </div>
      <h1 class="text-[3rem] md:text-[4rem] font-bold text-slate-800 tracking-tight leading-tight mb-2">Digitaal Leerpad</h1>
      <p class="text-[1.2rem] md:text-[1.5rem] text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">Kies je leerjaar om aan de slag te gaan.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto">
      <div v-for="year in years" :key="year.id" 
           @click="router.push('/year/' + year.id + '/class')"
           :class="['group cursor-pointer bg-white border border-slate-200 p-8 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300 flex flex-col items-center text-center hover:shadow-xl', year.hoverBorder]">
        <div class="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center shadow-inner mb-6 group-hover:bg-slate-200 transition-colors duration-300">
          <span class="text-[2.5rem] font-black text-slate-500 group-hover:text-slate-700 transition-colors">{{ year.id }}</span>
        </div>
        <h3 :class="['text-[1.8rem] font-extrabold transition-colors', year.accentColor]">{{ year.title }}</h3>
      </div>
    </div>
  </div>
</template>
