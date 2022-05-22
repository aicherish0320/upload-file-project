<template>
  <div>
    <h1>UserCenter</h1>

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

    <el-button @click="uploadFile">上传</el-button>
  </div>
</template>

<script>
export default {
  name: 'UserCenter',
  data() {
    return {
      file: null,
      uploadProgress: 0,
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
            // .map(v => v.padStart(2, '0'))
            .join('')

          resolve(ret)
        }
        reader.readAsBinaryString(blob)
      })
    },
    async isGif(file) {
      // 前面6个16进制, '47 49 46 38 39 61' '47 49 46 38 37 61'
      // 16 进制的转换
      const ret = await this.blobToString(file.slice(0, 6))
      const isGif = ['474946383961', '474946383761'].indexOf(ret) > -1
      return isGif
    },
    async isImage(file) {
      // 通过文件流来判定
      // 1. 先判定 gif
      return await this.isGif(file)
    },
    async uploadFile() {
      if (!(await this.isImage(this.file))) {
        this.$message.warning('文件格式不正确')
        return
      }

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
