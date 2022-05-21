import Vue from 'vue'
import axios from 'axios'

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

Vue.prototype.$http = service

export const http = service
