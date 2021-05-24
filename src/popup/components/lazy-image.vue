<template>
  <!--suppress RequiredAttributes -->
  <img ref="image"
       :class="['lazy-image', {loaded}]"
       :data-src="src"
       :alt="alt"
       @load="handleImgLoad"
  >
</template>

<script>
  let observer

  const ratioThreshold = 0.01

  const onIntersectionChange = entries => {
    entries.forEach(({ intersectionRatio: ratio, target }) => {
      if (ratio >= ratioThreshold) {
        // This delays the sync load of image on popup page's startup to avoid Chrome's hanging
        setTimeout(() => {
          // eslint-disable-next-line no-param-reassign
          target.src = target.dataset.src
        }, 0)
        observer.unobserve(target)
      }
    })
  }

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
    mounted() {
      observer = observer || new IntersectionObserver(
        onIntersectionChange, {
          root: document.querySelector('.app .body .main .scroll'),
          rootMargin: '500px 0px',
          threshold: ratioThreshold,
        },
      )
      observer.observe(this.$refs.image)
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
