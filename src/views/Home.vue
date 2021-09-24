<template>
  <div id="homepage">
    <Account />
    <p>comp: {{ comp }}</p>
    <p>dai: {{ dai }}</p>
    <p>staking: {{ staking }}</p>
    <p>earned: {{ earned }}</p>
    <p>needApprove: {{ needApprove }}</p>
    <button v-if="needApprove" @click="approve">
      {{ approveWaiting ? 'Loading...' : 'Approve' }}
    </button>

    <hr />

    <template v-if="!needApprove">
      <input type="text" v-model="inputAmount" placeholder="amount" />
      <button @click="stake">Stake</button>
      <button @click="withdraw">Withdraw</button>
      <br />
      <button @click="exit">Exit</button>
      <button @click="getReward">Get Reward</button>
    </template>

    <hr />
    <p>{{ info }}</p>
    <p>Delegates: {{ delegates }}</p>
    <template v-if="!needApprove">
      <p>{{ requiredReward }}</p>
      <input type="text" v-model="inputReward" placeholder="reward" />
      <input type="text" v-model="inputLink" placeholder="link" />
      <button @click="addfun">Add Fun</button>
      <br />
      <input type="text" v-model="inputAddr" placeholder="addr" />
      <button @click="delegate">Delegate</button>
    </template>
  </div>
</template>

<script>
import Web3 from 'web3'
import { mapState } from 'vuex'
import { config, lib } from '@/libs/chain.js'
import Account from '@/components/ui/Account'

export default {
  name: 'Home',
  components: {
    Account,
  },
  data() {
    return {
      needApprove: true,
      approveWaiting: 0,
      comp: '0',
      dai: '0',
      staking: '0',
      earned: '0',
      delegates: '',
      inputAmount: '',
      inputReward: '',
      inputLink: '',
      inputAddr: '',

      info: [],
    }
  },
  computed: {
    ...mapState({
      connector: (state) => state.connector,
      address: (state) => state.user.address,
    }),
    requiredReward() {
      if (!this.info) {
        return '0'
      }
      const ep = Number(this.info[3]) * 1000
      const now = Date.now()
      if (now < ep) {
        return ((Number(this.info[1]) / 1e18) * 1.1).toFixed(3)
      } else {
        return '0'
      }
    },
  },
  watch: {
    address() {
      this.updateBalance()
      this.updateAllowance()
    },
  },
  mounted() {
    this.updateAllowance()
    this.update()
  },
  methods: {
    update() {
      this.updateBalance()
      this.updateInfo()
      lib.getDelegates(config.compToken, config.voterReward).then((d) => {
        this.delegates = d
      })
    },
    async updateBalance() {
      if (!this.address) return
      const comp = await lib.getBalance(config.compToken, this.address)
      this.comp = Web3.utils.fromWei(comp)
      const dai = await lib.getBalance(config.daiToken, this.address)
      this.dai = Web3.utils.fromWei(dai)
      const staking = await lib.getStakeBalance(config.voterReward, this.address)
      this.staking = Web3.utils.fromWei(staking)
      const earned = await lib.getEarned(config.voterReward, this.address)
      this.earned = Web3.utils.fromWei(earned)
    },
    async updateAllowance() {
      if (!this.address) return
      const allowance = await lib.getAllowance(config.compToken, this.address, config.voterReward)
      this.needApprove = allowance === '0'
      if (!this.needApprove && this.approveWaiting) {
        clearInterval(this.approveWaiting)
        this.approveWaiting = 0
      }
    },
    async approve() {
      if (!this.address || this.approveWaiting) return
      const txHash = await lib.approve(config.compToken, config.voterReward, this.address)
      if (txHash) {
        this.approveWaiting = setInterval(this.updateAllowance, 3000)
        console.log('success')
      } else {
        console.warn('tx cancel')
      }
    },
    async stake() {
      if (!this.address) return
      const amount = Web3.utils.toWei(this.inputAmount)
      const txHash = await lib.stake(config.voterReward, amount, this.address)
      this.inputAmount = ''
      if (txHash) {
        this.update()
        console.log('success')
      } else {
        console.warn('tx cancel')
      }
    },
    async withdraw() {
      if (!this.address) return
      const amount = Web3.utils.toWei(this.inputAmount)
      const txHash = await lib.withdraw(config.voterReward, amount, this.address)
      this.inputAmount = ''
      if (txHash) {
        this.update()
        console.log('success')
      } else {
        console.warn('tx cancel')
      }
    },
    async exit() {
      if (!this.address) return
      const txHash = await lib.exit(config.voterReward, this.address)
      if (txHash) {
        this.update()
        console.log('success')
      } else {
        console.warn('tx cancel')
      }
    },
    async getReward() {
      if (!this.address) return
      const txHash = await lib.getReward(config.voterReward, this.address)
      if (txHash) {
        this.updateBalance()
        console.log('success')
      } else {
        console.warn('tx cancel')
      }
    },

    async updateInfo() {
      const info = await lib.getInfo(config.voterReward)
      this.info = info
    },
    async addfun() {
      if (!this.address) return
      const reward = Web3.utils.toWei(this.inputReward)
      const txHash = await lib.addfun(config.voterReward, reward, this.inputLink, this.address)
      this.inputReward = ''
      this.inputLink = ''
      if (txHash) {
        this.update()
        console.log('success')
      } else {
        console.warn('tx cancel')
      }
    },
    async delegate() {
      if (!this.address) return
      const txHash = await lib.delegate(config.voterReward, this.inputAddr, this.address)
      this.inputAddr = ''
      if (txHash) {
        this.update()
        console.log('success')
      } else {
        console.warn('tx cancel')
      }
    },
  },
}
</script>

<style lang="stylus">
@import '~@/styles/color.styl'
</style>
