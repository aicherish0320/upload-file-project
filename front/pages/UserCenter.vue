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
    async uploadFile() {
      const form = new FormData()
      form.append('file', this.file)
      const ret = await this.$http.post('/uploadFile', form, {
        onUploadProgress: (progress) => {
          this.uploadProgress = Number(
            ((progress.loaded / progress.total) * 100).toFixed(2)
          )
        },
      })
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
