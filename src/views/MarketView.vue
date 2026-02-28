<template>
  <div class="page">
    <div class="header">
      <div>
        <div class="title">用户闲置物品交易</div>
        <div class="sub">二手闲置物品发布与浏览（纯前端演示）</div>
      </div>
      <div class="actions">
        <input v-model.trim="keyword" class="input" placeholder="搜索物品/分类" />
        <button class="btn" type="button" @click="openPublish">发布闲置</button>
      </div>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="k">在售</div>
        <div class="v">{{ forSaleCount }}</div>
      </div>
      <div class="stat">
        <div class="k">已下架</div>
        <div class="v">{{ soldCount }}</div>
      </div>
      <div class="stat">
        <div class="k">收藏</div>
        <div class="v">{{ favorites.size }}</div>
      </div>
    </div>

    <div class="grid">
      <div v-for="item in filtered" :key="item.id" class="card">
        <div class="img" :style="{ background: item.color }">{{ item.short }}</div>
        <div class="body">
          <div class="row">
            <div class="name">{{ item.name }}</div>
            <div class="price">¥{{ item.price }}</div>
          </div>
          <div class="meta">
            <span>{{ item.category }}</span>
            <span>·</span>
            <span>{{ item.location }}</span>
          </div>
          <div class="desc">{{ item.desc }}</div>
          <div class="row bottom">
            <div class="seller">卖家：{{ item.seller }}</div>
            <div class="ops">
              <button class="mini" type="button" @click="toggleFav(item)">
                {{ favorites.has(item.id) ? '已收藏' : '收藏' }}
              </button>
              <button class="mini primary" type="button" @click="contact(item)">联系</button>
              <button v-if="item.status === 'for_sale'" class="mini ghost" type="button" @click="markSold(item)">
                下架
              </button>
              <span v-else class="sold">已下架</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showPublish" class="mask" @click.self="showPublish = false">
      <div class="modal">
        <div class="m-title">发布闲置</div>
        <div class="form">
          <div class="form-row">
            <input v-model.trim="form.name" class="input" placeholder="物品名称" />
            <input v-model.number="form.price" class="input" placeholder="价格" type="number" min="0" />
          </div>
          <div class="form-row">
            <input v-model.trim="form.category" class="input" placeholder="分类（如：玩具/童装/书籍）" />
            <input v-model.trim="form.location" class="input" placeholder="所在地（如：广州）" />
          </div>
          <textarea v-model.trim="form.desc" class="textarea" placeholder="描述（成色/适用年龄/交易方式）" />
          <div class="row right">
            <button class="btn ghost" type="button" @click="showPublish = false">取消</button>
            <button class="btn" type="button" @click="publish">发布</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const keyword = ref('')
const toast = ref('')
const favorites = reactive(new Set())

const items = ref([
  {
    id: 101,
    name: '儿童绘本套装（10本）',
    short: '绘本',
    price: 39,
    category: '书籍',
    location: '深圳',
    seller: '晴天妈妈',
    status: 'for_sale',
    color: 'linear-gradient(135deg, rgba(59,130,246,.22), rgba(99,102,241,.22))',
    desc: '适合3-6岁，九成新，无涂画。',
  },
  {
    id: 102,
    name: '积木拼装玩具（大颗粒）',
    short: '积木',
    price: 58,
    category: '玩具',
    location: '广州',
    seller: '大壮爸爸',
    status: 'for_sale',
    color: 'linear-gradient(135deg, rgba(34,197,94,.22), rgba(16,185,129,.22))',
    desc: '适合2-5岁，配件齐全，赠收纳盒。',
  },
  {
    id: 103,
    name: '儿童羽绒服（110码）',
    short: '童装',
    price: 79,
    category: '童装',
    location: '佛山',
    seller: '米粒妈妈',
    status: 'sold',
    color: 'linear-gradient(135deg, rgba(244,63,94,.18), rgba(251,146,60,.18))',
    desc: '八成新，轻微使用痕迹，保暖。',
  },
])

const filtered = computed(() => {
  const k = keyword.value.toLowerCase()
  if (!k) return items.value
  return items.value.filter((i) => {
    return (
      i.name.toLowerCase().includes(k) ||
      i.category.toLowerCase().includes(k) ||
      i.location.toLowerCase().includes(k)
    )
  })
})

const forSaleCount = computed(() => items.value.filter((i) => i.status === 'for_sale').length)
const soldCount = computed(() => items.value.filter((i) => i.status !== 'for_sale').length)

const showPublish = ref(false)
const form = reactive({
  name: '',
  price: 0,
  category: '玩具',
  location: '本地',
  desc: '',
})

function openPublish() {
  showPublish.value = true
  form.name = ''
  form.price = 0
  form.category = '玩具'
  form.location = '本地'
  form.desc = ''
}

function publish() {
  if (!form.name) return
  if (!form.category) return
  if (!form.location) return

  items.value.unshift({
    id: Date.now(),
    name: form.name,
    short: form.name.slice(0, 2),
    price: Number(form.price || 0),
    category: form.category,
    location: form.location,
    seller: localStorage.getItem('demo_user') || '匿名用户',
    status: 'for_sale',
    color: 'linear-gradient(135deg, rgba(15,23,42,.08), rgba(59,130,246,.12))',
    desc: form.desc || '无',
  })
  showPublish.value = false
  notify('发布成功（示例）')
}

function toggleFav(item) {
  if (favorites.has(item.id)) favorites.delete(item.id)
  else favorites.add(item.id)
}

function contact(item) {
  notify(`已为你模拟联系：${item.seller}`)
}

function markSold(item) {
  item.status = 'sold'
  notify('已下架（示例）')
}

function notify(text) {
  toast.value = text
  window.clearTimeout(notify._t)
  notify._t = window.setTimeout(() => {
    toast.value = ''
  }, 1800)
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.title {
  font-size: 20px;
  font-weight: 750;
  color: #0f172a;
}

.sub {
  margin-top: 4px;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.7);
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input {
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  padding: 0 12px;
  min-width: 240px;
  outline: none;
}

.input:focus {
  border-color: rgba(59, 130, 246, 0.55);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.btn {
  height: 38px;
  border-radius: 12px;
  border: none;
  background: #2563eb;
  color: #fff;
  padding: 0 14px;
  cursor: pointer;
  font-weight: 650;
}

.btn.ghost {
  background: rgba(15, 23, 42, 0.06);
  color: rgba(15, 23, 42, 0.86);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  padding: 12px;
}

.k {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.58);
}

.v {
  margin-top: 6px;
  font-weight: 800;
  font-size: 18px;
  color: rgba(15, 23, 42, 0.92);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.img {
  height: 86px;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.78);
  letter-spacing: 1px;
}

.body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.row.bottom {
  align-items: flex-end;
}

.name {
  font-weight: 750;
  color: rgba(15, 23, 42, 0.92);
}

.price {
  font-weight: 850;
  color: rgba(37, 99, 235, 0.95);
}

.meta {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.6);
  display: flex;
  gap: 6px;
}

.desc {
  font-size: 13px;
  color: rgba(15, 23, 42, 0.78);
  line-height: 1.6;
  min-height: 42px;
}

.seller {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.58);
}

.ops {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.mini {
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.03);
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
  color: rgba(15, 23, 42, 0.82);
}

.mini.primary {
  background: rgba(37, 99, 235, 0.1);
  border-color: rgba(37, 99, 235, 0.22);
  color: rgba(37, 99, 235, 0.95);
}

.mini.ghost {
  background: transparent;
}

.sold {
  font-size: 12px;
  color: rgba(239, 68, 68, 0.85);
  font-weight: 700;
}

.mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 20;
}

.modal {
  width: min(640px, 100%);
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  padding: 14px;
}

.m-title {
  font-size: 16px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.92);
}

.form {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.textarea {
  width: 100%;
  min-height: 120px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  padding: 10px 12px;
  outline: none;
  resize: vertical;
}

.row.right {
  justify-content: flex-end;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.92);
  color: #fff;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  z-index: 30;
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .input {
    min-width: 160px;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
