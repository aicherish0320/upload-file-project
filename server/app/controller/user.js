'use strict'

const md5 = require('md5')
const jwt = require('jsonwebtoken')
const BaseController = require('./base')

const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  password: { type: 'string' },
  captcha: { type: 'string' }
}
const HashSalt = 'aicherish0320'

class UserController extends BaseController {
  async login() {
    const { ctx, app } = this
    const { email, password, captcha, emailCode } = ctx.request.body
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      this.error('验证码错误')
      return false
    }

    if (emailCode !== ctx.session.emailCode) {
      this.error('邮箱验证码错误')
      return false
    }
    const user = await ctx.model.User.findOne({
      email,
      password: md5(password + HashSalt)
    })
    if (!user) {
      this.error('用户名或密码错误')
    }
    // 用户信息加密成token
    const token = jwt.sign(
      {
        id: user._id,
        email
      },
      app.config.jwt.secret,
      {
        expiresIn: '1h'
      }
    )
    this.success({ token, email, nickname: user.nickname })
  }
  async register() {
    const { ctx } = this
    try {
      // 校验传递的参数
      ctx.validate(createRule)
    } catch (error) {
      return this.error(`参数校验失败：${error}`)
    }
    const { email, password, captcha, nickname } = ctx.request.body
    // 验证码验证
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      this.error('验证码错误')
      return false
    }
    // 邮箱验证
    if (await this.checkEmail(email)) {
      this.error('邮箱重复了')
      return false
    }
    const ret = await ctx.model.User.create({
      email,
      nickname,
      password: md5(password + HashSalt)
    })
    console.log(ret)
    if (ret._id) {
      this.message('注册成功')
    }
  }
  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email })
    return user
  }
  async verify() {
    const { ctx } = this
    ctx.body = 'hi, verify'
  }
  async info() {
    const { ctx } = this
    ctx.body = 'hi, info'
  }
}

module.exports = UserController
