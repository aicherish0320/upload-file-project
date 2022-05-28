<template>
  <div>
    <div class="write-btn">
      <el-button type="primary" @click="submit">提交</el-button>
    </div>
    <el-row>
      <el-col :span="12">
        <textarea class="md-editor" :value="content" @input="update"></textarea>
      </el-col>
      <el-col :span="12">
        <div class="markdown-body" v-html="compiledContent"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { marked } from 'marked'
export default {
  name: 'NewEditor',
  data() {
    return {
      content: '# Marked in Node.js\n\nRendered by **marked**.',
    }
  },
  computed: {
    compiledContent() {
      return marked.parse(this.content)
    },
  },
  methods: {
    submit() {},
    update(e) {
      this.content = e.target.value
    },
  },
}
</script>

<style lang="scss" scoped>
.md-editor {
  width: 100%;
  height: 100vh;
  outline: none;
}
.write-btn {
  position: fixed;
  z-index: 100;
  right: 30px;
  top: 10px;
}
</style>
