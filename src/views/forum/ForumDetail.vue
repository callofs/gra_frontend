<template>
  <div class="forum-detail-page">
    <div class="detail-card">
      <div class="detail-header">
        <el-button text @click="goBack">返回</el-button>
        <div class="author-avatar">
          <span v-if="post?.isAnonymous">匿</span>
          <img v-else-if="authorAvatarUrl" :src="authorAvatarUrl" alt="avatar" />
          <span v-else>{{ String(authorName || '').slice(0, 1) }}</span>
        </div>
        <div class="header-meta">
          <div class="detail-title">{{ post?.title || '' }}</div>
          <div class="detail-sub">
            <span v-if="post">{{ authorName }}</span>
            <span v-if="post && post.createTime"> · {{ formattedTime }}</span>
            <span v-if="post && post.sectionName"> · {{ post.sectionName }}</span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="state">加载中...</div>
      <div v-else-if="!post" class="state">内容不存在</div>

      <div v-else class="detail-body">
        <div v-if="post.coverImages" class="cover">
          <img :src="post.coverImages" alt="cover" />
        </div>

        <div class="metrics">
          <span class="metric">👁️ {{ post.viewCount || 0 }}</span>
          <button class="metric metric-button" type="button" :disabled="likeLoading" @click="toggleLike">
            {{ liked ? '👍 已赞' : '👍' }} {{ post.likeCount || 0 }}
          </button>
          <span class="metric">💬 {{ post.commentCount || 0 }}</span>
          <button class="metric metric-button" type="button" :disabled="collectLoading" @click="toggleCollect">
            {{ collected ? '⭐ 已收藏' : '⭐' }} {{ post.collectCount || 0 }}
          </button>
        </div>

        <div class="content" v-html="post.content"></div>

        <ForumCommentThread v-if="post?.id" :post-id="post.id" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { collectForum, getForumDetail, uncollectForum } from '@/api/forum.js'
import { getLikeStatus, like, unlike } from '@/api/like.js'
import ForumCommentThread from '@/views/forum/components/ForumCommentThread.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const post = ref(null)
const liked = ref(false)
const likeLoading = ref(false)
const collected = ref(false)
const collectLoading = ref(false)

const authorName = computed(() => {
  if (!post.value) return ''
  return post.value.isAnonymous ? '匿名用户' : post.value.authorNickname
})

const authorAvatarUrl = computed(() => {
  const avatar = post.value?.authorAvatar
  if (!avatar || typeof avatar !== 'string') return ''

  const trimmed = avatar.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('data:image/')) return trimmed
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) return trimmed
  return `data:image/png;base64,${trimmed}`
})

const formattedTime = computed(() => {
  if (!post.value?.createTime) return ''
  return String(post.value.createTime).replace('T', ' ').slice(0, 16)
})

function goBack() {
  router.back()
}

async function fetchLikeStatus() {
  if (!post.value?.id) {
    liked.value = false
    return
  }

  try {
    liked.value = Boolean(await getLikeStatus(1, post.value.id))
  } catch (error) {
    liked.value = false
  }
}

async function toggleLike() {
  if (!post.value?.id || likeLoading.value) return

  likeLoading.value = true
  try {
    if (liked.value) {
      await unlike({ likeType: 1, relatedId: post.value.id })
      liked.value = false
      post.value.likeCount = Math.max(0, Number(post.value.likeCount || 0) - 1)
      ElMessage.success('已取消点赞')
    } else {
      await like({ likeType: 1, relatedId: post.value.id })
      liked.value = true
      post.value.likeCount = Number(post.value.likeCount || 0) + 1
      ElMessage.success('点赞成功')
    }
  } catch (error) {
    ElMessage.error(error?.message || (liked.value ? '取消点赞失败' : '点赞失败'))
  } finally {
    likeLoading.value = false
  }
}

async function toggleCollect() {
  if (!post.value?.id || collectLoading.value) return

  collectLoading.value = true
  try {
    if (collected.value) {
      await uncollectForum(post.value.id)
      collected.value = false
      post.value.collectCount = Math.max(0, Number(post.value.collectCount || 0) - 1)
      ElMessage.success('已取消收藏')
    } else {
      await collectForum(post.value.id)
      collected.value = true
      post.value.collectCount = Number(post.value.collectCount || 0) + 1
      ElMessage.success('已收藏')
    }
  } catch (error) {
    ElMessage.error(error?.message || (collected.value ? '取消收藏失败' : '收藏失败'))
  } finally {
    collectLoading.value = false
  }
}

async function fetchDetail() {
  const id = route.params?.id
  if (!id) {
    post.value = null
    liked.value = false
    collected.value = false
    return
  }

  loading.value = true
  try {
    post.value = await getForumDetail(id)
    collected.value = Boolean(post.value?.collected)
    await fetchLikeStatus()
  } catch (error) {
    ElMessage.error(error?.message || '获取贴文失败')
    post.value = null
    liked.value = false
    collected.value = false
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
.forum-detail-page {
  padding: 24px 0;
}

.detail-card {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.detail-header {
  display: flex;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid #eef2f7;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(59, 130, 246, 0.12);
  color: rgba(59, 130, 246, 1);
  display: grid;
  place-items: center;
  font-weight: 900;
  flex-shrink: 0;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.header-meta {
  flex: 1;
}

.detail-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  color: #0f172a;
}

.detail-sub {
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}

.state {
  padding: 32px 18px;
  color: #64748b;
}

.detail-body {
  padding: 18px;
}

.cover {
  border-radius: 14px;
  overflow: hidden;
  background: #f8fafc;
}

.cover img {
  width: 100%;
  height: 320px;
  object-fit: cover;
  display: block;
}

.metrics {
  display: flex;
  gap: 14px;
  padding: 12px 0;
  color: #475569;
  font-size: 13px;
}

.metric-button {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.metric-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.content :deep(img) {
  max-width: 100%;
  height: auto;
}

.content :deep(p) {
  line-height: 1.8;
}
</style>
