<template>
  <div class="authenticated-layout">
    <!-- Toolbar principal -->
    <v-toolbar 
      class="main-toolbar"
      elevation="2"
    >
      <v-toolbar-title>
        <!-- link to dashboard -->
        <router-link to="/dashboard" class="app-brand">
          <div class="app-brand">
            <v-icon 
              :color="themeStore.currentTheme.colors.primary"
              size="24"
              class="mr-2"
            >
              mdi-chart-line
            </v-icon>
            <span class="app-name">CapitalCoa</span>
          </div>
        </router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Notificaciones -->
      <v-icon
        class="toolbar-icon"
        @click="showNotifications = !showNotifications"
      >
        <v-badge
          :content="notificationCount"
          :model-value="notificationCount > 0"
          color="error"
          offset-x="8"
          offset-y="-8"
        >
          <v-icon color="primary">mdi-bell</v-icon>
        </v-badge>
      </v-icon>

      <v-icon
        class="toolbar-icon mr-4"
        @click="toggleSidebar"
      >
        <v-icon color="primary">mdi-menu</v-icon>
      </v-icon>
    </v-toolbar>

    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="sidebarOpen"
      :temporary="isMobile"
      :permanent="!isMobile"
      class="sidebar"
      :class="{ 'sidebar-mobile': isMobile }"
    >
      <!-- Header del sidebar -->
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <v-icon 
            :color="themeStore.currentTheme.colors.primary"
            size="28"
            class="mr-3"
          >
            mdi-chart-line
          </v-icon>
          <span class="sidebar-title">CapitalCoa</span>
        </div>
      </div>

      <!-- Navegación del sidebar -->
      <v-list class="sidebar-nav">
        <v-list-item
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          :class="{ 'active': isActiveRoute(item.path) }"
          class="nav-item"
          @click="handleNavClick"
        >
          <template #prepend>
            <v-icon 
              :color="isActiveRoute(item.path) ? 'primary' : 'inherit'"
              size="20"
            >
              {{ item.icon }}
            </v-icon>
          </template>
          <v-list-item-title class="nav-title">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Sección de usuario y tema -->
      <div class="sidebar-user-section">
        <v-divider class="mb-4"></v-divider>
        
        <!-- Información del usuario -->
        <div class="user-info-card">
          <div class="user-avatar-section">
            <v-avatar size="48" class="user-avatar-large">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
            <div class="user-details">
              <div class="user-name">{{ authStore.user?.username || 'Usuario' }}</div>
              <div class="user-email">{{ authStore.user?.username || 'usuario' }}@capitalcoa.com</div>
            </div>
          </div>
        </div>

        <!-- Selector de tema -->
        <div class="theme-section">
          <div class="section-title">
            <v-icon size="16" class="mr-2">mdi-palette</v-icon>
            <span>Tema</span>
          </div>
          <ThemeSelector />
        </div>

        <!-- Acciones del usuario -->
        <div class="user-actions-section">
          <v-list class="user-actions-list">
            <v-list-item
              @click="goToProfile"
              class="user-action-item"
            >
              <template #prepend>
                <v-icon size="20">mdi-account-cog</v-icon>
              </template>
              <v-list-item-title>Perfil</v-list-item-title>
            </v-list-item>
            
            <v-list-item
              @click="goToSettings"
              class="user-action-item"
            >
              <template #prepend>
                <v-icon size="20">mdi-cog</v-icon>
              </template>
              <v-list-item-title>Configuración</v-list-item-title>
            </v-list-item>
            
            <v-divider class="my-2"></v-divider>
            
            <v-list-item
              @click="handleLogout"
              class="user-action-item logout-item"
              :loading="authStore.isLoading"
            >
              <template #prepend>
                <v-icon size="20" color="error">mdi-logout</v-icon>
              </template>
              <v-list-item-title>Cerrar Sesión</v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </div>

      <!-- Footer del sidebar -->
      <template #append>
        <div class="sidebar-footer">
          <v-divider class="mb-4"></v-divider>
          <div class="sidebar-info">
            <div class="info-item">
              <v-icon size="16" color="success">mdi-circle</v-icon>
              <span class="info-text">Sistema Activo</span>
            </div>
            <div class="info-item">
              <v-icon size="16" color="info">mdi-clock</v-icon>
              <span class="info-text">{{ currentTime }}</span>
            </div>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Contenido principal -->
    <main class="main-content" :class="{ 'content-with-sidebar': !isMobile && sidebarOpen }">
      <slot />
    </main>

    <!-- Panel de notificaciones -->
    <v-navigation-drawer
      v-model="showNotifications"
      location="right"
      temporary
      width="400"
      class="notifications-drawer"
    >
      <v-toolbar title="Notificaciones" density="compact">
        <v-spacer></v-spacer>
        <v-btn
          icon
          variant="text"
          @click="showNotifications = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      
      <v-list>
        <v-list-item
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
        >
          <template #prepend>
            <v-icon 
              :color="getNotificationColor(notification.type)"
              size="20"
            >
              {{ getNotificationIcon(notification.type) }}
            </v-icon>
          </template>
          <v-list-item-title class="notification-title">
            {{ notification.title }}
          </v-list-item-title>
          <v-list-item-subtitle class="notification-message">
            {{ notification.message }}
          </v-list-item-subtitle>
          <template #append>
            <v-chip
              :color="getNotificationColor(notification.type)"
              size="small"
              variant="tonal"
            >
              {{ notification.time }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import ThemeSelector from '@/components/ThemeSelector.vue';

// Composables
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const themeStore = useThemeStore();

// Refs
const showNotifications = ref(false);
const sidebarOpen = ref(true);
const isMobile = ref(false);
const currentTime = ref('');

// Navigation items
const navigationItems = [
  { path: '/dashboard', title: 'Dashboard', icon: 'mdi-view-dashboard' },
  { path: '/assets', title: 'Activos', icon: 'mdi-currency-usd' },
  { path: '/signals', title: 'Señales', icon: 'mdi-bell-ring' },
  { path: '/trades', title: 'Trades', icon: 'mdi-chart-line' },
  { path: '/backtests', title: 'Backtests', icon: 'mdi-test-tube' },
  { path: '/users', title: 'Usuarios', icon: 'mdi-account-group' },
];

// Computed
const notificationCount = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

// Mock notifications (en un proyecto real vendrían del store)
const notifications = ref<{
  id: number;
  title: string;
  message: string;
  type: string;
  time: string;
  read: boolean;
}[]>([
  // {
  //   id: 1,
  //   title: 'Nueva señal',
  //   message: 'Se ha generado una nueva señal para BTC/USDT',
  //   type: 'signal',
  //   time: '2 min',
  //   read: false
  // },
  // {
  //   id: 2,
  //   title: 'Trade completado',
  //   message: 'El trade BTC/USDT se ha cerrado con +2.5%',
  //   type: 'trade',
  //   time: '5 min',
  //   read: false
  // },
  // {
  //   id: 3,
  //   title: 'Backtest finalizado',
  //   message: 'El backtest de la estrategia MA ha terminado',
  //   type: 'backtest',
  //   time: '1 hora',
  //   read: true
  // }
]);

// Methods
const isActiveRoute = (path: string) => {
  return route.path === path;
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const handleNavClick = () => {
  // En móvil, cerrar el sidebar después de navegar
  if (isMobile.value) {
    sidebarOpen.value = false;
  }
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    await router.push('/login');
  } catch (error) {
    console.error('Error en logout:', error);
  }
};

const goToProfile = () => {
  // Implementar navegación al perfil
  console.log('Ir al perfil');
};

const goToSettings = () => {
  // Implementar navegación a configuración
  console.log('Ir a configuración');
};

const getNotificationColor = (type: string) => {
  const colors = {
    signal: 'primary',
    trade: 'success',
    backtest: 'info',
    warning: 'warning',
    error: 'error'
  };
  return colors[type as keyof typeof colors] || 'primary';
};

const getNotificationIcon = (type: string) => {
  const icons = {
    signal: 'mdi-bell-ring',
    trade: 'mdi-chart-line',
    backtest: 'mdi-test-tube',
    warning: 'mdi-alert',
    error: 'mdi-alert-circle'
  };
  return icons[type as keyof typeof icons] || 'mdi-information';
};

const updateCurrentTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const checkMobile = () => {
  isMobile.value = window.innerWidth < 960;
  if (isMobile.value) {
    sidebarOpen.value = false;
  } else {
    sidebarOpen.value = true;
  }
};

// Lifecycle
onMounted(() => {
  checkMobile();
  updateCurrentTime();
  
  // Actualizar tiempo cada minuto
  setInterval(updateCurrentTime, 60000);
  
  // Escuchar cambios de tamaño de ventana
  window.addEventListener('resize', checkMobile);
});

// Watchers
watch(() => route.path, () => {
  // En móvil, cerrar sidebar al cambiar de ruta
  if (isMobile.value) {
    sidebarOpen.value = false;
  }
});
</script>

<style scoped>
.app-brand {
  text-decoration: none;
}
.authenticated-layout {
  min-height: 100vh;
  background: var(--background);
}

.main-toolbar {
  background: var(--card-bg);
  border-bottom: 1px solid var(--card-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Brand */
.app-brand {
  display: flex;
  align-items: center;
}

.app-name {
  font-weight: 600;
  font-size: 18px;
  color: var(--on-surface);
}

.menu-btn {
  color: var(--on-surface) !important;
}

.toolbar-icon {
  color: var(--on-surface) !important;
  opacity: 0.7;
  cursor: pointer;
  margin-left: 16px;
  transition: all 0.2s ease;
}

.toolbar-icon:hover {
  opacity: 1;
  transform: scale(1.1);
}

.action-btn {
  color: var(--on-surface) !important;
  opacity: 0.7;
}

.action-btn:hover {
  opacity: 1;
  background-color: rgba(var(--primary), 0.1) !important;
}

/* Sidebar */
.sidebar {
  background: var(--card-bg);
  border-right: 1px solid var(--card-border);
  width: 280px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--card-border);
}

.sidebar-brand {
  display: flex;
  align-items: center;
}

.sidebar-title {
  font-weight: 600;
  font-size: 18px;
  color: var(--on-surface);
}

.close-btn {
  color: var(--on-surface) !important;
}

/* Sidebar navigation */
.sidebar-nav {
  padding: 16px 0;
}

.nav-item {
  margin: 4px 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: rgba(var(--primary), 0.1);
}

.nav-item.active {
  background-color: rgba(var(--primary), 0.15);
  color: var(--primary);
}

.nav-title {
  font-weight: 500;
  font-size: 14px;
}

/* User section in sidebar */
.sidebar-user-section {
  padding: 16px 20px;
}

.user-info-card {
  margin-bottom: 20px;
}

.user-avatar-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-large {
  background: rgba(var(--primary), 0.1);
  color: var(--primary) !important;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--on-surface);
  margin-bottom: 2px;
}

.user-email {
  font-size: 12px;
  color: var(--on-surface);
  opacity: 0.7;
}

/* Theme section */
.theme-section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  color: var(--on-surface);
  margin-bottom: 12px;
}

/* User actions section */
.user-actions-section {
  margin-bottom: 20px;
}

.user-actions-list {
  background: transparent;
  padding: 0;
}

.user-action-item {
  margin: 4px 0;
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--on-surface);
  transition: all 0.2s ease;
}

.user-action-item:hover {
  background-color: rgba(var(--primary), 0.1);
}

.logout-item {
  color: var(--error) !important;
}

.logout-item:hover {
  background-color: rgba(var(--error), 0.1) !important;
}

/* Sidebar footer */
.sidebar-footer {
  padding: 16px 20px;
}

.sidebar-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-text {
  color: var(--on-surface);
  opacity: 0.7;
  font-size: 12px;
}

/* Main content */
.main-content {
  padding: 24px;
  min-height: calc(100vh - 64px);
  transition: margin-left 0.3s ease;
}

.content-with-sidebar {
  margin-left: 280px;
}

/* Notifications drawer */
.notifications-drawer {
  background: var(--card-bg);
  border-left: 1px solid var(--card-border);
}

.notification-item {
  border-bottom: 1px solid rgba(var(--on-surface), 0.1);
  padding: 16px;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-title {
  color: var(--on-surface);
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.notification-message {
  color: var(--on-surface);
  opacity: 0.7;
  font-size: 13px;
}

/* Responsive */
@media (max-width: 960px) {
  .sidebar {
    width: 280px;
  }
  
  .main-content {
    margin-left: 0;
    padding: 16px;
  }
}

@media (max-width: 600px) {
  .main-content {
    padding: 12px;
  }
  
  .sidebar {
    width: 100%;
    max-width: 320px;
  }
  
  .sidebar-user-section {
    padding: 12px 16px;
  }
  
  .user-avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}
</style> 