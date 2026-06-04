<template>
  <div class="my-courses-panel">
    <div class="panel-header">
      <div>
        <div class="panel-title">我的课程</div>
        <div class="panel-sub">管理自己发布的课程，支持编辑和下架操作</div>
      </div>
      <el-button size="small" type="primary" :loading="loading" @click="refreshCourses">刷新列表</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="courses"
      stripe
      border
      class="courses-table"
    >
      <el-table-column label="封面" width="120">
        <template #default="{ row }">
          <div class="cover-cell">
            <img :src="getCoverPreview(row)" alt="cover" />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="课程标题" min-width="220" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="statusTag(row.auditStatus)">{{ statusLabel(row.auditStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="讲师" prop="expertNickname" min-width="140" />
      <el-table-column label="时长" width="110">
        <template #default="{ row }">
          {{ formatDuration(row.durationSeconds) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" type="info" plain @click.stop="openCourseDetail(row)">查看</el-button>
          <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">下架</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="课程详情"
      v-model="detailDialogVisible"
      width="960px"
      :destroy-on-close="true"
      append-to-body
      @close="handleDetailDialogClose"
    >
      <CourseDetailView :course-id="detailCourseId" :visible="detailDialogVisible" />
    </el-dialog>

    <el-dialog title="编辑课程" v-model="editDialogVisible" width="520px">
      <el-form label-width="120px" :model="editForm">
        <el-form-item label="课程标题">
          <el-input v-model="editForm.title" maxlength="80" />
        </el-form-item>
        <el-form-item label="课程简介">
          <el-input type="textarea" v-model="editForm.courseDesc" :rows="3" maxlength="300" />
        </el-form-item>
        <el-form-item label="封面路径">
          <el-input v-model="editForm.coverUrl" placeholder="ObjectKey 或预览 URL" />
        </el-form-item>
        <el-form-item label="时长（分钟）">
          <el-input-number v-model="editForm.durationMinutes" :min="1" :max="1440" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSubmitting" @click="submitEdit">确认保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyCourseList, updateCourse, deleteCourse, lectureViewImages } from '@/api/course'
import CourseDetailView from '@/views/courses/components/CourseDetailView.vue'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const isExpert = computed(() => appStore.role === '专家')

const courses = ref([])
const loading = ref(false)
const editDialogVisible = ref(false)
const editSubmitting = ref(false)
const editForm = reactive({
  title: '',
  courseDesc: '',
  coverUrl: '',
  durationMinutes: 60,
})
const currentCourse = ref(null)

const statusMap = {
  0: '待审核',
  1: '已上线',
  2: '驳回',
  3: '下架',
}

const coverPreviewMap = ref(new Map())
const detailDialogVisible = ref(false)
const detailCourseId = ref(null)

function statusLabel(status) {
  return statusMap[status] || '未知'
}

function statusTag(status) {
  if (status === 1) return 'success'
  if (status === 0) return 'warning'
  if (status === 2) return 'info'
  if (status === 3) return 'danger'
  return 'info'
}

function formatDuration(durationSeconds) {
  const seconds = Number(durationSeconds || 0)
  if (!seconds) return '0 分钟'
  const minutes = Math.max(1, Math.round(seconds / 60))
  return minutes >= 60 ? `${(minutes / 60).toFixed(1)} 小时` : `${minutes} 分钟`
}

async function loadMyCourses() {
  if (!isExpert.value) return
  loading.value = true
  cleanupCoverPreviews()
  try {
    const res = await getMyCourseList({ page: 1, size: 30 })
    const list = Array.isArray(res?.records) ? res.records : Array.isArray(res) ? res : []
    courses.value = list
    await populateCoverPreviews(list)
  } catch (error) {
    ElMessage.error(error?.message || '获取课程失败')
  } finally {
    loading.value = false
  }
}

function refreshCourses() {
  loadMyCourses()
}

function getCoverPreview(course) {
  const key = course?.coverUrl || course?.cover
  if (!key) return ''
  return coverPreviewMap.value.get(key) || key
}

function openCourseDetail(course) {
  const id = course?.id || course?.courseId || course?.raw?.id
  if (!id) {
    ElMessage.warning('无法查看课程详情')
    return
  }
  detailCourseId.value = id
  detailDialogVisible.value = true
}

function handleDetailDialogClose() {
  detailDialogVisible.value = false
  detailCourseId.value = null
}

function cleanupCoverPreviews() {
  coverPreviewMap.value.forEach((url) => {
    if (typeof url === 'string' && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
  coverPreviewMap.value.clear()
}

async function populateCoverPreviews(list) {
  const tasks = (list || []).map(async (course) => {
    const key = course?.coverUrl
    if (!key || coverPreviewMap.value.has(key)) return
    try {
      const buffer = await lectureViewImages(key)
      if (!buffer) return
      const blob = new Blob([buffer], { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)
      coverPreviewMap.value.set(key, url)
    } catch (error) {
      console.error('封面预览失败', error)
    }
  })
  await Promise.all(tasks)
}

function handleEdit(course) {
  currentCourse.value = course
  editForm.title = course.title || ''
  editForm.courseDesc = course.courseDesc || course.description || ''
  editForm.coverUrl = course.coverUrl || course.cover || ''
  editForm.durationMinutes = Math.max(1, Math.round((course.durationSeconds || 60) / 60))
  editDialogVisible.value = true
}

async function submitEdit() {
  if (!currentCourse.value) return
  if (!editForm.title.trim()) {
    ElMessage.warning('请输入课程标题')
    return
  }

  editSubmitting.value = true
  try {
    const payload = {
      ...currentCourse.value,
      title: editForm.title.trim(),
      courseDesc: editForm.courseDesc.trim(),
      coverUrl: editForm.coverUrl.trim(),
      durationSeconds: Math.max(60, Math.round(Number(editForm.durationMinutes) * 60)),
    }
    await updateCourse(payload)
    ElMessage.success('课程已更新')
    editDialogVisible.value = false
    await loadMyCourses()
  } catch (error) {
    ElMessage.error(error?.message || '更新失败')
  } finally {
    editSubmitting.value = false
  }
}

async function handleDelete(course) {
  const confirm = await ElMessageBox.confirm('下架后用户将无法继续访问该课程，是否继续？', '确认下架', {
    type: 'warning',
  }).catch(() => false)

  if (!confirm) return

  try {
    await deleteCourse(course.id)
    ElMessage.success('课程已下架')
    await loadMyCourses()
  } catch (error) {
    ElMessage.error(error?.message || '下架失败')
  }
}

watch(isExpert, (val) => {
  if (val) {
    loadMyCourses()
  } else {
    courses.value = []
  }
})

onMounted(() => {
  if (isExpert.value) {
    loadMyCourses()
  }
})
</script>

<style scoped>
.my-courses-panel {
  padding: 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
}

.panel-sub {
  color: rgba(100, 116, 139, 1);
  font-size: 14px;
}

.cover-cell img {
  width: 100%;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.courses-table .el-table__body-wrapper {
  max-height: 460px;
}
</style>
