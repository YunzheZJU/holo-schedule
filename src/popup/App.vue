<template>
  <div class="app">
    <div class="head">
      <template v-if="route === 'main'">
        <div class="main">
          <img class="logo" :src="popupLogo" alt="logo">
          <button type="button">
            <HIcon class="icon" name="settings" @click="onClickSettings" />
          </button>
        </div>
      </template>
      <template v-if="route === 'settings'">
        <div class="settings">
          <button type="button" class="back" @click="onClickSettings">
            <HIcon class="icon" name="back" />
            <span class="text">{{ i18n('back') }}</span>
          </button>
          <span class="title">{{ i18n('settings') }}</span>
        </div>
      </template>
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
        <div class="option">
          <label class="label">
            <span>{{ i18n('enableNtf') }}</span>
            <input type="checkbox" :checked="isNtfEnabled" @input="onChangeAlarmEnabled">
          </label>
          <div class="description">{{ i18n('enableNtfDesc') }}</div>
        </div>
        <hr>
        <div class="info">
          <div class="engine">
            {{ i18n('engine') }}
            <a href="https://github.com/YunzheZJU/non-stop-story" target="_blank">Non-stop-story</a>
          </div>
          <div class="contact">
            {{ i18n('contact') }}
            <a href="mailto:help@holo.dev" target="_blank">help@holo.dev</a>
          </div>
        </div>
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
  import { IS_NTF_ENABLED } from 'shared/store/keys'
  import { sleep } from 'utils'
  import { mapState } from 'vuex'
  import browser from 'webextension-polyfill'

  const { workflows: { toggleIsNtfEnabled } } = browser.extension.getBackgroundPage()

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
          ['idle', { text: browser.i18n.getMessage('pullHint'), icon: 'pull' }],
          ['loading', { text: browser.i18n.getMessage('pullLoading'), icon: 'loading' }],
          ['success', { text: browser.i18n.getMessage('pullSuccess'), icon: 'success' }],
          ['ended', { text: browser.i18n.getMessage('pullFinished'), icon: 'top' }],
        ])
      },
      loadingConfig() {
        return this.LoadingStatuses.get(this.loadingStatus)
      },
      ...mapState({
        isNtfEnabled: IS_NTF_ENABLED,
      }),
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
      onChangeAlarmEnabled() {
        return toggleIsNtfEnabled()
      },
      i18n: browser.i18n.getMessage,
    },
  }
</script>

<style lang="less" scoped>
  .app {
    width: 375px;
    background-color: var(--color-bg-base);
  }

  .head {
    padding: 12px 16px;
    background: linear-gradient(45deg, #268C89, #65E5B4);
    color: var(--color-text-white);

    .main {
      display: grid;
      grid-auto-flow: column;
      align-items: center;
      justify-content: space-between;

      .logo {
        height: 32px;
      }

      .icon {
        font-size: 24px;
        cursor: pointer;

        &:hover {
          filter: brightness(0.9);
        }
      }
    }

    .settings {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      justify-content: space-between;
      height: 32px;

      .back {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        justify-content: start;
        cursor: pointer;

        &:hover {
          filter: brightness(0.9);
        }

        .icon {
          font-size: 24px;
        }

        .text {
          font-size: 14px;
        }
      }

      .title {
        font-weight: 700;
        font-size: 18px;
      }
    }
  }

  .body {
    position: relative;

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
      display: grid;
      gap: 16px;
      align-content: start;
      padding: 16px;
      background-color: rgba(255, 255, 255, 0.95);

      .option {
        .label {
          display: grid;
          grid-auto-flow: column;
          justify-content: space-between;
          color: var(--color-text-normal);
          font-size: 14px;
        }

        .description {
          margin-top: 4px;
          color: var(--color-text-light);
          font-size: 12px;
        }
      }

      hr {
        margin: 0;
        border: none;
        border-top: 1px solid var(--color-bd);
      }

      .info {
        display: grid;
        gap: 8px;

        .engine, .contact {
          color: var(--color-text-normal);
          font-size: 14px;

          a {
            color: var(--color-theme);
          }
        }
      }
    }
  }

</style>
