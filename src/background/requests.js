/* eslint-disable no-await-in-loop */
import { mapKeys, snakeCase } from 'lodash'

const TARGET = 'https://holo.dev/'

const gatherResponse = async response => {
  if (response.headers.get('content-type').includes('application/json')) {
    return response.json()
  }
  return response.text()
}

const callbacks = []
const onSuccessRequest = {
  addEventListener: (callback = () => null) => {
    callbacks.push(callback)
  },
}

const fetchData = async (...args) => {
  const response = await fetch(...args)

  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`)
  }

  callbacks.forEach(callback => callback())

  return gatherResponse(response)
}

async function* pagedItemsFetcher(endpoint, params = {}) {
  const safeParams = mapKeys(params, (_, key) => snakeCase(key))
  const { limit = 50 } = safeParams

  const searchParams = new URLSearchParams({ limit, ...safeParams })

  let page = 0
  let shouldContinue = true

  do {
    page += 1
    searchParams.set('page', page.toString())

    const { [endpoint.split('/')[0]]: items } = await fetchData(
      `${TARGET}api/v1/${endpoint}?${searchParams.toString()}`,
    )

    yield items

    if (items.length < limit) {
      shouldContinue = false
    }
  } while (shouldContinue)
}

const gatherPagedItems = async (...args) => {
  const items = []

  // eslint-disable-next-line no-restricted-syntax
  for await (const contents of pagedItemsFetcher(...args)) {
    items.push(contents)
  }

  return items.flat()
}

const getEndedLives = async params => {
  const { value } = await pagedItemsFetcher('lives/ended', params).next()
  return value
}

const getOpenLives = params => gatherPagedItems('lives/open', params)

const getChannels = () => gatherPagedItems('channels', { limit: 100 })

const getMembers = () => fetchData(`${TARGET}api/v1/members`)

export {
  getEndedLives,
  getOpenLives,
  getChannels,
  getMembers,
  onSuccessRequest,
}
