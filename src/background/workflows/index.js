import alarm from 'alarm'
import listen from 'ports/listen'
import workflows from './workflows'

const allWorkflows = {
  ...workflows,
  isAlarmScheduled: (...args) => alarm.isScheduled(...args),
  scheduleAlarm: (...args) => alarm.schedule(...args),
  removeAlarm: (...args) => alarm.remove(...args),
}

const init = () => {
  console.log('[background/workflows]listening to workflows')
  listen('workflows', {
    onMessage: async ({ name, args }) => {
      const { [name]: workflow } = allWorkflows

      return workflow && workflow(...args)
    },
  })
}

export default {
  ...allWorkflows,
  init,
}
