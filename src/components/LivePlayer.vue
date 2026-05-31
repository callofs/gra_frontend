<template>
  <div class="live-player">
    <video
      ref="videoRef"
      class="player"
      controls
      playsinline
      preload="auto"
      :muted="muted"
      :autoplay="autoplay"
    ></video>

    <div v-if="status === 'loading'" class="player-overlay">正在加载直播…</div>
    <div v-else-if="status === 'error'" class="player-overlay error">
      {{ errorMessage || '直播暂时不可用' }}
    </div>

    <div v-if="enableDanmaku" class="danmaku-layer">
      <span
        v-for="msg in danmakuList"
        :key="msg.id"
        class="danmaku-item"
        :style="{
          top: `${(msg.track / DANMAKU_TRACKS) * 100}%`,
          animationDuration: `${msg.duration}s`,
          color: msg.color,
        }"
      >{{ msg.text }}</span>
    </div>
  </div>

  <div v-if="enableDanmaku" class="danmaku-control">
    <el-input
      v-model="danmakuInput"
      placeholder="发送弹幕..."
      maxlength="50"
      @keyup.enter="handleSendDanmaku"
    />
    <el-button type="primary" @click="handleSendDanmaku">发送</el-button>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const LIVE_URL = 'http://127.0.0.1:8090/live/stream01.flv'
const FLV_CDN = 'https://cdn.jsdelivr.net/npm/flv.js@1.6.2/dist/flv.min.js'
const DANMAKU_TRACKS = 6
const DANMAKU_MIN_DURATION = 6
const DANMAKU_MAX_DURATION = 10

const props = defineProps({
  /**
   * 直播拉流地址，默认指向本地 SRS/OBS 推流示例
   */
  url: {
    type: String,
    default: LIVE_URL,
  },
  /** 是否自动播放（若浏览器策略允许） */
  autoplay: {
    type: Boolean,
    default: true,
  },
  /** 是否静音播放，静音可提升自动播放成功率 */
  muted: {
    type: Boolean,
    default: true,
  },
  enableDanmaku: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['send-danmaku'])

const videoRef = ref(null)
const status = ref('loading') // loading | playing | error
const errorMessage = ref('')
const danmakuInput = ref('')
const danmakuList = ref([])
let danmakuId = 0
let flvPlayer = null
let flvLoaderPromise = null

function destroyPlayer() {
  if (flvPlayer) {
    try {
      flvPlayer.pause()
      flvPlayer.unload()
      flvPlayer.detachMediaElement()
      flvPlayer.destroy()
    } catch (error) {
      // ignore
    }
    flvPlayer = null
  }

  const videoEl = videoRef.value
  if (videoEl) {
    videoEl.removeAttribute('src')
    videoEl.load()
  }
}

function pickDanmakuColor() {
  const palette = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#f97316', '#a78bfa']
  return palette[Math.floor(Math.random() * palette.length)]
}

function addDanmaku(message) {
  if (!props.enableDanmaku) return
  const text = String(message?.text ?? message ?? '').trim()
  if (!text) return

  const id = ++danmakuId
  const track = Math.floor(Math.random() * DANMAKU_TRACKS)
  const duration = Math.random() * (DANMAKU_MAX_DURATION - DANMAKU_MIN_DURATION) + DANMAKU_MIN_DURATION
  const color = message?.color || pickDanmakuColor()

  danmakuList.value.push({ id, text, track, duration, color })
  window.setTimeout(() => {
    danmakuList.value = danmakuList.value.filter((item) => item.id !== id)
  }, duration * 1000)
}

function handleSendDanmaku() {
  const text = danmakuInput.value.trim()
  if (!text) {
    ElMessage.warning('请输入弹幕内容')
    return
  }

  addDanmaku({ text, color: '#fff' })
  emit('send-danmaku', text)
  danmakuInput.value = ''
}

function loadFlvLibrary() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('浏览器环境不可用'))
  }

  if (window.flvjs) {
    return Promise.resolve(window.flvjs)
  }

  if (!flvLoaderPromise) {
    flvLoaderPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = FLV_CDN
      script.async = true
      script.onload = () => {
        if (window.flvjs) {
          resolve(window.flvjs)
        } else {
          reject(new Error('flv.js 未正确加载'))
        }
      }
      script.onerror = () => reject(new Error('flv.js 加载失败'))
      document.body.appendChild(script)
    })
  }

  return flvLoaderPromise
}

async function initPlayer() {
  destroyPlayer()
  status.value = 'loading'
  errorMessage.value = ''

  const videoEl = videoRef.value
  if (!videoEl) return

  videoEl.muted = props.muted

  try {
    const flvjs = await loadFlvLibrary()

    if (!flvjs.isSupported()) {
      throw new Error('当前浏览器不支持 FLV 播放')
    }

    flvPlayer = flvjs.createPlayer({
      type: 'flv',
      isLive: true,
      url: props.url || LIVE_URL,
      enableWorker: false,
      stashInitialSize: 128,
    })

    flvPlayer.attachMediaElement(videoEl)
    flvPlayer.load()
    if (props.autoplay) {
      try {
        await flvPlayer.play()
      } catch (error) {
        // 自动播放失败时允许手动点击
      }
    }

    flvPlayer.on(flvjs.Events.ERROR, (errorType, errorDetail, errorInfo) => {
      console.error('FLV 播放错误', errorType, errorDetail, errorInfo)
      status.value = 'error'
      errorMessage.value = '直播流异常，请稍后再试'
    })

    status.value = 'playing'
  } catch (error) {
    console.error('初始化直播播放器失败', error)
    status.value = 'error'
    errorMessage.value = error?.message || '直播初始化失败'
  }
}

watch(
  () => props.url,
  () => {
    if (props.url) {
      initPlayer()
    }
  }
)

onMounted(() => {
  initPlayer()
})

onBeforeUnmount(() => {
  destroyPlayer()
})

defineExpose({
  pushDanmaku: addDanmaku,
})
</script>

<style scoped>
.live-player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
}

.player {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.player-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  font-size: 16px;
}

.player-overlay.error {
  background: rgba(220, 38, 38, 0.55);
}

.danmaku-layer {
  pointer-events: none;
  position: absolute;
  inset: 0;
  overflow: hidden;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);
}

.danmaku-item {
  position: absolute;
  right: -10%;
  white-space: nowrap;
  animation-name: danmaku-move;
  animation-timing-function: linear;
}

.danmaku-control {
  margin-top: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.danmaku-control :deep(.el-input) {
  flex: 1;
}

@keyframes danmaku-move {
  from {
    transform: translateX(110%);
  }
  to {
    transform: translateX(-130%);
  }
}
</style>
