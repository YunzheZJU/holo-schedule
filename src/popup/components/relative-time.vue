<template>
  <div :title="new Date(time)">{{ calculate() }}</div>
</template>

<script>
  export default {
    name: 'RelativeTime',
    props: {
      time: {
        type: String,
        required: true,
      },
    },
    methods: {
      calculate() {
        const current = new Date().getTime()
        const previous = new Date(this.time).getTime()

        const msPerSecond = 1000
        const msPerMinute = msPerSecond * 60
        const msPerHour = msPerMinute * 60
        const msPerDay = msPerHour * 24
        const msPerMonth = msPerDay * 30
        const msPerYear = msPerDay * 365

        const elapsed = current - previous

        if (elapsed < msPerMinute) {
          const number = Math.floor(elapsed / msPerSecond)
          setTimeout(() => this.$forceUpdate(), (number + 1) * msPerSecond - elapsed + 1)
          return `${number} second${number > 1 ? 's' : ''} ago`
        } if (elapsed < msPerHour) {
          const number = Math.floor(elapsed / msPerMinute)
          setTimeout(() => this.$forceUpdate(), (number + 1) * msPerMinute - elapsed + 1)
          return `${number} minute${number > 1 ? 's' : ''} ago`
        } if (elapsed < msPerDay) {
          const number = Math.floor(elapsed / msPerHour)
          setTimeout(() => this.$forceUpdate(), (number + 1) * msPerHour - elapsed + 1)
          return `${number} hour${number > 1 ? 's' : ''} ago`
        } if (elapsed < msPerMonth) {
          const number = Math.floor(elapsed / msPerDay)
          setTimeout(() => this.$forceUpdate(), (number + 1) * msPerDay - elapsed + 1)
          return `${number} day${number > 1 ? 's' : ''} ago`
        } if (elapsed < msPerYear) {
          const number = Math.floor(elapsed / msPerMonth)
          setTimeout(() => this.$forceUpdate(), (number + 1) * msPerMonth - elapsed + 1)
          return `${number} month${number > 1 ? 's' : ''} ago`
        }
        const number = Math.floor(elapsed / msPerYear)
        setTimeout(() => this.$forceUpdate(), (number + 1) * msPerYear - elapsed + 1)
        return `${number} year${number > 1 ? 's' : ''} ago`
      },
    },
  }
</script>

<style scoped>

</style>
