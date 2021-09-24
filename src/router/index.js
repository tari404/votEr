import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home'
import Deposit from '../views/Deposit'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/d/:type',
    component: Deposit,
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
})

export default router
