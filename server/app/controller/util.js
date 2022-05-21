'use strict'

const Controller = require('egg').Controller
const svgCaptcha = require('svg-captcha')

class UtilController extends Controller {
  async captcha() {
    const { ctx } = this
    const captcha = svgCaptcha.create()
    ctx.body = 'hi, ' + captcha.text
  }
}

module.exports = UtilController
