<template>
  <div class="popup-container">
    <h1 class="title">B站小助手</h1>

    <button class="btn blue" @click="getVideoInfo">获取视频信息</button>
    <button class="btn pink" @click="openFloatingBox">打开悬浮窗（更多功能）</button>

    <p class="footer">by EL233</p>
  </div>
</template>

<script>
export default {
  methods: {
    send (action) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action },
          (response) => {
            console.log('content-script 回复：', response)
            if (action === 'get_video_info' && response?.info) {
              alert(
                `UP主: ${response.info.upName}\n粉丝数: ${response.info.follower}\nBV号: ${response.info.bvid}\n标题: ${response.info.title}\n播放量: ${response.info.view}\n评论数: ${response.info.reply}`
              )
            }
          }
        )
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

<style>
.popup-container {
  width: 280px;
  padding: 16px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial;
  background: #ffffff;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #00a1d6; /* B站蓝 */
  text-align: center;
}

.btn {
  width: 100%;
  padding: 10px 0;
  margin-bottom: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: 0.2s;
}

.btn.blue {
  background-color: #00a1d6;
  color: white;
}

.btn.blue:hover {
  background-color: #0086b3;
}

.btn.pink {
  background-color: #ff6699;
  color: white;
}

.btn.pink:hover {
  background-color: #ff4f88;
}

.footer {
  font-size: 12px;
  text-align: center;
  margin-top: 12px;
  color: #999;
}
</style>
