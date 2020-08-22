import i18n from 'i18n'
import { differenceBy, find, uniqBy } from 'lodash'
import notification from 'notification'
import { createEnhancedArray } from 'shared/lib/enhancedArray'
import {
  CURRENT_LIVES,
  IS_NTF_ENABLED,
  SCHEDULED_LIVES,
} from 'shared/store/keys'
import { constructRoomUrl } from 'shared/utils'
import { isGuerrillaLive } from 'utils'
import browser from 'webextension-polyfill'
import workflows from 'workflows'

const alarm = {
  $defaultIsNtfEnabled: true,
  $store: undefined,
  livesToAlarm: createEnhancedArray(),
  savedCurrentLives: [],
  savedScheduledLives: [],
  schedule(live) {
    return this.livesToAlarm.add(live)
  },
  remove(live) {
    this.livesToAlarm.remove(find(this.livesToAlarm, { id: live['id'] }))
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

    if (!this.getIsNtfEnabled()) return

    const member = workflows.getMember(live)

    notification.create(id.toString(), {
      title,
      message: i18n.getMessage(
        `notification.${isGuerrilla ? 'guerrilla' : 'reminder'}`, { name: member['name'] },
      ),
      iconUrl: member['avatar'] ?? browser.runtime.getURL('assets/default_avatar.png'),
      onClick() {
        browser.tabs.create({ url: constructRoomUrl(live) }).then(
          () => console.log('Successfully created a tab'),
        )
      },
    })
  },
  async init(store) {
    this.$store = store

    await store.set(
      { [IS_NTF_ENABLED]: this.getIsNtfEnabled() },
      { local: true, sync: true },
    )

    store.subscribe(CURRENT_LIVES, (lives, prevLives) => {
      // Skip the first run
      if (prevLives !== undefined) {
        // Scheduled alarms
        differenceBy(lives, this.savedCurrentLives, 'id').forEach(live => {
          if (this.isScheduled(live)) {
            this.fire(live)
          }
        })

        // Guerrilla lives
        differenceBy(lives, this.savedScheduledLives, this.savedCurrentLives, 'id').forEach(live => {
          if (isGuerrillaLive(live)) {
            this.fire(live, true)
          }
        })
      }

      this.savedCurrentLives = uniqBy([...this.savedCurrentLives, ...lives], 'id')
    })

    store.subscribe(SCHEDULED_LIVES, (lives, prevLives) => {
      // Skip the first run
      if (prevLives !== undefined) {
        // Guerrilla lives
        differenceBy(lives, this.savedScheduledLives, 'id').forEach(live => {
          if (isGuerrillaLive(live)) {
            this.fire(live, true)
          }
        })
      }

      this.savedScheduledLives = uniqBy([...this.savedScheduledLives, ...lives], 'id')
    })
  },
}

export default alarm
