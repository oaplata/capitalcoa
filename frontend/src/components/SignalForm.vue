<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="signal-form-card" elevation="8">
      <v-card-title class="form-title">
        <v-icon 
          :color="themeStore.currentTheme.colors.primary"
          class="mr-2"
        >
          {{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}
        </v-icon>
        {{ isEditing ? 'Editar Señal' : 'Nueva Señal' }}
      </v-card-title>

      <v-card-text class="form-content">
        <v-form ref="form" v-model="isValid">
          <v-row>
            <!-- Ticker del activo -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.asset_ticker"
                label="Ticker del Activo"
                :rules="[rules.required]"
                variant="outlined"
                density="compact"
                :disabled="isEditing"
                :loading="isLoadingAssets"
                :error-messages="assetError"
                @blur="validateAsset"
              >
                <template #prepend-inner>
                  <v-icon size="20">mdi-currency-usd</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Tipo de señal -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="formData.signal_type"
                label="Tipo de Señal"
                :items="signalTypeOptions"
                item-title="label"
                item-value="value"
                :rules="[rules.required]"
                variant="outlined"
                density="compact"
              >
                <template #prepend-inner>
                  <v-icon size="20">mdi-trending-up</v-icon>
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

            <!-- Precio de entrada -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="formData.entry"
                label="Precio de Entrada"
                type="number"
                step="0.000001"
                :rules="[rules.required, rules.positive, (v: number) => rules.validPrices(v, 'entry')]"
                variant="outlined"
                density="compact"
                prefix="$"
              >
                <template #prepend-inner>
                  <v-icon size="20">mdi-arrow-up</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Stop Loss -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="formData.stop_loss"
                label="Stop Loss"
                type="number"
                step="0.000001"
                :rules="[rules.required, rules.positive, (v: number) => rules.validPrices(v, 'stop_loss')]"
                variant="outlined"
                density="compact"
                prefix="$"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="error">mdi-arrow-down</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Objetivo -->
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="formData.target"
                label="Objetivo"
                type="number"
                step="0.000001"
                :rules="[rules.required, rules.positive, (v: number) => rules.validPrices(v, 'target')]"
                variant="outlined"
                density="compact"
                prefix="$"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="success">mdi-target</v-icon>
                </template>
              </v-text-field>
            </v-col>
          </v-row>

                    <!-- Información del activo -->
          <v-card
            v-if="selectedAsset"
            class="asset-info-card mt-4"
            variant="tonal"
            elevation="1"
          >
            <v-card-text class="py-3">
              <div class="asset-info">
                <div class="asset-logo">
                  <v-img 
                    :src="selectedAsset?.logo_url" 
                    alt="Asset Logo"
                    width="32"
                    height="32"
                    class="rounded"
                  />
                </div>
                <div class="asset-details">
                  <div class="asset-name">{{ selectedAsset?.name }}</div>
                  <div class="asset-type">{{ getAssetTypeLabel(selectedAsset?.type || '') }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-form>
      </v-card-text>

      <v-card-actions class="form-actions">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="closeDialog"
          :disabled="isLoading"
        >
          Cancelar
        </v-btn>
        <v-btn
          :color="themeStore.currentTheme.colors.primary"
          @click="handleSubmit"
          :loading="isLoading"
          :disabled="!isValid"
        >
          {{ isEditing ? 'Actualizar' : 'Crear' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { useAssetsStore } from '@/stores/assets';
import { useSignalsStore } from '@/stores/signals';
import { type Signal, type CreateSignalDto, SignalType } from '@/types/signal';
// Props
interface Props {
  modelValue: boolean;
  signal?: Signal | null;
}

const props = withDefaults(defineProps<Props>(), {
  signal: null
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  saved: [signal: Signal];
}>();

// Stores
const themeStore = useThemeStore();
const assetsStore = useAssetsStore();
const signalsStore = useSignalsStore();

// Refs
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const form = ref();
const isValid = ref(false);
const isLoading = ref(false);
const isLoadingAssets = ref(false);
const assetError = ref('');

// Form data
const formData = ref<CreateSignalDto>({
  asset_ticker: '',
  signal_type: SignalType.LONG,
  entry: 0,
  stop_loss: 0,
  target: 0
});

// Computed
const isEditing = computed(() => !!props.signal);

const signalTypeOptions = [
  {
    value: SignalType.LONG,
    label: 'LONG (Compra)',
    icon: 'mdi-trending-up',
    color: '#00D4AA'
  },
  {
    value: SignalType.SHORT,
    label: 'SHORT (Venta)',
    icon: 'mdi-trending-down',
    color: '#FF6B6B'
  }
];

const selectedAsset = computed(() => {
  if (!formData.value.asset_ticker) return null;
  return assetsStore.assets.find(asset => asset.ticker === formData.value.asset_ticker);
});

// Validation rules
const rules = {
  required: (value: any) => !!value || 'Este campo es requerido',
  positive: (value: number) => value > 0 || 'El valor debe ser mayor a 0',
  validPrices: (value: number, field: string) => {
    if (!formData.value.entry || !formData.value.target || !formData.value.stop_loss || !formData.value.signal_type) {
      return true; // No validar si faltan campos
    }

    const { entry, target, stop_loss, signal_type } = formData.value;

    if (signal_type === SignalType.LONG) {
      if (field === 'entry' && entry >= target) {
        return 'El precio de entrada debe ser menor al target para señales LONG';
      }
      if (field === 'entry' && entry <= stop_loss) {
        return 'El precio de entrada debe ser mayor al stop loss para señales LONG';
      }
      if (field === 'target' && entry >= target) {
        return 'El target debe ser mayor al precio de entrada para señales LONG';
      }
      if (field === 'stop_loss' && entry <= stop_loss) {
        return 'El stop loss debe ser menor al precio de entrada para señales LONG';
      }
    } else if (signal_type === SignalType.SHORT) {
      if (field === 'entry' && entry <= target) {
        return 'El precio de entrada debe ser mayor al target para señales SHORT';
      }
      if (field === 'entry' && entry >= stop_loss) {
        return 'El precio de entrada debe ser menor al stop loss para señales SHORT';
      }
      if (field === 'target' && entry <= target) {
        return 'El target debe ser menor al precio de entrada para señales SHORT';
      }
      if (field === 'stop_loss' && entry >= stop_loss) {
        return 'El stop loss debe ser mayor al precio de entrada para señales SHORT';
      }
    }

    return true;
  }
};

// Methods
const validateAsset = async () => {
  if (!formData.value.asset_ticker) {
    assetError.value = '';
    return;
  }

  const asset = assetsStore.assets.find(a => a.ticker === formData.value.asset_ticker);
  if (!asset) {
    assetError.value = 'Activo no encontrado';
  } else {
    assetError.value = '';
  }
};

const getAssetTypeLabel = (type: string) => {
  const assetTypes = {
    crypto: 'CRIPTOMONEDAS',
    stock: 'ACCIONES',
    etf: 'ETFs',
    forex: 'FOREX',
    commodity: 'COMMODITIES',
    bond: 'BONOS'
  };
  return assetTypes[type as keyof typeof assetTypes] || type.toUpperCase();
};

const closeDialog = () => {
  dialog.value = false;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    asset_ticker: '',
    signal_type: SignalType.LONG,
    entry: 0,
    stop_loss: 0,
    target: 0
  };
  assetError.value = '';
  if (form.value) {
    form.value.reset();
  }
};

const handleSubmit = async () => {
  if (!form.value?.validate()) return;

  try {
    isLoading.value = true;

    if (isEditing.value && props.signal) {
      const updatedSignal = await signalsStore.updateSignal(props.signal.id, formData.value);
      emit('saved', updatedSignal);
    } else {
      const newSignal = await signalsStore.createSignal(formData.value);
      emit('saved', newSignal);
    }

    closeDialog();
  } catch (error) {
    console.error('Error saving signal:', error);
  } finally {
    isLoading.value = false;
  }
};

// Watchers
watch(() => props.signal, (signal) => {
  if (signal) {
    formData.value = {
      asset_ticker: signal.asset_ticker,
      signal_type: signal.signal_type,
      entry: signal.entry,
      stop_loss: signal.stop_loss,
      target: signal.target
    };
  } else {
    resetForm();
  }
}, { immediate: true });

// Revalidar cuando cambie el tipo de señal
watch(() => formData.value.signal_type, () => {
  if (form.value) {
    form.value.validate();
  }
});

// Lifecycle
onMounted(async () => {
  if (!assetsStore.hasAssets) {
    await assetsStore.fetchAssets();
  }
});
</script>

<style scoped>
.signal-form-card {
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.form-title {
  background: var(--card-bg);
  border-bottom: 1px solid var(--card-border);
  padding: 20px 24px;
  font-weight: 600;
  color: var(--on-surface);
}

.form-content {
  padding: 24px;
}

.form-actions {
  padding: 16px 24px;
  background: var(--card-bg);
  border-top: 1px solid var(--card-border);
}

.asset-info-card {
  background: var(--surface-variant) !important;
  border: 1px solid var(--outline-variant);
}

.asset-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.asset-details {
  flex: 1;
}

.asset-name {
  font-weight: 600;
  color: var(--on-surface);
  font-size: 14px;
}

.asset-type {
  color: var(--on-surface-variant);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.validation-rules-card {
  background: var(--surface-variant) !important;
  border: 1px solid var(--outline-variant);
}

.validation-rules {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rules-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--on-surface);
  font-size: 14px;
  margin-bottom: 8px;
}

.rules-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rule-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--on-surface-variant);
}

/* Responsive */
@media (max-width: 600px) {
  .form-content {
    padding: 16px;
  }
  
  .form-title {
    padding: 16px 20px;
  }
  
  .form-actions {
    padding: 12px 20px;
  }
}
</style> 