import Vue from 'vue'
import Vuex from 'vuex'

import user from './modules/user'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
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
