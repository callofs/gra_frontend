<template>
  <el-dialog v-model="visible" title="课程报名" width="520px" :close-on-click-modal="false">
    <div v-if="course?.title" class="course-line">课程：{{ course.title }}</div>
    <div v-if="course?.instructor" class="course-line">讲师：{{ course.instructor }}</div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
      <el-form-item label="称呼" prop="name">
        <el-input v-model="form.name" placeholder="请输入您的称呼" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="选填：学习目标/需要关注的问题" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交报名</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  course: { type: Object, default: null },
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
  remark: '',
})

const rules = {
  name: [{ required: true, message: '请输入称呼', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
}

function resetForm() {
  form.name = ''
  form.phone = ''
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
    course: props.course,
    form: { ...form },
  })
  visible.value = false
}
</script>

<style scoped>
.course-line {
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(71, 85, 105, 1);
}
</style>
