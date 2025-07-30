<template>
  <v-dialog
    v-model="showDialog"
    :max-width="600"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="asset-form-card">
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon 
            :color="themeStore.currentTheme.colors.primary" 
            class="mr-3"
            size="24"
          >
            {{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}
          </v-icon>
          <span class="text-h6 form-title-text">
            {{ isEditing ? 'Editar Activo' : 'Nuevo Activo' }}
          </span>
        </div>
        <v-btn
          icon
          variant="text"
          @click="closeDialog"
          :disabled="assetsStore.isLoading"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="isValid" @submit.prevent="handleSubmit">
          <v-row>
            <!-- Ticker -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.ticker"
                label="Símbolo (Ticker)"
                :rules="rules.ticker"
                :disabled="isEditing || assetsStore.isLoading"
                variant="outlined"
                density="comfortable"
                class="form-field"
                :color="themeStore.currentTheme.colors.primary"
              >
                <template #prepend-inner>
                  <v-icon 
                    :color="themeStore.currentTheme.colors.primary"
                    size="20"
                  >
                    mdi-currency-usd
                  </v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Nombre -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name"
                label="Nombre del Activo"
                :rules="rules.name"
                :disabled="assetsStore.isLoading"
                variant="outlined"
                density="comfortable"
                class="form-field"
                :color="themeStore.currentTheme.colors.primary"
              >
                <template #prepend-inner>
                  <v-icon 
                    :color="themeStore.currentTheme.colors.primary"
                    size="20"
                  >
                    mdi-tag-text
                  </v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Tipo -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.type"
                label="Tipo de Activo"
                :items="assetTypes"
                item-title="label"
                item-value="value"
                :rules="rules.type"
                :disabled="assetsStore.isLoading"
                variant="outlined"
                density="comfortable"
                class="form-field"
                :color="themeStore.currentTheme.colors.primary"
              >
                <template #prepend-inner>
                  <v-icon 
                    :color="themeStore.currentTheme.colors.primary"
                    size="20"
                  >
                    mdi-shape
                  </v-icon>
                </template>
                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon 
                        :color="item.raw.color"
                        size="20"
                      >
                        {{ item.raw.icon }}
                      </v-icon>
                    </template>
                    <v-list-item-title>{{ item.raw.label }}</v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Mercado -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.market"
                label="Mercado"
                :items="markets"
                item-title="label"
                item-value="value"
                :disabled="assetsStore.isLoading"
                variant="outlined"
                density="comfortable"
                class="form-field"
                :color="themeStore.currentTheme.colors.primary"
                clearable
              >
                <template #prepend-inner>
                  <v-icon 
                    :color="themeStore.currentTheme.colors.primary"
                    size="20"
                  >
                    mdi-store
                  </v-icon>
                </template>
                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon 
                        :color="themeStore.currentTheme.colors.primary"
                        size="20"
                      >
                        {{ item.raw.icon }}
                      </v-icon>
                    </template>
                    <v-list-item-title>{{ item.raw.label }}</v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- URL de Información -->
            <v-col cols="12">
              <v-text-field
                v-model="form.info_url"
                label="URL de Información"
                :rules="rules.info_url"
                :disabled="assetsStore.isLoading"
                variant="outlined"
                density="comfortable"
                class="form-field"
                :color="themeStore.currentTheme.colors.primary"
                placeholder="https://ejemplo.com/info"
              >
                <template #prepend-inner>
                  <v-icon 
                    :color="themeStore.currentTheme.colors.primary"
                    size="20"
                  >
                    mdi-link
                  </v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- URL del Logo -->
            <v-col cols="12">
              <v-text-field
                v-model="form.logo_url"
                label="URL del Logo"
                :rules="rules.logo_url"
                :disabled="assetsStore.isLoading"
                variant="outlined"
                density="comfortable"
                class="form-field"
                :color="themeStore.currentTheme.colors.primary"
                placeholder="https://ejemplo.com/logo.png"
              >
                <template #prepend-inner>
                  <v-icon 
                    :color="themeStore.currentTheme.colors.primary"
                    size="20"
                  >
                    mdi-image
                  </v-icon>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          @click="closeDialog"
          :disabled="assetsStore.isLoading"
          class="mr-3"
        >
          Cancelar
        </v-btn>
        <v-btn
          :color="themeStore.currentTheme.colors.primary"
          @click="handleSubmit"
          :loading="assetsStore.isLoading"
          :disabled="!isValid"
        >
          <v-icon left>{{ isEditing ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Guardar' : 'Crear' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useAssetsStore } from '@/stores/assets';
import { useThemeStore } from '@/stores/theme';
import type { Asset, CreateAssetDto, UpdateAssetDto, AssetType, Market } from '@/types/asset';

interface Props {
  modelValue: boolean;
  asset?: Asset | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'saved', asset: Asset): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Stores
const assetsStore = useAssetsStore();
const themeStore = useThemeStore();

// Refs
const formRef = ref();
const isValid = ref(false);
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Form data
const form = ref<CreateAssetDto>({
  ticker: '',
  name: '',
  type: '',
  info_url: '',
  market: '',
  logo_url: ''
});

// Validation rules
const rules = {
  ticker: [
    (v: string) => !!v || 'El símbolo es requerido',
    (v: string) => v.length >= 1 || 'El símbolo debe tener al menos 1 carácter',
    (v: string) => v.length <= 10 || 'El símbolo no puede exceder 10 caracteres',
    (v: string) => /^[A-Z0-9.]+$/.test(v) || 'Solo letras mayúsculas, números y puntos'
  ],
  name: [
    (v: string) => !!v || 'El nombre es requerido',
    (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres',
    (v: string) => v.length <= 100 || 'El nombre no puede exceder 100 caracteres'
  ],
  type: [
    (v: string) => !!v || 'El tipo es requerido'
  ],
  info_url: [
    (v: string) => !v || /^https?:\/\/.+/.test(v) || 'Debe ser una URL válida'
  ],
  logo_url: [
    (v: string) => !v || /^https?:\/\/.+/.test(v) || 'Debe ser una URL válida'
  ]
};

// Asset types
const assetTypes: AssetType[] = [
  { value: 'crypto', label: 'Criptomoneda', icon: 'mdi-currency-btc', color: '#FFB800' },
  { value: 'stock', label: 'Acción', icon: 'mdi-chart-line', color: '#00D4AA' },
  { value: 'etf', label: 'ETF', icon: 'mdi-chart-box', color: '#4ECDC4' },
  { value: 'forex', label: 'Forex', icon: 'mdi-currency-usd', color: '#FF6B6B' },
  { value: 'commodity', label: 'Commodity', icon: 'mdi-gold', color: '#FFB800' },
  { value: 'bond', label: 'Bono', icon: 'mdi-certificate', color: '#00B8D4' }
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
const isEditing = computed(() => !!props.asset);

// Methods
const resetForm = () => {
  form.value = {
    ticker: '',
    name: '',
    type: '',
    info_url: '',
    market: '',
    logo_url: ''
  };
  nextTick(() => {
    formRef.value?.resetValidation();
  });
};

const loadAssetData = () => {
  if (props.asset) {
    form.value = {
      ticker: props.asset.ticker,
      name: props.asset.name,
      type: props.asset.type,
      info_url: props.asset.info_url || '',
      market: props.asset.market || '',
      logo_url: props.asset.logo_url || ''
    };
  } else {
    resetForm();
  }
};

const closeDialog = () => {
  showDialog.value = false;
  resetForm();
};

const handleSubmit = async () => {
  if (!isValid.value) return;

  try {
    let savedAsset: Asset;

    if (isEditing.value && props.asset) {
      const updateData: UpdateAssetDto = {
        name: form.value.name,
        type: form.value.type,
        info_url: form.value.info_url || undefined,
        market: form.value.market || undefined,
        logo_url: form.value.logo_url || undefined
      };
      savedAsset = await assetsStore.updateAsset(props.asset.ticker, updateData);
    } else {
      savedAsset = await assetsStore.createAsset(form.value);
    }

    emit('saved', savedAsset);
    closeDialog();
  } catch (error) {
    // Error ya manejado en el store
    console.error('Error en formulario:', error);
  }
};

// Watchers
watch(() => props.asset, loadAssetData, { immediate: true });
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadAssetData();
  }
});
</script>

<style scoped>
.asset-form-card {
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.form-title-text {
  color: var(--on-surface);
}

.form-field :deep(.v-field__input) {
  color: var(--on-surface);
}

.form-field :deep(.v-label),
.form-field :deep(.v-field-label) {
  color: var(--on-surface);
  opacity: 0.7;
}

.form-field :deep(.v-field__outline) {
  color: var(--card-border);
}

.form-field :deep(.v-field--focused .v-field__outline) {
  color: var(--primary);
}

.form-field :deep(.v-field--error .v-field__outline) {
  color: var(--error);
}

.form-field :deep(.v-field--error .v-label) {
  color: var(--error);
}

.form-field :deep(.v-messages) {
  color: var(--error);
}

.form-field :deep(.v-select__selection) {
  color: var(--on-surface);
}

.form-field :deep(.v-list-item-title) {
  color: var(--on-surface);
}

.form-field :deep(.v-list-item) {
  color: var(--on-surface);
}

.form-field :deep(.v-list-item:hover) {
  background: rgba(var(--primary), 0.05);
}
</style> 