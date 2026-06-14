<script setup>
const props = defineProps({
  slide: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="slide-image-hero w-full h-full relative overflow-hidden select-none">
    <div class="hero-image-container w-full h-full relative">
      <img :src="slide.image" :alt="slide.alt || ''" class="w-full h-full object-cover" />
      <!-- Simple translucent dark overlay (no gradient) -->
      <div class="absolute inset-0 bg-slate-950/40"></div>
      
      <!-- Content Area -->
      <div class="absolute bottom-12 left-12 right-12 flex justify-center z-10">
        <div class="content-box max-w-4xl w-full bg-white border border-slate-200 p-8 rounded-xl shadow-md">
          <h2 class="text-[2.6rem] font-bold text-slate-900 leading-tight mb-3" v-html="slide.title"></h2>
          <div v-if="slide.subtitle" class="text-[1.6rem] text-slate-500 leading-relaxed mb-4" v-html="slide.subtitle"></div>
          <div v-if="slide.formula" class="text-[2.2rem] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-5 text-center font-bold font-math" v-html="slide.formula"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-image-hero {
  font-family: 'Open Sans', sans-serif;
}
</style>
