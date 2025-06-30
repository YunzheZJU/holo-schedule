import { fromPairs } from 'lodash'
import memberGroups from 'shared/constants/memberGroups'

const constructUrl = ({ platform, room, video, time }) => ({
  youtube: `https://www.youtube.com/watch?v=${room}${time ? `&t=${time}` : ''}`,
  bilibili: `https://live.bilibili.com/${room}`,
  twitch: `https://www.twitch.tv/${room}`,
  twitcasting: `https://twitcasting.tv/${room}${video ? `/movie/${video}` : ''}`,
  twitter: `https://twitter.com/i/spaces/${room}`,
}[platform])

const langByMemberId = fromPairs(
  memberGroups.flatMap(({ memberIds, lang }) => memberIds.map(id => [
    id,
    lang,
  ])),
)

const getLangFromMemberId = (id) => {
  return langByMemberId[id] || 'en'
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
export { constructUrl, getLangFromMemberId, guessLangFromPlatform }
