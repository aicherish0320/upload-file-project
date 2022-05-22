'use strict'

const svgCaptcha = require('svg-captcha')
const BaseController = require('./base')

class UtilController extends BaseController {
  async captcha() {
    const { ctx } = this
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
      noise: 3
    })

    ctx.session.captcha = captcha.text
    ctx.response.type = 'image/svg+xml'
    ctx.body = captcha.data
  }

  async sendCode() {
    const { ctx } = this
    const email = ctx.query.email
    const code = Math.random().toString().slice(2, 6)
    ctx.session.emailCode = code

    const subject = '爱鹊絮验证码'
    const text = ''
    const html = `<h2>爱鹊絮社区</h2><span>${code}</span>`
    const hasSend = await this.service.tools.sendMail(
      email,
      subject,
      text,
      html
    )
    if (hasSend) {
      this.message('发送成功')
    } else {
      this.error('发送失败')
    }
  }
}

module.exports = UtilController
