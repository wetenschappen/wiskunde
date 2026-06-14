<template>
  <div 
    v-if="isOpen" 
    ref="modalRoot"
    class="fixed inset-0 z-[100] flex items-center justify-center font-sans bg-white"
  >
    <div class="relative w-full h-full flex flex-col bg-white overflow-hidden">
      
      <!-- Premium Header -->
      <header class="flex-none h-20 bg-white border-b border-slate-100 flex items-center px-10 justify-between shrink-0 z-10">
        <div class="flex items-center gap-5">
          <div class="w-12 h-12 rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/20 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M240 104a8 8 0 0 1-8 8h-4.22l-15.65 67.8A16 16 0 0 1 196.53 192H59.47a16 16 0 0 1-15.6-12.2L28.22 112H24a8 8 0 0 1 0-16h20.89a15.86 15.86 0 0 1 14.5 11l4.47 14.3a62.8 62.8 0 0 0 128.28 0l4.47-14.3a15.86 15.86 0 0 1 14.5-11H232a8 8 0 0 1 8 8Z"/></svg>
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Het Eureka-moment</h2>
            <p class="text-xs font-black tracking-widest text-slate-400 uppercase">Archimedes & De Gouden Krans</p>
          </div>
        </div>

        <button @click="closeActivity" class="group flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-100 hover:border-slate-900 transition-all text-slate-400 hover:text-slate-900">
          <span class="text-xs font-black uppercase tracking-widest">Sluiten</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" weight="bold"><path fill="currentColor" d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128L50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z"/></svg>
        </button>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto relative flex flex-col bg-slate-50/30 custom-scrollbar">
        
        <div class="flex-1 flex flex-col w-full h-full p-8">
          <div class="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-center">

            <!-- STEP 0: Intro -->
            <transition name="fade" mode="out-in">
              <div v-if="currentStep === 0" class="text-center w-full flex flex-col items-center" key="step0">
                <h1 class="text-4xl font-black text-slate-900 mb-4 tracking-tighter">De verdachte goudsmid</h1>
                <p class="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                  Koning Hiëro II liet een nieuwe krans maken van puur goud. Hij gaf de smid exact 1 kg goud. 
                  Toen hij de krans terugkreeg, woog deze precies 1 kg, maar de koning was toch achterdochtig... Had de smid een deel van het goud stiekem vervangen door goedkoper zilver?
                </p>
                
                <div class="w-full max-w-lg aspect-video bg-white rounded-3xl border-2 border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-10 p-4">
                  <img src="../../assets/eureka/step0.png" alt="De Koning en de Smid" class="w-full h-full object-contain drop-shadow-md" />
                </div>

                <button @click="nextStep" class="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-lg shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-1">
                  Help Archimedes het raadsel op te lossen
                </button>
              </div>

              <!-- STEP 1: Balance -->
              <div v-else-if="currentStep === 1" class="text-center w-full flex flex-col items-center" key="step1">
                <h2 class="text-3xl font-black text-slate-900 mb-4 tracking-tighter">De balans</h2>
                <p class="text-lg text-slate-600 max-w-2xl mx-auto mb-10 font-medium">
                  Op een weegschaal zie je geen verschil. De massa is identiek.
                  We kunnen de krans niet omsmelten, dus hoe komen we erachter of het volume anders is?
                </p>
                
                <div class="w-full max-w-lg aspect-video bg-white rounded-3xl border-2 border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-10 p-4">
                  <img src="../../assets/eureka/step1.png" alt="De Balans" class="w-full h-full object-contain drop-shadow-md" />
                </div>

                <button @click="nextStep" class="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-lg shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-1">
                  Archimedes neemt even pauze in bad...
                </button>
              </div>

              <!-- STEP 2: The Bath -->
              <div v-else-if="currentStep === 2" class="text-center w-full flex flex-col items-center" key="step2">
                <h2 class="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Het inzicht!</h2>
                <p class="text-lg text-slate-600 max-w-2xl mx-auto mb-8 font-medium">
                  Archimedes stapte in een bad dat tot de rand gevuld was. Wat gebeurde er?
                </p>
                
                <div class="w-full max-w-lg aspect-video bg-white rounded-3xl border-2 border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-8 p-4 relative cursor-pointer group" @click="triggerBath">
                  <img v-if="bathTriggered" src="../../assets/eureka/archimedes-bath.png" alt="Archimedes in Bath" class="w-full h-full object-contain animate-fade-in drop-shadow-md" />
                  <div v-else class="w-full h-full flex flex-col items-center justify-center bg-slate-50 relative rounded-2xl border-2 border-dashed border-slate-200">
                    <span class="px-6 py-3 bg-white text-slate-900 border-2 border-slate-200 font-bold rounded-xl animate-pulse shadow-sm z-10">Klik om in bad te stappen</span>
                  </div>
                </div>

                <p v-if="bathTriggered" class="text-lg text-emerald-600 font-bold max-w-xl mx-auto animate-fade-in mb-6 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                  "Het volume van het overgelopen water is exact gelijk aan het volume van mijn lichaam dat onder water zit!"
                </p>

                <button v-if="bathTriggered" @click="nextStep" class="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-lg shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-1">
                  Pas dit toe op de krans
                </button>
              </div>

              <!-- STEP 3: The Experiment -->
              <div v-else-if="currentStep === 3" class="text-center w-full flex flex-col items-center" key="step3">
                <h2 class="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Het Experiment</h2>
                <p class="text-lg text-slate-600 max-w-3xl mx-auto mb-10 font-medium">
                  Archimedes vulde een houten vat tot de rand met water en stopte het goudblok erin om te meten hoeveel water overstroomde. Daarna vulde hij het vat opnieuw en dompelde de krans er helemaal in onder. Als zilver (wat lichter is dan goud) werd gebruikt, was het volume van de krans groter en stroomde er méér water over de rand!
                </p>
                
                <div class="w-full max-w-lg aspect-video bg-white rounded-3xl border-2 border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-10 p-4">
                  <img src="../../assets/eureka/step3.png" alt="Het Experiment" class="w-full h-full object-contain drop-shadow-md" />
                </div>

                <button @click="nextStep" class="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-lg shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-1">
                  Wat is je conclusie?
                </button>
              </div>

              <!-- STEP 4: Quiz/Conclusion -->
              <div v-else-if="currentStep === 4" class="text-center w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-center justify-center" key="step4">
                
                <div class="flex-1 text-left w-full">
                  <h2 class="text-3xl font-black text-slate-900 mb-6 tracking-tighter">Conclusie</h2>
                  
                  <div class="bg-white border-2 border-slate-100 shadow-lg rounded-3xl p-8 mb-8 space-y-6 font-medium text-slate-700">
                    <div class="flex flex-wrap items-center gap-3">
                      <span>1. De krans verplaatste</span>
                      <select v-model="quiz.q1" class="bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl px-4 py-2 font-black focus:border-amber-500 outline-none transition-colors" :class="{'border-emerald-500 text-emerald-600 bg-emerald-50': showResults && quiz.q1 === 'meer', 'border-rose-500 text-rose-600 bg-rose-50': showResults && quiz.q1 !== 'meer'}">
                        <option value="">-- kies --</option>
                        <option value="meer">meer</option>
                        <option value="minder">minder</option>
                        <option value="evenveel">evenveel</option>
                      </select>
                      <span>water dan het blok goud.</span>
                    </div>

                    <div class="flex flex-wrap items-center gap-3">
                      <span>2. Dus het volume van de krans is</span>
                      <select v-model="quiz.q2" class="bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl px-4 py-2 font-black focus:border-amber-500 outline-none transition-colors" :class="{'border-emerald-500 text-emerald-600 bg-emerald-50': showResults && quiz.q2 === 'groter', 'border-rose-500 text-rose-600 bg-rose-50': showResults && quiz.q2 !== 'groter'}">
                        <option value="">-- kies --</option>
                        <option value="groter">groter</option>
                        <option value="kleiner">kleiner</option>
                        <option value="even groot">even groot</option>
                      </select>
                      <span>dan het blok goud.</span>
                    </div>

                    <div class="flex flex-wrap items-center gap-3">
                      <span>3. Zilver heeft een</span>
                      <select v-model="quiz.q3" class="bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl px-4 py-2 font-black focus:border-amber-500 outline-none transition-colors" :class="{'border-emerald-500 text-emerald-600 bg-emerald-50': showResults && quiz.q3 === 'kleinere', 'border-rose-500 text-rose-600 bg-rose-50': showResults && quiz.q3 !== 'kleinere'}">
                        <option value="">-- kies --</option>
                        <option value="grotere">grotere</option>
                        <option value="kleinere">kleinere</option>
                      </select>
                      <span>massadichtheid dan goud.</span>
                    </div>
                    
                    <div class="bg-amber-50 p-4 rounded-2xl border-l-4 border-amber-500 text-amber-800 text-sm font-bold">
                      Voor dezelfde massa heb je dus méér zilver nodig dan goud.
                    </div>
                  </div>

                  <button v-if="!allCorrect" @click="checkQuiz" class="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-lg shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-1 disabled:opacity-50" :disabled="!quiz.q1 || !quiz.q2 || !quiz.q3">
                    Controleer antwoorden
                  </button>

                  <div v-if="allCorrect" class="animate-pop-in mt-6">
                    <div class="text-xl font-black text-emerald-600 mb-6 flex items-center gap-3 bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 256 256"><path fill="currentColor" d="M173.66 98.34a8 8 0 0 1 0 11.32l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 0ZM232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104Zm-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88Z"/></svg>
                      Juist! De smid is een bedrieger!
                    </div>
                    <button @click="completeActivity" class="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-lg shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-1">
                      Activiteit afronden
                    </button>
                  </div>
                </div>

                <!-- Conclusion image -->
                <div class="w-full max-w-[360px] aspect-square shrink-0 bg-white rounded-3xl border-2 border-slate-100 shadow-xl shadow-slate-200/50 p-4">
                  <img v-if="allCorrect" src="../../assets/eureka/step4.png" alt="Triumph" class="w-full h-full object-contain animate-fade-in drop-shadow-md" />
                  <div v-else class="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 rounded-2xl font-black tracking-widest text-center uppercase border-2 border-dashed border-slate-200 p-6">
                    Los het raadsel op <br>voor de onthulling
                  </div>
                </div>
              </div>
            </transition>

          </div>
        </div>

      </main>
      
      <!-- Progress Indicator -->
      <div class="flex-none h-2 bg-slate-100 shrink-0">
        <div class="h-full bg-amber-500 transition-all duration-500" :style="{ width: ((currentStep + 1) / 5) * 100 + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

const props = defineProps({
    isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'complete'])
const modalRoot = ref(null)

// FULLSCREEN & ESC LOGIC
const requestFullscreen = async () => {
    if (modalRoot.value && !document.fullscreenElement) {
        try {
            await modalRoot.value.requestFullscreen();
        } catch (err) { }
    }
};

const closeActivity = async () => {
    if (document.fullscreenElement) {
        try {
            await document.exitFullscreen();
        } catch (err) { }
    }
    emit("close");
};

const completeActivity = async () => {
    if (document.fullscreenElement) {
        try {
            await document.exitFullscreen();
        } catch (err) { }
    }
    emit("complete");
};

const handleKeydown = (e) => {
    if (e.key === "Escape" && props.isOpen) {
        closeActivity();
    }
};

const handleFullscreenChange = () => {
    if (props.isOpen && !document.fullscreenElement) {
        emit("close");
    }
};

watch(() => props.isOpen, (val) => {
    if (val) {
        window.addEventListener("keydown", handleKeydown);
        nextTick(() => requestFullscreen());
    } else {
        window.removeEventListener("keydown", handleKeydown);
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
});

onMounted(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
});

// ACTIVITY STATE
const currentStep = ref(0)

function nextStep() {
  currentStep.value++
}

// Step 2: Bath interaction
const bathTriggered = ref(false)

function triggerBath() {
  bathTriggered.value = true
}

// Step 4: Quiz
const quiz = ref({
  q1: '',
  q2: '',
  q3: ''
})
const showResults = ref(false)

const allCorrect = computed(() => {
  return showResults.value && 
         quiz.value.q1 === 'meer' && 
         quiz.value.q2 === 'groter' && 
         quiz.value.q3 === 'kleinere'
})

function checkQuiz() {
  showResults.value = true
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #f1f5f9; border-radius: 20px; }

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.pop-enter-active {
  animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop-in {
  0% { transform: scale(0.5) rotate(-20deg); opacity: 0; }
  100% { transform: scale(1) rotate(-10deg); opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-pop-in {
  animation: pop-in-straight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop-in-straight {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
