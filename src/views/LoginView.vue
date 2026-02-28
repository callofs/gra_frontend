<template>
  <div class="page">
    <div class="card">
      <div class="title">登录</div>
      <div class="sub">家长育儿经验交流与互助平台（前端演示）</div>

      <form class="form" @submit.prevent="onSubmit">
        <label class="field">
          <div class="label">用户名</div>
          <input v-model.trim="username" class="input" placeholder="请输入用户名" autocomplete="username" />
        </label>

        <label class="field">
          <div class="label">密码</div>
          <input v-model.trim="password" class="input" placeholder="请输入密码" type="password" autocomplete="current-password" />
        </label>

        <div v-if="error" class="error">{{ error }}</div>

        <button class="btn" type="submit">进入平台</button>

        <div class="hint">
          本页面不调用后端接口：任意输入均可登录。
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')

function onSubmit() {
  error.value = ''
  if (!username.value) {
    error.value = '请输入用户名'
    return
  }
  if (!password.value) {
    error.value = '请输入密码'
    return
  }

  localStorage.setItem('demo_token', String(Date.now()))
  localStorage.setItem('demo_user', username.value)

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/forum'
  router.replace(redirect)
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
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 13px;
  opacity: 0.9;
}

.input {
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.94);
  padding: 0 12px;
  outline: none;
}

.input:focus {
  border-color: rgba(99, 102, 241, 0.7);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
}

.btn {
  height: 42px;
  border: none;
  border-radius: 12px;
  background: #3b82f6;
  color: #fff;
  font-weight: 650;
  cursor: pointer;
}

.btn:hover {
  filter: brightness(1.05);
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
  font-size: 12px;
  opacity: 0.82;
  line-height: 1.5;
}
</style>
