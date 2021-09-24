export default {
  state: () => ({
    address: '',
  }),

  mutations: {
    UPDATE_ADDRESS(state, address) {
      state.address = address
    },
  },
}
