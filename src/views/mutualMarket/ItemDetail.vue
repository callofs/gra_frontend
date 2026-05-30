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

            <div class="claim-section">
              <template v-if="!isOwner">
                <div v-if="myClaim" class="claim-status">
                  <el-tag :type="claimStatusType(myClaim.status)">{{ claimStatusLabel(myClaim.status) }}</el-tag>
                  <span class="claim-text">{{ myClaim.remark || '已提交认领申请，请等待发布者处理' }}</span>
                  <el-button v-if="myClaim.status === 0" link type="danger" @click="handleCancelClaim">
                    取消申请
                  </el-button>
                  <el-button v-if="item" link type="primary" @click="contactSeller">联系发布者</el-button>
                </div>

                <el-button
                  type="primary"
                  plain
                  :disabled="Boolean(myClaim && myClaim.status === 0)"
                  @click="openClaimDialog"
                >{{ myClaim ? '重新申请认领' : '申请认领' }}</el-button>
              </template>

              <template v-else>
                <div class="claim-list-header">
                  <div class="claim-title">认领申请</div>
                  <el-tag v-if="pendingReceivedCount" type="warning">待处理 {{ pendingReceivedCount }}</el-tag>
                </div>

                <div class="claim-list" v-loading="receivedLoading">
                  <div v-if="!receivedLoading && receivedClaims.length === 0" class="empty-state">暂无认领申请</div>
                  <div v-else>
                    <div v-for="claim in receivedClaims" :key="claim.id" class="claim-row">
                      <div class="claim-row-main">
                        <div class="claim-row-user">{{ claim.applicantName }}</div>
                        <div class="claim-row-note">联系方式：{{ claim.contact || '未填写' }}</div>
                        <div class="claim-row-note">备注：{{ claim.remark || '无' }}</div>
                        <div class="claim-row-time">提交时间：{{ claim.createTime }}</div>
                      </div>
                      <div class="claim-row-actions">
                        <el-tag :type="claimStatusType(claim.status)">{{ claimStatusLabel(claim.status) }}</el-tag>
                        <el-button
                          size="small"
                          link
                          type="primary"
                          @click="chatWithClaimant(claim)"
                        >私信申请人</el-button>
                        <div v-if="claim.status === 0" class="claim-row-buttons">
                          <el-button size="small" type="success" @click="handleReceivedAction(claim, 1)">同意</el-button>
                          <el-button size="small" type="danger" plain @click="handleReceivedAction(claim, 2)">拒绝</el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
          </div>

          <el-empty v-else-if="!loading" description="未找到该物品" />
        </div>
      </div>
    </section>
    <el-dialog v-model="claimDialogVisible" title="申请认领" width="420px">
      <el-form label-width="88px">
        <el-form-item label="联系方式">
          <el-input v-model="claimForm.contact" maxlength="50" placeholder="请输入手机号、微信等联系方式" />
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input
            v-model="claimForm.remark"
            type="textarea"
            :rows="3"
            maxlength="200"
            placeholder="简单说明认领用途或需求"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="claimDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="claimSubmitting" @click="handleClaimSubmit">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createPrivateMessageSocket, getPrivateMessageSocket } from '@/api/chat'
import { getGoodsDetail } from '@/api/goods.js'
import { cancelClaim, createClaim, getMyClaimList, getMyReceivedClaim, updateClaimState } from '@/api/goodsClaim'
import { useAppStore } from '@/store/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const item = ref(null)
const loading = ref(false)

const claimDialogVisible = ref(false)
const claimSubmitting = ref(false)
const claimForm = reactive({
  contact: '',
  remark: '',
})

const myClaim = ref(null)
const myClaimLoading = ref(false)
const receivedClaims = ref([])
const receivedLoading = ref(false)

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

function normalizeClaimStatus(value) {
  const status = Number(value)
  if (Number.isNaN(status)) return 0
  return status
}

const claimStatusMap = {
  0: { label: '待确认', type: 'warning' },
  1: { label: '已同意', type: 'success' },
  2: { label: '已拒绝', type: 'danger' },
  3: { label: '已完成', type: 'info' },
  4: { label: '已取消', type: '' },
}

function claimStatusLabel(status) {
  return claimStatusMap[status]?.label || '未知状态'
}

function claimStatusType(status) {
  return claimStatusMap[status]?.type || 'info'
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

function mapClaimRecord(record) {
  return {
    id: record?.id,
    goodsId: record?.goodsId || record?.idleGoodsId,
    status: normalizeClaimStatus(record?.status),
    remark: record?.claimDesc || record?.remark || record?.applyReason || record?.message || '',
    contact: record?.contactInfo || record?.contact || '',
    applicantId: record?.claimerId || record?.applicantId || record?.userId,
    applicantName: record?.claimerName || record?.applicantName || record?.nickname || record?.username || `用户${record?.claimerId || record?.applicantId || record?.userId || ''}`,
    applicantAvatar: normalizeImage(record?.claimerAvatar || record?.applicantAvatar || record?.avatar || ''),
    publisherId: record?.publisherId || record?.ownerId || record?.sellerId,
    publisherName: record?.publisherName || record?.ownerName || record?.sellerName,
    publisherAvatar: normalizeImage(record?.publisherAvatar || record?.ownerAvatar || record?.sellerAvatar || ''),
    createTime: formatDateTime(record?.createTime || record?.applyTime || record?.updateTime),
  }
}

function normalizeClaimListResponse(res) {
  const source = res?.data ?? res
  if (Array.isArray(source?.records)) return source.records
  if (Array.isArray(source?.list)) return source.list
  if (Array.isArray(source)) return source
  return []
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
    if (isLoggedIn.value) {
      await refreshClaimData()
    }
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

const isLoggedIn = computed(() => Boolean(appStore.isAuthenticated))

const isOwner = computed(() => {
  if (!item.value) return false
  const ownerId = String(item.value.userId || '')
  const currentUserId = String(appStore.userInfo?.id || '')
  return ownerId && currentUserId && ownerId === currentUserId
})

const pendingReceivedCount = computed(() => receivedClaims.value.filter((claim) => claim.status === 0).length)

async function loadMyClaimRecord(goodsId) {
  if (!goodsId || !isLoggedIn.value) {
    myClaim.value = null
    return
  }

  myClaimLoading.value = true
  try {
    const res = await getMyClaimList({ page: 1, size: 50 })
    const list = normalizeClaimListResponse(res).map(mapClaimRecord)
    myClaim.value = list.find((claim) => Number(claim.goodsId) === Number(goodsId)) || null
  } catch (error) {
    myClaim.value = null
  } finally {
    myClaimLoading.value = false
  }
}

async function loadReceivedClaimList(goodsId) {
  if (!goodsId || !isOwner.value) {
    receivedClaims.value = []
    return
  }

  receivedLoading.value = true
  try {
    const res = await getMyReceivedClaim({ page: 1, size: 50, goodsId })
    receivedClaims.value = normalizeClaimListResponse(res).map(mapClaimRecord)
  } catch (error) {
    receivedClaims.value = []
  } finally {
    receivedLoading.value = false
  }
}

async function refreshClaimData() {
  const goodsId = item.value?.id
  if (!goodsId || !isLoggedIn.value) {
    myClaim.value = null
    receivedClaims.value = []
    return
  }

  await loadMyClaimRecord(goodsId)
  if (isOwner.value) {
    await loadReceivedClaimList(goodsId)
  } else {
    receivedClaims.value = []
  }
}

function resetClaimForm() {
  claimForm.contact = appStore.userInfo?.phone || ''
  claimForm.remark = ''
}

function openClaimDialog() {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录后再认领')
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  if (isOwner.value) {
    ElMessage.info('你是该物品发布者，无需认领')
    return
  }

  resetClaimForm()
  claimDialogVisible.value = true
}

async function handleClaimSubmit() {
  if (!item.value?.id) {
    ElMessage.error('物品信息异常')
    return
  }

  claimSubmitting.value = true
  try {
    const payload = {
      goodsId: item.value.id,
      publisherId: item.value.userId,
      claimerId: appStore.userInfo?.id,
      claimDesc: claimForm.remark.trim(),
      contactInfo: claimForm.contact.trim(),
    }
    await createClaim(payload)
    ElMessage.success('认领申请已提交')
    claimDialogVisible.value = false
    await refreshClaimData()
  } catch (error) {
    ElMessage.error(error?.message || '提交认领申请失败')
  } finally {
    claimSubmitting.value = false
  }
}

async function handleCancelClaim() {
  if (!myClaim.value?.id) return

  try {
    await ElMessageBox.confirm('确定取消该认领申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await cancelClaim(myClaim.value.id)
    ElMessage.success('认领申请已取消')
    await refreshClaimData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '取消认领失败')
    }
  }
}

async function handleReceivedAction(claim, status) {
  if (!claim?.id) return

  const actionText = status === 1 ? '同意' : '拒绝'
  try {
    await ElMessageBox.confirm(`确定${actionText}该认领申请吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: status === 1 ? 'success' : 'warning',
    })
    await updateClaimState(claim.id, status)
    ElMessage.success(`已${actionText}认领申请`)
    await refreshClaimData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || `${actionText}认领申请失败`)
    }
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.replace('/market')
}

function chatWithClaimant(claim) {
  if (!claim) return

  startChatSession({
    userId: claim.applicantId,
    name: claim.applicantName,
    avatar: claim.applicantAvatar,
  })
}

function contactSeller() {
  if (!item.value) return

  startChatSession({
    userId: item.value.userId,
    name: item.value.sellerName,
    avatar: item.value.sellerAvatar,
  })
}

function startChatSession({ userId, name, avatar }) {
  const targetUserId = String(userId || '').trim()
  const targetName = String(name || '').trim() || '用户'

  if (!targetUserId) {
    ElMessage.warning('用户信息不完整，无法发起私信')
    return
  }

  const currentUserId = String(appStore.userInfo?.id || '').trim()
  if (currentUserId && targetUserId === currentUserId) {
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
      targetUserId,
      targetName,
      targetAvatar: avatar || '',
    },
  })
}

onMounted(fetchDetail)

watch(
  () => appStore.isAuthenticated,
  (loggedIn) => {
    if (loggedIn && item.value?.id) {
      refreshClaimData()
    } else if (!loggedIn) {
      myClaim.value = null
      receivedClaims.value = []
    }
  }
)

watch(
  () => item.value?.id,
  (goodsId) => {
    if (goodsId && isLoggedIn.value) {
      refreshClaimData()
    }
  }
)
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

.claim-section {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px dashed rgba(226, 232, 240, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.claim-status {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.claim-text {
  color: rgba(71, 85, 105, 1);
}

.claim-list-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.claim-title {
  font-weight: 700;
  color: rgba(15, 23, 42, 1);
}

.claim-list {
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 10px;
  padding: 12px;
  background: rgba(248, 250, 252, 0.6);
}

.claim-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px dashed rgba(226, 232, 240, 1);
}

.claim-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.claim-row-main {
  flex: 1;
}

.claim-row-user {
  font-weight: 600;
  color: rgba(15, 23, 42, 1);
}

.claim-row-note,
.claim-row-time {
  margin-top: 4px;
  font-size: 13px;
  color: rgba(71, 85, 105, 1);
}

.claim-row-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 120px;
}

.claim-row-buttons {
  display: flex;
  gap: 8px;
}

.empty-state {
  padding: 12px;
  text-align: center;
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
