import createStore from 'shared/store/create'
import {
  APPEARANCE,
  CURRENT_LIVES,
  ENDED_LIVES,
  HOTNESSES,
  IS_30_HOURS_ENABLED,
  IS_NTF_ENABLED,
  IS_POPUP_FIRST_RUN,
  LOCALE,
  SCHEDULED_LIVES,
  SHOULD_SYNC_SETTINGS,
} from 'shared/store/keys'

const store = createStore({
  [ENDED_LIVES]: [],
  [CURRENT_LIVES]: [],
  [SCHEDULED_LIVES]: [],
  [HOTNESSES]: [],
  [IS_NTF_ENABLED]: false,
  [LOCALE]: 'en',
  [IS_POPUP_FIRST_RUN]: true,
  [SHOULD_SYNC_SETTINGS]: false,
  [IS_30_HOURS_ENABLED]: false,
  [APPEARANCE]: 'device',
})

export default store
