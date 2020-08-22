/* eslint no-param-reassign:
["error", { "props": true, "ignorePropertyModificationsFor": ["state"] }] */
import {
  CURRENT_LIVES,
  ENDED_LIVES,
  IS_POPUP_FIRST_RUN,
  IS_NTF_ENABLED,
  LOCALE,
  SCHEDULED_LIVES,
} from 'shared/store/keys'
import Vue from 'vue'
import Vuex from 'vuex'
import connect from './connect'

Vue.use(Vuex)

const store = {
  // Default state will be covered by values of the same key on connecting to background store
  state: {
    [ENDED_LIVES]: [],
    [CURRENT_LIVES]: [],
    [SCHEDULED_LIVES]: [],
    [IS_NTF_ENABLED]: false,
    [LOCALE]: 'en',
    [IS_POPUP_FIRST_RUN]: true,
  },
  mutations: {
    ...Object.fromEntries([
      ENDED_LIVES, CURRENT_LIVES, SCHEDULED_LIVES, IS_NTF_ENABLED, LOCALE, IS_POPUP_FIRST_RUN,
    ].map(
      key => [key, (state, value) => {
        state[key] = value
      }],
    )),
  },
  plugins: [connect],
}

export default new Vuex.Store(store)
