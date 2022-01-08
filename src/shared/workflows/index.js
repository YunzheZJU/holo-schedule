import create from 'shared/ports/create'

const port = create('workflows')

const workflows = new Proxy({}, {
  get(target, name, receiver) {
    if (name in target) {
      return Reflect.get(target, name, receiver)
    }

    return (...args) => port.postMessage({ name, args })
  },
})

export default workflows
