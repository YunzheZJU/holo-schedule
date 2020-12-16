<template>
  <Fragment>
    <button type="button" class="anchor" @click="handleClickAnchor">
      <HIcon class="icon" :name="type === 'current' ? 'play' : 'calendar'" />
      <span class="name">{{ anchorName }}</span>
      <span>{{ lives.length }}</span>
    </button>
    <ul v-if="lives.length" class="list">
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
  import HIcon from 'components/h-icon'
  import LiveItem from 'components/live-item'
  import { CURRENT_LIVES, SCHEDULED_LIVES } from 'shared/store/keys'
  import { liveTypeValidator } from 'validators'
  import { Fragment } from 'vue-fragment'
  import { mapState } from 'vuex'
  import browser from 'webextension-polyfill'

  const { workflows: { syncLives } } = browser.extension.getBackgroundPage()

  export default {
    name: 'LiveList',
    components: { HIcon, Fragment, LiveItem },
    props: {
      type: {
        type: String,
        validator: liveTypeValidator,
        default: 'current',
      },
    },
    computed: {
      anchorName() {
        return this.$t(`liveList.lives.${this.type}.label`)
      },
      ...mapState({
        lives(state) {
          const key = this.type === 'current' ? CURRENT_LIVES : SCHEDULED_LIVES
          return state[key]
        },
      }),
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
          hintId = this.$hints.add({ text: `${this.$t(`liveList.lives.${this.type}.loading`)}...` })
          await syncLives(this.type)
        } catch (err) {
          console.error(err)
          this.$toasts.add({ type: 'error', text: err.message })
        } finally {
          this.$hints.remove(hintId)
        }
      },
      handleClickAnchor() {
        return this.$refs.items?.[0]?.scrollIntoView({ behavior: 'smooth' })
      },
    },
  }
</script>

<style lang="less" scoped>
  .anchor {
    /* Calculated from padding and line-height */
    @anchor-height: 40px;

    each(range(2), {
      /* This positions .anchor when it is stuck */
      &:nth-of-type(@{value}) {
        top: (@value - 1) * @anchor-height;
        bottom: (2 - @value) * @anchor-height;
      }
    });

    position: sticky;
    z-index: 1;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 4px;
    align-items: center;
    height: @anchor-height;
    padding: 8px 16px;
    background-color: var(--color-bg-base);
    color: var(--color-theme);
    font-size: 16px;

    &:hover, &:focus {
      background-color: var(--color-bg-light);
    }

    &:after {
      content: '';
      position: absolute;
      right: 12px;
      bottom: 4px;
      left: 12px;
      border-top: 1px solid;
    }

    .icon {
      font-size: 20px;
    }

    .name {
      text-transform: capitalize;
    }
  }

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
