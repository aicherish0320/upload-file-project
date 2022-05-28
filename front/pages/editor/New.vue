<template>
  <div>
    <div class="write-btn">
      <el-button type="primary" @click="submit">提交</el-button>
    </div>
    <el-row>
      <el-col :span="12">
        <textarea
          ref="editor"
          class="md-editor"
          :value="content"
          @input="update"
        ></textarea>
      </el-col>
      <el-col :span="12">
        <div class="markdown-body" v-html="compiledContent"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { marked } from 'marked'
import hljs from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/monokai-sublime.css'
export default {
  name: 'NewEditor',
  data() {
    return {
      content: '# Marked in Node.js',
    }
  },
  computed: {
    compiledContent() {
      return marked.parse(this.content)
    },
  },
  mounted() {
    this.timer = null
    this.bindEvents()

    marked.setOptions({
      renderer: new marked.Renderer(),
      highlight: function (code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext'
        return hljs.highlight(code, { language }).value
      },
    })
  },
  methods: {
    bindEvents() {
      this.$refs.editor.addEventListener('paste', async (e) => {
        const files = e.clipboardData.files
      })
      this.$refs.editor.addEventListener('drop', (e) => {
        console.log('e >>> ', e.dataTransfer.files)
        e.preventDefault()
      })
    },
    submit() {},
    update(e) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.content = e.target.value
      }, 300)
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
