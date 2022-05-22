'use strict'

const jwt = require('jsonwebtoken')

module.exports = ({ app }) => {
  return async function verify(ctx, next) {
    if (!ctx.request.header.authorization) {
      ctx.body = {
        code: -1,
        message: '用户未登录'
      }
      return
    }
    const token = ctx.request.header.authorization.replace('Bearer ', '')
    try {
      const ret = await jwt.verify(token, app.config.jwt.secret)
      console.log('ret >>> ', ret)
      ctx.state.email = ret.email
      ctx.state.userId = ret._id
      await next()
    } catch (error) {
      ctx.body = {
        code: -1,
        message: '用户未登录'
      }
    }
  }
}
