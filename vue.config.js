const { defineConfig } = require('@vue/cli-service')
const fs = require('fs')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = defineConfig({
  publicPath: './',
  transpileDependencies: true,

  // 只配置 popup 页面
  pages: {
    popup: {
      entry: 'src/popup/main.js',
      template: 'src/popup/popup.html',
      filename: 'popup.html'
    }
  },
  filenameHashing: false,

  configureWebpack: {
    entry: {
      // 手动添加 content script 入口
      'content-script': './src/content-scripts/content-script.js',
      background: './src/background.js'
    },
    output: {
      filename: (chunkData) => {
        // content-script 和 background 输出到根目录
        if (chunkData.chunk.name === 'content-script') {
          return 'content-script.js'
        }
        if (chunkData.chunk.name === 'background') {
          return 'js/background.js'
        }
        // popup 相关的 js
        if (chunkData.chunk.name === 'popup') {
          return 'js/popup.js'
        }
        return 'js/[name].js'
      }
    },
    optimization: {
      splitChunks: false, // 禁止代码分割
      runtimeChunk: false // 禁止运行时代码分割
    },
    plugins: [
      // 复制 manifest.json
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/manifest.json',
            to: 'manifest.json'
          }
        ]
      }),
      // 自动复制 _locales 文件夹
      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('CopyLocalesPlugin', () => {
            const sourcePath = path.resolve(__dirname, '_locales')
            const targetPath = path.resolve(__dirname, 'dist/_locales')

            if (fs.existsSync(sourcePath)) {
              if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(targetPath, { recursive: true })
              }

              const locales = fs.readdirSync(sourcePath)
              locales.forEach(locale => {
                const localeSource = path.join(sourcePath, locale)
                const localeTarget = path.join(targetPath, locale)

                if (fs.statSync(localeSource).isDirectory()) {
                  if (!fs.existsSync(localeTarget)) {
                    fs.mkdirSync(localeTarget, { recursive: true })
                  }

                  const messagesSource = path.join(localeSource, 'messages.json')
                  const messagesTarget = path.join(localeTarget, 'messages.json')

                  if (fs.existsSync(messagesSource)) {
                    fs.copyFileSync(messagesSource, messagesTarget)
                    console.log(`✓ Copied ${locale}/messages.json`)
                  }
                }
              })
              console.log('✓ Locales copied successfully')
            }
          })
        }
      }
    ]
  },

  chainWebpack: config => {
    // 删除默认的代码分割配置
    config.optimization.delete('splitChunks')

    // 确保 content script 不会被内联
    config.module
      .rule('js')
      .exclude
      .add(/content-script\.js$/)
  },

  productionSourceMap: false,

  css: {
    extract: false // CSS 内联到 JS 中
  },

  // 移除 browserExtension 插件配置，改用手动配置
  pluginOptions: {}
})
