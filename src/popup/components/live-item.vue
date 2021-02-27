<template>
  <li ref="item">
    <a class="item" :href="roomURL" target="_blank">
      <div class="thumbnail">
        <!-- TODO: Default image -->
        <img class="cover" loading="lazy" :src="live['cover']" :alt="live['title']">
        <div v-if="type === 'ended'" class="badge">{{ duration }}</div>
        <button v-if="type === 'scheduled' && isNtfEnabled"
                type="button"
                :class="['remind', {active: isScheduled}]"
                @click.stop.prevent="handleRemind"
        >
          <span class="text">
            <template v-if="isScheduled">{{ $t('liveItem.reminder.cancel') }}</template>
            <template v-else>{{ $t('liveItem.reminder.set') }}</template>
          </span>
          <h-icon :name="isScheduled ? 'alarm-ok' : 'alarm'" class="icon" />
        </button>
      </div>
      <div class="header">
        <img class="avatar"
             alt=""
             loading="lazy"
             :src="member['avatar'] || defaultAvatar"
             :style="{color: member['color_main']}"
        >
        <div class="member" :title="member['name']">{{ member['name'] }}</div>
        <div class="separator" />
        <div class="platform">{{ live['platform'] }}</div>
      </div>
      <div class="content" :title="live['title']">{{ live['title'] }}</div>
      <div class="accessory">
        <div v-if="type === 'current'" class="badge">{{ $t('liveItem.liveNow') }}</div>
        <div class="start-at" :title="startAtFull">
          <template v-if="type === 'ended'">
            {{ startAtSimple }}
            <span class="separator" />
          </template>
          <template v-if="type === 'scheduled'">
            {{ startAtCalendar }}
            <span class="separator" />
          </template>
          <template>{{ startAtFromNow }}</template>
        </div>
      </div>
    </a>
  </li>
</template>

<script>
  import HIcon from 'components/h-icon'
  import dayjs from 'dayjs'
  import advancedFormat from 'dayjs/plugin/advancedFormat'
  import calendar from 'dayjs/plugin/calendar'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import { IS_30_HOURS_ENABLED, IS_NTF_ENABLED } from 'shared/store/keys'
  import { constructRoomUrl } from 'shared/utils'
  import { formatDurationFromSeconds } from 'utils'
  import { liveTypeValidator } from 'validators'
  import { mapState } from 'vuex'
  import browser from 'webextension-polyfill'

  dayjs.extend(relativeTime)
  dayjs.extend(calendar)
  dayjs.extend(advancedFormat)

  const { alarm, workflows: { getMember } } = browser.extension.getBackgroundPage()

  export default {
    name: 'LiveItem',
    components: { HIcon },
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
    data() {
      return {
        alarmCacheFlag: Date.now(),
      }
    },
    computed: {
      defaultAvatar() {
        return browser.runtime.getURL('assets/default_avatar.png')
      },
      member() {
        return getMember(this.live)
      },
      roomURL() {
        return constructRoomUrl(this.live) ?? '#'
      },
      duration() {
        return formatDurationFromSeconds(this.live['duration'])
      },
      startAt() {
        return dayjs(this.live['start_at']).startHour(this.is30HoursEnabled ? 6 : 0)
      },
      startAtFromNow() {
        return this.startAt.fromNow()
      },
      startAtCalendar() {
        return this.startAt.calendar(null, {
          sameDay: this.$t('liveItem.calendar.sameDay'),
          nextDay: this.$t('liveItem.calendar.nextDay'),
          nextWeek: this.$t('liveItem.calendar.nextWeek'),
          lastDay: this.$t('liveItem.calendar.lastDay'),
          lastWeek: this.$t('liveItem.calendar.lastWeek'),
          sameElse: this.$t('liveItem.calendar.sameElse'),
        })
      },
      startAtSimple() {
        return this.startAt.format(this.$t('liveItem.startAt.simple'))
      },
      startAtFull() {
        return this.startAt.format(this.$t('liveItem.startAt.full'))
      },
      isScheduled() {
        return this.alarmCacheFlag && alarm.isScheduled(this.live)
      },
      ...mapState({
        isNtfEnabled: IS_NTF_ENABLED,
        is30HoursEnabled: IS_30_HOURS_ENABLED,
      }),
    },
    methods: {
      scrollIntoView(...args) {
        this.$refs.item.scrollIntoView(...args)
      },
      handleRemind() {
        if (this.isScheduled) {
          alarm.remove(this.live)
        } else {
          alarm.schedule(this.live)
        }
        this.alarmCacheFlag = Date.now()
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
      background: var(--color-bg-light);
    }

    &:not(:hover) {
      .thumbnail, .header .avatar {
        opacity: var(--brightness);
      }

      .remind:not(.active) {
        display: none;
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
    transition: opacity .2s ease-in-out;

    .cover {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }

    .badge, .remind {
      position: absolute;
      right: 4px;
      bottom: 4px;
      padding: 0 4px;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.8);
      color: var(--color-text-white);
      font-size: 12px;
    }

    .remind {
      display: grid;
      grid-template-columns: auto;
      grid-auto-columns: auto;
      grid-auto-flow: column;
      gap: 4px;
      align-items: center;
      width: unset;
      padding: 4px;

      &:hover {
        background: rgba(0, 0, 0, 1);
      }

      &:not(:hover) .text {
        display: none;
      }

      .text {
        text-transform: uppercase;
      }

      .icon {
        font-size: 16px;
      }

      &.active .icon {
        color: var(--color-theme);
      }
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

      &:before {
        content: '|';
      }
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
      text-transform: uppercase;
    }

    .start-at {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      .separator:before {
        content: ',';
      }
    }
  }
</style>
