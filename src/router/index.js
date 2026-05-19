import { createRouter, createWebHistory } from 'vue-router'
import pinia from '@/store'
import { useAppStore } from '@/store/app'

import LoginView from '../views/LoginView.vue'
import MainLayout from '../layouts/MainLayout.vue'

import HomeView from '../views/Home.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true },
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', redirect: '/home' },
      {
        path: 'home',
        name: 'home',
        component: HomeView,
        meta: { public: true },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/selfCenter/index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'forum',
        name: 'forum',
        component: () => import('@/views/forum/index.vue'),
        meta: { public: true },
      },
      {
        path: 'forum/:id',
        name: 'forum-detail',
        component: () => import('@/views/forum/ForumDetail.vue'),
        meta: { public: true },
      },
      {
        path: 'market',
        name: 'market',
        component: () => import('@/views/mutualMarket/index.vue'),
        meta: { public: true },
      },
      {
        path: 'market/:id',
        name: 'market-detail',
        component: () => import('@/views/mutualMarket/ItemDetail.vue'),
        meta: { public: true },
      },
      {
        path: 'lectures',
        name: 'lectures',
        component: () => import('@/views/expertCoach/index.vue'),
        meta: { public: true },
      },
      {
        path: 'courses',
        name: 'courses',
        component: () => import('@/views/courses/index.vue'),
        meta: { public: true },
      },
      {
        path: 'news-section',
        name: 'news-section',
        component: () => import('@/views/newsSection/index.vue'),
        meta: { public: true },
      },
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/views/admin/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { public: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const appStore = useAppStore(pinia)

router.beforeEach(async (to) => {
  if (!appStore.authInitialized) {
    await appStore.initAuth()
  }

  if (to.name === 'login' && appStore.isLoggedIn) {
    return { name: 'home' }
  }

  if (to.meta?.public) return true

  const isLoggedIn = appStore.isLoggedIn
  if (to.meta?.requiresAuth && !isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta?.requiresAdmin && appStore.role !== '管理员') {
    return { name: 'home', query: { denied: 'admin' } }
  }

  return true
})

export default router
