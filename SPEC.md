# SPEC.md

## 1. Business Purpose & Scope

### 1.1 Purpose  
“CapitalCoa” centralizes receipt of TradingView alerts, enforces pre‑trade checks, tracks executed trades and backtest results, and sends push notifications for new signals.

### 1.2 Key Features  
- **Signal ingestion** via webhook, with deduplication if an open trade already exists  
- **Trade management** (create, view, edit, close)  
- **Backtesting module** with parameter sweeps and performance metrics stored in JSONB  
- **Push notifications** for new signals, delivered via Web Push (VAPID)  
- **Audit log** capturing create/update/delete with before/after state in JSONB  

---

## 2. Technical Stack

| Layer                 | Choice                                              | Rationale                                                    |
|-----------------------|-----------------------------------------------------|--------------------------------------------------------------|
| **Database**          | PostgreSQL v14+ (with JSONB)                        | Mature RDBMS, strong schema + flexible JSONB for metrics     |
| **Backend**           | TypeScript on Node.js v18+                          | Type safety, rich ecosystem                                  |
| **Framework**         | NestJS (modular monolith)                           | DI, Guards, Pipes, easy future split to microservices        |
| **ORM**               | Prisma                                              | Type‑safe schema & migrations                                |
| **Queues/Jobs**       | BullMQ on Redis                                     | Background backtests & notification tasks                    |
| **Auth**              | JWT (`@nestjs/jwt`)                                 | Stateless, secure API tokens                                 |
| **API Docs**          | OpenAPI/Swagger (`@nestjs/swagger`)                 | Interactive contract for frontend & Cursor rule generation   |
| **Frontend**          | Vue 3 + Vite                                        | Fast HMR, Composition API, easy PWA integration              |
| **UI Library**        | Vuetify 3                                           | Built‑in theming (dark/light), Material Design components    |
| **State Mgmt**        | Pinia                                               | Lightweight, Vue‑centric                                     |
| **PWA Plugin**        | vite-plugin-pwa                                     | Zero‑config manifest + service worker                        |
| **Push**              | Web‑Push (VAPID)                                    | Standardized browser notifications                           |
| **CI/CD**             | GitHub Actions                                      | Seamless GitHub integration                                  |
| **Testing**           | Jest/Supertest, Vitest, Playwright                  | Full coverage: unit, integration, E2E                        |
| **Docs & Diagrams**   | Markdown (`.md`), OpenAPI YAML, PlantUML (`.puml`)  | Spec‑first workflow with Cursor & SpecStory support          |

---

## 3. Architecture Overview

```plantuml
@startuml
title TradeCentral Modular Monolith
package "Auth Module" {
  [AuthController] --> [AuthService]
}
package "Signals Module" {
  [WebhookController] --> [SignalsService]
}
package "Trades Module" {
  [TradesController] --> [TradesService]
}
package "Backtests Module" {
  [BacktestsController] --> [BacktestsService]
}
[AuditInterceptor] .down.> all: intercept
[WebhookController] --> RedisQueue: enqueue backtest
@enduml
