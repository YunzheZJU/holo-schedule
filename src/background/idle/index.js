import { onSuccessRequest } from '../requests'
import { getUnix } from '../utils'

let lastSuccessRequestTime = 0
const callbacks = []
const idle = {
  async init() {
    onSuccessRequest.addEventListener(() => {
      const timestamp = getUnix()
      console.log(timestamp)
      if (timestamp - lastSuccessRequestTime > 90) {
        callbacks.forEach(callback => callback())
      }
      lastSuccessRequestTime = timestamp
    })
  },
  async subscribe(callback = () => null) {
    callbacks.push(callback)
  },
}

export default idle
