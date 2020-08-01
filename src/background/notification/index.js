import { noop } from 'lodash'
import browser from 'webextension-polyfill'

const notification = {
  create(stringId, { title, message, iconUrl, onClick = noop }) {
    browser.notifications.create(stringId, {
      type: 'basic',
      title,
      message,
      iconUrl,
    }).catch(
      // Icon from the web will not be loaded successfully in Chrome
      () => browser.notifications.create(stringId, {
        type: 'basic',
        title,
        message,
        iconUrl: browser.runtime.getURL('assets/default_avatar.png'),
      }),
    ).then(
      () => console.log('Successfully created a notification'),
    )

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
