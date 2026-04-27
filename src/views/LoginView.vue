<template>
  <div class="page">
    <div class="card">
      <div class="title">{{ formType === 'login' ? '登录' : '注册' }}</div>
      <div class="sub">家长育儿经验交流与互助平台</div>

      <el-form
        v-if="formType === 'login'"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="form"
        label-position="top"
        @submit.prevent="onSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="loginForm.username" placeholder="请输入用户名" autocomplete="username" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model.trim="loginForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
            autocomplete="current-password"
            @keyup.enter="onSubmit"
          />
        </el-form-item>

        <div v-if="error" class="error">{{ error }}</div>

        <el-button class="btn" type="primary" :loading="appStore.loading" @click="onSubmit">进入平台</el-button>
      </el-form>

      <el-form
        v-else
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="form"
        label-position="top"
        @submit.prevent="onRegister"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="registerForm.username" placeholder="请输入用户名" autocomplete="username" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model.trim="registerForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
            autocomplete="new-password"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model.trim="registerForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入密码"
            autocomplete="new-password"
            @keyup.enter="onRegister"
          />
        </el-form-item>

        <div v-if="error" class="error">{{ error }}</div>

        <el-button class="btn" type="primary" :loading="appStore.loading" @click="onRegister">注册账号</el-button>
      </el-form>

      <div class="hint">
        <span v-if="formType === 'login'" class="hint-action" @click="switchForm('register')">注册</span>
        <span v-else class="hint-action" @click="switchForm('login')">返回登录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login, register } from '@/api/user'
import { useAppStore } from '@/store/app'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const loginFormRef = ref()
const registerFormRef = ref()
const error = ref('')
const formType = ref('login')

const loginForm = reactive({
  username: '',
  password: '',
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const validateConfirmPassword = (_, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
    return
  }

  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }

  callback()
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为 2 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
}

function resetError() {
  error.value = ''
}

function switchForm(type) {
  formType.value = type
  resetError()
}

async function onSubmit() {
  resetError()

  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  try {
    appStore.setLoading(true)

    const result = await login({
      username: loginForm.username,
      password: loginForm.password,
    })

    appStore.setAuthenticated(true)
    appStore.setUserInfo(result?.userInfo || { username: loginForm.username })
    appStore.setAuthInitialized(true)

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
    router.replace(redirect)
  } catch (err) {
    error.value = err?.message || '登录失败'
    appStore.logout()
  } finally {
    appStore.setLoading(false)
  }
}

async function onRegister() {
  resetError()

  const valid = await registerFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  try {
    appStore.setLoading(true)

    await register({
      username: registerForm.username,
      password: registerForm.password,
    })

    ElMessage.success('注册成功，请登录')
    loginForm.username = registerForm.username
    loginForm.password = ''
    registerForm.username = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    switchForm('login')
  } catch (err) {
    error.value = err?.message || '注册失败'
  } finally {
    appStore.setLoading(false)
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
  background: radial-gradient(1200px 600px at 20% 10%, rgba(59, 130, 246, 0.25), transparent 60%),
    radial-gradient(900px 500px at 80% 30%, rgba(34, 197, 94, 0.22), transparent 60%),
    #0b1220;
}

.card {
  width: min(420px, 100%);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 18px;
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.92);
}

.title {
  font-size: 22px;
  font-weight: 750;
}

.sub {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.85;
}

.form {
  margin-top: 16px;
}

.btn {
  width: 100%;
  height: 42px;
  border-radius: 12px;
  font-weight: 650;
}

.error {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: rgba(255, 255, 255, 0.95);
  font-size: 13px;
}

.hint {
  margin-top: 12px;
  font-size: 12px;
  opacity: 0.82;
  line-height: 1.5;
  text-align: right;
}

.hint-action {
  cursor: pointer;
  color: #93c5fd;
}

:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.92);
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
}
</style>
