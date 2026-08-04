<template>
  <n-config-provider :theme="naiveTheme">
    <n-message-provider>
      <div class="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <AppNav />
        <main class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <router-view />
        </main>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import AppNav from '@/components/layout/AppNav.vue'
import { useTheme } from '@/composables/useTheme'

const { naiveTheme, loadTheme } = useTheme()
loadTheme()
</script>
