<template>
  <Fragment v-if="groupMembers.length">
    <div class="header">
      <div class="title"><span>{{ name }}</span></div>
      <div class="select-helper">
        <transition>
          <div :key="`${helperStatus}`" class="vertical-transition">
            <template v-if="helperStatus">
              <span class="question">
                <HIcon class="icon" :name="helperStatus === 'success' ? 'success' : 'question'" />
                {{ $t(`memberGroup.selectHelper.${helperStatus}`) }}
              </span>
              <span class="options">
                <template v-if="['mute', 'subscribe'].includes(helperStatus)">
                  <button @click="() => onClickConfirm(helperStatus)">
                    {{ $t('memberGroup.selectHelper.yes') }}
                  </button>
                  <button @click="onClickIgnore">{{ $t('memberGroup.selectHelper.no') }}</button>
                </template>
                <button v-else @click="onClickUndo">
                  {{ $t('memberGroup.selectHelper.undo') }}
                </button>
              </span>
            </template>
          </div>
        </transition>
      </div>
    </div>
    <ol class="content">
      <li v-for="member in groupMembers" :key="member['id']" class="member-container">
        <SubscriptionInput :member="member"
                           :subscribed="subscriptionByMember[member['id']]"
                           class="member"
                           @input="(subscribed) => setSubscription(member['id'], subscribed)"
        />
      </li>
    </ol>
  </Fragment>
</template>

<script>
  import SubscriptionInput from 'components/subscription-input'
  import { compact, find } from 'lodash'
  import HIcon from 'shared/components/h-icon'
  import { MEMBERS, SUBSCRIPTION_BY_MEMBER } from 'shared/store/keys'
  import { Fragment } from 'vue-fragment'
  import { mapState } from 'vuex'
  import browser from 'webextension-polyfill'

  const { workflows: { updateSubscriptionByMember } } = browser.extension.getBackgroundPage()

  export default {
    name: 'MemberGroup',
    components: { Fragment, SubscriptionInput, HIcon },
    props: {
      name: {
        type: String,
        required: true,
      },
      memberIds: {
        type: Array,
        default() {
          return []
        },
      },
    },
    data: () => ({
      helperStatus: undefined,
      lastRecord: undefined,
      savedValues: undefined,
    }),
    computed: {
      groupMembers() {
        // `this.members` may not come in the same order of ids in this.memberIds
        // So this.members.filter(...) is not preferred here
        return compact(this.memberIds.map(id => find((this.members ?? []), { id })))
      },
      ...mapState({
        members: MEMBERS,
        subscriptionByMember: SUBSCRIPTION_BY_MEMBER,
      }),
    },
    methods: {
      setSubscription(memberId, subscribed) {
        this.record(memberId, subscribed)
        return updateSubscriptionByMember(memberId, subscribed)
      },
      record(memberId, subscribed) {
        if (this.lastRecord?.subscribed === subscribed && this.lastRecord?.memberId !== memberId) {
          this.helperStatus = subscribed ? 'subscribe' : 'mute'
        } else {
          this.helperStatus = undefined
        }
        this.lastRecord = { memberId, subscribed }
      },
      onClickConfirm(operation) {
        this.savedValues = this.groupMembers.map(
          ({ id }) => ({ memberId: id, subscribed: this.subscriptionByMember[id] }),
        )
        this.groupMembers.forEach(({ id }, index) => {
          setTimeout(() => updateSubscriptionByMember(id, operation === 'subscribe'), index * 25)
        })

        this.helperStatus = 'success'

        setTimeout(() => {
          if (this.helperStatus === 'success') {
            this.helperStatus = undefined
          }
        }, 3000)
      },
      onClickIgnore() {
        this.helperStatus = undefined
      },
      onClickUndo() {
        (this.savedValues ?? []).forEach(({ memberId, subscribed }, index) => {
          setTimeout(() => updateSubscriptionByMember(memberId, subscribed), index * 25)
        })

        this.helperStatus = undefined
      },
    },
  }
</script>

<style lang="less" scoped>
  .header {
    @media screen and (min-width: 1200px) {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 16px;
      align-items: center;

      &:before {
        content: '';
      }
    }
  }

  .title {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    padding: 4px;
    color: var(--color-text-dark);
    font-size: 20px;

    &:before, &:after {
      content: '';
    }

    span {
      border-bottom: 1px solid;
    }
  }

  .select-helper {
    position: relative;
    display: grid;
    grid: "single-column";
    font-size: 16px;

    .vertical-transition {
      display: flex;
      flex-wrap: wrap;
      grid-area: single-column;
      gap: 8px;
      align-items: center;
      justify-content: center;

      &.v-enter-from {
        max-height: 0;
        opacity: 0;
        transform: translateY(16px);
      }

      &.v-enter-active, &.v-leave-active {
        transition: all .4s ease;
      }

      &.v-enter-to, &.v-leave-from {
        max-height: 50px;
        opacity: 1;
      }

      &.v-leave-to {
        max-height: 0;
        opacity: 0;
        transform: translateY(-30px);
      }

      .question {
        color: var(--color-text-normal);
        text-align: center;

        .icon {
          vertical-align: -4px;
          font-size: 20px;
        }
      }

      &:empty:before {
        @media screen and (min-width: 1200px) {
          content: '-';
          opacity: 0;
        }
      }
    }

    .options {
      display: flex;
      gap: 8px;

      button {
        position: relative;
        display: flex;
        align-items: center;
        width: auto;
        padding: 4px;
        border: 1px transparent;
        border-style: dotted none;
        color: var(--color-theme);
        font-size: inherit;
        cursor: pointer;

        &:focus {
          border-bottom-color: currentColor;
        }

        &:not(:hover, :focus) + button, &:hover, &:focus {
          &:before, &:after {
            opacity: 1;
          }
        }

        &:before, &:after {
          content: '';
          display: block;
          width: 0;
          height: 0;
          border: 4px solid transparent;
          opacity: 0;
          transition: opacity .2s linear;
        }

        &:before {
          border-left-color: currentColor;
        }

        &:after {
          border-right-color: currentColor;
        }
      }
    }
  }

  .content {
    display: grid;
    grid-template-columns: repeat(auto-fit, 192px);
    gap: 24px;
    align-items: center;
    justify-content: center;
    justify-items: center;
    padding: 16px;

    .member-container {
      width: 100%;
      filter: drop-shadow(4px 4px 0 var(--color-text-dark)) brightness(var(--brightness));
      transition: filter .1s, transform .1s;

      &:hover, &:focus-within {
        filter: drop-shadow(4px 9px 0 var(--color-text-dark)) brightness(var(--brightness));
        transform: translate(0px, -3px);
      }

      .member {
        width: 100%;
      }
    }
  }
</style>
