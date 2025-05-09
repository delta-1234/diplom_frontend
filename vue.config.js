const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
})
module.exports = {
  lintOnSave: false // 关闭开发时的实时 ESLint 检查
}