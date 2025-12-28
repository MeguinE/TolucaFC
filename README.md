<a name="top"></a>

<div align="center">
  <img src="./public/img/toluca-logo.png" alt="Toluca Altas Montañas" width="110" />
  <h1>Toluca Altas Montañas • Admin & Landing</h1>
  <p>
    Landing de registro + Panel Administrativo para gestión de jugadores, sedes y horarios.
  </p>

  <div>
    <a href="#features"><strong>Features</strong></a> ·
    <a href="#stack"><strong>Stack</strong></a> ·
    <a href="#database"><strong>DB</strong></a> ·
    <a href="#setup"><strong>Setup</strong></a> ·
    <a href="#scripts"><strong>Scripts</strong></a> ·
    <a href="#screenshots"><strong>Screenshots</strong></a> ·
    <a href="#troubleshooting"><strong>Troubleshooting</strong></a>
  </div>
</div>

---

## 📌 Descripción

Este proyecto es una solución completa para un club/escuela deportiva:

- **Landing** para registrar interesados (jugadores)
- **Panel Administrativo** para consultar registros, filtrar, exportar, y administrar **Sedes** y **Horarios**
- Base de datos en **Supabase (PostgreSQL)** con relaciones entre _player_registrations_, _venues_, _categories_ y _schedules_

> Hecho con **Next.js (App Router)** + **Supabase** + **Tailwind CSS**, con un UI estilo "admin premium"

---

<a name="features"></a>

## ✨ Features

### Landing

- Registro de jugador: nombre, fecha de nacimiento, teléfono, sede y categoría
- Categorías basadas en rango de años (year_from/year_to)

### Admin Panel

- Vista de registros en tabla con:
  - Búsqueda por nombre / teléfono / sede / categoría
  - Filtros por sede y categoría
  - KPIs (totales, últimos 30 días, sedes, categorías)
  - Copiar teléfono
  - Exportación CSV
- **Sidebar fijo** con botón de cerrar sesión sin "brincos" por scroll

### Gestión de Sedes y Horarios (Admin)

- CRUD para:
  - **Sedes** (agregar / editar / eliminar)
  - **Horarios** por sede (agregar día, modificar hora, eliminar día)
- Evita duplicados con constraints en DB

---

<a name="stack"></a>

## 🧱 Stack

- **Next.js** (App Router)
- **Supabase**
  - Auth
  - PostgreSQL
  - Row Level Security (RLS) opcional
- **Tailwind CSS**
- **Lucide Icons**
- **TypeScript**

---

<a name="database"></a>

## 🗄️ Modelo de Datos (Supabase)

Tablas principales:

- `venues` → sedes
- `categories` → categorías por año
- `schedules` → horarios (dependen de sede + categoría)
- `player_registrations` → registros de jugadores

### Relaciones esperadas

- `player_registrations.venue_id` → `venues.id`
- `player_registrations.category_id` → `categories.id`
- `schedules.venue_id` → `venues.id`
- `schedules.category_id` → `categories.id`

> **Nota:** `birth_year` en `player_registrations` es una **columna generada** (GENERATED ALWAYS), por lo que **NO debe insertarse manualmente**.

---

<a name="setup"></a>

## 🚀 Setup Local

### 1) Clonar

```bash
git clone https://github.com/MeguinE/TolucaFC.git
cd TolucaFC
```

### 2) Instalar dependecias

```bash
npm install
```

### 3) Variables de entorno

Crea un archivo .env.local en la raíz:

```bash
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
# o (si usas el formato nuevo)
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

### 4) Levantar proyecto

```bash
npm run dev
```

Abrir: http://localhost:3000

<a name="migrations"></a>

🧩 SQL (Esquema + Seeds)
Esquema Base:

```bash
begin;

-- 0) BORRAR SI YA EXISTE (OJO: elimina datos)
drop table if exists public.player_registrations cascade;
drop table if exists public.schedules cascade;
drop table if exists public.categories cascade;
drop table if exists public.venues cascade;

-- 1) FUNCIÓN + TRIGGERS para updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
new.updated_at = now();
return new;
end;

$$
;

-- 2) SEDES
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  place text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint venues_unique unique (name, place)
);

create trigger venues_set_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

-- 3) CATEGORÍAS
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  year_from int not null,
  year_to int not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_year_range check (year_from <= year_to),
  constraint categories_year_limits check (
    year_from between 1900 and (extract(year from now())::int + 1)
    and year_to between 1900 and (extract(year from now())::int + 1)
  )
);

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- 4) HORARIOS
create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  weekday smallint not null, -- 1=Lunes ... 7=Domingo
  start_time time not null,
  end_time time not null,
  is_optional boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedules_weekday_valid check (weekday between 1 and 7),
  constraint schedules_time_valid check (start_time < end_time),
  constraint schedules_unique unique (category_id, venue_id, weekday, start_time, end_time)
);

create trigger schedules_set_updated_at
before update on public.schedules
for each row execute function public.set_updated_at();

create index schedules_by_category on public.schedules(category_id);
create index schedules_by_venue on public.schedules(venue_id);

-- 5) REGISTROS
create table public.player_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date not null,
  birth_year smallint generated always as ((extract(year from birth_date))::smallint) stored,
  phone text not null,
  venue_id uuid not null references public.venues(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists idx_player_reg_birth_year on public.player_registrations(birth_year);
create index if not exists idx_player_reg_venue on public.player_registrations(venue_id);
create index if not exists idx_player_reg_category on public.player_registrations(category_id);

commit;
```
