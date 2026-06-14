<script setup>
import MathSlideWrapper from './shared/MathSlideWrapper.vue'

const props = defineProps({
  slide: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <MathSlideWrapper :title="slide.title || 'Samenvatting'" badge="SAMENVATTING">
    <div class="flex flex-col gap-6 h-full">
      <!-- Summary Items -->
      <div class="flex flex-col gap-5">
        <div v-for="(item, index) in slide.items" :key="index"
             class="flex items-start gap-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div class="flex-shrink-0 w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-[1.3rem] font-bold">
            {{ index + 1 }}
          </div>
          <div class="text-[1.6rem] text-slate-700 leading-relaxed pt-1.5" v-html="item"></div>
        </div>
      </div>
      
      <!-- Key Takeaway Box (No Left Border, No Gradients) -->
      <div v-if="slide.keyTakeaway" class="p-6 border border-amber-200 bg-amber-50/20 rounded-xl shadow-sm mt-2">
        <div class="text-[1.1rem] font-bold text-amber-800 uppercase tracking-wider mb-2">Belangrijkste inzicht</div>
        <div class="text-[1.6rem] text-slate-800 leading-relaxed font-semibold" v-html="slide.keyTakeaway"></div>
      </div>
    </div>
  </MathSlideWrapper>
</template>
