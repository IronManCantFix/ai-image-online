<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-3 sm:px-4">
      <div class="flex items-center justify-between h-14">
        <router-link to="/" class="flex items-center gap-2 font-bold text-base sm:text-lg">
          <span class="text-primary-600">AI</span> Image
        </router-link>
        <div class="hidden sm:flex items-center gap-1">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path"
            class="px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[40px] flex items-center"
            :class="$route.path === item.path ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'">
            {{ item.label }}
          </router-link>
        </div>
        <button @click="mobileOpen = !mobileOpen"
          class="sm:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <transition name="slide">
        <div v-if="mobileOpen" class="sm:hidden pb-3 space-y-1">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path" @click="mobileOpen = false"
            class="block px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[48px] flex items-center"
            :class="$route.path === item.path ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'">
            {{ item.label }}
          </router-link>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const mobileOpen = ref(false)
const navItems = [
  { path: '/generate', label: '生成' },
  { path: '/gallery', label: '画廊' },
  { path: '/settings', label: '设置' },
]
</script>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.2s ease;
  max-height: 200px;
  overflow: hidden;
}
.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
