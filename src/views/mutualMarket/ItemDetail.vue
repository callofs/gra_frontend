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

        <div v-if="item" class="panel">
          <div class="media">
            <img class="image" :src="item.image" alt="image" />
          </div>

          <div class="info">
            <div class="title-row">
              <div class="name">{{ item.name }}</div>
              <div class="condition">{{ item.condition }}</div>
            </div>

            <div class="desc">{{ item.desc }}</div>

            <div class="price-row">
              <div class="price">¥{{ item.price }}</div>
              <div v-if="item.originPrice" class="origin">¥{{ item.originPrice }}</div>
            </div>

            <div class="meta">
              <div class="meta-item">
                <span class="meta-label">分类</span>
                <span class="meta-value">{{ categoryName }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">地区</span>
                <span class="meta-value">{{ item.location }}</span>
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

        <el-empty v-else description="未找到该物品" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { mockItems } from './mockItems'

const route = useRoute()
const router = useRouter()

const categoriesMap = {
  all: '全部物品',
  baby: '母婴用品',
  clothes: '童装童鞋',
  toy: '玩具游乐',
  book: '图书文具',
  furniture: '儿童家具',
  travel: '安全出行',
  feed: '喂养用品',
  other: '其他',
}

const itemId = computed(() => Number(route.params.id))

const item = computed(() => {
  if (!Number.isFinite(itemId.value)) return null
  return mockItems.find((i) => i.id === itemId.value) || null
})

const categoryName = computed(() => {
  if (!item.value) return ''
  return categoriesMap[item.value.category] || item.value.category
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.replace('/market')
}

function contactSeller() {
  if (!item.value) return
  ElMessage.info(`联系卖家：${item.value.sellerName}（待接入后端）`)
}
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
