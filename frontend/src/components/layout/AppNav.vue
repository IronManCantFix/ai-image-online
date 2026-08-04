<template>
  <nav class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-14">
        <router-link to="/" class="flex items-center gap-2 font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
          <span class="text-primary-600">AI</span> Image
        </router-link>
        <div class="hidden sm:flex items-center gap-1">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer min-h-[40px] flex items-center"
            :class="$route.path === item.path ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'">
            {{ item.label }}
          </router-link>
        </div>
        <div class="flex items-center gap-2">
          <button @click="toggleTheme" class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center transition-colors">
            <svg v-if="theme === 'light'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z" /></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </button>
          <button @click="mobileOpen = !mobileOpen" class="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <transition name="slide">
        <div v-if="mobileOpen" class="sm:hidden pb-3 space-y-1">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path" @click="mobileOpen = false"
            class="block px-3 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer min-h-[48px] flex items-center"
            :class="$route.path === item.path ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'">
            {{ item.label }}
          </router-link>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'

const mobileOpen = ref(false)
const { theme, toggleTheme } = useTheme()

const navItems = [
  { path: '/generate', label: '生成' },
  { path: '/gallery', label: '画廊' },
  { path: '/settings', label: '设置' },
]
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; max-height: 200px; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
</style>
