<template>
  <div class="app">
    <div class="head">
      <img :src="popupLogo" alt="logo" />
    </div>
    <div class="error" v-if="error">{{ error }}</div>
    <ul>
      <li v-for="live in lives" :key="live['id']">
        <div class="thumbnail">
          <!-- TODO: Default image -->
          <img :src="live['cover']" :alt="live['title']" />
          <div class="badge">Live</div>
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
      </li>
    </ul>
    <div class="hint" v-if="loading">Loading</div>
  </div>
</template>

<script>
  import browser from 'webextension-polyfill'
  import RelativeTime from './components/relative-time'

  const {
    workflows: {
      syncLives, getCachedLives, getCachedChannels, getCachedMembers,
    },
  } = browser.extension.getBackgroundPage()

  export default {
    name: 'App',
    components: { RelativeTime },
    data() {
      return {
        loading: true,
        error: null,
        lives: [],
        channels: [],
        members: [],
      }
    },
    async created() {
      this.lives = getCachedLives() || []
      this.channels = getCachedChannels() || []
      this.members = getCachedMembers() || []

      await this.reloadLives()

      this.interval = setInterval(this.reloadLives, 10 * 1000)
    },
    beforeDestroy() {
      clearInterval(this.interval)
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
      async reloadLives() {
        try {
          this.loading = true
          this.lives = await syncLives()
          this.error = null
        } catch (err) {
          this.error = err
        } finally {
          this.loading = false
        }
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
    width: 375px;
    background: rgba(0, 0, 0, 0.02);
  }

  .head {
    padding: 12px 16px;
    background: linear-gradient(45deg, #268C89, #65E5B4);

    img {
      height: 32px;
    }
  }

  ul {
    display: grid;
    grid-template-columns: auto;
    gap: 4px;
    overflow-y: auto;
    max-height: 560px;
    margin: 0;
    padding: 8px 0;
    list-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  li {
    display: grid;
    grid-template-rows: 24px minmax(0, 42px) 18px;
    grid-template-columns: 160px 1fr;
    gap: 4px 12px;
    padding: 4px 12px;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
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
    }

    .start-at {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>