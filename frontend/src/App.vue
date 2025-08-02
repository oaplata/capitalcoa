<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
import { AuthenticatedLayout, GuestLayout } from '@/layouts'

const authStore = useAuthStore()

onMounted(() => {
  // Inicializar autenticación al cargar la app
  authStore.initializeAuth()
})
</script>

<template>
  <v-app>
    <!-- Layout para usuarios autenticados -->
    <AuthenticatedLayout v-if="authStore.isAuthenticated">
      <RouterView />
    </AuthenticatedLayout>
    
    <!-- Layout para usuarios no autenticados -->
    <GuestLayout v-else>
      <RouterView />
    </GuestLayout>
  </v-app>
</template>
