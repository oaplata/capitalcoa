<template>
  <Transition name="error-slide" appear>
    <div v-if="error" class="error-container">
      <v-alert
        :type="type"
        :title="title"
        :text="error"
        variant="tonal"
        :icon="icon"
        closable
        @click:close="$emit('close')"
        class="error-alert"
        :class="{ 'shake': shake }"
      >
        <template #prepend>
          <div class="error-icon-container">
            <v-icon :icon="icon" size="24" />
          </div>
        </template>
        
        <div class="error-content">
          <!-- Acciones adicionales -->
          <div v-if="actions && actions.length > 0" class="error-actions">
            <v-btn
              v-for="action in actions"
              :key="action.label"
              :color="action.color || 'primary'"
              :variant="action.variant"
              :size="action.size || 'small'"
              @click="action.handler"
              class="action-btn"
            >
              <v-icon v-if="action.icon" left size="16">
                {{ action.icon }}
              </v-icon>
              {{ action.label }}
            </v-btn>
          </div>
        </div>
      </v-alert>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ErrorAction {
  label: string;
  handler: () => void;
  color?: string;
  variant?: 'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain';
  size?: string;
  icon?: string;
}

interface Props {
  error?: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  actions?: ErrorAction[];
  shake?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
  title: 'Error',
  shake: false,
});

const emit = defineEmits<{
  close: [];
}>();

const icon = computed(() => {
  switch (props.type) {
    case 'error': return 'mdi-alert-circle';
    case 'warning': return 'mdi-alert';
    case 'info': return 'mdi-information';
    case 'success': return 'mdi-check-circle';
    default: return 'mdi-alert-circle';
  }
});

const title = computed(() => {
  if (props.title) return props.title;
  
  switch (props.type) {
    case 'error': return 'Error';
    case 'warning': return 'Advertencia';
    case 'info': return 'Información';
    case 'success': return 'Éxito';
    default: return 'Error';
  }
});
</script>

<style scoped>
.error-container {
  margin-bottom: 16px;
}

.error-alert {
  border-radius: 12px;
  border-left: 4px solid;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.error-alert:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.error-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(var(--error), 0.1);
  margin-right: 12px;
}

.error-content {
  flex: 1;
}

.error-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
  color: var(--on-surface);
}

.error-message {
  font-size: 14px;
  line-height: 1.5;
  color: var(--on-surface);
  opacity: 0.9;
}

.error-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

/* Animaciones */
.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.3s ease;
}

.error-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.error-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

/* Efecto shake para errores críticos */
.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

/* Variantes de tipo */
.error-alert[data-type="error"] {
  border-left-color: var(--error);
}

.error-alert[data-type="warning"] {
  border-left-color: var(--warning);
}

.error-alert[data-type="info"] {
  border-left-color: var(--info);
}

.error-alert[data-type="success"] {
  border-left-color: var(--success);
}

/* Responsive */
@media (max-width: 600px) {
  .error-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style> 