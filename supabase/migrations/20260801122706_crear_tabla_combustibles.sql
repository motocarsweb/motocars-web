-- ===========================================================
-- MotoCars ERP
-- Tabla: combustibles
-- ===========================================================

create table public.combustibles (
    id uuid primary key default gen_random_uuid(),

    nombre varchar(50) not null,
    slug varchar(50) not null,

    activo boolean not null default true,
    orden integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint uq_combustibles_nombre unique (nombre),
    constraint uq_combustibles_slug unique (slug),
    constraint ck_combustibles_orden check (orden >= 0)
);

create index idx_combustibles_activo_orden
on public.combustibles (activo, orden);

create trigger trg_combustibles_updated_at
before update on public.combustibles
for each row
execute function public.set_updated_at();

insert into public.combustibles (nombre, slug, orden)
values
    ('Nafta', 'nafta', 1),
    ('Diésel', 'diesel', 2),
    ('Híbrido', 'hibrido', 3),
    ('Eléctrico', 'electrico', 4),
    ('GNC', 'gnc', 5);