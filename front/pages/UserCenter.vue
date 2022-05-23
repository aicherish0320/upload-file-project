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
    async calculateHashIdle() {},
    async uploadFile() {
      // if (!(await this.isImage(this.file))) {
      //   this.$message.warning('文件格式不正确')
      //   return
      // }

      this.chunks = this.createFileChunk(this.file)
      // 文件的唯一标识，
      const hash = await this.calculateHashWorker()
      console.log('hash >>> ', hash)

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
