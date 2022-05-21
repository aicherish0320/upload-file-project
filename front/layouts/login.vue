<template>
  <div>
    <div>导航</div>
    <nuxt />
    <div>底部信息</div>
  </div>
</template>

<script>
export default {
  name: 'login',
}
</script>

<style lang="scss">
.login-container {
  width: 100%;
  min-height: 100%;
  .login-form {
    width: 520px;
    padding: 160px 0;
    margin: 0 auto;
    overflow: hidden;
    .captcha-container {
      position: relative;
      width: 340px;
      .captcha {
        position: absolute;
        right: -110px;
        img {
          width: 100px;
          height: 40px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
