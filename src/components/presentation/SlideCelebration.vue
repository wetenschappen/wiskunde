<script setup>
const props = defineProps({
  slide: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="slide-celebration bg-slate-900 text-white w-full h-full flex flex-col items-center justify-center p-16 relative overflow-hidden">
    <!-- Minimalist grid background with low opacity -->
    <div class="absolute inset-0 pointer-events-none opacity-[0.02]" 
         style="background-image: radial-gradient(#ffffff 2px, transparent 2px); background-size: 32px 32px;">
    </div>
    
    <div class="celebration-content text-center max-w-5xl z-10 w-full flex flex-col items-center">
      <!-- Clean Celebration Icon Badge -->
      <div class="celebration-icon inline-flex items-center justify-center w-36 h-36 border border-white/10 bg-slate-800 rounded-full mb-8 text-amber-500 shadow-sm">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>
      
      <h1 class="text-[4.5rem] font-extrabold text-white leading-tight mb-4 tracking-tight" v-html="slide.title"></h1>
      <div v-if="slide.message" class="text-[1.8rem] text-slate-300 leading-relaxed font-light mb-10 max-w-3xl" v-html="slide.message"></div>
      
      <!-- Stats Grid (Solid Dark Cards) -->
      <div v-if="slide.stats && slide.stats.length" class="stats-grid grid grid-cols-2 gap-6 w-full max-w-3xl mb-10">
        <div v-for="(stat, index) in slide.stats" :key="index"
             class="bg-slate-800/60 border border-slate-700 rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <div class="text-[3.5rem] font-bold text-amber-500 leading-none mb-2">{{ stat.value }}</div>
          <div class="text-[1.2rem] text-slate-400 font-bold uppercase tracking-wider">{{ stat.label }}</div>
        </div>
      </div>
      
      <!-- Next Step Card (Solid Dark Style) -->
      <div v-if="slide.nextStep" class="next-step bg-slate-800/40 border border-slate-700 rounded-xl p-8 max-w-3xl w-full shadow-sm">
        <div class="text-[1.1rem] font-bold text-amber-500 uppercase tracking-wider mb-2">Volgende stap</div>
        <div class="text-[1.8rem] text-slate-100 leading-relaxed font-semibold" v-html="slide.nextStep"></div>
      </div>
    </div>
    
    <!-- Bottom Accent Bar -->
    <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-amber-500"></div>
  </div>
</template>

<style scoped>
.slide-celebration {
  font-family: 'Open Sans', sans-serif;
}
</style>
