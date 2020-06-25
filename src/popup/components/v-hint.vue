<template>
  <div class="hint" v-if="hints.any">{{hint.text}}</div>
</template>

<script>
  import { last } from 'lodash'

  export default {
    name: 'v-hint',
    data() {
      const hints = this.$hints

      return {
        hints,
      }
    },
    computed: {
      hint() {
        return last(this.hints) || {}
      }
    }
  }
</script>

<style lang="less" scoped>
  .hint {
    position: fixed;
    right: 0;
    bottom: 0;
    padding: 0 8px;
    border-radius: 4px 0 0 0;
    background-color: rgb(255, 255, 255);
    background-image: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05));
    box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.1);
    font-size: 12px;
    line-height: 1.8;
  }
</style>