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
  return true
})

export default router
