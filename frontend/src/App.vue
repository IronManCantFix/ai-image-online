<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
    <AppNav />
    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNav from '@/components/layout/AppNav.vue'
import { useTheme } from '@/composables/useTheme'

const { loadTheme } = useTheme()
loadTheme()
</script>
