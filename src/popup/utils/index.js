const getUniqueId = (() => {
  let id = 0
  return () => {
    id += 1
    return id
  }
})()

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export {
  getUniqueId,
  sleep,
}