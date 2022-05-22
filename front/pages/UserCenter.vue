<template>
  <div>
    <h1>UserCenter</h1>
    <input type="file" name="file" @change="handleFileChange" />
    <el-button @click="uploadFile">上传</el-button>
  </div>
</template>

<script>
export default {
  name: 'UserCenter',
  data() {
    return {
      file: null,
    }
  },
  async mounted() {
    await this.$http.get('/user/info')
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
      const ret = await this.$http.post('/uploadFile', form)
    },
  },
}
</script>

<style lang="scss" scoped></style>
