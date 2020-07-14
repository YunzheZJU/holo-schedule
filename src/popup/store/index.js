/* eslint no-param-reassign:
["error", { "props": true, "ignorePropertyModificationsFor": ["state"] }] */
import { CURRENT_LIVES, ENDED_LIVES, SCHEDULED_LIVES } from 'shared/store/keys'
import connect from './connect'

const store = {
  state: {
    [ENDED_LIVES]: [],
    [CURRENT_LIVES]: [],
    [SCHEDULED_LIVES]: [],
  },
  mutations: {
    ...Object.fromEntries([ENDED_LIVES, CURRENT_LIVES, SCHEDULED_LIVES].map(
      key => [key, (state, lives) => {
        state[key] = lives
      }],
    )),
  },
  plugins: [connect],
}

export default store
