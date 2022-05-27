<template>
  <div>
    <h1>用户中心</h1>

    <div ref="drag" id="drag">
      <input type="file" name="file" @change="handleFileChange" />
    </div>

    <div>
      <!-- <el-progress
        :stroke-width="20"
        :text-inside="true"
        :percentage="uploadProgress"
      ></el-progress> -->
    </div>
    <!-- <div>
      <p>计算哈希进度</p>
      <el-progress
        :stroke-width="20"
        :text-inside="true"
        :percentage="hashProgress"
      ></el-progress>
    </div> -->

    <div>
      <div class="cube-container" :style="{ width: cubeWidth + 'px' }">
        <div class="cube" v-for="chunk in chunks" :key="chunk.name">
          <div
            :class="{
              uploading: chunk.progress > 0 && chunk.progress < 100,
              success: chunk.progress === 100,
              error: chunk.progress < 0,
            }"
            :style="{ height: chunk.progress + '%' }"
          >
            <i
              v-if="chunk.progress > 0 && chunk.progress < 100"
              class="el-icon-loading"
              style="color: #0f0"
            ></i>
          </div>
        </div>
      </div>
    </div>

    <el-button @click="uploadFile">上传</el-button>
  </div>
</template>

<script>
const CHUNK_SIZE = 5 * 1024 * 1024
import sparkMD5 from 'spark-md5'
export default {
  name: 'UserCenter',
  data() {
    return {
      file: null,
      // uploadProgress: 0,
      hashProgress: 0,
      chunks: [],
    }
  },
  computed: {
    cubeWidth() {
      return Math.ceil(Math.sqrt(this.chunks.length)) * 16
    },
    uploadProgress() {
      if (!this.file || this.chunks.length) {
        return 0
      }
      const loaded = this.chunks
        .map((item) => item.chunk.size * item.progress)
        .reduce((acc, cur) => acc + cur, 0)
      return Number((loaded / this.file.size).toFixed(2))
    },
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
    /**
     * 创建文件碎片
     * @param {File} file file
     * @param {Number} size 文件碎片大小
     */
    createFileChunk(file, size = CHUNK_SIZE) {
      const chunks = []
      let cur = 0
      while (cur < file.size) {
        chunks.push({ index: cur, file: file.slice(cur, cur + size) })
        cur += size
      }
      return chunks
    },
    /**
     * 通过 WebWorker 计算文件 hash
     * @param {Array} chunks 文件碎片数组
     */
    async calculateHashWorker(chunks) {
      return new Promise((resolve) => {
        this.worker = new Worker('/hash.js')
        this.worker.postMessage({
          chunks,
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
    async uploadChunks(uploadedList) {
      const requests = this.chunks
        .filter((chunk) => uploadedList.indexOf(chunk.name) === -1)
        .map((chunk, index) => {
          // 转成 promise
          const form = new FormData()
          form.append('chunk', chunk.chunk)
          form.append('hash', chunk.hash)
          form.append('name', chunk.name)
          return form
        })
        .map((form, index) =>
          this.$http.post('/uploadFile', form, {
            onUploadProgress: (progress) => {
              this.chunks[index].progress = Number(
                ((progress.loaded / progress.total) * 100).toFixed(2)
              )
            },
          })
        )
      await Promise.all(requests)
      await this.mergeRequest()
    },
    async mergeRequest() {
      this.$http.post('/mergeFile', {
        ext: this.file.name.split('.').pop(),
        size: CHUNK_SIZE,
        hash: this.hash,
      })
    },
    async uploadFile() {
      // if (!(await this.isImage(this.file))) {
      //   this.$message.warning('文件格式不正确')
      //   return
      // }

      const chunks = this.createFileChunk(this.file)
      // 文件的唯一标识，
      // const hash2 = await this.calculateHashIdle()
      const hash = (this.hash = await this.calculateHashWorker(chunks))

      // 秒传，问一下后端 文件是否上传过，如果没有，是否存在切片
      const resp = await this.$http.post('/checkFile', {
        hash: this.hash,
        ext: this.file.name.split('.').pop(),
      })
      const { uploaded, uploadedList } = resp.data

      if (uploaded) {
        // 秒传
        return this.$message.success('秒传成功')
      }

      this.chunks = chunks.map((chunk, index) => {
        // 文件的名称 hash + index
        const name = hash + '-' + index
        return {
          hash,
          name,
          index,
          chunk: chunk.file,
          // 设置进度条 已经上传的 设为 100
          progress: uploadedList.indexOf(name) > -1 ? 100 : 0,
        }
      })
      await this.uploadChunks(uploadedList)

      // const form = new FormData()
      // form.append('file', this.file)
      // const ret = await this.$http.post('/uploadFile', form, {
      //   onUploadProgress: (progress) => {
      //     this.uploadProgress = Number(
      //       ((progress.loaded / progress.total) * 100).toFixed(2)
      //     )
      //   },
      // })
      // if (ret.code === 0) {
      //   this.$message.success('图片上传成功')
      // }
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
}
.cube-container {
  overflow: hidden;
  .cube {
    width: 14px;
    height: 14px;
    line-height: 12px;
    border: 1px solid rgb(46, 45, 45);
    background: #eee;
    float: left;
    .success {
      background: green;
    }
    .uploading {
      background: cyan;
    }
    .error {
      background: red;
    }
  }
}
</style>
