<template>
  <div class="app">
    <div class="head">
      <img class="logo" :src="popupLogo" alt="logo">
      <HIcon class="icon" name="settings" @click="onClickSettings" />
    </div>
    <div class="body">
      <div ref="main" class="main">
        <div ref="loading" class="loading" @click="onClickLoading">
          <HIcon class="icon" :name="loadingConfig.icon" />
          <span>{{ loadingConfig.text }}</span>
        </div>
        <div ref="scroll" class="scroll">
          <LiveListEnded ref="liveListEnded" />
          <LiveList type="current" />
          <LiveList type="scheduled" />
        </div>
        <VToast class="toast" />
        <VHint class="hint" />
      </div>
      <div v-if="route === 'settings'" class="settings">
        Settings
      </div>
    </div>
  </div>
</template>

<script>
  import HIcon from 'components/h-icon'
  import LiveList from 'components/live-list'
  import LiveListEnded from 'components/live-list-ended'
  import VHint from 'components/v-hint'
  import VToast from 'components/v-toast'
  import { sleep } from 'utils'
  import browser from 'webextension-polyfill'

  const ratioThreshold = { high: 0.99, low: 0.01 }

  export default {
    name: 'App',
    components: { HIcon, LiveListEnded, LiveList, VToast, VHint },
    data() {
      return {
        loadingStatus: 'idle',
        interval: null,
        route: 'main',
      }
    },
    computed: {
      popupLogo() {
        return browser.runtime.getURL('assets/popup_logo.svg')
      },
      LoadingStatuses() {
        return new Map([
          ['idle', { text: 'Pull to load more', icon: 'pull' }],
          ['loading', { text: 'Loading', icon: 'loading' }],
          ['success', { text: 'Success', icon: 'success' }],
          ['ended', { text: 'That\'s all', icon: 'top' }],
        ])
      },
      loadingConfig() {
        return this.LoadingStatuses.get(this.loadingStatus)
      },
    },
    mounted() {
      const intersectionObserver = new IntersectionObserver(
        this.onIntersectionChange, {
          root: this.$refs.main,
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
              this.loadingStatus = this.loadingStatus === 'ended' ? 'ended' : 'idle'
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
        if (this.loadingStatus === 'ended') {
          return
        }
        this.loadingStatus = 'loading'

        const ended = await this.$refs.liveListEnded.load()

        this.loadingStatus = ended ? 'ended' : 'success'
      },
      hidePullHint() {
        this.$refs.main.scrollTo({ top: 30, behavior: 'smooth' })
      },
      onClickLoading() {
        // Manually toggle the intersection observer callback
        // This is a fallback where pull hint can not hide itself automatically
        // Note that loading status and first run are not handled in this fallback
        // Overusing this 'exit' may lead to inconsistent state
        this.onIntersectionChange([{ intersectionRatio: 1 }])
      },
      onClickSettings() {
        this.route = this.route === 'settings' ? 'main' : 'settings'
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
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: linear-gradient(45deg, #268C89, #65E5B4);

    .logo {
      height: 32px;
    }

    .icon {
      color: var(--color-text-white);
      font-size: 24px;
      cursor: pointer;

      &:hover {
        filter: brightness(0.9);
      }
    }
  }

  .body {
    position: relative;
  }

  .main {
    overflow-y: auto;
    max-height: 540px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .loading {
    display: grid;
    grid-auto-flow: column;
    gap: 4px;
    align-items: center;
    justify-content: center;
    padding: 4px 0;
    color: var(--color-text-light);
    font-size: 14px;
    cursor: pointer;

    .icon {
      font-size: 20px;
    }
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

  .toast {
    top: 64px;
    z-index: 1;
  }

  .hint {
    z-index: 1;
  }

  .settings {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.95);
    font-size: 16px;
  }
</style>
