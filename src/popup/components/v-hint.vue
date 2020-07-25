<template>
  <div v-if="hints.any" class="hint">{{ hint.text }}</div>
</template>

<script>
  export default {
    name: 'VHint',
    data() {
      const hints = this.$hints

      return {
        hints,
      }
    },
    computed: {
      hint() {
        return this.hints.last ?? {}
      },
    },
  }
</script>

<style lang="less" scoped>
  .hint {
    position: fixed;
    right: 0;
    bottom: 0;
    padding: 0 8px;
    border-radius: 4px 0 0 0;
    background-color: var(--color-bg-light);
    color: var(--color-text-dark);
    box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.1);
    font-size: 12px;
    line-height: 1.8;
  }
</style>
