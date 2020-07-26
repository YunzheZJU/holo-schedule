/* eslint no-param-reassign:
["error", { "props": true, "ignorePropertyModificationsFor": ["state"] }] */
import {
  CURRENT_LIVES,
  ENDED_LIVES,
  IS_NTF_ENABLED,
  SCHEDULED_LIVES,
} from 'shared/store/keys'
import connect from './connect'

const store = {
  state: {
    [ENDED_LIVES]: [],
    [CURRENT_LIVES]: [],
    [SCHEDULED_LIVES]: [],
    [IS_NTF_ENABLED]: false,
  },
  mutations: {
    ...Object.fromEntries([ENDED_LIVES, CURRENT_LIVES, SCHEDULED_LIVES, IS_NTF_ENABLED].map(
      key => [key, (state, value) => {
        state[key] = value
      }],
    )),
  },
  plugins: [connect],
}

export default store
