import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { assetsApi } from '@/services/api';
import type { Asset, CreateAssetDto, UpdateAssetDto, QueryAssetDto, AssetStats } from '@/types/asset';

export const useAssetsStore = defineStore('assets', () => {
  // Estado
  const assets = ref<Asset[]>([]);
  const currentAsset = ref<Asset | null>(null);
  const assetStats = ref<AssetStats | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const totalAssets = ref(0);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const filters = ref<QueryAssetDto>({});

  // Computed
  const hasAssets = computed(() => assets.value.length > 0);
  const totalPages = computed(() => Math.ceil(totalAssets.value / itemsPerPage.value));

  // Métodos
  const setError = (message: string | null) => {
    error.value = message;
  };

  const clearError = () => {
    error.value = null;
  };

  const fetchAssets = async (params?: QueryAssetDto) => {
    try {
      isLoading.value = true;
      clearError();
      
      const queryParams = {
        page: currentPage.value,
        limit: itemsPerPage.value,
        ...filters.value,
        ...params
      };

      const response = await assetsApi.getAll(queryParams);
      assets.value = response.data.data || response.data;
      totalAssets.value = response.data.total || response.data.length;
      
      // Actualizar filtros si se proporcionan
      if (params) {
        filters.value = { ...filters.value, ...params };
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los activos');
      console.error('Error fetching assets:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAsset = async (ticker: string) => {
    try {
      isLoading.value = true;
      clearError();
      
      const response = await assetsApi.getById(ticker);
      currentAsset.value = response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el activo');
      console.error('Error fetching asset:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAssetStats = async (ticker: string) => {
    try {
      clearError();
      
      const response = await assetsApi.getById(`${ticker}/stats`);
      assetStats.value = response.data;
    } catch (err: any) {
      console.error('Error fetching asset stats:', err);
      // No establecer error para stats ya que es opcional
    }
  };

  const createAsset = async (assetData: CreateAssetDto) => {
    try {
      isLoading.value = true;
      clearError();
      
      const response = await assetsApi.create(assetData);
      const newAsset = response.data;
      
      // Agregar el nuevo activo a la lista
      assets.value.unshift(newAsset);
      totalAssets.value += 1;
      
      return newAsset;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el activo');
      console.error('Error creating asset:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateAsset = async (ticker: string, assetData: UpdateAssetDto) => {
    try {
      isLoading.value = true;
      clearError();
      
      const response = await assetsApi.update(ticker, assetData);
      const updatedAsset = response.data;
      
      // Actualizar en la lista
      const index = assets.value.findIndex(asset => asset.ticker === ticker);
      if (index !== -1) {
        assets.value[index] = updatedAsset;
      }
      
      // Actualizar currentAsset si es el mismo
      if (currentAsset.value?.ticker === ticker) {
        currentAsset.value = updatedAsset;
      }
      
      return updatedAsset;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el activo');
      console.error('Error updating asset:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteAsset = async (ticker: string) => {
    try {
      isLoading.value = true;
      clearError();
      
      await assetsApi.delete(ticker);
      
      // Remover de la lista
      const index = assets.value.findIndex(asset => asset.ticker === ticker);
      if (index !== -1) {
        assets.value.splice(index, 1);
        totalAssets.value -= 1;
      }
      
      // Limpiar currentAsset si es el mismo
      if (currentAsset.value?.ticker === ticker) {
        currentAsset.value = null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar el activo');
      console.error('Error deleting asset:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const setPage = (page: number) => {
    currentPage.value = page;
    fetchAssets();
  };

  const setFilters = (newFilters: QueryAssetDto) => {
    filters.value = { ...filters.value, ...newFilters };
    currentPage.value = 1; // Reset a la primera página
    fetchAssets();
  };

  const clearFilters = () => {
    filters.value = {};
    currentPage.value = 1;
    fetchAssets();
  };

  const reset = () => {
    assets.value = [];
    currentAsset.value = null;
    assetStats.value = null;
    error.value = null;
    totalAssets.value = 0;
    currentPage.value = 1;
    filters.value = {};
  };

  return {
    // Estado
    assets,
    currentAsset,
    assetStats,
    isLoading,
    error,
    totalAssets,
    currentPage,
    itemsPerPage,
    filters,
    
    // Computed
    hasAssets,
    totalPages,
    
    // Métodos
    fetchAssets,
    fetchAsset,
    fetchAssetStats,
    createAsset,
    updateAsset,
    deleteAsset,
    setPage,
    setFilters,
    clearFilters,
    setError,
    clearError,
    reset,
  };
}); 