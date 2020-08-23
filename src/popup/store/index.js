/* eslint no-param-reassign:
["error", { "props": true, "ignorePropertyModificationsFor": ["state"] }] */
import {
  CURRENT_LIVES,
  ENDED_LIVES,
  IS_NTF_ENABLED,
  IS_POPUP_FIRST_RUN,
  LOCALE,
  SCHEDULED_LIVES,
  SHOULD_SYNC_SETTINGS,
} from 'shared/store/keys'
import Vue from 'vue'
import Vuex from 'vuex'
import connect from './connect'

Vue.use(Vuex)

// Default state will be covered by values of the same key on connecting to background store
const defaultState = {
  [ENDED_LIVES]: [],
  [CURRENT_LIVES]: [],
  [SCHEDULED_LIVES]: [],
  [IS_NTF_ENABLED]: false,
  [LOCALE]: 'en',
  [IS_POPUP_FIRST_RUN]: true,
  [SHOULD_SYNC_SETTINGS]: false,
}

const store = {
  state: defaultState,
  mutations: {
    ...Object.fromEntries(Object.keys(defaultState).map(
      key => [key, (state, value) => {
        state[key] = value
      }],
    )),
  },
  plugins: [connect],
}

export default new Vuex.Store(store)
