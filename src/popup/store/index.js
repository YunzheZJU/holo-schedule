/* eslint no-param-reassign:
["error", { "props": true, "ignorePropertyModificationsFor": ["state"] }] */
import {
  CURRENT_LIVES,
  ENDED_LIVES,
  IS_NTF_ENABLED,
  LOCALE,
  SCHEDULED_LIVES,
} from 'shared/store/keys'
import Vue from 'vue'
import Vuex from 'vuex'
import connect from './connect'

Vue.use(Vuex)

const store = {
  state: {
    [ENDED_LIVES]: [],
    [CURRENT_LIVES]: [],
    [SCHEDULED_LIVES]: [],
    [IS_NTF_ENABLED]: false,
    [LOCALE]: 'en',
  },
  mutations: {
    ...Object.fromEntries([ENDED_LIVES, CURRENT_LIVES, SCHEDULED_LIVES, IS_NTF_ENABLED, LOCALE].map(
      key => [key, (state, value) => {
        state[key] = value
      }],
    )),
  },
  plugins: [connect],
}

export default new Vuex.Store(store)
