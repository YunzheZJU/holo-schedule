<template>
  <div>1234</div>
</template>

<script>
  import { syncCurrentLives } from '../workflows'

  export default {
    name: 'App',
    created: async function () {
      console.log('created')
      await syncCurrentLives()
    }
  }
</script>

<style scoped>

</style>