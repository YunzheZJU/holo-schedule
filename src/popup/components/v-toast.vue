<template>
  <ul class="v-toast">
    <li v-for="toast in toasts" :key="toast['id']" :class="['toast', toast.type]">
      <div class="text">{{ toast.text }}</div>
      <button type="button" class="close" @click="() => toasts.remove(toast.id)">x</button>
    </li>
  </ul>
</template>

<script>
  export default {
    name: 'VToast',
    data() {
      const toasts = this.$toasts

      return {
        toasts,
      }
    },
  }
</script>

<style lang="less" scoped>
  .v-toast {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    display: grid;
    grid-template-columns: auto;
    gap: 8px;
    justify-content: center;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .toast {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4px;
    width: 240px;
    padding: 4px 8px;
    border-radius: 2px;
    color: var(--color-text-white);
    box-shadow: 0 2px 8px 2px rgba(0, 0, 0, 0.1);

    &.error {
      background: var(--color-error);
    }

    &.info {
      background: var(--color-theme);
    }
  }

  .text {
    font-size: 14px;
  }

  .close {
    align-self: start;
    padding: 0 4px;
    font-size: 12px;
  }
</style>
