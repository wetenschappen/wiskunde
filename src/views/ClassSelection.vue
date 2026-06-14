<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PhPi, PhArrowLeft, PhUsers } from '@phosphor-icons/vue'

const router = useRouter()
const route = useRoute()

const yearId = computed(() => parseInt(route.params.id))

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
      <h1 class="text-[3rem] md:text-[4rem] font-bold text-slate-800 tracking-tight leading-tight mb-2">{{ yearId }}de Jaar</h1>
      <p class="text-[1.2rem] md:text-[1.5rem] text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">Kies je klas om verder te gaan.</p>
    </div>

    <div v-if="availableClasses.length === 0" class="text-center py-12">
      <p class="text-[1.5rem] text-slate-400">Nog geen klassen beschikbaar voor dit jaar.</p>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto">
      <div v-for="cls in availableClasses" :key="cls.id" 
           @click="router.push('/year/' + yearId + '/class/' + cls.id)"
           class="group cursor-pointer bg-white border border-slate-200 p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:border-amber-500/50 transition-all duration-300 flex flex-col items-center justify-center text-center">
        <div class="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-slate-200 transition-colors">
          <PhUsers weight="fill" class="text-2xl" />
        </div>
        <h3 class="text-[1.8rem] font-extrabold text-brand-dark">{{ cls.name }}</h3>
      </div>
    </div>
  </div>
</template>
