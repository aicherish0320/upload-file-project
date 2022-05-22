'use strict'

const BaseController = require('./base')

const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  password: { type: 'string' },
  captcha: { type: 'string' }
}

class UserController extends BaseController {
  async login() {
    const { ctx } = this
    ctx.body = 'hi, login'
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
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      this.error('验证码错误')
      return
    }
    this.success({ nickname })
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
