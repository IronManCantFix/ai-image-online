import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  { path: '/', redirect: '/generate' },
  { path: '/generate', name: 'generate', component: () => import('@/components/generation/GeneratePage.vue') },
  { path: '/settings', name: 'settings', component: () => import('@/components/settings/SettingsPage.vue') },
  { path: '/gallery', name: 'gallery', component: () => import('@/components/gallery/GalleryPage.vue') },
]
export const router = createRouter({ history: createWebHistory(), routes })
