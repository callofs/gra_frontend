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

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model.trim="registerForm.nickname" placeholder="请输入昵称" autocomplete="nickname" />
        </el-form-item>

        <el-form-item label="电话" prop="phone">
          <el-input v-model.trim="registerForm.phone" placeholder="请输入电话" autocomplete="tel" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="registerForm.role" @change="onRoleChange">
            <el-radio :value="1">普通用户</el-radio>
            <el-radio :value="2">专家</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="registerForm.role === 2" label="认证材料" prop="certFile">
          <el-upload
            :auto-upload="false"
            :limit="1"
            :show-file-list="true"
            :on-change="onCertFileChange"
            :on-remove="onCertFileRemove"
            :before-upload="beforeCertFileUpload"
            accept=".doc,.docx,.pdf"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">仅支持 doc / docx / pdf</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="邮箱（可选）" prop="email">
          <el-input v-model.trim="registerForm.email" placeholder="请输入邮箱" autocomplete="email" />
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
  nickname: '',
  phone: '',
  role: 1,
  email: '',
  certFile: null,
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
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
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^\d{6,20}$/, message: '电话格式不正确', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  certFile: [
    {
      required: true,
      validator: (_, value, callback) => {
        if (registerForm.role === 2 && !value) {
          callback(new Error('请上传认证材料'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
  email: [
    {
      validator: (_, value, callback) => {
        if (!value) {
          callback()
          return
        }
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        callback(ok ? undefined : new Error('邮箱格式不正确'))
      },
      trigger: 'blur',
    },
  ],
}

function resetError() {
  error.value = ''
}

function switchForm(type) {
  formType.value = type
  resetError()
}

function onRoleChange() {
  if (registerForm.role !== 2) {
    registerForm.certFile = null
    registerFormRef.value?.clearValidate?.(['certFile'])
  }
}

function beforeCertFileUpload(file) {
  const name = String(file?.name || '').toLowerCase()
  const ok = name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.pdf')
  if (!ok) {
    ElMessage.error('仅支持 doc / docx / pdf 文件')
  }
  return ok
}

function onCertFileChange(uploadFile) {
  const raw = uploadFile?.raw || null
  if (!raw) {
    registerForm.certFile = null
    registerFormRef.value?.validateField?.('certFile')
    return
  }

  const ok = beforeCertFileUpload(raw)
  if (!ok) {
    registerForm.certFile = null
    return
  }

  registerForm.certFile = raw
  registerFormRef.value?.validateField?.('certFile')
}

function onCertFileRemove() {
  registerForm.certFile = null
  registerFormRef.value?.validateField?.('certFile')
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
    const authed = await appStore.initAuth(true)
    if (!authed) {
      appStore.setUserInfo(result?.userInfo || { username: loginForm.username })
      appStore.setAuthInitialized(true)
    }

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

    const fd = new FormData()
    fd.append('username', registerForm.username)
    fd.append('password', registerForm.password)
    fd.append('nickname', registerForm.nickname)
    fd.append('phone', registerForm.phone)
    fd.append('role', String(registerForm.role))
    if (registerForm.email) fd.append('email', registerForm.email)
    if (registerForm.role === 2 && registerForm.certFile) {
      fd.append('certificationFile', registerForm.certFile)
    }

    await register(fd)

    ElMessage.success('注册成功，请登录')
    loginForm.username = registerForm.username
    loginForm.password = ''
    registerForm.username = ''
    registerForm.password = ''
    registerForm.nickname = ''
    registerForm.phone = ''
    registerForm.role = 1
    registerForm.email = ''
    registerForm.certFile = null
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
