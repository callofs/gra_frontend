<template>
  <section class="order-panel card">
    <div class="panel-header">
      <div>
        <div class="panel-title">订单管理</div>
        <div class="panel-subtitle">管理闲置物品认领申请与收到的认领请求。</div>
      </div>
      <div class="panel-actions">
        <el-button size="small" :loading="refreshing" @click="refreshData">刷新</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="order-tabs">
      <el-tab-pane label="我的认领申请" name="my">
        <div class="table-list" v-loading="myLoading">
          <div v-if="!myLoading && myClaims.length === 0" class="empty-state">暂无认领申请</div>
          <div v-else>
            <div v-for="claim in myClaims" :key="claim.id" class="claim-card">
              <div class="claim-main">
                <div class="claim-title">{{ claim.goodsName || `物品 #${claim.goodsId}` }}</div>
                <div class="claim-meta">
                  <span>提交时间：{{ claim.createTime }}</span>
                  <span>联系方式：{{ claim.contact || '未填写' }}</span>
                </div>
                <div class="claim-remark">备注：{{ claim.remark || '无' }}</div>
              </div>
              <div class="claim-side">
                <el-tag :type="claimStatusType(claim.status)">{{ claimStatusLabel(claim.status) }}</el-tag>
                <el-button
                  size="small"
                  link
                  type="primary"
                  @click="chatWithPublisher(claim)"
                >联系发布者</el-button>
                <el-button
                  v-if="claim.status === 0"
                  size="small"
                  type="danger"
                  link
                  :loading="actionClaimId === claim.id"
                  @click="cancelMyClaim(claim)"
                >取消申请</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="收到的认领" name="received">
        <div class="table-list" v-loading="receivedLoading">
          <div v-if="!receivedLoading && receivedClaims.length === 0" class="empty-state">暂无收到的认领申请</div>
          <div v-else>
            <div v-for="claim in receivedClaims" :key="claim.id" class="claim-card">
              <div class="claim-main">
                <div class="claim-title">{{ claim.goodsName || `物品 #${claim.goodsId}` }}</div>
                <div class="claim-meta">
                  <span>申请人：{{ claim.applicantName }}</span>
                  <span>联系方式：{{ claim.contact || '未填写' }}</span>
                </div>
                <div class="claim-remark">备注：{{ claim.remark || '无' }}</div>
                <div class="claim-meta">提交时间：{{ claim.createTime }}</div>
              </div>
              <div class="claim-side">
                <el-tag :type="claimStatusType(claim.status)">{{ claimStatusLabel(claim.status) }}</el-tag>
                <el-button size="small" link type="primary" @click="chatWithClaimer(claim)">私信申请人</el-button>
                <div v-if="claim.status === 0" class="claim-actions">
                  <el-button
                    size="small"
                    type="success"
                    plain
                    :loading="actionClaimId === claim.id && actionType === 'approve'"
                    @click="updateReceivedClaim(claim, 1, 'approve')"
                  >同意</el-button>
                  <el-button
                    size="small"
                    type="danger"
                    plain
                    :loading="actionClaimId === claim.id && actionType === 'reject'"
                    @click="updateReceivedClaim(claim, 2, 'reject')"
                  >拒绝</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cancelClaim, getMyClaimList, getMyReceivedClaim, updateClaimState } from '@/api/goodsClaim'
import { createPrivateMessageSocket, getPrivateMessageSocket } from '@/api/chat'
import { useAppStore } from '@/store/app'

const router = useRouter()
const appStore = useAppStore()
const activeTab = ref('my')
const myClaims = ref([])
const receivedClaims = ref([])
const myLoading = ref(false)
const receivedLoading = ref(false)
const refreshing = ref(false)
const actionClaimId = ref(null)
const actionType = ref('')

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

function normalizeDateTime(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('zh-CN', { hour12: false })
}

function mapClaim(record) {
  const claimerId = record?.claimerId || record?.applicantId || record?.userId
  const claimerName = record?.claimerName || record?.applicantName || record?.nickname || record?.username || `用户${claimerId || ''}`
  return {
    id: record?.id,
    goodsId: record?.goodsId || record?.idleGoodsId,
    goodsName: record?.goodsName || record?.goodsTitle || record?.title,
    status: Number(record?.status ?? 0),
    remark: record?.remark || record?.applyReason || record?.message || '',
    contact: record?.contactInfo || record?.contact || '',
    applicantId: claimerId,
    applicantName: claimerName,
    applicantAvatar: record?.claimerAvatar || record?.applicantAvatar || record?.avatar || '',
    publisherId: record?.publisherId || record?.ownerId || record?.sellerId,
    publisherName: record?.publisherName || record?.ownerName || record?.sellerName || record?.publisherNickname,
    publisherAvatar: record?.publisherAvatar || record?.ownerAvatar || record?.sellerAvatar || '',
    createTime: normalizeDateTime(record?.createTime || record?.applyTime || record?.updateTime),
  }
}

function normalizeListResponse(res) {
  const source = res?.data ?? res
  if (Array.isArray(source?.records)) return source.records
  if (Array.isArray(source?.list)) return source.list
  if (Array.isArray(source)) return source
  return []
}

async function loadMyClaims() {
  myLoading.value = true
  try {
    const res = await getMyClaimList({ page: 1, size: 50 })
    myClaims.value = normalizeListResponse(res).map(mapClaim)
  } catch (error) {
    myClaims.value = []
    ElMessage.error(error?.message || '获取认领申请失败')
  } finally {
    myLoading.value = false
  }
}

async function loadReceivedClaims() {
  receivedLoading.value = true
  try {
    const res = await getMyReceivedClaim({ page: 1, size: 50 })
    receivedClaims.value = normalizeListResponse(res).map(mapClaim)
  } catch (error) {
    receivedClaims.value = []
    ElMessage.error(error?.message || '获取收到的认领失败')
  } finally {
    receivedLoading.value = false
  }
}

async function refreshData() {
  refreshing.value = true
  await Promise.all([loadMyClaims(), loadReceivedClaims()])
  refreshing.value = false
}

async function cancelMyClaim(claim) {
  if (!claim?.id) return
  try {
    await ElMessageBox.confirm('确定取消该认领申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    actionClaimId.value = claim.id
    actionType.value = 'cancel'
    await cancelClaim(claim.id)
    ElMessage.success('认领申请已取消')
    await loadMyClaims()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '取消认领失败')
    }
  } finally {
    if (actionClaimId.value === claim.id) {
      actionClaimId.value = null
      actionType.value = ''
    }
  }
}

async function updateReceivedClaim(claim, status, type) {
  if (!claim?.id) return
  const actionText = status === 1 ? '同意' : '拒绝'
  try {
    await ElMessageBox.confirm(`确定${actionText}该认领申请吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: status === 1 ? 'success' : 'warning',
    })
    actionClaimId.value = claim.id
    actionType.value = type
    await updateClaimState(claim.id, status)
    ElMessage.success(`已${actionText}认领申请`)
    await loadReceivedClaims()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || `${actionText}失败`)
    }
  } finally {
    if (actionClaimId.value === claim.id) {
      actionClaimId.value = null
      actionType.value = ''
    }
  }
}

function ensurePrivateMessageConnection() {
  const socket = getPrivateMessageSocket()
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket
  }

  return createPrivateMessageSocket()
}

function startChatSession({ userId, name, avatar }) {
  const targetUserId = String(userId || '').trim()
  const targetName = String(name || '').trim() || '用户'

  if (!targetUserId) {
    ElMessage.warning('未找到目标用户，无法发起私信')
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

function chatWithPublisher(claim) {
  if (!claim) return
  startChatSession({
    userId: claim.publisherId,
    name: claim.publisherName,
    avatar: claim.publisherAvatar,
  })
}

function chatWithClaimer(claim) {
  if (!claim) return
  startChatSession({
    userId: claim.applicantId,
    name: claim.applicantName,
    avatar: claim.applicantAvatar,
  })
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.order-panel {
  padding: 24px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.panel-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.panel-subtitle {
  margin-top: 6px;
  color: #64748b;
  font-size: 14px;
}

.order-tabs {
  margin-top: 20px;
}

.table-list {
  min-height: 220px;
}

.empty-state {
  padding: 48px 16px;
  text-align: center;
  color: #94a3b8;
}

.claim-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 14px;
}

.claim-card:last-child {
  margin-bottom: 0;
}

.claim-main {
  flex: 1;
}

.claim-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.claim-meta {
  margin-top: 6px;
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #64748b;
}

.claim-remark {
  margin-top: 8px;
  color: #475569;
}

.claim-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 140px;
}

.claim-actions {
  display: flex;
  gap: 8px;
}
</style>
