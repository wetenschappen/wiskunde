<script setup>
import { ref, computed } from 'vue'
import { PhX, PhCheckCircle, PhFilePdf, PhLockKey, PhWarning, PhArrowRight } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  config: Object,
  workbook: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const inputCode = ref('')
const errorIndex = ref(null)
const unlockedIndices = ref(new Set())
const activeUnlockIndex = ref(null)

const solutionLinks = computed(() => {
  if (props.config?.oplossingen && Array.isArray(props.config.oplossingen)) {
    return props.config.oplossingen
  }
  if (props.config?.oplossingenLink) {
    return [{ 
        label: 'Bekijk PDF Oplossingen', 
        url: props.config.oplossingenLink, 
        password: props.config.groenAntwoord 
    }]
  }
  return []
})

function tryUnlock(index) {
  const link = solutionLinks.value[index]
  // Als er geen wachtwoord is of als het al ontgrendeld is, open direct
  if (!link.password || unlockedIndices.value.has(index)) {
    window.open(link.url, '_blank')
    return
  }
  
  // Toon wachtwoord veld voor dit item
  activeUnlockIndex.value = index
  inputCode.value = ''
  errorIndex.value = null
}

function checkCode(index) {
  const link = solutionLinks.value[index]
  if (inputCode.value.trim().toLowerCase() === link.password.toLowerCase()) {
    unlockedIndices.value.add(index)
    activeUnlockIndex.value = null
    inputCode.value = ''
    errorIndex.value = null
    window.open(link.url, '_blank')
  } else {
    errorIndex.value = index
  }
}

function cancelUnlock() {
    activeUnlockIndex.value = null
    inputCode.value = ''
    errorIndex.value = null
}

function close() {
    emit('close')
    activeUnlockIndex.value = null
    inputCode.value = ''
}
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop open" @click="close">
    <div class="modal-content max-w-xl" @click.stop>
       <!-- Header -->
       <div class="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center z-10">
            <div class="flex items-center gap-3">
                <div class="bg-amber-100 text-amber-600 p-2 rounded-lg"><PhCheckCircle weight="fill" class="text-xl"/></div>
                <div>
                    <h3 class="text-lg font-bold text-slate-900 m-0">Correctiesleutels</h3>
                    <p class="text-xs text-slate-500 m-0">{{ workbook.title || 'Werkboek' }}</p>
                </div>
            </div>
             <button @click="close" class="btn-close">
                 <PhX class="text-2xl" />
             </button>
       </div>

       <div class="p-8 prose max-w-none">
            
            <div v-if="solutionLinks.length > 0" class="space-y-4">
                <div v-for="(link, idx) in solutionLinks" :key="idx" class="relative">
                    
                    <!-- ITEM CARD -->
                    <div 
                        class="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between group transition-all shadow-sm"
                        :class="[
                            unlockedIndices.has(idx) ? 'border-emerald-200 bg-emerald-50/30' : 'hover:border-amber-400 hover:bg-slate-50',
                            activeUnlockIndex === idx ? 'ring-2 ring-amber-500 border-amber-500' : ''
                        ]"
                    >
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                                :class="unlockedIndices.has(idx) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600'"
                            >
                                <PhCheckCircle v-if="unlockedIndices.has(idx)" weight="fill" class="text-2xl" />
                                <PhFilePdf v-else weight="bold" class="text-2xl" />
                            </div>
                            <div>
                                <h4 class="text-sm font-bold text-slate-900 m-0 leading-tight">{{ link.label }}</h4>
                                <p class="text-[11px] text-slate-400 m-0 uppercase font-bold tracking-wider mt-0.5">
                                    {{ unlockedIndices.has(idx) ? 'Ontgrendeld' : (link.password ? 'Beveiligd met code' : 'Vrij toegankelijk') }}
                                </p>
                            </div>
                        </div>

                        <button 
                            @click="tryUnlock(idx)"
                            class="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                            :class="unlockedIndices.has(idx) 
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                                : 'bg-slate-900 text-white hover:bg-amber-500' "
                        >
                            {{ unlockedIndices.has(idx) ? 'Openen' : 'Inzien' }}
                        </button>
                    </div>

                    <!-- PASSWORD PROMPT INLINE -->
                    <transition name="fade">
                        <div v-if="activeUnlockIndex === idx" class="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-inner">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-xs font-bold text-amber-800 flex items-center gap-1">
                                    <PhLockKey weight="fill" /> Voer de code in voor deze sleutel:
                                </span>
                                <button @click="cancelUnlock" class="text-amber-400 hover:text-amber-600">
                                    <PhX weight="bold" />
                                </button>
                            </div>
                            
                            <div class="relative">
                                <input 
                                    type="password" 
                                    v-model="inputCode" 
                                    @keydown.enter="checkCode(idx)"
                                    class="w-full pl-4 pr-12 py-2.5 bg-white border border-amber-200 rounded-xl text-sm font-medium text-slate-900 placeholder-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                                    placeholder="Wachtwoord..."
                                    autofocus
                                >
                                <button 
                                    @click="checkCode(idx)"
                                    class="absolute right-1.5 top-1.5 bottom-1.5 w-10 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center justify-center transition-all"
                                >
                                    <PhArrowRight weight="bold" />
                                </button>
                            </div>

                            <p v-if="errorIndex === idx" class="text-red-500 text-[11px] font-bold mt-2 flex items-center gap-1">
                                <PhWarning weight="bold" /> Wachtwoord onjuist. Probeer het opnieuw.
                            </p>
                        </div>
                    </transition>
                </div>
            </div>

            <!-- NO LINKS STATE -->
            <div v-else class="bg-slate-50 border border-slate-200 shadow-sm rounded-2xl p-8 text-center">
                <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PhWarning weight="fill" class="text-3xl"/>
                </div>
                <h3 class="text-lg font-bold text-slate-900 mb-2">Niet Beschikbaar</h3>
                <p class="text-slate-500 text-sm mb-0">Er zijn momenteel geen PDF correctiesleutels geüpload voor deze les.</p>
            </div>
            
       </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
