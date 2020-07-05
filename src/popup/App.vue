<template>
  <div class="app">
    <div class="head">
      <img class="logo" :src="popupLogo" alt="logo">
    </div>
    <div ref="body" class="body">
      <div ref="loading" class="loading">{{ loadingText }}</div>
      <div class="scroll">
        <LiveListEnded ref="liveListEnded" />
        <LiveList type="current" />
        <LiveList type="scheduled" />
      </div>
      <VToast style="top: 64px;z-index: 1;" />
      <VHint style="z-index: 1" />
    </div>
  </div>
</template>

<script>
  import LiveList from 'components/live-list'
  import LiveListEnded from 'components/live-list-ended'
  import VHint from 'components/v-hint'
  import VToast from 'components/v-toast'
  import { sleep } from 'utils'
  import browser from 'webextension-polyfill'

  const ratioThreshold = { high: 0.99, low: 0.01 }

  export default {
    name: 'App',
    components: {
      LiveListEnded, LiveList, VToast, VHint,
    },
    data() {
      return {
        loadingText: 'Pull to load more',
        interval: null,
      }
    },
    computed: {
      popupLogo() {
        return browser.runtime.getURL('assets/popup_logo.svg')
      },
    },
    mounted() {
      const intersectionObserver = new IntersectionObserver(
        this.onIntersectionChange, {
          root: this.$refs.body,
          threshold: Object.values(ratioThreshold),
        },
      )
      intersectionObserver.observe(this.$refs.loading)
    },
    methods: {
      async onIntersectionChange(entries) {
        const ratio = entries[0].intersectionRatio

        if (ratio >= ratioThreshold.high) {
          clearInterval(this.interval)

          if (!this.$SKIP_THE_FIRST_RUN) {
            this.$SKIP_THE_FIRST_RUN = true
            // This gives user a hint
            await sleep(500)
          } else {
            await Promise.allSettled([
              this.loadNewItems(),
              // This is a workaround for touchpad scrolling
              sleep(2000),
            ]).then(() => {
              this.loadingText = 'Pull to load more'
            })
          }

          this.hidePullHint()
        } else if (ratio >= ratioThreshold.low) {
          this.interval = setTimeout(this.hidePullHint, 1000)
        } else {
          clearInterval(this.interval)
        }
      },
      async loadNewItems() {
        this.loadingText = 'Loading'

        await this.$refs.liveListEnded.load()

        this.loadingText = 'Success'
      },
      hidePullHint() {
        this.$refs.body.scrollTo({ top: 30, behavior: 'smooth' })
      },
    },
  }
</script>

<style lang="less" scoped>
  .app {
    width: 375px;
    background-color: var(--color-bg-base);
    background-image: linear-gradient(var(--color-bg-light), var(--color-bg-light));
  }

  .head {
    padding: 12px 16px;
    background: linear-gradient(45deg, #268C89, #65E5B4);

    .logo {
      height: 32px;
    }
  }

  .body {
    overflow-y: auto;
    max-height: 540px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .loading {
      padding: 4px 0;
      font-size: 14px;
      text-align: center;
    }

    .scroll {
      overflow-y: auto;
      height: 540px;
      scrollbar-width: none;
      /* 40px refers to anchor-height */
      scroll-padding: 2 * 40px;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
</style>
