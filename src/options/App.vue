<template>
  <div class="app">
    <div class="frame-left" />
    <div class="frame-right" />
    <div class="container">
      <svg class="bg">
        <defs>
          <pattern
            id="ptn_bg"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
            style="color: var(--color-theme)"
          >
            <rect x="0" y="0" width="32" height="32" fill="#ddd" />
            <rect x="16" y="0" width="1" height="32" fill="currentColor" />
            <rect x="0" y="16" width="32" height="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ptn_bg)" fill-opacity="0.2" />
      </svg>
      <main class="main">
        <div class="title">
          <img class="logo" :src="getAssets('icons/icon@32.png')" alt="Logo">
          <div class="text">Advanced Settings</div>
        </div>
        <section class="section">
          <div class="section-title">
            <div class="name">Members</div>
            <div class="desc">Configure the list of members to subscribe</div>
          </div>
          <ul class="content">
            <li v-for="(group, index) in groups" :key="index" class="group">
              <div class="group-title">{{ group.name }}</div>
              <ol v-if="group.members" class="group-content">
                <li v-for="member in group.members" :key="member['id']" class="member-container">
                  <SubscriptionForm
                    :member="member"
                    :subscribed="subscriptionByMember[member['id']]"
                    class="member"
                  />
                </li>
              </ol>
              <div v-else class="group-empty">No Member Data</div>
            </li>
          </ul>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
  import SubscriptionForm from 'components/subscription-form'
  import { compact, range } from 'lodash'
  import { MEMBERS, SUBSCRIPTION_BY_MEMBER } from 'shared/store/keys'
  import { mapState } from 'vuex'
  import browser from 'webextension-polyfill'

  export default {
    name: 'App',
    components: { SubscriptionForm },
    computed: {
      groups() {
        return ([
          {
            name: 'Hololive',
            members: range(1, 34),
          },
        ].map(group => ({
          ...group,
          members: compact(group.members.map(id => this.members.find(({ id: _id }) => id === _id))),
        })))
      },
      ...mapState({
        members: MEMBERS,
        subscriptionByMember: SUBSCRIPTION_BY_MEMBER,
      }),
    },
    methods: {
      getAssets: browser.runtime.getURL,
    },
  }
</script>

<style lang="less" scoped>
  .app {
    display: flex;
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
      background: var(--color-white);

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
      z-index: -1;
      width: 100%;
      height: 100%;
    }

    .main {
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
        filter: drop-shadow(4px 4px 0 black);

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
          justify-content: center;
          justify-items: center;
          margin: 0 auto;
          font-weight: 300;

          &:before, &:after {
            content: '';
            position: absolute;
            width: 0;
            height: 0;
            border: 12px solid transparent;
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
          .group {
            margin: 8px;
            text-align: center;

            .group-title {
              display: inline-grid;
              grid-template-columns: auto auto auto;
              justify-content: center;
              padding: 4px;
              border-bottom: 1px solid;
              color: black;
              font-size: 20px;
            }

            .group-content {
              display: grid;
              grid-template-columns: repeat(auto-fit, 192px);
              gap: 24px;
              align-items: center;
              justify-content: center;
              justify-items: center;
              padding: 16px;

              .member-container {
                width: 100%;
                filter: drop-shadow(4px 4px 0 black);
                transition: filter .1s, transform .1s;

                &:hover {
                  filter: drop-shadow(4px 9px 0 black);
                  transform: translate(0px, -3px);
                }

                .member {
                  width: 100%;
                }
              }
            }

            .group-empty {
              margin: 16px 0;
              color: var(--color-text-light);
              font-weight: 300;
              font-style: italic;
              font-size: 16px;
            }
          }
        }
      }
    }
  }
</style>
