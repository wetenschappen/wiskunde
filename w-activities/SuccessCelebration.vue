<template>
  <div v-if="show" class="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
    <!-- Checkmark burst -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-24 h-24 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
      </div>
      <div class="relative w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center">
        <PhCheck weight="bold" class="w-12 h-12 text-white" />
      </div>
    </div>
    <!-- Confetti particles -->
    <div v-for="i in 12" :key="i" class="absolute w-2 h-2 rounded-full"
      :style="{
        backgroundColor: colors[i % colors.length],
        left: `${50 + (Math.random() - 0.5) * 60}%`,
        top: `${50 + (Math.random() - 0.5) * 60}%`,
        animation: `confetti-fall ${0.5 + Math.random() * 0.5}s ease-out forwards`,
        animationDelay: `${Math.random() * 0.3}s`
      }">
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { PhCheck } from '@phosphor-icons/vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['done'])

const colors = ['#34d399', '#60a5fa', '#fbbf24', '#f472b6', '#a78bfa', '#fb923c']

watch(() => props.show, (val) => {
  if (val) {
    setTimeout(() => emit('done'), 1500)
  }
})
</script>

<style scoped>
@keyframes confetti-fall {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(80px) scale(0); opacity: 0; }
}
</style>
