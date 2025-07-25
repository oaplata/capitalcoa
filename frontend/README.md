# CapitalCoa Frontend

Frontend de la aplicación CapitalCoa construido con Vue 3, Vite, Vuetify 3 y TypeScript.

## 🚀 Tecnologías

- **Vue 3** - Framework de JavaScript progresivo
- **Vite** - Herramienta de construcción rápida
- **Vuetify 3** - Framework de componentes Material Design
- **TypeScript** - Superset de JavaScript tipado
- **Pinia** - Store de estado para Vue
- **Vue Router** - Router oficial de Vue
- **Axios** - Cliente HTTP
- **@vueuse/core** - Utilidades de composición

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Backend de CapitalCoa ejecutándose en `http://localhost:3000`

## 🛠️ Instalación

1. **Clonar el repositorio** (si no lo has hecho ya):
```bash
git clone <repository-url>
cd capitalcoa/frontend
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp env.example .env.local
```

Edita `.env.local` y configura:
```env
VITE_API_URL=http://localhost:3000
VITE_APP_TITLE=CapitalCoa
VITE_APP_VERSION=1.0.0
```

## 🚀 Desarrollo

### Iniciar servidor de desarrollo
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Credenciales de prueba
- **Usuario**: `admin@capitalcoa.com`
- **Contraseña**: `sumian01150202`

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run type-check` - Verifica tipos TypeScript
- `npm run lint` - Ejecuta ESLint
- `npm run format` - Formatea código con Prettier

## 🏗️ Estructura del Proyecto

```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes reutilizables
├── plugins/         # Plugins (Vuetify, etc.)
├── router/          # Configuración de rutas
├── services/        # Servicios de API
├── stores/          # Stores de Pinia
└── views/           # Vistas de la aplicación
```

## 🔐 Autenticación

El sistema utiliza JWT para la autenticación:

- **Login**: `/login` - Formulario de autenticación
- **Dashboard**: `/dashboard` - Panel principal (requiere autenticación)
- **Logout**: Cierra sesión y redirige a login

### Protección de Rutas

- `requiresAuth`: Requiere autenticación
- `requiresAdmin`: Requiere rol de administrador
- `requiresGuest`: Solo para usuarios no autenticados

## 🎨 Temas y Estilos

### Tema Oscuro (por defecto)
- Colores primarios: Azul Material Design
- Fondo: Gris oscuro
- Componentes con elevación y bordes redondeados

### Personalización
Los temas se configuran en `src/plugins/vuetify.ts`

## 📱 Responsive Design

La aplicación es completamente responsive y se adapta a:
- **Desktop**: Layout completo con navegación lateral
- **Tablet**: Layout adaptativo
- **Mobile**: Layout optimizado para pantallas pequeñas

## 🔧 Configuración de Desarrollo

### Variables de Entorno
- `VITE_API_URL`: URL del backend API
- `VITE_APP_TITLE`: Título de la aplicación
- `VITE_APP_VERSION`: Versión de la aplicación

### TypeScript
- Configuración en `tsconfig.app.json`
- Alias `@/*` para `src/*`

## 🧪 Pruebas

Para ejecutar las pruebas (cuando estén implementadas):
```bash
npm run test
```

## 📦 Build de Producción

```bash
npm run build
```

Los archivos se generan en `dist/`

## 🚀 Despliegue

1. Construir la aplicación:
```bash
npm run build
```

2. Servir los archivos estáticos desde `dist/`

### Docker (opcional)
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](../LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación del backend
2. Verifica que el backend esté ejecutándose
3. Revisa los logs del navegador
4. Abre un issue en el repositorio

## 🔄 Estado del Proyecto

### ✅ Implementado
- [x] Configuración de Vue 3 + Vite
- [x] Integración con Vuetify 3
- [x] Sistema de autenticación
- [x] Store de estado con Pinia
- [x] Router con protección de rutas
- [x] Servicios de API
- [x] Vista de login
- [x] Dashboard básico
- [x] Vistas placeholder

### 🚧 En Desarrollo
- [ ] Gestión de activos
- [ ] Gestión de señales
- [ ] Gestión de trades
- [ ] Gestión de backtests
- [ ] Gestión de usuarios
- [ ] Notificaciones push
- [ ] Comunicación en tiempo real

### 📋 Pendiente
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] PWA
- [ ] Optimizaciones de rendimiento
- [ ] Internacionalización
