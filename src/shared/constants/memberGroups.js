import { range } from 'lodash'

const memberGroups = [
  {
    group: 'newDebuts',
    // Dummy ids are specified here to be compatible to new members
    memberIds: range(120, 130),
    lang: 'en',
  },
  {
    group: 'hololive',
    memberIds: [
      62,
      ...range(1, 34),
      ...range(72, 77),
    ],
    lang: 'ja',
  },
  {
    group: 'hololiveDEVIS',
    memberIds: [
      101,
      ...range(96, 101),
      115,
      ...range(110, 115),
    ],
    lang: 'ja',
  },
  {
    group: 'holostars',
    memberIds: [
      63,
      ...range(34, 45),
      ...range(77, 81),
    ],
    lang: 'ja',
  },
  {
    group: 'hololiveChina',
    memberIds: range(45, 51),
    lang: 'zh-CN',
  },
  {
    group: 'hololiveIndonesia',
    memberIds: [
      64,
      ...range(51, 54),
      ...range(59, 62),
      ...range(81, 84),
    ],
    lang: 'en',
  },
  {
    group: 'hololiveEnglish',
    // eslint-disable-next-line max-len
    memberIds: [
      65,
      ...range(54, 59),
      ...range(66, 72),
      ...range(92, 96),
      ...range(106, 110),
    ],
    lang: 'en',
  },
  {
    group: 'holostarsEnglish',
    memberIds: [
      119,
      ...range(84, 92),
      ...range(102, 106),
    ],
    lang: 'en',
  },
  {
    group: 'holoAN',
    memberIds: [
      118,
      116,
      117,
    ],
    lang: 'ja',
  },
]

export default memberGroups
