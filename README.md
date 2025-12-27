<a href="#">
  <img alt="Toluca Altas Montañas - Panel Administrativo (Next.js + Supabase)" src="/public/opengraph-image.png">
  <h1 align="center">Toluca Altas Montañas · Admin Panel</h1>
</a>

<p align="center">
  Sistema web con <b>Landing</b> + <b>Registro de jugadores</b> + <b>Panel administrativo</b> conectado a <b>Supabase</b>.
</p>

<p align="center">
  <a href="#stack"><strong>Stack</strong></a> ·
  <a href="#modulos"><strong>Módulos</strong></a> ·
  <a href="#base-de-datos-supabase"><strong>DB</strong></a> ·
  <a href="#variables-de-entorno"><strong>Env</strong></a> ·
  <a href="#correr-en-local"><strong>Local</strong></a> ·
  <a href="#deploy"><strong>Deploy</strong></a> ·
  <a href="#solucion-de-problemas"><strong>Troubleshooting</strong></a>
</p>

---

## Objetivo

Este proyecto permite a la filial **Toluca Altas Montañas**:

- Publicar una **landing** con información y formulario de registro.
- Guardar registros en base de datos (Supabase/Postgres).
- Administrar y consultar los registros en un **panel privado** (dashboard) con filtros, exportación y acciones rápidas.

---

## Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
  - Auth (cookies SSR / session)
  - Postgres DB
- **lucide-react** (iconos)

---

## Módulos

### 1) Landing (pública)
- Página pública con secciones y formulario de registro.
- Inserta registros en Supabase (`player_registrations`).

### 2) Auth (Supabase)
Rutas dentro de `/auth`:
- `/auth/login`
- `/auth/sign-up`
- `/auth/forgot-password`
- `/auth/update-password`
- `/auth/sign-up-success`

> El panel administrativo requiere sesión activa.

### 3) Panel Administrativo (privado)
Rutas sugeridas:
- `/protected` (dashboard principal)
- Secciones UI: Dashboard, Registros, Sedes, Categorías.

Funciones del dashboard:
- KPIs (totales, últimos 30 días, sedes, categorías).
- Búsqueda y filtros por sede/categoría.
- Acciones por registro (copiar teléfono, ver detalle).
- Exportación CSV.
- Refrescar lista.
- Cerrar sesión (Supabase `signOut()`).

---

## Base de datos (Supabase)

Tablas principales:

### `venues`
- `id` (uuid)
- `name` (text)
- `place` (text|null)
- `created_at`, `updated_at`

### `categories`
- `id` (uuid)
- `name` (text)
- `year_from` (int)
- `year_to` (int)
- `sort_order` (int|null)
- `created_at`, `updated_at`

### `player_registrations`
- `id` (uuid)
- `full_name` (text)
- `birth_date` (date)
- `birth_year` (int) **GENERATED** (no se inserta manualmente)
- `phone` (text)
- `venue_id` (uuid FK -> venues.id)
- `category_id` (uuid FK -> categories.id)
- `created_at` (timestamp)

### `schedules` (opcional para horarios)
- `id` (uuid)
- `category_id` (uuid FK)
- `venue_id` (uuid FK)
- `weekday` (int2)
- `start_time` (time)
- `end_time` (time)
- `is_optional` (bool)
- `note` (text|null)
- `created_at`, `updated_at`

---

## Variables de entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

# Si usas legacy:
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# SOLO servidor (si se ocupa para tareas admin/seed server-side):
SUPABASE_SERVICE_ROLE_KEY=...

npm install
npm run dev
