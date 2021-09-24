<template>
  <div class="voter-console">
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
          <!--  STAKE -->
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
          <!--  UNSTAKE -->
          <div v-else-if="toUnstake" class="sub-menu">
            <div class="input-area">
              <input type="text" placeholder="0.0" v-model="inputUnstake" />
              <div>
                <span class="max" @click="inputUnstake = staking">MAX</span>
              </div>
            </div>
            <div class="buttons">
              <div class="button" @click="withdraw">Unstake</div>
              <div class="button" sub @click="toUnstake = false">Cancel</div>
            </div>
          </div>
          <!--  BUTTON -->
          <div v-else-if="staking === '0'" class="button" @click="toStake = true">Stake {{ config.token.name }}</div>
          <div v-else class="button" @click="toUnstake = true">Unstake {{ config.token.name }}</div>
        </div>
        <div class="egg" :hide="earned === '0'" orange>
          <img width="60" :src="earned === '0' ? egg : harvest" />
          <p class="amount">{{ earned }}</p>
          <p class="remarks">Earned {{ config.stableToken.name }}</p>
          <div class="button" @click="getReward">Harvest</div>
        </div>
      </template>
    </div>
    <router-link :to="`/a/${type}`" style="display: block; padding: 12px 24px">Approve</router-link>
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
    const harvest = require(`@/assets/VOTER/harvest${Math.floor(Math.random() * 5) + 1}.png`)

    return {
      type,
      config,

      // img
      froggie,
      egg,
      harvest,

      tokenAddr: config.token.address,
      sTokenAddr: config.stableToken.address,

      needApprove: true,
      approveWaiting: 0,
      balance: '0',
      staking: '0',
      earned: '0',

      inputStake: '',
      inputUnstake: '',

      toStake: false,
      toUnstake: false,
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
        this.toStake = false
        this.update()
        console.log('success')
      } else {
        console.warn('tx cancel')
      }
    },
    async withdraw() {
      if (!this.address) return
      const amount = Web3.utils.toWei(this.inputUnstake)
      const txHash = await lib.withdraw(this.config.voterReward, amount, this.address)
      this.inputUnstake = ''
      if (txHash) {
        this.toUnstake = false
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
