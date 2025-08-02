<template>
  <div class="signals-page">
    <!-- Filtros y búsqueda -->
    <v-container fluid>
      <v-card class="filters-card fade-in-up" elevation="2">
        <v-card-text>
          <v-row align="center" no-gutters>
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="searchQuery"
                label="Buscar por ticker"
                variant="outlined"
                density="compact"
                hide-details
                @input="handleSearch"
                @click:clear="clearSearch"
                clearable
              >
                <template #prepend-inner>
                  <v-icon size="20">mdi-magnify</v-icon>
                </template>
              </v-text-field>
            </v-col>
            
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedType"
                label="Tipo de señal"
                :items="signalTypeOptions"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="handleFilter"
                clearable
              >
                <template #prepend-inner>
                  <v-icon size="20">mdi-filter</v-icon>
                </template>
              </v-select>
            </v-col>
            
            <v-spacer></v-spacer>
            
            <v-col cols="12" sm="6" md="2">
              <v-btn
                :color="themeStore.currentTheme.colors.primary"
                @click="openCreateDialog"
                :loading="signalsStore.isLoading"
                block
              >
                <v-icon left>mdi-plus</v-icon>
                Nueva Señal
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Contenido principal -->
    <v-container fluid>
      <!-- Indicador de carga -->
      <div v-if="signalsStore.isLoading" class="loading-container">
        <LoadingSpinner />
        <p class="text-body-1 mt-4 loading-text">Cargando señales...</p>
      </div>

      <!-- Error display -->
      <ErrorDisplay
        v-if="signalsStore.error"
        :error="signalsStore.error"
        @dismiss="signalsStore.clearError"
        class="mb-4"
      />

      <!-- Vista de tabla con grupos -->
      <div v-if="!signalsStore.isLoading && signalsStore.hasSignals" class="table-view">
        <div class="signal-groups">
          <div class="signal-group">
            <div 
              v-for="(signal, signalIndex) in signalsStore.signals" 
              :key="signal.id"
              class="signal-row"
              :class="{ 'last-row': signalIndex === signalsStore.signals.length - 1 }"
            >
              <div class="signal-row-content">
                <!-- Logo del activo -->
                <div class="signal-asset-logo">
                  <v-img 
                    :src="signal.asset?.logo_url" 
                    alt="Asset Icon" 
                    class="asset-logo-img"
                    :aspect-ratio="1"
                  >
                    <template #placeholder>
                      <v-icon size="24" color="grey">mdi-currency-usd</v-icon>
                    </template>
                  </v-img>
                </div>
    
                <!-- Ticker -->
                <div class="signal-ticker">
                  <span class="ticker-symbol">{{ signal.asset_ticker }}</span>
                </div>
    
                <!-- Nombre del activo -->
                <div class="signal-asset-name">
                  <span class="name-text">{{ signal.asset?.name || 'N/A' }}</span>
                </div>
    
                <!-- Tipo de señal -->
                <div class="signal-type">
                  <v-chip
                    :color="getSignalTypeColor(signal.signal_type)"
                    size="small"
                    variant="tonal"
                  >
                    <v-icon 
                      :color="getSignalTypeColor(signal.signal_type)"
                      size="16"
                      class="mr-1"
                    >
                      {{ getSignalTypeIcon(signal.signal_type) }}
                    </v-icon>
                    {{ getSignalTypeLabel(signal.signal_type) }}
                  </v-chip>
                </div>
    
                <!-- Precio de entrada -->
                <div class="signal-entry">
                  <span class="price-label">Entrada:</span>
                  <span class="price-value">${{ formatPrice(signal.entry) }}</span>
                </div>
    
                <!-- Stop Loss -->
                <div class="signal-stop-loss">
                  <span class="price-label">Stop Loss:</span>
                  <span class="price-value error--text">${{ formatPrice(signal.stop_loss) }}</span>
                </div>
    
                <!-- Objetivo -->
                <div class="signal-target">
                  <span class="price-label">Objetivo:</span>
                  <span class="price-value success--text">${{ formatPrice(signal.target) }}</span>
                </div>
    
                <!-- Fecha -->
                <div class="signal-date">
                  <span class="date-text">{{ formatDate(signal.created_at) }}</span>
                </div>
    
                <!-- Acciones -->
                <div class="signal-actions">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        variant="text"
                        v-bind="props"
                        size="small"
                        class="action-btn"
                      >
                        <v-icon size="18">mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list class="action-menu">
                      <v-list-item
                        @click="openEditDialog(signal)"
                        class="action-item"
                      >
                        <template #prepend>
                          <v-icon 
                            :color="themeStore.currentTheme.colors.primary"
                            size="20"
                          >
                            mdi-pencil
                          </v-icon>
                        </template>
                        <v-list-item-title class="action-text">Editar</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        @click="openDeleteDialog(signal)"
                        class="action-item"
                      >
                        <template #prepend>
                          <v-icon 
                            color="error"
                            size="20"
                          >
                            mdi-delete
                          </v-icon>
                        </template>
                        <v-list-item-title class="action-text">Eliminar</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="signalsStore.totalPages > 1" class="pagination-container">
          <v-pagination
            v-model="signalsStore.currentPage"
            :length="signalsStore.totalPages"
            :total-visible="7"
            @update:model-value="signalsStore.setPage"
            :color="themeStore.currentTheme.colors.primary"
          />
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else-if="!signalsStore.isLoading && !signalsStore.hasSignals" class="empty-state">
        <v-card class="empty-card fade-in-up" elevation="2">
          <v-card-text class="text-center pa-8">
            <v-icon size="80" class="mb-4 empty-icon">
              mdi-trending-up
            </v-icon>
            <h3 class="text-h5 font-weight-bold mb-2 empty-title">
              No hay señales registradas
            </h3>
            <p class="text-body-1 empty-description mb-6">
              Comienza agregando tu primera señal de trading para recibir alertas y realizar trades.
            </p>
            <v-btn
              :color="themeStore.currentTheme.colors.primary"
              size="large"
              @click="openCreateDialog"
            >
              <v-icon left>mdi-plus</v-icon>
              Agregar Primera Señal
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
    </v-container>

    <!-- Formulario de señal -->
    <SignalForm
      v-model="showSignalForm"
      :signal="selectedSignal"
      @saved="handleSignalSaved"
    />

    <!-- Confirmación de eliminación -->
    <DeleteConfirmDialog
      v-model="showDeleteDialog"
      :asset-name="signalToDelete?.asset?.name || signalToDelete?.asset_ticker || ''"
      :is-loading="signalsStore.isLoading"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useSignalsStore } from '@/stores/signals';
import { useThemeStore } from '@/stores/theme';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ErrorDisplay from '@/components/ErrorDisplay.vue';
import SignalForm from '@/components/SignalForm.vue';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog.vue';
import { SignalType } from '@/types/signal';
import type { Signal } from '@/types/signal';

// Composables
const signalsStore = useSignalsStore();
const themeStore = useThemeStore();

// Refs
const showSignalForm = ref(false);
const showDeleteDialog = ref(false);
const selectedSignal = ref<Signal | null>(null);
const signalToDelete = ref<Signal | null>(null);
const expandedGroups = ref<string[]>([]);
const searchQuery = ref('');
const selectedType = ref<SignalType | null>(null);

// Signal types
const signalTypeOptions = [
  { value: SignalType.LONG, label: 'LONG (Compra)', icon: 'mdi-trending-up', color: '#00D4AA' },
  { value: SignalType.SHORT, label: 'SHORT (Venta)', icon: 'mdi-trending-down', color: '#FF6B6B' }
];

// Methods
const openCreateDialog = () => {
  selectedSignal.value = null;
  showSignalForm.value = true;
};

const openEditDialog = (signal: Signal) => {
  selectedSignal.value = signal;
  showSignalForm.value = true;
};

const openDeleteDialog = (signal: Signal) => {
  signalToDelete.value = signal;
  showDeleteDialog.value = true;
};

const handleSignalSaved = (signal: Signal) => {
  // El store ya maneja la actualización de la lista
  console.log('Signal saved:', signal);
};

const handleDeleteConfirm = async () => {
  if (!signalToDelete.value) return;

  try {
    await signalsStore.deleteSignal(signalToDelete.value.id);
    showDeleteDialog.value = false;
    signalToDelete.value = null;
  } catch (error) {
    // Error ya manejado en el store
    console.error('Error deleting signal:', error);
  }
};

const getSignalTypeIcon = (type: SignalType) => {
  const signalType = signalTypeOptions.find(t => t.value === type);
  return signalType?.icon || 'mdi-help-circle';
};

const getSignalTypeColor = (type: SignalType) => {
  const signalType = signalTypeOptions.find(t => t.value === type);
  return signalType?.color || themeStore.currentTheme.colors.primary;
};

const getSignalTypeLabel = (type: SignalType) => {
  const signalType = signalTypeOptions.find(t => t.value === type);
  return signalType?.label || type;
};

const calculateGroupPercentage = (groupCount: number) => {
  const total = signalsStore.signals.length;
  return total > 0 ? ((groupCount / total) * 100).toFixed(2) : '0.00';
};

const toggleGroup = (type: SignalType) => {
  const index = expandedGroups.value.indexOf(type);
  if (index > -1) {
    expandedGroups.value.splice(index, 1);
  } else {
    expandedGroups.value.push(type);
  }
};

const formatPrice = (price: number) => {
  return price.toFixed(6);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const handleSearch = () => {
  signalsStore.setFilters({ asset_ticker: searchQuery.value || undefined });
};

const clearSearch = () => {
  searchQuery.value = '';
  signalsStore.setFilters({ asset_ticker: undefined });
};

const handleFilter = () => {
  signalsStore.setFilters({ signal_type: selectedType.value || undefined });
};

// Lifecycle
onMounted(() => {
  // Cargar señales
  signalsStore.fetchSignals();
  
  // Expandir todos los grupos por defecto
  if (signalsStore.signals.length > 0) {
    const uniqueTypes = new Set(signalsStore.signals.map(signal => signal.signal_type));
    expandedGroups.value = Array.from(uniqueTypes);
  }
});

// Watchers
watch(() => signalsStore.error, (error) => {
  if (error) {
    console.error('Signals error:', error);
  }
});

watch(() => signalsStore.signals, (signals) => {
  if (signals && signals.length > 0) {
    const uniqueTypes = new Set(signals.map(signal => signal.signal_type));
    expandedGroups.value = Array.from(uniqueTypes);
  }
});
</script>

<style scoped>
.signals-page {
  min-height: 100vh;
  background: var(--background);
}

.filters-card {
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.loading-text {
  color: var(--on-surface);
  opacity: 0.7;
}

/* Vista de tabla */
.table-view {
  animation: fadeInUp 0.6s ease-out;
}

.signal-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.signal-group {
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--card-border);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.group-header {
  background: var(--surface-variant);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--card-border);
}

.group-header:hover {
  background: var(--surface-variant-hover);
}

.group-header.expanded {
  background: var(--primary-container);
}

.group-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.group-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-arrow {
  transition: transform 0.3s ease;
  color: var(--on-surface-variant);
}

.group-arrow.rotated {
  transform: rotate(180deg);
}

.group-title {
  font-weight: 600;
  color: var(--on-surface);
  font-size: 16px;
}

.group-percentage {
  color: var(--on-surface-variant);
  font-size: 14px;
  margin-left: 8px;
}

.group-header-right {
  display: flex;
  align-items: center;
}

.group-count {
  color: var(--on-surface-variant);
  font-size: 14px;
  font-weight: 500;
}

.group-content {
  background: var(--card-bg);
}

.signal-row {
  border-bottom: 1px solid var(--outline-variant);
  transition: background-color 0.2s ease;
}

.signal-row:hover {
  background: var(--surface-variant);
}

.signal-row.last-row {
  border-bottom: none;
}

.signal-row-content {
  display: grid;
  grid-template-columns: 60px 120px 1fr 140px 140px 140px 140px 160px 80px;
  align-items: center;
  padding: 16px 20px;
  gap: 16px;
}

.signal-asset-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.asset-logo-img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.signal-ticker {
  display: flex;
  align-items: center;
}

.ticker-symbol {
  font-weight: 600;
  color: var(--on-surface);
  font-size: 14px;
  font-family: 'Roboto Mono', monospace;
}

.signal-asset-name {
  display: flex;
  align-items: center;
}

.name-text {
  color: var(--on-surface);
  font-size: 14px;
  font-weight: 500;
}

.signal-type {
  display: flex;
  align-items: center;
}

.signal-entry,
.signal-stop-loss,
.signal-target {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-label {
  font-size: 12px;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-value {
  font-weight: 600;
  font-size: 14px;
  font-family: 'Roboto Mono', monospace;
}

.signal-date {
  display: flex;
  align-items: center;
}

.date-text {
  color: var(--on-surface-variant);
  font-size: 12px;
}

.signal-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn {
  color: var(--on-surface-variant) !important;
  opacity: 0.7;
}

.action-btn:hover {
  opacity: 1;
  background-color: rgba(var(--primary), 0.1) !important;
}

.action-menu {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  overflow: hidden;
}

.action-item {
  padding: 8px 16px;
}

.action-text {
  font-size: 14px;
  color: var(--on-surface);
}

/* Paginación */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 24px;
}

/* Estado vacío */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 48px 24px;
}

.empty-card {
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  max-width: 500px;
  width: 100%;
}

.empty-icon {
  color: var(--on-surface-variant);
  opacity: 0.5;
}

.empty-title {
  color: var(--on-surface);
  margin-bottom: 8px;
}

.empty-description {
  color: var(--on-surface-variant);
  line-height: 1.6;
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Responsive */
@media (max-width: 1200px) {
  .signal-row-content {
    grid-template-columns: 50px 100px 1fr 120px 120px 120px 120px 140px 60px;
    gap: 12px;
    padding: 12px 16px;
  }
  
  .group-header-content {
    padding: 12px 16px;
  }
  
  .group-title {
    font-size: 14px;
  }
  
  .price-value {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .signal-row-content {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px 16px;
  }
  
  .signal-asset-logo,
  .signal-ticker,
  .signal-asset-name,
  .signal-type,
  .signal-entry,
  .signal-stop-loss,
  .signal-target,
  .signal-date,
  .signal-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
  }
  
  .price-label {
    margin-right: 8px;
  }
  
  .group-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .group-header-right {
    align-self: flex-end;
  }
}
</style> 