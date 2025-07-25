<template>
  <div class="dashboard-page">
    <!-- Header del Dashboard con animaciones -->
    <v-toolbar title="Dashboard" class="toolbar-dashboard">
      <v-spacer></v-spacer>
      <ThemeSelector />
      <v-btn
        :color="themeStore.currentTheme.colors.primary"
        variant="outlined"
        @click="handleLogout"
        :loading="authStore.isLoading"
      >
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-toolbar>

    <!-- Tarjetas de estadísticas compactas -->
    <v-container fluid class="stats-section">
      <v-row dense>
        <v-col cols="12" sm="6" md="3" v-for="(stat, index) in stats" :key="stat.id">
          <v-card 
            class="stat-card-compact fade-in-up hover-lift"
            :style="{ animationDelay: `${index * 0.1}s` }"
            :elevation="stat.elevation"
          >
            <v-card-text class="stat-card-text text-center pa-3">
              <div class="stat-icon-container-compact mb-2">
                <v-icon 
                  :size="stat.iconSize" 
                  :color="themeStore.currentTheme.colors.primary"
                  class="stat-icon"
                >
                  {{ stat.icon }}
                </v-icon>
              </div>
              <div class="text">
                <h3 class="text-h5 font-weight-bold mb-1 stat-value">{{ stat.value }}</h3>
                <p class="text-caption mb-2 stat-label">{{ stat.label }}</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Contenido principal -->
    <v-container fluid>
      <v-row>
        <!-- Actividad Reciente -->
        <v-col cols="12" class="activity-section">
          <v-card class="activity-card fade-in-up" elevation="4">
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon 
                  :color="themeStore.currentTheme.colors.primary" 
                  class="mr-3"
                  size="24"
                >
                  mdi-swap-vertical
                </v-icon>
                <span class="text-h6 activity-title-text">Actividad Reciente</span>
              </div>
              <v-btn
                variant="text"
                :color="themeStore.currentTheme.colors.primary"
                size="small"
                @click="refreshActivity"
                :loading="refreshing"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-card-title>
            
            <v-card-text class="pa-0">
              <!-- Lista de actividades -->
              <div v-if="recentActivity.length > 0" class="activity-list">
                <div
                  v-for="(activity, index) in recentActivity"
                  :key="activity.id"
                  class="activity-item slide-in-right"
                  :style="{ animationDelay: `${index * 0.1}s` }"
                >
                  <div class="activity-icon">
                    <v-icon 
                      :color="getActivityColor(activity.type)"
                      size="20"
                    >
                      {{ getActivityIcon(activity.type) }}
                    </v-icon>
                  </div>
                  
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-description">{{ activity.description }}</div>
                    <div class="activity-meta">
                      <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
                      <v-chip
                        v-if="activity.status"
                        :color="getStatusColor(activity.status)"
                        variant="tonal"
                        size="x-small"
                        class="ml-2"
                      >
                        {{ activity.status }}
                      </v-chip>
                    </div>
                  </div>
                  
                  <div v-if="activity.value" class="activity-value">
                    <span :class="getValueClass(activity.value)">
                      {{ formatValue(activity.value) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Estado vacío -->
              <div v-else class="empty-state">
                <v-icon size="64" class="mb-4 empty-icon">
                  mdi-swap-vertical
                </v-icon>
                <h3 class="text-h6 empty-title">
                  No hay actividad reciente
                </h3>
                <p class="text-body-2 empty-description">
                  Las señales y trades aparecerán aquí
                </p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Notificaciones -->
    <DashboardNotification
      v-if="showNotification"
      :show="showNotification"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      :action="notification.action"
      @close="closeNotification"
      @action="handleNotificationAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import ThemeSelector from '@/components/ThemeSelector.vue';
import DashboardNotification from '@/components/DashboardNotification.vue';

// Composables
const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

// Refs
const refreshing = ref(false);
const lastUpdate = ref('');
const showNotification = ref(false);
const notification = ref({
  type: 'info' as 'success' | 'warning' | 'error' | 'info',
  title: '',
  message: '',
  action: ''
});

// Datos de ejemplo para estadísticas
const stats = ref([
  {
    id: 1,
    label: 'Trades Activos',
    value: '12',
    icon: 'mdi-finance',
    color: '',
    iconSize: 32,
    elevation: 2,
    change: 15
  },
  {
    id: 2,
    label: 'Señales Recibidas',
    value: '47',
    icon: 'mdi-bell-outline',
    color: 'primary',
    iconSize: 32,
    elevation: 2,
    change: 8
  },
  {
    id: 3,
    label: 'Backtests',
    value: '23',
    icon: 'mdi-test-tube',
    color: 'primary',
    iconSize: 32,
    elevation: 2,
    change: -3
  },
  {
    id: 4,
    label: 'P&L Total',
    value: '$2,847.50',
    icon: 'mdi-currency-usd',
    color: 'primary',
    iconSize: 32,
    elevation: 2,
    change: 12
  }
]);

// Datos de ejemplo para actividad reciente
const recentActivity = ref([
  {
    id: 1,
    type: 'trade',
    title: 'Compra BTC/USDT',
    description: 'Orden ejecutada en $43,250.00',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
    status: 'Completado',
    value: 0.5
  },
  {
    id: 2,
    type: 'signal',
    title: 'Señal de Venta ETH/USDT',
    description: 'RSI sobrecomprado detectado',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
    status: 'Pendiente',
    value: -2.3
  },
  {
    id: 3,
    type: 'backtest',
    title: 'Backtest Completado',
    description: 'Estrategia EMA Crossover - 85% win rate',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
    status: 'Exitoso',
    value: 85
  },
  {
    id: 4,
    type: 'trade',
    title: 'Venta ETH/USDT',
    description: 'Orden ejecutada en $2,850.00',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutos atrás
    status: 'Completado',
    value: 1.2
  },
  {
    id: 5,
    type: 'signal',
    title: 'Señal de Compra ADA/USDT',
    description: 'Breakout de resistencia confirmado',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
    status: 'Activo',
    value: 0.8
  }
]);

// Acciones rápidas
const quickActions = ref([
  {
    id: 1,
    title: 'Crear Backtest',
    subtitle: 'Configurar nueva estrategia',
    icon: 'mdi-plus',
    color: 'primary',
    path: '/backtests/create'
  },
  {
    id: 2,
    title: 'Ver Trades',
    subtitle: 'Historial de operaciones',
    icon: 'mdi-chart-line',
    color: 'success',
    path: '/trades'
  },
  {
    id: 3,
    title: 'Ver Señales',
    subtitle: 'Alertas recibidas',
    icon: 'mdi-signal',
    color: 'info',
    path: '/signals'
  },
  {
    id: 4,
    title: 'Gestionar Activos',
    subtitle: 'Configurar instrumentos',
    icon: 'mdi-currency-usd',
    color: 'warning',
    path: '/assets'
  }
]);

// Estado del sistema
const systemStatus = ref([
  {
    id: 1,
    title: 'API Conectada',
    subtitle: 'Todas las funciones disponibles',
    icon: 'mdi-check-circle',
    color: 'success'
  },
  {
    id: 2,
    title: 'Base de Datos',
    subtitle: 'Sincronización en tiempo real',
    icon: 'mdi-check-circle',
    color: 'success'
  },
  {
    id: 3,
    title: 'Webhooks',
    subtitle: 'Configurados y activos',
    icon: 'mdi-check-circle',
    color: 'success'
  },
  {
    id: 4,
    title: 'TradingView',
    subtitle: 'Conectado y monitoreando',
    icon: 'mdi-check-circle',
    color: 'success'
  }
]);

// Computed
const formattedLastUpdate = computed(() => {
  return new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Methods
const handleLogout = async () => {
  try {
    await authStore.logout();
    await router.push('/login');
  } catch (error) {
    console.error('Error en logout:', error);
  }
};

const navigateTo = (path: string) => {
  router.push(path);
};

const refreshActivity = async () => {
  refreshing.value = true;
  // Simular actualización
  await new Promise(resolve => setTimeout(resolve, 1000));
  refreshing.value = false;
  lastUpdate.value = formattedLastUpdate.value;
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'trade': return themeStore.currentTheme.colors.primary;
    case 'signal': return themeStore.currentTheme.colors.info;
    case 'backtest': return themeStore.currentTheme.colors.success;
    default: return themeStore.currentTheme.colors.secondary;
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'trade': return 'mdi-chart-line';
    case 'signal': return 'mdi-signal';
    case 'backtest': return 'mdi-test-tube';
    default: return 'mdi-information';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completado':
    case 'Exitoso': return 'success';
    case 'Pendiente': return 'warning';
    case 'Activo': return 'info';
    default: return 'secondary';
  }
};

const getValueClass = (value: number) => {
  return value >= 0 ? 'positive-value' : 'negative-value';
};

const formatValue = (value: number) => {
  if (value >= 0) {
    return `+${value}%`;
  }
  return `${value}%`;
};

const formatTime = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  return timestamp.toLocaleDateString();
};

const closeNotification = () => {
  showNotification.value = false;
};

const handleNotificationAction = () => {
  // Aquí puedes manejar la acción de la notificación
  console.log('Acción de notificación ejecutada');
  closeNotification();
};

const showWelcomeNotification = () => {
  notification.value = {
    type: 'success',
    title: '¡Bienvenido de vuelta!',
    message: 'El sistema está funcionando correctamente y listo para recibir señales.',
    action: 'Ver Actividad'
  };
  showNotification.value = true;
};

// Lifecycle
onMounted(() => {
  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  // Inicializar última actualización
  lastUpdate.value = formattedLastUpdate.value;
  
  // Mostrar notificación de bienvenida después de un breve delay
  setTimeout(() => {
    showWelcomeNotification();
  }, 1000);
});
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--background);
}

.toolbar-dashboard {
  background: var(--card-bg);
  border-bottom: 1px solid var(--card-border);
}

.dashboard-header {
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  padding-top: 24px;
  padding-bottom: 24px;
  margin-bottom: 0;
}

.header-content h1 {
  color: var(--on-background);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-section {
  padding-top: 16px;
  padding-bottom: 16px;
}

.stat-card,
.stat-card-compact {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}


.stat-card-text {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 16px;
  align-items: center;
}

.stat-card-text .text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.stat-card::before,
.stat-card-compact::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before,
.stat-card-compact:hover::before {
  opacity: 1;
}

.stat-icon-container,
.stat-icon-container-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(var(--primary), 0.1);
}

.stat-icon-container {
  width: 64px;
  height: 64px;
}

.stat-icon-container-compact {
  width: 48px;
  height: 48px;
}

.activity-section {
  padding-top: 16px;
}

.activity-card {
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.activity-list {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--card-border);
  transition: all 0.3s ease;
  cursor: pointer;
}

.activity-item:hover {
  background: rgba(var(--primary), 0.05);
  transform: translateX(4px);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(var(--primary), 0.1);
  margin-right: 16px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--on-surface);
  margin-bottom: 4px;
}

.activity-description {
  font-size: 12px;
  color: var(--on-surface);
  opacity: 0.7;
  margin-bottom: 4px;
}

.activity-meta {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: var(--on-surface);
  opacity: 0.6;
}

.activity-value {
  font-weight: 600;
  font-size: 14px;
  margin-left: 16px;
}

.positive-value {
  color: var(--success);
}

.negative-value {
  color: var(--error);
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.sidebar-section {
  padding-top: 16px;
}

.quick-actions-card,
.system-info-card,
.performance-card {
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.quick-actions-list {
  padding: 0;
}

.quick-action-item {
  padding: 16px;
  border-bottom: 1px solid var(--card-border);
  transition: all 0.3s ease;
  cursor: pointer;
}

.quick-action-item:hover {
  background: rgba(var(--primary), 0.05);
}

.quick-action-item:last-child {
  border-bottom: none;
}

.action-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(var(--primary), 0.1);
  margin-right: 12px;
}

.action-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--on-surface);
}

.action-subtitle {
  font-size: 12px;
  color: var(--on-surface);
  opacity: 0.7;
}

.system-status-list {
  padding: 0;
}

.status-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--card-border);
}

.status-item:last-child {
  border-bottom: none;
}

.status-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--on-surface);
}

.status-subtitle {
  font-size: 11px;
  color: var(--on-surface);
  opacity: 0.7;
}

.performance-chart {
  padding: 16px 0;
}

.chart-container {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 120px;
  gap: 8px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, var(--primary), var(--accent));
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all 0.3s ease;
  min-width: 20px;
}

.chart-bar:hover {
  transform: scaleY(1.1);
  box-shadow: 0 4px 12px rgba(var(--primary), 0.3);
}

.chart-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: var(--on-surface);
  opacity: 0.7;
}

/* Animaciones */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 960px) {
  .dashboard-header {
    padding-top: 16px;
    padding-bottom: 16px;
  }
  
  .header-content h1 {
    font-size: 1.75rem !important;
  }
  
  .header-actions {
    margin-top: 16px;
    width: 100%;
    justify-content: space-between;
  }
  
  .stats-section {
    padding-top: 12px;
    padding-bottom: 12px;
  }
  
  .stat-card,
  .stat-card-compact {
    margin-bottom: 12px;
  }
  
  .activity-section,
  .sidebar-section {
    padding-top: 16px;
  }
  
  .activity-item {
    padding: 12px;
  }
  
  .activity-icon {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }
  
  .chart-container {
    height: 100px;
    gap: 4px;
  }
  
  .chart-label {
    font-size: 8px;
    bottom: -16px;
  }
}

@media (max-width: 600px) {
  .dashboard-header {
    padding: 12px;
  }
  
  .header-content h1 {
    font-size: 1.5rem !important;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .stats-section {
    padding: 8px;
  }
  
  .activity-section,
  .sidebar-section {
    padding: 12px;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .activity-value {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .quick-action-item {
    padding: 12px;
  }
  
  .action-icon-container {
    width: 28px;
    height: 28px;
    margin-right: 8px;
  }
}

/* Estilos de texto adaptativos para ambos temas */
.stat-value {
  color: var(--on-surface);
}

.stat-label {
  color: var(--on-surface);
  opacity: 0.7;
}

.activity-title-text {
  color: var(--on-surface);
}

.empty-icon {
  color: var(--on-surface) !important;
  opacity: 0.3;
}

.empty-title {
  color: var(--on-surface);
  opacity: 0.7;
}

.empty-description {
  color: var(--on-surface);
  opacity: 0.5;
}

/* Asegurar que los elementos de actividad tengan colores correctos */
.activity-item {
  border-bottom: 1px solid var(--card-border);
}

.activity-item:hover {
  background: rgba(var(--primary), 0.05);
}

.activity-icon {
  background: rgba(var(--primary), 0.1);
}

/* Scrollbar personalizado */
.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track {
  background: rgba(var(--on-surface), 0.1);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: var(--secondary);
}
</style> 