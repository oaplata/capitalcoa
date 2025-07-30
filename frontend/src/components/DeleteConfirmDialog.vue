<template>
  <v-dialog
    v-model="showDialog"
    :max-width="400"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="delete-confirm-card">
      <v-card-title class="d-flex align-center">
        <v-icon 
          color="error" 
          class="mr-3"
          size="24"
        >
          mdi-alert-circle
        </v-icon>
        <span class="text-h6 confirm-title-text">
          Confirmar Eliminación
        </span>
      </v-card-title>

      <v-card-text class="pa-6">
        <p class="text-body-1 confirm-message-text">
          ¿Estás seguro de que quieres eliminar el activo
          <strong class="asset-name-text">{{ assetName }}</strong>?
        </p>
        <p class="text-caption confirm-warning-text">
          Esta acción no se puede deshacer y eliminará permanentemente el activo y todos sus datos asociados.
        </p>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          @click="closeDialog"
          :disabled="isLoading"
          class="mr-3"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="error"
          @click="handleConfirm"
          :loading="isLoading"
        >
          <v-icon left>mdi-delete</v-icon>
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: boolean;
  assetName: string;
  isLoading?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

const emit = defineEmits<Emits>();

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const closeDialog = () => {
  showDialog.value = false;
};

const handleConfirm = () => {
  emit('confirm');
};
</script>

<style scoped>
.delete-confirm-card {
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.confirm-title-text {
  color: var(--on-surface);
}

.confirm-message-text {
  color: var(--on-surface);
  margin-bottom: 16px;
}

.confirm-warning-text {
  color: var(--error);
  opacity: 0.8;
}

.asset-name-text {
  color: var(--primary);
}
</style> 