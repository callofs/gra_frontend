<template>
  <el-dialog v-model="visible" title="讲座预约" width="520px" :close-on-click-modal="false">
    <div v-if="lecture?.title" class="lecture-line">讲座：{{ lecture.title }}</div>
    <div v-if="lecture?.expert" class="lecture-line">讲师：{{ lecture.expert }}</div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
      <el-form-item label="称呼" prop="name">
        <el-input v-model="form.name" placeholder="请输入您的称呼" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="问题" prop="question">
        <el-input v-model="form.question" type="textarea" :rows="3" placeholder="想听讲座重点 / 想咨询的问题（选填）" />
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
  lecture: { type: Object, default: null },
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
  question: '',
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
  form.question = ''
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
    lecture: props.lecture,
    form: { ...form },
  })
  visible.value = false
}
</script>

<style scoped>
.lecture-line {
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(71, 85, 105, 1);
}
</style>
