<template>
  <el-dialog v-model="visible" title="预约专家" width="520px" :close-on-click-modal="false">
    <div v-if="expert?.name" class="expert-line">当前专家：{{ expert.name }}</div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
      <el-form-item label="预约时段" prop="scheduleId">
        <el-select v-model="form.scheduleId" placeholder="请选择预约时段" style="width: 100%">
          <el-option
            v-for="schedule in scheduleOptions"
            :key="schedule.id"
            :label="schedule.label"
            :value="schedule.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="咨询方式" prop="consultType">
        <el-select v-model="form.consultType" placeholder="请选择咨询方式" style="width: 100%">
          <el-option label="图文" :value="1" />
          <el-option label="语音" :value="2" />
          <el-option label="视频" :value="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="联系方式" prop="contactInfo">
        <el-input v-model="form.contactInfo" placeholder="请输入手机号或其他联系方式" />
      </el-form-item>

      <el-form-item label="问题描述" prop="questionDesc">
        <el-input v-model="form.questionDesc" type="textarea" :rows="4" placeholder="请简要描述你的咨询问题" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交预约</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  expert: { type: Object, default: null },
  schedules: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const formRef = ref()

const scheduleOptions = computed(() => {
  return (props.schedules || []).map((schedule) => ({
    ...schedule,
    label: `${schedule.scheduleDate || ''} ${schedule.timeSlot || ''}（${schedule.reservedCount || 0}/${schedule.maxReserveCount || 0}）`,
  }))
})

const form = reactive({
  scheduleId: '',
  consultType: 1,
  contactInfo: '',
  questionDesc: '',
})

const rules = {
  scheduleId: [{ required: true, message: '请选择预约时段', trigger: 'change' }],
  consultType: [{ required: true, message: '请选择咨询方式', trigger: 'change' }],
  contactInfo: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  questionDesc: [{ required: true, message: '请输入问题描述', trigger: 'blur' }],
}

function resetForm() {
  form.scheduleId = ''
  form.consultType = 1
  form.contactInfo = ''
  form.questionDesc = ''
  formRef.value?.clearValidate?.()
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) resetForm()
  },
)

function handleCancel() {
  visible.value = false
}

async function handleSubmit() {
  const ok = await formRef.value?.validate?.().catch(() => false)
  if (!ok) return

  emit('submit', {
    expert: props.expert,
    schedule: props.schedules.find((item) => item.id === form.scheduleId) || null,
    form: { ...form },
  })
  visible.value = false
}
</script>

<style scoped>
.expert-line {
  margin-bottom: 12px;
  font-size: 14px;
  color: rgba(71, 85, 105, 1);
}
</style>
