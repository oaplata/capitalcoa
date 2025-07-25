import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/services/api';

export interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isUser = computed(() => user.value?.role === 'USER');

  // Actions
  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true;
      error.value = null;

      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await authApi.login(credentials);
      const { access_token } = response.data;

      // Guardar token en localStorage
      localStorage.setItem('token', access_token);
      token.value = access_token;

      // Obtener información del usuario
      await fetchUser();

      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al iniciar sesión';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout si existe
      await authApi.logout();
    } catch (err) {
      // Ignorar errores en logout
      console.warn('Error en logout:', err);
    } finally {
      // Limpiar estado local
      localStorage.removeItem('token');
      token.value = null;
      user.value = null;
      error.value = null;
    }
  };

  const fetchUser = async () => {
    try {
      if (!token.value) return;

      const response = await authApi.getProfile();
      user.value = response.data;
    } catch (err: any) {
      console.error('Error al obtener perfil:', err);
      // Si hay error al obtener perfil, hacer logout
      await logout();
    }
  };

  const initializeAuth = async () => {
    if (token.value) {
      await fetchUser();
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    user,
    token,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    isUser,
    
    // Actions
    login,
    logout,
    fetchUser,
    initializeAuth,
    clearError,
  };
}); 