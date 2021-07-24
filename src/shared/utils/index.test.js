import { constructUrl } from './index'

test('should construct room url', () => {
  const liveOne = { platform: 'youtube', room: 'NewRoom' }
  const liveTwo = { platform: 'bilibili', room: 'NewRoom' }
  const liveThree = { platform: 'unknown', room: 'NewRoom' }
  const liveFour = { platform: 'youtube', room: 'NewRoom', time: 300 }
  const liveFive = {
    platform: 'twitcasting',
    room: 'NewRoom',
    video: 'newVideo',
  }

  expect(constructUrl(liveOne)).toEqual(`https://www.youtube.com/watch?v=${liveOne.room}`)
  expect(constructUrl(liveTwo)).toEqual(`https://live.bilibili.com/${liveTwo.room}`)
  expect(constructUrl(liveThree)).toEqual(undefined)
  expect(constructUrl(liveFour)).toEqual(`https://www.youtube.com/watch?v=${liveFour.room}&t=${liveFour.time}`)
  expect(constructUrl(liveFive)).toEqual(`https://twitcasting.tv/${liveFive.room}/movie/${liveFive.video}`)
})
