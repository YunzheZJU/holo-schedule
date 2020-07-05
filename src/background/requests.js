/* eslint-disable no-await-in-loop */
import { mapKeys, snakeCase } from 'lodash'

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

async function* liveFetcher(endpoint, params = {}) {
  const safeParams = mapKeys(params, (_, key) => snakeCase(key))
  const { limit = 20 } = safeParams

  const searchParams = new URLSearchParams(safeParams)

  let page = 0
  let shouldContinue = true

  do {
    page += 1
    searchParams.set('page', page.toString())

    const { lives } = await fetchData(`https://holo.dev/api/v1/lives/${endpoint}?${searchParams.toString()}`)

    yield lives

    if (lives.length < limit) {
      shouldContinue = false
    }
  } while (shouldContinue)
}

const fetchLives = async (...args) => {
  const currentLives = []

  // eslint-disable-next-line no-restricted-syntax
  for await (const lives of liveFetcher(...args)) {
    currentLives.push(lives)
  }

  return currentLives.flat()
}

const getEndedLives = async params => {
  const { value } = await liveFetcher('ended', params).next()
  return value
}

const getCurrentLives = () => fetchLives('current')

const getScheduledLives = params => fetchLives('scheduled', params)

const getChannels = async () => {
  const { channels } = await fetchData('https://holo.dev/api/v1/channels?limit=100')
  return channels
}

const getMembers = () => fetchData('https://holo.dev/api/v1/members')

export {
  getEndedLives,
  getCurrentLives,
  getScheduledLives,
  getChannels,
  getMembers,
}
