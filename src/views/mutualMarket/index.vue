<template>
  <div class="market-page">
    <PublishDialog v-model="publishVisible" :categories="categories" @submitted="handlePublishSubmitted" />

    <section class="market-hero">
      <div class="hero-container">
        <div class="hero-left">
          <div class="hero-title">互助市场</div>
          <div class="hero-sub">闲置物品交换，资源共享，邻里互助，让育儿更环保更经济</div>

          <div class="hero-stats">
            <div class="stat">
              <div class="stat-value">35万+</div>
              <div class="stat-label">闲置物品</div>
            </div>
            <div class="stat">
              <div class="stat-value">12万+</div>
              <div class="stat-label">成功交易</div>
            </div>
            <div class="stat">
              <div class="stat-value">85%</div>
              <div class="stat-label">好评率</div>
            </div>
          </div>
        </div>

        <el-button class="hero-publish" type="success" plain @click="handlePublish">免费发布闲置</el-button>
      </div>
    </section>

    <section class="market-main">
      <div class="main-container">
        <aside class="sidebar">
          <div class="card">
            <div class="card-title">物品分类</div>
            <div class="category-list">
              <button
                v-for="c in categories"
                :key="c.key"
                class="category-item"
                :class="{ active: c.key === activeCategory }"
                type="button"
                @click="selectCategory(c.key)"
              >
                <span class="category-name">{{ c.name }}</span>
                <span class="category-count">{{ c.count }}</span>
              </button>
            </div>
          </div>

          <div class="spacer" />

          <div class="card">
            <div class="card-title">筛选条件</div>

            <div class="filter-group">
              <div class="filter-label">价格范围</div>
              <div class="filter-row">
                <el-input v-model="priceMin" placeholder="最低价" />
                <span class="filter-sep">-</span>
                <el-input v-model="priceMax" placeholder="最高价" />
              </div>
            </div>

            <div class="filter-group">
              <div class="filter-label">成色</div>
              <div class="tag-row">
                <button
                  v-for="t in conditions"
                  :key="t"
                  class="pill"
                  :class="{ active: t === activeCondition }"
                  type="button"
                  @click="activeCondition = t"
                >
                  {{ t }}
                </button>
              </div>
            </div>

            <div class="filter-actions">
              <el-button @click="resetFilters">重置</el-button>
              <el-button type="success" @click="applyFilters">应用</el-button>
            </div>
          </div>
        </aside>

        <main class="content">
          <div class="toolbar">
            <el-input
              v-model="keyword"
              class="search"
              placeholder="搜索物品名称、描述..."
              clearable
              @keyup.enter="applyFilters"
            />

            <el-select v-model="sortKey" class="sort" placeholder="排序">
              <el-option label="最新发布" value="latest" />
              <el-option label="价格最低" value="price_asc" />
              <el-option label="价格最高" value="price_desc" />
            </el-select>
          </div>

          <div v-loading="loading" class="grid-wrap">
            <div v-if="!loading && pagedItems.length === 0" class="empty-state">暂无闲置物品</div>

            <div v-else class="grid">
              <article v-for="item in pagedItems" :key="item.id" class="item-card" @click="openItem(item)">
              <div class="item-image">
                <img :src="item.image" alt="image" />
              </div>

              <div class="item-body">
                <div class="item-name">{{ item.title || item.name }}</div>
                <div class="item-desc">{{ item.desc }}</div>

                <div class="price-row">
                  <div class="price">{{ item.goodsTypeName || '闲置物品' }}</div>
                  <div class="condition">{{ item.condition }}</div>
                </div>

                <div class="seller-row">
                  <div class="seller">
                    <div class="seller-avatar"><img :src="item.sellerAvatar" alt="avatar" /></div>
                    <div class="seller-name">{{ item.sellerName }}</div>
                  </div>
                  <div class="location">{{ item.location }}</div>
                </div>
              </div>
              </article>
            </div>
          </div>

          <div class="pagination">
            <el-pagination
              background
              layout="prev, pager, next"
              :page-size="pageSize"
              :total="total"
              :current-page="page"
              @current-change="handlePageChange"
            />
          </div>
        </main>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getDictList } from '@/api/dict.js'
import { getGoodsList, publishGoods, uploadGoodsImage } from '@/api/goods.js'
import PublishDialog from './components/PublishDialog.vue'

const router = useRouter()

const categories = ref([{ key: 'all', name: '全部物品', count: '' }])

const activeCategory = ref('all')

const conditions = ['全部', '全新', '9成新', '8成新', '7成新', '6成新']
const activeCondition = ref('全部')

const keyword = ref('')
const sortKey = ref('latest')

const priceMin = ref('')
const priceMax = ref('')

const page = ref(1)
const pageSize = 8
const total = ref(0)
const loading = ref(false)

const publishVisible = ref(false)

const items = ref([])

function normalizeDictList(res) {
  return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
}

function buildCategories(dictItems = []) {
  const dynamicCategories = [...dictItems]
    .sort((a, b) => Number(a?.sort || 0) - Number(b?.sort || 0))
    .map((item) => ({
      key: item?.dictCode || String(item?.id || ''),
      name: item?.dictName || item?.dictCode || '未命名分类',
      count: '',
    }))
    .filter((item) => item.key)

  return [{ key: 'all', name: '全部物品', count: '' }, ...dynamicCategories]
}

async function fetchCategories() {
  try {
    const res = await getDictList('idleGoods')
    categories.value = buildCategories(normalizeDictList(res))
  } catch (error) {
    categories.value = [{ key: 'all', name: '全部物品', count: '' }]
    ElMessage.error(error?.message || '获取物品分类失败')
  }
}

const sortedItems = computed(() => {
  const list = [...items.value]
  return list.sort((a, b) => new Date(b.createTime || 0).getTime() - new Date(a.createTime || 0).getTime())
})

const pagedItems = computed(() => sortedItems.value)

function normalizeGoodsListResponse(res) {
  const data = res?.data ?? res ?? {}
  const records = Array.isArray(data?.records) ? data.records : Array.isArray(res?.records) ? res.records : []
  return {
    records,
    total: Number(data?.total ?? res?.total ?? records.length ?? 0),
  }
}

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

function normalizeGoodsItem(item) {
  return {
    id: item?.id,
    category: item?.goodsTypeCode || '',
    goodsTypeName: item?.goodsTypeName || '',
    title: item?.title || '',
    name: item?.name || '未命名物品',
    desc: item?.description || '',
    condition: item?.oldDegree || '成色未知',
    image: item?.coverImages || 'https://picsum.photos/seed/market-default/600/400',
    sellerName: item?.publisherNickname || '匿名用户',
    sellerAvatar: normalizeImage(item?.publisherAvatar) || 'https://picsum.photos/seed/avatar-default/80/80',
    location: item?.address || '未知地区',
    viewCount: Number(item?.viewCount || 0),
    createTime: item?.createTime || '',
  }
}

async function fetchGoods() {
  loading.value = true
  try {
    const res = await getGoodsList({
      page: page.value,
      size: pageSize,
      goodsTypeCode: activeCategory.value === 'all' ? '' : activeCategory.value,
      keyword: keyword.value,
    })
    const { records, total: nextTotal } = normalizeGoodsListResponse(res)
    items.value = records.map(normalizeGoodsItem)
    total.value = nextTotal
  } catch (error) {
    items.value = []
    total.value = 0
    ElMessage.error(error?.message || '获取闲置物品列表失败')
  } finally {
    loading.value = false
  }
}

function selectCategory(key) {
  activeCategory.value = key
  page.value = 1
  fetchGoods()
}

function resetFilters() {
  keyword.value = ''
  priceMin.value = ''
  priceMax.value = ''
  activeCondition.value = '全部'
  sortKey.value = 'latest'
  activeCategory.value = 'all'
  page.value = 1
  fetchGoods()
}

function applyFilters() {
  page.value = 1
  fetchGoods()
}

function handlePageChange(p) {
  page.value = p
  fetchGoods()
}

function openItem(item) {
  if (!item?.id) {
    ElMessage.warning('物品信息不完整')
    return
  }
  router.push(`/market/${item.id}`)
}

function resolveImageKey(uploadRes) {
  if (typeof uploadRes === 'string') return uploadRes

  return uploadRes.data.url
}

function handlePublish() {
  publishVisible.value = true
}

async function handlePublishSubmitted(payload) {
  try {
    const uploadRes = await uploadGoodsImage(payload?.imageFile)
    const imageKey = resolveImageKey(uploadRes)

    if (!imageKey) {
      throw new Error('图片上传结果无效')
    }

    await publishGoods({
      goodsTypeCode: payload.goodsTypeCode,
      title: payload.title,
      name: payload.name,
      coverImages: imageKey,
      description: payload.description,
      fitAge: payload.fitAge,
      size: payload.size,
      season: payload.season,
      material: payload.material,
      oldDegree: payload.oldDegree,
      pickUpType: Number(payload.pickUpType || 0),
      address: payload.address,
    })

    ElMessage.success('发布成功')
    publishVisible.value = false
    page.value = 1
    await fetchGoods()
  } catch (error) {
    ElMessage.error(error?.message || '发布闲置物品失败')
  }
}

onMounted(async () => {
  await fetchCategories()
  await fetchGoods()
})
</script>

<style scoped>
.market-page {
  width: 100%;
}

.market-hero {
  background: linear-gradient(90deg, rgba(34, 197, 94, 1), rgba(52, 211, 153, 1));
  padding: 32px 0;
}

.hero-container {
  width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.hero-left {
  color: #fff;
}

.hero-title {
  font-size: 36px;
  line-height: 44px;
  font-weight: 800;
}

.hero-sub {
  margin-top: 16px;
  color: rgba(241, 245, 249, 1);
  font-size: 16px;
}

.hero-stats {
  margin-top: 24px;
  display: flex;
  gap: 32px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  line-height: 36px;
}

.stat-label {
  font-size: 14px;
  color: rgba(226, 232, 240, 1);
}

.hero-publish {
  border-radius: 8px;
  padding: 12px 24px;
  background: #fff;
  border-color: #fff;
  color: rgba(22, 163, 74, 1);
  font-weight: 700;
}

.market-main {
  padding: 0;
}

.main-container {
  width: 1200px;
  margin: 0 auto;
  padding: 32px 0;
  display: flex;
  gap: 24px;
}

.sidebar {
  width: 250px;
}

.content {
  flex: 1;
  min-width: 0;
}

.grid-wrap {
  min-height: 320px;
}

.card {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-title {
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 700;
  color: rgba(30, 41, 59, 1);
  border-bottom: 1px solid rgba(226, 232, 240, 1);
}

.category-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-item {
  width: 100%;
  height: 44px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.category-item.active {
  background: rgba(240, 253, 244, 1);
}

.category-name {
  font-size: 14px;
  color: rgba(71, 85, 105, 1);
  font-weight: 500;
}

.category-item.active .category-name {
  color: rgba(22, 163, 74, 1);
}

.category-count {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(241, 245, 249, 1);
  color: rgba(100, 116, 139, 1);
}

.category-item.active .category-count {
  background: rgba(220, 252, 231, 1);
  color: rgba(22, 163, 74, 1);
}

.spacer {
  height: 24px;
}

.filter-group {
  padding: 14px 20px 0;
}

.filter-label {
  font-size: 14px;
  font-weight: 700;
  color: rgba(30, 41, 59, 1);
}

.filter-row {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
}

.filter-sep {
  color: rgba(148, 163, 184, 1);
}

.tag-row {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  border: 1px solid rgba(226, 232, 240, 1);
  background: #fff;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: rgba(71, 85, 105, 1);
  cursor: pointer;
}

.pill.active {
  border-color: rgba(34, 197, 94, 1);
  background: rgba(240, 253, 244, 1);
  color: rgba(22, 163, 74, 1);
}

.filter-actions {
  padding: 16px 20px 18px;
  display: flex;
  justify-content: space-between;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.search {
  flex: 1;
}

.sort {
  width: 150px;
}

.empty-state {
  margin-top: 16px;
  padding: 48px 16px;
  border: 1px dashed rgba(226, 232, 240, 1);
  border-radius: 12px;
  text-align: center;
  color: rgba(100, 116, 139, 1);
}

.grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.item-card {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.item-image {
  height: 180px;
  background: rgba(241, 245, 249, 1);
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.item-body {
  padding: 12px;
}

.item-name {
  font-weight: 800;
  color: rgba(15, 23, 42, 1);
  line-height: 22px;
}

.item-desc {
  margin-top: 8px;
  color: rgba(71, 85, 105, 1);
  font-size: 12px;
  line-height: 20px;
  height: 40px;
  overflow: hidden;
}

.price-row {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.price {
  color: rgba(22, 163, 74, 1);
  font-weight: 800;
  font-size: 16px;
}

.origin {
  color: rgba(148, 163, 184, 1);
  font-size: 12px;
  text-decoration: line-through;
}

.condition {
  margin-left: auto;
  background: rgba(255, 237, 213, 1);
  color: rgba(249, 115, 22, 1);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.seller-row {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(100, 116, 139, 1);
  font-size: 12px;
}

.seller {
  display: flex;
  align-items: center;
  gap: 6px;
}

.seller-avatar {
  width: 20px;
  height: 20px;
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

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 1280px) {
  .hero-container,
  .main-container {
    width: 100%;
    padding-left: 16px;
    padding-right: 16px;
  }

  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 960px) {
  .main-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
