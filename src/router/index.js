import { createRouter, createWebHashHistory } from 'vue-router'
import YearSelection from '../views/YearSelection.vue'
import ModuleSelection from '../views/ModuleSelection.vue'
import LessonView from '../views/LessonView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: YearSelection
  },
  {
    path: '/year/:id',
    name: 'Year',
    component: ModuleSelection,
    props: true
  },
  {
    path: '/les/:id',
    name: 'Lesson',
    component: LessonView,
    props: true
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
