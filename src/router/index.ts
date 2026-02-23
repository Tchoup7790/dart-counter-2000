import GameView from '@/views/game-view.vue'
import HomeView from '@/views/home-view.vue'
import SetupView from '@/views/setup-view.vue'
import WinnerView from '@/views/winner-view.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/setup/:mode', name: 'setup', component: SetupView, props: true },
    {
      path: '/game',
      name: 'game',
      component: GameView,
      beforeEnter: (_to, _from, next) => {
        next()
      },
    },
    { path: '/winner', name: 'winner', component: WinnerView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
