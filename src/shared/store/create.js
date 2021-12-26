/* eslint no-param-reassign:
["error", { "props": true, "ignorePropertyModificationsFor": ["state"] }] */
import { isEmpty, isEqual } from 'lodash'
import { createStore } from 'vuex'
import connect from './connect'

// Default state will be covered by values of the same key on connecting to background store
export default defaultState => createStore({
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
