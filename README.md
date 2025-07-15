# CapitalCoa

Sistema centralizado de gestión de señales de trading, backtesting y notificaciones push.

## 🚀 Características

- **Ingesta de Señales**: Webhooks de TradingView con deduplicación
- **Gestión de Trades**: Crear, ver, editar y cerrar operaciones
- **Backtesting**: Motor con barridos de parámetros y métricas JSONB
- **Notificaciones Push**: Web Push (VAPID) para nuevas señales
- **Auditoría**: Log completo de cambios con estado antes/después
- **PWA**: Aplicación web progresiva instalable

## 🏗️ Arquitectura

### Backend (NestJS)
- **Framework**: NestJS + TypeScript
- **Base de Datos**: PostgreSQL v14+ con JSONB
- **ORM**: Prisma
- **Colas**: BullMQ + Redis
- **Autenticación**: JWT
- **Documentación**: Swagger/OpenAPI

### Frontend (Vue 3)
- **Framework**: Vue 3 + Vite
- **UI**: Vuetify 3
- **Estado**: Pinia
- **PWA**: vite-plugin-pwa

## 📋 Prerrequisitos

- [Docker](https://www.docker.com/) y Docker Compose
- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd capitalcoa
```

### 2. Iniciar servicios de base de datos
```bash
# Usar el script de Docker
./scripts/docker.sh start

# O manualmente
docker-compose up -d
```

### 3. Configurar el backend
```bash
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Iniciar en desarrollo
npm run start:dev
```

### 4. Verificar instalación
- **Backend API**: http://localhost:3000
- **Documentación Swagger**: http://localhost:3000/api/docs
- **pgAdmin**: http://localhost:5050 (admin@capitalcoa.com / admin123)

## 🐳 Gestión de Docker

Usa el script incluido para gestionar los servicios:

```bash
# Iniciar servicios
./scripts/docker.sh start

# Ver estado
./scripts/docker.sh status

# Ver logs
./scripts/docker.sh logs postgres
./scripts/docker.sh logs redis

# Parar servicios
./scripts/docker.sh stop

# Reiniciar servicios
./scripts/docker.sh restart

# Limpiar todo (¡cuidado!)
./scripts/docker.sh cleanup
```

## 📊 Servicios Disponibles

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| PostgreSQL | 5432 | Base de datos principal |
| Redis | 6379 | Cache y colas |
| pgAdmin | 5050 | Gestión de base de datos |
| Backend API | 3000 | API REST de CapitalCoa |

## 🔧 Variables de Entorno

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://capitalcoa_user:capitalcoa_password@localhost:5432/capitalcoa?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# Redis
REDIS_URL="redis://localhost:6379"

# VAPID Keys (para Web Push)
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"

# App
PORT=3000
NODE_ENV=development
```

## 📁 Estructura del Proyecto

```
capitalcoa/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── modules/         # Módulos de la aplicación
│   │   ├── common/          # Servicios compartidos
│   │   └── config/          # Configuraciones
│   ├── prisma/              # Esquema de base de datos
│   └── package.json
├── docker-compose.yml       # Servicios Docker
├── scripts/                 # Scripts de utilidad
└── README.md
```

## 🚀 Comandos Útiles

### Backend
```bash
cd backend

# Desarrollo
npm run start:dev

# Generar cliente Prisma
npm run prisma:generate

# Migraciones
npm run prisma:migrate

# Prisma Studio
npm run prisma:studio

# Tests
npm run test
npm run test:e2e
```

### Docker
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ejecutar comandos en contenedores
docker-compose exec postgres psql -U capitalcoa_user -d capitalcoa
docker-compose exec redis redis-cli
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la [documentación](docs/)
2. Abre un [issue](issues/)
3. Contacta al equipo de desarrollo

---

**CapitalCoa** - Centralizando el trading inteligente 🚀 