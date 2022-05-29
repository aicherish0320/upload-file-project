<template>
  <el-container>
    <el-header>
      <el-menu mode="horizontal">
        <el-menu-item>登录</el-menu-item>
        <el-menu-item>退出</el-menu-item>
        <el-menu-item>写文章</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <nuxt />
    </el-main>
    <el-footer></el-footer>
  </el-container>
</template>

<script>
export default {
  name: 'default',
}
</script>

<style lang="scss">
.kkb-container {
  width: 980px;
  height: 80vh;
  margin: 0 auto;
  background: #fff;
  padding: 20px;
}
.el-menu--horizontal > .el-menu-item.is-active {
  border: none;
}
</style>
