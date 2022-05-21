'use strict'

const { Controller } = require('egg')

class BaseController extends Controller {
  success(data) {
    const { ctx } = this
    ctx.body = {
      code: 0,
      data
    }
  }
  message(message) {
    const { ctx } = this
    ctx.body = {
      code: 0,
      message
    }
  }
  error(message, code = -1, errors = {}) {
    const { ctx } = this
    ctx.body = {
      code,
      message,
      errors
    }
  }
}

module.exports = BaseController
