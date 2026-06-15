<script setup>
import { PhPlay, PhPause, PhStop, PhPencilSimple } from '@phosphor-icons/vue'
import { ref, watch, computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  startDuration: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

// STATE
const isExpanded = ref(false) 
const isRunning = ref(false)
const timeLeft = ref(0)
const initialTime = ref(0)
const inputMins = ref(0)
const inputSecs = ref(0)

let intervalId = null
let audioCtx = null

// WATCHERS
watch(() => props.startDuration, (newVal) => {
    if (newVal > 0) {
        inputMins.value = newVal.toString().padStart(2, '0')
        inputSecs.value = '00'
        timeLeft.value = newVal * 60
        initialTime.value = timeLeft.value
        startTimer()
    }
})

// SYNC INPUTS ON OPEN
watch(isExpanded, (val) => {
    if (val) {
        // Sync inputs to current remaining time (rounded up to minutes? No, exact)
        const m = Math.floor(timeLeft.value / 60)
        const s = timeLeft.value % 60
        inputMins.value = m.toString().padStart(2, '0')
        inputSecs.value = s.toString().padStart(2, '0')
    }
})

// TIMER LOGIC
function startTimer() {
    // Parse text inputs "05" -> 5
    // Only update if we are not RESUMING (checking if timeLeft matches inputs approximately? No, just restart if expanded)
    if (isExpanded.value) {
         const m = parseInt(inputMins.value) || 0
         const s = parseInt(inputSecs.value) || 0
         if (m === 0 && s === 0) return
        
         timeLeft.value = m * 60 + s
         initialTime.value = timeLeft.value
    }
    
    isRunning.value = true
    isExpanded.value = false // Auto collapse when running
    
    // Audio Context Resume
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume()

    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(tick, 1000)
}

function tick() {
    if (timeLeft.value > 0) {
        timeLeft.value--
    } else {
        finish()
    }
}

function pauseTimer() {
    isRunning.value = false
    clearInterval(intervalId)
}

function togglePlayPause() {
    if (isRunning.value) {
        pauseTimer()
    } else {
        // If it was finished (00:00), we probably shouldn't just "resume" 0. 
        // But stopTimer resets to 0. 
        // If paused at >0, start.
        if (timeLeft.value > 0) startTimer()
    }
}

function stopTimer() {
    pauseTimer()
    timeLeft.value = 0
    initialTime.value = 0
}

function finish() {
    pauseTimer()
    playAlarm()
}

// AUDIO
function playAlarm() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    
    const now = audioCtx.currentTime
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    
    // ALARM: More aggressive
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.setValueAtTime(440, now + 0.2)
    osc.frequency.setValueAtTime(880, now + 0.4)
    osc.frequency.setValueAtTime(440, now + 0.6)
    osc.frequency.setValueAtTime(880, now + 0.8) // Extra beeps
    osc.frequency.setValueAtTime(440, now + 1.0)
    
    gain.gain.setValueAtTime(0.5, now)
    gain.gain.linearRampToValueAtTime(0.8, now + 0.5) // Loud
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2)
    
    osc.start(now)
    osc.stop(now + 1.2)
}

// FORMATTING
const formattedTime = computed(() => {
    const m = Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
    const s = (timeLeft.value % 60).toString().padStart(2, '0')
    return `${m}:${s}`
})

function applySetup() {
    startTimer()
}

function padInput(type) {
    if (type === 'min') {
        let val = parseInt(inputMins.value) || 0
        if (val < 0) val = 0
        if (val > 99) val = 99
        inputMins.value = val.toString().padStart(2, '0')
    } else {
        let val = parseInt(inputSecs.value) || 0
        if (val < 0) val = 0
        if (val > 59) val = 59
        inputSecs.value = val.toString().padStart(2, '0')
    }
}

function enforceTwoDigits(type) {
    const val = type === 'min' ? inputMins.value : inputSecs.value
    // Keep only digits
    const clean = val.replace(/\D/g, '')
    // Trim to 2
    const trimmed = clean.slice(0, 2)
    
    if (type === 'min') inputMins.value = trimmed
    else inputSecs.value = trimmed
}
</script>

<template>
  <div>
      <!-- ALARM OVERLAY (Bonkers Mode) - Keep Teleported to body -->
      <Teleport to="body">
          <div 
            v-if="timeLeft === 0 && initialTime > 0" 
            @click="stopTimer"
            class="fixed inset-0 z-[100] cursor-pointer flex flex-col items-center justify-center overflow-hidden"
          >
              <div class="absolute inset-0 bg-red-500/20 animate-pulse backdrop-blur-sm"></div>
              <div class="bg-red-600 text-white font-black text-9xl transform rotate-3 border-8 border-white shadow-[0_0_50px_rgba(220,38,38,0.8)] px-12 py-6 rounded-3xl animate-[bounce_0.5s_infinite] select-none">
                  TIME'S UP!
              </div>
              <div class="relative mt-8 bg-white/90 text-red-600 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm shadow-xl animate-pulse select-none">
                  Klik ergens om te sluiten
              </div>
          </div>
      </Teleport>

      <!-- INLINE TIMER (No Teleport - renders where placed) -->
      <div class="relative">
           <!-- The Pill - Compact for thin header -->
          <div class="flex items-center gap-4 h-full"> 
              <!-- Timer Display - Bigger & integrated -->
              <div 
                  class="font-mono font-bold text-2xl tracking-widest tabular-nums leading-none" 
                  :class="{'text-amber-500': timeLeft === 0 && initialTime === 0, 'text-emerald-400': isRunning && timeLeft > 0, 'text-red-100 font-black animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]': timeLeft === 0 && initialTime > 0}"
              >
                  {{ formattedTime }}
              </div>
              
              <!-- Divider -->
              <div class="h-6 w-px bg-slate-700/50"></div>

              <!-- Controls -->
              <div class="flex items-center gap-1">
                  <!-- 1. Play/Pause -->
                  <button 
                      @click="togglePlayPause" 
                      class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors"
                      :class="(!isRunning && timeLeft > 0) ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-400 hover:text-white'"
                      :disabled="timeLeft === 0 && !isRunning"
                      :title="(!isRunning && timeLeft > 0) ? 'Hervat' : 'Pauze'"
                  >
                      <component :is="(!isRunning && timeLeft > 0) ? PhPlay : PhPause" weight="fill" class="text-sm" /> 
                  </button>

                  <!-- 2. Stop -->
                  <button 
                      @click="stopTimer" 
                      class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
                      title="Stop"
                  >
                      <PhStop weight="fill" class="text-sm" />
                  </button>

                  <!-- 3. Edit (Pencil) -->
                  <button 
                      @click="isExpanded = !isExpanded" 
                      class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors" 
                      :class="{'bg-slate-800 text-white': isExpanded}"
                      title="Instellingen"
                  >
                      <PhPencilSimple weight="bold" class="text-sm" />
                  </button>
              </div>
          </div>

          <!-- EXPANDED SETUP VIEW (Dropdown) -->
          <div 
              v-if="isExpanded"
              class="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 w-[260px] p-4 flex flex-col z-[100] animate-[floatIn_0.2s_ease-out] origin-top-right"
          >
              <div class="mb-3 text-center">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Stel timer in</span>
              </div>

              <!-- Inputs -->
              <div class="flex items-center justify-center gap-2 mb-4">
                    <input 
                      type="text" 
                      inputmode="numeric" 
                      maxlength="2"
                      v-model="inputMins" 
                      @focus="$event.target.select()"
                      @blur="padInput('min')" 
                      @input="enforceTwoDigits('min')"
                      class="w-16 text-4xl text-center font-bold text-slate-800 border-b-2 border-slate-200 focus:border-amber-500 outline-none bg-transparent p-1 font-mono selection:bg-amber-100 placeholder:text-slate-200" 
                      placeholder="00" 
                    />
                    <span class="text-2xl text-slate-300 font-light pb-2 select-none">:</span>
                    <input 
                      type="text" 
                      inputmode="numeric" 
                      maxlength="2"
                      v-model="inputSecs" 
                      @focus="$event.target.select()"
                      @blur="padInput('sec')" 
                      @input="enforceTwoDigits('sec')"
                      class="w-16 text-4xl text-center font-bold text-slate-800 border-b-2 border-slate-200 focus:border-amber-500 outline-none bg-transparent p-1 font-mono selection:bg-amber-100 placeholder:text-slate-200" 
                      placeholder="00" 
                    />
              </div>

              <!-- Start Button -->
              <button 
                  @click="applySetup" 
                  class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
              >
                    <PhPlay weight="fill" />
                    Start Timer
              </button>
          </div>
      </div>
  </div>
</template>

<style scoped>
@keyframes floatIn {
    from { opacity: 0; transform: translateY(-5px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
