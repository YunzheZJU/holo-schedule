<template>
  <div class="app" :lang="$i18n.locale">
    <div class="frame-left" />
    <div class="frame-right" />
    <div class="container">
      <svg class="bg">
        <defs>
          <pattern id="ptn_bg"
                   width="32"
                   height="32"
                   patternUnits="userSpaceOnUse"
                   style="color: var(--color-theme)"
          >
            <rect x="16" y="0" width="1" height="32" fill="currentColor" />
            <rect x="0" y="16" width="32" height="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ptn_bg)" fill-opacity="0.2" />
      </svg>
      <main class="main">
        <div class="title">
          <img class="logo" :src="getAssets('icons/icon@32.png')" alt="Logo">
          <div class="text">{{ $t('app.advancedSettings.label') }}</div>
        </div>
        <section class="section">
          <div class="section-title">
            <div class="name">{{ $t('app.advancedSettings.members.label') }}</div>
            <div class="desc">{{ $t('app.advancedSettings.members.description') }}</div>
          </div>
          <ul class="content">
            <li v-for="(group, index) in groups" :key="index" class="group">
              <MemberGroup v-bind="group" />
            </li>
          </ul>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
  import MemberGroup from 'components/member-group'
  import browser from 'shared/browser'
  import memberGroups from 'shared/constants/memberGroups'

  export default {
    name: 'App',
    components: { MemberGroup },
    computed: {
      groups() {
        return memberGroups.map(({ group, memberIds, lang }) => ({
          name: this.$t(`app.groups.${group}`),
          memberIds,
          lang,
        }))
      },
    },
    methods: {
      getAssets: browser.runtime.getURL,
    },
  }
</script>

<style lang="less" scoped>
  .app {
    display: flex;
    background-color: var(--color-bg-base);
  }

  .frame-left, .frame-right {
    position: relative;
    width: 12px;
    background: var(--color-theme);

    @media screen and (min-width: 1200px) {
      width: 56px;
    }

    &:after {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 8px;
      background-color: var(--color-bg-base);

      @media screen and (min-width: 1200px) {
        content: '';
      }
    }
  }

  .frame-left {
    order: 1;

    &:after {
      right: 8px;
    }
  }

  .frame-right {
    order: 3;

    &:after {
      left: 8px;
    }
  }

  .container {
    position: relative;
    flex-grow: 1;
    order: 2;

    .bg {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .main {
      // This resolves occursion of svg on frame in Firefox but introduce another problem
      // where section-title do not expand
      //position: relative;
      max-width: 1200px;
      min-height: 100vh;
      margin: 32px auto;

      .title {
        display: inline-grid;
        grid-template-columns: 48px max-content;
        grid-auto-flow: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto 32px 64px;
        border: 2px solid var(--color-theme);
        background: var(--color-theme);
        filter: drop-shadow(4px 4px 0 var(--color-text-dark)) brightness(var(--brightness));

        .logo {
          padding: 8px;
          background: var(--color-white);
        }

        .text {
          padding: 4px 16px;
          color: var(--color-white);
          font-weight: 700;
          font-size: 24px;
        }
      }

      .section {
        .section-title {
          display: grid;
          align-items: center;
          justify-content: center;
          justify-items: center;
          margin: 0 auto;
          font-weight: 300;

          &:before, &:after {
            content: '';
            position: absolute;
            width: 0;
            height: 0;
            border: 16px solid transparent;
          }

          &:before {
            left: 0;
            border-left-color: var(--color-theme);
          }

          &:after {
            right: 0;
            border-right-color: var(--color-theme);
          }

          .name {
            position: relative;
            padding: 0 1em;
            border-bottom: 4px solid;
            color: var(--color-theme);
            font-size: 32px;
          }

          .desc {
            padding: 8px;
            color: var(--color-text-normal);
            font-size: 16px;
          }
        }

        .content {
          position: relative;

          .group {
            margin: 8px;
          }
        }
      }
    }
  }
</style>
