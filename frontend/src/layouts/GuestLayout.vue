<template>
  <div class="guest-layout">
    <div class="theme-selector">
      <ThemeSelector />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme';
import ThemeSelector from '@/components/ThemeSelector.vue';

// Composables
const themeStore = useThemeStore();
</script>

<style scoped>
.guest-layout {
  min-height: 100vh;
  background: var(--background);
}
.theme-selector {
  position: absolute;
  z-index: 1000;
  top: 10px;
  right: 10px;
}
</style> 