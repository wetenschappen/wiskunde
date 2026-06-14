<script setup>
import { inject } from 'vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 },
    parsedCursusLink: { type: Object, default: () => ({}) },
    currentMathConfigForAnalysis: { type: Object, default: null }
})

const emit = defineEmits(['revealNext', 'selectAnswer', 'checkAnswer', 'copyLink', 'showConfetti'])

const resolveImageUrl = inject('resolveImageUrl')
</script>

<template>
<div class="absolute inset-0 bg-slate-900 flex items-center justify-center select-none">
     <div class="relative w-full h-full overflow-hidden group">
         <img :src="resolveImageUrl(slide.image)" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-60" />
         
         <!-- Content Overlay -->
         <div class="absolute inset-0 flex flex-col items-center justify-center p-20 text-center z-10">
             <div class="bg-amber-500 w-16 h-1 mb-8"></div>
             <h3 class="text-8xl font-serif italic text-white mb-6 tracking-tight drop-shadow-2xl" v-html="slide.title"></h3>
             <p v-if="slide.subtitle" class="text-4xl text-amber-100 font-light max-w-4xl leading-relaxed drop-shadow-lg" v-html="slide.subtitle"></p>
         </div>
         
         <!-- Subtle Gradient Bottom -->
         <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
         
         <div v-if="slide.credit" class="absolute bottom-10 right-10 text-white/40 text-sm font-mono uppercase tracking-[0.2em] z-20">
             {{ slide.credit }}
         </div>
     </div>
</div>
</template>

<style scoped>
</style>
