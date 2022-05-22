<template>
  <div class="login-container">
    <el-form
      class="login-form"
      label-width="100px"
      :model="form"
      :rules="rules"
      ref="loginForm"
    >
      <el-form-item prop="email" label="邮箱">
        <el-input placeholder="请输入邮箱" v-model="form.email"></el-input>
      </el-form-item>
      <el-form-item prop="captcha" label="验证码" class="captcha-container">
        <div class="captcha">
          <img :src="code.captcha" alt="captcha" @click="resetCaptcha" />
        </div>
        <el-input placeholder="请输入验证码" v-model="form.captcha"></el-input>
      </el-form-item>
      <el-form-item prop="emailCode" label="验证码" class="captcha-container">
        <div class="captcha">
          <el-button
            type="primary"
            @click="sendEmailCode"
            :disabled="send.timer > 0"
            >{{ sendText }}</el-button
          >
        </div>
        <el-input
          placeholder="请输入验证码"
          v-model="form.emailCode"
        ></el-input>
      </el-form-item>
      <el-form-item prop="password" label="密码">
        <el-input
          type="password"
          placeholder="请输入密码"
          v-model="form.password"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click.native.prevent="handleLogin"
          >登录</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import md5 from 'md5'
export default {
  name: 'LoginPage',
  layout: 'login',
  data() {
    return {
      send: {
        timer: 0,
      },
      form: {
        email: 'aicherish0320@163.com',
        password: '12345',
        captcha: '',
      },
      rules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
          },
        ],
        captcha: [
          {
            required: true,
            message: '请输入验证码',
          },
        ],
        emailCode: [
          {
            required: true,
            message: '请输入邮件验证码',
          },
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
          },
        ],
      },
      code: {
        captcha: `/api/captcha?_t=${new Date().getTime()}`,
      },
    }
  },
  computed: {
    sendText() {
      return this.send.timer <= 0 ? '发送' : `${this.send.timer}后发送`
    },
  },
  methods: {
    updateCaptcha() {
      this.captchaUrl = `/api/captcha?_t=${new Date().getTime()}`
    },
    handleLogin() {
      const { form } = this
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          // TODO 注册
          let params = {
            email: form.email,
            password: md5(form.password),
            captcha: form.captcha,
            emailCode: form.emailCode,
          }
          let ret = await this.$http.post('/user/login', params)
          console.log(ret)
          if (ret.code === 0) {
            this.$message.success('登录成功')
            setTimeout(() => {
              this.$router.push('/')
            }, 500)
          } else {
            this.$message.error(ret.message)
          }
        } else {
          console.log('校验失败')
        }
      })
    },
    resetCaptcha() {
      this.code.captcha = `/api/captcha?_t=${new Date().getTime()}`
    },
    async sendEmailCode() {
      const ret = await this.$http.get(`/sendCode?email=${this.form.email}`)
      if (ret.code === 0) {
        this.$message.success('邮箱验证码发送成功')
      } else {
        this.$message.success('邮箱验证码发送失败，请稍后重试')
        return
      }
      this.send.timer = 5
      this.timer = setInterval(() => {
        this.send.timer--
        if (this.send.timer === 0) {
          clearInterval(this.timer)
        }
      }, 1000)
    },
  },
}
</script>

<style lang="scss" scoped></style>
