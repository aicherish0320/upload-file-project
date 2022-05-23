<template>
  <div>
    <h1>用户中心</h1>

    <div ref="drag" id="drag">
      <input type="file" name="file" @change="handleFileChange" />
    </div>

    <div>
      <el-progress
        :stroke-width="20"
        :text-inside="true"
        :percentage="uploadProgress"
      ></el-progress>
    </div>
    <div>
      <p>计算哈希进度</p>
      <el-progress
        :stroke-width="20"
        :text-inside="true"
        :percentage="hashProgress"
      ></el-progress>
    </div>

    <el-button @click="uploadFile">上传</el-button>
  </div>
</template>

<script>
const CHUNK_SIZE = 1 * 1024 * 1024
import { read } from 'fs'
import sparkMD5 from 'spark-md5'
export default {
  name: 'UserCenter',
  data() {
    return {
      file: null,
      uploadProgress: 0,
      hashProgress: 0,
    }
  },
  async mounted() {
    await this.$http.get('/user/info')

    this.bindEvents()
  },
  methods: {
    handleFileChange(e) {
      const [file] = e.target.files
      if (!file) return
      this.file = file
    },
    async blobToString(blob) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = function () {
          const ret = reader.result
            .split('')
            .map((v) => {
              const r = v.charCodeAt()
              return r
            })
            .map((v) => {
              const r = v.toString(16).toUpperCase()
              return r
            })
            .map((v) => v.padStart(2, '0'))
            .join(' ')

          resolve(ret)
        }
        reader.readAsBinaryString(blob)
      })
    },
    async isGif(file) {
      // 前面6个16进制, '47 49 46 38 39 61' '47 49 46 38 37 61'
      // 16 进制的转换
      const ret = await this.blobToString(file.slice(0, 6))
      const isGif = ['47 49 46 38 39 61', '47 49 46 38 37 61'].indexOf(ret) > -1
      return isGif
    },
    async isPng(file) {
      const ret = await this.blobToString(file.slice(0, 8))
      const isPng = ret === '89 50 4E 47 D A 1A 0A'
      return isPng
    },
    async isJpg(file) {
      const len = file.size
      const start = await this.blobToString(file.slice(0, 2))
      const tail = await this.blobToString(file.slice(-2, len))
      const isJpg = start === 'FF D8' && tail === 'FF D9'
      return isJpg
    },
    async isImage(file) {
      // 通过文件流来判定
      // 1. 先判定 gif
      return (
        (await this.isGif(file)) ||
        (await this.isPng(file)) ||
        (await this.isJpg(file))
      )
    },
    createFileChunk(file, size = CHUNK_SIZE) {
      const chunks = []
      let cur = 0
      while (cur < file.size) {
        chunks.push({ index: cur, file: file.slice(cur, cur + size) })
        cur += size
      }
      return chunks
    },
    async calculateHashWorker() {
      return new Promise((resolve) => {
        this.worker = new Worker('/hash.js')
        this.worker.postMessage({
          chunks: this.chunks,
        })
        this.worker.onmessage = (e) => {
          const { progress, hash } = e.data

          this.hashProgress = Number(progress.toFixed(2))
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    async calculateHashIdle() {
      const chunks = this.chunks
      return new Promise((resolve) => {
        const spark = new sparkMD5.ArrayBuffer()
        let count = 0
        console.log('chunks.length >>> ', chunks.length)
        const appendToSpark = async (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = (e) => {
              spark.append(e.target.result)
              resolve()
            }
          })
        }
        const workLoop = async (deadline) => {
          //timeRemaining: 它用来表示当前闲置周期的预估剩余毫秒数
          while (count < chunks.length && deadline.timeRemaining() > 1) {
            await appendToSpark(chunks[count].file)
            count++
            if (count < chunks.length) {
              this.hashProgress = Number(
                ((100 * count) / chunks.length).toFixed(2)
              )
            } else {
              this.hashProgress = 100
              return resolve(spark.end())
            }
          }
          window.requestIdleCallback(workLoop)
        }
        window.requestIdleCallback(workLoop)
      })
    },
    async calculateHashSample() {
      // 判断一个数据存在与否
      return new Promise((resolve) => {
        const spark = new sparkMD5.ArrayBuffer()
        const reader = new FileReader()

        const file = this.file
        const size = file.size

        const offset = 2 * 1024 * 1024

        // 第一个区块、最后一个区块，中间取前中后2个字节
        let chunks = [file.slice(0, offset)]
        let cur = offset
        while (cur < size) {
          // 最后一个区块
          if (cur + offset >= size) {
            chunks.push(file.slice(cur, cur + offset))
          } else {
            // 中间的区块
            const mid = (cur + offset) / 2
            const end = cur + offset
            chunks.push(file.slice(cur, cur + 2))
            chunks.push(file.slice(mid, mid + 2))
            chunks.push(file.slice(end - 2, end))
          }
          cur += offset
        }
        reader.readAsArrayBuffer(new Blob(chunks))
        reader.onload = (e) => {
          spark.append(e.target.result)
          this.hashProgress = 100
          resolve(spark.end())
        }
      })
    },
    async uploadFile() {
      // if (!(await this.isImage(this.file))) {
      //   this.$message.warning('文件格式不正确')
      //   return
      // }

      this.chunks = this.createFileChunk(this.file)
      // 文件的唯一标识，
      // const hash = await this.calculateHashWorker()
      // const hash2 = await this.calculateHashIdle()

      return

      const form = new FormData()
      form.append('file', this.file)
      const ret = await this.$http.post('/uploadFile', form, {
        onUploadProgress: (progress) => {
          this.uploadProgress = Number(
            ((progress.loaded / progress.total) * 100).toFixed(2)
          )
        },
      })
      if (ret.code === 0) {
        this.$message.success('图片上传成功')
      }
    },
    bindEvents() {
      const drag = this.$refs.drag
      drag.addEventListener('dragover', (e) => {
        drag.style.borderColor = 'red'
        e.preventDefault()
      })
      drag.addEventListener('drop', (e) => {
        const fileList = e.dataTransfer.files
        this.file = fileList[0]
        e.preventDefault()
      })
      drag.addEventListener('dragleave', (e) => {
        drag.style.borderColor = '#eee'
        e.preventDefault()
      })
    },
  },
}
</script>

<style lang="scss" scoped>
#drag {
  height: 100px;
  line-height: 100px;
  border: 2px dashed #eee;
  text-align: center;
  // &:hover {
  //   border-color: red;
  // }
}
</style>
