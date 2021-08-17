<template>
  <li ref="item">
    <a class="item" :href="roomURL" target="_blank">
      <div class="thumbnail" :data-hotnesses-size="hotnessSamples.length">
        <LazyImage class="cover"
                   :src="live['cover']"
                   :alt="live['title']"
                   :fallback-src="defaultThumbnail"
        />
        <div v-if="type === 'ended'" class="badge">{{ duration }}</div>
        <div v-if="type === 'ended'" class="hotness">
          <svg :id="`svg_${live['id']}`" viewBox="0 0 1 0.16" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="50%" style="stop-color:hsl(157, 72%, 65%)" />
                <stop offset="100%" style="stop-color:hsl(178, 63%, 55%)" />
              </linearGradient>
              <clipPath :id="`clip_outer_${live['id']}`" clipPathUnits="objectBoundingBox">
                <path d="M0 0 0 0 0 1 0 1">
                  <animate attributeName="d"
                           to="M0 0 1 0 1 1 0 1"
                           :begin="`svg_${live['id']}.mouseenter + 0.4s`"
                           dur="0.2s"
                           fill="freeze"
                  />
                  <animate attributeName="d"
                           to="M0 0 0 0 0 1 0 1"
                           :begin="`svg_${live['id']}.mouseleave + 0.1s`"
                           dur="0.2s"
                           fill="freeze"
                  />
                </path>
              </clipPath>
              <clipPath :id="`clip_inner_${live['id']}`" clipPathUnits="objectBoundingBox">
                <polygon :points="points" />
              </clipPath>
            </defs>
            <g transform="scale(1, 1)" style="transform-origin: bottom">
              <animateTransform attributeName="transform"
                                type="scale"
                                to="1, 2"
                                :begin="`rect_${live['id']}.mouseenter`"
                                dur="0.2s"
                                fill="freeze"
              />
              <animateTransform attributeName="transform"
                                type="scale"
                                to="1, 1"
                                :begin="`rect_${live['id']}.mouseleave`"
                                dur="0.2s"
                                fill="freeze"
              />
              <g :clip-path="`url(#clip_outer_${live['id']})`">
                <g :clip-path="`url(#clip_inner_${live['id']})`">
                  <rect x="0" y="0.08" width="1" height="0.083" fill="url(#gradient)" />
                  <rect :x="highlight"
                        y="0.08"
                        width="0.00625"
                        height="0.08"
                        fill="white"
                        opacity="0"
                        style="mix-blend-mode: overlay"
                  >
                    <animate attributeName="opacity"
                             to="1"
                             :begin="`rect_${live['id']}.mouseenter`"
                             dur="0.1s"
                             fill="freeze"
                    />
                    <animate attributeName="opacity"
                             to="0"
                             :begin="`rect_${live['id']}.mouseleave`"
                             dur="0.1s"
                             fill="freeze"
                    />
                  </rect>
                </g>
              </g>
              <rect :id="`rect_${live['id']}`"
                    x="0"
                    y="0.08"
                    width="1"
                    height="0.83"
                    fill="transparent"
                    @mousemove="handleMousemove"
                    @mouseout="handleMouseout"
              />
            </g>
          </svg>
        </div>
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
        <LazyImage class="avatar"
                   :src="member['avatar']"
                   :fallback-src="defaultAvatar"
                   :style="{color: member['color_main']}"
        />
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
  import LazyImage from 'components/lazy-image'
  import dayjs from 'dayjs'
  import advancedFormat from 'dayjs/plugin/advancedFormat'
  import calendar from 'dayjs/plugin/calendar'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import { floor, isNull, max, min } from 'lodash'
  import HIcon from 'shared/components/h-icon'
  import { IS_30_HOURS_ENABLED, IS_NTF_ENABLED } from 'shared/store/keys'
  import { constructUrl } from 'shared/utils'
  import { formatDurationFromSeconds, sampleHotnesses } from 'utils'
  import { liveTypeValidator } from 'validators'
  import { mapState } from 'vuex'
  import browser from 'webextension-polyfill'

  dayjs.extend(relativeTime)
  dayjs.extend(calendar)
  dayjs.extend(advancedFormat)

  const { alarm, workflows: { getMember } } = browser.extension.getBackgroundPage()

  export default {
    name: 'LiveItem',
    components: { LazyImage, HIcon },
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
        highlight: null,
      }
    },
    computed: {
      defaultThumbnail() {
        return browser.runtime.getURL('assets/default_thumbnail.png')
      },
      defaultAvatar() {
        return browser.runtime.getURL('assets/default_avatar.png')
      },
      member() {
        return getMember(this.live)
      },
      roomURL() {
        return constructUrl({ ...this.live, time: this.hotnessDuration }) ?? '#'
      },
      hotnessSamples() {
        if (String(this.live.id) === '24909') {
          console.log(sampleHotnesses(this.live, 61))
        }
        return sampleHotnesses(this.live, 61)
      },
      points() {
        // Add a slight overflow around 4% to tune the rendering to best on FireFox
        return this.hotnessSamples.map(
          ([, [timeRatio, hotness]]) => [timeRatio, (1 - hotness ** 0.33) * 0.84],
        ).concat(1, 1.04, 0, 1.04).flat().join(' ')
      },
      hotnessDuration() {
        if (isNull(this.highlight)) {
          return null
        }

        const createdAts = this.hotnessSamples.map(([createdAt]) => createdAt)
        return floor(this.highlight * dayjs(max(createdAts)).diff(min(createdAts), 'second'))
          + dayjs(min(createdAts)).diff(this.live['start_at'], 'second')
      },
      duration() {
        const lDur = formatDurationFromSeconds(this.live['duration'])
        const hDur = formatDurationFromSeconds(this.hotnessDuration)

        return this.hotnessDuration ? (lDur.slice(0, lDur.length - hDur.length).replace(/\d/g, '0') + hDur) : lDur
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
      handleMousemove({ offsetX }) {
        this.highlight = offsetX / 160
      },
      handleMouseout() {
        this.highlight = null
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
    transition: opacity 0.2s ease-in-out;

    .cover {
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease-out, box-shadow 0.2s ease-in;
    }

    .hotness {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      outline: 0 solid hsl(157, 72%, 65%);
      outline-offset: 0;
      transition: all 0.1s ease-in;

      svg {
        --height: 50px;
        position: relative;
        box-sizing: content-box;
        width: 100%;
        height: var(--height);
        border-top: 90px solid transparent;
        transition: border-top-width 0.3s;
      }
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

    &:hover .cover {
      transform: scale(1.05);
    }

    &:not([data-hotnesses-size="0"]):hover {
      .cover {
        box-shadow: inset 0 0 15px 7px #0006;
        transition: transform 0.3s ease-out, box-shadow 0.4s ease-in;
      }

      .hotness {
        outline-width: 4px;
        outline-offset: -4px;
        filter: drop-shadow(0px 0px 5px black);
        transition: all 0.1s 0.4s ease-in;

        svg {
          border-top-width: calc(90px - var(--height));
          transition: border-top-width 0s 0.4s;
        }
      }

      .badge {
        animation: badge-out 0.3s 0.1s ease-out, badge-in 0.2s 0.4s ease-in forwards;

        @keyframes badge-out {
          to {
            bottom: 4px;
            opacity: 0;
            transform: translate(15%, 25%);
          }
        }
        @keyframes badge-in {
          from {
            top: 4px;
            bottom: unset;
            opacity: 0;
            transform: translate(15%, -25%);
          }
          to {
            top: 4px;
            bottom: unset;
            opacity: 1;
            transform: translate(0, 0);
          }
        }
      }
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
        // Set line-height of text to the height of the icon to avoid a layout jitter on hover
        line-height: 16px;
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
    line-break: anywhere;
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
