import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/generate' },
  { path: '/generate', name: 'generate', component: () => import('@/components/generation/GeneratePage.vue') },
  { path: '/gallery', name: 'gallery', component: () => import('@/components/gallery/GalleryPage.vue') },
  { path: '/history', name: 'history', component: () => import('@/components/history/HistoryPage.vue') },
  { path: '/settings', name: 'settings', component: () => import('@/components/settings/SettingsPage.vue') },
]

export const router = createRouter({ history: createWebHistory(), routes })
