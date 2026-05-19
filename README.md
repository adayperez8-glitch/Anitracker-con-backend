# AniTracker
 
Red social para amantes del anime. Busca series, gestiona tu lista de reproducción, conecta con amigos y chatea sobre los animes que estáis viendo.
 
**Demo en producción:** [anitracker-xi.vercel.app](https://anitracker-xi.vercel.app)
 
---
 
## Tabla de contenidos
 
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Usuarios de prueba](#usuarios-de-prueba)
- [API — Endpoints](#api--endpoints)
- [Schema de base de datos](#schema-de-base-de-datos)
- [Tests](#tests)
- [Despliegue](#despliegue)
- [Uso de inteligencia artificial](#uso-de-inteligencia-artificial)
- [Tiempo invertido](#tiempo-invertido)
---
 
## Stack tecnológico
 
| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite, React Router v6, Context API, CSS Modules |
| Backend | Node.js + Express (ES Modules) |
| ORM | Prisma v6 |
| Base de datos | PostgreSQL |
| Autenticación | JWT + bcryptjs |
| Validación | Zod |
| Testing | Vitest + Supertest (backend) · Vitest + React Testing Library (frontend) |
| API externa | Jikan API v4 (MyAnimeList) |
| Integración | Webhook HTTP (registro de usuario y aceptación de amistad) |
| Deploy | Railway (backend + BD) · Vercel (frontend) |
 
---
 
## Arquitectura
 
```
anitracker-con-backend/        ← monorepo raíz
├── frontend/                  ← React + Vite
│   ├── src/
│   │   ├── config/api.js      ← URL base del backend (VITE_API_URL)
│   │   ├── hooks/useApi.js    ← fetch genérico con Bearer token automático
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      ← login, register, logout, sesión persistente
│   │   │   ├── AnimeContext.jsx     ← búsqueda y detalle via Jikan API
│   │   │   └── WatchlistContext.jsx ← lista personal via API propia
│   │   ├── pages/             ← 11 páginas (9 protegidas, 2 públicas)
│   │   └── components/        ← Navbar, AnimeCard, SkeletonCard, Grid, ErrorBoundary
│   └── package.json
├── backend/                   ← Express API
│   ├── routes/                ← 6 routers
│   ├── controllers/           ← lógica de negocio
│   ├── middleware/            ← auth.js, validate.js, errorHandler.js
│   ├── schemas/               ← validación Zod por recurso
│   ├── lib/                   ← prisma.js (singleton), webhook.js
│   ├── prisma/
│   │   ├── schema.prisma      ← 5 modelos con relaciones
│   │   └── seed.js            ← datos de prueba
│   └── package.json
├── package.json               ← scripts raíz con concurrently
├── vercel.json                ← config deploy frontend
└── railway.json               ← config deploy backend
```
 
**¿Por qué monorepo?**
Un solo `npm install` y `npm run dev` arrancan frontend y backend en paralelo con `concurrently`. También cumple con la estructura de repositorios recomendada del proyecto.
 
**Comunicación frontend → backend en producción:**
Vercel reescribe todas las peticiones `/api/*` hacia Railway. El frontend usa rutas relativas (`/api/...`), lo que elimina cualquier problema de CORS con el header `Authorization`.
 
---
 
## Instalación local
 
### Requisitos previos
 
- Node.js 18+
- PostgreSQL corriendo localmente (o una URL de PostgreSQL en la nube)
### Pasos
 
```bash
# 1. Clonar y entrar al proyecto
git clone <url-del-repo>
cd anitracker-con-backend
 
# 2. Instalar dependencias (instala frontend y backend automáticamente)
npm install
 
# 3. Configurar variables de entorno
cp backend/.env.example backend/.env
# Edita backend/.env con tu DATABASE_URL y JWT_SECRET
 
# 4. Crear las tablas en la base de datos
npm run db:migrate
 
# 5. Cargar datos de prueba
npm run db:seed
 
# 6. Arrancar todo
npm run dev
```
 
Abre `http://localhost:5173` en el navegador.
 
### Scripts disponibles
 
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Arranca backend (puerto 3000) y frontend (puerto 5173) en paralelo |
| `npm run dev:backend` | Solo el backend |
| `npm run dev:frontend` | Solo el frontend |
| `npm test` | Tests del backend |
| `npm run db:migrate` | Ejecuta migraciones de Prisma |
| `npm run db:seed` | Carga datos de prueba |
 
---
 
## Variables de entorno
 
### Backend (`backend/.env`)
 
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/anitracker"
JWT_SECRET="una-clave-secreta-larga-y-aleatoria"
PORT=3000
WEBHOOK_URL=""   # opcional — URL del webhook externo (n8n, etc.)
```
 
### Frontend (`frontend/.env`)
 
En desarrollo no necesita ninguna variable: `useApi.js` llama a `/api/*` relativo y Vite lo proxea a `http://localhost:3000`. En producción (Vercel), el `vercel.json` reescribe `/api/*` directamente a Railway.
 
---
 
## Usuarios de prueba
 
Creados por el seed (`npm run db:seed`):
 
| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@********.com | ******** | ADMIN |
| aday@********.com | ******** | USER |
| jarko@********.com | ********| USER |
 
---
 
## API — Endpoints
 
Base URL local: `http://localhost:3000`
Base URL producción: `https://anitracker-con-backend-production.up.railway.app`
 
> 🔒 Requiere `Authorization: Bearer <token>` · 👑 Requiere rol `ADMIN`
 
### Auth — `/api/auth`
 
| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | `{ email, password, name }` |
| POST | `/api/auth/login` | Iniciar sesión | `{ email, password }` |
 
**Respuesta:**
```json
{
  "token": "eyJ...",
  "usuario": { "id": 1, "email": "...", "name": "...", "role": "USER" }
}
```
 
### Users — `/api/users`
 
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/users` | Listar usuarios (`?power=cursed&q=nombre`) | 🔒 |
| GET | `/api/users/me` | Perfil propio completo | 🔒 |
| PATCH | `/api/users/me` | Editar nombre, poder, bio o contraseña | 🔒 |
| GET | `/api/users/:id` | Perfil público de un usuario | — |
| DELETE | `/api/users/:id` | Eliminar usuario | 🔒 👑 |
 
### Anime (watchlist) — `/api/anime`
 
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/anime` | Ver mi lista | 🔒 |
| POST | `/api/anime` | Añadir anime a mi lista | 🔒 |
| PATCH | `/api/anime/:id` | Actualizar estado o episodio | 🔒 |
| DELETE | `/api/anime/:id` | Quitar anime de mi lista | 🔒 |
 
Estados válidos: `WATCHING` · `COMPLETED` · `PAUSED` · `PENDING`
 
### Friends — `/api/friends`
 
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/friends` | Listar amigos aceptados | 🔒 |
| GET | `/api/friends/requests` | Ver solicitudes pendientes | 🔒 |
| POST | `/api/friends` | Enviar solicitud (`{ receiverId }` o `{ receiverName }`) | 🔒 |
| PATCH | `/api/friends/:id` | Aceptar o rechazar solicitud | 🔒 |
| DELETE | `/api/friends/:id` | Eliminar amistad o cancelar solicitud | 🔒 |
 
### Messages — `/api/messages`
 
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/messages` | Chat general | 🔒 |
| GET | `/api/messages?receiverId=2` | Chat privado con el usuario 2 | 🔒 |
| POST | `/api/messages` | Enviar mensaje (público o privado) | 🔒 |
 
`receiverId: null` → chat general · `receiverId: 2` → privado (requiere amistad)
 
### Recommendations — `/api/recommendations`
 
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/recommendations/:userId` | Ver recomendaciones de un usuario | — |
| POST | `/api/recommendations` | Añadir recomendación a mi perfil | 🔒 |
| DELETE | `/api/recommendations/:id` | Eliminar mi recomendación | 🔒 |
 
### Health
 
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servidor |
 
---
 
## Schema de base de datos

```
User
  id · email (UNIQUE) · password · name · power · bio · role: USER | ADMIN

UserAnime
  id · userId (FK→User) · animeId · animeTitle · animeImage
  status: WATCHING | COMPLETED | PAUSED | PENDING
  currentEpisode · totalEpisodes · isPublic
  UNIQUE (userId, animeId)

Friendship
  id · requesterId (FK→User) · receiverId (FK→User)
  status: PENDING | ACCEPTED | REJECTED · canSeeStatus
  UNIQUE (requesterId, receiverId)

Message
  id · senderId (FK→User) · receiverId (FK→User, nullable) · content

Recommendation
  id · userId (FK→User) · animeTitle · animeImage · description
  UNIQUE (userId, animeTitle)
```

Todas las relaciones tienen `ON DELETE CASCADE`.

### Diagrama Entidad-Relación

```mermaid
erDiagram
    User {
        int id PK
        string email UK
        string password
        string name
        string power
        string bio
        enum role
        datetime createdAt
    }

    UserAnime {
        int id PK
        int userId FK
        int animeId
        string animeTitle
        string animeImage
        enum status
        int currentEpisode
        int totalEpisodes
        boolean isPublic
    }

    Friendship {
        int id PK
        int requesterId FK
        int receiverId FK
        enum status
        boolean canSeeStatus
        datetime createdAt
    }

    Message {
        int id PK
        int senderId FK
        int receiverId FK "nullable"
        string content
        datetime createdAt
    }

    Recommendation {
        int id PK
        int userId FK
        string animeTitle
        string animeImage
        string description
        datetime createdAt
    }

    User ||--o{ UserAnime : animeList
    User ||--o{ Friendship : "sentRequests (requester)"
    User ||--o{ Friendship : "receivedRequests (receiver)"
    User ||--o{ Message : "sentMessages (sender)"
    User ||--o{ Message : "receivedMessages (receiver)"
    User ||--o{ Recommendation : recommendations
```

**Notación:** `||--o{` = uno a muchos. Todas las FK tienen `ON DELETE CASCADE`.
 
---

## Roles y permisos

El sistema define **dos roles** mediante el enum `Role` en Prisma:

| Rol | Descripción |
|-----|-------------|
| `USER` | Usuario estándar — puede gestionar su perfil, lista de anime, amigos, mensajes y recomendaciones |
| `ADMIN` | Administrador — tiene todos los permisos de `USER` más la capacidad de eliminar cualquier usuario |

### Matriz de permisos

| Recurso | Método | Ruta | USER | ADMIN |
|---------|--------|------|:----:|:-----:|
| **Health** | GET | `/api/health` | ✅ | ✅ |
| **Auth** | POST | `/api/auth/register` | ✅ | ✅ |
| | POST | `/api/auth/login` | ✅ | ✅ |
| **Users** | GET | `/api/users` | 🔒 | 🔒 |
| | GET | `/api/users/me` | 🔒 | 🔒 |
| | PATCH | `/api/users/me` | 🔒 | 🔒 |
| | GET | `/api/users/:id` | ✅ | ✅ |
| | DELETE | `/api/users/:id` | ❌ | 🔒 👑 |
| **Anime** | GET | `/api/anime` | 🔒 | 🔒 |
| | POST | `/api/anime` | 🔒 | 🔒 |
| | PATCH | `/api/anime/:id` | 🔒 | 🔒 |
| | DELETE | `/api/anime/:id` | 🔒 | 🔒 |
| **Friends** | GET | `/api/friends` | 🔒 | 🔒 |
| | GET | `/api/friends/requests` | 🔒 | 🔒 |
| | POST | `/api/friends` | 🔒 | 🔒 |
| | PATCH | `/api/friends/:id` | 🔒 | 🔒 |
| | DELETE | `/api/friends/:id` | 🔒 | 🔒 |
| **Messages** | GET | `/api/messages` | 🔒 | 🔒 |
| | POST | `/api/messages` | 🔒 | 🔒 |
| **Recommendations** | GET | `/api/recommendations/:userId` | ✅ | ✅ |
| | POST | `/api/recommendations` | 🔒 | 🔒 |
| | DELETE | `/api/recommendations/:id` | 🔒 | 🔒 |

**Leyenda:**
- ✅ — Público, no requiere autenticación
- 🔒 — Requiere `Authorization: Bearer <token>` (cualquier rol)
- 🔒 👑 — Requiere token **y** rol `ADMIN`
- ❌ — Sin acceso


 
```bash
# Backend (Vitest + Supertest)
cd backend && npm test
 
# Frontend (Vitest + React Testing Library)
cd frontend && npm test
```
 
**Backend — 30 tests en 6 suites:**
- Auth: registro, validaciones de email/contraseña, duplicados, login correcto/incorrecto
- Anime, Friends, Messages, Recommendations: CRUD completo
- Webhook: verifica que los eventos `user_registered` y `friend_accepted` se disparan correctamente
**Frontend — 7 tests:**
- WatchlistContext: estado inicial, añadir/quitar anime, prevención de duplicados
- AnimeContext: búsqueda exitosa, manejo de resultados vacíos
- AnimeCard: renderizado de título, puntuación y episodios
---
 
## Despliegue
 
| Servicio | URL |
|---------|-----|
| Frontend (Vercel) | https://anitracker-xi.vercel.app |
| Backend (Railway) | https://anitracker-con-backend-production.up.railway.app |
| Base de datos | PostgreSQL en Railway |
 
```
Usuario → Vercel (React SPA)
             │
             ├── /api/* → Railway (Express API) → PostgreSQL
             └── /*     → index.html (SPA fallback)
```
 
---
 
## Uso de inteligencia artificial
 
Este proyecto se desarrolló con el apoyo de herramientas de IA como asistentes de codificación. A continuación se detalla qué aportó la IA y qué fue trabajo propio.
 
### Lo que hice yo
 
- Definición de la arquitectura del proyecto y estructura del monorepo
- Creación y configuración manual de las carpetas `frontend/` y `backend/`
- Toma de decisiones sobre qué funcionalidades implementar y en qué orden
- Decisiones de diseño y estilo visual de la interfaz
- Despliegue del frontend en **Vercel** y del backend + base de datos en **Railway**, incluyendo el diagnóstico y resolución del problema con el header `Authorization` en producción
- Corrección de errores y bugs a lo largo del desarrollo
- Revisión, comprensión y validación de todo el código generado
### Cómo usé la IA
 
| Herramienta | Uso principal |
|-------------|---------------|
| **Claude** (claude.ai) | Generación de bloques de código, estructura de endpoints, esquemas Zod, configuración de Prisma y resolución de dudas de arquitectura |
| **GitHub Copilot** | Autocompletado en el editor durante el desarrollo, especialmente en controladores y tests |
| **Gemini** | Consultas puntuales para resolver problemas específicos y contrastar soluciones |
 
### Criterios de uso
 
La IA se utilizó como herramienta de apoyo, no como sustituto del criterio propio. Cada fragmento de código generado fue revisado, adaptado al contexto del proyecto y, cuando fue necesario, corregido manualmente. Las decisiones de diseño, la arquitectura general y el proceso de despliegue fueron responsabilidad directa del desarrollador.
 
---
 
## Tiempo invertido
 
**~25 horas totales** distribuidas en 5 días (4–5 horas/día).
 
| Día | Tareas principales |
|-----|--------------------|
| **Día 1** | Definición de arquitectura, setup del monorepo, autenticación JWT completa, schema Prisma, estructura base de React con Router |
| **Día 2** | 20 endpoints CRUD (users, anime, friends, messages, recommendations), middleware, validaciones con Zod, seed de base de datos, suite de tests |
| **Día 3** | 5 nuevas páginas (Users, Profile, MyProfile, Friends, Chat), migración de la watchlist de localStorage a PostgreSQL, actualización del Navbar |
| **Día 4** | Integración del webhook externo, diseño responsive, gestión de estados de error y carga en todas las páginas, tests adicionales |
| **Día 5** | Diagnóstico del problema con el header `Authorization` en Railway, configuración del proxy rewrite en Vercel, despliegue exitoso en producción |