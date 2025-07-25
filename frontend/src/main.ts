import './assets/main.css'
import './assets/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import { useThemeStore } from './stores/theme'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

// Inicializar el tema después de montar la app
app.mount('#app')

// Inicializar el tema
const themeStore = useThemeStore()
themeStore.initializeTheme()
