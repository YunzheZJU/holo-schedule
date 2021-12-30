import i18n from 'i18n'
import { differenceBy, find, uniqBy } from 'lodash'
import notification from 'notification'
import { createEnhancedArray } from 'shared/lib/enhancedArray'
import { CURRENT_LIVES, IS_NTF_ENABLED, SCHEDULED_LIVES } from 'shared/store/keys'
import { constructUrl } from 'shared/utils'
import { isGuerrillaLive } from 'utils'
import browser from 'webextension-polyfill'
import workflows from 'workflows/workflows'

const $defaultIsNtfEnabled = true

let $store

let savedCurrentLives = []
let savedScheduledLives = []

const livesToAlarm = createEnhancedArray()

const schedule = live => livesToAlarm.add(live)

const remove = live => {
  livesToAlarm.remove(find(livesToAlarm, { id: live['id'] }))
}

const isScheduled = live => find(livesToAlarm, { id: live['id'] })

const getIsNtfEnabled = () => $store.get(IS_NTF_ENABLED) ?? $defaultIsNtfEnabled

const fire = (live, isGuerrilla = false) => {
  const { id, title } = live

  remove({ id })

  if (!getIsNtfEnabled()) return

  const member = workflows.getMember(live)

  notification.create(id.toString(), {
    title,
    message: i18n.getMessage(
      `notification.${isGuerrilla ? 'guerrilla' : 'reminder'}`, { name: member['name'] },
    ),
    iconUrl: member['avatar'] ?? browser.runtime.getURL('assets/default_avatar.png'),
    onClick() {
      browser.tabs.create({ url: constructUrl(live) }).then(
        () => console.log('Successfully created a tab'),
      )
    },
  })
}

const init = async store => {
  $store = store

  await store.set({ [IS_NTF_ENABLED]: getIsNtfEnabled() }, { local: true })

  store.subscribe(CURRENT_LIVES, (lives, prevLives) => {
    // Skip the first run
    if (prevLives !== undefined) {
      // Scheduled alarms
      differenceBy(lives, savedCurrentLives, 'id').forEach(live => {
        if (isScheduled(live)) {
          fire(live)
        }
      })

      // Guerrilla lives
      differenceBy(lives, savedScheduledLives, savedCurrentLives, 'id').forEach(live => {
        if (isGuerrillaLive(live)) {
          fire(live, true)
        }
      })
    }

    savedCurrentLives = uniqBy([...savedCurrentLives, ...lives], 'id')
  })

  store.subscribe(SCHEDULED_LIVES, (lives, prevLives) => {
    // Skip the first run
    if (prevLives !== undefined) {
      // Guerrilla lives
      differenceBy(lives, savedScheduledLives, 'id').forEach(live => {
        if (isGuerrillaLive(live)) {
          fire(live, true)
        }
      })
    }

    savedScheduledLives = uniqBy([...savedScheduledLives, ...lives], 'id')
  })
}

const alarm = {
  $store,
  livesToAlarm,
  savedCurrentLives,
  savedScheduledLives,
  schedule,
  remove,
  isScheduled,
  getIsNtfEnabled,
  fire,
  init,
}

export default alarm
