<script setup>
const props = defineProps({
  total: { type: Number, required: true },
  revealed: { type: Number, default: 0 },
  activeColor: { type: String, default: 'bg-amber-500' },
})
</script>

<template>
  <div class="flex items-center gap-3">
    <div
      v-for="idx in total"
      :key="idx"
      class="w-3 h-3 rounded-full transition-colors duration-300"
      :class="idx <= revealed ? activeColor : 'bg-surface-300'"
    />
  </div>
</template>
