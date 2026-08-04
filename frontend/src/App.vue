<template>
  <div class="min-h-screen">
    <AppNav />
    <main class="max-w-7xl mx-auto px-4 py-6">
      <router-view />
    </main>
  </div>
</template>
<script setup lang="ts">
import AppNav from '@/components/layout/AppNav.vue'
</script>
