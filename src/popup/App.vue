<template>
  <div>1234</div>
</template>

<script>
  import browser from 'webextension-polyfill'
  import {
    syncLives,
    getCachedLives,
    syncMembers,
    getCachedMembers,
    getCachedChannels,
    syncChannels,
  } from '../workflows'

  export default {
    name: 'App',
    data() {
      return {
        loading: true,
        error: null,
        lives: [],
        channels: [],
        members: [],
      }
    },
    created: async function () {
      this.interval = setInterval(this.reloadLives, 10 * 1000)
      this.lives = await getCachedLives() || []
      this.channels = await getCachedChannels() || []
      this.members = await getCachedMembers() || []

      await this.reloadLives()
      await this.reloadChannels()
      await this.reloadMembers()
    },
    beforeDestroy() {
      clearInterval(this.interval)
    },
    computed: {
      defaultAvatar() {
        return browser.runtime.getURL('assets/default_avatar.jpg')
      },
      defaultColor() {
        return '#4de4ff'
      },
    },
    methods: {
      reloadLives: async function () {
        try {
          this.loading = true
          await syncLives()
          this.error = null
        } catch (err) {
          this.error = err
        } finally {
          this.loading = false
        }

        this.lives = await getCachedLives() || []
      },
      reloadChannels: async function () {
        try {
          this.loading = true
          await syncChannels()
          this.error = null
        } catch (err) {
          this.error = err
        } finally {
          this.loading = false
        }

        this.channels = await getCachedChannels() || []
      },
      reloadMembers: async function () {
        try {
          this.loading = true
          await syncMembers()
          this.error = null
        } catch (err) {
          this.error = err
        } finally {
          this.loading = false
        }

        this.members = await getCachedMembers() || []
      },
      getMember(live) {
        const channel = this.channels.find(({ id }) => id === live['channel_id']) || {}
        return this.members.find(({ id }) => id === channel['member_id']) || {}
      },
    },
  }
</script>

<style lang="less" scoped>
  .app {
    width: 360px;
  }
</style>