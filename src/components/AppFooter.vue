<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-col brand">
        <div class="footer-logo">
          <div class="logo-icon">育</div>
          <div class="logo-text">育儿成长家</div>
        </div>
        <div class="footer-desc">家长育儿经验交流与互助平台</div>
        <div class="footer-contact">
          <div>📧 contact@example.com</div>
          <div>☎ 400-000-0000</div>
        </div>
      </div>

      <div class="footer-col">
        <div class="footer-title">快速导航</div>
        <a class="footer-link" href="javascript:void(0)" @click.prevent="goHome">关于我们</a>
        <a class="footer-link" href="javascript:void(0)" @click.prevent="goHome">用户协议</a>
        <a class="footer-link" href="javascript:void(0)" @click.prevent="goHome">隐私政策</a>
        <a class="footer-link" href="javascript:void(0)" @click.prevent="goHome">专家入驻</a>
        <a class="footer-link" href="javascript:void(0)" @click.prevent="goHome">联系我们</a>
      </div>

      <div class="footer-col">
        <div class="footer-title">功能模块</div>
        <a class="footer-link" href="javascript:void(0)" @click.prevent="goForum">主题论坛</a>
        <a class="footer-link" href="javascript:void(0)" @click.prevent="goMarket">互助市场</a>
        <a class="footer-link" href="javascript:void(0)" @click.prevent="goLectures">专家辅导</a>
        <a class="footer-link" href="javascript:void(0)" @click.prevent="goCourses">育儿资讯</a>
        <a class="footer-link" href="javascript:void(0)" @click.prevent="goProfile">实用工具</a>
      </div>

      <div class="footer-col">
        <div class="footer-title">关注我们</div>
        <div class="qrcode"></div>
        <div class="qrcode-tip">扫码关注公众号，获取更多育儿干货</div>
      </div>
    </div>

    <div class="container copyright">© 2026 育儿成长家 All Rights Reserved. 京ICP备12345678号-1</div>
  </footer>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/home')
}

function goForum() {
  router.push('/forum')
}

function goMarket() {
  router.push('/market')
}

function goLectures() {
  router.push('/lectures')
}

function goCourses() {
  router.push('/courses')
}

function goProfile() {
  router.push('/profile')
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 120px;
}

.footer {
  background: rgba(15, 23, 42, 1);
  color: rgba(226, 232, 240, 1);
  padding: 54px 0 24px;
}

.footer-inner {
  display: grid;
  grid-template-columns: 370px 1fr 1fr 1fr;
  gap: 36px;
  align-items: start;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 900;
  background: linear-gradient(180deg, rgba(59, 130, 246, 1), rgba(34, 211, 238, 1));
}

.logo-text {
  font-size: 18px;
  font-weight: 900;
  color: #fff;
}

.footer-desc {
  margin-top: 16px;
  line-height: 1.7;
  color: rgba(148, 163, 184, 1);
}

.footer-contact {
  margin-top: 16px;
  display: grid;
  gap: 10px;
  color: rgba(148, 163, 184, 1);
  font-size: 14px;
}

.footer-title {
  font-weight: 900;
  color: #fff;
  margin-bottom: 16px;
}

.footer-link {
  display: block;
  text-decoration: none;
  color: rgba(148, 163, 184, 1);
  font-size: 14px;
  margin: 0 0 12px;
}

.footer-link:hover {
  color: #fff;
}

.qrcode {
  width: 121px;
  height: 120px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.qrcode-tip {
  margin-top: 16px;
  font-size: 13px;
  color: rgba(148, 163, 184, 1);
  line-height: 1.6;
}

.copyright {
  margin-top: 34px;
  padding-top: 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  font-size: 13px;
  color: rgba(100, 116, 139, 1);
  text-align: center;
}

@media (max-width: 1200px) {
  .container {
    padding: 0 16px;
  }

  .footer-inner {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 680px) {
  .footer-inner {
    grid-template-columns: 1fr;
  }
}
</style>
