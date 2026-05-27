<template>
  <section class="my-goods-panel card">
    <div class="panel-header">
      <div>
        <div class="panel-title">我的闲置物品</div>
        <div class="panel-subtitle">管理你发布的闲置物品，查看详情并及时更新信息。</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">物品总数</div>
        <div class="stat-value">{{ total }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">当前页数量</div>
        <div class="stat-value">{{ goodsList.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最近更新</div>
        <div class="stat-value stat-value-sm">{{ latestUpdateTime }}</div>
      </div>
    </div>

    <div v-loading="loading" class="list-wrap">
      <div v-if="!loading && goodsList.length === 0" class="empty-state">你还没有发布过闲置物品</div>

      <div v-else class="goods-list">
        <div v-for="item in goodsList" :key="item.id" class="goods-card">
          <div class="goods-cover" @click="openDetail(item)">
            <img :src="item.image" alt="cover" />
          </div>

          <div class="goods-main" @click="openDetail(item)">
            <div class="goods-title-row">
              <div class="goods-title">{{ item.title || item.name }}</div>
              <el-tag :type="statusTypeMap[item.statusKey] || 'info'">{{ statusLabelMap[item.statusKey] || '未知状态' }}</el-tag>
            </div>
            <div class="goods-meta">
              <span>{{ item.goodsTypeName || '闲置物品' }}</span>
              <span>{{ item.condition }}</span>
              <span>{{ formatTime(item.updateTime || item.createTime) }}</span>
            </div>
            <div class="goods-desc">{{ item.description }}</div>
            <div class="goods-extra">
              <span>地区：{{ item.address || '未知地区' }}</span>
              <span>取件：{{ item.pickUpTypeLabel }}</span>
            </div>
          </div>

          <div class="goods-actions">
            <el-button size="small" @click="openDetail(item)">查看详情</el-button>
            <el-button size="small" type="primary" @click="openEdit(item)">编辑</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-wrap">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog v-model="editVisible" title="编辑闲置物品" width="640px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="90px">
        <el-form-item label="物品分类" prop="goodsTypeCode">
          <el-select v-model="editForm.goodsTypeCode" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
        </el-form-item>

        <el-form-item label="发布标题" prop="title">
          <el-input v-model="editForm.title" maxlength="40" show-word-limit />
        </el-form-item>

        <el-form-item label="物品名称" prop="name">
          <el-input v-model="editForm.name" maxlength="30" show-word-limit />
        </el-form-item>

        <el-form-item label="成色" prop="oldDegree">
          <el-select v-model="editForm.oldDegree" placeholder="请选择成色" style="width: 100%">
            <el-option label="全新" value="全新" />
            <el-option label="9成新" value="9成新" />
            <el-option label="8成新" value="8成新" />
            <el-option label="7成新" value="7成新" />
            <el-option label="6成新" value="6成新" />
          </el-select>
        </el-form-item>

        <el-form-item label="适龄范围" prop="fitAge">
          <el-input v-model="editForm.fitAge" maxlength="20" />
        </el-form-item>

        <el-form-item label="尺码规格" prop="size">
          <el-input v-model="editForm.size" maxlength="30" />
        </el-form-item>

        <el-form-item label="适用季节" prop="season">
          <el-input v-model="editForm.season" maxlength="20" />
        </el-form-item>

        <el-form-item label="材质" prop="material">
          <el-input v-model="editForm.material" maxlength="30" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item label="上传图片" prop="coverImages">
          <el-upload
            action="#"
            :auto-upload="false"
            :limit="1"
            :file-list="fileList"
            list-type="picture-card"
            accept="image/*"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :on-exceed="handleExceed"
          >
            <span>+ 上传</span>
          </el-upload>
        </el-form-item>

        <el-form-item label="取件方式" prop="pickUpType">
          <el-select v-model="editForm.pickUpType" placeholder="请选择取件方式" style="width: 100%">
            <el-option label="自提" :value="1" />
            <el-option label="邮寄" :value="2" />
            <el-option label="均可" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="所在地区" prop="address">
          <el-input v-model="editForm.address" maxlength="30" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDictList } from '@/api/dict'
import { getMyGoodsList, updateGoods, uploadGoodsImage } from '@/api/goods'

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const goodsList = ref([])
const categories = ref([])
const page = ref(1)
const pageSize = ref(8)
const total = ref(0)
const editVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const fileList = ref([])
const imageFile = ref(null)

const editForm = reactive({
  goodsTypeCode: '',
  title: '',
  name: '',
  oldDegree: '',
  fitAge: '',
  size: '',
  season: '',
  material: '',
  description: '',
  coverImages: '',
  pickUpType: 1,
  address: '',
})

const rules = {
  goodsTypeCode: [{ required: true, message: '请选择分类', trigger: 'change' }],
  title: [{ required: true, message: '请输入发布标题', trigger: 'blur' }],
  name: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
  oldDegree: [{ required: true, message: '请选择成色', trigger: 'change' }],
  description: [{ required: true, message: '请填写描述', trigger: 'blur' }],
  coverImages: [{ required: true, message: '请上传图片', trigger: 'change' }],
  address: [{ required: true, message: '请填写地区', trigger: 'blur' }],
}

const statusLabelMap = {
  draft: '待审核',
  online: '已上架',
  offline: '已下架',
}

const statusTypeMap = {
  draft: 'warning',
  online: 'success',
  offline: 'info',
}

const categoryOptions = computed(() => categories.value)
const latestUpdateTime = computed(() => {
  const first = goodsList.value[0]
  return first ? formatTime(first.updateTime || first.createTime) : '暂无'
})

function normalizeListResponse(res) {
  const records = Array.isArray(res?.records) ? res.records : Array.isArray(res?.data?.records) ? res.data.records : Array.isArray(res) ? res : []
  const totalValue = Number(res?.total ?? res?.data?.total ?? records.length ?? 0)
  return { records, total: totalValue }
}

function normalizeDictList(res) {
  const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
  return list
    .sort((a, b) => Number(a?.sort || 0) - Number(b?.sort || 0))
    .map((item) => ({ key: item?.dictCode || String(item?.id || ''), name: item?.dictName || '未分类' }))
}

function normalizeImage(value) {
  if (Array.isArray(value)) return normalizeImage(value[0])
  if (typeof value !== 'string') return ''
  const normalized = value.trim()
  if (!normalized) return ''
  if (normalized.startsWith('data:')) return normalized
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized
  return `data:image/jpeg;base64,${normalized}`
}

function resolveImageKey(uploadRes) {
  if (typeof uploadRes === 'string') return uploadRes
  return uploadRes?.data?.url || ''
}

function getPickUpTypeLabel(value) {
  if (value === 1) return '自提'
  if (value === 2) return '邮寄'
  if (value === 3) return '均可'
  return '未知'
}

function normalizeStatus(status) {
  if (status === 1 || status === '1' || status === 'online' || status === '已上架') return 'online'
  if (status === 2 || status === '2' || status === 'offline' || status === '已下架') return 'offline'
  return 'draft'
}

function normalizeGoods(item) {
  return {
    ...item,
    statusKey: normalizeStatus(item?.status),
    image: item?.coverImages || 'https://picsum.photos/seed/market-default/600/400',
    description: String(item?.description || '').trim() || '暂无描述',
    condition: item?.oldDegree || '成色未知',
    pickUpTypeLabel: getPickUpTypeLabel(Number(item?.pickUpType || 0)),
  }
}

function formatTime(value) {
  if (!value) return '暂无'
  return String(value).replace('T', ' ').slice(0, 16)
}

function openDetail(item) {
  if (!item?.id) return
  router.push({ name: 'market-detail', params: { id: item.id } })
}

function openEdit(item) {
  editingId.value = item?.id || null
  editForm.goodsTypeCode = item?.goodsTypeCode || ''
  editForm.title = item?.title || ''
  editForm.name = item?.name || ''
  editForm.oldDegree = item?.oldDegree || ''
  editForm.fitAge = item?.fitAge || ''
  editForm.size = item?.size || ''
  editForm.season = item?.season || ''
  editForm.material = item?.material || ''
  editForm.description = item?.description || ''
  editForm.coverImages = item?.coverImages || ''
  editForm.pickUpType = Number(item?.pickUpType || 1)
  editForm.address = item?.address || ''
  fileList.value = item?.coverImages ? [{ name: 'cover', url: item.coverImages }] : []
  imageFile.value = null
  formRef.value?.clearValidate?.()
  editVisible.value = true
}

function handlePageChange(nextPage) {
  page.value = nextPage
  fetchGoods()
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}

async function handleFileChange(uploadFile, uploadFiles) {
  const raw = uploadFile?.raw
  if (!raw) return
  fileList.value = uploadFiles.slice(-1)
  imageFile.value = raw
  editForm.coverImages = await fileToDataUrl(raw)
  formRef.value?.validateField?.('coverImages')
}

function handleFileRemove() {
  fileList.value = []
  imageFile.value = null
  editForm.coverImages = ''
}

function handleExceed() {
  ElMessage.warning('仅支持上传 1 张图片')
}

async function fetchCategories() {
  try {
    const res = await getDictList('idleGoods')
    categories.value = normalizeDictList(res)
  } catch (error) {
    categories.value = []
  }
}

async function fetchGoods() {
  loading.value = true
  try {
    const res = await getMyGoodsList({ page: page.value, size: pageSize.value })
    const { records, total: totalValue } = normalizeListResponse(res)
    goodsList.value = records.map(normalizeGoods)
    total.value = totalValue
  } catch (error) {
    goodsList.value = []
    total.value = 0
    ElMessage.error(error?.message || '获取我的闲置物品失败')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!editingId.value || saving.value) return
  try {
    saving.value = true
    await formRef.value?.validate()

    let coverImages = editForm.coverImages
    if (imageFile.value) {
      const uploadRes = await uploadGoodsImage(imageFile.value)
      coverImages = resolveImageKey(uploadRes)
    }

    await updateGoods({
      goodsTypeCode: editForm.goodsTypeCode,
      title: editForm.title,
      name: editForm.name,
      coverImages,
      description: editForm.description,
      fitAge: editForm.fitAge,
      size: editForm.size,
      season: editForm.season,
      material: editForm.material,
      oldDegree: editForm.oldDegree,
      pickUpType: Number(editForm.pickUpType || 1),
      address: editForm.address,
    }, editingId.value)

    ElMessage.success('更新成功')
    editVisible.value = false
    await fetchGoods()
  } catch (error) {
    ElMessage.error(error?.message || '更新闲置物品失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await fetchCategories()
  await fetchGoods()
})
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.my-goods-panel {
  padding: 24px;
}

.panel-title {
  font-size: 24px;
  line-height: 1.3;
  font-weight: 700;
  color: #0f172a;
}

.panel-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: #64748b;
}

.stats-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 18px;
  border-radius: 12px;
  background: #f8fafc;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.stat-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.stat-value-sm {
  font-size: 16px;
}

.list-wrap {
  margin-top: 24px;
  min-height: 240px;
}

.empty-state {
  padding: 48px 16px;
  border-radius: 12px;
  background: #f8fafc;
  text-align: center;
  color: #64748b;
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goods-card {
  padding: 18px;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
}

.goods-cover {
  width: 96px;
  height: 96px;
  border-radius: 12px;
  overflow: hidden;
  background: #f1f5f9;
  cursor: pointer;
}

.goods-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-main {
  min-width: 0;
  cursor: pointer;
}

.goods-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.goods-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.goods-meta,
.goods-extra {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #64748b;
}

.goods-desc {
  margin-top: 8px;
  color: #475569;
  line-height: 1.7;
}

.goods-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.pagination-wrap {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 960px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .goods-card {
    grid-template-columns: 1fr;
  }

  .goods-cover {
    width: 100%;
    height: 220px;
  }

  .goods-actions {
    align-items: stretch;
  }
}

</style>
