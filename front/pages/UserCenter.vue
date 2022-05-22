<template>
  <div>
    <h1>UserCenter</h1>
  </div>
</template>

<script>
export default {
  name: 'UserCenter',
  async mounted() {
    const ret = await this.$http.get('/user/info')
    console.log('ret >>> ', ret)
  },
}
</script>

<style lang="scss" scoped></style>
