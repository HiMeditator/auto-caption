import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import CaptionPage from '@renderer/views/CaptionPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/caption',
      name: 'caption',
      component: CaptionPage
    }
  ]
})

export default router
