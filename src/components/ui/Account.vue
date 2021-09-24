<template>
  <div class="connect-account">
    <div v-if="address">{{ address }}</div>
    <div v-else @click="connect" class="_fm">Connect to MetaMask</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { setProvider } from '@/libs/chain.js'

const CHAIN = {
  chainId: '0x2a',
  chainName: 'Kovan',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 42,
  },
  rpcUrls: ['https://kovan.infura.io'],
}
const NETWORK = CHAIN.chainId

export default {
  name: 'Account',
  computed: {
    ...mapState({
      address: (state) => state.user.address,
    }),
  },
  mounted() {
    this.connect()
  },
  methods: {
    async connect() {
      if (typeof window.ethereum === 'undefined') {
        // TODO error message
        return
      }
      setProvider(window.web3.currentProvider)
      await this.updateAccount()
      await this.updateChain()
      // window.ethereum.request({ method: 'eth_chainId' }).then(console.log)
      // window.ethereum.addListener('chainChanged', this.updateChain)
      this.$store.commit('SET_CONNERCTOR', {
        connector: {
          sendTransaction: (tx) =>
            window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [tx],
            }),
        },
      })
    },
    async updateAccount() {
      const commit = this.$store.commit
      const status = await window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          commit('UPDATE_ADDRESS', accounts[0])
          return true
        })
        .catch(() => false)
      if (!status) {
        // TODO error message
        return
      }

      window.ethereum.addListener('accountsChanged', (accounts) => {
        commit('UPDATE_ADDRESS', accounts[0])
      })
    },
    async updateChain() {
      if (typeof window.ethereum === 'undefined') {
        return
      }
      return window.ethereum
        .request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK }],
        })
        .catch((e) => {
          switch (e.code) {
            case 4902: // Unrecognized chain ID
              return this.addChain()
            case 4001: // User rejected the request.
            default:
              return
          }
        })
    },
    async addChain() {
      if (typeof window.ethereum === 'undefined') {
        return
      }
      return window.ethereum
        .request({
          method: 'wallet_addEthereumChain',
          params: [CHAIN],
        })
        .catch()
    },
  },
}
</script>

<style lang="stylus">
@import '~@/styles/color.styl'

.connect-account
  font-size 1em
  cursor pointer
  color $main
</style>
