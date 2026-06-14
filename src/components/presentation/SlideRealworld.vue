<script setup>
import MathSlideWrapper from './shared/MathSlideWrapper.vue'

const props = defineProps({
  slide: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <MathSlideWrapper :title="slide.title || 'Toepassing in de praktijk'" badge="TOEPASSING">
    <div class="flex flex-col gap-8 h-full">
      <!-- Context Box -->
      <div v-if="slide.context" class="p-8 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div class="text-[1.1rem] font-bold text-slate-400 uppercase tracking-wider mb-2">Context</div>
        <div class="text-[1.7rem] text-slate-700 leading-relaxed" v-html="slide.context"></div>
      </div>
      
      <!-- Cards Grid -->
      <div class="grid grid-cols-3 gap-6">
        
        <!-- Example Card -->
        <div v-if="slide.example" class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                <path d="M2 17L12 22L22 17"/>
                <path d="M2 12L12 17L22 12"/>
              </svg>
            </div>
            <div class="text-[1.5rem] font-bold text-slate-800">Voorbeeld</div>
          </div>
          <div class="text-[1.5rem] text-slate-600 leading-relaxed flex-1" v-html="slide.example"></div>
        </div>

        <!-- Consequence Card -->
        <div v-if="slide.consequence" class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/>
              </svg>
            </div>
            <div class="text-[1.5rem] font-bold text-slate-800">Gevolg</div>
          </div>
          <div class="text-[1.5rem] text-slate-600 leading-relaxed flex-1" v-html="slide.consequence"></div>
        </div>

        <!-- Takeaway Card -->
        <div v-if="slide.takeaway" class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18L15 12L9 6"/>
              </svg>
            </div>
            <div class="text-[1.5rem] font-bold text-slate-800">Leerpunt</div>
          </div>
          <div class="text-[1.5rem] text-slate-600 leading-relaxed flex-1" v-html="slide.takeaway"></div>
        </div>

      </div>
    </div>
  </MathSlideWrapper>
</template>
