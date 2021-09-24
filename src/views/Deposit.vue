<template>
  <div class="deposit">
    <div class="intro-con">
      <p class="title">{{ config.token.name }} and {{ config.stableToken.name }}</p>
      <p class="intro">Deposit {{ config.token.name }} and earn {{ config.stableToken.name }}</p>
      <b>APY: 130%</b>
      <img width="150" :src="froggie" />
    </div>
    <div class="menu">
      <div v-if="needApprove" class="egg">
        <img width="60" :src="egg" />
        <hr />
        <div class="button" @click="approve">{{ approveWaiting ? 'Loading...' : 'Approve' }}</div>
      </div>
      <template v-else>
        <div class="egg">
          <img width="60" :src="egg" />
          <p class="amount">{{ staking }}</p>
          <p class="remarks">{{ config.token.name }} staked</p>
          <div v-if="toStake" class="sub-menu">
            <div class="input-area">
              <input type="text" placeholder="0.0" v-model="inputStake" />
              <div>
                <span class="balance">
                  Available <b>{{ balance }}</b>
                </span>
                <span class="max" @click="inputStake = balance">MAX</span>
              </div>
            </div>
            <div class="buttons">
              <div class="button" @click="stake">Stake</div>
              <div class="button" sub @click="toStake = false">Cancel</div>
            </div>
          </div>
          <div v-else class="button" @click="toStake = true">Stake {{ config.token.name }}</div>
        </div>
        <div class="egg" orange>
          <img width="60" :src="egg" />
          <p class="amount">{{ earned }}</p>
          <p class="remarks">Earned{{ config.stableToken.name }}</p>
          <div class="button" @click="getReward">Harvest</div>
        </div>
      </template>
    </div>
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

    const froggie = require(`@/assets/VOTER/Layer ${Math.floor(Math.random() * 37) + 1}.png`)
    const egg = require(`@/assets/VOTER/egg${Math.floor(Math.random() * 10) + 1}.png`)

    return {
      config,

      // img
      froggie,
      egg,

      tokenAddr: config.token.address,
      sTokenAddr: config.stableToken.address,

      needApprove: true,
      approveWaiting: 0,
      balance: '0',
      staking: '0',
      earned: '0',

      inputStake: '',

      toStake: false,
    }
  },
  computed: {
    ...mapState({
      connector: (state) => state.connector,
      address: (state) => state.user.address,
    }),
  },
  watch: {
    address() {
      this.updateAllowance()
      this.update()
    },
  },
  mounted() {
    this.updateAllowance()
    this.update()
  },
  methods: {
    update() {
      this.updateBalance()
    },
    async updateBalance() {
      if (!this.address) return
      const balance = await lib.getBalance(this.tokenAddr, this.address)
      this.balance = Web3.utils.fromWei(balance)
      const staking = await lib.getStakeBalance(this.config.voterReward, this.address)
      this.staking = Web3.utils.fromWei(staking)
      const earned = await lib.getEarned(this.config.voterReward, this.address)
      this.earned = Number(Web3.utils.fromWei(earned)).toFixed(4)
    },
    async updateAllowance() {
      if (!this.address) return
      const allowance = await lib.getAllowance(this.tokenAddr, this.address, this.config.voterReward)
      this.needApprove = allowance === '0'
      if (!this.needApprove && this.approveWaiting) {
        clearInterval(this.approveWaiting)
        this.approveWaiting = 0
      }
    },
    async approve() {
      if (!this.address || this.approveWaiting) return
      const txHash = await lib.approve(this.tokenAddr, this.config.voterReward, this.address)
      if (txHash) {
        this.approveWaiting = setInterval(this.updateAllowance, 3000)
        console.log('success')
      } else {
        console.warn('tx cancel')
      }
    },
    async stake() {
      if (!this.address) return
      const amount = Web3.utils.toWei(this.inputStake)
      const txHash = await lib.stake(this.config.voterReward, amount, this.address)
      this.inputStake = ''
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
      const txHash = await lib.withdraw(this.config.voterReward, amount, this.address)
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
      const txHash = await lib.exit(this.config.voterReward, this.address)
      if (txHash) {
        this.update()
        console.log('success')
      } else {
        console.warn('tx cancel')
      }
    },
    async getReward() {
      if (!this.address) return
      const txHash = await lib.getReward(this.config.voterReward, this.address)
      if (txHash) {
        this.updateBalance()
        console.log('success')
      } else {
        console.warn('tx cancel')
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~@/styles/color.styl'

.deposit
  margin auto
  padding 12px 20px 100px
  max-width 840px
  color $main
  .intro-con
    padding 24px
    position relative
    .title
      font-size 24px
      font-weight 600
      margin-bottom 10px
    img
      position absolute
      right 0
      bottom 0
  .menu
    width 100%
    height 320px
    border-radius 10px
    background-color $dark-background
    display flex
    justify-content space-evenly

.egg
  height 100%
  display flex
  flex-direction column
  justify-content center
  align-items center
  hr
    margin 0
    border none
    height 6px
  .amount
    margin-top 20px
    font-size 18px
    font-weight 600
  .button
    margin-top 28px
    width 156px
    height 46px
    border-radius 4px
    border solid 1px
    border-color inherit
    font-size 14px
    font-weight 600
    cursor pointer
    display flex
    justify-content center
    align-items center
  .remarks
    font-size 12px

  .input-area
    margin-top 28px
    padding 6px 70px 4px 10px
    width 230px
    height 46px
    border-radius 4px
    background-color $button
    display flex
    align-items center
    overflow hidden
    position relative
    input
      padding 0
      width 100%
      font inherit
      font-size 14px
      font-weight 600
      color $content
      background-color transparent
      border none
      outline none
    > div
      padding 4px
      position absolute
      top 0
      bottom 0
      right 0
      display flex
      flex-direction column
      align-items flex-end
      justify-content space-between
      font-size 12px
    .balance
      color $gray
    .max
      width 34px
      height 16px
      color $content
      background-color $max
      border-radius 2px
      display flex
      justify-content center
      align-items center
      cursor pointer
  .buttons
    margin-top 8px
    display grid
    grid-template-columns 110px 110px
    grid-gap 10px
    .button
      margin 0
      width 110px
      height 36px
    .button[sub]
      border none
      background-color $button

.egg[orange]
  color $orange
</style>
