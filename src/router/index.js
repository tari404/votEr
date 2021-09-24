import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home'
import Deposit from '../views/Deposit'
import Approve from '../views/Approve'

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
  {
    path: '/a/:type',
    component: Approve,
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
})

export default router
