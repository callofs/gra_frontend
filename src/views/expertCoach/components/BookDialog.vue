<template>
  <el-dialog v-model="visible" title="预约专家" width="520px" :close-on-click-modal="false">
    <div v-if="expert?.name" class="expert-line">当前专家：{{ expert.name }}</div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
      <el-form-item label="称呼" prop="name">
        <el-input v-model="form.name" placeholder="请输入您的称呼" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="预约日期" prop="date">
        <el-date-picker v-model="form.date" type="date" placeholder="选择日期" style="width: 100%" />
      </el-form-item>

      <el-form-item label="预约时间" prop="time">
        <el-time-select
          v-model="form.time"
          start="09:00"
          step="00:30"
          end="21:00"
          placeholder="选择时间"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可填写问题描述（选填）" />
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
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const formRef = ref()

const form = reactive({
  name: '',
  phone: '',
  date: '',
  time: '',
  remark: '',
})

const rules = {
  name: [{ required: true, message: '请输入称呼', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  time: [{ required: true, message: '请选择时间', trigger: 'change' }],
}

function resetForm() {
  form.name = ''
  form.phone = ''
  form.date = ''
  form.time = ''
  form.remark = ''
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
