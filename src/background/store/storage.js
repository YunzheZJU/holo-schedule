import browser from 'webextension-polyfill'

// webextension-polyfill can only run in browsers
// Split this module out in order to test the store without many pains
export default browser.storage.local
