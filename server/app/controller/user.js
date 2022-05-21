'use strict'

const BaseController = require('./base')

class UserController extends BaseController {
  async login() {
    const { ctx } = this
    ctx.body = 'hi, login'
  }
  async register() {
    const { ctx } = this
    ctx.body = 'hi, register'
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
