import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  'on-background': string;
  'on-surface': string;
  'gradient-start': string;
  'gradient-end': string;
  'card-bg': string;
  'card-border': string;
  'particle-filter': string;
  'particle-color': string;
}

export interface FinancialTheme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
}

export const useThemeStore = defineStore('theme', () => {
  // Temas financieros predefinidos
  const themes: FinancialTheme[] = [
    {
      id: 'crypto',
      name: 'Crypto Moderno',
      description: 'Tema moderno inspirado en criptomonedas',
      colors: {
        primary: '#00D4AA',
        secondary: '#00B8D4',
        accent: '#00F5A0',
        success: '#00D4AA',
        warning: '#FFB800',
        error: '#FF6B6B',
        info: '#4ECDC4',
        background: '#0A0E1A',
        surface: '#1A1F2E',
        'on-background': '#FFFFFF',
        'on-surface': '#FFFFFF',
        'gradient-start': '#00D4AA',
        'gradient-end': '#00B8D4',
        'card-bg': 'rgba(26, 31, 46, 0.9)',
        'card-border': 'rgba(0, 212, 170, 0.3)',
        'particle-filter': 'brightness(1.2) contrast(0.8)',
        'particle-color': '#00D4AA'
      },
    },
    {
      id: 'crypto-light',
      name: 'Crypto Claro',
      description: 'Tema crypto moderno con fondo claro',
      colors: {
        primary: '#00D4AA',
        secondary: '#00B8D4',
        accent: '#00F5A0',
        success: '#00D4AA',
        warning: '#FFB800',
        error: '#FF6B6B',
        info: '#4ECDC4',
        background: '#F0F2F5',
        surface: '#FFFFFF',
        'on-background': '#1A1F2E',
        'on-surface': '#1A1F2E',
        'gradient-start': '#00D4AA',
        'gradient-end': '#00B8D4',
        'card-bg': 'rgba(255, 255, 255, 0.95)',
        'card-border': 'rgba(0, 212, 170, 0.2)',
        'particle-filter': 'brightness(0.8) contrast(1.2)',
        'particle-color': '#000000'
      },
    }
  ];

  const currentThemeId = ref('crypto-light');

  // Computed
  const currentTheme = computed(() => 
    themes.find(theme => theme.id === currentThemeId.value) || themes[0]
  );

  const availableThemes = computed(() => themes);

  // Methods
  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      currentThemeId.value = themeId;
      localStorage.setItem('capitalcoa-theme', themeId);
      applyThemeToVuetify(theme);
    }
  };

  const applyThemeToVuetify = (theme: FinancialTheme) => {
    // Aplicar colores CSS personalizados
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  };

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('capitalcoa-theme');
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      currentThemeId.value = savedTheme;
    }
    applyThemeToVuetify(currentTheme.value);
  };

  return {
    currentTheme,
    currentThemeId,
    availableThemes,
    setTheme,
    initializeTheme,
  };
}); 