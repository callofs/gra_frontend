<template>
  <div class="detail-page">
    <section class="detail-hero">
      <div class="hero-container">
        <div class="hero-title">物品详情</div>
        <div class="hero-sub">查看物品信息与卖家资料，放心沟通交易</div>
      </div>
    </section>

    <section class="detail-main">
      <div class="main-container">
        <el-button class="back" text @click="goBack">返回</el-button>

        <div v-loading="loading" class="detail-content">
          <div v-if="item" class="panel">
          <div class="media">
            <img class="image" :src="item.image" alt="image" />
          </div>

          <div class="info">
            <div class="title-row">
              <div class="name">{{ item.title || item.name }}</div>
              <div class="condition">{{ item.condition }}</div>
            </div>

            <div class="desc">{{ item.desc }}</div>

            <div class="price-row">
              <div class="price">{{ item.goodsTypeName || '闲置物品' }}</div>
            </div>

            <div class="meta">
              <div class="meta-item">
                <span class="meta-label">分类</span>
                <span class="meta-value">{{ item.goodsTypeName || item.category }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">地区</span>
                <span class="meta-value">{{ item.location }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">适龄范围</span>
                <span class="meta-value">{{ item.fitAge }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">尺码规格</span>
                <span class="meta-value">{{ item.size }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">适用季节</span>
                <span class="meta-value">{{ item.season }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">材质</span>
                <span class="meta-value">{{ item.material }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">取件方式</span>
                <span class="meta-value">{{ item.pickUpTypeLabel }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">发布时间</span>
                <span class="meta-value">{{ item.createTime }}</span>
              </div>
            </div>

            <div class="seller">
              <div class="seller-left">
                <div class="seller-avatar"><img :src="item.sellerAvatar" alt="avatar" /></div>
                <div class="seller-info">
                  <div class="seller-name">{{ item.sellerName }}</div>
                  <div class="seller-tip">发布者</div>
                </div>
              </div>

              <div class="seller-actions">
                <el-button type="success" @click="contactSeller">联系卖家</el-button>
              </div>
            </div>
          </div>
          </div>

          <el-empty v-else-if="!loading" description="未找到该物品" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createPrivateMessageSocket, getPrivateMessageSocket } from '@/api/chat'
import { getGoodsDetail } from '@/api/goods.js'
import { useAppStore } from '@/store/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const item = ref(null)
const loading = ref(false)

function normalizeImage(value) {
  if (Array.isArray(value)) {
    return normalizeImage(value[0])
  }

  if (typeof value !== 'string') return ''

  const normalized = value.trim()
  if (!normalized) return ''

  if (normalized.startsWith('data:')) return normalized
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized

  return `data:image/jpeg;base64,${normalized}`
}

function getPickUpTypeLabel(value) {
  if (value === 1) return '自提'
  if (value === 2) return '邮寄'
  if (value === 3) return '均可'
  return '未知'
}

function formatDateTime(value) {
  if (!value) return '未知'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('zh-CN', { hour12: false })
}

function normalizeGoodsDetail(data) {
  return {
    id: data?.id,
    userId: data?.userId,
    category: data?.goodsTypeCode || '',
    goodsTypeName: data?.goodsTypeName || '闲置物品',
    title: data?.title || '',
    name: data?.name || '未命名物品',
    desc: data?.description || '暂无描述',
    fitAge: data?.fitAge || '未填写',
    size: data?.size || '未填写',
    season: data?.season || '未填写',
    material: data?.material || '未填写',
    condition: data?.oldDegree || '成色未知',
    pickUpType: Number(data?.pickUpType || 0),
    pickUpTypeLabel: getPickUpTypeLabel(Number(data?.pickUpType || 0)),
    location: data?.address || '未知地区',
    image: data?.coverImages || 'https://picsum.photos/seed/market-default/600/400',
    sellerName: data?.publisherNickname || '匿名用户',
    sellerAvatar: normalizeImage(data?.publisherAvatar) || 'https://picsum.photos/seed/avatar-default/80/80',
    createTime: formatDateTime(data?.createTime),
  }
}

async function fetchDetail() {
  const itemId = Number(route.params.id)
  if (!Number.isFinite(itemId) || itemId <= 0) {
    item.value = null
    return
  }

  loading.value = true
  try {
    const res = await getGoodsDetail(itemId)
    item.value = normalizeGoodsDetail(res)
  } catch (error) {
    item.value = null
    ElMessage.error(error?.message || '获取物品详情失败')
  } finally {
    loading.value = false
  }
}

function ensurePrivateMessageConnection() {
  const socket = getPrivateMessageSocket()
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket
  }

  return createPrivateMessageSocket()
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.replace('/market')
}

function contactSeller() {
  if (!item.value) return

  const currentUserId = String(appStore.userInfo?.id || '').trim()
  const sellerUserId = String(item.value.userId || '').trim()

  if (!sellerUserId) {
    ElMessage.warning('卖家信息不完整')
    return
  }

  if (currentUserId && sellerUserId === currentUserId) {
    ElMessage.warning('不能与自己聊天')
    return
  }

  try {
    ensurePrivateMessageConnection()
  } catch (error) {
  }

  router.push({
    name: 'chat',
    query: {
      targetUserId: sellerUserId,
      targetName: item.value.sellerName || '',
      targetAvatar: item.value.sellerAvatar || '',
    },
  })
}

onMounted(fetchDetail)
</script>

<style scoped>
.detail-page {
  width: 100%;
}

.detail-hero {
  background: linear-gradient(90deg, rgba(34, 197, 94, 1), rgba(52, 211, 153, 1));
  padding: 22px 0;
}

.hero-container {
  width: 1200px;
  margin: 0 auto;
  color: #fff;
}

.hero-title {
  font-size: 28px;
  font-weight: 800;
}

.hero-sub {
  margin-top: 8px;
  color: rgba(241, 245, 249, 1);
}

.detail-main {
  padding: 24px 0 40px;
}

.main-container {
  width: 1200px;
  margin: 0 auto;
}

.detail-content {
  min-height: 420px;
}

.back {
  margin-bottom: 14px;
}

.panel {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: 520px 1fr;
}

.media {
  background: rgba(241, 245, 249, 1);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.info {
  padding: 18px;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.name {
  font-size: 20px;
  font-weight: 900;
  color: rgba(15, 23, 42, 1);
  line-height: 1.25;
}

.condition {
  flex-shrink: 0;
  background: rgba(255, 237, 213, 1);
  color: rgba(249, 115, 22, 1);
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 6px;
  height: 22px;
  display: inline-flex;
  align-items: center;
}

.desc {
  margin-top: 10px;
  color: rgba(71, 85, 105, 1);
  line-height: 1.7;
}

.price-row {
  margin-top: 14px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.price {
  color: rgba(22, 163, 74, 1);
  font-weight: 900;
  font-size: 28px;
}

.origin {
  color: rgba(148, 163, 184, 1);
  text-decoration: line-through;
}

.meta {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.meta-item {
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(248, 250, 252, 1);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.meta-label {
  font-size: 12px;
  color: rgba(100, 116, 139, 1);
}

.meta-value {
  font-size: 13px;
  color: rgba(30, 41, 59, 1);
  font-weight: 700;
}

.seller {
  margin-top: 18px;
  border-top: 1px solid rgba(226, 232, 240, 1);
  padding-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.seller-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.seller-avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(241, 245, 249, 1);
}

.seller-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.seller-name {
  font-weight: 800;
  color: rgba(15, 23, 42, 1);
}

.seller-tip {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(100, 116, 139, 1);
}

@media (max-width: 1280px) {
  .hero-container,
  .main-container {
    width: 100%;
    padding-left: 16px;
    padding-right: 16px;
  }

  .panel {
    grid-template-columns: 420px 1fr;
  }
}

@media (max-width: 960px) {
  .panel {
    grid-template-columns: 1fr;
  }

  .media {
    height: 320px;
  }
}
</style>
