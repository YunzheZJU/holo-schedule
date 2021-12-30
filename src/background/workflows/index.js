import alarm from 'alarm'
import listen from 'ports/listen'
import workflows from './workflows'

const allWorkflows = {
  ...workflows,
  isAlarmScheduled: alarm.isScheduled,
  scheduleAlarm: alarm.schedule,
  removeAlarm: alarm.remove,
}

const init = () => {
  listen('workflows', {
    onMessage: async ({ name, args }) => {
      const { [name]: workflow } = allWorkflows

      const response = workflow && await workflow(...args)
      console.log('background workflows on message', name, response)
      return response
    },
  })
}

export default {
  ...allWorkflows,
  init,
}
