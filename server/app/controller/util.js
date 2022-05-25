'use strict'

const fse = require('fs-extra')
const path = require('path')
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
  async mergeFile() {
    const { ctx } = this
    const { ext, size, hash } = this.ctx.request.body
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    await ctx.service.tools.mergeFile(filePath, hash, size)
    this.success({
      url: `/public/${hash}.${ext}`
    })
  }
  async checkFile() {
    const { ctx } = this
    const { ext, hash } = ctx.request.body
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    let uploaded = false
    let uploadedList = []
    if (fse.existsSync(filePath)) {
      // 文件存在
      uploaded = true
    } else {
      uploadedList = await this.getUploadedList(
        path.resolve(this.config.UPLOAD_DIR, hash)
      )
    }
    this.success({
      uploaded,
      uploadedList
    })
  }
  async getUploadedList(dirPath) {
    return fse.existsSync(dirPath)
      ? fse.readdir(dirPath).filter((name) => name[0] !== '.')
      : []
  }
  // 分片上传
  async uploadFile() {
    const { ctx } = this
    const file = ctx.request.files[0]
    const { hash, name } = ctx.request.body
    // .../public/bb45e99c760ca275856c62440a3ab3c5
    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash)
    if (!fse.existsSync(chunkPath)) {
      await fse.mkdir(chunkPath)
    }
    await fse.move(file.filepath, `${chunkPath}/${name}`)
    this.message('切片上传成功')
  }

  // async uploadFile() {
  //   const { ctx } = this
  //   const file = ctx.request.files[0]
  //   await fse.move(file.filepath, `${this.config.UPLOAD_DIR}/${file.filename}`)
  //   this.success({ url: `/public/${file.filename}` })
  // }
}

module.exports = UtilController
