<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PhPi, PhArrowLeft, PhUsers } from '@phosphor-icons/vue'

const router = useRouter()
const route = useRoute()

const yearId = computed(() => parseInt(route.params.id))

// Static map of classes per year for now. You can easily adapt this list.
const classesMap = {
  1: [
    { id: '1A', name: '1A' },
    { id: '1B', name: '1B' }
  ],
  2: [
    { id: '2A', name: '2A' },
    { id: '2B', name: '2B' }
  ],
  3: [
    { id: '3NW', name: '3NW' },
    { id: '3HW', name: '3HW' },
    { id: '3EW', name: '3EW' }
  ],
  4: [
    { id: '4NW', name: '4NW' },
    { id: '4HW', name: '4HW' },
    { id: '4EW', name: '4EW' },
    { id: '4LT', name: '4LT' }
  ]
}

const availableClasses = computed(() => classesMap[yearId.value] || [])

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
      <h1 class="text-[4.5rem] font-bold text-slate-800 tracking-tight leading-tight mb-4">{{ yearId }}de Jaar</h1>
      <p class="text-[1.8rem] text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">Kies je specifieke klas om verder te gaan.</p>
    </div>

    <div v-if="availableClasses.length === 0" class="text-center py-20">
      <p class="text-[2rem] text-slate-400">Nog geen klassen beschikbaar voor dit jaar.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="cls in availableClasses" :key="cls.id" 
           @click="router.push('/year/' + yearId + '/class/' + cls.id)"
           class="group cursor-pointer bg-white/70 backdrop-blur-md border border-white/60 p-8 rounded-[24px_8px_24px_8px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(59,130,246,0.15)] transition-all duration-500 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <PhUsers weight="fill" class="text-3xl" />
        </div>
        <h3 class="text-[2.4rem] font-bold text-slate-800">{{ cls.name }}</h3>
      </div>
    </div>
  </div>
</template>
