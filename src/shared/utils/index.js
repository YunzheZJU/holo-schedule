const constructUrl = ({ platform, room, video, time }) => ({
  youtube: `https://www.youtube.com/watch?v=${room}${time ? `&t=${time}` : ''}`,
  bilibili: `https://live.bilibili.com/${room}`,
  twitch: `https://www.twitch.tv/${room}`,
  twitcasting: `https://twitcasting.tv/${room}${video ? `/movie/${video}` : ''}`,
  twitter: `https://twitter.com/i/spaces/${room}/peek`,
}[platform])

// eslint-disable-next-line import/prefer-default-export
export { constructUrl }
