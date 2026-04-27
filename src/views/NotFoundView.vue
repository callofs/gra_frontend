<template>
  <div class="page">
    <div class="card">
      <div class="code">404</div>
      <div class="title">页面不存在</div>
      <div class="sub">你访问的地址没有对应页面。</div>
      <button class="btn" type="button" @click="go">返回首页</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function go() {
  router.replace('/home')
}
</script>

<style scoped>
.page {
  min-height: calc(100vh - 110px);
  display: grid;
  place-items: center;
  padding: 16px;
}

.card {
  width: min(520px, 100%);
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  padding: 18px;
  text-align: center;
}

.code {
  font-weight: 900;
  font-size: 56px;
  color: rgba(37, 99, 235, 0.95);
}

.title {
  margin-top: 4px;
  font-weight: 900;
  color: rgba(15, 23, 42, 0.92);
  font-size: 18px;
}

.sub {
  margin-top: 8px;
  color: rgba(15, 23, 42, 0.62);
}

.btn {
  margin-top: 14px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: #2563eb;
  color: #fff;
  padding: 0 14px;
  cursor: pointer;
  font-weight: 650;
}
</style>
