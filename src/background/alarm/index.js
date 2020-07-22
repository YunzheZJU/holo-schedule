import { differenceBy, find, uniqBy } from 'lodash'
import moment from 'moment'
import notification from 'notification'
import { createEnhancedArray } from 'shared/lib/enhancedArray'
import { constructRoomUrl } from 'shared/utils'
import browser from 'webextension-polyfill'
import workflows from 'workflows'

const alarm = {
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
  fire(live) {
    const { id, title } = live
    const member = workflows.getMember(live)

    notification.create(id.toString(), {
      title,
      message: `${member['name']} is waiting for you`,
      iconUrl: member['avatar'] ?? browser.runtime.getURL('assets/default_avatar.png'),
      onClick() {
        browser.tabs.create({ url: constructRoomUrl(live) }).then(
          () => console.log('Successfully created a tab'),
        )
      },
    })

    this.remove({ id })
  },
  init(store) {
    store.subscribe('currentLives', (lives, prevLives) => {
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
          this.fire(live)
        })
      }

      this.savedCurrentLives = uniqBy([...this.savedCurrentLives, ...lives], 'id')
    })

    store.subscribe('scheduledLives', (lives, prevLives) => {
      // Skip the first run
      if (prevLives !== undefined) {
        // Guerrilla lives
        differenceBy(lives, this.savedScheduledLives, 'id').forEach(live => {
          if (moment().add(10, 'minutes').isAfter(moment(live['start_at']))) {
            this.fire(live)
          }
        })
      }

      this.savedScheduledLives = uniqBy([...this.savedScheduledLives, ...lives], 'id')
    })
  },
}

export default alarm
