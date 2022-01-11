const taskQueue = []
let isExecutingTask = false

const execTask = () => {
  if (taskQueue.length === 0 || isExecutingTask) {
    return
  }

  const { task, res, rej } = taskQueue.shift()

  isExecutingTask = true
  task()
    .finally(() => {
      isExecutingTask = false
    })
    .then(res)
    .catch(rej)
    .then(execTask)
}

const withLock = task => new Promise((res, rej) => {
  taskQueue.push({ task, res, rej })
  execTask()
})

export default withLock
