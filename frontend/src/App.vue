<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
  // Inicializar autenticación al cargar la app
  authStore.initializeAuth()
})
</script>

<template>
  <v-app>
    <RouterView />
  </v-app>
</template>
