/* eslint no-param-reassign:
["error", { "props": true, "ignorePropertyModificationsFor": ["state"] }] */
import { isEmpty, isEqual } from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import connect from './connect'

Vue.use(Vuex)

// Default state will be covered by values of the same key on connecting to background store
export default defaultState => new Vuex.Store({
  state: defaultState,
  mutations: {
    ...Object.fromEntries(Object.keys(defaultState).map(
      key => [key, (state, value) => {
        if (!isEqual(state[key], value) || isEmpty(value)) {
          state[key] = value
        }
      }],
    )),
  },
  plugins: [connect],
})
