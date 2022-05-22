<template>
  <div class="login-container">
    <el-form
      class="login-form"
      label-width="100px"
      :model="form"
      :rules="rules"
      ref="registerForm"
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
      <el-form-item prop="nickname" label="昵称">
        <el-input placeholder="请输入昵称" v-model="form.nickname"></el-input>
      </el-form-item>
      <el-form-item prop="password" label="密码">
        <el-input
          type="password"
          placeholder="请输入密码"
          v-model="form.password"
        ></el-input>
      </el-form-item>
      <el-form-item prop="rePassword" label="确认密码">
        <el-input
          type="password"
          placeholder="请再次输入密码"
          v-model="form.rePassword"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click.native.prevent="handleRegister"
          >注册</el-button
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
      form: {
        email: 'aic@aic.com',
        nickname: '爱鹊絮',
        password: '12345',
        rePassword: '12345',
        captcha: '',
      },
      rules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
          },
        ],
        nickname: [
          {
            required: true,
            message: '请输入昵称',
          },
        ],
        captcha: [
          {
            required: true,
            message: '请输入验证码',
          },
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
          },
        ],
        rePassword: [
          {
            required: true,
            message: '请再次输入密码',
          },
          {
            validator: (_, value, callback) => {
              if (value !== this.form.password) {
                callback(new Error('两次输入的密码不一致'))
              } else {
                callback()
              }
            },
          },
        ],
      },
      code: {
        captcha: `/api/captcha?_t=${new Date().getTime()}`,
      },
    }
  },
  methods: {
    updateCaptcha() {
      this.captchaUrl = `/api/captcha?_t=${new Date().getTime()}`
    },
    handleRegister() {
      const { form } = this
      this.$refs.registerForm.validate(async (valid) => {
        if (valid) {
          // TODO 注册
          let params = {
            email: form.email,
            nickname: form.nickname,
            password: md5(form.password),
            captcha: form.captcha,
          }
          let ret = await this.$http.post('/user/register', params)
          console.log(ret)
          if (ret.code === 0) {
            this.$alert('注册成功', '成功', {
              confirmButtonText: '去登录',
              callback: () => {
                this.$router.push('/loginpage')
              },
            })
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
  },
}
</script>

<style lang="scss" scoped></style>
