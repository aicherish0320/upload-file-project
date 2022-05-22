import Vue from 'vue'
import axios from 'axios'
import { MessageBox } from 'element-ui'

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export default ({ store, redirect }) => {
  service.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('upload_file_token')
    if (token) {
      config.headers.common['Authorization'] = `Bearer ${token}`
    }
    return config
  })

  service.interceptors.response.use(async (response) => {
    const { data } = response
    // 简单处理
    if (data.message === '用户未登录') {
      MessageBox.confirm('登录已过期', '过期', {
        confirmButtonText: '登录',
        showCancelButton: false,
        type: 'warning',
      }).then(() => {
        localStorage.removeItem('upload_file_token')
        // 跳转到登录页
        redirect({ path: 'loginpage' })
      })
    }

    return data
  })
}

Vue.prototype.$http = service

export const http = service
