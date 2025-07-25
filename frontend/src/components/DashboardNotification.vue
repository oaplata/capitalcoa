<template>
  <Transition name="notification-slide" appear>
    <div v-if="show" class="dashboard-notification" :class="type">
      <div class="notification-content">
        <div class="notification-icon">
          <v-icon :color="iconColor" size="20">
            {{ icon }}
          </v-icon>
        </div>
        
        <div class="notification-text">
          <div class="notification-title">{{ title }}</div>
          <div class="notification-message">{{ message }}</div>
        </div>
        
        <div class="notification-actions">
          <v-btn
            v-if="action"
            :color="themeStore.currentTheme.colors.primary"
            variant="text"
            size="small"
            @click="handleAction"
          >
            {{ action }}
          </v-btn>
          
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="close"
            class="close-btn"
          />
        </div>
      </div>
      
      <!-- Barra de progreso -->
      <div v-if="autoClose" class="notification-progress">
        <div 
          class="progress-bar"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useThemeStore } from '@/stores/theme';

interface Props {
  show: boolean;
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action?: string;
  autoClose?: boolean;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  autoClose: true,
  duration: 5000,
});

const emit = defineEmits<{
  close: [];
  action: [];
}>();

const themeStore = useThemeStore();
const progress = ref(100);
const progressInterval = ref<number | null>(null);

// Computed
const icon = computed(() => {
  switch (props.type) {
    case 'success': return 'mdi-check-circle';
    case 'warning': return 'mdi-alert';
    case 'error': return 'mdi-alert-circle';
    case 'info': return 'mdi-information';
    default: return 'mdi-information';
  }
});

const iconColor = computed(() => {
  switch (props.type) {
    case 'success': return themeStore.currentTheme.colors.success;
    case 'warning': return themeStore.currentTheme.colors.warning;
    case 'error': return themeStore.currentTheme.colors.error;
    case 'info': return themeStore.currentTheme.colors.info;
    default: return themeStore.currentTheme.colors.info;
  }
});

// Methods
const close = () => {
  emit('close');
};

const handleAction = () => {
  emit('action');
};

const startProgress = () => {
  if (!props.autoClose) return;
  
  const step = 100 / (props.duration / 100);
  progressInterval.value = window.setInterval(() => {
    progress.value -= step;
    if (progress.value <= 0) {
      close();
    }
  }, 100);
};

const stopProgress = () => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value);
    progressInterval.value = null;
  }
};

// Lifecycle
onMounted(() => {
  if (props.show && props.autoClose) {
    startProgress();
  }
});

onUnmounted(() => {
  stopProgress();
});
</script>

<style scoped>
.dashboard-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-width: calc(100vw - 40px);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 9999;
  overflow: hidden;
}

.notification-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--on-surface);
  margin-bottom: 4px;
}

.notification-message {
  font-size: 12px;
  color: var(--on-surface);
  opacity: 0.8;
  line-height: 1.4;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.close-btn {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
}

.notification-progress {
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  transition: width 0.1s linear;
}

/* Variantes de tipo */
.dashboard-notification.success {
  border-left: 4px solid var(--success);
}

.dashboard-notification.warning {
  border-left: 4px solid var(--warning);
}

.dashboard-notification.error {
  border-left: 4px solid var(--error);
}

.dashboard-notification.info {
  border-left: 4px solid var(--info);
}

/* Animaciones */
.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-slide-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-slide-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

/* Responsive */
@media (max-width: 600px) {
  .dashboard-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    max-width: none;
  }
  
  .notification-content {
    padding: 12px;
    gap: 8px;
  }
  
  .notification-icon {
    width: 32px;
    height: 32px;
  }
  
  .notification-title {
    font-size: 13px;
  }
  
  .notification-message {
    font-size: 11px;
  }
}
</style> 