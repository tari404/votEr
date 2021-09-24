<template>
  <div id="app">
    <!-- <Nav /> -->
    <router-view />
  </div>
</template>

<script>
// import Nav from '@/components/Nav'

export default {
  name: 'App',
  components: {
    // Nav,
  },
  created() {
    this.updateSize()
    addEventListener('resize', this.updateSize)
  },
  beforeDestroy() {
    removeEventListener('resize', this.updateSize)
  },
  methods: {
    updateSize() {
      const w = innerWidth
      let fs = 20
      if (w < 480) {
        fs = 12
      } else if (w < 1920) {
        fs = 12 + (w - 480) / 180
      }
      document.documentElement.style.fontSize = fs + 'px'
    },
  },
}
</script>

<style lang="stylus">
#app
  position relative
</style>
