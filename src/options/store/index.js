import createStore from 'shared/store/create'
import { MEMBERS, SUBSCRIPTION_BY_MEMBER } from 'shared/store/keys'

const store = createStore({
  [MEMBERS]: [],
  [SUBSCRIPTION_BY_MEMBER]: {},
})

export default store
