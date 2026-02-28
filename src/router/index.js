import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import MainLayout from '../layouts/MainLayout.vue'

import ForumView from '../views/ForumView.vue'
import MarketView from '../views/MarketView.vue'
import LecturesView from '../views/LecturesView.vue'
import CoursesView from '../views/CoursesView.vue'
import ProfileView from '../views/ProfileView.vue'
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
      { path: '', redirect: '/forum' },
      {
        path: 'forum',
        name: 'forum',
        component: ForumView,
        meta: { requiresAuth: true },
      },
      {
        path: 'market',
        name: 'market',
        component: MarketView,
        meta: { requiresAuth: true },
      },
      {
        path: 'lectures',
        name: 'lectures',
        component: LecturesView,
        meta: { requiresAuth: true },
      },
      {
        path: 'courses',
        name: 'courses',
        component: CoursesView,
        meta: { requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: { requiresAuth: true },
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

router.beforeEach((to) => {
  if (to.meta?.public) return true

  const isLoggedIn = !!localStorage.getItem('demo_token')
  if (to.meta?.requiresAuth && !isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && isLoggedIn) {
    return { name: 'forum' }
  }

  return true
})

export default router
