'use strict'

const { Service } = require('egg')
const fse = require('fs-extra')
const path = require('path')
const nodeMailer = require('nodemailer')

const userEmail = '1741142595@qq.com'

const transporter = nodeMailer.createTransport({
  service: 'QQ',
  auth: {
    user: userEmail,
    pass: 'fkkfxjkpjetuhiij'
  }
})

class ToolService extends Service {
  async sendMail(email, subject, text, html) {
    const mailOptions = {
      from: userEmail,
      to: email,
      subject,
      text,
      html
    }
    try {
      return await transporter.sendMail(mailOptions)
    } catch (error) {
      console.log(error)
    }
  }
  async mergeFile(filePath, fileHash, size) {
    const chunkDir = path.resolve(this.config.UPLOAD_DIR, fileHash)
    let chunks = await fse.readdir(chunkDir)
    chunks.sort((a, b) => a.split('-')[1] - b.split('-')[1])
    chunks = chunks.map((cp) => path.resolve(chunkDir, cp))
    await this.mergeChunks(chunks, filePath, size)
  }
  async mergeChunks(files, dest, size) {
    const pipeStream = (filePath, writeStream) =>
      new Promise((resolve) => {
        const readStream = fse.createReadStream(filePath)
        readStream.on('end', () => {
          fse.unlinkSync(filePath)
          resolve()
        })
        readStream.pipe(writeStream)
      })
    await Promise.all(
      files.map((file, index) => {
        return pipeStream(
          file,
          fse.createWriteStream(dest, {
            start: index * size,
            end: (index + 1) * size
          })
        )
      })
    )
  }
}

module.exports = ToolService
