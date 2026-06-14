<template>
  <div class="slide-discipline w-full h-full flex flex-col bg-slate-50">
    <div class="discipline-header bg-slate-900 px-16 py-8 border-b border-slate-800">
      <div class="header-content">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span class="text-white/80 text-[1.1rem] font-bold tracking-widest uppercase">Afspraken</span>
        </div>
        <h1 class="text-[3.2rem] font-extrabold text-white leading-tight tracking-tight" v-html="slide.title"></h1>
        <div v-if="slide.subtitle" class="text-[1.6rem] text-slate-400 mt-1" v-html="slide.subtitle"></div>
      </div>
    </div>
    
    <div class="discipline-content flex-1 px-16 py-8 flex flex-col justify-between overflow-y-auto">
      <div class="rules-grid grid grid-cols-4 gap-8 my-auto">
        <div
          v-for="(rule, index) in slide.rules"
          :key="index"
          class="rule-card group flex flex-col items-center text-center py-12 px-6 bg-white border border-slate-200 rounded-2xl shadow-sm relative transition-all duration-300 hover:border-amber-300 hover:-translate-y-1 hover:shadow-md"
        >
          <!-- Small Number Badge -->
          <div class="absolute top-4 left-4 w-7 h-7 rounded-full bg-slate-100 text-slate-400 text-[1rem] font-bold flex items-center justify-center border border-slate-200/60">
            {{ index + 1 }}
          </div>
          
          <!-- Large Icon Badge -->
          <div v-if="rule.icon" class="w-36 h-36 rounded-3xl flex items-center justify-center mb-8 shadow-inner border transition-all duration-300 group-hover:scale-105"
               :class="rule.highlight ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'">
             <component :is="getIcon(rule.icon)" weight="bold" class="text-[5.5rem]" />
          </div>
          
          <!-- Detailed text below -->
          <div class="rule-description text-[1.25rem] text-slate-500 leading-relaxed font-semibold" v-html="rule.text"></div>
        </div>
      </div>
      
      <div v-if="slide.note || slide.cursusLink" class="discipline-note border border-amber-200 bg-amber-50/20 rounded-xl p-6 flex items-center gap-4 mt-auto">
        <div class="note-icon flex-shrink-0 w-11 h-11 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="note-text text-[1.5rem] text-slate-700 leading-relaxed font-semibold">
          <span v-if="slide.note" v-html="slide.note"></span>
          <span v-else>
            Deze les en het studiemateriaal kan je online raadplegen op: 
            <strong class="text-amber-800 bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300 ml-2 text-[1.4rem] font-mono select-all">{{ cleanUrl(slide.cursusLink) }}</strong>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue';

const props = defineProps({
  slide: {
    type: Object,
    required: true
  }
});

const iconMap = inject('iconMap', {});

function getIcon(iconName) {
  return iconMap[iconName] || iconMap['info'];
}

function cleanUrl(url) {
    if (!url) return ''
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
</script>

<style scoped>
.slide-discipline {
  font-family: 'Open Sans', sans-serif;
}
</style>
