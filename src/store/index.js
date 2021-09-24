import Vue from 'vue'
import Vuex from 'vuex'

import user from './modules/user'

Vue.use(Vuex)

const demoConfig = {
  color: '#704A47',
  token: {
    name: 'COMP',
    address: '0x36fec22Af9865Fb946B7Cf5E3eaf3E707D4DEDEa',
  },
  stableToken: {
    name: 'DAI',
    address: '0xDa2cb026db36baDf7525AB034ef86aD66AC31333',
  },
  voterReward: '0xd36DA705EDC9EB629Ce8FC42455D8d00B7b7b174',
}
const configs = new Array(9).fill(demoConfig)

export default new Vuex.Store({
  state: {
    configs,
    connector: null,
  },
  mutations: {
    SET_CONNERCTOR(state, { connector }) {
      state.connector = connector
    },
  },
  actions: {},
  modules: {
    user,
  },
})
