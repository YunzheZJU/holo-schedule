<template>
  <div class="app">
    <div class="head">
      <img class="logo" :src="popupLogo" alt="logo" />
    </div>
    <div class="body">
      <LiveList type="current" />
      <LiveList type="scheduled" />
      <VToast style="top: 64px;z-index: 1;" />
      <VHint style="z-index: 1" />
    </div>
  </div>
</template>

<script>
  import browser from 'webextension-polyfill'
  import LiveList from './components/live-list'
  import RelativeTime from './components/relative-time'
  import VHint from './components/v-hint'
  import VToast from './components/v-toast'

  export default {
    name: 'app',
    components: { LiveList, VToast, VHint, RelativeTime },
    data() {
      return {}
    },
    computed: {
      popupLogo() {
        return browser.runtime.getURL('assets/popup_logo.svg')
      },
    },
  }
</script>

<style lang="less" scoped>
  .app {
    width: 375px;
    /* TODO: Use color variables */
    background-color: rgb(255, 255, 255);
    background-image: linear-gradient(rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.02));
  }

  .head {
    padding: 12px 16px;
    background: linear-gradient(45deg, #268C89, #65E5B4);

    .logo {
      height: 32px;
    }
  }

  .body {
    overflow-y: auto;
    max-height: 540px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
</style>