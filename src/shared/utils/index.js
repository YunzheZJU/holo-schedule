import { inRange } from 'lodash'

const constructUrl = ({ platform, room, video, time }) => ({
  youtube: `https://www.youtube.com/watch?v=${room}${time ? `&t=${time}` : ''}`,
  bilibili: `https://live.bilibili.com/${room}`,
  twitch: `https://www.twitch.tv/${room}`,
  twitcasting: `https://twitcasting.tv/${room}${video ? `/movie/${video}` : ''}`,
  twitter: `https://twitter.com/i/spaces/${room}`,
}[platform])

const guessLangFromMember = ({ id }) => {
  if (inRange(id, 45, 51)) {
    return 'zh-CN'
  }

  if (inRange(id, 1, 45)
    || inRange(id, 62, 64)
    || inRange(id, 72, 81)
    || inRange(id, 96, 101)
    || inRange(id, 110, 119)) {
    return 'ja'
  }

  return 'en'
}

const guessLangFromPlatform = name => {
  if (name === 'bilibili') {
    return 'zh-CN'
  }

  if (name === 'twitcasting') {
    return 'ja'
  }

  return undefined
}

// eslint-disable-next-line import/prefer-default-export
export { constructUrl, guessLangFromMember, guessLangFromPlatform }
