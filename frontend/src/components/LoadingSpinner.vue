<template>
  <div class="loading-container" :class="{ 'overlay': overlay }">
    <div class="loading-spinner">
      <!-- Spinner principal -->
      <div class="spinner-ring">
        <div class="spinner-segment" v-for="i in 8" :key="i" :style="getSegmentStyle(i)"></div>
      </div>
      
      <!-- Icono central -->
      <div class="spinner-icon">
        <v-icon :icon="icon" :color="color" size="24" />
      </div>
      
      <!-- Texto de carga -->
      <div v-if="text" class="loading-text">
        {{ text }}
      </div>
      
      <!-- Puntos animados -->
      <div class="loading-dots">
        <span class="dot" v-for="i in 3" :key="i" :style="getDotStyle(i)"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  text?: string;
  icon?: string;
  color?: string;
  overlay?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Cargando...',
  icon: 'mdi-chart-line',
  color: 'primary',
  overlay: false,
  size: 'medium',
});

const getSegmentStyle = (index: number) => {
  const delay = (index - 1) * 0.1;
  return {
    transform: `rotate(${index * 45}deg)`,
    animationDelay: `${delay}s`,
  };
};

const getDotStyle = (index: number) => {
  const delay = (index - 1) * 0.2;
  return {
    animationDelay: `${delay}s`,
  };
};

const spinnerSize = computed(() => {
  switch (props.size) {
    case 'small': return '60px';
    case 'large': return '120px';
    default: return '80px';
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-container.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner-ring {
  position: relative;
  width: v-bind(spinnerSize);
  height: v-bind(spinnerSize);
  border-radius: 50%;
}

.spinner-segment {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
  opacity: 0.3;
}

.spinner-segment:nth-child(1) { opacity: 1; }
.spinner-segment:nth-child(2) { opacity: 0.9; }
.spinner-segment:nth-child(3) { opacity: 0.8; }
.spinner-segment:nth-child(4) { opacity: 0.7; }
.spinner-segment:nth-child(5) { opacity: 0.6; }
.spinner-segment:nth-child(6) { opacity: 0.5; }
.spinner-segment:nth-child(7) { opacity: 0.4; }
.spinner-segment:nth-child(8) { opacity: 0.3; }

.spinner-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--surface);
  border-radius: 50%;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

.loading-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--on-surface);
  text-align: center;
  margin-top: 8px;
}

.loading-dots {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Variantes de tamaño */
.loading-spinner.small .spinner-ring {
  width: 60px;
  height: 60px;
}

.loading-spinner.large .spinner-ring {
  width: 120px;
  height: 120px;
}

/* Efectos adicionales */
.spinner-ring::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid var(--primary);
  border-radius: 50%;
  opacity: 0.2;
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}
</style> 