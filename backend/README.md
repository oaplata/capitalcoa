# CapitalCoa Backend

Backend API para CapitalCoa - Sistema de gestión de señales de trading y backtesting.

## Tecnologías

- **NestJS** - Framework de Node.js
- **TypeScript** - Lenguaje de programación
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticación
- **BullMQ** - Colas de trabajo
- **Swagger** - Documentación de API

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Iniciar en desarrollo
npm run start:dev
```

## Variables de Entorno

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/capitalcoa?schema=public"

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

## Estructura del Proyecto

```
src/
├── config/           # Configuraciones
├── common/           # Servicios y utilidades compartidas
│   ├── guards/       # Guards de autenticación
│   ├── interceptors/ # Interceptores
│   └── services/     # Servicios compartidos
└── modules/          # Módulos de la aplicación
    ├── auth/         # Autenticación
    ├── signals/      # Gestión de señales
    ├── trades/       # Gestión de trades
    ├── backtests/    # Motor de backtesting
    └── assets/       # Gestión de activos
```

## API Endpoints

- **Documentación Swagger**: http://localhost:3000/api/docs
- **Auth**: `/api/auth/login`, `/api/auth/logout`
- **Assets**: `/api/assets`
- **Signals**: `/api/signals`
- **Trades**: `/api/trades`
- **Backtests**: `/api/backtests`

## Comandos Útiles

```bash
# Desarrollo
npm run start:dev

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio

# Linting
npm run lint

# Tests
npm run test
npm run test:e2e
```
