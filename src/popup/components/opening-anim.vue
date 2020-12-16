<template>
  <div v-if="isPopupFirstRun"
       class="opening-anim"
       @animationend.self="handleAnimationEnd"
       @click="handleAnimationEnd"
  >
    <div class="background" />
    <div class="container">
      <img class="logo" :src="popupLogo" alt="logo">
    </div>
  </div>
</template>

<script>
  import { IS_POPUP_FIRST_RUN } from 'shared/store/keys'
  import { mapState } from 'vuex'
  import browser from 'webextension-polyfill'

  const { workflows: { setIsPopupFirstRun } } = browser.extension.getBackgroundPage()

  export default {
    name: 'OpeningAnim',
    computed: {
      popupLogo() {
        return browser.runtime.getURL('assets/popup_logo.svg')
      },
      ...mapState({
        isPopupFirstRun: IS_POPUP_FIRST_RUN,
      }),
    },
    methods: {
      handleAnimationEnd() {
        setIsPopupFirstRun(false)
      },
    },
  }
</script>

<style lang="less" scoped>
  @keyframes fade-out {
    from {
    }
    to {
      opacity: 0;
    }
  }

  .opening-anim {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    display: grid;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--color-bg-base);
    cursor: pointer;
    animation: .5s cubic-bezier(0.5, 1, 0.89, 1) 2.5s both fade-out;
  }

  @keyframes rotate {
    from {
      transform: rotateZ(90deg);
    }
    to {
      transform: rotateZ(0);
    }
  }

  .background {
    position: absolute;
    top: -100px;
    right: 0;
    bottom: -100px;
    left: 0;
    z-index: -1;
    background: var(--color-theme);
    transform-origin: bottom left;
    animation: 0.5s cubic-bezier(0.32, 0, 0.67, 0) 1s both rotate;
  }

  @keyframes scale-easeOutElastic {
    0% {
      transform: scale(0);
    }

    16% {
      transform: scale(1.32);
    }

    28% {
      transform: scale(0.87);
    }

    44% {
      transform: scale(1.05);
    }

    59% {
      transform: scale(0.98);
    }

    73% {
      transform: scale(1.01);
    }

    88% {
      transform: scale(1);
    }

    100% {
      transform: scale(1);
    }
  }

  @keyframes expand-width {
    from {
      width: 48px;
    }
    to {
      width: 270px;
    }
  }

  @keyframes zoom-in {
    from {
    }
    to {
      transform: scale(1.15);
    }
  }

  .container {
    overflow: hidden;
    animation: .5s .5s both scale-easeOutElastic,
    1s cubic-bezier(0.33, 1, 0.68, 1) 1.5s both expand-width,
    .5s cubic-bezier(0.5, -0.8, 0.5, 1) 2.5s both zoom-in;

    .logo {
      width: 270px;
    }
  }
</style>
