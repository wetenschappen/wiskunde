<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PhPi, PhArrowLeft, PhCaretRight, PhBookOpen } from '@phosphor-icons/vue'
import { modules } from '../data/modules'

const router = useRouter()
const route = useRoute()

const yearId  = computed(() => parseInt(route.params.id))
const classId = computed(() => route.params.classId)

const filteredModules = computed(() => modules.filter(m => m.year === yearId.value))

// Group lessons by module number, parsed from the lesson ID.
// ID format: nando3-m01-l01-onderwerp  →  module "01", lesson 1
const groupedModules = computed(() => {
  const groups = {}

  filteredModules.value.forEach(m => {
    const match = m.id.match(/m(\d+)-l(\d+)/)
    const moduleNum = match ? match[1] : '00'
    const lessonNum = match ? parseInt(match[2]) : 1

    if (!groups[moduleNum]) {
      // Topic = everything before the first ":" in the title, or the full title
      const topic = m.title.includes(':') ? m.title.split(':')[0].trim() : m.title
      groups[moduleNum] = {
        moduleNum,
        topic,
        lessons: [],
        icon:  m.icon,
        color: m.color,
        bg:    m.bg
      }
    }

    groups[moduleNum].lessons.push({ ...m, lessonNum })
  })

  return Object.values(groups).sort((a, b) => parseInt(a.moduleNum) - parseInt(b.moduleNum))
})

const goBack = () => router.push('/year/' + yearId.value + '/class')
</script>

<template>
  <div class="min-h-screen relative z-10 font-sans">
    <div class="max-w-2xl mx-auto px-6 pt-10 pb-24">

      <!-- Back -->
      <button
        @click="goBack"
        class="flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors font-semibold text-sm mb-10"
      >
        <PhArrowLeft weight="bold" />
        Terug
      </button>

      <!-- Page header -->
      <div class="mb-10 flex items-center gap-5">
        <div class="w-14 h-14 shrink-0 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
          <PhPi weight="duotone" class="text-[2rem] text-brand-dark" />
        </div>
        <div>
          <h1 class="text-3xl font-extrabold text-slate-800 leading-tight">Wiskunde {{ classId }}</h1>
          <p class="text-slate-400 text-sm mt-0.5">Kies een les om te starten</p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="groupedModules.length === 0" class="text-center py-16 text-slate-400">
        Nog geen modules beschikbaar.
      </div>

      <!-- Module groups -->
      <div v-else class="space-y-8">
        <section v-for="group in groupedModules" :key="group.moduleNum">

          <!-- Module header -->
          <div class="flex items-center gap-3 mb-3">
            <!-- coloured icon -->
            <div
              class="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center"
              :class="group.bg"
            >
              <component :is="group.icon" weight="fill" class="text-base" :class="group.color" />
            </div>

            <!-- module label + topic -->
            <span class="text-[0.6rem] font-black tracking-[0.18em] uppercase text-slate-400 shrink-0">
              Module {{ group.moduleNum }}
            </span>
            <span class="text-sm font-bold text-slate-700 truncate">{{ group.topic }}</span>

            <!-- rule -->
            <div class="flex-1 h-px bg-slate-200 min-w-4"></div>

            <!-- lesson count -->
            <span class="text-[0.6rem] font-bold tracking-widest uppercase text-slate-400 shrink-0">
              {{ group.lessons.length }}
              {{ group.lessons.length === 1 ? 'les' : 'lessen' }}
            </span>
          </div>

          <!-- Lesson rows -->
          <div class="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
            <div
              v-for="lesson in group.lessons"
              :key="lesson.id"
              @click="router.push('/les/' + lesson.id)"
              class="group flex items-center gap-4 bg-white hover:bg-amber-50/60 px-5 py-3.5 cursor-pointer transition-colors duration-150"
            >
              <!-- Lesson number pill -->
              <div
                class="shrink-0 w-9 h-9 rounded-lg flex flex-col items-center justify-center"
                :class="group.bg"
              >
                <span class="text-[0.45rem] font-black uppercase tracking-widest leading-none opacity-70" :class="group.color">les</span>
                <span class="text-sm font-black leading-tight" :class="group.color">{{ lesson.lessonNum }}</span>
              </div>

              <!-- Lesson info -->
              <div class="flex-1 min-w-0">
                <div class="text-[0.6rem] font-bold tracking-widest uppercase text-slate-400 mb-0.5 leading-none">
                  M{{ group.moduleNum }} · Les {{ lesson.lessonNum }}
                </div>
                <div class="text-slate-800 font-semibold text-sm leading-snug truncate group-hover:text-slate-900">
                  {{ lesson.title }}
                </div>
              </div>

              <!-- Arrow -->
              <PhCaretRight
                class="shrink-0 text-slate-300 group-hover:text-amber-500 text-lg transition-all duration-150 group-hover:translate-x-0.5"
              />
            </div>
          </div>

        </section>
      </div>

    </div>
  </div>
</template>
