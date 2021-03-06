'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller } = app
  const jwt = app.middleware.jwt({ app })

  router.get('/', controller.home.index)
  // 验证码
  router.get('/captcha', controller.util.captcha)
  router.get('/sendCode', controller.util.sendCode)
  // 文件上传
  router.post('/uploadFile', controller.util.uploadFile)
  router.post('/mergeFile', controller.util.mergeFile)
  router.post('/checkFile', controller.util.checkFile)

  router.group(
    {
      name: 'user',
      prefix: '/user'
    },
    (router) => {
      const { info, register, login, verify } = controller.user
      router.post('/register', register)
      router.post('/login', login)
      router.get('/verify', verify)

      router.get('/info', jwt, info)
    }
  )
}
