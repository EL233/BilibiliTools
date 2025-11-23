console.log('content-script loaded!')

// 防止重复创建悬浮窗
let floatingBoxCreated = false

// popup → content-script 消息监听
chrome.runtime.onMessage.addListener((msg, sendResponse) => {
  console.log('收到 popup 消息：', msg)

  if (msg.action === 'triple_action') {
    realTripleLike()
    sendResponse({ ok: true })
  }

  if (msg.action === 'open_floating_box') {
    // 不管什么页面都尝试创建浮窗
    floatingBoxCreated = false
    createFloatingBox()
    sendResponse({ ok: true })
  }

  if (msg.action === 'get_video_info') {
    const bvid = getBvid()
    if (!bvid) {
      alert('未找到视频，无法获取信息')
      sendResponse({ ok: false })
      return true
    }

    if (!document.querySelector('#bilibili-float-box')) {
      createFloatingBox()
      setTimeout(() => {
        getVideoInfo()
      }, 500)
    } else {
      getVideoInfo()
    }
    sendResponse({ ok: true })
  }

  return true
})

function getCSRF () {
  return document.cookie.match(/bili_jct=([a-zA-Z0-9]+)/)?.[1] || ''
}

function getBvid () {
  return window.location.href.match(/BV[\w]+/)?.[0] || ''
}

async function bilibiliPost (url, data) {
  return await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data).toString()
  }).then(res => res.json())
}

function createFloatingBox () {
  if (floatingBoxCreated || document.querySelector('#bilibili-float-box')) return

  const box = document.createElement('div')
  box.id = 'bilibili-float-box'
  box.style.position = 'fixed'
  box.style.top = '100px'
  box.style.right = '20px'
  box.style.width = '300px'
  box.style.background = 'white'
  box.style.border = '2px solid #00a1d6'
  box.style.borderRadius = '12px'
  box.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)'
  box.style.zIndex = '2147483647'
  box.style.padding = '15px'
  box.style.cursor = 'move'
  box.style.userSelect = 'none'
  box.style.fontFamily = 'Arial, sans-serif'

  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
      <h3 style="margin:0;font-size:16px;">B站小助手</h3>
      <button id="closeFloatBox" style="border:none;background:transparent;cursor:pointer;font-size:20px;color:#999;">×</button>
    </div>
    <button id="getVideoInfoBtn" style="width:100%;padding:10px;border:none;border-radius:6px;background:#00a1d6;color:white;cursor:pointer;font-size:14px;font-weight:bold;">
      获取视频信息
    </button>
    <div id="videoInfoDisplay" style="margin-top:15px;padding:10px;background:#f5f5f5;border-radius:6px;font-size:12px;max-height:140px;overflow-y:auto;display:none;">
      <p style="margin:0;">等待获取视频信息...</p>
    </div>
    <button id="autoTripleBtn" style="width:100%; margin-top:10px; padding:10px; border:none; border-radius:6px; background:#ff6699; color:white; cursor:pointer; font-size:14px; font-weight:bold;">
      一键三连
    </button>
    <button id="sendCommentBtn" style="width:100%; margin-top:10px; padding:10px; border:none; border-radius:6px; background:#00c091; color:white; cursor:pointer; font-size:14px; font-weight:bold;">
      发送评论
    </button>
  `

  document.body.appendChild(box)
  floatingBoxCreated = true

  document.getElementById('closeFloatBox').onclick = () => {
    box.remove()
    floatingBoxCreated = false
  }

  document.getElementById('getVideoInfoBtn').onclick = () => {
    getVideoInfo()
  }

  // 拖拽功能
  let isDragging = false
  let offsetX = 0
  let offsetY = 0

  box.addEventListener('mousedown', e => {
    if (e.target.tagName === 'BUTTON') return
    isDragging = true
    offsetX = e.clientX - box.getBoundingClientRect().left
    offsetY = e.clientY - box.getBoundingClientRect().top
    box.style.cursor = 'grabbing'
  })

  document.addEventListener('mousemove', e => {
    if (isDragging) {
      const left = e.clientX - offsetX
      const top = e.clientY - offsetY
      box.style.left = Math.max(0, left) + 'px'
      box.style.top = Math.max(0, top) + 'px'
      box.style.right = 'auto'
    }
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
    box.style.cursor = 'move'
  })

  document.getElementById('autoTripleBtn').addEventListener('click', () => {
    realTripleLike()
  })

  document.getElementById('sendCommentBtn').addEventListener('click', () => {
    sendComment()
  })
}

async function getVideoInfo () {
  const infoDisplay = document.getElementById('videoInfoDisplay')
  infoDisplay.style.display = 'block'

  try {
    const url = window.location.href
    const bvid = (url.match(/BV[\w]+/) || [])[0]

    if (!bvid) {
      infoDisplay.innerHTML = '<p style="color:red;">未找到视频</p>'
      return
    }

    const videoApi = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
    const videoRes = await fetch(videoApi)
    const videoData = await videoRes.json()

    if (videoData.code !== 0) {
      infoDisplay.innerHTML = '<p style="color:red;">获取视频信息失败</p>'
      return
    }

    const title = videoData.data.title
    const view = videoData.data.stat.view
    const reply = videoData.data.stat.reply
    const mid = videoData.data.owner.mid
    const upName = videoData.data.owner.name

    const upApi = `https://api.bilibili.com/x/relation/stat?vmid=${mid}`
    const upRes = await fetch(upApi)
    const upData = await upRes.json()

    const follower = upData.data.follower

    infoDisplay.innerHTML = `
      <p><strong>UP主:</strong> ${upName}</p>
      <p><strong>粉丝数:</strong> ${follower}</p>
      <p><strong>BV号:</strong> ${bvid}</p>
      <p><strong>标题:</strong> ${title}</p>
      <p><strong>播放量:</strong> ${view}</p>
      <p><strong>评论数:</strong> ${reply}</p>
    `
  } catch (err) {
    infoDisplay.innerHTML = '<p style="color:red;">出现错误</p>'
    console.error(err)
  }
}

function realTripleLike () {
  try {
    const likeBtn = document.querySelector('.video-like') ||
      document.querySelector('button.like') ||
      document.querySelector('.toolbar-left .like-wrap button')

    if (!likeBtn) {
      alert('未找到点赞按钮')
      return
    }

    const downEvent = new MouseEvent('mousedown', { bubbles: true })
    likeBtn.dispatchEvent(downEvent)

    setTimeout(() => {
      const upEvent = new MouseEvent('mouseup', { bubbles: true })
      likeBtn.dispatchEvent(upEvent)
      alert('一键三连成功！')
    }, 3000)
  } catch (e) {
    console.error('三连失败:', e)
    alert('三连失败，请检查控制台日志')
  }
}

async function sendComment () {
  const csrf = getCSRF()
  const bvid = getBvid()
  const text = window.__bili_comment__ || '好耶！'

  if (!csrf || !bvid) {
    alert('无法获取CSRF或BV号，发送评论失败')
    return
  }

  try {
    await bilibiliPost('https://api.bilibili.com/x/v2/reply/add', {
      oid: bvid,
      type: 1,
      message: text,
      csrf
    })

    alert('评论发送成功！')
  } catch (e) {
    console.error('发送评论失败:', e)
    alert('发送评论失败，请检查控制台日志')
  }
}

// DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(createFloatingBox, 1000))
} else {
  setTimeout(createFloatingBox, 1000)
}

// 监听 SPA 路由变化
let lastUrl = location.href
new MutationObserver(() => {
  const currentUrl = location.href
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl
    floatingBoxCreated = false
    setTimeout(createFloatingBox, 1000)
  }
}).observe(document, { childList: true, subtree: true })
