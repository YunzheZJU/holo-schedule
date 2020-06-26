<template>
  <Fragment>
    <div class="anchor">{{anchorName}} ({{lives.length}})</div>
    <ul class="list">
      <LiveItem v-for="live in lives" :key="live['id']" :type="type" :live="live" />
    </ul>
  </Fragment>
</template>

<script>
  import { Fragment } from 'vue-fragment'
  import browser from 'webextension-polyfill'
  import { liveTypeValidator } from '../validators'
  import LiveItem from './live-item'

  const { workflows: { getCachedLives, syncLives } } = browser.extension.getBackgroundPage()

  const anchorNameMap = new Map([
    ['ended', 'Ended Live'],
    ['current', 'Living'],
    ['scheduled', 'Scheduled Live'],
  ])

  export default {
    name: 'live-list',
    components: { Fragment, LiveItem },
    data() {
      return {
        lives: getCachedLives(this.type) || [],
      }
    },
    props: {
      type: {
        type: String,
        validator: liveTypeValidator,
      },
    },
    computed: {
      anchorName() {
        return anchorNameMap.get(this.type)
      },
    },
    async created() {
      await this.reloadLives()

      this.interval = setInterval(this.reloadLives, 10 * 1000)
    },
    beforeDestroy() {
      clearInterval(this.interval)
    },
    methods: {
      async reloadLives() {
        let hintId
        try {
          hintId = this.$hints.add({ text: `Loading ${this.type} lives...` })
          this.lives = await syncLives(this.type)
        } catch (err) {
          this.$toasts.add({ type: 'error', text: err.message })
        } finally {
          this.$hints.remove(hintId)
        }
      },
    },
  }
</script>

<style lang="less" scoped>
  .anchor {
    position: sticky;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 8px;
    padding: 4px 12px;
    background-color: rgb(255, 255, 255);
    background-image: linear-gradient(rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.02));
    color: rgba(0, 0, 0, 0.4);
    font-weight: 600;
    font-size: 12px;

    /* TODO: Generate dynamically */

    &:nth-of-type(1) {
      top: 0;
      bottom: 26px;
    }

    &:nth-of-type(2) {
      top: 26px;
      bottom: 0;
    }

    &:hover {
      background-image: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05));
    }

    &:before, &:after {
      content: '';
      position: relative;
      top: -50%;
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    }
  }

  .list {
    /* Be able to be covered by .anchor */
    position: relative;
    display: grid;
    grid-template-columns: auto;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>