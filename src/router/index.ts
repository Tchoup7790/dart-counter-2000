import HomeView from '@/views/home-view.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', name: 'home', component: HomeView }],
})

export default router
