<template>
  <label class="subscription-input"
         :class="!subscribed && 'unsubscribed'"
         :style="{background: member['color_main']}"
  >
    <input :checked="subscribed" class="input" type="checkbox" @change="handleChange">
    <span class="avatar">
      <img class="avatar-img" :src="member['avatar']" :alt="member['name']">
    </span>
    <span class="name"
          :style="{color: getContrastColor(member['color_main'])}"
    >
      {{ member['name'] }}
    </span>
  </label>
</template>

<script>
  import { getContrastColor } from 'utils'

  export default {
    name: 'SubscriptionInput',
    props: {
      member: {
        type: Object,
        required: true,
      },
      subscribed: {
        type: Boolean,
        default: true,
      },
    },
    emits: ['input'],
    methods: {
      handleChange() {
        this.$emit('input', !this.subscribed)
      },
      getContrastColor,
    },
  }
</script>

<style lang="less" scoped>
  .subscription-input {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: clip-path .3s;
    clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);

    .input {
      position: absolute;
      opacity: 0;
    }

    .avatar {
      flex-shrink: 0;
      padding: 2px;

      .avatar-img {
        object-fit: cover;
        width: 68px;
        height: 68px;
        transition: width .3s, height .3s;
        clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
      }
    }

    .name {
      flex-grow: 1;
      padding-right: 8px;
      font-weight: 700;
      font-size: 16px;
      text-align: center;
    }

    &.unsubscribed {
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);

      .avatar .avatar-img {
        width: 0;
        height: 36px;
      }

      .name {
        padding-left: 4px;
        text-decoration: line-through;
        // For Firefox
        text-decoration-thickness: 0.1em;
      }
    }
  }
</style>
