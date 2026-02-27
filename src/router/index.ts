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

export default router
