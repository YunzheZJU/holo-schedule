import { noop } from 'lodash'
import browser from 'webextension-polyfill'

const notification = {
  async create(stringId, { title, message, iconUrl, onClick = noop }) {
    await browser.notifications.create(stringId, {
      type: 'basic',
      title,
      message,
      // Icon directly from the web will not be loaded successfully in Chrome
      // So we load it manually
      iconUrl: await fetch(iconUrl)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }))
        .catch(err => {
          console.log('Failed to download icon', err.message)
          return browser.runtime.getURL('assets/default_avatar.png')
        }),
    })
    console.log('Successfully created a notification')

    const handleClicked = notificationId => {
      if (notificationId !== stringId) return

      onClick()

      browser.notifications.onClicked.removeListener(handleClicked)
    }

    // This callback will not be fired properly in Chrome
    // See: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#notifications
    browser.notifications.onClicked.addListener(handleClicked)
  },
}

export default notification
