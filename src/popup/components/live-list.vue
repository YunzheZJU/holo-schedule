<template>
  <Fragment>
    <button type="button" class="anchor" @click="handleClickAnchor">
      {{ anchorName }} ({{ lives.length }})
    </button>
    <ul class="list">
      <LiveItem v-for="live in lives"
                ref="items"
                :key="live['id']"
                :type="type"
                :live="live"
      />
    </ul>
  </Fragment>
</template>

<script>
  import LiveItem from 'components/live-item'
  import { liveTypeValidator } from 'validators'
  import { Fragment } from 'vue-fragment'
  import browser from 'webextension-polyfill'

  const { workflows: { getCachedLives, syncLives } } = browser.extension.getBackgroundPage()

  const anchorNameMap = new Map([
    ['ended', 'Ended Live'],
    ['current', 'Living'],
    ['scheduled', 'Scheduled Live'],
  ])

  export default {
    name: 'LiveList',
    components: { Fragment, LiveItem },
    props: {
      type: {
        type: String,
        validator: liveTypeValidator,
        default: 'current',
      },
    },
    data() {
      return {
        lives: getCachedLives(this.type) ?? [],
      }
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
      handleClickAnchor() {
        return this.$refs.items[0]?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      },
    },
  }
</script>

<style lang="less" scoped>
  .anchor {
    each(range(2), {
      /* This positions .anchor when it is stuck */
      &:nth-of-type(@{value}) {
        top: (@value - 1) * 26px;
        bottom: (2 - @value) * 26px;
      }
    });

    position: sticky;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 8px;
    height: 26px;
    padding: 4px 12px;
    background-color: var(--color-bg-base);
    background-image: linear-gradient(var(--color-bg-light), var(--color-bg-light));
    color: var(--color-text-light);
    font-weight: 700;
    font-size: 12px;

    &:hover {
      background-image: linear-gradient(var(--color-bg-normal), var(--color-bg-normal));
    }

    &:before, &:after {
      content: '';
      position: relative;
      top: -50%;
      border-bottom: 1px solid var(--color-bd);
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
