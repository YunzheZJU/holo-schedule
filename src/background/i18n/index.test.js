import { LOCALE } from 'shared/store/keys'
import store from 'store'
import browser from 'webextension-polyfill'
import workflows from 'workflows'
import i18n from './index'

jest.mock('webextension-polyfill')
jest.mock('workflows')
jest.mock('./locales/en.json5', () => ({
  foo: {
    bar: 'abc',
    baz: 'Hello, {name}.',
  },
}))
jest.mock('./locales/zh-CN.json5', () => ({
  foo: {
    bar: 'def',
    baz: 'Hi, {name}.',
  },
}))

test('should use default locale', async () => {
  const locale = 'fr'
  browser.i18n = {
    getUILanguage: jest.fn(() => locale),
  }

  await i18n.init(store)

  expect(i18n.locale).toEqual('en')
})

test('should use browser UI language', async () => {
  const locale = 'zh-CN'
  browser.i18n = {
    getUILanguage: jest.fn(() => locale),
  }

  await i18n.init(store)

  expect(i18n.locale).toEqual(locale)
})

test('should use browser UI language with partial match', async () => {
  const locale = 'zh'
  browser.i18n = {
    getUILanguage: jest.fn(() => locale),
  }

  await i18n.init(store)

  expect(i18n.locale).toEqual(locale)
})

test('should use locale from store', async () => {
  const locale = 'fr'
  workflows.getLocale = jest.fn(() => locale)

  await i18n.init(store)

  expect(i18n.locale).toEqual(locale)
})

test('should subscribe to store', async () => {
  const locale = 'de'

  await i18n.init(store)
  await store.set({ [LOCALE]: locale })

  expect(i18n.locale).toEqual(locale)
})

test('should get message', async () => {
  await i18n.init(store)

  await store.set({ [LOCALE]: 'en' })

  expect(i18n.getMessage('foo.bar')).toEqual('abc')
  expect(i18n.getMessage('foo.baz', { name: 'Hololive' })).toEqual('Hello, Hololive.')
  expect(i18n.getMessage('foo.baz')).toEqual('Hello, .')

  await store.set({ [LOCALE]: 'zh-CN' })

  expect(i18n.getMessage('foo.bar')).toEqual('def')
  expect(i18n.getMessage('foo.baz', { name: 'Hololive' })).toEqual('Hi, Hololive.')
  expect(i18n.getMessage('foo.baz')).toEqual('Hi, .')
})
