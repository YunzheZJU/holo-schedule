<template>
  <div class="app">
    <div class="head">
      <img class="logo" :src="popupLogo" alt="logo">
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
  import LiveList from 'components/live-list'
  import VHint from 'components/v-hint'
  import VToast from 'components/v-toast'

  export default {
    name: 'App',
    components: { LiveList, VToast, VHint },
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
    background-color: var(--color-bg-base);
    background-image: linear-gradient(var(--color-bg-light), var(--color-bg-light));
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
