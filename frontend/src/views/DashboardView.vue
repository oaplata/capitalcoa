<template>
  <div class="dashboard-page">
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
                        size="small"
                        class="ml-2"
                      >
                        {{ activity.status }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Estado vacío -->
              <div v-else class="empty-activity">
                <v-icon size="48" class="empty-icon">mdi-inbox</v-icon>
                <p class="empty-text">No hay actividad reciente</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useThemeStore } from '@/stores/theme';

// Composables
const themeStore = useThemeStore();

// Refs
const refreshing = ref(false);

// Stats data
const stats = ref([
  {
    id: 1,
    label: 'Activos Totales',
    value: '24',
    icon: 'mdi-currency-usd',
    iconSize: 32,
    elevation: 2
  },
  {
    id: 2,
    label: 'Señales Hoy',
    value: '8',
    icon: 'mdi-bell-ring',
    iconSize: 32,
    elevation: 2
  },
  {
    id: 3,
    label: 'Trades Activos',
    value: '3',
    icon: 'mdi-chart-line',
    iconSize: 32,
    elevation: 2
  },
  {
    id: 4,
    label: 'Ganancia Total',
    value: '+12.5%',
    icon: 'mdi-trending-up',
    iconSize: 32,
    elevation: 4
  }
]);

// Mock activity data
const recentActivity = ref([
  {
    id: 1,
    title: 'Nueva señal generada',
    description: 'Señal de compra para BTC/USDT en Binance',
    type: 'signal',
    status: 'Nuevo',
    timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutos atrás
  },
  {
    id: 2,
    title: 'Trade completado',
    description: 'Trade BTC/USDT cerrado con +2.5% de ganancia',
    type: 'trade',
    status: 'Completado',
    timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 minutos atrás
  },
  {
    id: 3,
    title: 'Activo agregado',
    description: 'Se agregó ETH/USDT a la lista de activos',
    type: 'asset',
    status: 'Agregado',
    timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutos atrás
  },
  {
    id: 4,
    title: 'Backtest finalizado',
    description: 'Backtest de estrategia MA completado',
    type: 'backtest',
    status: 'Finalizado',
    timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hora atrás
  }
]);

// Methods
const refreshActivity = async () => {
  refreshing.value = true;
  // Simular carga
  await new Promise(resolve => setTimeout(resolve, 1000));
  refreshing.value = false;
};

const getActivityColor = (type: string) => {
  const colors = {
    signal: 'primary',
    trade: 'success',
    asset: 'info',
    backtest: 'warning'
  };
  return colors[type as keyof typeof colors] || 'primary';
};

const getActivityIcon = (type: string) => {
  const icons = {
    signal: 'mdi-bell-ring',
    trade: 'mdi-chart-line',
    asset: 'mdi-currency-usd',
    backtest: 'mdi-test-tube'
  };
  return icons[type as keyof typeof icons] || 'mdi-information';
};

const getStatusColor = (status: string) => {
  const colors = {
    'Nuevo': 'primary',
    'Completado': 'success',
    'Agregado': 'info',
    'Finalizado': 'warning'
  };
  return colors[status as keyof typeof colors] || 'primary';
};

const formatTime = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} h`;
  return timestamp.toLocaleDateString('es-ES');
};

// Lifecycle
onMounted(() => {
  // Inicializar dashboard
  console.log('Dashboard inicializado');
});
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--background);
}

.stats-section {
  padding-top: 16px;
  padding-bottom: 16px;
}

.stat-card-compact {
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
}

.stat-card-compact:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-card-text {
  color: var(--on-surface);
}

.stat-icon-container-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(var(--primary), 0.1);
  margin: 0 auto;
}

.stat-icon {
  transition: all 0.3s ease;
}

.stat-card-compact:hover .stat-icon {
  transform: scale(1.1);
}

.stat-value {
  color: var(--on-surface);
  margin-bottom: 4px;
}

.stat-label {
  color: var(--on-surface);
  opacity: 0.7;
}

.activity-section {
  margin-top: 16px;
}

.activity-card {
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.activity-title-text {
  color: var(--on-surface);
}

.activity-list {
  padding: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid rgba(var(--on-surface), 0.1);
  transition: background-color 0.2s ease;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background-color: rgba(var(--primary), 0.05);
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
  color: var(--on-surface);
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.activity-description {
  color: var(--on-surface);
  opacity: 0.7;
  font-size: 13px;
  margin-bottom: 8px;
}

.activity-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.activity-time {
  color: var(--on-surface);
  opacity: 0.5;
  font-size: 12px;
}

.empty-activity {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  color: var(--on-surface) !important;
  opacity: 0.3;
  margin-bottom: 16px;
}

.empty-text {
  color: var(--on-surface);
  opacity: 0.7;
  font-size: 14px;
}

/* Animaciones */
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

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
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

.slide-in-right {
  animation: slideInRight 0.6s ease-out;
}

.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
}

/* Responsive */
@media (max-width: 960px) {
  .stats-section {
    padding-top: 12px;
    padding-bottom: 12px;
  }
  
  .activity-section {
    margin-top: 12px;
  }
  
  .activity-list {
    padding: 12px;
  }
  
  .activity-item {
    padding: 12px;
  }
}

@media (max-width: 600px) {
  .stats-section {
    padding: 8px;
  }
  
  .activity-section {
    margin-top: 8px;
  }
  
  .activity-list {
    padding: 8px;
  }
  
  .activity-item {
    padding: 8px;
    flex-direction: column;
  }
  
  .activity-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .activity-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style> 