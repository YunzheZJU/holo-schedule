import { differenceBy, find, uniqBy } from 'lodash'
import moment from 'moment'
import { createEnhancedArray } from 'shared/lib/enhancedArray'

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
  fire({ id, title }) {
    console.log(`An alarm has been fired: ${title}`)
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
