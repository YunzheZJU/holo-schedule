/* eslint-disable no-await-in-loop */
import { mapKeys, snakeCase } from 'lodash'

const TARGET = 'https://holo.dev/'

const gatherResponse = async response => {
  if (response.headers.get('content-type').includes('application/json')) {
    return response.json()
  }
  return response.text()
}

const fetchData = async (...args) => {
  const response = await fetch(...args)

  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`)
  }

  return gatherResponse(response)
}

async function* pagedItemsFetcher(endpoint, params = {}) {
  const safeParams = mapKeys(params, (_, key) => snakeCase(key))
  const { limit = 20 } = safeParams

  const searchParams = new URLSearchParams(safeParams)

  let page = 0
  let shouldContinue = true

  do {
    page += 1
    searchParams.set('page', page.toString())

    const { [endpoint.split('/')[0]]: items } = await fetchData(
      `${TARGET}api/v1/${endpoint}?${searchParams.toString()}`,
    )

    yield items

    // FIXME: `items.length > limit` is added here as a patch
    // Remove it after backend removes the previous patch on channels
    if (items.length < limit || items.length > limit) {
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

const getCurrentLives = params => gatherPagedItems('lives/current', params)

const getScheduledLives = params => gatherPagedItems('lives/scheduled', params)

const getChannels = () => gatherPagedItems('channels', { limit: 100 })

const getMembers = () => fetchData(`${TARGET}api/v1/members`)

export {
  getEndedLives,
  getCurrentLives,
  getScheduledLives,
  getChannels,
  getMembers,
}
