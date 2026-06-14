<script setup>
const props = defineProps({
  slide: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="slide-big bg-slate-900 text-white w-full h-full flex flex-col items-center justify-center p-20 relative overflow-hidden">
    <!-- Minimalist grid background with low opacity -->
    <div class="absolute inset-0 pointer-events-none opacity-[0.02]" 
         style="background-image: radial-gradient(#ffffff 2px, transparent 2px); background-size: 32px 32px;">
    </div>
    
    <div class="text-center max-w-5xl z-10">
      <h2 class="text-[5.5rem] font-extrabold text-white leading-tight tracking-tight mb-8" v-html="slide.title"></h2>
      <p class="text-[2rem] text-slate-300 leading-relaxed font-light" v-html="slide.subtitle"></p>
    </div>
    
    <!-- Flat Accent Bar -->
    <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-amber-500"></div>
  </div>
</template>

<style scoped>
.slide-big {
  font-family: 'Open Sans', sans-serif;
}
</style>
