<template>
  <div class="login-page pt-12">
    <!-- Partículas de fondo -->
    <div class="financial-particles">
      <div class="particle" v-for="i in 9" :key="i"></div>
    </div>

    <!-- Contenedor principal -->
    <v-container fluid class="fill-height login-container">
      <v-row justify="center" align="center">
        <v-col cols="12" sm="8" md="6" lg="4" xl="3">
          <!-- Card de login con efectos -->
          <v-card 
            class="login-card fade-in-up hover-lift" 
            elevation="12"
            :style="cardStyle"
          >
            <!-- Header con animaciones -->
            <v-card-title class="text-center pt-8 pb-6">
              <div class="d-flex flex-column align-center">
                <!-- Icono animado -->
                <div class="logo-container bounce-in">
                  <v-icon 
                    size="56" 
                    :color="themeStore.currentTheme.colors.primary"
                    class="logo-icon"
                  >
                    mdi-finance
                  </v-icon>
                </div>
                
                <!-- Título con efecto de brillo -->
                <h1 class="text-h3 font-weight-bold mt-4 money-particles title-login">
                  CapitalCoa
                </h1>
                
                <!-- Subtítulo -->
                <p class="text-body-1 mt-3 slide-in-left login-subtitle">
                  Sistema de Trading Centralizado
                </p>
              </div>
            </v-card-title>

            <!-- Formulario de login -->
            <v-card-text class="px-8 pb-8">
              <v-form @submit.prevent="handleLogin" ref="loginForm" class="slide-in-right">
                <!-- Display de errores mejorado -->
                <ErrorDisplay
                  :error="authStore.error || undefined"
                  type="error"
                  title="Error de Autenticación"
                  :shake="showErrorShake"
                  @close="clearError"
                  :actions="errorActions"
                />

                <!-- Campo de usuario -->
                <v-text-field
                  v-model="form.username"
                  label="Usuario"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  :rules="[rules.required, rules.email]"
                  :disabled="authStore.isLoading"
                  autocomplete="username"
                  required
                  class="mb-4"
                  :color="themeStore.currentTheme.colors.primary"
                  @focus="onFieldFocus"
                  @blur="onFieldBlur"
                />

                <!-- Campo de contraseña -->
                <v-text-field
                  v-model="form.password"
                  label="Contraseña"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="togglePassword"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  :rules="[rules.required, rules.minLength]"
                  :disabled="authStore.isLoading"
                  autocomplete="current-password"
                  required
                  class="mb-4"
                  :color="themeStore.currentTheme.colors.primary"
                  @focus="onFieldFocus"
                  @blur="onFieldBlur"
                />

                <!-- Checkbox recordar sesión -->
                <v-checkbox
                  v-model="rememberMe"
                  label="Recordar sesión"
                  :color="themeStore.currentTheme.colors.primary"
                  hide-details
                  class="mb-6"
                />

                <!-- Botón de login con efectos -->
                <v-btn
                  type="submit"
                  :color="themeStore.currentTheme.colors.primary"
                  size="x-large"
                  block
                  class="login-btn elastic-in"
                  :loading="authStore.isLoading"
                  :disabled="authStore.isLoading"
                  elevation="4"
                  @click="onLoginClick"
                >
                  <template #prepend>
                    <v-icon size="20">mdi-login</v-icon>
                  </template>
                  
                  <span v-if="!authStore.isLoading">
                    Iniciar Sesión
                  </span>
                  <span v-else>
                    Iniciando sesión...
                  </span>
                  
                  <template #append>
                    <v-icon v-if="!authStore.isLoading" size="20">mdi-arrow-right</v-icon>
                  </template>
                </v-btn>

                <!-- Indicador de progreso -->
                <v-progress-linear
                  v-if="authStore.isLoading"
                  :color="themeStore.currentTheme.colors.primary"
                  indeterminate
                  class="mt-4"
                />
              </v-form>
            </v-card-text>
          </v-card>

          <!-- Información adicional -->
          <div class="text-center mt-6 fade-in-up">
            <p class="text-caption login-footer-text">
              © {{ new Date().getFullYear() }} CapitalCoa. Todos los derechos reservados.
            </p>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Loading overlay -->
    <LoadingSpinner
      v-if="authStore.isLoading"
      text="Autenticando..."
      icon="mdi-shield-check"
      overlay
      size="large"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ErrorDisplay from '@/components/ErrorDisplay.vue';

// Composables
const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

// Refs
const loginForm = ref();
const showPassword = ref(false);
const rememberMe = ref(false);
const showErrorShake = ref(false);

// Form data
const form = reactive({
  username: '',
  password: '',
});

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Este campo es requerido',
  email: (value: string) => {
    if (!value) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Formato de email inválido';
  },
  minLength: (value: string) => value.length >= 6 || 'Mínimo 6 caracteres',
};

// Computed
const cardStyle = computed(() => ({
  background: themeStore.currentTheme.colors['card-bg'],
  border: `1px solid ${themeStore.currentTheme.colors['card-border']}`,
  backdropFilter: 'blur(20px)',
}));

const errorActions = computed(() => []);

// Methods
const handleLogin = async () => {
  const { valid } = await loginForm.value.validate();
  
  if (!valid) {
    showErrorShake.value = true;
    authStore.error = 'Por favor, ingrese un usuario y contraseña válidos';
    setTimeout(() => {
      showErrorShake.value = false;
    }, 500);
    return;
  }

  try {
    await authStore.login({
      username: form.username,
      password: form.password,
    });

    // Redirigir al dashboard con animación
    await router.push('/dashboard');
  } catch (error) {
    showErrorShake.value = true;
    setTimeout(() => {
      showErrorShake.value = false;
    }, 500);
  }
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const clearError = () => {
  authStore.clearError();
};

const onLoginClick = () => {
  // Efecto de click
  const btn = document.querySelector('.login-btn');
  if (btn) {
    btn.classList.add('ripple');
    setTimeout(() => {
      btn.classList.remove('ripple');
    }, 600);
  }
};

const onFieldFocus = (event: Event) => {
  const target = event.target as HTMLElement;
  target.closest('.v-text-field')?.classList.add('field-focused');
};

const onFieldBlur = (event: Event) => {
  const target = event.target as HTMLElement;
  target.closest('.v-text-field')?.classList.remove('field-focused');
};

// Lifecycle
onMounted(async () => {
  // Si ya está autenticado, redirigir al dashboard
  if (authStore.isAuthenticated) {
    await router.push('/dashboard');
  }
  
  // Inicializar tema
  themeStore.initializeTheme();
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--card-bg);
  position: relative;
  overflow: hidden;
}

.login-container {
  position: relative;
  z-index: 2;
}

.login-card {
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.login-card:hover::before {
  opacity: 1;
}

.logo-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  transition: all 0.3s ease;
}

.logo-icon:hover {
  transform: scale(1.1) rotate(5deg);
}

.login-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.help-btn {
  transition: all 0.3s ease;
}

.help-btn:hover {
  transform: translateY(-2px);
}

.help-dialog {
  border-radius: 16px;
}

.help-content {
  line-height: 1.6;
}

/* Efectos de campo enfocado */
.field-focused {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

/* Animaciones personalizadas */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes elasticIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .login-card {
    margin: 16px;
    border-radius: 16px;
  }
  
  .logo-icon {
    font-size: 48px !important;
  }
  
  h1.text-h3 {
    font-size: 2rem !important;
  }
}

/* Efectos de partículas de dinero adaptativas */
.money-particles::before,
.money-particles::after {
  content: '💰';
  position: absolute;
  font-size: 16px;
  opacity: 0;
  animation: moneyFloat 4s ease-in-out infinite;
  filter: var(--particle-filter);
}

.money-particles::before {
  left: -20px;
  animation-delay: 0s;
}

.money-particles::after {
  right: -20px;
  animation-delay: 2s;
}

@keyframes moneyFloat {
  0%, 100% {
    opacity: 0;
    transform: translateY(0) rotate(0deg);
  }
  25% {
    opacity: 1;
    transform: translateY(-15px) rotate(90deg);
  }
  50% {
    opacity: 1;
    transform: translateY(-30px) rotate(180deg);
  }
  75% {
    opacity: 1;
    transform: translateY(-15px) rotate(270deg);
  }
}

/* Efectos de neón para elementos importantes */
.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px var(--primary, 0.5);
  }
  50% {
    box-shadow: 0 0 20px var(--primary, 0.8);
  }
}

/* Efectos de ondulación */
.ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.ripple:active::after {
  width: 300px;
  height: 300px;
}

.title-login {
  color: var(--primary);
}

/* Estilos de texto adaptativos para ambos temas */
.login-subtitle {
  color: var(--on-surface);
  opacity: 0.8;
}

.login-footer-text {
  color: var(--on-surface);
  opacity: 0.6;
}

/* Asegurar que los campos de texto tengan el color correcto */
.login-card :deep(.v-text-field .v-field__input) {
  color: var(--on-surface);
}

/* Label adaptativo para ambos temas */
.login-card :deep(.v-label),
.login-card :deep(.v-field-label),
.login-card :deep(.v-text-field .v-field__label) {
  color: var(--on-surface);
  opacity: 0.7;
}

.login-card :deep(.v-text-field .v-field__outline) {
  color: var(--on-surface);
  opacity: 0.3;
}

.login-card :deep(.v-text-field.v-field--focused .v-field__outline) {
  color: var(--primary);
  opacity: 1;
}

/* Checkbox y sus labels */
.login-card :deep(.v-checkbox .v-label) {
  color: var(--on-surface);
}

/* Mensajes de error de validación */
.login-card :deep(.v-messages__message) {
  color: var(--error);
}

/* Iconos en los campos */
.login-card :deep(.v-field__prepend-inner .v-icon),
.login-card :deep(.v-field__append-inner .v-icon) {
  color: var(--on-surface);
  opacity: 0.7;
}

.login-card :deep(.v-field--focused .v-field__prepend-inner .v-icon),
.login-card :deep(.v-field--focused .v-field__append-inner .v-icon) {
  color: var(--primary);
  opacity: 1;
}

/* Asegurar que el ErrorDisplay tenga los colores correctos */
.login-card :deep(.error-alert) {
  background: var(--card-bg);
  border-color: var(--error);
}

.login-card :deep(.error-alert .v-alert__content) {
  color: var(--on-surface);
}

.login-card :deep(.error-alert .v-alert__title) {
  color: var(--on-surface);
}

.login-card :deep(.error-alert .v-alert__text) {
  color: var(--on-surface);
  opacity: 0.9;
}

/* Asegurar que el LoadingSpinner tenga los colores correctos */
.login-page :deep(.loading-container.overlay) {
  background: rgba(0, 0, 0, 0.8);
}

.login-page :deep(.loading-text) {
  color: var(--on-surface);
}

.login-page :deep(.spinner-icon) {
  background: var(--surface);
  color: var(--primary);
}

/* Placeholder adaptativo para ambos temas */
.login-card :deep(.v-field__input::placeholder) {
  color: var(--on-surface);
  opacity: 0.5;
}
</style> 