<template>
  <ul v-if="lives.length" ref="root" class="list">
    <LiveItem v-for="live in lives"
              ref="items"
              :key="live['id']"
              type="ended"
              :live="live"
    />
  </ul>
</template>

<script>
  // TODO: Merge into live-list
  import LiveItem from 'components/live-item'
  import browser from 'webextension-polyfill'

  const { workflows: { getCachedLives, syncLives } } = browser.extension.getBackgroundPage()

  export default {
    name: 'LiveListEnded',
    components: { LiveItem },
    props: {},
    data() {
      return {
        lives: getCachedLives('ended') ?? [],
        parentElement: null,
      }
    },
    beforeUpdate() {
      if (this.parentElement) {
        this.savedScrollHeight = this.parentElement.scrollHeight
        this.savedScrollTop = this.parentElement.scrollTop
      }
    },
    updated() {
      if (this.parentElement) {
        const newScrollTop = this.savedScrollTop
          + (this.parentElement.scrollHeight - this.savedScrollHeight)
        this.parentElement.scrollTop = newScrollTop
        setTimeout(() => {
          this.parentElement.scrollTo({ top: newScrollTop - 30, behavior: 'smooth' })
        }, 0)
      } else {
        this.parentElement = this.$refs.root.parentElement
      }
    },
    methods: {
      async load() {
        let hintId
        try {
          hintId = this.$hints.add({ text: 'Loading Ended lives...' })
          this.lives = await syncLives('ended')
        } catch (err) {
          console.error(err)
          this.$toasts.add({ type: 'error', text: err.message })
        } finally {
          this.$hints.remove(hintId)
        }
      },
    },
  }
</script>

<style lang="less" scoped>
  .list {
    /* Be able to be covered by .anchor */
    position: relative;
    display: grid;
    grid-template-columns: auto;
    gap: 4px;
    margin: 4px 0;
    padding: 0;
    list-style: none;
  }
</style>
