<script setup>
import MathSlideWrapper from './shared/MathSlideWrapper.vue'
import PedagogyPanel from './shared/PedagogyPanel.vue'

const props = defineProps({
    slide: { type: Object, required: true },
    revealedSteps: { type: Number, default: 0 }
})

const emit = defineEmits(['revealNext'])
</script>

<template>
<MathSlideWrapper :title="slide.title || 'Denkvraag'" badge="VOORKENNIS">
    <PedagogyPanel variant="formula" title="Denkvraag" icon="question">
        <div class="text-[2.1rem] font-bold text-slate-800 leading-relaxed mb-6" v-html="slide.question"></div>
        
        <!-- Button (Flat Border, No Gradients/Glows) -->
        <div v-if="revealedSteps === 0" class="flex justify-center mt-8 mb-4">
            <button @click="$emit('revealNext', 1)" 
                    class="px-8 py-4 bg-amber-600 text-white rounded-xl font-bold text-[1.4rem] shadow-sm hover:bg-amber-700 transition-colors flex items-center gap-3 cursor-pointer border border-amber-700">
                <span class="tracking-wider uppercase">Toon Antwoord</span>
                <div class="text-amber-800 text-[1.1rem] px-2 py-0.5 bg-amber-50 rounded border border-amber-200 font-mono font-bold">
                    S
                </div>
            </button>
        </div>
        
        <!-- Answer Reveal (No Glows/Gradients) -->
        <div v-else class="mt-8 animate-[fadeInUp_0.3s_ease-out]">
            <div class="relative py-4">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-amber-200/50"></div>
                </div>
                <div class="relative flex justify-center">
                    <span class="bg-amber-50 px-4 py-1.5 text-amber-800 font-bold tracking-wider text-[1.1rem] uppercase rounded-lg border border-amber-200 shadow-sm">
                        Antwoord
                    </span>
                </div>
            </div>
            
            <div class="text-[1.8rem] text-slate-700 font-medium leading-relaxed bg-amber-50/20 p-8 rounded-xl border border-amber-200 mt-4">
                <span v-html="slide.revealText || slide.answer" class="block"></span>
            </div>
        </div>
    </PedagogyPanel>
</MathSlideWrapper>
</template>
