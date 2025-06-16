import { createRouter, createWebHashHistory } from 'vue-router'
import ControlPage from '../views/ControlPage.vue'
import CaptionPage from '@renderer/views/CaptionPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ControlPage
    },
    {
      path: '/caption',
      name: 'caption',
      component: CaptionPage
    }
  ]
})

export default router
