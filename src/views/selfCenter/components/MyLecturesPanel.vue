<template>
  <section class="my-lectures-panel card">
    <div class="panel-header">
      <div>
        <div class="panel-title">我的讲座</div>
        <div class="panel-subtitle">管理你发布的讲座，支持修改内容和删除讲座。</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">讲座总数</div>
        <div class="stat-value">{{ total }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">未结束</div>
        <div class="stat-value">{{ upcomingCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已结束</div>
        <div class="stat-value">{{ endedCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">总报名数</div>
        <div class="stat-value">{{ totalSignups }}</div>
      </div>
    </div>

    <div v-loading="loading" class="list-wrap">
      <div v-if="!loading && lectures.length === 0" class="empty-state">你还没有发布过讲座</div>

      <div v-else class="lecture-list">
        <div v-for="item in lectures" :key="item.id" class="lecture-card">
          <div class="lecture-main">
            <div class="lecture-title-row">
              <div class="lecture-title">{{ item.title }}</div>
              <el-tag :type="item.ended ? 'info' : 'success'">{{ item.ended ? '已结束' : '进行中' }}</el-tag>
            </div>
            <div class="lecture-meta">
              <span>讲座时间 {{ formatTime(item.lectureTime) }}</span>
              <span>地点 {{ item.liveUrl || '待定' }}</span>
              <span>报名 {{ item.signUpCount }}/{{ item.maxSignUp }}</span>
            </div>
            <div class="lecture-desc">{{ item.description || '暂无讲座描述' }}</div>
          </div>

          <div class="lecture-actions">
            <el-button size="small" @click="openEditDialog(item)">修改</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(item)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" title="修改讲座" width="560px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="讲座标题" prop="title">
          <el-input v-model="form.title" maxlength="100" />
        </el-form-item>
        <el-form-item label="讲座描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="讲座时间" prop="lectureTime">
          <el-date-picker v-model="form.lectureTime" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="讲座地点" prop="liveUrl">
          <el-input v-model="form.liveUrl" maxlength="100" />
        </el-form-item>
        <el-form-item label="最大人数" prop="maxSignUp">
          <el-input-number v-model="form.maxSignUp" :min="1" :max="1000" style="width: 100%" />
        </el-form-item>
        <el-form-item label="封面图片">
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
            <span class="upload-text">+ 上传</span>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteLecture, getExpertLectures, lectureViewImages, updateLecture, uploadLectureImage } from '@/api/lecture'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const loading = ref(false)
const saving = ref(false)
const lectures = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const editingLectureId = ref(null)
const formRef = ref()
const fileList = ref([])
const imageFile = ref(null)

const form = reactive({
  title: '',
  description: '',
  lectureTime: '',
  liveUrl: '',
  maxSignUp: 100,
  cover: '',
})

const rules = {
  title: [{ required: true, message: '请输入讲座标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入讲座描述', trigger: 'blur' }],
  lectureTime: [{ required: true, message: '请选择讲座时间', trigger: 'change' }],
  liveUrl: [{ required: true, message: '请输入讲座地点', trigger: 'blur' }],
  maxSignUp: [{ required: true, message: '请输入最大人数', trigger: 'change' }],
}

const upcomingCount = computed(() => lectures.value.filter((item) => !item.ended).length)
const endedCount = computed(() => lectures.value.filter((item) => item.ended).length)
const totalSignups = computed(() => lectures.value.reduce((sum, item) => sum + Number(item.signUpCount || 0), 0))

function toDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatTime(value) {
  const date = toDate(value)
  if (!date) return '未知时间'
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}

function resolveImageKey(uploadRes) {
  if (typeof uploadRes === 'string') return uploadRes
  return uploadRes?.data?.url || ''
}

async function resolveLectureCover(value) {
  if (!value || typeof value !== 'string') return ''
  const normalized = value.trim()
  if (!normalized) return ''
  if (normalized.startsWith('data:image')) return normalized
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized
  if (normalized.startsWith('/')) return normalized
  try {
    const result = await lectureViewImages(normalized)
    return typeof result === 'string' ? result : result?.data || normalized
  } catch (error) {
    return normalized
  }
}

function normalizeListResponse(res) {
  const source = res?.records ? res : res?.data?.records ? res.data : res?.data || res
  const list = Array.isArray(source?.records) ? source.records : Array.isArray(source) ? source : []
  const totalValue = Number(source?.total ?? list.length ?? 0)
  return { list, total: totalValue }
}

async function normalizeLecture(item) {
  const lectureTime = item?.lectureTime || item?.startTime || ''
  const date = toDate(lectureTime)
  return {
    ...item,
    signUpCount: Number(item?.signUpCount ?? item?.signedCount ?? 0),
    maxSignUp: Number(item?.maxSignUp ?? item?.maxParticipants ?? 0),
    ended: date ? date.getTime() < Date.now() : false,
    coverPreview: await resolveLectureCover(item?.coverImage || item?.cover || item?.image || ''),
  }
}

async function fetchLectures() {
  const expertId = appStore.userInfo?.id
  if (!expertId) {
    lectures.value = []
    total.value = 0
    return
  }

  loading.value = true
  try {
    const res = await getExpertLectures(expertId, page.value, pageSize.value)
    const { list, total: totalValue } = normalizeListResponse(res)
    lectures.value = await Promise.all(list.map(normalizeLecture))
    total.value = totalValue
  } catch (error) {
    lectures.value = []
    total.value = 0
    ElMessage.error(error?.message || '获取我的讲座失败')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  editingLectureId.value = null
  form.title = ''
  form.description = ''
  form.lectureTime = ''
  form.liveUrl = ''
  form.maxSignUp = 100
  form.cover = ''
  fileList.value = []
  imageFile.value = null
  formRef.value?.clearValidate?.()
}

function openEditDialog(item) {
  editingLectureId.value = item?.id || null
  form.title = item?.title || ''
  form.description = item?.description || ''
  form.lectureTime = item?.lectureTime ? String(item.lectureTime).slice(0, 19) : ''
  form.liveUrl = item?.liveUrl || ''
  form.maxSignUp = Number(item?.maxSignUp || 100)
  form.cover = item?.coverImage || item?.cover || ''
  fileList.value = item?.coverPreview ? [{ name: 'cover', url: item.coverPreview }] : []
  imageFile.value = null
  formRef.value?.clearValidate?.()
  dialogVisible.value = true
}

async function handleFileChange(uploadFile, uploadFiles) {
  const raw = uploadFile?.raw
  if (!raw) return
  try {
    fileList.value = uploadFiles.slice(-1)
    imageFile.value = raw
    form.cover = await fileToDataUrl(raw)
  } catch (error) {
    ElMessage.error('图片处理失败')
  }
}

function handleFileRemove() {
  form.cover = ''
  fileList.value = []
  imageFile.value = null
}

function handleExceed() {
  ElMessage.warning('仅支持上传 1 张图片')
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !editingLectureId.value) return

  saving.value = true
  try {
    let coverImage = form.cover
    if (imageFile.value) {
      const uploadRes = await uploadLectureImage(imageFile.value)
      coverImage = resolveImageKey(uploadRes)
      if (!coverImage) {
        throw new Error('图片上传结果无效')
      }
    }

    await updateLecture({
      id: editingLectureId.value,
      title: form.title,
      description: form.description,
      lectureTime: new Date(form.lectureTime).toISOString(),
      liveUrl: form.liveUrl,
      maxSignUp: Number(form.maxSignUp || 1),
      cover: coverImage,
    })

    ElMessage.success('讲座修改成功')
    dialogVisible.value = false
    resetForm()
    await fetchLectures()
  } catch (error) {
    ElMessage.error(error?.message || '修改讲座失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(item) {
  if (!item?.id) return

  try {
    await ElMessageBox.confirm('删除后该讲座将不可恢复，确定继续吗？', '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await deleteLecture(item.id)
    ElMessage.success('讲座删除成功')
    if (lectures.value.length === 1 && page.value > 1) {
      page.value -= 1
    }
    await fetchLectures()
  } catch (error) {
    if (error === 'cancel') return
    ElMessage.error(error?.message || '删除讲座失败')
  }
}

function handlePageChange(nextPage) {
  page.value = nextPage
  fetchLectures()
}

onMounted(fetchLectures)
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.my-lectures-panel {
  padding: 24px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

.lecture-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lecture-card {
  padding: 18px;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.lecture-main {
  min-width: 0;
  flex: 1;
}

.lecture-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.lecture-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.lecture-meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #64748b;
}

.lecture-desc {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.7;
  color: #475569;
}

.lecture-actions {
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

.upload-text {
  color: rgba(100, 116, 139, 1);
  font-size: 14px;
}

@media (max-width: 960px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .lecture-card,
  .lecture-title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .lecture-actions {
    align-items: stretch;
  }
}
</style>
