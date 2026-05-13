# AniTracker

Red social para amantes del anime. Busca series, gestiona tu lista de reproducción, conecta con amigos y chatea sobre los animes que estáis viendo.

**Demo en producción:** https://anitracker-xi.vercel.app

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
| Testing | Vitest + Supertest (backend), Vitest + React Testing Library (frontend) |
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
Un solo `npm install` y `npm run dev` arrancan frontend y backend en paralelo con `concurrently`. El evaluador abre una carpeta y todo funciona. También cumple con la estructura de repositorios recomendada del proyecto.

**Comunicación frontend → backend en producción:**
Vercel reescribe todas las peticiones `/api/*` hacia Railway. El frontend nunca necesita saber la URL de Railway; en producción usa rutas relativas (`/api/...`), lo que elimina cualquier problema de CORS con el header `Authorization`.

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

En desarrollo no necesita ninguna variable: `useApi.js` llama a `/api/*` relativo y Vite lo proxea a `http://localhost:3000`.

En producción (Vercel), tampoco se necesita `VITE_API_URL` porque el `vercel.json` reescribe `/api/*` directamente a Railway.

---

## Usuarios de prueba

Creados por el seed (`npm run db:seed`):

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@anitracker.com | 123456 | ADMIN |
| aday@anitracker.com | 123456 | USER |
| jarko@anitracker.com | 123456 | USER |

---

## API — Endpoints

Base URL local: `http://localhost:3000`  
Base URL producción: `https://anitracker-con-backend-production.up.railway.app`

> Los endpoints marcados con 🔒 requieren `Authorization: Bearer <token>` en la cabecera.  
> Los marcados con 👑 requieren además rol `ADMIN`.

### Auth — `/api/auth`

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | `{ email, password, name }` |
| POST | `/api/auth/login` | Iniciar sesión | `{ email, password }` |

**Respuesta de register/login:**
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

**Body POST:**
```json
{ "animeId": 21, "animeTitle": "One Piece", "animeImage": "https://...", "totalEpisodes": 0 }
```

**Body PATCH:**
```json
{ "status": "WATCHING", "currentEpisode": 1100, "isPublic": true }
```

Estados válidos: `WATCHING` · `COMPLETED` · `PAUSED` · `PENDING`

### Friends — `/api/friends`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/friends` | Listar amigos aceptados | 🔒 |
| GET | `/api/friends/requests` | Ver solicitudes pendientes | 🔒 |
| POST | `/api/friends` | Enviar solicitud (`{ receiverId }` o `{ receiverName }`) | 🔒 |
| PATCH | `/api/friends/:id` | Aceptar o rechazar solicitud | 🔒 |
| DELETE | `/api/friends/:id` | Eliminar amistad o cancelar solicitud | 🔒 |

**Body PATCH:**
```json
{ "status": "ACCEPTED" }
```

### Messages — `/api/messages`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/messages` | Chat general | 🔒 |
| GET | `/api/messages?receiverId=2` | Chat privado con el usuario 2 | 🔒 |
| POST | `/api/messages` | Enviar mensaje (público o privado) | 🔒 |

**Body POST:**
```json
{ "content": "Hola!", "receiverId": null }
```
`receiverId: null` → chat general. `receiverId: 2` → mensaje privado (requiere ser amigos).

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
  id · email (UNIQUE) · password · name · power · bio
  role: USER | ADMIN

UserAnime
  id · userId (FK→User) · animeId · animeTitle · animeImage
  status: WATCHING | COMPLETED | PAUSED | PENDING
  currentEpisode · totalEpisodes · isPublic
  UNIQUE (userId, animeId)

Friendship
  id · requesterId (FK→User) · receiverId (FK→User)
  status: PENDING | ACCEPTED | REJECTED
  canSeeStatus
  UNIQUE (requesterId, receiverId)

Message
  id · senderId (FK→User) · receiverId (FK→User, nullable) · content

Recommendation
  id · userId (FK→User) · animeTitle · animeImage · description
```

Todas las relaciones tienen `ON DELETE CASCADE`.

---

## Tests

```bash
# Backend (Vitest + Supertest)
cd backend && npm test

# Frontend (Vitest + React Testing Library)
cd frontend && npm test
```

**Backend** — 30 tests en 6 suites (Vitest + Supertest):
- Auth: registro, validaciones de email/contraseña, duplicados, login correcto/incorrecto
- Anime, Friends, Messages, Recommendations: CRUD completo
- Webhook: verifica que el evento `user_registered` y `friend_accepted` se disparan con los datos correctos

**Frontend** (`frontend/src/tests/app.test.jsx`) — 7 tests (Vitest + React Testing Library):
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

**Flujo en producción:**
```
Usuario → Vercel (React SPA)
             │
             ├── /api/* → Railway (Express API) → PostgreSQL
             └── /*     → index.html (SPA fallback)
```

El `vercel.json` hace rewrite de todas las peticiones `/api/*` al backend de Railway. El frontend no necesita ninguna variable de entorno en producción.

---

## Tiempo invertido

~25 horas totales a lo largo de 5 días (4-5 horas/día):

| Día | Trabajo |
|-----|---------|
| Día 1 | Arquitectura monorepo, setup, autenticación JWT completa, schema Prisma, estructura React con Router |
| Día 2 | 20 endpoints CRUD (users, anime, friends, messages, recommendations), middleware, schemas Zod, seed, tests |
| Día 3 | 5 páginas nuevas (Users, Profile, MyProfile, Friends, Chat), migración watchlist de localStorage a PostgreSQL, Navbar actualizado |
| Día 4 | Integración webhook externa, responsive polish, estados error/loading en todas las páginas, tests adicionales |
| Día 5 | Diagnóstico de Railway edge + Authorization header, setup Vercel CLI, proxy rewrite, deploy exitoso en producción |
