<template>
  <div>
    <el-form class="login-form" :rules="rules">
      <el-form-item props="email">
        <span>
          <i class="el-icon-mobile"></i>
        </span>
        <el-input placeholder="邮箱"></el-input>
      </el-form-item>
      <el-form-item props="password">
        <span>
          <i class="el-icon-lock"></i>
        </span>
        <el-input placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item props="captcha">
        <el-input placeholder="验证码"></el-input>
        <img @click="updateCaptcha" :src="captchaUrl" alt="captcha" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  layout: 'login',
  data() {
    return {
      rules: {
        email: [],
        password: [],
      },
      captchaUrl: `/api/captcha?_t=${new Date().getTime()}`,
    }
  },
  methods: {
    updateCaptcha() {
      this.captchaUrl = `/api/captcha?_t=${new Date().getTime()}`
    },
  },
}
</script>

<style lang="scss" scoped>
.login-form {
  width: 800px;
  margin: 50px auto;
}
</style>
