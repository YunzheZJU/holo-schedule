<template>
  <img ref="image" class="lazy-image" :src="transparent" :data-src="src" :alt="alt">
</template>

<script>
  let observer

  const ratioThreshold = 0.01

  const transparent = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

  const onIntersectionChange = entries => {
    entries.forEach(({ intersectionRatio: ratio, target, target: { style, dataset: { src } } }) => {
      if (ratio >= ratioThreshold) {
        const image = new Image()
        image.onload = () => {
          // eslint-disable-next-line no-param-reassign
          style.backgroundImage = `url("${src}")`
        }
        // The sync load of image on popup page's startup is delayed to avoid Chrome's hanging
        setTimeout(() => {
          image.src = src
          if (image.complete || image.complete === undefined) {
            image.src = transparent
            image.src = src
          }
        }, 50)
        observer.unobserve(target)
      }
    })
  }

  export default {
    name: 'LazyImage',
    props: {
      src: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
        default: '',
      },
      fallbackSrc: {
        type: String,
        default: '',
      },
    },
    computed: {
      transparent() {
        return transparent
      },
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
      this.$refs.image.style.backgroundImage = `url("${this.fallbackSrc}")`
    },
  }
</script>

<style lang="less" scoped>
  .lazy-image {
    background-position: center;
    background-size: cover;
    transition: background .2s ease-in;
  }
</style>
