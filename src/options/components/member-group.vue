<template>
  <Fragment>
    <div class="title-container">
      <div class="title">{{ name }}</div>
    </div>
    <ol v-if="groupMembers.length" class="content">
      <li v-for="member in groupMembers" :key="member['id']" class="member-container">
        <SubscriptionForm
          :member="member"
          :subscribed="subscriptionByMember[member['id']]"
          class="member"
        />
      </li>
    </ol>
    <div v-else class="empty">{{ $t('memberGroup.noData') }}</div>
  </Fragment>
</template>

<script>
  import SubscriptionForm from 'components/subscription-form'
  import { compact, find } from 'lodash'
  import { MEMBERS, SUBSCRIPTION_BY_MEMBER } from 'shared/store/keys'
  import { Fragment } from 'vue-fragment'
  import { mapState } from 'vuex'

  export default {
    name: 'MemberGroup',
    components: { Fragment, SubscriptionForm },
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
  }
</script>

<style lang="less" scoped>
  .title-container {
    text-align: center;

    .title {
      display: inline-grid;
      grid-template-columns: auto auto auto;
      justify-content: center;
      padding: 4px;
      border-bottom: 1px solid;
      color: black;
      font-size: 20px;
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

  .empty {
    margin: 16px 0;
    color: var(--color-text-light);
    font-weight: 300;
    font-style: italic;
    font-size: 16px;
    text-align: center;
  }
</style>
