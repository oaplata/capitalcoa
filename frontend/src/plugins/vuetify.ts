import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
          dark: {
      colors: {
        primary: '#00D4AA',
        secondary: '#00B8D4',
        accent: '#00F5A0',
        error: '#FF6B6B',
        info: '#4ECDC4',
        success: '#00D4AA',
        warning: '#FFB800',
        background: '#0A0E1A',
        surface: '#1A1F2E',
        'on-background': '#FFFFFF',
        'on-surface': '#FFFFFF',
      },
    },
    light: {
      colors: {
        primary: '#00D4AA',
        secondary: '#00B8D4',
        accent: '#00F5A0',
        error: '#FF6B6B',
        info: '#4ECDC4',
        success: '#00D4AA',
        warning: '#FFB800',
        background: '#F0F2F5',
        surface: '#FFFFFF',
        'on-background': '#1A1F2E',
        'on-surface': '#1A1F2E',
      },
    },
    },
  },
  defaults: {
    VCard: {
      rounded: 'lg',
      elevation: 2,
    },
    VBtn: {
      rounded: 'lg',
      elevation: 1,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VAlert: {
      variant: 'tonal',
      border: 'start',
    },
  },
}); 