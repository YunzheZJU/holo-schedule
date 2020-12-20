<template>
  <ul v-if="lives.length" ref="root" class="list">
    <template v-for="(live, index) in lives">
      <div v-if="getDateOfLive(index) !== getDateOfLive(index - 1)"
           :key="`anchor-${live['id']}`"
           class="anchor"
      >
        <span class="date">{{ formatCalendar(lives[index]) }}</span>
      </div>
      <LiveItem ref="items"
                :key="`item-${live['id']}`"
                type="ended"
                :live="live"
      />
    </template>
  </ul>
</template>

<script>
  // TODO: Merge into live-list
  import LiveItem from 'components/live-item'
  import dayjs from 'dayjs'
  import advancedFormat from 'dayjs/plugin/advancedFormat'
  import calendar from 'dayjs/plugin/calendar'
  import { ENDED_LIVES, IS_30_HOURS_ENABLED } from 'shared/store/keys'
  import { mapState } from 'vuex'
  import browser from 'webextension-polyfill'

  dayjs.extend(calendar)
  dayjs.extend(advancedFormat)

  const { workflows: { syncLives } } = browser.extension.getBackgroundPage()

  export default {
    name: 'LiveListEnded',
    components: { LiveItem },
    data() {
      return {
        parentElement: null,
      }
    },
    computed: {
      startHour() {
        return this.is30HoursEnabled ? 6 : 0
      },
      ...mapState({
        lives: ENDED_LIVES,
        is30HoursEnabled: IS_30_HOURS_ENABLED,
      }),
    },
    mounted() {
      this.parentElement = this.$parent.$refs.scroll
    },
    beforeUpdate() {
      this.savedScrollHeight = this.parentElement.scrollHeight
      this.savedScrollTop = this.parentElement.scrollTop
    },
    updated() {
      const scrollHeightDiff = this.parentElement.scrollHeight - this.savedScrollHeight

      if (scrollHeightDiff === 0) {
        return
      }

      const newScrollTop = this.savedScrollTop + scrollHeightDiff
      this.parentElement.scrollTop = newScrollTop
      setTimeout(() => {
        this.parentElement.scrollTo({ top: newScrollTop - 50, behavior: 'smooth' })
      }, 0)
    },
    methods: {
      async load() {
        let hintId
        try {
          hintId = this.$hints.add({ text: `${this.$t('liveList.lives.ended.loading')}...` })
          const updatedLives = await syncLives('ended')
          if (updatedLives?.[0]?.['id'] === this.lives?.[0]?.['id']) {
            return true
          }
        } catch (err) {
          console.error(err)
          this.$toasts.add({ type: 'error', text: err.message })
        } finally {
          this.$hints.remove(hintId)
        }
        return false
      },
      getDateOfLive(index) {
        if (index < 0) {
          return undefined
        }
        return dayjs(this.lives[index]['start_at']).startHour(this.startHour).date()
      },
      formatCalendar(live) {
        return dayjs(live['start_at']).startHour(this.startHour).calendar(null, {
          sameDay: this.$t('liveListEnded.calendar.sameDay'),
          lastDay: this.$t('liveListEnded.calendar.lastDay'),
          lastWeek: this.$t('liveListEnded.calendar.lastWeek'),
          sameElse: this.$t('liveListEnded.calendar.sameElse'),
        })
      },
    },
  }
</script>

<style lang="less" scoped>
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

  .anchor {
    --bg-color: var(--color-bg-base);
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 4px 0;
    background-color: var(--bg-color);
    text-align: center;

    &:before {
      content: '';
      position: absolute;
      top: 50%;
      right: 12px;
      left: 12px;
      border-top: 1px solid var(--color-bd);
    }

    .date {
      position: relative;
      padding: 0 8px;
      background-color: var(--bg-color);
      color: var(--color-text-light);
      font-weight: 700;
      font-size: 12px;
    }
  }
</style>
