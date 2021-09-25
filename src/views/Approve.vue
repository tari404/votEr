<template>
  <div class="voter-console">
    <div class="intro-con">
      <p class="title">{{ config.token.name }} and {{ config.stableToken.name }}</p>
      <p class="intro">Deposit {{ config.token.name }} and earn {{ config.stableToken.name }}</p>
      <span class="end" v-if="hasSponsor">Ends in {{ new Date(periodFinish).toLocaleString() }}</span>
      <img width="150" :src="froggie" />
    </div>
    <div class="menu">
      <template v-if="hasSponsor">
        <div class="egg">
          <img width="60" src="@/assets/VOTER/milk.png" />
          <p class="amount">{{ sponsorshipAmount }} {{ config.stableToken.name }}</p>
          <p class="remarks">Amount</p>
        </div>
        <div class="egg">
          <img width="60" :src="froggie2" />
          <p class="amount">Sponsor</p>
          <p class="remarks">{{ sponsor }}</p>
        </div>
      </template>
      <div v-if="needApprove" class="egg">
        <img width="60" :src="egg" />
        <hr />
        <div class="button" @click="approve">{{ approveWaiting ? 'Loading...' : 'Approve' }}</div>
      </div>
      <div v-else class="egg egg-left">
        <p class="amount">Why Vote</p>
        <div class="input-area">
          <input type="text" v-model="inputLink" placeholder="Add link" />
        </div>
        <p class="amount">Price</p>
        <div class="input-area">
          <input type="text" v-model="inputReward" :placeholder="requiredReward" />
          <div>
            <span class="balance">
              Available <b>{{ balance }}</b>
            </span>
            <span class="max" @click="inputReward = balance">MAX</span>
          </div>
        </div>
        <div class="button" @click="addfun">Sponsor</div>
      </div>
    </div>
    <router-link :to="`/d/${type}`" style="display: inline-block; padding: 12px 24px">Deposit</router-link>
  </div>
</template>

<script>
import Web3 from 'web3'
import { mapState } from 'vuex'
import { lib } from '@/libs/chain.js'

export default {
  name: 'Deposit',
  data() {
    const type = this.$route.params.type
    const configs = this.$store.state.configs
    const config = configs.find((c) => type === c.token.name + '-' + c.stableToken.name)

    const egg = require(`@/assets/VOTER/egg${Math.floor(Math.random() * 10) + 1}.png`)
    const froggie = require(`@/assets/VOTER/Layer ${Math.floor(Math.random() * 37) + 1}.png`)
    const froggie2 = require(`@/assets/VOTER/Layer ${Math.floor(Math.random() * 37) + 1}.png`)

    return {
      type,
      config,

      // img
      egg,
      froggie,
      froggie2,

      tokenAddr: config.token.address,
      sTokenAddr: config.stableToken.address,

      needApprove: true,
      approveWaiting: 0,
      balance: '0',
      delegates: '',

      sponsor: '',
      sponsorshipAmount: '',
      periodFinish: 0,
      link: '',

      inputReward: '',
      inputLink: '',
    }
  },
  computed: {
    ...mapState({
      connector: (state) => state.connector,
      address: (state) => state.user.address,
    }),
    requiredReward() {
      if (!this.sponsorshipAmount) {
        return '0.0'
      }
      if (this.hasSponsor) {
        return (Number(this.sponsorshipAmount) * 1.1).toFixed(2)
      } else {
        return '0.0'
      }
    },
    hasSponsor() {
      const now = Date.now()
      return now < this.periodFinish
    },
  },
  watch: {
    address() {
      this.update()
    },
  },
  mounted() {
    this.update()
  },
  methods: {
    async update() {
      if (!this.address) return

      const store = await lib.multicall(
        this.config.token.address,
        this.config.stableToken.address,
        this.config.voterReward,
        this.address
      )

      // voterReward info
      this.sponsor = store.sponsor
      this.sponsorshipAmount = store.sponsorshipAmount
      this.periodFinish = store.periodFinish
      this.link = store.link

      // balance
      this.balance = store.earnBalance

      // allowance
      const allowance = store.earnTokenAllowance
      this.needApprove = allowance === '0'
      if (!this.needApprove && this.approveWaiting) {
        clearInterval(this.approveWaiting)
        this.approveWaiting = 0
      }

      // lib.getDelegates(this.sTokenAddr, this.config.voterReward).then((d) => {
      //   this.delegates = d
      // })
    },
    async approve() {
      if (!this.address || this.approveWaiting) return
      const txHash = await lib.approve(this.sTokenAddr, this.config.voterReward, this.address)
      if (txHash) {
        this.approveWaiting = setInterval(this.updateAllowance, 3000)
        console.log('success')
      } else {
        console.warn('tx cancel')
      }
    },
    async addfun() {
      if (!this.address) return
      const reward = Web3.utils.toWei(this.inputReward)
      const txHash = await lib.addfun(this.config.voterReward, reward, this.inputLink, this.address)
      this.inputReward = ''
      this.inputLink = ''
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

<style lang="stylus" scoped>
.egg
  width 160px
.egg-left
  margin-left 40px
  width 300px
  align-items flex-start
  .amount
    margin 0
  .input-area
    margin 10px 0
    width 100%
    height 44px
  .button
    margin-top 20px
</style>
