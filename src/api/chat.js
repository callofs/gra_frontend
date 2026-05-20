import request from '@/utils/request'

let privateMessageSocket = null

function createMessageListener(handler) {
  return (event) => {
    let payload = event.data

    try {
      payload = JSON.parse(event.data)
    } catch (error) {
    }

    handler?.(payload)
  }
}

function subscribePrivateMessageSocket(socket, handlers = {}) {
  if (!socket) return () => { }

  const listeners = []

  if (handlers.onOpen) {
    socket.addEventListener('open', handlers.onOpen)
    listeners.push(['open', handlers.onOpen])
    if (socket.readyState === WebSocket.OPEN) {
      queueMicrotask(() => {
        handlers.onOpen?.()
      })
    }
  }

  if (handlers.onMessage) {
    const messageListener = createMessageListener(handlers.onMessage)
    socket.addEventListener('message', messageListener)
    listeners.push(['message', messageListener])
  }

  if (handlers.onError) {
    socket.addEventListener('error', handlers.onError)
    listeners.push(['error', handlers.onError])
  }

  if (handlers.onClose) {
    socket.addEventListener('close', handlers.onClose)
    listeners.push(['close', handlers.onClose])
  }

  return () => {
    listeners.forEach(([eventName, listener]) => {
      socket.removeEventListener(eventName, listener)
    })
  }
}

function attachSocketHandlers(socket, handlers = {}) {
  if (!socket) return socket

  subscribePrivateMessageSocket(socket, handlers)
  return socket
}

function resolveSocketUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  if (!apiBaseUrl) {
    return `${protocol}//${window.location.host}/ws/privateMessage`
  }

  const parsedUrl = new URL(apiBaseUrl, window.location.origin)
  return `${parsedUrl.protocol === 'https:' ? 'wss:' : 'ws:'}//${parsedUrl.host}/ws/privateMessage`
}

export function getConversationList() {
  return request({
    url: '/privateMessage/conversations',
    method: 'get',
  })
}

export function getMessagePage(targetUserId, page = 1, size = 20) {
  return request({
    url: '/privateMessage/messages',
    method: 'get',
    params: {
      targetUserId,
      page,
      size,
    },
  })
}

export function sendPrivateMessage(data) {
  return request({
    url: '/privateMessage/send',
    method: 'post',
    data,
  })
}

export function getUnreadPrivateMessageCount() {
  return request({
    url: '/privateMessage/unread/count',
    method: 'get',
  })
}

export function markPrivateConversationRead(targetUserId) {
  return request({
    url: `/privateMessage/read/${targetUserId}`,
    method: 'post',
  })
}

export function createPrivateMessageSocket(handlers = {}) {
  if (privateMessageSocket && privateMessageSocket.readyState === WebSocket.OPEN) {
    return attachSocketHandlers(privateMessageSocket, handlers)
  }

  if (privateMessageSocket && privateMessageSocket.readyState === WebSocket.CONNECTING) {
    return attachSocketHandlers(privateMessageSocket, handlers)
  }

  const socket = new WebSocket(resolveSocketUrl())

  socket.addEventListener('close', (event) => {
    if (privateMessageSocket === socket) {
      privateMessageSocket = null
    }
  })

  privateMessageSocket = socket
  return attachSocketHandlers(socket, handlers)
}

export function sendPrivateMessageBySocket(payload) {
  if (!privateMessageSocket || privateMessageSocket.readyState !== WebSocket.OPEN) {
    throw new Error('私信连接未建立')
  }

  privateMessageSocket.send(JSON.stringify(payload))
}

export function getPrivateMessageSocket() {
  return privateMessageSocket
}

export function waitForPrivateMessageSocketOpen(timeout = 5000) {
  const socket = createPrivateMessageSocket()

  if (socket.readyState === WebSocket.OPEN) {
    return Promise.resolve(socket)
  }

  if (socket.readyState !== WebSocket.CONNECTING) {
    return Promise.reject(new Error('私信连接不可用'))
  }

  return new Promise((resolve, reject) => {
    let timer = null

    const cleanup = () => {
      socket.removeEventListener('open', handleOpen)
      socket.removeEventListener('error', handleError)
      socket.removeEventListener('close', handleClose)
      if (timer) {
        clearTimeout(timer)
      }
    }

    const handleOpen = () => {
      cleanup()
      resolve(socket)
    }

    const handleError = () => {
      cleanup()
      reject(new Error('私信连接建立失败'))
    }

    const handleClose = () => {
      cleanup()
      reject(new Error('私信连接已关闭'))
    }

    socket.addEventListener('open', handleOpen)
    socket.addEventListener('error', handleError)
    socket.addEventListener('close', handleClose)

    timer = setTimeout(() => {
      cleanup()
      reject(new Error('私信连接超时'))
    }, timeout)
  })
}

export function addPrivateMessageSocketListeners(handlers = {}) {
  const socket = createPrivateMessageSocket()
  return subscribePrivateMessageSocket(socket, handlers)
}

export function closePrivateMessageSocket() {
  if (!privateMessageSocket) return

  privateMessageSocket.close()
  privateMessageSocket = null
}
