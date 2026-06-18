<script setup>
import { ref, computed, watch, shallowRef, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhFlask, PhMagnifyingGlass, PhArrowLeft, PhPlay, PhInfo, PhX, PhFileCode, PhCheckCircle, PhArrowUpRight
} from '@phosphor-icons/vue'

const router = useRouter()

// 1. Scan the w-activities folder using Vite's glob import
const modules = import.meta.glob('../../w-activities/*.vue')

// 2. Parse paths to friendly names
const activityList = computed(() => {
  return Object.keys(modules).map(path => {
    const filename = path.split('/').pop()
    const name = filename.replace('.vue', '')
    
    // Grouping helper
    let group = 'Generiek'
    if (name.startsWith('LPD')) {
      const match = name.match(/^LPD(\d+|_[A-Z]\d+)/)
      if (match) {
        group = `LPD Reeks (${match[0].replace('_', '')})`
      } else {
        group = 'LPD Reeks'
      }
    }
    
    return {
      path,
      filename,
      name,
      group
    }
  }).sort((a, b) => a.name.localeCompare(b.name))
})

// 3. Search and filtering
const searchQuery = ref('')
const selectedGroup = ref('all')

const groups = computed(() => {
  const set = new Set(activityList.value.map(a => a.group))
  return ['all', ...Array.from(set).sort()]
})

const filteredActivities = computed(() => {
  return activityList.value.filter(act => {
    const matchesSearch = act.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesGroup = selectedGroup.value === 'all' || act.group === selectedGroup.value
    return matchesSearch && matchesGroup
  })
})

// 4. Loading state & selected activity
const selectedActivityPath = ref(null)
const activeComponent = shallowRef(null)
const isLoading = ref(false)

// Test Config props
const testFullscreen = ref(false)
const testTitle = ref('')
const testInstruction = ref('')

// Track execution log
const logs = ref([])
function addLog(message) {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift(`[${time}] ${message}`)
  if (logs.value.length > 20) logs.value.pop()
}

const mainContent = ref(null)

// Watch for selection and resolve component asynchronously
watch(selectedActivityPath, async (path) => {
  if (mainContent.value) mainContent.value.scrollTop = 0
  
  if (!path) {
    activeComponent.value = null
    return
  }
  
  isLoading.value = true
  addLog(`Component laden: ${path.split('/').pop()}...`)
  
  try {
    const mod = await modules[path]()
    activeComponent.value = mod.default
    
    // Set default test values based on selection
    const name = path.split('/').pop().replace('.vue', '')
    testTitle.value = `Test: ${name}`
    testInstruction.value = `Dit is een testomgeving voor de activiteit <strong>${name}</strong>.`
    
    addLog(`Laden voltooid! Klik op 'Start Activiteit' of open direct.`)
  } catch (err) {
    console.error("Fout bij laden van component:", err)
    addLog(`FOUT: Kon component niet laden! ${err.message}`)
    alert(`Fout bij laden van component: ${err.message}`)
    selectedActivityPath.value = null
  } finally {
    isLoading.value = false
  }
})

// Open active modal state
const isActivityOpen = ref(false)

function startTesting() {
  if (activeComponent.value) {
    isActivityOpen.value = true
    addLog(`Activiteit gestart in zandbak.`)
  }
}

function handleClose() {
  isActivityOpen.value = false
  addLog(`Activiteit gesloten door emit('close').`)
}

function handleComplete() {
  isActivityOpen.value = false
  addLog(`Activiteit voltooid door emit('complete')! 🎉`)
}
</script>

<template>
  <div class="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
    <!-- Header -->
    <header class="bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/30">
          <PhFlask class="text-amber-400 text-2xl" weight="fill" />
        </div>
        <div>
          <h1 class="text-xl font-black tracking-tight text-white flex items-center gap-2">
            Wiskunde Activity Playground
            <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">DEV MODE</span>
          </h1>
          <p class="text-xs text-slate-400">Test en valideer Vue-activiteiten in real-time zonder productie te verstoren.</p>
        </div>
      </div>
      
      <button 
        @click="router.push('/')" 
        class="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
      >
        <PhArrowLeft /> Naar Hoofdscherm
      </button>
    </header>

    <!-- Content Grid -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar: Activities List -->
      <aside class="w-80 bg-slate-900/40 border-r border-slate-800 flex flex-col shrink-0">
        <!-- Search & Filter Controls -->
        <div class="p-4 border-b border-slate-800 space-y-3">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <PhMagnifyingGlass />
            </span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Zoek activiteit..." 
              class="w-full pl-9 pr-4 py-2 bg-slate-950 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 text-xs transition-colors"
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''" 
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
            >
              <PhX class="text-xs" />
            </button>
          </div>
          
          <select 
            v-model="selectedGroup" 
            class="w-full px-3 py-2 bg-slate-950 text-slate-300 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 text-xs transition-colors"
          >
            <option value="all">Alle Groepen ({{ activityList.length }})</option>
            <option v-for="g in groups.filter(x => x !== 'all')" :key="g" :value="g">
              {{ g }}
            </option>
          </select>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <div v-if="filteredActivities.length === 0" class="p-8 text-center text-slate-500 text-xs">
            Geen activiteiten gevonden.
          </div>
          <button 
            v-for="act in filteredActivities" 
            :key="act.path"
            @click="selectedActivityPath = act.path"
            class="w-full text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col gap-1 border"
            :class="selectedActivityPath === act.path 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
              : 'border-transparent hover:bg-slate-900 text-slate-300'"
          >
            <span class="text-xs font-bold font-mono tracking-tight truncate">{{ act.name }}</span>
            <div class="flex items-center justify-between text-[10px] text-slate-500">
              <span>{{ act.group }}</span>
              <span class="font-mono text-[9px] opacity-75">.vue</span>
            </div>
          </button>
        </div>
      </aside>

      <!-- Main Detail and Interactive Configuration Panel -->
      <main ref="mainContent" class="flex-1 bg-slate-950 p-6 flex flex-col lg:flex-row gap-6 overflow-y-auto">
        <!-- Configuration Card -->
        <div class="flex-1 flex flex-col gap-6">
          <div class="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 space-y-6">
            <h2 class="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <PhFileCode class="text-amber-500" /> Details & Parameters
            </h2>

            <div v-if="selectedActivityPath" class="space-y-4">
              <!-- Selected Info -->
              <div class="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-1 font-mono text-xs">
                <p class="text-slate-400">Pad: <span class="text-amber-400">w-activities/{{ selectedActivityPath.split('/').pop() }}</span></p>
                <p class="text-slate-500">Component: <span class="text-slate-300">{{ activeComponent ? 'Geladen in geheugen' : 'Niet geladen' }}</span></p>
              </div>

              <!-- Params Form -->
              <div class="space-y-3">
                <h3 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Test Config (Props)</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">Activiteit Titel</label>
                    <input 
                      v-model="testTitle" 
                      type="text" 
                      class="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-amber-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-400 mb-1">Fullscreen Mode</label>
                    <div class="flex items-center h-9">
                      <input 
                        v-model="testFullscreen" 
                        type="checkbox" 
                        id="fullscreen-chk"
                        class="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-amber-500"
                      />
                      <label for="fullscreen-chk" class="ml-2 text-xs text-slate-300 cursor-pointer select-none">
                        Vraag fullscreen aan bij starten
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-xs text-slate-400 mb-1">Instructie (HTML toegestaan)</label>
                  <textarea 
                    v-model="testInstruction" 
                    rows="3" 
                    class="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-amber-500 text-slate-200 font-sans"
                  ></textarea>
                </div>
              </div>

              <!-- Start Button -->
              <div class="pt-2">
                <button 
                  @click="startTesting" 
                  :disabled="isLoading || !activeComponent"
                  class="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-950 text-sm font-black rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <PhPlay weight="fill" /> Start Activiteit in Zandbak
                </button>
              </div>
            </div>

            <div v-else class="text-center py-20 text-slate-500 text-sm">
              Selecteer een activiteit uit de lijst aan de linkerkant om parameters aan te passen en te testen.
            </div>
          </div>

          <!-- Documentation / Integration Guide -->
          <div class="bg-slate-900/20 rounded-2xl border border-slate-800/80 p-6 space-y-4">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <PhInfo class="text-slate-400" /> Hoe zet ik een activiteit in productie?
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              De activiteiten in de map <code class="text-slate-200">w-activities</code> zijn momenteel verborgen. Als je een activiteit hebt getest en deze wilt toevoegen aan een specifieke les, volg dan deze stappen:
            </p>
            <ol class="list-decimal list-inside text-xs text-slate-400 space-y-2.5 ml-1">
              <li>
                <strong>Verplaats naar src:</strong> Kopieer het bestand naar de officiële map:<br />
                <code class="text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/50 block my-1 font-mono text-[10px]">
                  src/components/activities/{{ selectedActivityPath ? selectedActivityPath.split('/').pop() : 'NaamActiviteit.vue' }}
                </code>
              </li>
              <li>
                <strong>Registreer in useActivitySystem:</strong> Open <code class="text-slate-200">src/composables/useActivitySystem.js</code>. Importeer je component daar en voeg een unieke sleutel toe aan <code class="text-slate-200">COMPONENT_MAP</code>.
              </li>
              <li>
                <strong>Koppel aan een les:</strong> Configureer de activiteit in het lesbestand (in <code class="text-slate-200">src/lessons/...</code>) onder de sectie <code class="text-slate-200">activities</code>.
              </li>
            </ol>
          </div>
        </div>

        <!-- Terminal Logs & Status Panel -->
        <div class="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <div class="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 flex-1 flex flex-col min-h-[300px]">
            <h2 class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Logs & Debug Console</h2>
            
            <div class="flex-1 bg-slate-950 rounded-xl p-3 border border-slate-850 font-mono text-[11px] text-emerald-400 overflow-y-auto space-y-1">
              <div v-for="(log, idx) in logs" :key="idx" class="leading-relaxed">
                {{ log }}
              </div>
              <div class="text-slate-600">Console gereed voor interactie...</div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Sandboxed Component Render Overlay -->
    <!-- Since the activities themselves contain their own fixed fullscreen structures (if isOpen is true), 
         we will render it here directly in the root DOM tree when isActivityOpen is true. -->
    <component 
      v-if="isActivityOpen && activeComponent"
      :is="activeComponent"
      :isOpen="true"
      :title="testTitle"
      :instruction="testInstruction"
      :fullscreen="testFullscreen"
      @close="handleClose"
      @complete="handleComplete"
    />
  </div>
</template>

<style scoped>
/* Scrollbar Styles */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
