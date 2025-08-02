import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { signalsApi } from '@/services/api';
import { type Signal, type CreateSignalDto, type UpdateSignalDto, type QuerySignalDto, SignalType } from '@/types/signal';

export const useSignalsStore = defineStore('signals', () => {
  // State
  const signals = ref<Signal[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalSignals = ref(0);
  const filters = ref<QuerySignalDto>({
    page: 1,
    limit: 10
  });

  // Getters
  const hasSignals = computed(() => signals.value.length > 0);
  const longSignals = computed(() => signals.value.filter(signal => signal.signal_type === SignalType.LONG));
  const shortSignals = computed(() => signals.value.filter(signal => signal.signal_type === SignalType.SHORT));
  const recentSignals = computed(() => signals.value.slice(0, 5));

  // Actions
  const fetchSignals = async (params?: QuerySignalDto) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const queryParams = { ...filters.value, ...params };
      const response = await signalsApi.getAll(queryParams);
      
      signals.value = response.data.data;
      currentPage.value = response.data.meta.page;
      totalPages.value = response.data.meta.totalPages;
      totalSignals.value = response.data.meta.total;
      
      // Actualizar filtros
      filters.value = { ...filters.value, ...params };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar las señales';
      console.error('Error fetching signals:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchSignalById = async (id: number) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await signalsApi.getById(id);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar la señal';
      console.error('Error fetching signal:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createSignal = async (signalData: CreateSignalDto) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await signalsApi.create(signalData);
      
      fetchSignals();
      
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear la señal';
      console.error('Error creating signal:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateSignal = async (id: number, signalData: UpdateSignalDto) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await signalsApi.update(id, signalData);
      
      fetchSignals();
      
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar la señal';
      console.error('Error updating signal:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteSignal = async (id: number) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      await signalsApi.delete(id);
      
      // Remover la señal de la lista
      const index = signals.value.findIndex(signal => signal.id === id);
      if (index !== -1) {
        signals.value.splice(index, 1);
        totalSignals.value--;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar la señal';
      console.error('Error deleting signal:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const setPage = (page: number) => {
    currentPage.value = page;
    filters.value.page = page;
    fetchSignals();
  };

  const setFilters = (newFilters: Partial<QuerySignalDto>) => {
    filters.value = { ...filters.value, ...newFilters, page: 1 };
    currentPage.value = 1;
    fetchSignals();
  };

  const clearFilters = () => {
    filters.value = { page: 1, limit: 10 };
    currentPage.value = 1;
    fetchSignals();
  };

  const clearError = () => {
    error.value = null;
  };

  const reset = () => {
    signals.value = [];
    isLoading.value = false;
    error.value = null;
    currentPage.value = 1;
    totalPages.value = 1;
    totalSignals.value = 0;
    filters.value = { page: 1, limit: 10 };
  };

  return {
    // State
    signals,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalSignals,
    filters,
    
    // Getters
    hasSignals,
    longSignals,
    shortSignals,
    recentSignals,
    
    // Actions
    fetchSignals,
    fetchSignalById,
    createSignal,
    updateSignal,
    deleteSignal,
    setPage,
    setFilters,
    clearFilters,
    clearError,
    reset
  };
}); 