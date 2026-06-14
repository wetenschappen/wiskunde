<script setup>
import { ref, computed, watch } from 'vue'
import { PhFlask, PhX, PhCheckCircle, PhLightbulb, PhArrowRight, PhTrophy, PhArrowClockwise, PhTarget, PhPercent } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
})

const emit = defineEmits(['close'])

const reactions = [
    { description: "Vorming van waterstofjodide", reactants: ["H<sub>2</sub>", "I<sub>2</sub>"], products: ["HI"], solution: [1, 1, 2], elements: ["H", "I"], hint: "Kijk naar de I-atomen rechts. Je hebt er 2 nodig!", difficulty: "Niveau 1: Beginner", level: "beginner" },
    { description: "Vorming van keukenzout", reactants: ["Na", "Cl<sub>2</sub>"], products: ["NaCl"], solution: [2, 1, 2], elements: ["Na", "Cl"], hint: "Chloor (Cl) komt per 2, dus je hebt 2 NaCl nodig.", difficulty: "Niveau 1: Beginner", level: "beginner" },
    { description: "Ontleding van kwikoxide", reactants: ["HgO"], products: ["Hg", "O<sub>2</sub>"], solution: [2, 2, 1], elements: ["Hg", "O"], hint: "Zuurstof komt vrij als O₂, dus je moet links verdubbelen.", difficulty: "Niveau 1: Beginner", level: "beginner" },
    { description: "Productie van ammoniak (Haber-Bosch)", reactants: ["N<sub>2</sub>", "H<sub>2</sub>"], products: ["NH<sub>3</sub>"], solution: [1, 3, 2], elements: ["N", "H"], hint: "2 N links betekent 2 NH₃ rechts. Pas dan de H aan.", difficulty: "Niveau 2: Gemiddeld", level: "medium" },
    { description: "Verbranding van aardgas", reactants: ["CH<sub>4</sub>", "O<sub>2</sub>"], products: ["CO<sub>2</sub>", "H<sub>2</sub>O"], solution: [1, 2, 1, 2], elements: ["C", "H", "O"], hint: "Balanceer C, dan H, en als laatste O.", difficulty: "Niveau 2: Gemiddeld", level: "medium" },
    { description: "Ontleding van kaliumchloraat", reactants: ["KClO<sub>3</sub>"], products: ["KCl", "O<sub>2</sub>"], solution: [2, 2, 3], elements: ["K", "Cl", "O"], hint: "O₃ links en O₂ rechts? Zoek het kleinste gemene veelvoud (6).", difficulty: "Niveau 2: Gemiddeld", level: "medium" },
    { description: "Roesten van ijzer", reactants: ["Fe", "O<sub>2</sub>"], products: ["Fe<sub>2</sub>O<sub>3</sub>"], solution: [4, 3, 2], elements: ["Fe", "O"], hint: "Even en oneven O-atomen? Verdubbel Fe₂O₃ om O even te maken.", difficulty: "Niveau 3: Moeilijk", level: "hard" },
    { description: "Verbranding van propaan", reactants: ["C<sub>3</sub>H<sub>8</sub>", "O<sub>2</sub>"], products: ["CO<sub>2</sub>", "H<sub>2</sub>O"], solution: [1, 5, 3, 4], elements: ["C", "H", "O"], hint: "3 C → 3 CO₂, 8 H → 4 H₂O. Tel nu alle O's rechts.", difficulty: "Niveau 3: Moeilijk", level: "hard" },
    { description: "Verbranding van butaan", reactants: ["C<sub>4</sub>H<sub>10</sub>", "O<sub>2</sub>"], products: ["CO<sub>2</sub>", "H<sub>2</sub>O"], solution: [2, 13, 8, 10], elements: ["C", "H", "O"], hint: "4 C → 4 CO₂, 10 H → 5 H₂O. Oeps, oneven aantal O's (13). Alles verdubbelen!", difficulty: "Niveau 4: Meester Balanceerder", level: "godly" },
    { description: "Roosten van pyriet (fool's gold)", reactants: ["FeS<sub>2</sub>", "O<sub>2</sub>"], products: ["Fe<sub>2</sub>O<sub>3</sub>", "SO<sub>2</sub>"], solution: [4, 11, 2, 8], elements: ["Fe", "S", "O"], hint: "Begin met Fe. Dan S. Tel de O's. Oneven? Alles verdubbelen!", difficulty: "Niveau 4: Meester Balanceerder", level: "godly" },
];

const currentReactionIndex = ref(0)
const userCoefficients = ref([])
const feedback = ref({ message: '', type: '' })
const stats = ref({ completed: 0, attempts: 0 })
const hintVisible = ref(false)
const isChecked = ref(false)
const isCorrect = ref(false)
const allDone = ref(false)

const difficultyClasses = {
  beginner: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-blue-100 text-blue-800',
  hard: 'bg-orange-100 text-orange-800',
  godly: 'bg-violet-200 text-violet-900 shadow-md ring-1 ring-violet-300',
}

const currentReaction = computed(() => reactions[currentReactionIndex.value])

function parseFormula(formula) {
  const div = document.createElement('div');
  div.innerHTML = formula;
  return div.textContent || '';
}

function countMoleculeAtoms(molecule) {
    const counts = {};
    const text = parseFormula(molecule);
    const regex = /([A-Z][a-z]?)(\d*)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        const element = match[1];
        const count = match[2] ? parseInt(match[2], 10) : 1;
        counts[element] = (counts[element] || 0) + count;
    }
    return counts;
}

const atomCounts = computed(() => {
    if (!currentReaction.value) return {};
    const leftCounts = {};
    const rightCounts = {};

    currentReaction.value.reactants.forEach((reactant, i) => {
        const coef = Number(userCoefficients.value[i]) || 1;
        const moleculeAtoms = countMoleculeAtoms(reactant);
        for (const [element, count] of Object.entries(moleculeAtoms)) {
            leftCounts[element] = (leftCounts[element] || 0) + count * coef;
        }
    });

    const reactantCount = currentReaction.value.reactants.length;
    currentReaction.value.products.forEach((product, i) => {
        const coef = Number(userCoefficients.value[reactantCount + i]) || 1;
        const moleculeAtoms = countMoleculeAtoms(product);
        for (const [element, count] of Object.entries(moleculeAtoms)) {
            rightCounts[element] = (rightCounts[element] || 0) + count * coef;
        }
    });
    
    return { left: leftCounts, right: rightCounts };
});

const successRate = computed(() => {
  if (stats.value.attempts === 0) return 100;
  return Math.round((stats.value.completed / stats.value.attempts) * 100);
});

function initializeReaction() {
  const reaction = currentReaction.value;
  if (!reaction) return;
  
  const totalCoefficients = reaction.reactants.length + reaction.products.length;
  userCoefficients.value = Array(totalCoefficients).fill(1);
  
  feedback.value = { message: '', type: '' };
  hintVisible.value = false;
  isChecked.value = false;
  isCorrect.value = false;
}

function checkBalance() {
  if (isCorrect.value) return;

  if (!isChecked.value) { // only count first attempt per try
    stats.value.attempts++;
  }
  isChecked.value = true;
  
  const solution = currentReaction.value.solution;
  const userSolution = userCoefficients.value.map(c => Number(c) || 1);

  if (JSON.stringify(solution) === JSON.stringify(userSolution)) {
    isCorrect.value = true;
    feedback.value = { message: 'Perfect! De reactievergelijking is correct gebalanceerd!', type: 'success' };
    stats.value.completed++;
  } else {
    feedback.value = { message: 'Nog niet helemaal correct. Controleer de atoomtellingen en probeer opnieuw!', type: 'error' };
  }
}

function nextReaction() {
  if (currentReactionIndex.value < reactions.length - 1) {
    currentReactionIndex.value++;
  } else {
    allDone.value = true;
  }
}

function restartActivity() {
  allDone.value = false;
  stats.value = { completed: 0, attempts: 0 };
  currentReactionIndex.value = 0;
  // initializeReaction is called via the watch
}

watch(currentReactionIndex, initializeReaction, { immediate: true });
watch(userCoefficients, () => {
    isChecked.value = false;
    isCorrect.value = false;
}, { deep: true });
</script>

<template>
  <Transition name="modal-pop">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans">
      
      <!-- Header -->
      <header class="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
            <PhFlask class="text-xl text-white" weight="fill" />
          </div>
          <div>
            <h1 class="text-base font-bold text-slate-800">Reactievergelijkingen Balanceren</h1>
            <p class="text-xs text-slate-500">Wet van Lavoisier in de praktijk</p>
          </div>
        </div>
        <button @click="emit('close')" class="p-2 text-slate-400 rounded-full transition-colors hover:text-rose-600 hover:bg-rose-100">
          <PhX weight="bold" class="text-xl" />
        </button>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div class="max-w-4xl mx-auto">
          
          <!-- Completion State -->
          <Transition name="fade-bounce">
          <div v-if="allDone" class="text-center bg-white p-8 rounded-2xl shadow-lg border">
            <div class="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-amber-50">
              <PhTrophy weight="fill" class="text-6xl text-amber-400"/>
            </div>
            <h2 class="text-3xl font-bold text-slate-800 mb-2">Geweldig gedaan!</h2>
            <p class="text-slate-500 mb-8">Je hebt alle reactievergelijkingen succesvol gebalanceerd.</p>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-lg mx-auto mb-10">
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div class="text-3xl font-bold text-indigo-600">{{ stats.completed }}</div>
                <div class="text-sm text-slate-500">Correct</div>
              </div>
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div class="text-3xl font-bold text-indigo-600">{{ stats.attempts }}</div>
                <div class="text-sm text-slate-500">Pogingen</div>
              </div>
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div class="text-3xl font-bold text-indigo-600">{{ successRate }}%</div>
                <div class="text-sm text-slate-500">Succes</div>
              </div>
            </div>

            <div class="flex justify-center gap-4">
              <button @click="restartActivity" class="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-xl transition-transform hover:scale-105 shadow-md hover:shadow-lg">
                <PhArrowClockwise class="inline -mt-1 mr-2" /> Opnieuw oefenen
              </button>
              <button @click="emit('close')" class="px-6 py-3 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Sluiten
              </button>
            </div>
          </div>
          </Transition>

          <!-- Work Area -->
          <div v-else class="space-y-6">
            <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200/80">
              
              <!-- Reaction Display -->
              <div class="bg-gradient-to-br from-indigo-700 to-slate-800 text-white rounded-xl shadow-lg p-6 mb-6">
                <span :class="['inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-3', difficultyClasses[currentReaction.level]]">
                  {{ currentReaction.difficulty }}
                </span>
                <p class="text-indigo-200 text-sm mb-4">{{ currentReaction.description }}</p>
                
                <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-4 text-xl sm:text-2xl font-semibold text-center py-4">
                  <!-- Reactants -->
                  <template v-for="(reactant, index) in currentReaction.reactants" :key="'reactant-' + index">
                    <div class="flex items-center gap-2">
                      <input type="number" min="1" max="99" v-model="userCoefficients[index]" :disabled="isCorrect" @input="isChecked = false" :class="[
                        'w-14 text-center bg-transparent border-b-2 rounded-none p-1 transition-all ease-in-out',
                        'focus:bg-white/10 focus:outline-none focus:border-amber-400',
                        isChecked && !isCorrect ? 'border-red-400/80 animate-shake' : 'border-white/30 hover:border-white/60',
                        isCorrect ? 'border-emerald-400/70 bg-emerald-500/20 cursor-not-allowed' : ''
                      ]"/>
                      <span v-html="reactant" class="font-mono text-white"></span>
                    </div>
                    <span v-if="index < currentReaction.reactants.length - 1" class="text-indigo-300 font-light mx-1">+</span>
                  </template>

                  <PhArrowRight class="text-3xl text-amber-400 font-bold mx-3" weight="bold" />

                  <!-- Products -->
                  <template v-for="(product, index) in currentReaction.products" :key="'product-' + index">
                    <div class="flex items-center gap-2">
                      <input type="number" min="1" max="99" v-model="userCoefficients[currentReaction.reactants.length + index]" :disabled="isCorrect" @input="isChecked = false" :class="[
                        'w-14 text-center bg-transparent border-b-2 rounded-none p-1 transition-all ease-in-out',
                        'focus:bg-white/10 focus:outline-none focus:border-amber-400',
                        isChecked && !isCorrect ? 'border-red-400/80 animate-shake' : 'border-white/30 hover:border-white/60',
                        isCorrect ? 'border-emerald-400/70 bg-emerald-500/20 cursor-not-allowed' : ''
                      ]"/>
                      <span v-html="product" class="font-mono text-white"></span>
                    </div>
                    <span v-if="index < currentReaction.products.length - 1" class="text-indigo-300 font-light mx-1">+</span>
                  </template>
                </div>
              </div>

              <!-- Atom Counter -->
              <div class="bg-slate-50/70 rounded-xl p-4 sm:p-5 mb-6 border border-slate-200">
                <h3 class="font-bold text-slate-600 mb-4 text-sm">Atoomtelling</h3>
                <div class="grid grid-cols-[auto,1fr,1fr] gap-x-4 gap-y-2 items-center text-center">
                  <div class="font-bold text-slate-400 text-xs uppercase tracking-wider">Atoom</div>
                  <div class="font-bold text-slate-400 text-xs uppercase tracking-wider">Reactanten</div>
                  <div class="font-bold text-slate-400 text-xs uppercase tracking-wider">Producten</div>
                  
                  <template v-for="element in currentReaction.elements" :key="element">
                    <div class="font-mono font-bold text-lg text-indigo-600">{{ element }}</div>
                    <div :class="['font-bold text-lg rounded-lg p-1.5 transition-colors duration-300', atomCounts.left[element] != null && atomCounts.left[element] === atomCounts.right[element] ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700']">
                      {{ atomCounts.left[element] || 0 }}
                    </div>
                    <div :class="['font-bold text-lg rounded-lg p-1.5 transition-colors duration-300', atomCounts.left[element] != null && atomCounts.left[element] === atomCounts.right[element] ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700']">
                      {{ atomCounts.right[element] || 0 }}
                    </div>
                  </template>
                </div>
              </div>

              <!-- Hint & Feedback -->
              <div class="min-h-[100px]">
                <Transition name="fade">
                  <div v-if="hintVisible && !isCorrect" class="bg-amber-50 border-l-4 border-amber-400 text-amber-800 p-4 rounded-r-lg mb-6">
                    <div class="flex justify-between items-start">
                      <h4 class="font-semibold flex items-center gap-2"><PhLightbulb weight="fill" />Hint</h4>
                      <button @click="hintVisible = false" class="p-1 rounded-full hover:bg-amber-200/50 -mt-1 -mr-1"><PhX class="text-sm"/></button>
                    </div>
                    <p class="mt-2 text-sm pl-6">{{ currentReaction.hint }}</p>
                  </div>
                </Transition>
                <Transition name="fade-bounce">
                  <div v-if="feedback.message && isChecked" :class="['text-center p-4 mt-6 rounded-xl font-bold', feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800']">
                    {{ feedback.message }}
                  </div>
                </Transition>
              </div>
              
              <!-- Controls -->
              <div class="mt-6 flex items-center justify-between">
                 <button @click="hintVisible = !hintVisible" :disabled="isCorrect" class="px-4 py-2 font-semibold text-slate-500 rounded-lg transition-colors hover:text-amber-600 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed">
                    <PhLightbulb class="inline -mt-1 mr-1" /> Hint
                 </button>
                <div class="flex items-center gap-4">
                  <Transition name="fade-bounce">
                    <button v-if="!isCorrect" @click="checkBalance" class="px-8 py-3 font-bold text-white rounded-xl transition-all duration-300 hover:scale-105 bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:shadow-emerald-200">
                      <PhCheckCircle class="inline -mt-1 mr-2" weight="bold"/> Controleer
                    </button>
                  </Transition>
                  <Transition name="fade-bounce">
                    <button v-if="isCorrect" @click="nextReaction" class="px-8 py-3 font-bold text-white bg-indigo-600 rounded-xl shadow-lg hover:shadow-indigo-200 transition-all duration-300 hover:scale-105">
                      Volgende <PhArrowRight class="inline -mt-1 ml-2 motion-safe:group-hover:translate-x-1 transition-transform" weight="bold"/>
                    </button>
                  </Transition>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div class="bg-white p-4 rounded-xl shadow-md border border-slate-200/80 group">
                <PhCheckCircle class="mx-auto text-xl text-slate-400 mb-1 group-hover:text-indigo-500 transition-colors" weight="fill" />
                <div class="text-2xl font-bold text-indigo-600">{{ stats.completed }}</div>
                <div class="text-xs text-slate-500 uppercase tracking-wider">Correct</div>
              </div>
              <div class="bg-white p-4 rounded-xl shadow-md border border-slate-200/80 group">
                <PhTarget class="mx-auto text-xl text-slate-400 mb-1 group-hover:text-indigo-500 transition-colors" weight="fill" />
                <div class="text-2xl font-bold text-indigo-600">{{ stats.attempts }}</div>
                <div class="text-xs text-slate-500 uppercase tracking-wider">Pogingen</div>
              </div>
              <div class="bg-white p-4 rounded-xl shadow-md border border-slate-200/80 group">
                <PhPercent class="mx-auto text-xl text-slate-400 mb-1 group-hover:text-indigo-500 transition-colors" weight="fill" />
                <div class="text-2xl font-bold text-indigo-600">{{ successRate }}<span class="text-xl">%</span></div>
                <div class="text-xs text-slate-500 uppercase tracking-wider">Succes</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </Transition>
</template>

<style scoped>
.modal-pop-enter-active,
.modal-pop-leave-active {
  transition: all 0.4s cubic-bezier(0.5, 1.25, 0.75, 1.25);
}
.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-bounce-enter-active {
  transition: all 0.5s cubic-bezier(0.5, 1.5, 0.5, 1);
}
.fade-bounce-leave-active {
  transition: all 0.3s cubic-bezier(0.5, 0, 0.5, -0.5);
  position: absolute;
}
.fade-bounce-enter-from,
.fade-bounce-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.animate-shake {
  animation: shake 0.3s;
}
</style>