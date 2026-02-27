import { GameMode } from '@/models/enums/game-mode.enum'
import { STATUS } from '@/models/enums/status.enum'
import { useGameStore } from '@/stores/game.store'
import HomeView from '@/views/home-view.vue'
import SetupView from '@/views/setup-view.vue'
import WinnerView from '@/views/winner-view.vue'
import X01View from '@/views/x01-view.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/setup/:mode',
      name: 'setup',
      component: SetupView,
      props: true,
    },
    {
      path: '/game/X01',
      name: 'X01',
      component: X01View,
    },
    {
      path: '/game/221',
      name: '221',
      component: X01View,
    },
    // {
    //   path: '/game/cricket',
    //   name: 'Cricket',
    //   component: CricketView,
    // },
    // {
    //   path: '/game/atc',
    //   name: 'Arround The Clock',
    //   component: AtcView,
    // },
    { path: '/winner', name: 'winner', component: WinnerView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const game = useGameStore()

  // Si une partie est en cours et qu'on essaie d'aller sur home ou setup
  if (
    game.status === STATUS.PLAYING &&
    (to.name === 'home' || to.name === 'setup')
  ) {
    const ROUTE: Partial<Record<GameMode, string>> = {
      [GameMode.X01]: 'X01',
    }
    const route = ROUTE[game.gameMode!]
    if (route) return { name: route }
  }
})

export default router
