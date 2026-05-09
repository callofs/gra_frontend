<template>
  <div class="main-column">
    <section id="profile-section" class="card hero-card">
      <div class="profile-hero">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          accept="image/*"
          :auto-upload="true"
          :before-upload="beforeAvatarUpload"
          :http-request="uploadAvatarRequest"
        >
          <div class="avatar-wrap" role="button" tabindex="0">
            <img v-if="avatarSrc" class="avatar-image" :src="avatarSrc" alt="用户头像" />
            <div v-else class="avatar-fallback">{{ avatarText }}</div>
            <div class="avatar-overlay">
              <span class="avatar-overlay-text">点击更换头像</span>
            </div>
          </div>
        </el-upload>

        <div class="hero-content">
          <div class="hero-top">
            <div>
              <div class="hero-name">{{ displayName }}</div>
              <div class="hero-meta">账号：{{ profileForm.username || '未设置' }}</div>
            </div>

            <div class="hero-tags">
              <span class="tag primary">已实名</span>
              <span class="tag">{{ character }}</span>
            </div>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-value">{{ infoSummary.joinDays }}</div>
              <div class="stat-label">加入天数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ infoSummary.collectionCount }}</div>
              <div class="stat-label">我的收藏</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ infoSummary.historyCount }}</div>
              <div class="stat-label">浏览记录</div>
            </div>
          </div>

          <div class="hero-desc">{{ profileForm.bio || '完善个人资料后，你可以更方便地管理账号信息、安全设置与个性化内容。' }}</div>
        </div>
      </div>
    </section>

    <section id="basic-section" class="card content-card">
      <div class="section-head">
        <div>
          <div class="section-title">基本资料</div>
          <div class="section-subtitle">维护你的公开信息与联系方式，方便平台为你提供更准确的服务。</div>
        </div>
        <button class="primary-btn edit-btn" type="button" @click="openEditDialog">编辑资料</button>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">昵称</div>
          <div class="info-value">{{ profileForm.name || '未设置' }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">用户名</div>
          <div class="info-value">{{ profileForm.username || '未设置' }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">手机号</div>
          <div class="info-value">{{ profileForm.phone || '未设置' }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">邮箱</div>
          <div class="info-value">{{ profileForm.email || '未设置' }}</div>
        </div>

        <div class="info-item">
          <div class="info-label">所在城市</div>
          <div class="info-value">{{ profileForm.location || '未设置' }}</div>
        </div>

        <div class="info-item full-width">
          <div class="info-label">个性签名</div>
          <div class="info-value multiline">{{ profileForm.bio || '未设置' }}</div>
        </div>

        <div v-if="isExpert" class="info-item full-width">
          <div class="info-label">认证材料</div>
          <div class="info-value document-row">
            <span>{{ credentialFileName || '未上传认证材料' }}</span>
            <button
              v-if="credentialDownloadUrl"
              class="link-btn"
              type="button"
              @click="downloadCredential"
            >
              下载材料
            </button>
          </div>
        </div>
      </div>
    </section>

    <section id="security-section" class="card content-card">
      <div class="section-head">
        <div>
          <div class="section-title">安全设置</div>
          <div class="section-subtitle">通过多维度安全策略保护你的账号和个人信息。</div>
        </div>
      </div>

      <div class="security-list">
        <div v-for="item in securityItems" :key="item.title" class="security-item">
          <div class="security-main">
            <div class="security-icon" :class="item.theme">{{ item.icon }}</div>
            <div>
              <div class="security-title">{{ item.title }}</div>
              <div class="security-desc">{{ item.description }}</div>
            </div>
          </div>

          <div class="security-side">
            <span class="status-tag" :class="{ active: item.active }">{{ item.status }}</span>
            <button class="jump-btn" type="button">›</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { nextTick } from 'vue'

defineProps({
  avatarSrc: {
    type: String,
    default: '',
  },
  avatarText: {
    type: String,
    default: '',
  },
  displayName: {
    type: String,
    default: '',
  },
  character: {
    type: String,
    default: '',
  },
  profileForm: {
    type: Object,
    required: true,
  },
  infoSummary: {
    type: Object,
    required: true,
  },
  isExpert: {
    type: Boolean,
    default: false,
  },
  credentialFileName: {
    type: String,
    default: '',
  },
  credentialDownloadUrl: {
    type: String,
    default: '',
  },
  securityItems: {
    type: Array,
    default: () => [],
  },
  beforeAvatarUpload: {
    type: Function,
    required: true,
  },
  uploadAvatarRequest: {
    type: Function,
    required: true,
  },
  openEditDialog: {
    type: Function,
    required: true,
  },
  downloadCredential: {
    type: Function,
    required: true,
  },
})

async function scrollToSection(sectionKey) {
  await nextTick()

  const targetIdMap = {
    profile: 'profile-section',
    account: 'basic-section',
    security: 'security-section',
  }

  const targetId = targetIdMap[sectionKey]
  if (!targetId) return

  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

defineExpose({
  scrollToSection,
})
</script>

<style scoped>
.main-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.hero-card,
.content-card {
  padding: 24px;
}

.profile-hero {
  display: flex;
  gap: 24px;
  align-items: center;
}

.avatar-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  border: 4px solid #fff;
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

.avatar-uploader {
  display: inline-flex;
}

.avatar-uploader :deep(.el-upload) {
  display: inline-flex;
}

.avatar-image,
.avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 999px;
}

.avatar-image {
  object-fit: cover;
}

.avatar-fallback {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: #fff;
  font-size: 32px;
  font-weight: 800;
}

.avatar-wrap:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay {
  position: absolute;
  inset: -4px;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 999px;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.avatar-overlay-text {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  line-height: 1.4;
}

.hero-content {
  flex: 1;
  min-width: 0;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.hero-name {
  font-size: 28px;
  line-height: 1.2;
  font-weight: 700;
  color: #0f172a;
}

.hero-meta,
.hero-desc {
  margin-top: 8px;
  color: #64748b;
  line-height: 1.6;
}

.hero-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.tag.primary {
  background: #dbeafe;
  color: #2563eb;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.stat-item {
  border-radius: 12px;
  background: #f8fafc;
  padding: 14px 16px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.stat-label {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.section-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: #64748b;
}

.edit-btn {
  min-width: 120px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
}

.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.info-value {
  min-height: 22px;
  font-size: 14px;
  color: #0f172a;
}

.multiline {
  white-space: pre-wrap;
  line-height: 1.7;
}

.document-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.primary-btn,
.jump-btn {
  border: none;
  cursor: pointer;
}

.primary-btn {
  min-width: 160px;
  height: 44px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  background: #2563eb;
  color: #fff;
}

.link-btn {
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.security-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.security-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.security-icon {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.security-icon.blue {
  background: #eff6ff;
}

.security-icon.purple {
  background: #faf5ff;
}

.security-icon.yellow {
  background: #fffbeb;
}

.security-icon.red {
  background: #fef2f2;
}

.security-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.security-desc {
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}

.security-side {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.status-tag.active {
  background: #dcfce7;
  color: #16a34a;
}

.jump-btn {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: transparent;
  color: #9ca3af;
  font-size: 20px;
}

@media (max-width: 768px) {
  .profile-hero,
  .hero-top,
  .security-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-stats,
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
