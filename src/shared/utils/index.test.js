import { constructRoomUrl } from './index'

test('should construct room url', () => {
  const liveOne = { platform: 'youtube', room: 'NewRoom' }
  const liveTwo = { platform: 'bilibili', room: 'NewRoom' }
  const liveThree = { platform: 'unknown', room: 'NewRoom' }
  const liveFour = { platform: 'youtube', room: 'NewRoom', time: 300 }

  expect(constructRoomUrl(liveOne)).toEqual(`https://www.youtube.com/watch?v=${liveOne.room}`)
  expect(constructRoomUrl(liveTwo)).toEqual(`https://live.bilibili.com/${liveTwo.room}`)
  expect(constructRoomUrl(liveThree)).toEqual(undefined)
  expect(constructRoomUrl(liveFour)).toEqual(`https://www.youtube.com/watch?v=${liveFour.room}&t=${liveFour.time}`)
})
