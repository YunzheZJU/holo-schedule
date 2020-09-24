const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const formatDurationFromSeconds = (input = '0') => {
  const duration = +input
  const hours = Math.floor(duration / 60 / 60)
  const minutes = Math.floor((duration - hours * 60 * 60) / 60).toString().padStart(2, '0')
  const seconds = (duration - hours * 60 * 60 - minutes * 60).toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`.replace(/^0:0?/, '')
}

export { sleep, formatDurationFromSeconds }
