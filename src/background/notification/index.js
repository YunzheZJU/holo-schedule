import browser from 'webextension-polyfill'
import { noop } from 'lodash'

const notification = {
  create(stringId, { title, message, iconUrl, onClick = noop }) {
    browser.notifications.create(stringId, {
      type: 'basic',
      title,
      message,
      iconUrl,
    }).then(
      () => console.log('Successfully created a notification'),
    )

    const handleClicked = notificationId => {
      if (notificationId !== stringId) return

      onClick()

      browser.notifications.onClicked.removeListener(handleClicked)
    }

    // This callback will not be fired properly in Chrome (tested on Win10)
    browser.notifications.onClicked.addListener(handleClicked)
  },
}

export default notification
