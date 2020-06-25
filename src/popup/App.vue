<template>
  <div class="app">
    <div class="head">
      <img :src="popupLogo" alt="logo" />
    </div>
    <div class="body">
      <!-- TODO: Move to components -->
      <div class="anchor">Living ({{currentLives.length}})</div>
      <ul class="list">
        <li v-for="live in currentLives" :key="live['id']">
          <a class="item" :href="getRoomLink(live)">
            <div class="thumbnail">
              <!-- TODO: Default image -->
              <img :src="live['cover']" :alt="live['title']" />
            </div>
            <div class="header">
              <img :src="getMember(live)['avatar'] || defaultAvatar" alt=""
                   :style="{color: getMember(live)['color_main'] || defaultColor}" />
              <div class="member" :title="getMember(live)['name']">
                {{getMember(live)['name']}}
              </div>
              <div class="separator">
                |
              </div>
              <div class="platform">
                {{live['platform']}}
              </div>
            </div>
            <div class="content" :title="live['title']">{{live['title']}}</div>
            <div class="accessory">
              <div class="badge">LIVE NOW</div>
              <RelativeTime class="start-at" :time="live['start_at']" />
            </div>
          </a>
        </li>
      </ul>
      <div class="anchor">Scheduled Live ({{scheduledLives.length}})</div>
      <ul class="list">
        <li v-for="live in scheduledLives" :key="live['id']">
          <a class="item" :href="getRoomLink(live)">
            <div class="thumbnail">
              <!-- TODO: Default image -->
              <img :src="live['cover']" :alt="live['title']" />
            </div>
            <div class="header">
              <img :src="getMember(live)['avatar'] || defaultAvatar" alt=""
                   :style="{color: getMember(live)['color_main'] || defaultColor}" />
              <div class="member" :title="getMember(live)['name']">
                {{getMember(live)['name']}}
              </div>
              <div class="separator">
                |
              </div>
              <div class="platform">
                {{live['platform']}}
              </div>
            </div>
            <div class="content" :title="live['title']">{{live['title']}}</div>
            <div class="accessory">
              <div class="start-at">{{new Date(live['start_at']).toLocaleString()}}</div>
            </div>
          </a>
        </li>
      </ul>
      <VToast style="top: 64px;z-index: 1;" />
      <VHint style="z-index: 1" />
    </div>
  </div>
</template>

<script>
  import browser from 'webextension-polyfill'
  import RelativeTime from './components/relative-time'
  import VHint from './components/v-hint'
  import VToast from './components/v-toast'

  const {
    workflows: {
      syncCurrentLives,
      syncScheduledLives,
      getCachedCurrentLives,
      getCachedScheduledLives,
      getCachedChannels,
      getCachedMembers,
    },
  } = browser.extension.getBackgroundPage()

  export default {
    name: 'App',
    components: { VToast, VHint, RelativeTime },
    data() {
      return {
        currentLives: [],
        scheduledLives: [],
        channels: [],
        members: [],
      }
    },
    async created() {
      this.currentLives = getCachedCurrentLives() || []
      this.scheduledLives = getCachedScheduledLives() || []
      this.channels = getCachedChannels() || []
      this.members = getCachedMembers() || []

      await this.reloadCurrentLives()
      await this.reloadScheduledLives()

      this.intervalCurrent = setInterval(this.reloadCurrentLives, 10 * 1000)
      this.intervalScheduled = setInterval(this.reloadScheduledLives, 10 * 1000)
    },
    beforeDestroy() {
      clearInterval(this.intervalCurrent)
      clearInterval(this.intervalScheduled)
    },
    computed: {
      defaultAvatar() {
        return browser.runtime.getURL('assets/default_avatar.png')
      },
      defaultColor() {
        return '#4de4ff'
      },
      popupLogo() {
        return browser.runtime.getURL('assets/popup_logo.svg')
      },
    },
    methods: {
      // TODO: Share code with reloadScheduledLives
      async reloadCurrentLives() {
        let hintId
        try {
          hintId = this.$hints.add({ text: 'Loading current lives...' })
          this.currentLives = await syncCurrentLives()
        } catch (err) {
          this.$toasts.add({ type: 'error', text: err.message })
        } finally {
          this.$hints.remove(hintId)
        }
      },
      async reloadScheduledLives() {
        let hintId
        try {
          hintId = this.$hints.add({ text: 'Loading scheduled lives...' })
          this.scheduledLives = await syncScheduledLives()
        } catch (err) {
          this.$toasts.add({ type: 'error', text: err.message })
        } finally {
          this.$hints.remove(hintId)
        }
      },
      // TODO: Move to computed
      getMember(live) {
        const channel = this.channels.find(({ id }) => id === live['channel_id']) || {}
        return this.members.find(({ id }) => id === channel['member_id']) || {}
      },
      getRoomLink(live) {
        const { platform, room } = live
        if (platform === 'youtube') {
          return `https://www.youtube.com/watch?v=${room}`
        }
        if (platform === 'bilibili') {
          return `https://live.bilibili.com/${room}`
        }
        return '#'
      },
    },
  }
</script>

<style lang="less" scoped>
  .app {
    width: 375px;
    /* TODO: Use color variables */
    background-color: rgb(255, 255, 255);
    background-image: linear-gradient(rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.02));
  }

  .head {
    padding: 12px 16px;
    background: linear-gradient(45deg, #268C89, #65E5B4);

    img {
      height: 32px;
    }
  }

  .body {
    display: grid;
    grid-template-columns: auto;
    gap: 4px;
    overflow-y: auto;
    max-height: 540px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

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

    .item {
      display: grid;
      grid-template-rows: 24px minmax(0, 42px) 18px;
      grid-template-columns: 160px 1fr;
      gap: 4px 12px;
      padding: 4px 12px;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }

  .thumbnail {
    position: relative;
    grid-row-start: 1;
    grid-row-end: 4;
    align-self: start;
    overflow: hidden;
    height: 90px;

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }

    .badge {
      position: absolute;
      right: 4px;
      bottom: 4px;
      padding: 0 4px;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      font-size: 12px;
    }
  }

  .header {
    display: grid;
    grid-template-columns: 24px minmax(0, max-content) minmax(0, max-content) 1fr;
    gap: 8px;
    align-items: center;
    color: rgba(0, 0, 0, 0.6);
    font-size: 14px;

    img {
      object-fit: cover;
      width: 24px;
      height: 24px;
      border: 1px solid;
      border-radius: 50%;
    }

    .member {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .separator {
      color: rgba(0, 0, 0, 0.2);
    }

    .platform {
      text-transform: capitalize;
    }
  }

  .content {
    display: -webkit-box;
    align-self: start;
    overflow: hidden;
    font-size: 14px;
    text-overflow: ellipsis;
    word-break: break-all;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .accessory {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px;
    align-items: center;
    color: rgba(0, 0, 0, 0.4);
    font-size: 12px;

    .badge {
      padding: 0 4px;
      border: 1px solid;
      border-radius: 2px;
      color: #34c1bd;
    }

    .start-at {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>