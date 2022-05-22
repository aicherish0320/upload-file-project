'use strict'

const { Service } = require('egg')
const nodeMailer = require('nodemailer')

const userEmail = '1741142595@qq.com'

const transporter = nodeMailer.createTransport({
  service: 'QQ',
  auth: {
    user: userEmail,
    pass: 'bpuzdmeityniejih'
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
}

module.exports = ToolService
