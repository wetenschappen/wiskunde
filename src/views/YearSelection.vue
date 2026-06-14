<script setup>
import { useRouter } from 'vue-router'
import { PhPi, PhStudent, PhGraduationCap } from '@phosphor-icons/vue'

const router = useRouter()

const years = [
  {
    id: 3,
    title: '3de Jaar',
    subtitle: 'Wiskunde (D5)',
    icon: PhStudent,
    color: 'text-brand-orange',
    bg: 'bg-orange-50',
    hover: 'hover:shadow-[0_20px_40px_rgb(234,88,12,0.15)]',
    hoverText: 'group-hover:text-brand-orange'
  },
  {
    id: 4,
    title: '4de Jaar',
    subtitle: 'Wiskunde (D5)',
    icon: PhGraduationCap,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    hover: 'hover:shadow-[0_20px_40px_rgb(16,185,129,0.15)]',
    hoverText: 'group-hover:text-emerald-500'
  }
]
</script>

<template>
  <div class="min-h-screen pt-20 px-6 max-w-4xl mx-auto relative z-10 font-sans">
    <div class="mb-20 text-center">
      <div class="w-24 h-24 mx-auto bg-white/70 backdrop-blur-md rounded-[24px_8px_24px_8px] border border-white/50 shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex items-center justify-center mb-8 transform hover:scale-105 transition-transform duration-500">
        <PhPi weight="duotone" class="text-[4rem] text-brand-dark" />
      </div>
      <h1 class="text-[4.5rem] font-bold text-slate-800 tracking-tight leading-tight mb-4">Wiskunde Leren</h1>
      <p class="text-[1.8rem] text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">Kies je leerjaar om aan de slag te gaan met interactieve theorie en oefeningen.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto">
      <div v-for="year in years" :key="year.id" 
           @click="router.push('/year/' + year.id)"
           :class="['group cursor-pointer bg-white/70 backdrop-blur-md border border-white/60 p-10 rounded-[32px_12px_32px_12px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2', year.hover]">
        <div class="flex items-center gap-6 mb-8">
          <div :class="['w-20 h-20 rounded-[18px_8px_18px_8px] flex items-center justify-center shadow-sm', year.bg]">
            <component :is="year.icon" weight="fill" :class="['text-[3rem]', year.color]" />
          </div>
        </div>
        <h3 :class="['text-[3rem] font-bold text-slate-800 leading-tight transition-colors', year.hoverText]">{{ year.title }}</h3>
        <p class="text-[1.5rem] text-slate-500 mt-2 font-medium tracking-wide uppercase">{{ year.subtitle }}</p>
        
        <div :class="['mt-10 flex items-center font-bold text-[1.6rem] opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300', year.color]">
          <span>Kies Jaar</span>
          <svg class="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </div>
      </div>
    </div>
  </div>
</template>
