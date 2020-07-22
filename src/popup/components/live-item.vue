<template>
  <li ref="item">
    <a class="item" :href="roomURL" target="_blank">
      <div class="thumbnail">
        <!-- TODO: Default image -->
        <img class="cover" :src="live['cover']" :alt="live['title']">
        <div v-if="type === 'ended'" class="badge">{{ duration }}</div>
      </div>
      <div class="header">
        <img class="avatar"
             alt=""
             :src="member['avatar'] || defaultAvatar"
             :style="{color: member['color_main']}"
        >
        <div class="member" :title="member['name']">
          {{ member['name'] }}
        </div>
        <div class="separator">
          |
        </div>
        <div class="platform">
          {{ live['platform'] }}
        </div>
      </div>
      <div class="content" :title="live['title']">{{ live['title'] }}</div>
      <div class="accessory">
        <div v-if="type === 'current'" class="badge">LIVE NOW</div>
        <div class="start-at" :title="startAtFull">
          <template v-if="type === 'ended'">{{ startAtSimple }},</template>
          <template v-if="type === 'scheduled'">{{ startAtCalendar }},</template>
          <template>{{ startAtFromNow }}</template>
        </div>
      </div>
    </a>
  </li>
</template>

<script>
  import moment from 'moment'
  import { constructRoomUrl } from 'shared/utils'
  import { liveTypeValidator } from 'validators'
  import browser from 'webextension-polyfill'

  const {
    workflows: { getCachedChannels, getCachedMembers },
  } = browser.extension.getBackgroundPage()

  export default {
    name: 'LiveItem',
    props: {
      type: {
        type: String,
        validator: liveTypeValidator,
        default: 'current',
      },
      live: {
        type: Object,
        default() {
          return {}
        },
      },
    },
    computed: {
      defaultAvatar() {
        return browser.runtime.getURL('assets/default_avatar.png')
      },
      member() {
        const channels = getCachedChannels() || []
        const members = getCachedMembers() || []
        const channel = channels.find(({ id }) => id === this.live['channel_id']) ?? {}
        return members.find(({ id }) => id === channel['member_id']) ?? {}
      },
      roomURL() {
        return constructRoomUrl(this.live) ?? '#'
      },
      duration() {
        return moment.duration(this.live['duration'], 'seconds').format('h:mm:ss')
      },
      startAt() {
        return moment(this.live['start_at'])
      },
      startAtFromNow() {
        return this.startAt.fromNow()
      },
      startAtCalendar() {
        return this.startAt.calendar({
          sameDay: '[Today at ]H:mm A',
          nextDay: '[Tomorrow ]H:mm A',
          nextWeek: 'dddd[ at ]H:mm A',
          lastDay: '[Yesterday ]H:mm A',
          lastWeek: '[Last] dddd H:mm A',
          sameElse: 'DD/MM/YYYY H:mm A',
        })
      },
      startAtSimple() {
        return this.startAt.format('H:mm A')
      },
      startAtFull() {
        return this.startAt.format('MMMM D, YYYY H:mm A')
      },
    },
    methods: {
      scrollIntoView(...args) {
        this.$refs.item.scrollIntoView(...args)
      },
    },
  }
</script>

<style lang="less" scoped>
  .item {
    display: grid;
    grid-template-rows: 24px minmax(0, 42px) 18px;
    grid-template-columns: 160px 1fr;
    gap: 4px 12px;
    padding: 4px 12px;

    &:hover {
      background: var(--color-bg-normal);
    }
  }

  .thumbnail {
    position: relative;
    grid-row-start: 1;
    grid-row-end: 4;
    align-self: start;
    overflow: hidden;
    height: 90px;

    .cover {
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
      color: var(--color-text-white);
      font-size: 12px;
    }
  }

  .header {
    display: grid;
    grid-template-columns: 24px minmax(0, max-content) minmax(0, max-content) 1fr;
    gap: 8px;
    align-items: center;
    color: var(--color-text-normal);
    font-size: 14px;

    .avatar {
      object-fit: cover;
      width: 24px;
      height: 24px;
      border: 1px solid;
      border-radius: 50%;
      color: #4de4ff;
    }

    .member {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .separator {
      color: var(--color-bd);
    }

    .platform {
      text-transform: capitalize;
    }
  }

  .content {
    display: -webkit-box;
    align-self: start;
    overflow: hidden;
    color: var(--color-text-dark);
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
    color: var(--color-text-light);
    font-size: 12px;

    .badge {
      padding: 0 4px;
      border: 1px solid;
      border-radius: 2px;
      color: var(--color-theme);
    }

    .start-at {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
