<template>
  <section class="expert-schedule-panel card">
    <div class="panel-header">
      <div>
        <div class="panel-title">排班管理</div>
        <div class="panel-subtitle">维护你的专家咨询排班，控制可预约时段与人数。</div>
      </div>
      <el-button type="primary" @click="openCreateDialog">新增排班</el-button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">排班总数</div>
        <div class="stat-value">{{ total }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">可预约</div>
        <div class="stat-value">{{ availableCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已满</div>
        <div class="stat-value">{{ fullCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已关闭</div>
        <div class="stat-value">{{ closedCount }}</div>
      </div>
    </div>

    <div v-loading="loading" class="list-wrap">
      <div v-if="!loading && schedules.length === 0" class="empty-state">你还没有创建任何咨询排班</div>

      <div v-else class="schedule-list">
        <div v-for="item in schedules" :key="item.id" class="schedule-card">
          <div class="schedule-main">
            <div class="schedule-title-row">
              <div class="schedule-title">{{ item.scheduleDate }} {{ item.timeSlot }}</div>
              <el-tag :type="statusTypeMap[item.status] || 'info'">{{ statusLabelMap[item.status] || '未知状态' }}</el-tag>
            </div>
            <div class="schedule-meta">
              <span>已预约 {{ item.reservedCount }}/{{ item.maxReserveCount }}</span>
              <span>更新时间 {{ formatTime(item.updateTime || item.createTime) }}</span>
            </div>
          </div>

          <div class="schedule-actions">
            <el-button size="small" @click="openEditDialog(item)">编辑</el-button>
            <el-button size="small" type="danger" plain :disabled="item.reservedCount > 0" @click="handleDelete(item)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑排班' : '新增排班'" width="520px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="排班日期" prop="scheduleDate">
          <el-date-picker v-model="form.scheduleDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择排班日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="时间段" prop="timeSlot">
          <el-select v-model="form.timeSlot" placeholder="请选择时间段" style="width: 100%">
            <el-option v-for="slot in timeSlotOptions" :key="slot" :label="slot" :value="slot" />
          </el-select>
        </el-form-item>
        <el-form-item label="最大人数" prop="maxReserveCount">
          <el-input-number v-model="form.maxReserveCount" :min="1" :max="99" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="editingId" label="排班状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="可预约" :value="0" />
            <el-option label="已满" :value="1" />
            <el-option label="已关闭" :value="2" />
          </el-select>
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
import { createExpertSchedule, deleteExpertSchedule, getMyExpertSchedules, updateExpertSchedule } from '@/api/expertSchedule'

const loading = ref(false)
const saving = ref(false)
const schedules = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref()

const form = reactive({
  scheduleDate: '',
  timeSlot: '',
  maxReserveCount: 1,
  status: 0,
})

const rules = {
  scheduleDate: [{ required: true, message: '请选择排班日期', trigger: 'change' }],
  timeSlot: [{ required: true, message: '请输入时间段', trigger: 'blur' }],
  maxReserveCount: [{ required: true, message: '请输入最大预约人数', trigger: 'change' }],
  status: [{ required: true, message: '请选择排班状态', trigger: 'change' }],
}

const statusLabelMap = {
  0: '可预约',
  1: '已满',
  2: '已关闭',
}

const statusTypeMap = {
  0: 'success',
  1: 'warning',
  2: 'info',
}

const timeSlotOptions = Array.from({ length: 10 }, (_, index) => {
  const startHour = 8 + index
  const endHour = startHour + 1
  return `${String(startHour).padStart(2, '0')}:00-${String(endHour).padStart(2, '0')}:00`
})

const availableCount = computed(() => schedules.value.filter((item) => Number(item.status) === 0).length)
const fullCount = computed(() => schedules.value.filter((item) => Number(item.status) === 1).length)
const closedCount = computed(() => schedules.value.filter((item) => Number(item.status) === 2).length)

function normalizeListResponse(res) {
  const list = Array.isArray(res) ? res : Array.isArray(res?.records) ? res.records : []
  const totalValue = Number(res?.total ?? list.length ?? 0)
  return { list, total: totalValue }
}

function formatTime(value) {
  if (!value) return '未知时间'
  return String(value).replace('T', ' ').slice(0, 16)
}

function resetForm() {
  editingId.value = null
  form.scheduleDate = ''
  form.timeSlot = ''
  form.maxReserveCount = 1
  form.status = 0
  formRef.value?.clearValidate?.()
}

async function fetchSchedules() {
  loading.value = true
  try {
    const res = await getMyExpertSchedules(page.value, pageSize.value)
    const { list, total: totalValue } = normalizeListResponse(res)
    schedules.value = list
    total.value = totalValue
  } catch (error) {
    schedules.value = []
    total.value = 0
    ElMessage.error(error?.message || '获取排班列表失败')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(item) {
  editingId.value = item?.id || null
  form.scheduleDate = item?.scheduleDate || ''
  form.timeSlot = item?.timeSlot || ''
  form.maxReserveCount = Number(item?.maxReserveCount || 1)
  form.status = Number(item?.status || 0)
  formRef.value?.clearValidate?.()
  dialogVisible.value = true
}

async function handleSave() {
  const ok = await formRef.value?.validate?.().catch(() => false)
  if (!ok) return

  saving.value = true
  try {
    const payload = {
      scheduleDate: form.scheduleDate,
      timeSlot: String(form.timeSlot || '').trim(),
      maxReserveCount: Number(form.maxReserveCount || 1),
    }

    if (editingId.value) {
      await updateExpertSchedule({
        id: editingId.value,
        ...payload,
        status: Number(form.status || 0),
      })
      ElMessage.success('排班修改成功')
    } else {
      await createExpertSchedule(payload)
      ElMessage.success('排班创建成功')
    }

    dialogVisible.value = false
    await fetchSchedules()
  } catch (error) {
    ElMessage.error(error?.message || '保存排班失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(item) {
  if (!item?.id) return

  try {
    await ElMessageBox.confirm('删除后将无法恢复，确定继续吗？', '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await deleteExpertSchedule(item.id)
    ElMessage.success('排班删除成功')
    if (schedules.value.length === 1 && page.value > 1) {
      page.value -= 1
    }
    await fetchSchedules()
  } catch (error) {
    if (error === 'cancel') return
    ElMessage.error(error?.message || '删除排班失败')
  }
}

function handlePageChange(nextPage) {
  page.value = nextPage
  fetchSchedules()
}

onMounted(fetchSchedules)
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.expert-schedule-panel {
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

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-card {
  padding: 18px;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.schedule-main {
  min-width: 0;
  flex: 1;
}

.schedule-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.schedule-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.schedule-meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #64748b;
}

.schedule-actions {
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

  .schedule-card {
    flex-direction: column;
    align-items: stretch;
  }

  .schedule-title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .schedule-actions {
    align-items: stretch;
  }
}
</style>
