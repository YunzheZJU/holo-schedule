import {
  CURRENT_LIVES,
  ENDED_LIVES,
  IS_NTF_ENABLED,
  IS_POPUP_FIRST_RUN,
  LOCALE,
  SCHEDULED_LIVES,
  SHOULD_SYNC_SETTINGS,
} from 'shared/store/keys'
import createStore from 'shared/store/create'

const store = createStore({
  [ENDED_LIVES]: [],
  [CURRENT_LIVES]: [],
  [SCHEDULED_LIVES]: [],
  [IS_NTF_ENABLED]: false,
  [LOCALE]: 'en',
  [IS_POPUP_FIRST_RUN]: true,
  [SHOULD_SYNC_SETTINGS]: false,
})

export default store
