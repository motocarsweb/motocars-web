-- ===========================================================
-- MotoCars ERP
-- Tabla: marcas
-- ===========================================================

create table public.marcas (
    id uuid primary key default gen_random_uuid(),

    nombre varchar(100) not null,
    slug varchar(120) not null,
    logo_url text,

    activo boolean not null default true,
    orden integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint uq_marcas_nombre unique (nombre),
    constraint uq_marcas_slug unique (slug),
    constraint ck_marcas_orden_no_negativo check (orden >= 0)
);

create index idx_marcas_activo_orden
on public.marcas (activo, orden);

create trigger trg_marcas_updated_at
before update on public.marcas
for each row
execute function public.set_updated_at();

insert into public.marcas (nombre, slug, orden)
values
    ('Toyota', 'toyota', 1),
    ('Volkswagen', 'volkswagen', 2),
    ('Ford', 'ford', 3),
    ('Chevrolet', 'chevrolet', 4),
    ('Jeep', 'jeep', 5),
    ('Honda', 'honda', 6),
    ('RVM', 'rvm', 7),
    ('JAWA', 'jawa', 8);