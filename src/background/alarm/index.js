import i18n from 'i18n'
import { differenceBy, find } from 'lodash'
import notification from 'notification'
import browser from 'shared/browser'
import { createEnhancedArray } from 'shared/lib/enhancedArray'
import { CURRENT_LIVES, FIRED_ALARMS, IS_NTF_ENABLED, LIVES_TO_ALARM, SCHEDULED_LIVES } from 'shared/store/keys'
import { constructUrl } from 'shared/utils'
import { isGuerrillaLive } from 'utils'
import workflows from 'workflows/workflows'

const alarm = {
  $defaultIsNtfEnabled: true,
  $store: undefined,
  livesToAlarm: undefined,
  firedAlarms: undefined,
  savedCurrentLives: [],
  savedScheduledLives: [],
  schedule(live) {
    this.livesToAlarm.add(live)
    return this.$store.set({ [LIVES_TO_ALARM]: JSON.parse(JSON.stringify(this.livesToAlarm)) })
  },
  remove(live) {
    this.livesToAlarm.remove(find(this.livesToAlarm, { id: live['id'] }))
    return this.$store.set({ [LIVES_TO_ALARM]: JSON.parse(JSON.stringify(this.livesToAlarm)) })
  },
  isScheduled(live) {
    return find(this.livesToAlarm, { id: live['id'] })
  },
  getIsNtfEnabled() {
    return this.$store.get(IS_NTF_ENABLED) ?? this.$defaultIsNtfEnabled
  },
  fire(live, isGuerrilla = false) {
    const { id, title } = live

    this.remove({ id })

    if (find(this.firedAlarms, { id }) || !this.getIsNtfEnabled()) return

    const member = workflows.getMember(live)

    this.firedAlarms.add({ id })

    notification.create(id.toString(), {
      title,
      message: i18n.getMessage(
        `notification.${isGuerrilla ? 'guerrilla' : 'reminder'}`, { name: member['name'] },
      ),
      iconUrl: member['avatar'] ?? browser.runtime.getURL('assets/default_avatar.png'),
      onClick() {
        browser.tabs.create({ url: constructUrl(live) }).then(
          () => console.log('[background/alarm]Successfully created a tab'),
        )
      },
    })
  },
  async init(store) {
    this.$store = store
    this.livesToAlarm = createEnhancedArray(this.$store.get(LIVES_TO_ALARM), 50)
    this.firedAlarms = createEnhancedArray(this.$store.get(FIRED_ALARMS), 30)

    await store.set({ [IS_NTF_ENABLED]: this.getIsNtfEnabled() })

    store.subscribe(CURRENT_LIVES, (lives, prevLives) => {
      // Skip the first run
      if (prevLives === undefined) {
        return
      }

      differenceBy(lives, prevLives, 'id').forEach(live => {
        // Scheduled alarms
        if (this.isScheduled(live)) {
          this.fire(live)
        }
        // Guerrilla lives
        if (isGuerrillaLive(live)) {
          this.fire(live, true)
        }
      })
    })

    store.subscribe(SCHEDULED_LIVES, (lives, prevLives) => {
      // Skip the first run
      if (prevLives === undefined) {
        return
      }

      // Guerrilla lives
      differenceBy(lives, prevLives, 'id').forEach(live => {
        if (isGuerrillaLive(live)) {
          this.fire(live, true)
        }
      })
    })
  },
}

export default alarm
