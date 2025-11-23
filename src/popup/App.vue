<template>
  <div class="popup-container">
    <h1 class="title">B站小助手</h1>

    <div class="popup-buttons">
      <el-button class="btn-blue" @click="getVideoInfo">获取视频信息</el-button>
      <el-button class="btn-pink" @click="openFloatingBox">打开悬浮窗</el-button>
    </div>

    <p class="footer">by EL233</p>
  </div>
</template>

<script>
export default {
  methods: {
    send (action) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action })
      })
    },
    getVideoInfo () {
      this.send('get_video_info')
    },
    openFloatingBox () {
      this.send('open_floating_box')
    }
  }
}
</script>

<style scoped>
.popup-container {
  width: 280px;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #00a1d6;
  width: 100%;
  text-align: center;
}

.popup-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.popup-buttons .el-button {
  width: 100%;
  text-align: center !important;  /* 文本居中对齐 */
  color: #fff !important;
  font-weight: bold;
  border: none;
  padding: 12px !important;  /* 统一内边距 */
  margin: 0 !important;  /* 清除默认外边距 */
  display: block !important;  /* 确保按钮为块级元素 */
  box-sizing: border-box !important;  /* 包含边框和内边距在宽度内 */
  transition: background-color 0.2s !important;
}

/* 覆盖 Element UI 按钮内部 span 的样式 */
.popup-buttons .el-button > span {
  display: block !important;
  text-align: center !important;
  width: 100% !important;
}

.btn-blue {
  background-color: #00a1d6 !important;
}

.btn-blue:hover {
  background-color: #00a1d6 !important;
}

.btn-blue:active {
  background-color: #0086b3 !important;
}

.btn-pink {
  background-color: #ff6699 !important;
}

.btn-pink:hover {
  background-color: #ff6699 !important;
}

.btn-pink:active {
  background-color: #e64d85 !important;
}

.footer {
  font-size: 12px;
  text-align: center;
  margin-top: 12px;
  color: #999;
  width: 100%;
}
</style>
