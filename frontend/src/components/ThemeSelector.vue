<template>
  <div class="theme-selector">
    <!-- Botón para cambiar al siguiente tema -->
    <v-btn
      icon
      variant="text"
      color="primary"
      @click="cycleToNextTheme"
      class="theme-toggle-btn"
      :class="{ 'cycling': isCycling }"
    >
      <v-icon>mdi-palette</v-icon>
      <v-tooltip activator="parent" location="bottom">
        {{ tooltipText }}
      </v-tooltip>
    </v-btn>

    <!-- Indicador del tema actual (opcional) -->
    <div v-if="showThemeIndicator" class="theme-indicator">
      <v-chip
        :color="themeStore.currentTheme.colors.primary"
        size="small"
        variant="tonal"
        class="theme-chip"
      >
        <v-icon left size="12">mdi-palette-swatch</v-icon>
        {{ themeStore.currentTheme.name }}
      </v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();

// Props para configuración opcional
interface Props {
  showThemeIndicator?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showThemeIndicator: false,
});

// Estado para animación de cambio
const isCycling = ref(false);

// Computed para el texto del tooltip
const tooltipText = computed(() => {
  const currentIndex = themeStore.availableThemes.findIndex(
    theme => theme.id === themeStore.currentThemeId
  );
  const nextIndex = (currentIndex + 1) % themeStore.availableThemes.length;
  const nextTheme = themeStore.availableThemes[nextIndex];
  
  return `Cambiar a: ${nextTheme.name}`;
});

// Función para cambiar al siguiente tema
const cycleToNextTheme = () => {
  if (isCycling.value) return; // Evitar múltiples clics
  
  isCycling.value = true;
  
  const currentIndex = themeStore.availableThemes.findIndex(
    theme => theme.id === themeStore.currentThemeId
  );
  const nextIndex = (currentIndex + 1) % themeStore.availableThemes.length;
  const nextTheme = themeStore.availableThemes[nextIndex];
  
  // Cambiar al siguiente tema
  themeStore.setTheme(nextTheme.id);
  
  // Resetear el estado de animación después de un delay
  setTimeout(() => {
    isCycling.value = false;
  }, 500);
};
</script>

<style scoped>
.theme-selector {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-toggle-btn {
  transition: all 0.3s ease;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}

.theme-toggle-btn:hover {
  transform: scale(1.1);
  background-color: var(--primary);
  color: var(--on-surface) !important;
}

.theme-toggle-btn.cycling {
  animation: cycle-rotation 0.5s ease-in-out;
}

@keyframes cycle-rotation {
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
  }
}

/* Indicador del tema actual */
.theme-indicator {
  animation: slide-in 0.3s ease-out;
}

.theme-chip {
  transition: all 0.3s ease;
  font-size: 0.75rem;
  font-weight: 500;
}

.theme-chip:hover {
  transform: scale(1.05);
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .theme-selector {
    gap: 4px;
  }
  
  .theme-chip {
    font-size: 0.7rem;
  }
  
  .theme-chip .v-icon {
    font-size: 10px !important;
  }
}
</style> 