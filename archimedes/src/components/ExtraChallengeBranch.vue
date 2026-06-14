<script setup>
import { computed } from 'vue'
import { PhPlus, PhMinus, PhGameController } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  label: {
    type: String,
    default: 'Extra Challenge'
  }
})

const emit = defineEmits(['update:isOpen'])

function toggle() {
  emit('update:isOpen', !props.isOpen)
}
</script>

<template>
  <div class="relative mt-8 pt-2"> <!-- Spacer from previous content -->
    
    <!-- The Connector Node on the main timeline line -->
    <!-- Position calculation: Parent has pl-10 (40px). Line is at -2px. 
         We want to center on the line. 
         If we are inside the content area, we are +40px from the left edge of the container.
         So we need negative left to hit the line.
         Line is at -2px relative to the container border? No, checking TimelineItem.vue again:
         .timeline-line (this container's parent) has pl-10.
         .timeline-line::before (the line) is at -left-[2px].
         
         So from inside the content (where we are), the line is at -42px (approx).
         Let's try -left-[45px] to center a w-10 button.
    -->
    
    <button 
      @click="toggle"
      class="absolute -left-[58px] top-0 w-9 h-9 rounded-full border-4 bg-white flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-md z-10 group"
      :class="isOpen ? 'border-amber-500 text-amber-500' : 'border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-500'"
      title="Toon/Verberg Oefeningen"
    >
      <PhMinus v-if="isOpen" weight="bold" class="text-sm transition-transform duration-300 rotate-0" />
      <PhPlus v-else weight="bold" class="text-sm transition-transform duration-300" />
    </button>

    <!-- Label/Header (Visible mainly when collapsed or as title) -->
    <div 
        @click="toggle"
        class="relative md:absolute md:-left-[220px] md:top-0 md:h-9 flex items-center gap-3 mb-6 md:mb-0 cursor-pointer group w-fit md:w-[150px] md:justify-end select-none"
    >
        <span 
            class="text-[10px] font-bold tracking-widest uppercase transition-colors md:text-right"
            :class="isOpen ? 'text-amber-600' : 'text-slate-400 group-hover:text-amber-500'"
        >
            {{ label }}
        </span>
        
        <!-- Line connector when expanded -->
        <div v-if="isOpen" class="h-[1px] bg-amber-200 w-12 md:w-4"></div>
    </div>

    <!-- Collapsible Content -->
    <div 
        class="grid transition-all duration-300 ease-in-out overflow-hidden"
        :class="isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
    >
        <div class="min-h-0">
            <!-- Inner container for slot -->
            <div class="bg-amber-50/50 rounded-2xl border border-amber-100/50 p-1">
                <slot></slot>
            </div>
        </div>
    </div>

  </div>
</template>
