<template>
  <div class="page">
    <div class="header">
      <div>
        <div class="title">用户论坛</div>
        <div class="sub">分享育儿经验、提问互助（静态示例数据）</div>
      </div>
      <div class="actions">
        <input v-model.trim="keyword" class="input" placeholder="搜索帖子标题/标签" />
        <button class="btn" type="button" @click="openNew">发帖</button>
      </div>
    </div>

    <div class="grid">
      <div class="list">
        <div v-for="p in filtered" :key="p.id" class="post" @click="active = p">
          <div class="row">
            <div class="p-title">{{ p.title }}</div>
            <div class="badge">{{ p.category }}</div>
          </div>
          <div class="meta">
            <span>{{ p.author }}</span>
            <span>·</span>
            <span>{{ p.time }}</span>
            <span>·</span>
            <span>{{ p.replies }} 回复</span>
          </div>
          <div class="tags">
            <span v-for="t in p.tags" :key="t" class="tag">#{{ t }}</span>
          </div>
        </div>
      </div>

      <div class="detail" v-if="active">
        <div class="d-title">{{ active.title }}</div>
        <div class="d-meta">{{ active.author }} · {{ active.time }} · {{ active.category }}</div>

        <div class="d-content">{{ active.content }}</div>

        <div class="comment-box">
          <div class="comment-title">评论区（前端模拟）</div>
          <div class="comments">
            <div v-for="c in active.comments" :key="c.id" class="comment">
              <div class="c-row">
                <div class="c-author">{{ c.author }}</div>
                <div class="c-time">{{ c.time }}</div>
              </div>
              <div class="c-text">{{ c.text }}</div>
            </div>
          </div>

          <div class="composer">
            <input v-model.trim="commentText" class="input" placeholder="写下你的评论..." />
            <button class="btn" type="button" @click="addComment">发送</button>
          </div>
        </div>
      </div>

      <div class="detail empty" v-else>
        请选择左侧帖子查看详情
      </div>
    </div>

    <div v-if="showNew" class="mask" @click.self="showNew = false">
      <div class="modal">
        <div class="m-title">发布新帖</div>
        <div class="form">
          <input v-model.trim="newTitle" class="input" placeholder="标题" />
          <textarea v-model.trim="newContent" class="textarea" placeholder="内容" />
          <div class="row">
            <button class="btn ghost" type="button" @click="showNew = false">取消</button>
            <button class="btn" type="button" @click="publish">发布</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const keyword = ref('')
const commentText = ref('')

const showNew = ref(false)
const newTitle = ref('')
const newContent = ref('')

const posts = ref([
  {
    id: 1,
    title: '孩子入园焦虑怎么办？分享3个有效方法',
    category: '入园适应',
    author: '小鹿妈妈',
    time: '2026-02-20',
    replies: 18,
    tags: ['情绪管理', '幼儿园', '分离焦虑'],
    content:
      '最近孩子刚上幼儿园，总是哭闹不愿进教室。我尝试了：1）提前熟悉环境；2）固定告别仪式；3）回家后用绘本复盘情绪。大家还有什么经验？',
    comments: [
      { id: 'c1', author: '大壮爸爸', time: '2天前', text: '固定告别仪式很关键，我们是击掌+拥抱。' },
      { id: 'c2', author: '橙子妈妈', time: '1天前', text: '可以让老师安排“伙伴带领”，减少陌生感。' },
    ],
  },
  {
    id: 2,
    title: '辅食添加时间表：6-12个月怎么安排？',
    category: '喂养营养',
    author: '豆豆奶爸',
    time: '2026-02-16',
    replies: 25,
    tags: ['辅食', '营养', '过敏'],
    content:
      '整理了一份6-12个月辅食添加时间表（谷物、蔬菜、水果、肉类）。注意每次只引入一种新食材，观察过敏反应。欢迎补充。',
    comments: [
      { id: 'c3', author: '阿姨', time: '3天前', text: '蛋黄要循序渐进，从少量开始。' },
    ],
  },
  {
    id: 3,
    title: '作业拖拉怎么办？如何建立“可执行”的规则',
    category: '学习习惯',
    author: '林老师',
    time: '2026-02-10',
    replies: 41,
    tags: ['规则', '自律', '小学'],
    content:
      '建议把“快点写作业”换成可操作的规则：开始时间、休息周期、完成后奖励。配合计时器与可视化清单效果更好。',
    comments: [
      { id: 'c4', author: '小杰妈妈', time: '5天前', text: '我们用番茄钟25分钟+5分钟休息，明显改善。' },
    ],
  },
])

const active = ref(posts.value[0])

const filtered = computed(() => {
  const k = keyword.value.toLowerCase()
  if (!k) return posts.value
  return posts.value.filter((p) => {
    return (
      p.title.toLowerCase().includes(k) ||
      p.category.toLowerCase().includes(k) ||
      p.tags.some((t) => t.toLowerCase().includes(k))
    )
  })
})

function addComment() {
  if (!active.value) return
  if (!commentText.value) return
  active.value.comments.unshift({
    id: String(Date.now()),
    author: localStorage.getItem('demo_user') || '匿名用户',
    time: '刚刚',
    text: commentText.value,
  })
  active.value.replies += 1
  commentText.value = ''
}

function openNew() {
  showNew.value = true
  newTitle.value = ''
  newContent.value = ''
}

function publish() {
  if (!newTitle.value) return
  if (!newContent.value) return

  const p = {
    id: Date.now(),
    title: newTitle.value,
    category: '经验分享',
    author: localStorage.getItem('demo_user') || '匿名用户',
    time: '刚刚',
    replies: 0,
    tags: ['新帖'],
    content: newContent.value,
    comments: [],
  }
  posts.value.unshift(p)
  active.value = p
  showNew.value = false
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

.btn:hover {
  filter: brightness(1.03);
}

.btn.ghost {
  background: rgba(15, 23, 42, 0.06);
  color: rgba(15, 23, 42, 0.86);
}

.grid {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 14px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.post {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  padding: 12px;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.post:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.p-title {
  font-weight: 700;
  color: rgba(15, 23, 42, 0.92);
}

.badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: rgba(21, 128, 61, 0.95);
  border: 1px solid rgba(34, 197, 94, 0.22);
  flex-shrink: 0;
}

.meta {
  margin-top: 6px;
  display: flex;
  gap: 6px;
  color: rgba(15, 23, 42, 0.62);
  font-size: 12px;
}

.tags {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  color: rgba(59, 130, 246, 0.95);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 3px 8px;
  border-radius: 999px;
}

.detail {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  padding: 14px;
  min-height: 320px;
}

.detail.empty {
  display: grid;
  place-items: center;
  color: rgba(15, 23, 42, 0.55);
}

.d-title {
  font-weight: 800;
  font-size: 16px;
  color: rgba(15, 23, 42, 0.94);
}

.d-meta {
  margin-top: 6px;
  color: rgba(15, 23, 42, 0.6);
  font-size: 12px;
}

.d-content {
  margin-top: 12px;
  line-height: 1.7;
  color: rgba(15, 23, 42, 0.86);
  white-space: pre-wrap;
}

.comment-box {
  margin-top: 14px;
  border-top: 1px dashed rgba(15, 23, 42, 0.12);
  padding-top: 12px;
}

.comment-title {
  font-weight: 700;
  color: rgba(15, 23, 42, 0.88);
}

.comments {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 260px;
  overflow: auto;
  padding-right: 6px;
}

.comment {
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 12px;
  padding: 10px;
}

.c-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.c-author {
  font-weight: 700;
  color: rgba(15, 23, 42, 0.86);
  font-size: 13px;
}

.c-time {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.55);
}

.c-text {
  margin-top: 6px;
  color: rgba(15, 23, 42, 0.82);
  line-height: 1.6;
}

.composer {
  margin-top: 12px;
  display: flex;
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

@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .input {
    min-width: 160px;
  }
}
</style>
