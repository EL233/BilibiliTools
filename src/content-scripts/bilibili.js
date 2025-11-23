// 这个是内容脚本 bilibili.js
window.onload = function () {
  console.log('加载完毕')

  function getInfo () {
    // UP 主名字
    // eslint-disable-next-line no-undef
    const username = $('#v_upinfo > div.up-info_right > div.name > a.username').text().trim()
    // 粉丝数
    // eslint-disable-next-line no-undef
    const follow = $('#v_upinfo > div.up-info_right > div.btn-panel > div.default-btn.follow-btn.btn-transition.b-gz.following > span > span > span').text().trim()
    // 视频标题
    // eslint-disable-next-line no-undef
    const title = $('#viewbox_report > h1 > span').text().trim()
    // 播放量
    // eslint-disable-next-line no-undef
    const view = $('#viewbox_report > div > span.view').attr('title')

    // 保存到全局对象方便 Vue 或其他模块访问
    window.kz_vm.user = { username, follow, title, view }

    console.log(username, follow, title, view)
  }

  getInfo()
}
