<template>
  <svg v-bind="$attrs" class="h-icon" aria-hidden="true">
    <use :xlink:href="`#hs-${name}`" />
  </svg>
</template>

<script>
  export default {
    name: 'HIcon',
    props: {
      name: {
        type: String,
        default: 'placeholder',
      },
    },
  }
</script>

<style scoped lang="less">
  .h-icon {
    vertical-align: middle;
    overflow: hidden;
    width: 1em;
    height: 1em;
    fill: currentColor;
  }
</style>
