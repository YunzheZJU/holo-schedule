<template>
  <div>1234</div>
</template>

<script>
  import { syncLives, getCachedLives } from '../workflows'

  export default {
    name: 'App',
    data: () => ({
      loading: true,
      error: null,
      lives: [],
    }),
    created: async function () {
      this.interval = setInterval(this.reloadLives, 10000)
      await this.reloadLives()
    },
    beforeDestroy() {
      clearInterval(this.interval)
    },
    methods: {
      reloadLives: async function () {
        console.log('reloadLives')
        try {
          this.loading = true
          await syncLives()
          this.error = null
        } catch (err) {
          this.error = err
        } finally {
          this.loading = false
        }

        this.lives = await getCachedLives()
      },
    },
  }
</script>

<style scoped>
  .app {
    width: 360px;
  }
</style>