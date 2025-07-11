<template>
  <div class="app" :lang="$i18n.locale">
    <div class="head">
      <template v-if="route === 'main'">
        <div class="main">
          <img class="logo" :src="popupLogo" alt="logo">
          <button type="button" class="to-settings" @click="onClickSettings">
            <HIcon class="icon" name="settings" />
          </button>
        </div>
      </template>
      <template v-if="route === 'settings'">
        <div class="settings">
          <button type="button" class="back" @click="onClickSettings">
            <HIcon class="icon" name="back" />
            <span class="text">{{ $t('app.settings.back') }}</span>
          </button>
          <span class="title">{{ $t('app.settings.label') }}</span>
        </div>
      </template>
    </div>
    <div class="body">
      <div ref="main" class="main" :inert="route === 'settings'">
        <button ref="loading" class="loading" @click="onClickLoading">
          <HIcon class="icon" :name="loadingConfig.icon" />
          <span>{{ loadingConfig.text }}</span>
        </button>
        <div ref="scroll" class="scroll">
          <LiveListEnded ref="liveListEnded" @ended="onEndLiveList" />
          <LiveList type="current" />
          <LiveList type="scheduled" />
        </div>
        <VToast class="toast" />
        <VHint class="hint" />
      </div>
      <div v-if="route === 'settings'" class="settings">
        <div class="option">
          <label class="label">
            <span>{{ $t('app.settings.enableNtf.label') }}</span>
            <input type="checkbox" :checked="isNtfEnabled" @change="onChangeIsNtfEnabled">
          </label>
          <div class="description">{{ $t('app.settings.enableNtf.description') }}</div>
        </div>
        <div class="option">
          <label class="label">
            <span>{{ $t('app.settings.enable30Hours.label') }}</span>
            <input type="checkbox" :checked="is30HoursEnabled" @change="onChangeIs30HoursEnabled">
          </label>
          <div class="description">{{ $t('app.settings.enable30Hours.description') }}</div>
        </div>
        <div class="option">
          <label class="label">
            <span>{{ $t('app.settings.shouldSyncSettings.label') }}</span>
            <input type="checkbox"
                   :checked="shouldSyncSettings"
                   @change="onChangeShouldSyncSettings"
            >
          </label>
          <div class="description">{{ $t('app.settings.shouldSyncSettings.description') }}</div>
        </div>
        <div class="option">
          <label class="label">
            <span>{{ $t('app.settings.language.label') }}</span>
            <select :value="locale" @change="onChangeLocale">
              <option v-for="$locale in locales" :key="$locale" :value="$locale">
                {{ $t(`app.settings.language.locales.${$locale}`) }}
              </option>
            </select>
          </label>
          <div class="description">{{ $t('app.settings.language.description') }}</div>
        </div>
        <div class="option">
          <label class="label">
            <span>{{ $t('app.settings.appearance.label') }}</span>
            <select :value="appearance" @change="onChangeAppearance">
              <option v-for="$appearance in appearances" :key="$appearance" :value="$appearance">
                {{ $t(`app.settings.appearance.appearances.${$appearance}`) }}
              </option>
            </select>
          </label>
          <div class="description">{{ $t('app.settings.appearance.description') }}</div>
        </div>
        <button class="advanced" @click="onClickAdvanced">{{ $t('app.settings.advanced') }}</button>
        <hr>
        <div class="info">
          <div class="version">
            {{ $t('app.settings.version', { version }) }}
          </div>
          <div class="engine">
            <i18n-t keypath="app.settings.engine.label" scope="global">
              <template #link>
                <a :href="$t('app.settings.engine.href')" target="_blank">
                  {{ $t('app.settings.engine.value') }}
                </a>
              </template>
            </i18n-t>
          </div>
          <div class="contact">
            <i18n-t keypath="app.settings.contact.label" scope="global">
              <template #link>
                <a :href="$t('app.settings.contact.href')" target="_blank">
                  {{ $t('app.settings.contact.value') }}
                </a>
              </template>
            </i18n-t>
          </div>
        </div>
      </div>
    </div>
    <OpeningAnim />
  </div>
</template>

<script>
  import LiveList from 'components/live-list'
  import LiveListEnded from 'components/live-list-ended'
  import OpeningAnim from 'components/opening-anim'
  import VHint from 'components/v-hint'
  import VToast from 'components/v-toast'
  import { sortBy } from 'lodash'
  import browser from 'shared/browser'
  import HIcon from 'shared/components/h-icon'
  import {
    APPEARANCE,
    BG_INIT_ERROR,
    IS_30_HOURS_ENABLED,
    IS_NTF_ENABLED,
    LOCALE,
    SHOULD_SYNC_SETTINGS,
  } from 'shared/store/keys'
  import workflows from 'shared/workflows'
  import { sleep } from 'utils'
  import { mapState } from 'vuex'

  const {
    setIsNtfEnabled, setLocale, setShouldSyncSettings, setIs30HoursEnabled, setAppearance,
  } = workflows

  const ratioThreshold = { high: 0.99, low: 0.01 }

  export default {
    name: 'App',
    components: { OpeningAnim, HIcon, LiveListEnded, LiveList, VToast, VHint },
    data() {
      return {
        loadingStatus: 'idle',
        interval: null,
        route: 'main',
      }
    },
    computed: {
      version() {
        return VERSION
      },
      locales() {
        return sortBy(Object.keys(this.$root.$i18n.messages), locale => this.$t(`app.settings.language.locales.${locale}`))
      },
      appearances() {
        return ['device', 'light', 'dark']
      },
      popupLogo() {
        return browser.runtime.getURL('assets/popup_logo.svg')
      },
      LoadingStatuses() {
        return new Map([
          ['idle', { text: this.$t('app.pullToLoad.hint'), icon: 'pull' }],
          ['loading', { text: this.$t('app.pullToLoad.loading'), icon: 'loading' }],
          ['success', { text: this.$t('app.pullToLoad.success'), icon: 'success' }],
          ['ended', { text: this.$t('app.pullToLoad.finished'), icon: 'top' }],
        ])
      },
      loadingConfig() {
        return this.LoadingStatuses.get(this.loadingStatus)
      },
      ...mapState({
        isNtfEnabled: IS_NTF_ENABLED,
        locale: LOCALE,
        shouldSyncSettings: SHOULD_SYNC_SETTINGS,
        is30HoursEnabled: IS_30_HOURS_ENABLED,
        appearance: APPEARANCE,
        bgInitError: BG_INIT_ERROR,
      }),
    },
    watch: {
      bgInitError(msg) {
        this.$toasts.add({
          type: 'error',
          text: this.$t('app.bgInitError', { msg }),
        })
      },
    },
    mounted() {
      if (this.bgInitError) {
        this.$toasts.add({
          type: 'error',
          text: this.$t('app.bgInitError', { msg: this.bgInitError }),
        })
      }

      const intersectionObserver = new IntersectionObserver(
        this.onIntersectionChange, {
          root: this.$refs.main,
          threshold: Object.values(ratioThreshold),
        },
      )
      intersectionObserver.observe(this.$refs.loading)
    },
    methods: {
      async onIntersectionChange([{ intersectionRatio: ratio }]) {
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

        await this.$refs.liveListEnded.load()

        this.loadingStatus = this.loadingStatus === 'ended' ? 'ended' : 'success'
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
      onChangeIsNtfEnabled(event) {
        return setIsNtfEnabled(event.target.checked)
      },
      onChangeIs30HoursEnabled(event) {
        return setIs30HoursEnabled(event.target.checked)
      },
      onChangeShouldSyncSettings(event) {
        return setShouldSyncSettings(event.target.checked)
      },
      onChangeAppearance(event) {
        return setAppearance(event.target.value)
      },
      onChangeLocale(event) {
        return setLocale(event.target.value)
      },
      onClickAdvanced() {
        return browser.runtime.openOptionsPage()
      },
      onEndLiveList() {
        this.loadingStatus = 'ended'
      },
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
    opacity: var(--brightness);

    .main {
      display: grid;
      grid-auto-flow: column;
      align-items: center;
      justify-content: space-between;

      .logo {
        height: 32px;
      }

      .to-settings {
        &:hover, &:focus {
          filter: brightness(0.9);
        }

        .icon {
          font-size: 24px;
          cursor: pointer;
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
        display: inline-grid;
        grid-auto-flow: column;
        align-items: center;
        justify-content: start;
        width: max-content;
        padding-right: 8px;
        cursor: pointer;

        &:hover, &:focus {
          filter: brightness(0.9);
        }

        .icon {
          font-size: 24px;
        }

        .text {
          font-size: 14px;
          text-box-trim: trim-both;
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
      background-color: var(--color-bg-base);
      color: var(--color-text-light);
      font-size: 14px;
      cursor: pointer;

      &:hover, &:focus {
        background-color: var(--color-bg-light);
      }

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
      --background-opacity: 0.95;

      @supports (backdrop-filter: blur(10px)) {
        --background-opacity: 0.8;
        backdrop-filter: blur(10px);
      }

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
      background: hsla(var(--color-bg-base-expand), var(--background-opacity));
      overflow: auto;
      scrollbar-width: none;

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

      .advanced {
        display: inline-block;
        justify-self: end;
        width: auto;
        border-bottom: 1px dotted transparent;
        color: var(--color-theme);
        font-size: 14px;

        &:hover, &:focus {
          border-color: currentColor;
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

        .version, .engine, .contact {
          color: var(--color-text-normal);
          font-size: 12px;
          text-align: center;

          a {
            color: var(--color-theme);
          }
        }
      }
    }
  }
</style>
