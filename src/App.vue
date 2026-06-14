<script setup>
import { PhPi } from '@phosphor-icons/vue'
</script>

<template>
  <div class="min-h-screen math-background relative overflow-x-hidden text-[10px]">
    <!-- Mathematical Watermark -->
    <div class="fixed top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none transform -rotate-12 select-none z-0">
        <PhPi weight="fill" :size="800" class="text-amber-500" />
    </div>
    
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
.math-background {
  background-color: #f8fafc;
  background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
  background-size: 32px 32px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
