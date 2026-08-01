-- ===========================================================
-- MotoCars ERP
-- Tabla: tipos_vehiculo
-- ===========================================================

create table public.tipos_vehiculo (
    id uuid primary key default gen_random_uuid(),

    nombre varchar(50) not null,
    slug varchar(50) not null,

    activo boolean not null default true,
    orden integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint uq_tipos_vehiculo_nombre unique (nombre),
    constraint uq_tipos_vehiculo_slug unique (slug),
    constraint ck_tipos_vehiculo_orden check (orden >= 0)
);

create index idx_tipos_vehiculo_activo_orden
on public.tipos_vehiculo (activo, orden);

create trigger trg_tipos_vehiculo_updated_at
before update on public.tipos_vehiculo
for each row
execute function public.set_updated_at();

insert into public.tipos_vehiculo (nombre, slug, orden)
values
    ('Auto', 'auto', 1),
    ('SUV', 'suv', 2),
    ('Pickup', 'pickup', 3),
    ('Utilitario', 'utilitario', 4),
    ('Moto', 'moto', 5),
    ('Cuatriciclo', 'cuatriciclo', 6),
    ('UTV', 'utv', 7);