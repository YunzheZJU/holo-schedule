<template>
  <img ref="image"
       loading="lazy"
       :class="['lazy-image', {loaded}]"
       v-bind="$props"
       @load="handleImgLoad"
  >
</template>

<script>
  export default {
    name: 'LazyImage',
    props: {
      src: {
        type: String,
        default: '',
      },
      alt: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        loaded: false,
      }
    },
    methods: {
      handleImgLoad() {
        this.loaded = true
      },
    },
  }
</script>

<style lang="less" scoped>
  .lazy-image {
    transition: opacity .2s ease-in;

    &:not(.loaded) {
      opacity: 0;
    }
  }
</style>
