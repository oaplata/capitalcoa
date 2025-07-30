<template>
  <div class="assets-page">
    <!-- Header del Assets con animaciones -->
    <v-toolbar title="Gestión de Activos" class="toolbar-assets">
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

    <!-- Filtros y búsqueda -->
    <v-container fluid>
      <v-card class="filters-card fade-in-up" elevation="2">
        <v-card-text>
          <v-row align="center" no-gutters>
            <v-spacer></v-spacer>
            <v-col cols="12" sm="6" md="2">
              <v-btn
                :color="themeStore.currentTheme.colors.primary"
                @click="openCreateDialog"
                :loading="assetsStore.isLoading"
                block
              >
                <v-icon left>mdi-plus</v-icon>
                Nuevo
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Contenido principal -->
    <v-container fluid>
      <!-- Indicador de carga -->
      <div v-if="assetsStore.isLoading" class="loading-container">
        <LoadingSpinner />
        <p class="text-body-1 mt-4 loading-text">Cargando activos...</p>
      </div>

      <!-- Error display -->
      <ErrorDisplay
        v-if="assetsStore.error"
        :error="assetsStore.error"
        @dismiss="assetsStore.clearError"
        class="mb-4"
      />

      <!-- Vista de tabla con grupos -->
      <div v-if="!assetsStore.isLoading && assetsStore.hasAssets" class="table-view">
        <!-- Header de la tabla -->
        <div class="table-header">
          <div class="header-content">
            <div class="header-left">
              <h3 class="header-title">Ticker</h3>
              <v-icon size="16" class="header-icon">mdi-arrow-up</v-icon>
            </div>
            <div class="header-right">
              <span class="header-count">{{ assetsStore.assets.length }} símbolos</span>
            </div>
          </div>
        </div>

        <!-- Grupos de activos -->
        <div class="asset-groups">
          <div 
            v-for="(group, groupIndex) in groupedAssets" 
            :key="group.type" 
            class="asset-group"
          >
            <!-- Header del grupo -->
            <div 
              class="group-header"
              @click="toggleGroup(group.type)"
              :class="{ 'expanded': expandedGroups.includes(group.type) }"
            >
              <div class="group-header-content">
                <div class="group-header-left">
                  <v-icon 
                    class="group-arrow"
                    :class="{ 'rotated': expandedGroups.includes(group.type) }"
                  >
                    mdi-chevron-down
                  </v-icon>
                  <span class="group-title">{{ getAssetTypeLabel(group.type) }}</span>
                  <span class="group-percentage">({{ calculateGroupPercentage(group.assets.length) }}%)</span>
                </div>
                <div class="group-header-right">
                  <span class="group-count">{{ group.assets.length }} {{ group.assets.length === 1 ? 'activo' : 'activos' }}</span>
                </div>
              </div>
            </div>

            <!-- Contenido del grupo -->
            <div 
              v-show="expandedGroups.includes(group.type)"
              class="group-content"
            >
              <div 
                v-for="(asset, assetIndex) in group.assets" 
                :key="asset.id"
                class="asset-row"
                :class="{ 'last-row': assetIndex === group.assets.length - 1 }"
              >
                <div class="asset-row-content">
                  <!-- Logo del activo -->
                  <div class="asset-logo">
                    <v-img 
                      :src="asset.logo_url" 
                      alt="Asset Icon" 
                      class="asset-logo-img"
                      :aspect-ratio="1"
                    />
                  </div>

                  <!-- Ticker -->
                  <div class="asset-ticker">
                    <span class="ticker-symbol">{{ asset.ticker }}</span>
                  </div>

                  <!-- Nombre del activo -->
                  <div class="asset-name">
                    <span class="name-text">{{ asset.name }}</span>
                  </div>

                  <!-- Mercado -->
                  <div class="asset-market">
                    <span class="market-text">{{ asset.market || 'N/A' }}</span>
                  </div>

                  <!-- Acciones -->
                  <div class="asset-actions">
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
                          @click="openEditDialog(asset)"
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
                          @click="openDeleteDialog(asset)"
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
        </div>

        <!-- Paginación -->
        <div v-if="assetsStore.totalPages > 1" class="pagination-container">
          <v-pagination
            v-model="assetsStore.currentPage"
            :length="assetsStore.totalPages"
            :total-visible="7"
            @update:model-value="assetsStore.setPage"
            :color="themeStore.currentTheme.colors.primary"
          />
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else-if="!assetsStore.isLoading && !assetsStore.hasAssets" class="empty-state">
        <v-card class="empty-card fade-in-up" elevation="2">
          <v-card-text class="text-center pa-8">
            <v-icon size="80" class="mb-4 empty-icon">
              mdi-currency-usd
            </v-icon>
            <h3 class="text-h5 font-weight-bold mb-2 empty-title">
              No hay activos registrados
            </h3>
            <p class="text-body-1 empty-description mb-6">
              Comienza agregando tu primer activo financiero para poder recibir señales y realizar trades.
            </p>
            <v-btn
              :color="themeStore.currentTheme.colors.primary"
              size="large"
              @click="openCreateDialog"
            >
              <v-icon left>mdi-plus</v-icon>
              Agregar Primer Activo
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
    </v-container>

    <!-- Formulario de activo -->
    <AssetForm
      v-model="showAssetForm"
      :asset="selectedAsset"
      @saved="handleAssetSaved"
    />

    <!-- Confirmación de eliminación -->
    <DeleteConfirmDialog
      v-model="showDeleteDialog"
      :asset-name="assetToDelete?.name || ''"
      :is-loading="assetsStore.isLoading"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useAssetsStore } from '@/stores/assets';
import { useThemeStore } from '@/stores/theme';
import ThemeSelector from '@/components/ThemeSelector.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ErrorDisplay from '@/components/ErrorDisplay.vue';
import AssetForm from '@/components/AssetForm.vue';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog.vue';
import type { Asset, AssetType, Market } from '@/types/asset';

// Composables
const router = useRouter();
const authStore = useAuthStore();
const assetsStore = useAssetsStore();
const themeStore = useThemeStore();

// Refs
const searchQuery = ref('');
const selectedType = ref('');
const selectedMarket = ref('');
const showAssetForm = ref(false);
const showDeleteDialog = ref(false);
const selectedAsset = ref<Asset | null>(null);
const assetToDelete = ref<Asset | null>(null);
const expandedGroups = ref<string[]>([]);

// Asset types
const assetTypes: AssetType[] = [
  { value: 'crypto', label: 'CRIPTOMONEDAS', icon: 'mdi-currency-btc', color: '#FFB800' },
  { value: 'stock', label: 'ACCIONES', icon: 'mdi-chart-line', color: '#00D4AA' },
  { value: 'etf', label: 'ETFs', icon: 'mdi-chart-box', color: '#4ECDC4' },
  { value: 'forex', label: 'FOREX', icon: 'mdi-currency-usd', color: '#FF6B6B' },
  { value: 'commodity', label: 'COMMODITIES', icon: 'mdi-gold', color: '#FFB800' },
  { value: 'bond', label: 'BONOS', icon: 'mdi-certificate', color: '#00B8D4' }
];

// Markets
const markets: Market[] = [
  { value: 'BINANCE', label: 'Binance', icon: 'mdi-currency-btc' },
  { value: 'NASDAQ', label: 'NASDAQ', icon: 'mdi-chart-line' },
  { value: 'NYSE', label: 'NYSE', icon: 'mdi-chart-line' },
  { value: 'FOREX', label: 'Forex', icon: 'mdi-currency-usd' },
  { value: 'COINBASE', label: 'Coinbase', icon: 'mdi-currency-btc' },
  { value: 'KRAKEN', label: 'Kraken', icon: 'mdi-currency-btc' }
];

// Computed
const assetTypeOptions = computed(() => [
  { value: '', label: 'Todos los tipos' },
  ...assetTypes
]);

const marketOptions = computed(() => [
  { value: '', label: 'Todos los mercados' },
  ...markets
]);

// Computed para agrupar assets
const groupedAssets = computed(() => {
  if (!assetsStore.assets || assetsStore.assets.length === 0) {
    return [];
  }

  const grouped: { type: string; assets: Asset[] }[] = [];
  const uniqueTypes = new Set(assetsStore.assets.map(asset => asset.type));

  uniqueTypes.forEach(type => {
    grouped.push({
      type,
      assets: assetsStore.assets.filter(asset => asset.type === type)
    });
  });

  return grouped;
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

const handleSearch = () => {
  assetsStore.setFilters({ ticker: searchQuery.value });
};

const clearSearch = () => {
  searchQuery.value = '';
  assetsStore.setFilters({ ticker: '' });
};

const handleFilter = () => {
  const filters: any = {};
  if (selectedType.value) filters.type = selectedType.value;
  if (selectedMarket.value) filters.market = selectedMarket.value;
  assetsStore.setFilters(filters);
};

const openCreateDialog = () => {
  selectedAsset.value = null;
  showAssetForm.value = true;
};

const openEditDialog = (asset: Asset) => {
  selectedAsset.value = asset;
  showAssetForm.value = true;
};

const openDeleteDialog = (asset: Asset) => {
  assetToDelete.value = asset;
  showDeleteDialog.value = true;
};

const handleAssetSaved = (asset: Asset) => {
  // El store ya maneja la actualización de la lista
  console.log('Asset saved:', asset);
};

const handleDeleteConfirm = async () => {
  if (!assetToDelete.value) return;

  try {
    await assetsStore.deleteAsset(assetToDelete.value.ticker);
    showDeleteDialog.value = false;
    assetToDelete.value = null;
  } catch (error) {
    // Error ya manejado en el store
    console.error('Error deleting asset:', error);
  }
};

const getAssetTypeIcon = (type: string) => {
  const assetType = assetTypes.find(t => t.value === type);
  return assetType?.icon || 'mdi-help-circle';
};

const getAssetTypeColor = (type: string) => {
  const assetType = assetTypes.find(t => t.value === type);
  return assetType?.color || themeStore.currentTheme.colors.primary;
};

const getAssetTypeLabel = (type: string) => {
  const assetType = assetTypes.find(t => t.value === type);
  return assetType?.label || type;
};

const calculateGroupPercentage = (groupCount: number) => {
  const total = assetsStore.assets.length;
  return total > 0 ? ((groupCount / total) * 100).toFixed(2) : '0.00';
};

const toggleGroup = (type: string) => {
  const index = expandedGroups.value.indexOf(type);
  if (index > -1) {
    expandedGroups.value.splice(index, 1);
  } else {
    expandedGroups.value.push(type);
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Lifecycle
onMounted(() => {
  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  // Cargar activos
  assetsStore.fetchAssets();
  
  // Expandir todos los grupos por defecto
  if (assetsStore.assets.length > 0) {
    const uniqueTypes = new Set(assetsStore.assets.map(asset => asset.type));
    expandedGroups.value = Array.from(uniqueTypes);
  }
});

// Watchers
watch(() => assetsStore.error, (error) => {
  if (error) {
    console.error('Assets error:', error);
  }
});

watch(() => assetsStore.assets, (assets) => {
  if (assets && assets.length > 0) {
    const uniqueTypes = new Set(assets.map(asset => asset.type));
    expandedGroups.value = Array.from(uniqueTypes);
  }
});
</script>

<style scoped>
.assets-page {
  min-height: 100vh;
  background: var(--background);
}

.toolbar-assets {
  background: var(--card-bg);
  border-bottom: 1px solid var(--card-border);
}

/* Título del toolbar adaptativo */
.toolbar-assets :deep(.v-toolbar-title) {
  color: var(--on-surface) !important;
  font-weight: 600;
}

/* Asegurar que todos los elementos del toolbar usen colores del tema */
.toolbar-assets :deep(.v-btn) {
  color: var(--on-surface) !important;
}

.toolbar-assets :deep(.v-btn:hover) {
  background-color: rgba(var(--primary), 0.1) !important;
}

.filters-section {
  padding-top: 16px;
  padding-bottom: 16px;
}

.filters-card {
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.search-field :deep(.v-field__input),
.filter-field :deep(.v-field__input) {
  color: var(--on-surface);
}

.search-field :deep(.v-label),
.filter-field :deep(.v-label),
.search-field :deep(.v-field-label),
.filter-field :deep(.v-field-label) {
  color: var(--on-surface);
  opacity: 0.7;
}

.search-field :deep(.v-field__outline),
.filter-field :deep(.v-field__outline) {
  color: var(--card-border);
}

.search-field :deep(.v-field--focused .v-field__outline),
.filter-field :deep(.v-field--focused .v-field__outline) {
  color: var(--primary);
}

.search-field :deep(.v-select__selection),
.filter-field :deep(.v-select__selection) {
  color: var(--on-surface);
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
  padding-top: 16px;
}

/* Header de la tabla */
.table-header {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px 12px 0 0;
  padding: 16px 24px;
  margin-bottom: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  color: var(--on-surface);
  font-weight: 600;
  font-size: 16px;
  margin: 0;
}

.header-icon {
  color: var(--on-surface);
  opacity: 0.7;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-count {
  color: var(--on-surface);
  opacity: 0.7;
  font-size: 14px;
}

/* Grupos de activos */
.asset-groups {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-top: none;
  border-radius: 0 0 12px 12px;
}

.asset-group {
  border-bottom: 1px solid var(--card-border);
}

.asset-group:last-child {
  border-bottom: none;
}

/* Header del grupo */
.group-header {
  padding: 16px 24px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid var(--card-border);
}

.group-header:hover {
  background-color: rgba(var(--primary), 0.05);
}

.group-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-arrow {
  color: var(--on-surface);
  transition: transform 0.2s ease;
  font-size: 18px;
}

.group-arrow.rotated {
  transform: rotate(180deg);
}

.group-title {
  color: var(--on-surface);
  font-weight: 600;
  font-size: 16px;
}

.group-percentage {
  color: var(--on-surface);
  opacity: 0.7;
  font-size: 14px;
}

.group-header-right {
  display: flex;
  align-items: center;
}

.group-count {
  color: var(--on-surface);
  opacity: 0.7;
  font-size: 14px;
}

/* Contenido del grupo */
.group-content {
  background: var(--background);
}

/* Fila de activo */
.asset-row {
  border-bottom: 1px solid rgba(var(--on-surface), 0.1);
  transition: background-color 0.2s ease;
}

.asset-row:hover {
  background-color: rgba(var(--primary), 0.05);
}

.asset-row.last-row {
  border-bottom: none;
}

.asset-row-content {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  gap: 16px;
}

/* Logo del activo */
.asset-logo {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(var(--primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.asset-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Ticker */
.asset-ticker {
  flex-shrink: 0;
  min-width: 80px;
}

.ticker-symbol {
  background: rgba(var(--on-surface), 0.1);
  color: var(--on-surface);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

/* Nombre del activo */
.asset-name {
  flex: 1;
  min-width: 0;
}

.name-text {
  color: var(--on-surface);
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Mercado */
.asset-market {
  flex-shrink: 0;
  min-width: 100px;
}

.market-text {
  color: var(--on-surface);
  opacity: 0.7;
  font-size: 14px;
}

/* Acciones */
.asset-actions {
  flex-shrink: 0;
}

.action-btn {
  color: var(--on-surface) !important;
  opacity: 0.7;
}

.action-btn:hover {
  opacity: 1;
  background-color: rgba(var(--primary), 0.1) !important;
}

.action-menu {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
}

.action-item {
  color: var(--on-surface);
}

.action-text {
  color: var(--on-surface);
}

.empty-state {
  padding-top: 48px;
}

.empty-card {
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  max-width: 500px;
  margin: 0 auto;
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

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

.pagination-container :deep(.v-pagination__list) {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 8px;
}

.pagination-container :deep(.v-pagination__item) {
  color: var(--on-surface);
}

.pagination-container :deep(.v-pagination__item--is-active) {
  background: var(--primary);
  color: white;
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

/* Responsive */
@media (max-width: 960px) {
  .filters-section {
    padding-top: 12px;
    padding-bottom: 12px;
  }
  
  .table-view {
    padding-top: 12px;
  }
  
  .asset-row-content {
    padding: 12px 16px;
    gap: 12px;
  }
  
  .asset-logo {
    width: 32px;
    height: 32px;
  }
  
  .ticker-symbol {
    font-size: 11px;
    padding: 3px 8px;
  }
  
  .name-text {
    font-size: 13px;
  }
  
  .market-text {
    font-size: 13px;
  }
}

@media (max-width: 600px) {
  .filters-section {
    padding: 8px;
  }
  
  .table-view {
    padding: 12px;
  }
  
  .table-header {
    padding: 12px 16px;
  }
  
  .group-header {
    padding: 12px 16px;
  }
  
  .asset-row-content {
    padding: 12px 16px;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .asset-logo {
    width: 28px;
    height: 28px;
  }
  
  .asset-ticker {
    min-width: 60px;
  }
  
  .asset-market {
    min-width: 80px;
  }
  
  .group-title {
    font-size: 14px;
  }
  
  .group-percentage {
    font-size: 12px;
  }
  
  .group-count {
    font-size: 12px;
  }
}
</style> 