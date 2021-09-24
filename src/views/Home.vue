<template>
  <div class="homepage">
    <img width="300px" src="~@/assets/logo.png" alt="logo" />
    <ul class="cards">
      <li v-for="(config, i) in configs" :key="i" :style="{ backgroundColor: config.color }" @click="jump(config)">
        <div>
          <p class="title">{{ config.token.name + ' & ' + config.stableToken.name }}</p>
          <p class="intro">Deposit {{ config.token.name }} and earn {{ config.stableToken.name }}</p>
        </div>
        <i>APY 30.0%</i>
        <img class="icon" height="160" :src="require(`@/assets/VOTER/Layer ${i + 1}.png`)" />
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Home',
  computed: {
    ...mapState(['configs']),
  },
  methods: {
    jump(c) {
      this.$router.push(`/d/${c.token.name}-${c.stableToken.name}`)
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~@/styles/color.styl'

.homepage
  padding 12px 20px 100px
  width 100%
  display flex
  flex-direction column
  align-items center
.cards
  margin-top 110px
  display grid
  grid-template-columns repeat(3, 1fr)
  grid-gap 30px
  li
    padding 46px 32px 20px
    width 246px
    height 304px
    border-radius 6px
    color $main
    border solid 1px transparent
    display flex
    flex-direction column
    justify-content space-between
    transition border-color .2s
    position relative
    overflow hidden
    cursor pointer
    &:hover
      border-color $main
  .title
    font-size 24px
    font-weight 600
  .intro
    margin-top 10px
    font-size 18px
  .icon
    position absolute
    right -30px
    bottom 0
</style>
